window.BENCHMARK_DATA = {
  "lastUpdate": 1790871445980,
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
          "id": "16bff52cf26ed073f6902d5c813ce005900413ad",
          "message": "fix(check): require real test evidence, not a matching name (REQ-306, REQ-295) (#889)\n\n`check verification-evidence` asserted only that a function of that NAME existed\nsomewhere in the scanned tree. An EMPTY `#[test] fn <name>() {}` satisfied it —\nthe reporter's proof — and so did a plain non-test helper sharing the name,\nbecause the extractor collected every `fn`. The check was satisfiable by exactly\nthe stub it exists to catch.\n\nThe old extractor documents that over-approximation as \"the SAFE direction —\nincluding non-test fns can only suppress a false error, never invent one\". That\nargument is coherent and wrong: a gate that can only under-report is not\nconservative, it is a gate you cannot fail, and what it silently accepts here is\nthe artefact it was built to reject.\n\nNew extract_test_fn_names requires a test-family attribute and a body holding\nmore than whitespace and comments. Additive — the old function keeps its\ncontract and its callers.\n\nThe PR-diff mutation gate then found four survivors. Two were missing fixtures\nfor the attribute walk-up. The other two exposed dead logic: braces were being\npushed into the body-content buffer, which made `depth` decorative, since any\nearly return still found a `{` and reported content. Braces are structure, not\ncontent; excluding them makes the depth tracking load-bearing and correctly\ntreats a body holding only `{}` as hollow. Gate is green on the merge commit.\n\nUnit tests live in rivet-core beside the function because the mutation gate runs\n`-- --lib` and cannot see tests/*.rs. Negative-controlled at that scope: each\nmutation reddens exactly one test.\n\nREQ-295 is the umbrella for both defects in #807 and is now discharged: Defect 1\nshipped in #830, Defect 2 here. Full per-target command resolution is NOT done,\nand the empty-scan exit code stays as REQ-290 decided it.\n\nKani is red at the install action with the proofs skipped — measured across 60\njobs, all 26 failures are that same step and none is a proof break (#839). Not\nin CI Gate's needs. CI Gate passes with 27 checks green.\n\nImplements: REQ-306\nVerifies: REQ-306, REQ-295\nRefs: REQ-290",
          "timestamp": "2026-09-05T17:43:09+02:00",
          "tree_id": "693b4771d8c0e5474cdd1e7c23f7b3ba7fe8c142",
          "url": "https://github.com/pulseengine/rivet/commit/16bff52cf26ed073f6902d5c813ce005900413ad"
        },
        "date": 1788623734537,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85277,
            "range": "± 640",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919558,
            "range": "± 8576",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14267788,
            "range": "± 896184",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1987,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24623,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 336572,
            "range": "± 1217",
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
            "value": 98,
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
            "value": 1535674,
            "range": "± 29303",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165699,
            "range": "± 480",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1924401,
            "range": "± 16141",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30109496,
            "range": "± 888046",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465990,
            "range": "± 2974",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15195362,
            "range": "± 153754",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1087810528,
            "range": "± 16532690",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4255,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46077,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 820277,
            "range": "± 22677",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 67676,
            "range": "± 271",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 764956,
            "range": "± 7339",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9754543,
            "range": "± 794992",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1086,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14691,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 244880,
            "range": "± 1851",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21373,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146297,
            "range": "± 796",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1342903,
            "range": "± 21462",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4d811babd6755dd89e87a1f7be2cb9bcff7bdbd6",
          "message": "plan(v0.37): file REQ-325 — the stall classifier names the wrong cause (#896)\n\nArtifact only. Found while watching the v0.36.0 release run, in the code REQ-317\nshipped a day earlier: `create-release` sat queued behind its `needs` while the\ncompliance build ran, and `classify_stall` returned `hosted-starved` because\nevery queued job carried `ubuntu-latest` and the classifier reasons only about\nlabels and capacity. The fleet was almost entirely idle (online=12, busy=1) with\nspare capacity under every label. Nothing was starved; the job was waiting its\nturn.\n\nThat is the same defect REQ-317 exists to fix, in its own fix — a diagnostic\nconfidently naming a cause it cannot observe — and it is reachable rather than\ntheoretical, since the probe fires past thirty minutes and this release's builds\nlegitimately take that long.\n\nRefs: REQ-325, REQ-317\nTrace: skip",
          "timestamp": "2026-09-06T10:26:43+02:00",
          "tree_id": "744c3af9bbb3df9b9aed6c87a96cd46445b544f5",
          "url": "https://github.com/pulseengine/rivet/commit/4d811babd6755dd89e87a1f7be2cb9bcff7bdbd6"
        },
        "date": 1788687717923,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85559,
            "range": "± 869",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899004,
            "range": "± 3884",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12832572,
            "range": "± 554784",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2283,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23533,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348560,
            "range": "± 7316",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1515309,
            "range": "± 37920",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161347,
            "range": "± 913",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1896005,
            "range": "± 13916",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24466706,
            "range": "± 828132",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 489689,
            "range": "± 2033",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15578478,
            "range": "± 268863",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1242988284,
            "range": "± 15046290",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4236,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63407,
            "range": "± 345",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 790741,
            "range": "± 1416",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57850,
            "range": "± 230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691618,
            "range": "± 2619",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7837241,
            "range": "± 607959",
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
            "value": 15418,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 360169,
            "range": "± 6628",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23335,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159010,
            "range": "± 1026",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1484035,
            "range": "± 19500",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "db10b7269ea0be69be44c221ac7e3b0595a0d51b",
          "message": "fix(scanner): attribute a marker to the test it annotates (REQ-326, #892, #787) (#897)\n\n`find_enclosing_function` only ever scanned BACKWARDS, so a marker written in\nthe conventional place — on the line above the `#[test]` it annotates — was\nattributed to the function before it. Reported twice, from meld (#892) and\nearlier as #787.\n\nThe damage is narrow and bad: the requirement MAPPING stays correct, so verify\nstill advances and coverage percentages are unaffected. What is wrong is the\nEVIDENCE LINE, which names a different test than the one that verifies the\nrequirement — and for a reader auditing the right-hand side of the V, that line\nis the entire product. Following it leads to a test that does not test the thing.\n\nFixed by walking forward first, but only across lines that may legitimately\nseparate a marker from what it annotates. The bound is what makes it correct: a\nmarker inside a body has real code on the next line, so the walk stops and the\nbackward scan returns the enclosing function, which is the shell convention\nREQ-319 depends on.\n\nThe mutation gate then found five survivors in the separator predicate, and the\nhonest fix was deletion rather than more fixtures: three of eight disjuncts\ncould never change an outcome (`#[`, `#!` and `#` all start with '#') and two\ncould never be reached (`pub`, `async` sit on the fn line the pattern already\nmatches). Eight became four, each now individually killable.\n\nA mistake in the first commit is worth recording: inserting the tests spliced a\ndoc comment into the middle of REQ-319's, orphaning its marker onto the wrong\nfunction. cargo test and clippy both passed — doc comments concatenate\nharmlessly — and only `rivet coverage --tests` caught it. The tool found a defect\nthe compiler could not see.\n\nCloses #892. Closes #787.\n\nImplements: REQ-326\nVerifies: REQ-326",
          "timestamp": "2026-09-07T08:56:54+02:00",
          "tree_id": "f3095a2b6f60d29d0bd35d44eeebdae2bee51266",
          "url": "https://github.com/pulseengine/rivet/commit/db10b7269ea0be69be44c221ac7e3b0595a0d51b"
        },
        "date": 1788766539917,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87075,
            "range": "± 1300",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 928673,
            "range": "± 4383",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14738885,
            "range": "± 457447",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2216,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25505,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374204,
            "range": "± 6639",
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
            "value": 1533619,
            "range": "± 12353",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160230,
            "range": "± 940",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1932016,
            "range": "± 19973",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 38752041,
            "range": "± 1704431",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 516886,
            "range": "± 3487",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18287714,
            "range": "± 1357271",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1389592507,
            "range": "± 13204092",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4378,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59005,
            "range": "± 418",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 779250,
            "range": "± 8857",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63414,
            "range": "± 154",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696900,
            "range": "± 3762",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11072002,
            "range": "± 492529",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1082,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14863,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 336251,
            "range": "± 3612",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22819,
            "range": "± 270",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158436,
            "range": "± 696",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1492701,
            "range": "± 22765",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a80ca3a3948bfc91cfe69109492d507d225b9424",
          "message": "plan(v0.37): file REQ-327 — rivet cannot state what a release contains (#900)\n\nArtifact only. Design grounded in Automotive SPICE PAM v4.1 (VDA QMC), SPL.2\nProduct Release: BP6 requires a release note and information item 11-03 defines\nits content — that list is the specification rather than anything invented here.\n\nTwo of the four sections chosen with the maintainer BEFORE reading the PAM turn\nout to be mandated: limitations in relation to the committed scope, and known\nnon-conformities. The standard treats declared gaps as first-class release-note\ncontent, which is why a mock-up over real v0.36.0 data had an absence as its\nhighest-signal line — external references, 0 of 10 declared.\n\nThree elements were missed and rivet already produces evidence for each:\ncopyright and license information (Cargo Deny), configurations and variants (the\nvariant subsystem), and approval by responsible roles (the review-signoff oracle\nenforcing reviewer != author per GP 2.1.7 / GP 2.2.4).\n\nsupply-chain.yaml already models release-artifact, build-attestation and\nvulnerability, and rivet's own releases do not use them though v0.36.0 produced\nevery input and discarded it. Decision: rivet emits those artifacts per release\nrather than only reporting over them. Linkage reuses cited-source (oslc and\npolarion cover Jira and DOORS) and is never inferred.\n\nKani is red at the toolchain-install step with the proofs skipped — across 60\nsampled jobs every failure is that step and none is a proof break (#839). Not in\nCI Gate's needs.\n\nRefs: REQ-327\nTrace: skip",
          "timestamp": "2026-09-08T22:23:52+02:00",
          "tree_id": "a70463df97a700ec417666bb0643862e44b10376",
          "url": "https://github.com/pulseengine/rivet/commit/a80ca3a3948bfc91cfe69109492d507d225b9424"
        },
        "date": 1788899785258,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85510,
            "range": "± 1492",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 905273,
            "range": "± 10576",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12739051,
            "range": "± 575699",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2211,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24772,
            "range": "± 235",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 336509,
            "range": "± 1085",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1529207,
            "range": "± 26250",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 156743,
            "range": "± 463",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876062,
            "range": "± 9575",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25235692,
            "range": "± 1578256",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 512484,
            "range": "± 6798",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17513204,
            "range": "± 153518",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1375568128,
            "range": "± 8921203",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4427,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60512,
            "range": "± 455",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 797583,
            "range": "± 2161",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59031,
            "range": "± 1006",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688239,
            "range": "± 2733",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7871940,
            "range": "± 331020",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1165,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14439,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318309,
            "range": "± 1643",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23117,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158607,
            "range": "± 736",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1483374,
            "range": "± 22945",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "acc40879872e81ef729587e87dc6d359df91456d",
          "message": "fix(coverage): name the marker evidence the link rules cannot see (REQ-329, #788) (#906)\n\nPlain `rivet coverage` reported requirement-verification at 0% while\n`coverage --tests` reported 100% — same requirements, same evidence. The link\nrule counts graph-level `verifies` backlinks from test artifacts; a source\nmarker is not a backlink, so it is invisible to that rule, while `rivet verify`\naccepts exactly those markers as sufficient to advance a requirement.\n\nTwo views of one evidence set up to 100 points apart, with nothing telling a\nrelease gate it is reading the narrower one. Reproduced minimally (1/1 vs 0/1)\nand on rivet's own repository: 8.9% vs 37.9%.\n\nNOT fixed by folding markers into the rule — that would silently move a number\n`--fail-under` gates on. Fixed by making the gap visible, as this tool already\ndoes for empty scopes (#808), unchecked cross-refs (#854) and unmodelled rules\n(REQ-320). Plain coverage now names the requirements counted as uncovered that\nDO carry marker evidence and points at the marker view; on rivet's own repo it\nnames 98 of them.\n\nScoped to rules whose link type is `verifies`: a marker is a verifies claim and\nsays nothing about a satisfies backlink, so an unscoped note would announce\nmarker evidence for rules a marker can never satisfy. That scoping was missing\nfrom the first implementation and surfaced only because a negative control\nfailed to redden — the unscoped version reported 2 where the rule reported 1.\n\nCloses #788.\n\nImplements: REQ-329\nVerifies: REQ-329",
          "timestamp": "2026-09-09T06:19:51+02:00",
          "tree_id": "e6e8a62dde619b8879456897eb21e18cc68a9e79",
          "url": "https://github.com/pulseengine/rivet/commit/acc40879872e81ef729587e87dc6d359df91456d"
        },
        "date": 1788928384556,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85529,
            "range": "± 1004",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 906690,
            "range": "± 12031",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16634203,
            "range": "± 1362206",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2175,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27138,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372063,
            "range": "± 21784",
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
            "value": 1539256,
            "range": "± 40847",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160323,
            "range": "± 649",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1969316,
            "range": "± 181620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 50908431,
            "range": "± 8322919",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 521920,
            "range": "± 5651",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18945379,
            "range": "± 1066775",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1392661464,
            "range": "± 18745777",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4337,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60823,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 867189,
            "range": "± 35321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62058,
            "range": "± 1850",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 687950,
            "range": "± 6413",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11488892,
            "range": "± 593263",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1125,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14367,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 341972,
            "range": "± 2674",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23487,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164584,
            "range": "± 2213",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1509133,
            "range": "± 25062",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c8a2529125ad672a1375eebe163d9bc5d4cf67dd",
          "message": "fix(mutants): exclude cfg(kani) code from the mutation scope (REQ-324) (#918)\n\nFound on PR #893 while shipping REQ-320. The PR-diff mutation gate reported one\nsurvivor — rivet-core/src/proofs.rs:209, replacing the proof harness\n`proof_coverage_percentage_bounds` with `unit`. That module sits behind\n`#[cfg(kani)]`, so `cargo test` never compiles it and the gate runs\n`cargo mutants -- --lib`. No test the gate executes can observe the mutation:\nthe finding is unkillable by construction, and appeared only because the PR\ntouched the file to add a struct field.\n\nThat is the same defect class as the release it was found in. A gate reporting\nsomething nothing can act on trains its readers to ignore it, and the next real\nsurvivor then costs nothing to dismiss.\n\nFixed by the route the requirement preferred: a cargo-mutants config, which\nscopes all three `cargo mutants` call sites in ci.yml from one place.\n\nThe config PATH is the whole trap. cargo-mutants 27.0.0 reads\n`.cargo/mutants.toml` and silently ignores a root-level `mutants.toml`. The\nfirst version of this put the file at the root, the accompanying test passed,\nand `cargo mutants -p rivet-core --list` still enumerated 236 mutants in\nproofs.rs. A test asserting a config exists says nothing about whether the tool\nreads it, so this was verified by listing mutants instead: 236 to 0 in\nproofs.rs, total still 5610, and rivet-core/src/lib.rs keeping its 61 — that\nlast number being what shows the exclusion did not quietly drop live code.\n\nThe oracle needed narrowing twice. Scanning for files CONTAINING the string\n`#[cfg(kani)]` matches three, and two are false positives whose exclusion would\nbe actively harmful: lib.rs merely DECLARES the module and is ordinary code\nthat must stay in scope, and rivet-cli/src/docs.rs contains the string inside a\ndocumentation topic. The invariant is therefore a file named by a\n`#[cfg(kani)] mod X;` declaration, and the test also asserts those two files are\nNOT excluded so a future broadening cannot silently remove real code.\n\nThen the exclusion assertion itself proved vacuous: it substring-matched the\nwhole config and so matched the rationale comment naming proofs.rs rather than\nthe exclude_globs entry, leaving the test green with the real exclusion\ndeleted. Found because the negative control failed to redden. It now parses the\narray.\n\nResidual, recorded rather than closed. This requirement warned that proofs.rs\nmust stay visible to SOMETHING, because a struct field added without updating a\ncfg(kani) literal once broke the proofs and the signal was written off as flake\nsix times. The only thing compiling it now is `cargo kani`, which fails at its\ninstall action about half the time (#839: measured 5 success, 6 failure, 11\nabsent across 22 CI runs on main, every failure at\nmodel-checking/kani-github-action@v1 with `cargo kani` skipped). A cheap\ntype-check guard does not exist — `RUSTFLAGS='--cfg kani' cargo check -p\nrivet-core` fails with unresolved import `kani`, the crate being injected by the\nKani compiler rather than resolvable from the registry. So the drift guard is\ngenuinely weaker after this change, not merely relocated; closing #839 is what\nwould restore it.\n\nConfirmed with fmt 0, clippy 1.97.0 --all-targets -D warnings 0, cargo test\n--workspace 0 (2366 passed), cargo test -p rivet-cli --test cli_commands 0\n(212 passed), rivet validate 0, rivet docs check 0, yamllint 0,\ndiagnose_test.sh 0. `rivet coverage --tests` reports REQ-324 with 1 test marker.\n\nFixes: REQ-324\nVerifies: REQ-324",
          "timestamp": "2026-09-09T10:18:13+02:00",
          "tree_id": "f20410d9e8a3574dc81489593219e7fe44454788",
          "url": "https://github.com/pulseengine/rivet/commit/c8a2529125ad672a1375eebe163d9bc5d4cf67dd"
        },
        "date": 1788944216120,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85635,
            "range": "± 2743",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919898,
            "range": "± 9545",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17068632,
            "range": "± 1322826",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1994,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23984,
            "range": "± 886",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348630,
            "range": "± 4051",
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
            "value": 1532518,
            "range": "± 62183",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166491,
            "range": "± 11268",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2014947,
            "range": "± 88025",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41022268,
            "range": "± 2300486",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476248,
            "range": "± 2707",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17436718,
            "range": "± 233253",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1241902391,
            "range": "± 94384657",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4262,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45565,
            "range": "± 195",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 812080,
            "range": "± 34274",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60302,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 728752,
            "range": "± 22270",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9689598,
            "range": "± 781392",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1181,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14374,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 230954,
            "range": "± 3191",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21230,
            "range": "± 297",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145570,
            "range": "± 1317",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1343368,
            "range": "± 7195",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9200daffcb6bd9cf275c7ebd346eeac50e64fd5d",
          "message": "test(release): give the no-false-closure guarantee a test that can fail (REQ-327) (#923)\n\nFound while auditing what actually discharges REQ-327. The test named\n`release_notes_never_claims_an_issue_was_closed` was VACUOUS: it invoked\n`release notes` with no `--since`, so the changes section never rendered, and\nits assertion that the output does not contain \"closes #\" passed on empty\noutput.\n\nProven by negative control — reverting the source from \"refs\" back to \"closes\"\nleft that test GREEN. So the property that keeps a fabricated claim out of a\nrelease record had no coverage at all while appearing to have some.\n\nThat is worse than no test. A reader auditing the trace sees a marker and a\nplausibly-named test and stops looking, which is precisely what happened when\nthis artifact was rated as having good evidence one tick earlier. The vacuous\ntest is DELETED rather than repaired.\n\nReplaced by two tests over a real git fixture — `git init`, a base commit\ncarrying `Trace: skip`, then a squash-merge-shaped subject\n`fix(thing): repair the thing (#42) (#77)` with a `Fixes: REQ-001` trailer.\n\nThat shape is the whole point. #42 is an issue and #77 is the pull request, and\nthey are indistinguishable from the subject text alone, so the note must report\nboth as refs and assert closure of neither.\n\nThe first test asserts the section RENDERS before asserting anything about its\ncontents — the step whose absence made the old test vacuous. The second asserts\na commit naming no artifact in this release is excluded. The new test reddens\nwhen \"refs\" is reverted to \"closes\"; the old one did not, which is what\nestablishes the difference.\n\nRecorded on the artifact for future audits: mapping a marker to a\nplausibly-named test is NOT sufficient to judge evidence, because that is\nexactly the check this defect passed. Only running the negative control finds\nthis class.\n\nConfirmed with fmt 0, clippy 1.97.0 --all-targets -D warnings 0, cargo test\n--workspace 0 (2368 passed), cargo test -p rivet-cli --test cli_commands 0\n(213 passed), rivet validate 0, rivet docs check 0, yamllint 0,\ndiagnose_test.sh 0.\n\nVerifies: REQ-327",
          "timestamp": "2026-09-09T16:59:19+02:00",
          "tree_id": "fc6747521ba9772b1a78e2f892e420419f41f362",
          "url": "https://github.com/pulseengine/rivet/commit/9200daffcb6bd9cf275c7ebd346eeac50e64fd5d"
        },
        "date": 1788967065725,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67786,
            "range": "± 1767",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 728622,
            "range": "± 12553",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15469004,
            "range": "± 738721",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1532,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17834,
            "range": "± 102",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 249576,
            "range": "± 3317",
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
            "value": 1187477,
            "range": "± 20606",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126896,
            "range": "± 337",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1570708,
            "range": "± 55786",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29174035,
            "range": "± 1804517",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 359981,
            "range": "± 5938",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12010382,
            "range": "± 79869",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 870067957,
            "range": "± 10851047",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3329,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35461,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 635714,
            "range": "± 4603",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45375,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 513232,
            "range": "± 1962",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7276635,
            "range": "± 369318",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 828,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11320,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 170762,
            "range": "± 1417",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16515,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 113074,
            "range": "± 580",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1040670,
            "range": "± 7995",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "32bf29e08a6be61ddbba5e5af3c17364feda77f4",
          "message": "plan(v0.39): the rowan fork has a measured expiry, not a permanent one (REQ-350) (#932)\n\nThe maintainer closed our rust-analyzer/rowan#211 on 2026-09-07 with \"We're\nabout to rewrite rowan anyway and the new code should pass Miri (and is also a\nchange of pretty much all code)\". That turns the fork from a permanent\nmaintenance burden into one with a defined expiry, and changes the posture from\nmaintaining to watching.\n\nTWO OF OUR OWN NOTES WERE FACTUALLY WRONG and are corrected in Cargo.toml.\nThere is no \"Future Rowan\" GSoC project: GSoC 2026's rust-analyzer project was\n\"Migrating rust-analyzer assists to SyntaxEditor\", the stated PREREQUISITE,\nclosed completed 2026-06-20 as rust-analyzer#18285. The rewrite issue itself,\nrust-analyzer#15710, has been open and untouched since 2024-09-02. The rewrite\nis landing as incremental breaking changes on rowan master — #213 tree-top,\n#217 mutable-API removal, 0.17.0 on 2026-08-02, #219 trivia, #220 open — not on\na branch and with no announced date.\n\nMEASURED ON OUR OWN SURFACE rather than on rowan's internals. An isolated\nworktree pinned to crates.io rowan 0.17.0 instead of the fork:\n\n  cargo check -p rivet-core   exit 0   compiles clean, no code changes\n  SB_EXIT=1   rowan-0.17.0/src/arc.rs:264      retag for SharedReadOnly,\n                                               tag absent from borrow stack\n  TB_EXIT=1   rowan-0.17.0/src/cursor.rs:136   deallocation forbidden\n\nBoth reached through yaml_cst::parse -> parse_root -> parse_block_mapping, so\nthis is a real consumer failing on ordinary construction and traversal rather\nthan a synthetic exercise of rowan's own tests. The SB site is the same\nheader-fattening cast reported upstream as #108 in 2021; the TB site is #192's.\n\nTwo consequences. The fork earns its keep — dropping it today turns the Miri\ngate red under BOTH aliasing models, not merely the stricter one. And the\nrationale #211 was closed under, that rowan should pass Tree Borrows, does not\nhold for our usage on the current release.\n\nThe clean compile matters separately: rivet touches only the immutable core and\nnone of the mutable API #217 removed, so the fork is NOT what keeps this project\non 0.16.x.\n\nCONTEXT FROM AN ECOSYSTEM SURVEY: of 30 rowan consumers, zero carry a fork or\npatch and zero execute rowan under Miri. rowan's own CI has no Miri job;\nrust-analyzer's covers only the intern crate, which has no rowan dependency. So\nthis gate is a standard we hold rather than shared pain we are fixing — which is\ndefensible for a compliance tool, and worth stating rather than assuming.\ncstree, a declared fork of rowan with the same unsafe core, does run Miri under\nStacked Borrows across three platforms and passes.\n\nA SECOND ROWAN PROBLEM, raised cross-repo as pulseengine/spar#446: rivet's\ndefault-on aadl feature pulls spar, and the lock carries two rowans — rivet on\nthe forked 0.16.2, five spar crates on unforked 0.16.1. Our Miri gate covers\nyaml_cst and sexpr only, so spar's rowan is never interpreted. That issue is\nframed as a coordination request, not a bug report, because we have NOT tested\nwhether spar's usage reaches the failing paths.\n\nCaveats recorded on the artifact: toolchain is miri on nightly 2026-04-19,\nroughly five months stale, and Tree Borrows is experimental and moves. Re-run\nbefore citing upstream.\n\nConfirmed with fmt 0, clippy 1.97.0 --all-targets -D warnings 0, cargo test\n--workspace 0 (2368 passed), cargo test -p rivet-cli --test cli_commands 0\n(213 passed), rivet validate 0, rivet docs check 0, yamllint 0,\ndiagnose_test.sh 0, cargo metadata 0. 319 artifacts, no duplicate ids.\n\nRefs: FEAT-001\nTrace: skip",
          "timestamp": "2026-09-10T12:40:20+02:00",
          "tree_id": "7c895c8f877c3d352d879f43e1e82c38c3c3db10",
          "url": "https://github.com/pulseengine/rivet/commit/32bf29e08a6be61ddbba5e5af3c17364feda77f4"
        },
        "date": 1789039872665,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86155,
            "range": "± 674",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898551,
            "range": "± 17192",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15803313,
            "range": "± 664373",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2168,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26767,
            "range": "± 134",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 347938,
            "range": "± 1492",
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
            "value": 1502280,
            "range": "± 25346",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167706,
            "range": "± 1478",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948893,
            "range": "± 15292",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30661394,
            "range": "± 1107198",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 508364,
            "range": "± 3150",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17122488,
            "range": "± 184620",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1397310919,
            "range": "± 11771182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4383,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59390,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 856076,
            "range": "± 16362",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64308,
            "range": "± 582",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705963,
            "range": "± 3219",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 12446918,
            "range": "± 618325",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1162,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16535,
            "range": "± 295",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322748,
            "range": "± 9136",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23172,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159336,
            "range": "± 1429",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498795,
            "range": "± 22297",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8e4cbf4069133b1f469f4a16c0955809800594e8",
          "message": "feat(cli): rivet consolidate — pack a shipped release back into one file (REQ-334) (#943)\n\n`rivet shard` is one-way, so a long-lived per-id source accumulates files\nwithout bound. This is the inverse, and the maintainer's framing is git's:\nloose objects, then packfiles. Pack what is cold, keep what is hot loose.\n\nThe grouping key is a SHIPPED RELEASE, and that is the load-bearing\nchoice. Artifacts scoped to a cut release are settled — nobody edits\nv0.36.0's requirements concurrently after the tag — so packing them\nreintroduces no conflict risk, while the open release and unscoped\nbacklog stay per-id, where the concurrent writes actually happen.\nGrouping by type would restore the very problem shard solved; grouping by\nstatus is weaker because status still moves.\n\nThe release is named explicitly rather than inferred. The tool cannot\nreliably know which releases are shipped, and guessing would be another\nfigure that does not mean what it says — the same objection REQ-334\nraises against a count-based threshold.\n\nOnly a file whose artifacts ALL carry the named release is packed. A\nmixed file would otherwise be half-packed and half-deleted, so it is left\nloose instead.\n\nThe safety property is shard's, run in reverse, and it compares the\nPROJECT's artifact set rather than the packed files' own ids — that is\nwhat catches a rivet.yaml source which cannot see the new file. Write the\npack; move the per-id files aside rather than deleting them; reload the\nwhole project; compare against the id set captured before; restore\neverything and abort on any difference; only then delete the moved-aside\nfiles. Refuses to overwrite an existing pack, refuses a release no\nartifact carries rather than writing an empty pack, and --dry-run reports\nwithout writing.\n\nThe measurement is reported rather than implied, which is REQ-334's\nsecond half. Load time is measured before and after and printed in\nmilliseconds so a reader can judge whether packing helped, instead of\nbeing handed a number whose basis is hidden. No count threshold is\nhardcoded anywhere.\n\nOracle first, red for the right reason (`unrecognized subcommand\n'consolidate'`). The fixture holds BOTH a shipped release and an open one\nplus unscoped backlog, because a fixture with only one release cannot\ntell \"packed the right ones\" from \"packed everything\". Four negative\ncontrols each redden on the specific claim: packing every file regardless\nof release reddens on the open release staying loose; allowing an empty\npack reddens on the refusal; removing the load-time report reddens on the\nmeasurement being stated; packing only id/type/title reddens on field\nfidelity.\n\nNOT VERIFIED, and recorded on the artifact: the restore-on-load-failure\npath. The pack lands inside the per-id directory the source already\npoints at, so no fixture here makes the post-pack load fail, and that\nbranch is exercised by no test. Written and reviewed, not demonstrated.\n\nThe repo's own help-hygiene gates caught the first draft of the clap doc\ncomment — over 100 columns and carrying a REQ ref in the short help.\nDetail moved to long_help, which `--help` still shows.\n\nImplements: REQ-334",
          "timestamp": "2026-09-15T20:07:52+02:00",
          "tree_id": "c2b6ee576c3772ae6b49903a9219bf1204a11a06",
          "url": "https://github.com/pulseengine/rivet/commit/8e4cbf4069133b1f469f4a16c0955809800594e8"
        },
        "date": 1789496451704,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84752,
            "range": "± 319",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901942,
            "range": "± 3639",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13141859,
            "range": "± 421264",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 72",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26783,
            "range": "± 449",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370257,
            "range": "± 8805",
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
            "value": 1510346,
            "range": "± 28461",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165191,
            "range": "± 1938",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1958103,
            "range": "± 20984",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25132151,
            "range": "± 1101798",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 515667,
            "range": "± 2861",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16969313,
            "range": "± 501007",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1362692372,
            "range": "± 12335356",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4524,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64332,
            "range": "± 832",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 899853,
            "range": "± 21092",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57496,
            "range": "± 320",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 690970,
            "range": "± 2443",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7635397,
            "range": "± 174614",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1182,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14993,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 334857,
            "range": "± 3202",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22948,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161910,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1521415,
            "range": "± 9740",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "48df5f7980d7d944c018dbc40f60f1995abde4ec",
          "message": "ci(compliance): gate the release on rivet validate's exit code (#953) (#961)\n\nThe Validate step of `.github/actions/compliance/action.yml` captured\n`rivet validate`'s exit code as `RC` and then never used it, and derived\n`result=PASS|FAIL` by grepping the tool's stdout for \"Result: PASS\".\nThe step's last command was `echo`, so it always exited 0 — a failing\nvalidate produced a green step, `build-compliance` succeeded, and\n`create-release` (which depends on `build-compliance` in release.yml)\nshipped a GitHub Release on a corpus that failed validation. A validate\npanic that printed nothing was the worst shape: no \"Result:\" line at\nall, `result=FAIL`, and still a green step.\n\nFix by extracting the logic to `run_validate.sh` and treating validate's\nexit code as the source of truth:\n  * echoes validate's captured output verbatim (CI log unchanged);\n  * writes `result=PASS` when rc == 0, `result=FAIL` otherwise;\n  * exits with the same rc, so a red validate now fails the step, fails\n    the `build-compliance` job, and blocks `create-release`.\n\n`run_validate_test.sh` covers the two fall-through shapes the previous\ncode allowed: an rc=1 exit whose stdout still contains \"Result: PASS\"\nelsewhere (grep-stdout false-green), and a silent panic with empty\noutput (last-command-is-echo false-green). Both now propagate correctly.\nThe test is wired into the `yaml-lint` job in ci.yml next to the sibling\n#671 size-guard test.\n\nThe `verify_archive_size.sh` missing-floor concern the issue also names\nis out of scope for this PR — the report ceiling and floor are related\nbut independent gates.\n\nCloses #953\n\n\nClaude-Session: https://claude.ai/code/session_01Euv8H5osPN4nf6jGBGwRdQ\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-09-16T18:48:03+02:00",
          "tree_id": "3835bda10359889a21aad8235d6530ef35e4a167",
          "url": "https://github.com/pulseengine/rivet/commit/48df5f7980d7d944c018dbc40f60f1995abde4ec"
        },
        "date": 1789578830812,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84424,
            "range": "± 1564",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893803,
            "range": "± 5449",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13708289,
            "range": "± 702313",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25367,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364594,
            "range": "± 2430",
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
            "value": 1529367,
            "range": "± 24553",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164119,
            "range": "± 2829",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1957241,
            "range": "± 6688",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29334762,
            "range": "± 2434450",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 502715,
            "range": "± 4734",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16194992,
            "range": "± 402343",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1263131214,
            "range": "± 13001603",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4449,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60480,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 811377,
            "range": "± 55562",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59340,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705727,
            "range": "± 3168",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7881400,
            "range": "± 301095",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1035,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14339,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339046,
            "range": "± 5516",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23404,
            "range": "± 70",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158939,
            "range": "± 1881",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1480983,
            "range": "± 19132",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "13f00ccfa3bf233203ec47235ec35e31cb9e191e",
          "message": "fix(yaml): preserve an artifact's top-level domain keys instead of silently dropping them (REQ-362) (#964)\n\nA generic-yaml artifact that wrote domain keys at the top level instead\nof under `fields:` lost them silently on load (REQ-277's category,\npriority and upstream-ref). They are now preserved into fields, and the\ncanonical `fields:` entry wins on collision. Refusing unknown keys\ninstead broke the spar external (0 artifacts loaded), so preservation\nis the fix. The differential gate's pin drops to the one remaining\ndivergence, DD-039 (REQ-363).\n\nImplements: REQ-362\nRefs: REQ-348, REQ-363\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-17T00:52:57+02:00",
          "tree_id": "c5821e7b24538044eac4cb466db30f7e8633dfa9",
          "url": "https://github.com/pulseengine/rivet/commit/13f00ccfa3bf233203ec47235ec35e31cb9e191e"
        },
        "date": 1789608296493,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68621,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 734117,
            "range": "± 4732",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13341132,
            "range": "± 1110021",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1504,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18113,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 257182,
            "range": "± 4113",
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
            "value": 1180200,
            "range": "± 16586",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126598,
            "range": "± 1036",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1478247,
            "range": "± 9180",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28151120,
            "range": "± 2035675",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 359496,
            "range": "± 1481",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12808819,
            "range": "± 175361",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 943111233,
            "range": "± 13670273",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3197,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33757,
            "range": "± 351",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 584406,
            "range": "± 2701",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45822,
            "range": "± 163",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 507274,
            "range": "± 2997",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6049675,
            "range": "± 299756",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 842,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11667,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 171840,
            "range": "± 552",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16742,
            "range": "± 155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112280,
            "range": "± 404",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1050484,
            "range": "± 40195",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "218a950864742ec08454c56adf9f12fb0d8fef62",
          "message": "fix(yaml): multi-line plain scalars were truncated at their first line on the rowan read path (REQ-363) (#970)\n\nDD-039's multi-line plain scalar was truncated at its first line by the\nrowan read path. The CST now keeps continuation lines, including across\nblank and whitespace-only lines, and the HIR folds them (YAML 1.2 7.3.3,\nas PyYAML does). With REQ-362 on main the corpus differential gate\nagrees 26 of 26, and KNOWN_DIVERGENCES is 0. PR-diff mutation testing\nfound four surviving mutants. Three are now caught by new tests, and\nthe fourth was an equivalent guard that has been removed. REQ-363 moves\nfrom v0.39.0 to v0.38.0, since it is a precondition of REQ-346.\n\nFixes: REQ-363\nVerifies: REQ-363\nRefs: REQ-346, REQ-348\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-17T19:30:23+02:00",
          "tree_id": "22ee72ac6febf40795ff906ae64eaf004b902db3",
          "url": "https://github.com/pulseengine/rivet/commit/218a950864742ec08454c56adf9f12fb0d8fef62"
        },
        "date": 1789667322885,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 79204,
            "range": "± 854",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 926621,
            "range": "± 13387",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14001787,
            "range": "± 543226",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1547,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18110,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 263164,
            "range": "± 2364",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 79,
            "range": "± 1",
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
            "value": 79,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1400306,
            "range": "± 8788",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161186,
            "range": "± 591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1829220,
            "range": "± 65317",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34546853,
            "range": "± 1591222",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 447831,
            "range": "± 2762",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16729284,
            "range": "± 130819",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1206125916,
            "range": "± 4225846",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3750,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41524,
            "range": "± 292",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 827850,
            "range": "± 4578",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54385,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 561403,
            "range": "± 4413",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7877198,
            "range": "± 366564",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 937,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11391,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 278183,
            "range": "± 1961",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20664,
            "range": "± 664",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 141577,
            "range": "± 852",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1294386,
            "range": "± 9344",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f16245a723cfc3aa454a0c05f2e1c3a636cec24f",
          "message": "feat(yaml): add the rivet-yaml crate — rivet's own YAML value model (REQ-346 step 1) (#967)\n\nStep 1 of taking YAML reading and writing in-house. The crate ports\nserde_yaml 0.9.34's value model (Value, Mapping, Number, Tagged, the\nValue Serializer/Deserializer, from_value/to_value, indexing and\napply_merge) as safe Rust under #![forbid(unsafe_code)]. from_str and\nto_string still hand off to serde_yaml; later steps replace that\nhand-off with rivet's own CST-backed parser and emitter. Nothing in\nrivet-core or rivet-cli uses the crate yet; the rename that routes them\nthrough it is a separate, regenerated change.\n\nThe port is held to upstream's own specification rather than to new\ntests written for it:\n\n- upstream tests/test_value.rs is ported as tests/value.rs (6 tests),\n  changed only in paths, dedented indoc literals and derive imports;\n- the 74 upstream doctests run against rivet_yaml. As first ported they\n  still said serde_yaml:: and so exercised serde_yaml itself while\n  passing; the doc paths are now rivet_yaml::.\n\nNegative controls, each restored afterwards: making Value::as_str\nreturn None fails 6 doctests; making apply_merge a no-op fails\ntest_merge and only test_merge.\n\nBefore splitting, the rename was A/B-tested on this tree against a\nmain (2cc6fe4) binary. Every read and write path compared was\nbyte-identical: list --full (1077 artifacts), validate, coverage,\nstats, schema list, generic-yaml export, and add / modify / link /\nbatch (every scalar and collection shape) / shard / lock /\nschema migrate --apply over a copy of the repository. That evidence\ntravels with the rename PR.\n\nAttribution and the list of changes from upstream are in\nrivet-yaml/NOTICE.\n\nConfirmed locally with cargo check --workspace --all-targets --locked,\nclippy --all-targets -D warnings on 1.97.0, fmt --check, cargo test -p\nrivet-yaml, rivet validate, rivet docs check and yamllint, all exit 0.\nMSRV 1.89 is not installed on this machine and is left to CI.\n\nImplements: REQ-346\n\n\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9\n\nCo-authored-by: Claude Opus 5 <noreply@anthropic.com>",
          "timestamp": "2026-09-17T20:24:37+02:00",
          "tree_id": "7f68cfd55903902274ebf64a19f0a4adac7fce31",
          "url": "https://github.com/pulseengine/rivet/commit/f16245a723cfc3aa454a0c05f2e1c3a636cec24f"
        },
        "date": 1789670265950,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 80595,
            "range": "± 667",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 958742,
            "range": "± 4628",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12844170,
            "range": "± 331034",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1606,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19373,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 289329,
            "range": "± 1813",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 76,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1436208,
            "range": "± 15533",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168225,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1879923,
            "range": "± 21138",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35720434,
            "range": "± 1323333",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465652,
            "range": "± 6928",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17067234,
            "range": "± 123906",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1240078044,
            "range": "± 4127822",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3892,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41490,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 892328,
            "range": "± 12549",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54559,
            "range": "± 366",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 581112,
            "range": "± 7534",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7291375,
            "range": "± 149125",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 910,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11672,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 279954,
            "range": "± 2547",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21255,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145049,
            "range": "± 1068",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1331679,
            "range": "± 14939",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "bf9d15b9373e4ff592d17c806253522e7f01f96a",
          "message": "fix(validate): prose-mention regex must match multi-segment ids whole (#972) (#974)\n\nID_MENTION_RE only allowed a single-segment prefix, so in a project with\nboth TR-001 and CM-TR-001 a prose mention of CM-TR-001 matched the SUFFIX\nTR-001 and told the author to link the unrelated requirement, while the\nmulti-segment id itself went undetected.\n\nFixes: REQ-004\nRefs: #972\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-23T06:33:54+02:00",
          "tree_id": "4c60a2790ba8ea4f8475d9da849a72b911152b29",
          "url": "https://github.com/pulseengine/rivet/commit/bf9d15b9373e4ff592d17c806253522e7f01f96a"
        },
        "date": 1790138903067,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78593,
            "range": "± 640",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 953806,
            "range": "± 55997",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15462633,
            "range": "± 985224",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1717,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19421,
            "range": "± 250",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 344387,
            "range": "± 1373",
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
            "value": 1420860,
            "range": "± 22277",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161734,
            "range": "± 768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1941515,
            "range": "± 16026",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42500240,
            "range": "± 2789740",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 466278,
            "range": "± 6353",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17750467,
            "range": "± 287397",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1171131967,
            "range": "± 3284360",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4005,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41655,
            "range": "± 416",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747839,
            "range": "± 3879",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 51617,
            "range": "± 780",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 582903,
            "range": "± 4000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10111240,
            "range": "± 407081",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 857,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11691,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 289100,
            "range": "± 1363",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20761,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145190,
            "range": "± 341",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1359760,
            "range": "± 6736",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "29302a9172048bc688f75447d6eb9ac725d8fd4a",
          "message": "plan(v0.39): file the three untracked defects (issues 965, 955, 968) (#987)\n\nTwelve open issues carried no artifact, so no readiness query could see them. REQ-366 (modify --where selects read-only externals and is not atomic: 11 files rewritten before it exits 1), REQ-367 (rivet batch has no rollback and zero tests), REQ-368 (the semver gate ran 0 of 254 checks; fixed in v0.38.0 but untracked). All scoped v0.39.0 with rivet release move.\n\nBoth atomicity records state acceptance as a byte-identical tree after a failed mutation, compared as a tree rather than by exit code.\n\nRefs: REQ-250\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-23T20:05:48+02:00",
          "tree_id": "d5e0f50f41c4e12b8c68f023ba203b1d05fe522d",
          "url": "https://github.com/pulseengine/rivet/commit/29302a9172048bc688f75447d6eb9ac725d8fd4a"
        },
        "date": 1790189476979,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86339,
            "range": "± 3288",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898153,
            "range": "± 5794",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15739098,
            "range": "± 1260392",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2139,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26369,
            "range": "± 1114",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386981,
            "range": "± 2342",
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
            "value": 1516862,
            "range": "± 28019",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163419,
            "range": "± 1052",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1959281,
            "range": "± 14350",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34916823,
            "range": "± 3042352",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463136,
            "range": "± 3434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15778641,
            "range": "± 460230",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1263321739,
            "range": "± 11646470",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4473,
            "range": "± 354",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63031,
            "range": "± 1005",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 826120,
            "range": "± 14121",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60881,
            "range": "± 398",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689523,
            "range": "± 37610",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9238757,
            "range": "± 602289",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1093,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13994,
            "range": "± 393",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322077,
            "range": "± 6120",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23170,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159141,
            "range": "± 4862",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498630,
            "range": "± 38090",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "cd27062617eeadcf405aa053e9b682cca1201dc3",
          "message": "ci(kani): run the suite once on push, and give it a budget it can finish in (#839) (#989)\n\nThe action's final step is `${{ inputs.command }} ${{ inputs.args }}`, so the push path — which passed no args — ran cargo-kani over the whole workspace inside the action, and the job then ran cargo kani -p rivet-core again. The first invocation alone exhausted the budget; both main pushes on 2026-09-23 were cancelled at exactly 45:00 with no proof starting.\n\nNow one invocation scoped to rivet-core, and 90 minutes for the 27-harness suite. Not cached deliberately: install measured ~3s plus ~12s setup, against a 7-minute compile.\n\nRefs: REQ-267\n\nCo-Authored-By: Claude Opus 5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-23T21:12:47+02:00",
          "tree_id": "8b400fd517a7827a0bfe66be68da056416889807",
          "url": "https://github.com/pulseengine/rivet/commit/cd27062617eeadcf405aa053e9b682cca1201dc3"
        },
        "date": 1790195302719,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85127,
            "range": "± 1771",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910744,
            "range": "± 30124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19184393,
            "range": "± 1033176",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1923,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24420,
            "range": "± 594",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351203,
            "range": "± 3947",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
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
            "value": 1536517,
            "range": "± 10213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163874,
            "range": "± 2667",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920849,
            "range": "± 35390",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29734241,
            "range": "± 7612735",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461459,
            "range": "± 2141",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14692242,
            "range": "± 100821",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1058107289,
            "range": "± 16176016",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4246,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47009,
            "range": "± 516",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741845,
            "range": "± 5226",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60119,
            "range": "± 389",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725890,
            "range": "± 3088",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8039766,
            "range": "± 55302",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1289,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15149,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 248745,
            "range": "± 1979",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21358,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145741,
            "range": "± 656",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1351594,
            "range": "± 19280",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "4de6e01897fc6b793ba31e5d5f42d838bf9ea104",
          "message": "feat(ordeal-certificate): consume ordeal TR-038 SAT witness — downgrade V-ordeal-cert-sat-is-self-checked (#991)\n\nFollows the recheck-gates-verifies shape UNSAT already uses: `witness-sha256`\n(envelope `witness.assignment_sha256`) plus `verification-result: pass`. No new\nrecord kind; composes with `V-ordeal-cert-recheck-gates-verifies` rather than\nbypassing it. The honest boundary moves from \"SAT verdict\" to \"SAT bundle\nwithout a re-checked witness\"; the warning still fires for SAT bundles that\ncarry no witness.\n\nCloses #988.\n\nRefs: REQ-277",
          "timestamp": "2026-09-24T07:36:24+02:00",
          "tree_id": "a58e87ef0938a3fa99fe0be18c1c1bd9ac4de079",
          "url": "https://github.com/pulseengine/rivet/commit/4de6e01897fc6b793ba31e5d5f42d838bf9ea104"
        },
        "date": 1790228981094,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87050,
            "range": "± 5465",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 909104,
            "range": "± 19807",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14663235,
            "range": "± 911093",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2165,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25564,
            "range": "± 1083",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369310,
            "range": "± 2106",
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
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1517052,
            "range": "± 32743",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163779,
            "range": "± 1449",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1938993,
            "range": "± 16500",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33461385,
            "range": "± 3300584",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 498186,
            "range": "± 3457",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16289566,
            "range": "± 166121",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1290745302,
            "range": "± 19392605",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4522,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 65760,
            "range": "± 703",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 861326,
            "range": "± 19870",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60042,
            "range": "± 1634",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701113,
            "range": "± 5032",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10184455,
            "range": "± 2111342",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1113,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14356,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330404,
            "range": "± 8046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22493,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158961,
            "range": "± 2981",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1490189,
            "range": "± 12581",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ce820fb64d47a36619ecb5318d0052e69dfcd820",
          "message": "release information: publish the generated 11-03 note, and let SQL see `release` (#994)\n\nTwo maintainer-raised gaps in release information, plus the verification of a\nthird.\n\nREQ-372 — `rivet sql` projected every artifact field EXCEPT `release`, so\n`select release, count(*) ... group by release` failed with `identifier not\nfound`. There was no workaround: `release` is a first-class field, not an entry\nin `fields`, so neither `fields_json` nor the `fields` EAV table could reach it.\n\nREQ-373 — every SQL cell crossed `SqlResult.rows: Vec<Vec<String>>`, so\n`COUNT(*)` reached `--format json` as the string \"2\" and `jq 'map(.n) | add'`\nfailed on rivet's own machine-readable output. Cells are now typed; NULL is\n`null` rather than `\"\"`, so a consumer can tell \"no release\" from \"release is\nempty\". `table` and `csv` stringify at the edge, where that is correct.\n\nREQ-369 — REQ-327 generated an ASPICE 11-03 release note and nothing published\nit; the release body was a flat pull-request list. The note is now generated in\nCI at the tag, collected BEFORE the checksum step so cosign's signature over\nSHA256SUMS covers it, and used as the release body with GitHub's generated list\nappended. The body is composed explicitly rather than by combining\n`--notes-file` with `--generate-notes`, an interaction gh does not document,\nand is then READ BACK with the job failing if the note is absent. Because\nrelease.yml fires only on tag push, the logic lives in a sourceable script with\nits own oracle run by CI — otherwise it would have shipped never having\nexecuted.\n\nREQ-368 is verified here by measurement: `--baseline-rev origin/main` runs\n\"196 checks: 196 pass\", the pre-fix form runs \"0 checks: 0 pass, 254 skip\" —\nboth exiting 0. Recorded alongside it is the boundary that a green Semver\nChecks is NOT \"no breaking change\": cargo-semver-checks has no lint for a\npublic field whose type changed, proven on this PR's own `SqlResult` change.\n\nAlso scopes v0.39.0/v0.40.0/v0.41.0 honestly, moving twelve artifacts that\ncould not reach verified, and files REQ-371, REQ-373 and REQ-374.\n\nImplements: REQ-369, REQ-372, REQ-373\nVerifies: REQ-368, REQ-369, REQ-372, REQ-373\nRefs: REQ-327, REQ-345, REQ-371, REQ-374",
          "timestamp": "2026-09-24T16:16:12+02:00",
          "tree_id": "ad2666cc9ae802164a1aef44bf3f89f3624dd613",
          "url": "https://github.com/pulseengine/rivet/commit/ce820fb64d47a36619ecb5318d0052e69dfcd820"
        },
        "date": 1790260143366,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84885,
            "range": "± 2628",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901977,
            "range": "± 4982",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14065369,
            "range": "± 785850",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2145,
            "range": "± 32",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27062,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 354928,
            "range": "± 1509",
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
            "value": 1512625,
            "range": "± 18297",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160861,
            "range": "± 682",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1962261,
            "range": "± 11620",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25528617,
            "range": "± 1327724",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 504503,
            "range": "± 4223",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16622287,
            "range": "± 126262",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1316087571,
            "range": "± 8447270",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4517,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62040,
            "range": "± 264",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 840083,
            "range": "± 3405",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62472,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698104,
            "range": "± 2958",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7746163,
            "range": "± 576479",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1157,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14249,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328864,
            "range": "± 2104",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22853,
            "range": "± 118",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159430,
            "range": "± 753",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486200,
            "range": "± 10672",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "83231d58dad93b092542c797c143f90ad4cd1d66",
          "message": "feat(compliance): put the generated 11-03 release note in the audit bundle (REQ-371) (#999)\n\nThe compliance bundle is the audit deliverable and carried no release note, so\nan assessor handed it alone got no Automotive SPICE 11-03 item. The action\ngains an `extra-files` input and release.yml passes it the SAME generated note\nthat ships as the signed release asset, so the two copies cannot disagree. A\nnamed entry that does not exist fails rather than being skipped. The copy logic\nlives in a script with its own oracle, since the action only runs on a tag.\n\nImplements: REQ-371\nVerifies: REQ-371",
          "timestamp": "2026-09-25T07:24:57+02:00",
          "tree_id": "85ab104bca40eedcebc72182520abd972cfe906b",
          "url": "https://github.com/pulseengine/rivet/commit/83231d58dad93b092542c797c143f90ad4cd1d66"
        },
        "date": 1790314686543,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84382,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 919073,
            "range": "± 11047",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17990184,
            "range": "± 1428435",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1906,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24374,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 344934,
            "range": "± 1784",
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
            "value": 95,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 95,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1547403,
            "range": "± 24166",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167503,
            "range": "± 995",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1978845,
            "range": "± 52415",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36525770,
            "range": "± 6510853",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 477642,
            "range": "± 1653",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17450145,
            "range": "± 304509",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1243388577,
            "range": "± 18731229",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4257,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44211,
            "range": "± 161",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760129,
            "range": "± 16503",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61251,
            "range": "± 831",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 754592,
            "range": "± 6762",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9300563,
            "range": "± 1224867",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1263,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14213,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 234752,
            "range": "± 1989",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21567,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146041,
            "range": "± 625",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1363458,
            "range": "± 20979",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "32fc25d53bf22e2d56c307b70b9e7c2e13e27c2a",
          "message": "plan(v0.39): the three assessments — OKF, autoformalization, supply-chain bridge (#1000)\n\nREQ-340, REQ-341 and REQ-344 close by recorded decision, each read from source\nand each accepted by the maintainer with reviewed-by rather than by the tool.\n\n- OKF (#549): acknowledge. Five of the nine constructs that make a rivet trace\n  checkable have no OKF representation. DD-078.\n- Autoformalization to Lean (#508): a bounded, pre-registered spike (REQ-380),\n  chosen by the maintainer over the recommendation to acknowledge. The lead's\n  premise that rivet is pre-grounded is false on rivet's corpus; two of its\n  four citations are not in their sources. DD-080.\n- Supply-chain bridge (#107): split. The SBOM/attestation half folds into the\n  release record (REQ-374); the AIBOM half is REQ-379. DD-079.\n\nAlso files REQ-378 (62 of 67 UCAs reference a control action that resolves to\nnothing) and REQ-379.\n\nRefs: REQ-340, REQ-341, REQ-344, REQ-374, REQ-378, REQ-379, REQ-380",
          "timestamp": "2026-09-25T07:34:45+02:00",
          "tree_id": "c871fa862ab4542f88917fc9b9add905bddaf81b",
          "url": "https://github.com/pulseengine/rivet/commit/32fc25d53bf22e2d56c307b70b9e7c2e13e27c2a"
        },
        "date": 1790315306200,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84912,
            "range": "± 683",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894200,
            "range": "± 4662",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13707774,
            "range": "± 543005",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2122,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26330,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370820,
            "range": "± 2981",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 4",
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
            "value": 1524946,
            "range": "± 30597",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164644,
            "range": "± 1236",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1949985,
            "range": "± 18554",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27119680,
            "range": "± 783147",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 490923,
            "range": "± 3372",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17165933,
            "range": "± 125446",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1368360427,
            "range": "± 10943222",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4564,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63452,
            "range": "± 2051",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 863909,
            "range": "± 12542",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62342,
            "range": "± 267",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 691449,
            "range": "± 5557",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8354123,
            "range": "± 651425",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1078,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14552,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 341161,
            "range": "± 2109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23539,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 166286,
            "range": "± 1373",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1546382,
            "range": "± 22855",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3554f468335c9229033d9262fcb4abe22dec4232",
          "message": "fix(docs): no help text may point at a docs topic that does not exist (REQ-382) (#1004)\n\nCloses #1002, fixed as a class. Two help pointers led to docs topics that did\nnot exist, and an unknown topic exited 0 so nothing could notice.\ndocs/release-status.md is embedded, the dead pointer is corrected, an unknown\ntopic exits 1, and a test requires every `rivet docs <topic>` pointer in the\nhelp text and embedded topics to resolve.\n\nImplements: REQ-382\nVerifies: REQ-382",
          "timestamp": "2026-09-25T13:54:39+02:00",
          "tree_id": "bc8ee1b00c55f20d9dc28ce4fc22ab5f6c324389",
          "url": "https://github.com/pulseengine/rivet/commit/3554f468335c9229033d9262fcb4abe22dec4232"
        },
        "date": 1790338423548,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 57803,
            "range": "± 2176",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 688811,
            "range": "± 13269",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9808117,
            "range": "± 449615",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1171,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13923,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 334707,
            "range": "± 3741",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 53,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 57,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 57,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1026367,
            "range": "± 51905",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 116558,
            "range": "± 3135",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1392852,
            "range": "± 60273",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30647776,
            "range": "± 2418358",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 303265,
            "range": "± 10653",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10210383,
            "range": "± 735923",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 691431790,
            "range": "± 21953980",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2721,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 30087,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 707744,
            "range": "± 40470",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 40119,
            "range": "± 444",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 417306,
            "range": "± 11234",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5564908,
            "range": "± 143836",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 589,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7895,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 255947,
            "range": "± 13940",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14656,
            "range": "± 756",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 103220,
            "range": "± 7907",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 945353,
            "range": "± 10058",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "da945d30f319875678a94434557dcb83325ce6d2",
          "message": "feat(release): judge evidence by each type's schema rules; add require: evidence (REQ-383, REQ-384) (#1005)\n\nImplements: REQ-383, REQ-384\nVerifies: REQ-383, REQ-384\nRefs: DD-081\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-29T20:44:48+02:00",
          "tree_id": "15e7c53c1cef4d38294f122120faf7723d172648",
          "url": "https://github.com/pulseengine/rivet/commit/da945d30f319875678a94434557dcb83325ce6d2"
        },
        "date": 1790708250629,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86528,
            "range": "± 2448",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922705,
            "range": "± 49106",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19347579,
            "range": "± 1061848",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1959,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22936,
            "range": "± 562",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 348430,
            "range": "± 3746",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 98,
            "range": "± 3",
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
            "value": 1558524,
            "range": "± 12275",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166596,
            "range": "± 533",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1909413,
            "range": "± 33104",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 41494786,
            "range": "± 3570579",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479001,
            "range": "± 1446",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16833383,
            "range": "± 814390",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1245753140,
            "range": "± 17165022",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4305,
            "range": "± 168",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46348,
            "range": "± 448",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 814431,
            "range": "± 8490",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61501,
            "range": "± 1114",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 733519,
            "range": "± 9029",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9034143,
            "range": "± 267631",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1171,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14534,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 244197,
            "range": "± 3062",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21438,
            "range": "± 368",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145872,
            "range": "± 2803",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1351979,
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
          "id": "21242f8f44ffc081c0121c8d030948cba0931ab1",
          "message": "test(schema, sexpr): kill the scheduled run's surviving mutants (REQ-386) (#1013)\n\nVerifies: REQ-386\nRefs: #1009\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T06:12:16+02:00",
          "tree_id": "4348b9142b40b836dd2d9a721d3885bb08d8353d",
          "url": "https://github.com/pulseengine/rivet/commit/21242f8f44ffc081c0121c8d030948cba0931ab1"
        },
        "date": 1790742308506,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84849,
            "range": "± 421",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 913367,
            "range": "± 4038",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14136691,
            "range": "± 820957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2228,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25483,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353159,
            "range": "± 1722",
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
            "value": 96,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1519365,
            "range": "± 26772",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 148147,
            "range": "± 1713",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1779707,
            "range": "± 22078",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27409638,
            "range": "± 1721138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 508912,
            "range": "± 3487",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17262630,
            "range": "± 204600",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1379036894,
            "range": "± 12534287",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4314,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58355,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757732,
            "range": "± 30656",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59992,
            "range": "± 2810",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678557,
            "range": "± 2351",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7812512,
            "range": "± 264968",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1150,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14471,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 332237,
            "range": "± 2109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22751,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159358,
            "range": "± 587",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1511378,
            "range": "± 25645",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f9789670db2dd1cef59ec73f1b1b4e5d83572f6e",
          "message": "fix(externals): an unprefixed link target never crosses a project boundary (REQ-395) (#1017)\n\nFixes: REQ-395\nVerifies: REQ-395\nRefs: #1015\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T08:30:30+02:00",
          "tree_id": "2d71d32218f8abdc907f9027f0ad585a85e0a09b",
          "url": "https://github.com/pulseengine/rivet/commit/f9789670db2dd1cef59ec73f1b1b4e5d83572f6e"
        },
        "date": 1790752877875,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87399,
            "range": "± 1644",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 905710,
            "range": "± 12051",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14030643,
            "range": "± 653950",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2112,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25586,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370984,
            "range": "± 3639",
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
            "range": "± 3",
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
            "value": 1522099,
            "range": "± 25672",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 146288,
            "range": "± 779",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1785118,
            "range": "± 18374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26960913,
            "range": "± 3968603",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 501859,
            "range": "± 3581",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17457540,
            "range": "± 320376",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1413153221,
            "range": "± 12021169",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4467,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59619,
            "range": "± 414",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 860041,
            "range": "± 13494",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61618,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707493,
            "range": "± 3808",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8631486,
            "range": "± 1023801",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1119,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14716,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 322682,
            "range": "± 2964",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24027,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164546,
            "range": "± 1047",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1481936,
            "range": "± 25538",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5716232227a03eb26de7e5de1f385fef12119a94",
          "message": "fix(consistency): five surfaces that disagreed about the same fact (REQ-387, #956 items 4-8) (#1014)\n\nImplements: REQ-387\nVerifies: REQ-387\nRefs: #956\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T10:49:30+02:00",
          "tree_id": "74ce31e6b4116ca8b338a69bd75aa9f5d015486f",
          "url": "https://github.com/pulseengine/rivet/commit/5716232227a03eb26de7e5de1f385fef12119a94"
        },
        "date": 1790761335748,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84969,
            "range": "± 1106",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 917538,
            "range": "± 28684",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15629619,
            "range": "± 1280397",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2033,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 22670,
            "range": "± 172",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 332740,
            "range": "± 1562",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
            "range": "± 3",
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
            "value": 1526385,
            "range": "± 12039",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159561,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1845870,
            "range": "± 21530",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30039531,
            "range": "± 3037684",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465687,
            "range": "± 11840",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15161750,
            "range": "± 170709",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1099209195,
            "range": "± 18365058",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4298,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47279,
            "range": "± 2032",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 800129,
            "range": "± 9040",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61128,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 740912,
            "range": "± 2962",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11689382,
            "range": "± 360260",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1162,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15687,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 257585,
            "range": "± 1796",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21797,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 150607,
            "range": "± 440",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1399012,
            "range": "± 9522",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c5807373d20f55c2b7239899cfef429fcd0dc990",
          "message": "fix(release): one spar revision per binary; the drift guard can fire (REQ-390) (#1012)\n\nFixes: REQ-390\nVerifies: REQ-390\nRefs: #951\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T12:27:27+02:00",
          "tree_id": "0bc47fd08ce1dd54d1053916ce5aa235793c504c",
          "url": "https://github.com/pulseengine/rivet/commit/c5807373d20f55c2b7239899cfef429fcd0dc990"
        },
        "date": 1790765199955,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 47406,
            "range": "± 2057",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 581633,
            "range": "± 31602",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14168308,
            "range": "± 1341342",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 994,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12478,
            "range": "± 253",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 219385,
            "range": "± 5304",
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
            "value": 47,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 48,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 816355,
            "range": "± 16442",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 104272,
            "range": "± 2383",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1206957,
            "range": "± 33601",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21781648,
            "range": "± 3323350",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 276088,
            "range": "± 9292",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 8144323,
            "range": "± 93372",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 544534277,
            "range": "± 10009450",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2610,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 27073,
            "range": "± 543",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 434465,
            "range": "± 8420",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 36696,
            "range": "± 242",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 389946,
            "range": "± 11135",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4608697,
            "range": "± 287940",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 501,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7249,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 123234,
            "range": "± 6829",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12363,
            "range": "± 569",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 82282,
            "range": "± 2399",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 779286,
            "range": "± 63457",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d2c7c372274cd9b4925e92f92224ce4e97f237dd",
          "message": "fix(schema): the AI review gate can fire; docs that described absent behaviour (REQ-388, #958 items 5-7) (#1016)\n\nFixes: REQ-388\nVerifies: REQ-388\nRefs: #958\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-09-30T13:35:22+02:00",
          "tree_id": "29d88f0883f18ef9f936c7502084e475bf225b87",
          "url": "https://github.com/pulseengine/rivet/commit/d2c7c372274cd9b4925e92f92224ce4e97f237dd"
        },
        "date": 1790771203655,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84919,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 894020,
            "range": "± 7033",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12998695,
            "range": "± 636331",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2149,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27535,
            "range": "± 3900",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367390,
            "range": "± 1267",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 96,
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
            "value": 1534600,
            "range": "± 14954",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159993,
            "range": "± 1180",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931161,
            "range": "± 8316",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24773408,
            "range": "± 1563623",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 585377,
            "range": "± 3398",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16118664,
            "range": "± 132255",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1273329985,
            "range": "± 10443143",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4413,
            "range": "± 27",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63482,
            "range": "± 290",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 787858,
            "range": "± 6799",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61300,
            "range": "± 312",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 695099,
            "range": "± 5321",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7659528,
            "range": "± 249548",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1078,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14075,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318538,
            "range": "± 1213",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23203,
            "range": "± 298",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158805,
            "range": "± 1900",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1468245,
            "range": "± 27839",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "5a6ef70293a1fe1c1033a860e136d0ca9cb7bc24",
          "message": "chore(release): v0.40.0 (#1023)\n\nRefs: DD-082, REQ-386, REQ-399\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-01T09:28:22+02:00",
          "tree_id": "a653ac33210523ba59cf733486b899c0afde867b",
          "url": "https://github.com/pulseengine/rivet/commit/5a6ef70293a1fe1c1033a860e136d0ca9cb7bc24"
        },
        "date": 1790843985529,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84515,
            "range": "± 583",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882146,
            "range": "± 4774",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12817629,
            "range": "± 483271",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2113,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25598,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374271,
            "range": "± 1539",
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
            "value": 1512451,
            "range": "± 21173",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160224,
            "range": "± 2495",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1911573,
            "range": "± 16830",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28627331,
            "range": "± 3076668",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 591968,
            "range": "± 4958",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17334566,
            "range": "± 538386",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1383557188,
            "range": "± 14385973",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4418,
            "range": "± 166",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62492,
            "range": "± 280",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 880531,
            "range": "± 17267",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56908,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692449,
            "range": "± 2845",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7529364,
            "range": "± 240756",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1265,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14204,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 312850,
            "range": "± 3722",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22517,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155959,
            "range": "± 1218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1466980,
            "range": "± 13723",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e439acfa045cd6a5864f778284823e0cc66e7320",
          "message": "fix(yaml): use i64::MAX; Rust 1.99 deprecates max_value() (#1029)\n\nRefs: REQ-028\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-01T16:50:44+02:00",
          "tree_id": "492f8dcc3a29d2df3a53c1ed070f0a716b83616b",
          "url": "https://github.com/pulseengine/rivet/commit/e439acfa045cd6a5864f778284823e0cc66e7320"
        },
        "date": 1790866896396,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68593,
            "range": "± 395",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 736742,
            "range": "± 5745",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18799111,
            "range": "± 1699957",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1467,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17901,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 256316,
            "range": "± 2020",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 76,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 76,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 76,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1177760,
            "range": "± 20789",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127570,
            "range": "± 258",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1501276,
            "range": "± 13982",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 43728372,
            "range": "± 3420193",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 436704,
            "range": "± 2586",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13598519,
            "range": "± 159719",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 961239558,
            "range": "± 10683866",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3289,
            "range": "± 37",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35770,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 556904,
            "range": "± 3635",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46373,
            "range": "± 877",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 531286,
            "range": "± 11385",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8499832,
            "range": "± 541400",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 798,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12425,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 176519,
            "range": "± 16466",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16464,
            "range": "± 513",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112999,
            "range": "± 808",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1049635,
            "range": "± 36153",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6e72dd7866cdfe0a2dcb36603f00e2143e54c6d4",
          "message": "feat(release): Open VSX publishes by trusted publishing, no long-lived token (REQ-397) (#1024)\n\nImplements: REQ-397\n\nCo-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>\nClaude-Session: https://claude.ai/code/session_015HMQUV3u86jN2hmCtXNTc9",
          "timestamp": "2026-10-01T17:33:09+02:00",
          "tree_id": "59f0950676fb507afbfa7edf90368f6df88b4ce3",
          "url": "https://github.com/pulseengine/rivet/commit/6e72dd7866cdfe0a2dcb36603f00e2143e54c6d4"
        },
        "date": 1790871444353,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 50002,
            "range": "± 1138",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 572892,
            "range": "± 13107",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12457332,
            "range": "± 2116640",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1038,
            "range": "± 105",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 12265,
            "range": "± 124",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 206381,
            "range": "± 7179",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 49,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 48,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 49,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 810570,
            "range": "± 12513",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 106641,
            "range": "± 1609",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1265086,
            "range": "± 46282",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24077796,
            "range": "± 4767353",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 337802,
            "range": "± 16894",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 9798177,
            "range": "± 1250110",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 676486086,
            "range": "± 16051414",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2667,
            "range": "± 46",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 27832,
            "range": "± 1019",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 453488,
            "range": "± 26811",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 35352,
            "range": "± 2143",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 372536,
            "range": "± 7350",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 4735956,
            "range": "± 589049",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 507,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7166,
            "range": "± 232",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 127498,
            "range": "± 10933",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 12059,
            "range": "± 240",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 83940,
            "range": "± 3062",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 753947,
            "range": "± 12043",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}