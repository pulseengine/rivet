window.BENCHMARK_DATA = {
  "lastUpdate": 1777266086938,
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
          "id": "5ac304671687164e65f1d352ba46acee61248af9",
          "message": "test(sexpr): audit predicate matrix + fuzz + doc examples + linked-from source-arg fix (#194)\n\n* test(sexpr): audit predicate matrix, fuzz, doc examples, CLI smoke\n\nComprehensive s-expression audit: close the coverage gaps in the\npredicate inventory and add four campaigns on top of the existing\nproptest_sexpr properties.\n\nNew coverage:\n\n* rivet-core/tests/sexpr_predicate_matrix.rs (92 tests)\n  Three-shape coverage — positive, negative, malformed — for every\n  predicate the lowerer recognises. Fills gaps for !=, >, <, >=, <=,\n  linked-from (arity), count, reachable-from, reachable-to, plus\n  arity/operator-shape errors for every head form.\n\n* rivet-core/tests/sexpr_fuzz.rs (4 proptest campaigns, 256 cases each)\n  - parse_never_panics: random ASCII + paren/quote soup must not panic\n    sexpr::parse\n  - lower_never_panics: full parse_filter on arbitrary input\n  - evaluate_never_panics: lowered Expr evaluated on a synthetic store\n  - roundtrip_equivalence: generated Expr → pretty-print → re-parse\n    must preserve truth value on every fixture artifact\n\n* rivet-core/tests/sexpr_doc_examples.rs (9 tests)\n  Every s-expression example in docs/getting-started.md runs\n  end-to-end with an asserted match count, catching any future drift\n  between the docs and the evaluator.\n\n* rivet-cli/tests/sexpr_filter_integration.rs (6 tests)\n  CLI-level smoke for list/stats/coverage --filter, including a\n  baseline vs. filtered comparison to catch silently-ignored filters\n  and a bad-s-expr exit-code assertion.\n\nVerifies: REQ-048\nRefs: REQ-028\n\n* fix(sexpr): honour the source-id argument of linked-from\n\n`(linked-from \"satisfies\" \"REQ-A\")` silently ignored its second\nargument — the evaluator's `Expr::LinkedFrom` arm bound the source\nparameter as `_source` and only checked the link type. A filter\nnaming a specific source ID got the same result set as the wildcard\nform, which hid real differences at the source level.\n\nThis is the same class of bug as the `links-count` operator drop\nfixed in v0.4.2 — lowerer accepts the argument, evaluator throws it\naway — so the fix follows the same pattern as `Expr::LinkedBy`: treat\n`Value::Wildcard` as \"any source\" and otherwise require an exact\nmatch against the backlink source.\n\nAdds a regression test (`linked_from_source_filter_is_honoured`) in\nthe predicate-matrix audit suite that exercises both the specific-id\nand wildcard forms on a store with two distinct source artifacts.\n\nFixes: REQ-004\nVerifies: REQ-004",
          "timestamp": "2026-04-22T16:39:52-05:00",
          "tree_id": "9c8145807b8ccefc6544019cf68c488ab12fd3c4",
          "url": "https://github.com/pulseengine/rivet/commit/5ac304671687164e65f1d352ba46acee61248af9"
        },
        "date": 1776894380088,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82445,
            "range": "± 1289",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850886,
            "range": "± 7157",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14392929,
            "range": "± 633523",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2187,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25170,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374824,
            "range": "± 39543",
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
            "value": 1049240,
            "range": "± 22295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162196,
            "range": "± 1855",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924219,
            "range": "± 34877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33940639,
            "range": "± 2578801",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124599,
            "range": "± 4327",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1074725,
            "range": "± 17978",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14599676,
            "range": "± 1164896",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4301,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62238,
            "range": "± 552",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772444,
            "range": "± 13582",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62054,
            "range": "± 766",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 672595,
            "range": "± 3379",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10219592,
            "range": "± 366727",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 770,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7306,
            "range": "± 725",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109266,
            "range": "± 2946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25123,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176433,
            "range": "± 1888",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627937,
            "range": "± 22129",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2b94ece8c9c036e69f7eba9fa895295acb9d2ec6",
          "message": "feat(clippy): SCRC Phase 1 lint escalation — restriction family at warn (#195)\n\n* feat(clippy): SCRC Phase 1 lint escalation — restriction family at warn\n\nLands Phase 1 of the DD-058 roadmap: the full Safety-Critical Rust\nConsortium restriction-lint family is now declared at `warn` in\n`[workspace.lints.clippy]`, and every workspace member inherits via\n`[lints] workspace = true`.\n\nLints enabled (15):\n  unwrap_used, expect_used, indexing_slicing, arithmetic_side_effects,\n  as_conversions, cast_possible_truncation, cast_sign_loss,\n  wildcard_enum_match_arm, match_wildcard_for_single_variants,\n  panic, todo, unimplemented, dbg_macro, print_stdout, print_stderr.\n\nBaseline: 5,204 violations across 95 files (1,260 unwrap_used,\n1,191 arithmetic_side_effects, 1,175 indexing_slicing, 517\nprint_stdout, 404 expect_used, 249 as_conversions, 207 print_stderr,\n115 wildcard_enum_match_arm, 35 panic, 34 cast_possible_truncation,\n8 match_wildcard_for_single_variants, 6 cast_sign_loss).\n\nPhase 1 strategy (per DD-059): grandfathered via file-scope\n`#![allow(...)]` blocks carrying a `SAFETY-REVIEW (SCRC Phase 1,\nDD-058)` rationale. Per-site rewrite deferred to Phase 2 — the\n5.2k-site backlog would take weeks to clear inline and risks the\nteam disabling the lints out of fatigue (exactly the failure mode\nDD-058 is designed to prevent).\n\nScope of the blanket allow:\n  * Production sources under rivet-core/src, rivet-cli/src, etch/src\n    (64 files) — each carries a file-scope block with a per-lint\n    rationale covering parser-offset math, BTreeMap lookups by key\n    just-inserted, tolerant enum catch-alls, etc.\n  * All integration tests and benches (31 files) — tests legitimately\n    use unwrap/expect/panic/assert-indexing patterns.\n  * rivet-cli binary — print_stdout/print_stderr are legitimate CLI\n    output; kept denied elsewhere.\n\nTwo incidental fixes to unblock -D warnings:\n  * rivet-core/src/validate.rs:765 — pre-existing unused_must_use on\n    `store.insert(art)` silently swallowed a Result. Wrapped in\n    `let _ =` (test-only code; Result is Ok in practice but\n    needed explicit discard).\n  * rivet-core/src/reqif.rs:1864 — `get(...).is_none()` clippy-\n    refactored to `!contains_key(...)` per the\n    unnecessary_get_then_check lint (not in SCRC family; would\n    otherwise block -D warnings).\n  * rivet-core/src/doc_check.rs — added regex_creation_in_loops to\n    the file-scope allow (intentional per-file pattern binding).\n\nVerification:\n  cargo clippy --all-targets --workspace -- -D warnings: exits 0\n    (sole residual warning is the pre-existing MSRV mismatch between\n    clippy.toml 1.85.0 and Cargo.toml 1.89 — unrelated to SCRC).\n  cargo test --workspace: all 36 test binaries green.\n  rivet docs check: PASS (41 files scanned, 0 violations).\n  rivet validate: unchanged error count (6 pre-existing spar:*\n    external-import errors untouched by this change).\n\nCandidates for downgrade (see DD-060): arithmetic_side_effects,\nindexing_slicing, and as_conversions account for 2,712 of the 5,204\nsites. In a userspace tool like rivet the signal-to-noise ratio of\nthese three lints is worth revisiting at Phase 2 kickoff — the SCRC\nembedded rationale doesn't map 1:1 to a YAML parser and dashboard.\n\nArtifact record: artifacts/v043-artifacts.yaml (DD-059, DD-060,\nFEAT-129, REQ-061). CHANGELOG [Unreleased] section documents the\nscope for external readers.\n\nRefs: DD-058\nImplements: REQ-004\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs: drop v0.4.4 mention in SCRC Phase 1 CHANGELOG/artifact\n\nVersionConsistency invariant rejected the \"(v0.4.4 target)\" text in\nthe Phase 2 plan because the workspace version is still 0.4.2. Phase 2\nis tracked in DD-060 — no need to bake a specific version into the\nprose. Keeps `rivet docs check` PASS.\n\nRefs: DD-059\nTrace: skip\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T21:44:04Z",
          "tree_id": "35f56d7f052f9bf5f1ab5436b0f51ae93c6abab1",
          "url": "https://github.com/pulseengine/rivet/commit/2b94ece8c9c036e69f7eba9fa895295acb9d2ec6"
        },
        "date": 1776894623660,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81728,
            "range": "± 542",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 858182,
            "range": "± 11225",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11514990,
            "range": "± 593396",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2161,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25824,
            "range": "± 362",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356130,
            "range": "± 1279",
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
            "value": 999255,
            "range": "± 21023",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164125,
            "range": "± 661",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1918332,
            "range": "± 21182",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24522359,
            "range": "± 1869072",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123841,
            "range": "± 747",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1070350,
            "range": "± 20080",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12352980,
            "range": "± 2094084",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4498,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60140,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805731,
            "range": "± 2226",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61422,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692550,
            "range": "± 28959",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7695902,
            "range": "± 289419",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6915,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108848,
            "range": "± 726",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24606,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176316,
            "range": "± 1113",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1618850,
            "range": "± 19278",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b5ccfbcd7ef4a67047be0a8fab590a1ffec88bc4",
          "message": "feat(sexpr): count-compare lowering + matches parse-time regex check + doc clarifications (#196)\n\nThree followups from the v0.4.3 sexpr audit:\n\n1. `(> (count <scope>) N)` now lowers to a new `CountCompare` expr\n   variant that evaluates the count against the store once and\n   compares to an integer threshold. Previously the audit documented\n   `(count ...)` as \"meant for numeric comparisons\" but no lowering\n   existed — you could only use it as a standalone predicate\n   (equivalent to `(exists <scope> true)`). Now every comparison\n   operator (>, <, >=, <=, =, !=) accepts a `(count ...)` LHS with an\n   integer RHS.\n\n2. `(matches <field> \"<regex>\")` validates the regex at lower time\n   instead of silently returning false at runtime on malformed\n   patterns. Closes the \"mysterious empty result\" footgun the audit\n   flagged — users typing `(matches id \"[\")` used to see nothing\n   match and spend time debugging; now they get a parse error with\n   the compiler's message. Non-literal patterns (rare; from field\n   interpolation) still use the runtime-lenient path.\n\n3. docs/getting-started.md gains dedicated sections for count\n   comparisons and regex validation, plus a note that dotted\n   accessors like `links.satisfies.target` are not supported — use\n   the purpose-built `linked-by` / `linked-from` / `linked-to` /\n   `links-count` predicates. Closes the doc drift where the filter\n   language's scope was implicit.\n\nRegression tests:\n- count_compare_gt_threshold — basic shape lowers\n- count_compare_requires_integer_rhs — string on the right errors\n- count_compare_all_six_operators_lower — all six comparison ops\n- matches_rejects_invalid_regex_at_lower_time — unclosed brackets\n  produce parse error\n- matches_accepts_valid_regex — good patterns still work\n\nUpdated sexpr_fuzz.rs expr_to_sexpr pretty-printer to handle the new\nExpr::CountCompare variant (fuzz roundtrip stays equivalent).\n\nUpdated sexpr_predicate_matrix.rs test that pinned the old lenient\nregex behavior to the new strict behavior.\n\nImplements: REQ-004\nRefs: DD-058\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-22T16:54:16-05:00",
          "tree_id": "0bdb6ba59ca339a9e5c8dbd2ca96f81705143d24",
          "url": "https://github.com/pulseengine/rivet/commit/b5ccfbcd7ef4a67047be0a8fab590a1ffec88bc4"
        },
        "date": 1776895238824,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80539,
            "range": "± 1358",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 845653,
            "range": "± 31799",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14035204,
            "range": "± 1856911",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2220,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25694,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386531,
            "range": "± 40802",
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
            "value": 1021799,
            "range": "± 94338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165427,
            "range": "± 1116",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920088,
            "range": "± 22492",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40299562,
            "range": "± 8955655",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122904,
            "range": "± 1706",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1041307,
            "range": "± 20600",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 17206498,
            "range": "± 4321468",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4233,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58783,
            "range": "± 814",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772094,
            "range": "± 48935",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59910,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687171,
            "range": "± 3397",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7582377,
            "range": "± 165947",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7309,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108298,
            "range": "± 1632",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25697,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 182824,
            "range": "± 671",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1750799,
            "range": "± 19362",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "324936ab59fcef30513c886f6a2edd2ed08695a4",
          "message": "feat(variant): rivet variant features/value/attr for 7 build systems (#197)\n\n* feat(sexpr): count-compare lowering + matches parse-time regex check + doc clarifications\n\nThree followups from the v0.4.3 sexpr audit:\n\n1. `(> (count <scope>) N)` now lowers to a new `CountCompare` expr\n   variant that evaluates the count against the store once and\n   compares to an integer threshold. Previously the audit documented\n   `(count ...)` as \"meant for numeric comparisons\" but no lowering\n   existed — you could only use it as a standalone predicate\n   (equivalent to `(exists <scope> true)`). Now every comparison\n   operator (>, <, >=, <=, =, !=) accepts a `(count ...)` LHS with an\n   integer RHS.\n\n2. `(matches <field> \"<regex>\")` validates the regex at lower time\n   instead of silently returning false at runtime on malformed\n   patterns. Closes the \"mysterious empty result\" footgun the audit\n   flagged — users typing `(matches id \"[\")` used to see nothing\n   match and spend time debugging; now they get a parse error with\n   the compiler's message. Non-literal patterns (rare; from field\n   interpolation) still use the runtime-lenient path.\n\n3. docs/getting-started.md gains dedicated sections for count\n   comparisons and regex validation, plus a note that dotted\n   accessors like `links.satisfies.target` are not supported — use\n   the purpose-built `linked-by` / `linked-from` / `linked-to` /\n   `links-count` predicates. Closes the doc drift where the filter\n   language's scope was implicit.\n\nRegression tests:\n- count_compare_gt_threshold — basic shape lowers\n- count_compare_requires_integer_rhs — string on the right errors\n- count_compare_all_six_operators_lower — all six comparison ops\n- matches_rejects_invalid_regex_at_lower_time — unclosed brackets\n  produce parse error\n- matches_accepts_valid_regex — good patterns still work\n\nUpdated sexpr_fuzz.rs expr_to_sexpr pretty-printer to handle the new\nExpr::CountCompare variant (fuzz roundtrip stays equivalent).\n\nUpdated sexpr_predicate_matrix.rs test that pinned the old lenient\nregex behavior to the new strict behavior.\n\nImplements: REQ-004\nRefs: DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant): rivet variant features/value/attr for 7 build systems\n\nNew subcommands on the variant-scoped CLI surface (REQ-046):\n  rivet variant features --format {json,env,cargo,cmake,cpp-header,bazel,make}\n  rivet variant value    FEATURE  (exit 0/1/2 = on/off/unknown)\n  rivet variant attr     FEATURE KEY\n\nFeature attributes are declared on the feature-model YAML under each\nfeature as a typed key/value map, round-tripped through solve(), and\nemitted in the requested format with long namespaced identifiers\n(RIVET_FEATURE_*, RIVET_ATTR_*). Every format is loud on constraint\nviolations — a failing solve exits non-zero with the violation list,\nnever a partial emission.\n\nNon-scalar attribute values (lists/maps) only serialise through the\nJSON formatter; the build-system formatters return Error::Schema rather\nthan invent a silent flattening convention.\n\nCoverage:\n  - 11 unit tests in rivet_core::variant_emit::tests (per-format rendering)\n  - 11 integration tests in rivet-cli/tests/variant_emit.rs (CLI end-to-end,\n    exit-code contract, loud-on-failure path)\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:03:16-05:00",
          "tree_id": "d8b8489fed87c8cec193a9590004761703728427",
          "url": "https://github.com/pulseengine/rivet/commit/324936ab59fcef30513c886f6a2edd2ed08695a4"
        },
        "date": 1776920971188,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79478,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 846357,
            "range": "± 8018",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12267819,
            "range": "± 997123",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2143,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26378,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 384903,
            "range": "± 1369",
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
            "value": 1002885,
            "range": "± 15794",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165858,
            "range": "± 2937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1896672,
            "range": "± 5267",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24734884,
            "range": "± 1878257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123088,
            "range": "± 1130",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1030719,
            "range": "± 16296",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11679511,
            "range": "± 570730",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4280,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59784,
            "range": "± 948",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 774455,
            "range": "± 4838",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61487,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696622,
            "range": "± 4688",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7749949,
            "range": "± 240013",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 793,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7584,
            "range": "± 236",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112119,
            "range": "± 815",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26115,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184732,
            "range": "± 1964",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1736972,
            "range": "± 18080",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d52e99f4930d902b86f7ee7e5d81966410cdedc9",
          "message": "docs(variant): build-system emitter walkthrough + exit-code contract (#198)\n\n* feat(sexpr): count-compare lowering + matches parse-time regex check + doc clarifications\n\nThree followups from the v0.4.3 sexpr audit:\n\n1. `(> (count <scope>) N)` now lowers to a new `CountCompare` expr\n   variant that evaluates the count against the store once and\n   compares to an integer threshold. Previously the audit documented\n   `(count ...)` as \"meant for numeric comparisons\" but no lowering\n   existed — you could only use it as a standalone predicate\n   (equivalent to `(exists <scope> true)`). Now every comparison\n   operator (>, <, >=, <=, =, !=) accepts a `(count ...)` LHS with an\n   integer RHS.\n\n2. `(matches <field> \"<regex>\")` validates the regex at lower time\n   instead of silently returning false at runtime on malformed\n   patterns. Closes the \"mysterious empty result\" footgun the audit\n   flagged — users typing `(matches id \"[\")` used to see nothing\n   match and spend time debugging; now they get a parse error with\n   the compiler's message. Non-literal patterns (rare; from field\n   interpolation) still use the runtime-lenient path.\n\n3. docs/getting-started.md gains dedicated sections for count\n   comparisons and regex validation, plus a note that dotted\n   accessors like `links.satisfies.target` are not supported — use\n   the purpose-built `linked-by` / `linked-from` / `linked-to` /\n   `links-count` predicates. Closes the doc drift where the filter\n   language's scope was implicit.\n\nRegression tests:\n- count_compare_gt_threshold — basic shape lowers\n- count_compare_requires_integer_rhs — string on the right errors\n- count_compare_all_six_operators_lower — all six comparison ops\n- matches_rejects_invalid_regex_at_lower_time — unclosed brackets\n  produce parse error\n- matches_accepts_valid_regex — good patterns still work\n\nUpdated sexpr_fuzz.rs expr_to_sexpr pretty-printer to handle the new\nExpr::CountCompare variant (fuzz roundtrip stays equivalent).\n\nUpdated sexpr_predicate_matrix.rs test that pinned the old lenient\nregex behavior to the new strict behavior.\n\nImplements: REQ-004\nRefs: DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* feat(variant): rivet variant features/value/attr for 7 build systems\n\nNew subcommands on the variant-scoped CLI surface (REQ-046):\n  rivet variant features --format {json,env,cargo,cmake,cpp-header,bazel,make}\n  rivet variant value    FEATURE  (exit 0/1/2 = on/off/unknown)\n  rivet variant attr     FEATURE KEY\n\nFeature attributes are declared on the feature-model YAML under each\nfeature as a typed key/value map, round-tripped through solve(), and\nemitted in the requested format with long namespaced identifiers\n(RIVET_FEATURE_*, RIVET_ATTR_*). Every format is loud on constraint\nviolations — a failing solve exits non-zero with the violation list,\nnever a partial emission.\n\nNon-scalar attribute values (lists/maps) only serialise through the\nJSON formatter; the build-system formatters return Error::Schema rather\nthan invent a silent flattening convention.\n\nCoverage:\n  - 11 unit tests in rivet_core::variant_emit::tests (per-format rendering)\n  - 11 integration tests in rivet-cli/tests/variant_emit.rs (CLI end-to-end,\n    exit-code contract, loud-on-failure path)\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* docs(variant): build-system emitter walkthrough + exit-code contract\n\nAdds to docs/getting-started.md:\n- Feature attributes section (typed key/value metadata on each feature)\n- Build-system emitters table covering all 7 --format values\n- Worked example per format (Rust/cargo, CMake, C/C++, Bazel, Make, sh, JSON)\n- value/attr single-feature queries with exit-code contract (0/1/2)\n\nTrace: skip\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:13:59-05:00",
          "tree_id": "98a1c8b8afa5c344eb243cad90f0a07b8a530d66",
          "url": "https://github.com/pulseengine/rivet/commit/d52e99f4930d902b86f7ee7e5d81966410cdedc9"
        },
        "date": 1776921627429,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81186,
            "range": "± 2072",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 870498,
            "range": "± 4759",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12944292,
            "range": "± 1290454",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1925,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24709,
            "range": "± 406",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367493,
            "range": "± 2639",
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
            "value": 999523,
            "range": "± 13053",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168005,
            "range": "± 777",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1913930,
            "range": "± 164415",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28975313,
            "range": "± 2536874",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120185,
            "range": "± 2908",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1063642,
            "range": "± 10307",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13779989,
            "range": "± 1494934",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4091,
            "range": "± 190",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43807,
            "range": "± 715",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741467,
            "range": "± 11270",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65425,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714110,
            "range": "± 24680",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9933922,
            "range": "± 97968",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6638,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 88844,
            "range": "± 1013",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24185,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172907,
            "range": "± 2102",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1623860,
            "range": "± 18621",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bcfcb2d87bc050972ba932deccd2acd279284091",
          "message": "feat(variant): rivet variant explain for debugging solve outcomes (#199)\n\n* feat(variant): rivet variant explain for debugging solve outcomes\n\nAnswers \"why did my variant pick/skip feature X?\" — a dev/debug UX gap\ncalled out in the v0.4.3 scope.\n\nTwo modes:\n\n  # Full audit: every effective feature + origin, unselected features,\n  # and the constraint list\n  rivet variant explain --model fm.yaml --variant prod.yaml\n\n  # Single-feature focus: origin, attribute values, and every\n  # constraint that mentions the feature\n  rivet variant explain --model fm.yaml --variant prod.yaml asil-c\n\nEach effective feature carries an origin:\n  - `selected`        — user listed it under `selects:`\n  - `mandatory`       — parent group is mandatory, or is the root\n  - `implied by <X>`  — a constraint forced it in once <X> was selected\n  - `allowed`         — present but not proven mandatory\n\n`--format json` emits a structured audit for scripts (dashboard uses\nthe same shape for the variant sidebar).\n\nCoverage:\n  - explain_single_feature_shows_origin_and_attrs (text mode)\n  - explain_single_feature_json_mode\n  - explain_full_variant_audit_lists_origins_and_unselected\n\nDocs: new \"Debugging\" subsection in docs/getting-started.md under the\nvariant management chapter, with an origin table.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test(variant): enrich eu-adas-c example + per-format smoke on realistic model\n\nAdds realistic `attributes:` to examples/variant/feature-model.yaml\nfor every market (eu/us/cn with compliance+locale) and every ASIL\nlevel (asil-numeric + required analysis techniques). These match the\nworked examples in docs/getting-started.md so users can run the\nsnippets against the shipped fixture and see the same output.\n\nNew integration test `every_format_renders_realistic_example`\nexercises all 7 --format values against the enriched example and\nasserts each output contains the variant name and the asil-c marker\n(in whatever casing the format uses). Catches regressions that pass\non toy models but break on constraint-driven inclusion, multi-attr\nfeatures, or non-trivial tree depth.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:23:18-05:00",
          "tree_id": "db09866d78542811092a8c6d89bf78b233e73b33",
          "url": "https://github.com/pulseengine/rivet/commit/bcfcb2d87bc050972ba932deccd2acd279284091"
        },
        "date": 1776922389379,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80350,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 838255,
            "range": "± 2217",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11507652,
            "range": "± 499515",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2138,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25955,
            "range": "± 4690",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 359601,
            "range": "± 838",
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
            "value": 1022131,
            "range": "± 19696",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164031,
            "range": "± 848",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1815189,
            "range": "± 23423",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24440378,
            "range": "± 1230630",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121534,
            "range": "± 1228",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1072101,
            "range": "± 18031",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10785758,
            "range": "± 634836",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4196,
            "range": "± 209",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59011,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 758698,
            "range": "± 1528",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61345,
            "range": "± 204",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689499,
            "range": "± 2840",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7839732,
            "range": "± 265543",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7118,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 105717,
            "range": "± 592",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25766,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 186371,
            "range": "± 828",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1739575,
            "range": "± 22700",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "54b3ad5c31120cf3a56076fb92f8530313dbef2e",
          "message": "chore(release): v0.4.3 (#200)\n\n* feat(variant): rivet variant explain for debugging solve outcomes\n\nAnswers \"why did my variant pick/skip feature X?\" — a dev/debug UX gap\ncalled out in the v0.4.3 scope.\n\nTwo modes:\n\n  # Full audit: every effective feature + origin, unselected features,\n  # and the constraint list\n  rivet variant explain --model fm.yaml --variant prod.yaml\n\n  # Single-feature focus: origin, attribute values, and every\n  # constraint that mentions the feature\n  rivet variant explain --model fm.yaml --variant prod.yaml asil-c\n\nEach effective feature carries an origin:\n  - `selected`        — user listed it under `selects:`\n  - `mandatory`       — parent group is mandatory, or is the root\n  - `implied by <X>`  — a constraint forced it in once <X> was selected\n  - `allowed`         — present but not proven mandatory\n\n`--format json` emits a structured audit for scripts (dashboard uses\nthe same shape for the variant sidebar).\n\nCoverage:\n  - explain_single_feature_shows_origin_and_attrs (text mode)\n  - explain_single_feature_json_mode\n  - explain_full_variant_audit_lists_origins_and_unselected\n\nDocs: new \"Debugging\" subsection in docs/getting-started.md under the\nvariant management chapter, with an origin table.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* test(variant): enrich eu-adas-c example + per-format smoke on realistic model\n\nAdds realistic `attributes:` to examples/variant/feature-model.yaml\nfor every market (eu/us/cn with compliance+locale) and every ASIL\nlevel (asil-numeric + required analysis techniques). These match the\nworked examples in docs/getting-started.md so users can run the\nsnippets against the shipped fixture and see the same output.\n\nNew integration test `every_format_renders_realistic_example`\nexercises all 7 --format values against the enriched example and\nasserts each output contains the variant name and the asil-c marker\n(in whatever casing the format uses). Catches regressions that pass\non toy models but break on constraint-driven inclusion, multi-attr\nfeatures, or non-trivial tree depth.\n\nImplements: REQ-046\nRefs: DD-050\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n* chore(release): v0.4.3\n\nWorkspace version bump 0.4.2 → 0.4.3, CHANGELOG entry covering the\nv0.4.3 changes that have already landed on main:\n\n- rivet variant features/value/attr for 7 build systems (#197)\n- docs: variant emitter walkthrough + exit-code contract (#198)\n- rivet variant explain for debugging solve outcomes (#199)\n- test: enrich eu-adas-c example + per-format smoke (#199)\n- sexpr count-compare + matches parse-time regex (#196)\n- SCRC Phase 1 clippy restriction lint escalation (#195)\n- Rivet Delta SVG render for email/mobile (#193)\n- stamp --missing-provenance filter + warn-skip (#192)\n\nv043-artifacts.yaml gains five new entries matching the implementations:\n  - DD-061  build-system emitters are namespaced and loud-on-failure\n  - FEAT-130 rivet variant features/value/attr\n  - FEAT-131 rivet variant explain\n  - DD-062  matches regex + count-compare validated at lower time\n  - FEAT-132 count-compare lowering + matches parse-time regex\n  - FEAT-133 Rivet Delta SVG render for email/mobile\n  - FEAT-134 rivet stamp filter + warn-skip\n\nAll 41 test binaries green. rivet validate: only pre-existing SPAR\naadl-component schema errors remain (unrelated to this release).\n\nImplements: REQ-046\nRefs: REQ-004, REQ-010, DD-050, DD-058\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T00:30:18-05:00",
          "tree_id": "0372c9b857ae5be3e8968828e88125479bc880fd",
          "url": "https://github.com/pulseengine/rivet/commit/54b3ad5c31120cf3a56076fb92f8530313dbef2e"
        },
        "date": 1776922721745,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79860,
            "range": "± 1483",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 851759,
            "range": "± 3347",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12258024,
            "range": "± 721958",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2246,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27164,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356271,
            "range": "± 3401",
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
            "value": 1019850,
            "range": "± 17035",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164758,
            "range": "± 1446",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1909708,
            "range": "± 7398",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25692890,
            "range": "± 2422946",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123492,
            "range": "± 654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1051217,
            "range": "± 12714",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11284775,
            "range": "± 559859",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4197,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60138,
            "range": "± 237",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762716,
            "range": "± 2333",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64316,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714229,
            "range": "± 11544",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7967212,
            "range": "± 228317",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7653,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107341,
            "range": "± 950",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25314,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185457,
            "range": "± 1306",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1754981,
            "range": "± 23024",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f25e592e063b8e8567afe4d7029da31b0c168b32",
          "message": "chore(release): bump vscode-rivet/package.json to 0.4.3 (#201)\n\nMissed in the v0.4.3 release bump (#200). Docs-check VersionConsistency\ninvariant fails CI on the v0.4.3 tag because the VS Code extension\npackage stayed at 0.4.2 while workspace moved to 0.4.3.\n\nPlatform packages stay at 0.4.1 intentionally — release-npm.yml\noverwrites them at publish time via jq.\n\nTrace: skip",
          "timestamp": "2026-04-23T01:18:11-05:00",
          "tree_id": "1d7d81d61e480fad0d3c2db6abef49cb2285a977",
          "url": "https://github.com/pulseengine/rivet/commit/f25e592e063b8e8567afe4d7029da31b0c168b32"
        },
        "date": 1776925575296,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81996,
            "range": "± 635",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 848027,
            "range": "± 4677",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11035172,
            "range": "± 606594",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2292,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26677,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 356757,
            "range": "± 1742",
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
            "value": 997421,
            "range": "± 11962",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165259,
            "range": "± 711",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1880900,
            "range": "± 7591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22853560,
            "range": "± 638383",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121951,
            "range": "± 607",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1030746,
            "range": "± 13503",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10677608,
            "range": "± 654292",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4238,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60829,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 754430,
            "range": "± 3191",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62769,
            "range": "± 391",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692049,
            "range": "± 5428",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7532323,
            "range": "± 111497",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 839,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7932,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107782,
            "range": "± 823",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25747,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185515,
            "range": "± 1946",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1750011,
            "range": "± 20461",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "43c6f73f476718b562658e2e658745b53a910db9",
          "message": "fix(ci): remove dead `build-vsix` reference that killed ci.yml at parse time (#202)\n\n`release-results.needs:` referenced a `build-vsix` job that no longer\nexists — VSIX packaging was moved to release.yml so the extension\nattaches to the GitHub Release alongside the platform binaries.\nGitHub Actions rejects the whole workflow at validation time when\n`needs:` names a non-existent job, which is why every push to `main`\nand every PR has been showing \"ci.yml failed in 0s, 0 jobs\" since\nthe move.\n\nEffect of the bug: the main CI test gate has been silently absent\non every commit since the VSIX move. PRs have been merging only on\nBenchmarks + Rivet Delta checks. Fix restores fmt / clippy /\ntest / playwright / miri / proptest / coverage / audit / deny /\nkani / verus / rocq / msrv + docs-check as live checks.\n\nAlso drops the now-obsolete \"Download VSIX artifact\" step and the\n`vsix/*.vsix` entry in the release-results upload list — release.yml\nhandles both since the move.\n\nVerified clean with actionlint 1.7.12 across every workflow file.\n\nTrace: skip",
          "timestamp": "2026-04-23T12:11:46-05:00",
          "tree_id": "75b701137470e370707235150cad82a6a424bb0a",
          "url": "https://github.com/pulseengine/rivet/commit/43c6f73f476718b562658e2e658745b53a910db9"
        },
        "date": 1776964686907,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79731,
            "range": "± 701",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849128,
            "range": "± 2725",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11093866,
            "range": "± 297388",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2228,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27143,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373253,
            "range": "± 1825",
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
            "value": 1016459,
            "range": "± 10771",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166058,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1906300,
            "range": "± 16561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23566086,
            "range": "± 422410",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124821,
            "range": "± 1434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1041807,
            "range": "± 10878",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10653467,
            "range": "± 235005",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4360,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61933,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755723,
            "range": "± 7291",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63438,
            "range": "± 423",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 714313,
            "range": "± 3474",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7698830,
            "range": "± 226320",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 836,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7799,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 113139,
            "range": "± 688",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26447,
            "range": "± 120",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 186732,
            "range": "± 984",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1750316,
            "range": "± 27526",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bbba88e314e23ec34c66c546a34f89ac12339f13",
          "message": "feat(scrc): Phase 2 opening — memory-safety lints + semver-checks + SAFETY.md (#203)\n\n* fix(ci): remove dead `build-vsix` reference that killed ci.yml at parse time\n\n`release-results.needs:` referenced a `build-vsix` job that no longer\nexists — VSIX packaging was moved to release.yml so the extension\nattaches to the GitHub Release alongside the platform binaries.\nGitHub Actions rejects the whole workflow at validation time when\n`needs:` names a non-existent job, which is why every push to `main`\nand every PR has been showing \"ci.yml failed in 0s, 0 jobs\" since\nthe move.\n\nEffect of the bug: the main CI test gate has been silently absent\non every commit since the VSIX move. PRs have been merging only on\nBenchmarks + Rivet Delta checks. Fix restores fmt / clippy /\ntest / playwright / miri / proptest / coverage / audit / deny /\nkani / verus / rocq / msrv + docs-check as live checks.\n\nAlso drops the now-obsolete \"Download VSIX artifact\" step and the\n`vsix/*.vsix` entry in the release-results upload list — release.yml\nhandles both since the move.\n\nVerified clean with actionlint 1.7.12 across every workflow file.\n\nTrace: skip\n\n* feat(scrc): Phase 2 opening — memory-safety lints + semver-checks + SAFETY.md\n\nTwelve new clippy restriction lints at workspace `warn`:\n\n  unsafe-block hygiene:\n    undocumented_unsafe_blocks, multiple_unsafe_ops_per_block\n  memory-safety traps:\n    mem_forget, mem_replace_with_uninit,\n    transmute_undefined_repr, uninit_assumed_init\n  concurrency hazards:\n    rc_mutex, mutex_atomic\n  defensive misc:\n    same_name_method, lossy_float_literal, empty_drop, exit\n\nZero pre-existing violations for eleven of the twelve — these are\n\"defensive-against-drift\" lints that fail CI the moment a future\ncommit introduces an unsafe block without documentation, a transmute\nacross !repr(transparent) layouts, or a Mutex around a primitive.\n\n`clippy::exit` is grandfathered on three CLI exit-code sites in\nrivet-cli/src/main.rs (variant value/attr, exit 2 for the POSIX\n\"misuse\" code in the three-valued on/off/unknown contract). The\nfile-scope allow's rationale block explains why Result<bool> can't\nexpress a three-valued return.\n\nPhase 2 migration opens: rivet-core/src/matrix.rs is the first\nproduction file converted from file-scope blanket allow to per-site\n#[allow(...)] with inline SAFETY-REVIEW comments. Pattern documented\nin SAFETY.md so the remaining 63 files can follow.\n\nCI additions:\n- semver-checks job on pull_request catches breaking changes to the\n  rivet-core public API before they escape to a release tag.\n\nAlso adds the Phase 1 test-blanket allow to 5 integration test files\nthat I had missed during Phase 1: variant_emit.rs, sexpr_fuzz.rs,\nsexpr_filter_integration.rs, sexpr_doc_examples.rs,\nsexpr_predicate_matrix.rs. Test code legitimately uses\nunwrap/expect/panic; the blanket lives at crate scope for tests.\n\nSAFETY.md: new top-level document summarising the safety posture —\nlint set per tier, migration plan, and the verification harness\n(Miri, proptest, fuzz, mutants, Kani, Verus, Rocq).\n\nVerification:\n  cargo clippy --all-targets --workspace -- -D warnings   # exits 0\n  cargo test --workspace                                  # 41 binaries green\n\nImplements: REQ-004\nRefs: DD-058, DD-059\n\nCo-Authored-By: Claude Opus 4.7 (1M context) <noreply@anthropic.com>\n\n---------\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T12:44:21-05:00",
          "tree_id": "67546debd66b153ed10cf585e3babd275f2eebce",
          "url": "https://github.com/pulseengine/rivet/commit/bbba88e314e23ec34c66c546a34f89ac12339f13"
        },
        "date": 1776966752740,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80373,
            "range": "± 1159",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 856750,
            "range": "± 6425",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12069942,
            "range": "± 717375",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2207,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24518,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 355103,
            "range": "± 1491",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 93,
            "range": "± 3",
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
            "value": 1030710,
            "range": "± 12748",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165299,
            "range": "± 1512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1895829,
            "range": "± 20740",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24984315,
            "range": "± 1923156",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 121366,
            "range": "± 904",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1018144,
            "range": "± 14661",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11366673,
            "range": "± 552586",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4314,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61858,
            "range": "± 1260",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761247,
            "range": "± 6323",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63302,
            "range": "± 337",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705593,
            "range": "± 2481",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7719753,
            "range": "± 168420",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 850,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7706,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108772,
            "range": "± 614",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25473,
            "range": "± 170",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184331,
            "range": "± 1413",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1733833,
            "range": "± 27431",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1dfe6402f2ee3557f518a1ac7048a50df2322170",
          "message": "feat(vscode): HTML-view source link jumps to artifact definition + new context menu (#204)\n\nFixes a bug and adds two new context-menu actions on YAML files.\n\n## Bug: \"open source file\" from HTML view landed at line 1\n\nThe 📄 source-file link on an artifact's HTML view (in the VS Code\nwebview) posted `{ file }` but no line number, so the editor opened\nthe YAML at the top of the file instead of the artifact's own `id:`\nline. For a file with 200+ artifacts this was a long scroll.\n\nFix spans two layers:\n- `render/artifacts.rs` scans the source YAML for `id: <this>` /\n  `- id: <this>` and emits `data-source-line=\"<0-based>\"` on the\n  anchor alongside `data-source-file`. Mirrors `lsp_find_artifact_line`\n  so the go-to-def path and the webview path produce identical\n  positions for the same artifact.\n- `shell.ts` parses `data-source-line` into an integer and forwards\n  it as `msg.line` when posting `openSource`.\n- `extension.ts` uses `msg.line` to construct a `vscode.Range` and\n  passes it as `options.selection` to `showTextDocument`, so the\n  cursor lands on the artifact's `id:` row and the editor reveals\n  that line.\n\nRenderResult.source_line is also populated for the top-level source\nlink that `rivet.showSource` uses (previously None for this path).\n\n## New context-menu actions on YAML files\n\nTwo new commands registered in `editor/context` for `yaml` files:\n- `Rivet: Open Artifact in Dashboard` — navigates the webview to\n  `/artifact/<id>` for the artifact ID under the cursor.\n- `Rivet: Show Artifact in Graph` — navigates the webview to\n  `/graph?focus=<id>`.\n\nBoth use a shared `artifactIdAtCursor()` helper that extracts a\nrivet-shaped ID at the editor cursor (uppercase-prefix + dash +\ndigits, with optional `prefix:` external-ref namespacing). Rejects\nplain YAML keys like `title` so the menu items no-op gracefully with\nan info message when the cursor is not on an ID.\n\nRefs: FEAT-010, FEAT-001\n\nCo-authored-by: Claude Opus 4.7 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-04-23T13:03:25-05:00",
          "tree_id": "a019812597d63ac626f6ca0980e37f254909dbc3",
          "url": "https://github.com/pulseengine/rivet/commit/1dfe6402f2ee3557f518a1ac7048a50df2322170"
        },
        "date": 1776967904021,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79963,
            "range": "± 1682",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859238,
            "range": "± 7430",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13067139,
            "range": "± 1118158",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2130,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26041,
            "range": "± 1688",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360003,
            "range": "± 6752",
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
            "value": 1020042,
            "range": "± 19786",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165776,
            "range": "± 2424",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907199,
            "range": "± 13051",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30510500,
            "range": "± 2283635",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120888,
            "range": "± 770",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1016854,
            "range": "± 37250",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12835615,
            "range": "± 1054692",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4230,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60917,
            "range": "± 2038",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763881,
            "range": "± 12724",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65286,
            "range": "± 429",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707652,
            "range": "± 14789",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8102579,
            "range": "± 395927",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 837,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7732,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 112291,
            "range": "± 2060",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25783,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 185027,
            "range": "± 2653",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1727380,
            "range": "± 12375",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c7d5664ee7410065fde1e1d108e666c5fd2ec1cd",
          "message": "Merge pull request #205 from pulseengine/feat/agent-pipelines-foundation\n\nfeat: agent-pipelines foundation + Mythos slop-hunt pipeline & findings",
          "timestamp": "2026-04-25T15:04:52-05:00",
          "tree_id": "1851cc831c3b2c1ad9f004452ddddc576fad7e7b",
          "url": "https://github.com/pulseengine/rivet/commit/c7d5664ee7410065fde1e1d108e666c5fd2ec1cd"
        },
        "date": 1777147906174,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83372,
            "range": "± 886",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 887344,
            "range": "± 4174",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12308476,
            "range": "± 720836",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24858,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378215,
            "range": "± 1969",
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
            "value": 1191240,
            "range": "± 101270",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168565,
            "range": "± 561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1946791,
            "range": "± 31041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27390081,
            "range": "± 279307",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120127,
            "range": "± 1397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1064931,
            "range": "± 11261",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11852513,
            "range": "± 526632",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4147,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43287,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 761870,
            "range": "± 3809",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60280,
            "range": "± 2038",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689968,
            "range": "± 2721",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7611136,
            "range": "± 77474",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6662,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 91697,
            "range": "± 323",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23729,
            "range": "± 60",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167476,
            "range": "± 2197",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584272,
            "range": "± 22583",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f39dbc2d92b81b9018c8edb6707289208ce84954",
          "message": "Merge pull request #211 from pulseengine/fix/playwright-stale-tests\n\nfix(tests/playwright): batch stale-test cleanups (5 of 10)",
          "timestamp": "2026-04-25T17:10:16-05:00",
          "tree_id": "37def75fcbbd3f14c71765228b230eaaa363d2bd",
          "url": "https://github.com/pulseengine/rivet/commit/f39dbc2d92b81b9018c8edb6707289208ce84954"
        },
        "date": 1777155402483,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81756,
            "range": "± 964",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 853989,
            "range": "± 17622",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11096137,
            "range": "± 446709",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26441,
            "range": "± 343",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366840,
            "range": "± 6348",
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
            "range": "± 1",
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
            "value": 1184976,
            "range": "± 28685",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161706,
            "range": "± 2677",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1895946,
            "range": "± 25210",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22725353,
            "range": "± 525533",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125917,
            "range": "± 2880",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1071243,
            "range": "± 24143",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10898312,
            "range": "± 284576",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4204,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59627,
            "range": "± 452",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770114,
            "range": "± 13924",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60468,
            "range": "± 247",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 667099,
            "range": "± 3098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7480048,
            "range": "± 42658",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 800,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7459,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109034,
            "range": "± 1868",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24951,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 178555,
            "range": "± 2885",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1656025,
            "range": "± 34059",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8fa66864fe3b0e60e3097899ec9534d84137fcb2",
          "message": "Merge pull request #213 from pulseengine/fix/serve-middleware-status\n\nfix(serve): preserve response status through wrap_full_page middleware",
          "timestamp": "2026-04-25T17:10:29-05:00",
          "tree_id": "dc8cb16c6ad58326acdffa4aa369b71bff9e67de",
          "url": "https://github.com/pulseengine/rivet/commit/8fa66864fe3b0e60e3097899ec9534d84137fcb2"
        },
        "date": 1777155412454,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82238,
            "range": "± 363",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 874720,
            "range": "± 5280",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13457093,
            "range": "± 1334712",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2189,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26849,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370216,
            "range": "± 9683",
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
            "value": 1189416,
            "range": "± 29037",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 171619,
            "range": "± 1749",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1982931,
            "range": "± 20805",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27178174,
            "range": "± 2555458",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124987,
            "range": "± 692",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1059766,
            "range": "± 10998",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12384300,
            "range": "± 811154",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4346,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62099,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781825,
            "range": "± 11576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60202,
            "range": "± 996",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690747,
            "range": "± 4230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7602114,
            "range": "± 477656",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 805,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7445,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 108022,
            "range": "± 1105",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26663,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 187681,
            "range": "± 788",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1720760,
            "range": "± 10232",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f1a8e3f1c0879cc3334f762b70c457b6ae1a70ec",
          "message": "Merge pull request #209 from pulseengine/fix/ci-timeout-and-verus-log\n\nfix(ci): Kani PR-smoke + Mutation shard + Verus log upload",
          "timestamp": "2026-04-25T17:10:54-05:00",
          "tree_id": "db9d356f9b2092523a3731b396f51602e110334c",
          "url": "https://github.com/pulseengine/rivet/commit/f1a8e3f1c0879cc3334f762b70c457b6ae1a70ec"
        },
        "date": 1777155452025,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78563,
            "range": "± 2758",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 822570,
            "range": "± 20749",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11938423,
            "range": "± 995876",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25091,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352958,
            "range": "± 2121",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1177243,
            "range": "± 27720",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163359,
            "range": "± 3093",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1862983,
            "range": "± 40013",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25502821,
            "range": "± 1785728",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 122370,
            "range": "± 2364",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1035783,
            "range": "± 76691",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11742598,
            "range": "± 1503209",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4222,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59392,
            "range": "± 327",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801443,
            "range": "± 13052",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59995,
            "range": "± 1736",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 656471,
            "range": "± 15674",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7223585,
            "range": "± 195945",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 776,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7435,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116593,
            "range": "± 2691",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24615,
            "range": "± 664",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175785,
            "range": "± 4683",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1653640,
            "range": "± 62595",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8a5a4a794e0eb1edae8ee29ad05ee1f61274b216",
          "message": "Merge pull request #208 from pulseengine/feat/witness-coverage-evidence-consumer\n\nfeat(rivet-core): CoverageStore for external coverage evidence (witness consumer)",
          "timestamp": "2026-04-25T17:11:42-05:00",
          "tree_id": "34fbe58e7b63bd7534684f5b4c9eac4a2dcc52a8",
          "url": "https://github.com/pulseengine/rivet/commit/8a5a4a794e0eb1edae8ee29ad05ee1f61274b216"
        },
        "date": 1777155509877,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81109,
            "range": "± 924",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850983,
            "range": "± 9186",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11612957,
            "range": "± 930392",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2160,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27039,
            "range": "± 435",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 375379,
            "range": "± 7103",
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
            "value": 1177538,
            "range": "± 15299",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162966,
            "range": "± 1728",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860087,
            "range": "± 10092",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24641496,
            "range": "± 2408706",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124364,
            "range": "± 1673",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1067023,
            "range": "± 16432",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11187438,
            "range": "± 716590",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4284,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59297,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 764377,
            "range": "± 4817",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59049,
            "range": "± 947",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 702347,
            "range": "± 3842",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7595554,
            "range": "± 202805",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 801,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7086,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117456,
            "range": "± 833",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25823,
            "range": "± 169",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184315,
            "range": "± 3690",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1747030,
            "range": "± 35186",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "77fa2e04f8f1ba593574435e57c0beafa2544d28",
          "message": "Merge pull request #210 from pulseengine/fix/proofs-rocq-restoration\n\nfix(proofs): restore Validation.v import + replace Admitted with proofs",
          "timestamp": "2026-04-25T17:11:20-05:00",
          "tree_id": "b0a5278fbdc8cd84ce039da4cb6b3531b5cca737",
          "url": "https://github.com/pulseengine/rivet/commit/77fa2e04f8f1ba593574435e57c0beafa2544d28"
        },
        "date": 1777155515788,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75592,
            "range": "± 1349",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901947,
            "range": "± 3877",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15741884,
            "range": "± 1917957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1685,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19210,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 344666,
            "range": "± 5713",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 88,
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
            "value": 88,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1084727,
            "range": "± 49974",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159517,
            "range": "± 6478",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1825219,
            "range": "± 14589",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43114554,
            "range": "± 3617854",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 112210,
            "range": "± 629",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1030942,
            "range": "± 8038",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 20000829,
            "range": "± 1365309",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3971,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40182,
            "range": "± 516",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 740091,
            "range": "± 4221",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 51859,
            "range": "± 1050",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 567495,
            "range": "± 4051",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8739208,
            "range": "± 593699",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 645,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5456,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 136234,
            "range": "± 2284",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22838,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167195,
            "range": "± 655",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1570995,
            "range": "± 26919",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "54477c5681ceaea5db6fc75c4def2cb1e83b01d0",
          "message": "Merge pull request #212 from pulseengine/fix/verus-vstd-paths-and-matches\n\nfix(verus): correct vstd lemma paths + matches!→is + lemma_div_multiples_vanish",
          "timestamp": "2026-04-26T05:05:10-05:00",
          "tree_id": "1ef8fb7f50f6d0727a2a5eea3df75426cb249676",
          "url": "https://github.com/pulseengine/rivet/commit/54477c5681ceaea5db6fc75c4def2cb1e83b01d0"
        },
        "date": 1777198545412,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80104,
            "range": "± 1590",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 852181,
            "range": "± 12822",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12104946,
            "range": "± 829843",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2168,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25679,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366588,
            "range": "± 2614",
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
            "value": 1162615,
            "range": "± 29350",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162273,
            "range": "± 611",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1870237,
            "range": "± 9336",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24546600,
            "range": "± 935868",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124047,
            "range": "± 825",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1065388,
            "range": "± 15810",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 10972103,
            "range": "± 371583",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60125,
            "range": "± 277",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 751706,
            "range": "± 2525",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61598,
            "range": "± 1041",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705810,
            "range": "± 2341",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7687878,
            "range": "± 235327",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 784,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7239,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116532,
            "range": "± 994",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25421,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184573,
            "range": "± 699",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1729469,
            "range": "± 23429",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "58801b6bb61d632e2fd64b0e348f7d565f6e4329",
          "message": "Merge pull request #214 from pulseengine/fix/playwright-timeout-bump\n\nfix(playwright): bump per-test timeout 30s -> 60s for graph render",
          "timestamp": "2026-04-26T05:06:10-05:00",
          "tree_id": "fa6bdab3ffd073ef6216a1f961d106358ae9e794",
          "url": "https://github.com/pulseengine/rivet/commit/58801b6bb61d632e2fd64b0e348f7d565f6e4329"
        },
        "date": 1777198819318,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 75521,
            "range": "± 305",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890983,
            "range": "± 4353",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13535612,
            "range": "± 558004",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1718,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19320,
            "range": "± 203",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 340885,
            "range": "± 1217",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1078180,
            "range": "± 27739",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157220,
            "range": "± 423",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1811119,
            "range": "± 24165",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27478275,
            "range": "± 1542404",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 111817,
            "range": "± 928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1016490,
            "range": "± 23894",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12656985,
            "range": "± 862501",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3903,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41047,
            "range": "± 91",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 751585,
            "range": "± 6250",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53221,
            "range": "± 1740",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 597822,
            "range": "± 2900",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6937646,
            "range": "± 227115",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 630,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5229,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 151503,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23190,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168370,
            "range": "± 789",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1591489,
            "range": "± 28421",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c328d5f81471886f050b70f12dadbd4613241050",
          "message": "Merge pull request #218 from pulseengine/fix/mutants-rivet-core-survivors\n\ntest(rivet-core): kill 35+ surviving mutants from sharded mutation testing",
          "timestamp": "2026-04-26T08:08:22-05:00",
          "tree_id": "154e043549d856ab61b19e0941e5e1e2255f8dec",
          "url": "https://github.com/pulseengine/rivet/commit/c328d5f81471886f050b70f12dadbd4613241050"
        },
        "date": 1777209298448,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81277,
            "range": "± 714",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 863134,
            "range": "± 6267",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16719037,
            "range": "± 1410756",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1928,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24624,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348197,
            "range": "± 4084",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1185957,
            "range": "± 29962",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167415,
            "range": "± 2893",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1947945,
            "range": "± 28247",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37455607,
            "range": "± 3920654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120192,
            "range": "± 8360",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1059182,
            "range": "± 22972",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16612762,
            "range": "± 1888626",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4111,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44426,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746867,
            "range": "± 9262",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58178,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 711241,
            "range": "± 5410",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8673560,
            "range": "± 708458",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 794,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7095,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 90368,
            "range": "± 514",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24232,
            "range": "± 233",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 173198,
            "range": "± 811",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1634921,
            "range": "± 10749",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7a22f3e54bb9f1e1a71b3b3baec36f3d1cb99268",
          "message": "Merge pull request #215 from pulseengine/feat/playwright-rendering-coverage-audit\n\nfeat(tests/playwright): rendering invariant coverage — 10 new tests",
          "timestamp": "2026-04-26T08:09:14-05:00",
          "tree_id": "cdfe6f8d7fee4c1f39e73822617278eb1aa28e24",
          "url": "https://github.com/pulseengine/rivet/commit/7a22f3e54bb9f1e1a71b3b3baec36f3d1cb99268"
        },
        "date": 1777209348063,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80911,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 867919,
            "range": "± 6633",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17408562,
            "range": "± 1127342",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2153,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25629,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371181,
            "range": "± 2636",
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
            "value": 1185846,
            "range": "± 28784",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166002,
            "range": "± 11335",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1982647,
            "range": "± 8788",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 39189912,
            "range": "± 3029298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125269,
            "range": "± 755",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1080705,
            "range": "± 15733",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19605311,
            "range": "± 1016289",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4341,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60812,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 835564,
            "range": "± 15215",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65418,
            "range": "± 213",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 736737,
            "range": "± 9750",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10888113,
            "range": "± 793232",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7535,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 106678,
            "range": "± 619",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25617,
            "range": "± 278",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184652,
            "range": "± 3415",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1739289,
            "range": "± 24645",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f44b825c63b6dd62bf9f62b077aa4ec9a6d2ff47",
          "message": "Merge pull request #217 from pulseengine/fix/playwright-remaining-failures\n\nfix(playwright): close out remaining 8 dashboard test failures",
          "timestamp": "2026-04-26T08:22:21-05:00",
          "tree_id": "2613f1565922c33957b54d0199d3306dbef0dc40",
          "url": "https://github.com/pulseengine/rivet/commit/f44b825c63b6dd62bf9f62b077aa4ec9a6d2ff47"
        },
        "date": 1777210169413,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82589,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 859303,
            "range": "± 4502",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13583532,
            "range": "± 1425673",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2137,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26716,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360552,
            "range": "± 4135",
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
            "range": "± 3",
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
            "value": 1187601,
            "range": "± 21644",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165974,
            "range": "± 678",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1928342,
            "range": "± 21736",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34480363,
            "range": "± 3107886",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125023,
            "range": "± 1397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1069160,
            "range": "± 23843",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13247530,
            "range": "± 1598417",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4398,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59941,
            "range": "± 648",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 762012,
            "range": "± 6796",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62164,
            "range": "± 936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678942,
            "range": "± 3155",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8041571,
            "range": "± 373316",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7456,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 119581,
            "range": "± 4679",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25777,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 183034,
            "range": "± 5634",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1731586,
            "range": "± 25935",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a3ce780a184d92bdf3967aa555b6e2c04b91567b",
          "message": "Merge pull request #219 from pulseengine/fix/fmt-drift-post-mutation-merge\n\nstyle(rivet-core): cargo fmt drift after PR #218 merge",
          "timestamp": "2026-04-26T10:40:16-05:00",
          "tree_id": "a5dd0d714922a549f60e3f2eb4c827f75546471e",
          "url": "https://github.com/pulseengine/rivet/commit/a3ce780a184d92bdf3967aa555b6e2c04b91567b"
        },
        "date": 1777218405248,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 81312,
            "range": "± 641",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883438,
            "range": "± 3719",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12529310,
            "range": "± 396283",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1969,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25122,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357586,
            "range": "± 6082",
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
            "value": 1203579,
            "range": "± 106729",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166713,
            "range": "± 680",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1936260,
            "range": "± 7433",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27220245,
            "range": "± 1081082",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 120323,
            "range": "± 417",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1083900,
            "range": "± 24022",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12136690,
            "range": "± 995216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4154,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44326,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756653,
            "range": "± 3850",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63809,
            "range": "± 186",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 710223,
            "range": "± 3685",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7999797,
            "range": "± 123707",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 785,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7075,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 93163,
            "range": "± 785",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24170,
            "range": "± 283",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174884,
            "range": "± 731",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1632008,
            "range": "± 30571",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3cdb94203a80a652e96e9289014de954898ce484",
          "message": "Merge pull request #220 from pulseengine/fix/rendering-invariants-description-mermaid-wrapped\n\ntest(playwright): flip description-mermaid pin to expect .svg-viewer wrap",
          "timestamp": "2026-04-26T11:44:38-05:00",
          "tree_id": "aca1c477011f30d5ac8c00f8d9bfbb5450513b94",
          "url": "https://github.com/pulseengine/rivet/commit/3cdb94203a80a652e96e9289014de954898ce484"
        },
        "date": 1777222263888,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80584,
            "range": "± 406",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 860106,
            "range": "± 7895",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12005789,
            "range": "± 731667",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26211,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372453,
            "range": "± 1790",
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
            "value": 1180951,
            "range": "± 17807",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166789,
            "range": "± 1281",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914964,
            "range": "± 11651",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27083984,
            "range": "± 1999680",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123883,
            "range": "± 840",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1057057,
            "range": "± 15706",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 11121326,
            "range": "± 518102",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4382,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59228,
            "range": "± 413",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 743387,
            "range": "± 2013",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59666,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708922,
            "range": "± 2765",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7808283,
            "range": "± 193153",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 811,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7492,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 110920,
            "range": "± 985",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26490,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 189622,
            "range": "± 1079",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1735904,
            "range": "± 39519",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "793dce645fe39c58d95e46063752896a9750f7de",
          "message": "Merge pull request #221 from pulseengine/fix/mutation-rivet-core-8-shard-and-survivors\n\nfix(ci): rivet-core mutants — 16 shards + 30s timeout + kill ~70 survivors",
          "timestamp": "2026-04-26T22:56:02-05:00",
          "tree_id": "a218b63367e79847f836cc83da4d276fe2feff7e",
          "url": "https://github.com/pulseengine/rivet/commit/793dce645fe39c58d95e46063752896a9750f7de"
        },
        "date": 1777262548386,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79488,
            "range": "± 470",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 850641,
            "range": "± 4538",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12502178,
            "range": "± 780072",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2137,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25516,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353963,
            "range": "± 1365",
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
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1180862,
            "range": "± 21469",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164858,
            "range": "± 581",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892718,
            "range": "± 13278",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24293727,
            "range": "± 1569654",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123285,
            "range": "± 598",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1080666,
            "range": "± 17783",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12540709,
            "range": "± 1588342",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4372,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60178,
            "range": "± 444",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 759078,
            "range": "± 3382",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61520,
            "range": "± 1205",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719973,
            "range": "± 3646",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8123634,
            "range": "± 221330",
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
            "value": 7887,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 106338,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25981,
            "range": "± 2337",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 187975,
            "range": "± 1535",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1726224,
            "range": "± 19148",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ab6e1fa9b8dc79170d3fa792efbdb36cda1b7d71",
          "message": "Merge pull request #223 from pulseengine/feat/variant-scoping-coherence\n\nfeat(serve): variant scoping for 8 handlers (close incoherence flagged in PR #215)",
          "timestamp": "2026-04-26T22:56:11-05:00",
          "tree_id": "8a5c59b06161b5b76259f3c70fb0e30adc46b60c",
          "url": "https://github.com/pulseengine/rivet/commit/ab6e1fa9b8dc79170d3fa792efbdb36cda1b7d71"
        },
        "date": 1777262568071,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80302,
            "range": "± 449",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849157,
            "range": "± 5851",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13316830,
            "range": "± 456984",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2089,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26954,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367040,
            "range": "± 910",
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
            "value": 1183180,
            "range": "± 13473",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160232,
            "range": "± 717",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1860387,
            "range": "± 11297",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30237199,
            "range": "± 1124150",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124957,
            "range": "± 687",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1065085,
            "range": "± 10262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14255562,
            "range": "± 443690",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4340,
            "range": "± 192",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61422,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747506,
            "range": "± 3590",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56789,
            "range": "± 802",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 679642,
            "range": "± 2974",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7966731,
            "range": "± 153815",
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
            "value": 7442,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107067,
            "range": "± 859",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26127,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 191685,
            "range": "± 1992",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1729604,
            "range": "± 35912",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "28333f131d1b9804fec768f12c4ca488d1dc327f",
          "message": "Merge pull request #224 from pulseengine/feat/docs-warn-or-allowlist\n\nfeat(docs): warn-or-allowlist for non-rivet files in scanned dirs (Task #56)",
          "timestamp": "2026-04-26T22:56:54-05:00",
          "tree_id": "c0269f7405f94986e01f10d42c71d2698e363753",
          "url": "https://github.com/pulseengine/rivet/commit/28333f131d1b9804fec768f12c4ca488d1dc327f"
        },
        "date": 1777262598732,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80188,
            "range": "± 2141",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 849769,
            "range": "± 6877",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12940267,
            "range": "± 938920",
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
            "value": 26733,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363999,
            "range": "± 6524",
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
            "value": 1225386,
            "range": "± 11633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 152557,
            "range": "± 534",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1771235,
            "range": "± 21157",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28854747,
            "range": "± 2807239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124218,
            "range": "± 727",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1047392,
            "range": "± 23297",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14199429,
            "range": "± 1703373",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4227,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58871,
            "range": "± 696",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 772854,
            "range": "± 6046",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58952,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 669139,
            "range": "± 6890",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7681501,
            "range": "± 407131",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 796,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7753,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 107743,
            "range": "± 883",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23740,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163553,
            "range": "± 2135",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505799,
            "range": "± 17904",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c4e184014ca99959b2d0ada20fa30817213853fe",
          "message": "Merge pull request #226 from pulseengine/docs/intro-talk-template-and-onepager\n\ndocs: presenter template + one-pager for introducing rivet",
          "timestamp": "2026-04-26T23:50:38-05:00",
          "tree_id": "6d187c50fdf7ab6d7f273f433d82ec107a1fcf3f",
          "url": "https://github.com/pulseengine/rivet/commit/c4e184014ca99959b2d0ada20fa30817213853fe"
        },
        "date": 1777265826831,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80915,
            "range": "± 2030",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 854836,
            "range": "± 7123",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15765983,
            "range": "± 869410",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2166,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25822,
            "range": "± 590",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371506,
            "range": "± 20432",
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
            "value": 1188481,
            "range": "± 24487",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 154199,
            "range": "± 927",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1790399,
            "range": "± 66074",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36864690,
            "range": "± 3156875",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123133,
            "range": "± 2630",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1051932,
            "range": "± 22425",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 16363588,
            "range": "± 1286923",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4541,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61533,
            "range": "± 483",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783081,
            "range": "± 8276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59191,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 664750,
            "range": "± 4026",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8048298,
            "range": "± 391775",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7317,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116837,
            "range": "± 810",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23125,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 163236,
            "range": "± 834",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511923,
            "range": "± 10701",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "51bd53fa0c8a6a0efbc3745a15b62eb74c7fbc11",
          "message": "Merge pull request #225 from pulseengine/feat/eu-ai-act-self-audit\n\nfeat(eu-ai-act): self-audit content + load schema in rivet.yaml (Task #46)",
          "timestamp": "2026-04-26T23:50:47-05:00",
          "tree_id": "b50426af53f0745a676ec52d9273edbefd3bc1ea",
          "url": "https://github.com/pulseengine/rivet/commit/51bd53fa0c8a6a0efbc3745a15b62eb74c7fbc11"
        },
        "date": 1777265953846,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79372,
            "range": "± 845",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 851692,
            "range": "± 12376",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16006458,
            "range": "± 915864",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2172,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26349,
            "range": "± 211",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366694,
            "range": "± 1955",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 95,
            "range": "± 4",
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
            "value": 1190319,
            "range": "± 25049",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 153114,
            "range": "± 2022",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1799402,
            "range": "± 12761",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30318001,
            "range": "± 1988151",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124311,
            "range": "± 973",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1057636,
            "range": "± 22104",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13591876,
            "range": "± 864297",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4282,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61142,
            "range": "± 435",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783981,
            "range": "± 7098",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57923,
            "range": "± 376",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 670156,
            "range": "± 4759",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9455713,
            "range": "± 566674",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 796,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7697,
            "range": "± 457",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115569,
            "range": "± 745",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23338,
            "range": "± 173",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 162684,
            "range": "± 1030",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1491348,
            "range": "± 24441",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "92ad95dd25e1b353af64d208cbc242fd401dd7fc",
          "message": "Merge pull request #227 from pulseengine/feat/v0.5.0-readme-quickstart-changelog\n\nfeat(v0.5.0): README rewrite + rivet quickstart + CHANGELOG",
          "timestamp": "2026-04-26T23:50:55-05:00",
          "tree_id": "2c3f44872753b4b064b67ae7ac70f2b7d7e95e3d",
          "url": "https://github.com/pulseengine/rivet/commit/92ad95dd25e1b353af64d208cbc242fd401dd7fc"
        },
        "date": 1777266085776,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78700,
            "range": "± 866",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 842406,
            "range": "± 9692",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13763082,
            "range": "± 1239482",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2168,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26024,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371926,
            "range": "± 3694",
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
            "value": 1186075,
            "range": "± 24028",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 153640,
            "range": "± 565",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1786494,
            "range": "± 20354",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30052745,
            "range": "± 2252438",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 124279,
            "range": "± 604",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1066616,
            "range": "± 19549",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13552778,
            "range": "± 1568436",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4387,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58910,
            "range": "± 2937",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770095,
            "range": "± 11276",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61453,
            "range": "± 293",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690505,
            "range": "± 3160",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8139809,
            "range": "± 659684",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 797,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7690,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 109024,
            "range": "± 1298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23550,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165011,
            "range": "± 1484",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498688,
            "range": "± 27554",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}