window.BENCHMARK_DATA = {
  "lastUpdate": 1790314688041,
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
          "id": "f8e588c34b075efce97edbfec24092e17e09670e",
          "message": "plan(v0.35): REQ-308 — verify advances on evidence existence, not sufficiency (#838) (#840)\n\nplan(v0.35): REQ-308 — verify advances on evidence existence, not sufficiency (#838)\n\nMaintainer-reported from varve and reproduced in rivet's own v0.34.0 cut the\nsame day, which is why this is filed rather than acknowledged.\n\n`rivet verify REQ-X` refuses correctly when there is NO evidence. When a\n`verifies` marker exists it advances unconditionally, and a marker costs one\ncomment line. The structural issue is granularity: a requirement is a set of\nclauses, a marker attaches to the requirement, so the evidence link is coarser\nthan the claim and the shortfall has no representation. The result is a graph\nthat looks complete, which is worse than one that looks incomplete — readers\nstop reading the requirement text once status reads `verified`.\n\nOur own instance: REQ-298 was flipped to `verified` during the v0.34.0 release\nwith its third clause knowingly undischarged (52 flat top-level commands\nremain), while `coverage --tests` reported \"REQ-298  1 test marker\" —\nindistinguishable from full discharge. The residual was hand-carried into\nREQ-307 plus commit prose, i.e. the reporter's option (3) improvised by hand.\nThe trace graph does not carry that caveat, so the caveat is not traceable,\nwhich is the property the tool exists to provide.\n\nDegenerate variant found the same day: a marker matching nothing reports as\nneither present nor broken. Six such markers used issue numbers where the\nscanner accepts only word characters and hyphens, against 593 valid ones.\n\nRecommended ordering differs from the issue's: option (2), making\n`partially-verifies` BLOCK rather than annotate, should land before option (1).\nIt needs no schema change and converts the common case into a refusal, whereas\nper-clause markers require clauses to become addressable — a migration across\nevery existing artifact. Also flagged that option (3)'s clause indices drift\nwhenever description prose is edited, so the clause text must be recorded\nalongside the index.\n\nRefs: REQ-307, #838",
          "timestamp": "2026-08-21T14:32:12+02:00",
          "tree_id": "272e745f2ca3d3159c27ff18363cd7159b987352",
          "url": "https://github.com/pulseengine/rivet/commit/f8e588c34b075efce97edbfec24092e17e09670e"
        },
        "date": 1787316294725,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83878,
            "range": "± 442",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 934666,
            "range": "± 5685",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15348998,
            "range": "± 1143057",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2142,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26732,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 387919,
            "range": "± 2120",
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
            "value": 1518341,
            "range": "± 41409",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160715,
            "range": "± 1495",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927648,
            "range": "± 13020",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30637456,
            "range": "± 2201055",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 504400,
            "range": "± 1754",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16779840,
            "range": "± 206012",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1315846588,
            "range": "± 11202885",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4446,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60297,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 803830,
            "range": "± 3931",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61799,
            "range": "± 859",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692892,
            "range": "± 6137",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8765880,
            "range": "± 783569",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1142,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14198,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 324134,
            "range": "± 1851",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22790,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165439,
            "range": "± 1957",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1517967,
            "range": "± 24251",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6ab55ac1163193d8e71f0bc20e173129103c9fb3",
          "message": "fix(render): raise the serve/export palette to WCAG AA (REQ-276) (#842)\n\nCustomer-reported low contrast in the dashboard and the static compliance\nexport, which share rivet-cli/src/render/styles.rs.\n\nOracle first: six unit tests compute WCAG 2.1 relative luminance over the\npalette and assert 4.5:1 for body text, 3:1 for large text and UI. They parse\nhex values OUT OF the live CSS constant instead of copying them, so a\nstylesheet edit cannot drift away from its own audit. The suite was red on\nthree pairs before any colour changed -- accent on --bg 3.20:1, accent on\n--surface 3.48:1, white-on-accent 3.48:1 -- matching the values measured when\nthe requirement was triaged.\n\nFix: accent #3a86ff -> #2059b8, accent-hover #2568d6 -> #18458d, hue preserved\nand chosen for headroom rather than the bare minimum (worst pair 5.07:1, not\n4.60:1). 27 translucent rgba washes reshaded to the new rgb so tints match the\ncolour they tint. .stat-orange #e67e22 -> #c66c1d.\n\nThree findings the requirement's own audit did not have:\n\n  1. The reported pair does not occur. No element paints white text on --bg.\n     What a reader actually saw is the white label on the primary button\n     (3.48:1) and every link (3.20:1). Both real, both fixed.\n  2. Accent text sits on rgba(accent,.08/.12) washes in id chips, inline mono\n     tags and source-line highlights. Composited, three of those measured\n     4.08-4.42:1 and failed. A naive fg/bg audit cannot see them because the\n     background is translucent rather than a palette variable, so the test\n     composites alpha.\n  3. .stat-orange measured 2.85:1 on --surface, failing even the 3:1\n     large-text bar.\n\nRemoved the drift class behind (2) and (3) rather than fixing instances: five\nhand-copied hex literals of the accent lived OUTSIDE the CSS -- in stats.rs,\nsource.rs, doc_linkage.rs and serve/layout.rs -- still painting the old blue\nafter the palette moved. styles::ACCENT_HEX is now the source of truth, one\ntest asserts the CSS agrees with it, and a static scan fails if the retired\nvalue reappears anywhere.\n\nThe scan's first version listed only render/ modules and missed\nserve/layout.rs, which was the one file still painting the retired tint under\nnew-accent text. Widened, and the scan is negative-controlled: injecting\n#3a86ff into stats.rs turns it red and names the file; removing it turns it\ngreen.\n\nVerified in rendered output rather than in source alone: `rivet export --format\nhtml` and `rivet serve` both emit --accent #2059b8 with zero retired\nreferences. (One match remains in artifacts/REQ-276.html, where the\nrequirement's own prose quotes the old hex.)\n\nConfirmed with cargo fmt --check, clippy --all-targets -D warnings on 1.97.0,\ncargo test --workspace (exit 0, 65 ok), rivet validate and rivet docs check --\nall exit 0.\n\nImplements: REQ-276\nVerifies: REQ-276",
          "timestamp": "2026-08-22T10:40:41+02:00",
          "tree_id": "d66ecadff4f502d0d87cabb5e3e839b2bad385a5",
          "url": "https://github.com/pulseengine/rivet/commit/6ab55ac1163193d8e71f0bc20e173129103c9fb3"
        },
        "date": 1787388667943,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67629,
            "range": "± 2912",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 738715,
            "range": "± 2984",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13024659,
            "range": "± 1380431",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1473,
            "range": "± 65",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17970,
            "range": "± 661",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 251833,
            "range": "± 12449",
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
            "value": 1167816,
            "range": "± 43304",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126478,
            "range": "± 885",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1486732,
            "range": "± 29512",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30560062,
            "range": "± 1587461",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 356229,
            "range": "± 29454",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11595257,
            "range": "± 127171",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 828365146,
            "range": "± 8650155",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3283,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35250,
            "range": "± 188",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 566762,
            "range": "± 9543",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47909,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 529057,
            "range": "± 2786",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6255974,
            "range": "± 250553",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 859,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11226,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 184013,
            "range": "± 892",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16510,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112486,
            "range": "± 954",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1042829,
            "range": "± 6111",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "36f2cd76edaf3e7793308a7a1a56bb82f3214387",
          "message": "feat(serve,export): render the test-result trace as a fold/expand tree (REQ-274) (#843)\n\nCustomer-reported: deep chains — the ASPICE sw-req <- sw-detail-design <-\nunit-verification shape — rendered as a flat table. REQ-001 produces 40 hops of\nundifferentiated rows.\n\nThe data was already a tree and nobody used it. trace_test_results walks\nbreadth-first with a `seen` set, so every reached artifact has exactly one\nvia_target; it returns that tree flattened. as_tree restores the shape and\nrenders through the existing collapsible_tree component. Native <details> means\nno JavaScript, so one change serves `rivet serve` AND the static export --\nverified identical in both, 3 foldable branches plus 37 leaf lines.\n\nThe load-bearing invariant is that a folded view contains every hop: a branch\nthat silently stops rendering is indistinguishable from one merely collapsed.\ntree_preserves_every_node pins it, negative-controlled (\"tree dropped nodes:\n2 in, 1 out\").\n\nTwo presentation corrections came from looking at real output rather than the\nsynthetic case. Leaves render as plain lines, because a disclosure triangle over\n\"no further hops\" is noise and the first version was no more readable than the\ntable. And a large trace opens nothing by default -- 33 expanded siblings is the\nsame wall -- while a small one still opens its first level.\n\nThe rivet-core mutation gate then found 4 survivors in this code, and acting on\nthem exposed a real defect rather than a test gap: the `depth > 64` guard was\nuntested, and testing it showed it silently dropped the entire subtree past that\ndepth -- the exact node loss the invariant forbids. Replaced with a current-path\nvisited set, so cycles still terminate but a 200-deep chain renders in full. The\npreservation sweep was also generalised: it previously re-homed only\nunknown-parent orphans, so a cycle disconnected from the root still vanished.\n\nKani is red on exit 143, the advisory hosted-runner failure tracked in #839; it\nis not among ci-gate's needs. CI Gate is SUCCESS with 27 checks green.\n\nImplements: REQ-274\nVerifies: REQ-274",
          "timestamp": "2026-08-26T01:12:52+02:00",
          "tree_id": "006e57ef0ad9b57372f99265228a4ac0d06b451e",
          "url": "https://github.com/pulseengine/rivet/commit/36f2cd76edaf3e7793308a7a1a56bb82f3214387"
        },
        "date": 1787707026784,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85093,
            "range": "± 3119",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910997,
            "range": "± 20561",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14369027,
            "range": "± 1567773",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23224,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 339239,
            "range": "± 2202",
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
            "value": 1503224,
            "range": "± 14175",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168807,
            "range": "± 936",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1954695,
            "range": "± 13911",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27123206,
            "range": "± 270550",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 467708,
            "range": "± 2223",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15497080,
            "range": "± 133899",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1107585686,
            "range": "± 19776647",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4452,
            "range": "± 83",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44760,
            "range": "± 141",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 763217,
            "range": "± 7465",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 66436,
            "range": "± 269",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 733283,
            "range": "± 4464",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8336318,
            "range": "± 653417",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1263,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14704,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 245638,
            "range": "± 7948",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21526,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148092,
            "range": "± 1822",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1374328,
            "range": "± 42208",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b2b155cb1ef9f6a10bf311b57e5c675cf2ffa358",
          "message": "fix(coverage): a declared-exempt source leaves the denominator (REQ-309, #848) (#850)\n\nfix(coverage): a declared-exempt source leaves the denominator (REQ-309, #848)\n\nReported from scry's safety case. `rivet coverage` returned a true number that\nwas not measuring what a reader assumes: three goals carrying GSN's\n`undeveloped: true` — the diamond, a deliberate declaration of known\nincompleteness — counted identically to a goal somebody forgot.\n\nThe safety-case schema already PROMISED the exemption. goal-has-support is\ndescribed as \"unless marked undeveloped\", while `undeveloped` appeared in no\nRust file at all. The semantics were documented and unimplemented.\n\nThe figure misled in both directions. False alarm: a project doing the right\nthing scored as if it had drifted, and the natural remedy is to add links until\nthe number goes green — the cosmetic move a coverage gate exists to prevent.\nFalse comfort, the one that bites: a forgotten goal hides among the declared\nones, because three accepted gaps becoming four reads as more of the same.\n\nFix is schema-declared, not a hardcoded field name: a traceability rule may name\na boolean field via `exempt-when-field`, so any schema can express its own\nnotion of a declared, accepted gap. safety-case wires it to `undeveloped` on\ngoal-has-support. An exempt source leaves the denominator AND is reported as its\nown named count with ids — counted, never silently dropped, because a\ndeclaration must stay visible as a declaration. Only an explicit `true` exempts;\n`false` or absent keeps the source in scope, so an exemption is always something\nan author wrote on purpose.\n\nMeasured on a three-goal fixture (one supported, one declared undeveloped, one\nforgotten):\n\n  before   goal-has-support  1/3  33.3%\n  after    goal-has-support  1/2  50.0%  + \"1 declared exempt: G-002\"\n  after, forgotten goal removed\n           goal-has-support  1/1 100.0%  + \"1 declared exempt: G-002\"\n\nSo a forgotten goal now moves the figure 100% -> 50%, where it is loud.\n\nOracle first: the test was written before the implementation and is\nnegative-controlled — disabling the exemption reddens it with \"declared-\nundeveloped goal must leave the denominator\".\n\nDeliberately NOT applied to goal-has-context. `undeveloped` states that a goal\nis not yet decomposed into evidence and says nothing about whether it has\ncontext; exempting that rule too would silently weaken a separate check. Flagged\nfor the reporter rather than assumed.\n\nNot done here: the reporter's `--fail-under` policy ask (exemptions allowed in\ndevelopment, blocking for a qualification claim, since an undeveloped ASIL D\ngoal is fine in-flight and is a release blocker for certification).\n\nrivet's own coverage is unchanged — no artifact here carries `undeveloped`.\n\nConfirmed with cargo fmt --check, clippy --all-targets -D warnings on 1.97.0,\ncargo test --workspace (exit 0, 65 ok), rivet validate, rivet docs check — all\nexit 0.\n\nImplements: REQ-309\nRefs: REQ-010",
          "timestamp": "2026-08-26T06:07:59+02:00",
          "tree_id": "58a5699d30e509f09b3dea52ab314daae05e7577",
          "url": "https://github.com/pulseengine/rivet/commit/b2b155cb1ef9f6a10bf311b57e5c675cf2ffa358"
        },
        "date": 1787726410838,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 66849,
            "range": "± 2499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 814934,
            "range": "± 13544",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10888120,
            "range": "± 129104",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1314,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16157,
            "range": "± 517",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 333615,
            "range": "± 4360",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 63,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 63,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 63,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1184219,
            "range": "± 18762",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 139214,
            "range": "± 7196",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1597796,
            "range": "± 28679",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22921971,
            "range": "± 782170",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 370041,
            "range": "± 2561",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12482455,
            "range": "± 101341",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 872300848,
            "range": "± 9589437",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3182,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35250,
            "range": "± 1089",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792390,
            "range": "± 18348",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 50233,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 534190,
            "range": "± 2763",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6578063,
            "range": "± 106558",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 838,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10317,
            "range": "± 304",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 261377,
            "range": "± 4576",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17722,
            "range": "± 931",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 122690,
            "range": "± 1602",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1127932,
            "range": "± 46736",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "50626f463aa1ec2ae1c9863b3d4ef7a032e793d8",
          "message": "feat(serve): server-rendered tag facet over the tags param (REQ-275) (#851)\n\nfeat(serve): server-rendered tag facet over the tags param (REQ-275)\n\nCustomer-reported: tag filtering was a comma-separated `tags` param —\nefficient for machines, cumbersome for humans.\n\nA facet UI already existed, built in JavaScript, and it had three problems:\n\n  * it collected tags from the rows of the CURRENT PAGE, and /artifacts clamps\n    to a page, so a tag outside that page silently did not exist as a filter\n    option and nothing said the list was a subset;\n  * it filtered by setting row.style.display, so the selection never reached\n    the URL — it died on reload and did not compose with paging;\n  * it matched with tags.some(...) — union — while the server-side `tags` param\n    matches with .all(...) — intersection. Two tag filters in one product that\n    disagreed about what a selection means.\n\nThe list is now server-rendered from the whole project (name-sorted, with\ncounts) and drives `params.tags`, so there is one tag filter with one meaning.\nSelect All / Unselect All and a filter box for the long list, as asked.\n\nBuilding it surfaced a conflict worth naming rather than papering over. This\nproject has 427 distinct tags, and under intersection \"Select All\" asks for\nartifacts carrying all 427 — guaranteed to return nothing. A button that can\nonly ever produce an empty page is not worth shipping, so the combinator is now\nexplicit: a `tag-match` param and an `all of` / `any of` selector. It defaults\nto intersection, so every existing `tags=` URL keeps exactly its current\nmeaning, and Select All switches to union because that is what \"select all\"\nmeans in a faceted list. Unrecognised values fall back to intersection rather\nthan silently widening the result set.\n\nMeasured against the live dashboard:\n\n  ?tags=aadl                             31 rows\n  ?tags=aadl,accessibility                0 rows   (default, intersection)\n  ?tags=aadl,accessibility&tag-match=any 32 rows   (union)\n  ?tags=aadl,accessibility&tag-match=all  0 rows   (explicit intersection)\n\nNote on a measurement that misled me first time: `rivet list --format json`\ndoes not emit `tags` at all, so a check built on it reported \"0 distinct tags\"\nwhile the facet correctly rendered 427. The CLI JSON carries a fixed field set;\nit is not a view of the artifact.\n\nConfirmed with cargo fmt --check, clippy --all-targets -D warnings on 1.97.0,\ncargo test --workspace (exit 0, 65 ok), rivet validate, rivet docs check — all\nexit 0.\n\nImplements: REQ-275\nVerifies: REQ-275",
          "timestamp": "2026-08-26T09:50:24+02:00",
          "tree_id": "c2e2408daf37b9cda576d5198cb07e216a0062a6",
          "url": "https://github.com/pulseengine/rivet/commit/50626f463aa1ec2ae1c9863b3d4ef7a032e793d8"
        },
        "date": 1787737049847,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84967,
            "range": "± 680",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 915470,
            "range": "± 5824",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13774992,
            "range": "± 245068",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1898,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24339,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360495,
            "range": "± 2447",
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
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1541466,
            "range": "± 21557",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168722,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1967252,
            "range": "± 7949",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27251588,
            "range": "± 159582",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479350,
            "range": "± 1266",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15768359,
            "range": "± 194944",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1101550318,
            "range": "± 17175271",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4337,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 46052,
            "range": "± 1902",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 808792,
            "range": "± 13074",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60958,
            "range": "± 2025",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 720271,
            "range": "± 14042",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8042202,
            "range": "± 72649",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1080,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14667,
            "range": "± 277",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 227358,
            "range": "± 1708",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21198,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145498,
            "range": "± 613",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1354762,
            "range": "± 21267",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9d1a87fb905c15ceaafd9193c15e1e31bc5a17b0",
          "message": "ci: move CI Gate and the zola smoke off GitHub-hosted runners (#855)\n\nci: move CI Gate and the zola smoke off GitHub-hosted runners\n\nAudited every `ubuntu-latest` job for a genuine hosted requirement. Two had\nnone; the other eight all do and are staying.\n\nCI Gate is the important one. It is a `jq` read of `toJSON(needs)` — no\ncheckout, no toolchain, no sudo, no network — and all eleven jobs it aggregates\nrun on the self-hosted pool. Its availability was therefore ALREADY gated on\nthat pool. Being hosted added a SECOND, independent dependency on GitHub-hosted\ncapacity, which can only add failure modes and never removes one.\n\nThat bit on 2026-08-26. Hosted was starved — a run queued about 24 hours —\nwhile twelve self-hosted runners sat idle. Because `CI Gate` is the sole\nrequired context with enforce_admins: true, no PR could reach a green required\ncheck and `--admin` is not an escape. Every one of the gate's needs was green;\nonly the aggregation of them was stuck. Moved to the `light` pool: it is a\nfive-second script, and by the time it runs its needs have finished, so that\nrunner is free.\n\nZola export smoke has no hosted requirement either. It fetches zola from a\nGitHub release into $HOME/.local/bin — no sudo, no apt-get — which is exactly\nwhat pins the jobs that genuinely must stay hosted. Moved to `rust-cpu` since\nit builds a release binary.\n\nVerified mechanically rather than by reading: every job in ci-gate's `needs`,\nand ci-gate itself, now resolves to a self-hosted label, so no job that can\nblock a merge depends on GitHub-hosted capacity.\n\nThe eight jobs staying on ubuntu-latest each have a reason, and none is in\nci-gate's needs, so none can block a merge:\n\n  traceability-hosted-fallback  deliberate hosted floor for a self-hosted outage\n  playwright                    `playwright install --with-deps` needs sudo apt-get\n  vscode-extension              xvfb + VS Code test env needs sudo apt-get\n  audit                         smithy's cargo-audit 0.21.2 rejects RUSTSEC-2026-0037\n  kani                          bundles CBMC (~100 MB), not provisioned on smithy\n  verus                         cachix Nix installer needs full sudo / no NoNewPrivileges\n  rocq                          Rocq/Coq install heavy, not provisioned on smithy\n  release-results               SLSA L3 build isolation on an ephemeral runner (#782)\n\nConfirmed with yamllint -c .yamllint.yaml (exit 0; the remaining warnings are\npre-existing long lines), workflow YAML parses under yaml.safe_load, and rivet\nvalidate / docs check exit 0. actionlint's `runner-label` warnings for custom\nlabels are pre-existing — 21 on main, 23 here, same class.\n\nRefs: #849\nci(zola): verify by absolute path and assert zola before the smoke check\n\nThe zola job failed on its first self-hosted run — exit 127, \"zola: command not\nfound\" — after the download had succeeded. The install step appends\n$HOME/.local/bin to $GITHUB_PATH and then runs a bare `zola --version` in the\nSAME step, but $GITHUB_PATH only affects LATER steps. That worked on\nubuntu-latest purely because $HOME/.local/bin is on PATH there by default, and\nbroke the moment the job moved. A latent bug in the step, surfaced rather than\ncaused by the move; verifying by absolute path makes it portable.\n\nThe more interesting half is what the failure revealed. scripts/zola-export-\nsmoke.sh deliberately skips with exit 0 when zola is absent, so it stays usable\non a workstation without it. In CI that makes the job a vacuous pass: had the\n$GITHUB_PATH entry silently failed to take effect in the NEXT step rather than\nerroring in this one, the smoke check would have reported green having built\nnothing at all.\n\nSo the job now asserts zola is on PATH before invoking the script. The gate is\npotent; the script stays friendly. This is the same shape as #833 and #835 --\na tolerance for absence placed around the assertion that absence is the failure.\n\nConfirmed with yaml.safe_load, yamllint -c .yamllint.yaml (exit 0), actionlint\n(0 real findings, identical to main; only the pre-existing custom-label\nwarnings), rivet validate and rivet docs check (exit 0).\n\nRefs: #849",
          "timestamp": "2026-08-26T11:50:31+02:00",
          "tree_id": "b42b2dbc2b3fb210109030e903733843bc90bf38",
          "url": "https://github.com/pulseengine/rivet/commit/9d1a87fb905c15ceaafd9193c15e1e31bc5a17b0"
        },
        "date": 1787740395215,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77370,
            "range": "± 2323",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 940603,
            "range": "± 19232",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11475390,
            "range": "± 235164",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1515,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18370,
            "range": "± 643",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 284793,
            "range": "± 6589",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 72,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 73,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 72,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1352539,
            "range": "± 39923",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159299,
            "range": "± 3922",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1780837,
            "range": "± 56637",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24831175,
            "range": "± 579634",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 428971,
            "range": "± 11704",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14143484,
            "range": "± 352159",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 991574019,
            "range": "± 14545367",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3701,
            "range": "± 97",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40178,
            "range": "± 1110",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 817920,
            "range": "± 11397",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53843,
            "range": "± 1273",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 573291,
            "range": "± 12297",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7044374,
            "range": "± 147355",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 947,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11094,
            "range": "± 266",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 293415,
            "range": "± 6162",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20203,
            "range": "± 742",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 144220,
            "range": "± 4430",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1316238,
            "range": "± 33216",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "99f3b8bda987513a4c22204c74460b0f879b3770",
          "message": "fix(explain): derive the allowed-source set instead of printing [] (REQ-310, #852) (#859)\n\nfix(explain): derive the allowed-source set instead of printing [] (REQ-310, #852)\n\n`validate --explain REQ-001` printed:\n\n  needs an incoming 'verifies' from one of []\n\nwhich reads unambiguously as \"no artifact type may source this link\" — i.e. the\nrule is structurally unsatisfiable. The reporter concluded exactly that and was\nabout to file a schema gap before testing it. `dev`'s `verification` type\ndeclares `verifies -> [requirement]`, and adding one artifact flips the line to\nsatisfied immediately.\n\nThe cause is that `requirement-verification` omits `from-types`, and explain\nrendered that empty list literally. When the rule does not enumerate its\nsources, the set is now derived from the artifact types that DECLARE the\nability to source the link:\n\n  before   needs an incoming 'verifies' from one of []\n  after    needs an incoming 'verifies' from one of [\"verification\"]\n\nSchema::source_types_for_backlink is deliberately stricter than the existing\nfrom_type_can_link, which answers \"is this link permissible\" and returns true\nfor a type declaring no such field at all. Here the question is \"which types\ndeclare the ability to source it\", so a type with no matching link-field is not\na candidate — otherwise every type in the schema would be listed and the answer\nwould be useless.\n\nThe important half is that the two conditions are now distinguishable in the\nOUTPUT rather than only in the reader's head. A rule nothing can satisfy says\nso:\n\n  needs an incoming 'nonexistent-link-type', but NO type in the loaded schemas\n  declares a 'nonexistent-link-type' link targeting 'requirement' — this rule\n  is currently unsatisfiable; add a type that can source it, or drop the rule\n\nBoth oracles written first and negative-controlled: disabling the derivation\nreddens both, including the unsatisfiable one, so the fix cannot have replaced\none silence with another.\n\nAlso corrects status drift found while sweeping: REQ-309 shipped in #850 with 2\ntest markers and was still `proposed` — I flipped REQ-312 and REQ-313 that tick\nand missed it. Now `implemented`, not `verified`: its `--fail-under` policy\nclause is deliberately undischarged, and per REQ-308 a merged PR is not\nacceptance.\n\nConfirmed with cargo fmt --check, clippy --all-targets -D warnings on 1.97.0,\ncargo test --workspace (exit 0, 65 ok), rivet validate, rivet docs check — all\nexit 0.\n\nImplements: REQ-310\nRefs: REQ-309, REQ-308\ntest(schema): kill 4 surviving mutants in source_types_for_backlink\n\nThe rivet-core mutation gate found 4 survivors on this PR, all in the function\nit added, and all in one predicate:\n\n  lf.link_type == link_type                                  == -> !=\n    && (lf.target_types.is_empty()                           && -> ||\n        || lf.target_types.iter().any(|t| t == target_type)) || -> &&, == -> !=\n\nEvery operator survived, which means no test distinguished any of them. The\nonly coverage was a happy-path CLI test asserting the derived set appears in\n`--explain` output; it could not tell a correct predicate from four broken ones.\n\nAdded a unit test with a fixture chosen so each mutation flips a specific\nassertion: a type whose matching link points at a DIFFERENT target, a type with\na different link type entirely, a type with an unconstrained target list that\nmust match anything, and a type declaring no link fields at all that must never\nbe a candidate. Also pins that an unknown link type yields an EMPTY result,\nsince that emptiness is meaningful — it is what REQ-310 reports as genuinely\nunsatisfiable — and must not collapse to \"everything\".\n\nVerified by applying all four mutations and confirming each turns the test red:\n\n  KILLED  mutant 1 link_type == -> !=\n  KILLED  mutant 2 && -> ||\n  KILLED  mutant 3 || -> &&\n  KILLED  mutant 4 t == -> !=\n\nWorth recording that my first attempt at that verification was wrong: the\nanchor string `lf.link_type == link_type` occurs three times in schema.rs, so a\nfirst-occurrence replace mutated a DIFFERENT function and two mutants appeared\nto survive. Re-running the substitution scoped to the function body showed all\nfour killed. The experiment was faulty, not the test.\n\n`cargo test --workspace` failed once on api_artifacts_search\n(serve_integration.rs:102, \"server did not become healthy within 30 seconds\") —\nthe documented startup race, not an assertion about this code. It passes 3/3 in\nisolation and the full suite is clean on re-run (exit 0, 65 ok). Same class as\n#835.\n\nConfirmed with cargo fmt --check, clippy --all-targets -D warnings on 1.97.0,\ncargo test --workspace (exit 0), rivet validate, rivet docs check — all exit 0.\n\nVerifies: REQ-310",
          "timestamp": "2026-08-27T03:06:53+02:00",
          "tree_id": "0d826973c0c614461586759b7dea886156935b92",
          "url": "https://github.com/pulseengine/rivet/commit/99f3b8bda987513a4c22204c74460b0f879b3770"
        },
        "date": 1787795933358,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84623,
            "range": "± 484",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 895779,
            "range": "± 8271",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13231404,
            "range": "± 552296",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2246,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 28472,
            "range": "± 422",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378390,
            "range": "± 1366",
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
            "value": 1543609,
            "range": "± 24610",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161317,
            "range": "± 1116",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1959075,
            "range": "± 11173",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25560542,
            "range": "± 2166932",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 473740,
            "range": "± 2298",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15120803,
            "range": "± 94026",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1179418967,
            "range": "± 14188133",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4357,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60261,
            "range": "± 345",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 851902,
            "range": "± 5041",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60873,
            "range": "± 262",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699257,
            "range": "± 3427",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8081360,
            "range": "± 286885",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1180,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15436,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 340064,
            "range": "± 6046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22593,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159954,
            "range": "± 1186",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1469614,
            "range": "± 11446",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "2ddb0b3c45476dae694cb5cbde7f336844bcab6f",
          "message": "ci: make the Test and Proptest jobs do what their names say (REQ-304, REQ-305) (#863)\n\nci: make the Test and Proptest jobs do what their names say (REQ-304, REQ-305)\n\nREQ-304 / #833. The Test job's evidence step was three silencers in a row:\n`cargo install cargo-nextest --locked 2>/dev/null || true` swallowed an install\nfailure twice, the `else` branch fell back to `cargo test` (no JUnit XML, and\nnone of the ci profile's `retries = 2`), and the upload carried\n`if-no-files-found: ignore`. A step whose NAME promises JUnit XML could produce\nnone, lose the flake protection #494 added, and still go green. Now installs via\ntaiki-e/install-action, runs nextest unconditionally, and uploads with\n`if-no-files-found: error` — a missing junit.xml means the evidence this step\nexists to produce was not produced, which must not read as a pass.\n\nREQ-305 / #835. The Proptest job ran `cargo test --all`, so `retries = 2` never\napplied — and it runs the serve/integration tests at 10x load, the worst case\nfor the port/startup race those retries exist for. It reddened on #859 and #861\nwithin a week, each costing a diagnosis to establish as environmental. nextest\nreports a retry-passing test as FLAKY in the summary, so the signal is kept\nrather than hidden.\n\nA coverage gap fell out of that. nextest does not run doctests, and the 3\ndoctests in this workspace were covered ONLY by the proptest job's\n`cargo test --all` — an advisory job outside CI Gate's needs. Switching that job\nto nextest would have dropped them from CI entirely. Added an explicit doctest\nstep to the Test job instead, which is gating, so they end up better covered\nthan before.\n\nThe Playwright upload keeps `if-no-files-found: ignore` deliberately:\n`test-results/` holds failure traces and is legitimately empty on a green run.\nThat is diagnostic debris, not the evidence the step promises.\n\nVerifying this locally surfaced a separate latent defect, filed as REQ-314 and\nNOT fixed here. 27 of 28 integration-test files resolve the rivet binary with a\nRUNTIME `std::env::var(\"CARGO_BIN_EXE_rivet\")` plus a hardcoded\n`<workspace>/target/debug/rivet` fallback. Cargo sets that variable; nextest\ndoes not, so with a custom CARGO_TARGET_DIR every one of them falls through to a\npath that does not exist — 387 failures, all `spawn rivet: NotFound`. The single\nfile using the COMPILE-TIME `env!` macro (mcp_integration.rs, changed in #834)\npasses untouched, which is the discriminator. CI sets no CARGO_TARGET_DIR so the\nfallback happens to resolve there; the cost lands on local verification.\n\nBecause of that, this change could not be validated by simply running the new\ncommand locally. Confirmed instead by placing the binary at the fallback path\nand re-running: 8/8 on a sampled crate, and junit.xml is written to\n`target/nextest/ci/junit.xml`, matching the upload path.\n\nAlso corrects status drift: REQ-299 shipped in 6b3be3c (the diff-scoped\nrivet-core mutation gate, which has been running on every PR since) and was\nstill marked `proposed`.\n\nConfirmed with yamllint (exit 0), actionlint (0 real findings), workflow YAML\nparses, cargo fmt --check, clippy --all-targets -D warnings on 1.97.0,\ncargo test --workspace (exit 0, 65 ok), rivet validate, rivet docs check — all\nexit 0.\n\nImplements: REQ-304, REQ-305\nRefs: REQ-299, REQ-314",
          "timestamp": "2026-08-27T16:44:49+02:00",
          "tree_id": "7ed7c56bd9893e91147599aa44b7b379578da530",
          "url": "https://github.com/pulseengine/rivet/commit/2ddb0b3c45476dae694cb5cbde7f336844bcab6f"
        },
        "date": 1787845303419,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85356,
            "range": "± 2339",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 903474,
            "range": "± 7850",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15339298,
            "range": "± 772443",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2204,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27297,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376413,
            "range": "± 1873",
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
            "value": 1530933,
            "range": "± 39879",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162833,
            "range": "± 1132",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917152,
            "range": "± 17689",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35807751,
            "range": "± 2988338",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 474155,
            "range": "± 2431",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16349306,
            "range": "± 186723",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1218447079,
            "range": "± 15915639",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4401,
            "range": "± 135",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61707,
            "range": "± 514",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 830946,
            "range": "± 4491",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60253,
            "range": "± 1006",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698595,
            "range": "± 9637",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10555769,
            "range": "± 551018",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1173,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14666,
            "range": "± 562",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 323062,
            "range": "± 14938",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22894,
            "range": "± 151",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159965,
            "range": "± 7055",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1486364,
            "range": "± 52249",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9d9a69784d09fb605b9776713553c619dec61896",
          "message": "plan(v0.36): triage the untracked issue board; give v0.36.0 a theme (#869)\n\nplan(v0.36): triage the untracked issue board; give v0.36.0 a theme\n\nThe v0.35.0 split moved artifacts between release labels. That is triage, not\nplanning: it ranged only over things that ALREADY had artifacts, so anything\nunrepresented on the issue board was structurally invisible to it. Checking\nfound seven open issues with no artifact reference at all — the exact failure\nthe loop's own instructions name.\n\nTwo of the seven were already resolved and simply never closed:\n\n  #796  branch protection has zero required checks — actually set days ago\n        (required contexts [\"CI Gate\"], enforce_admins true), closed with the\n        verification output rather than on recollection\n  #867  runner liveness alert whose cited run was `completed/cancelled`, with\n        nothing queued and 12 runners online — closed with evidence\n\nThree become artifacts:\n\n  REQ-316  #862  the self-hosted fleet restarts mid-run, killing in-flight jobs\n                 across labels and reporting them as `failure` with no failed\n                 step, which has already produced one published misattribution\n  REQ-317  #839/#849/#860/#867  the liveness probe misdiagnoses three distinct\n                 ways and auto-closes each time, so its defects survive every\n                 occurrence and the next reader starts from the same wrong hint\n  REQ-318  #800  externally-owned verification — backlog, not scheduled: it\n                 overlaps REQ-308 and REQ-313 enough that solving it first\n                 risks three near-identical mechanisms for the same idea\n\nTwo are correctly unplanned: #549 and #508 carry `external-watch`, which is a\ndeliberate decision not to scope them, not an oversight.\n\nv0.36.0 now has a theme rather than leftovers — every member is a signal that\nlies. REQ-295 and REQ-306 (a gate satisfiable by an empty stub), REQ-314 (tests\nthat cannot find the binary under nextest, so local verification of CI changes\nis impossible), REQ-315 (an artifact a merged commit claims to implement stays\n`proposed`), REQ-316 (infrastructure loss reported as test failure) and REQ-317\n(an alert whose own diagnosis is wrong). REQ-307 moved to backlog: it is CLI\nusability and does not belong with these.\n\nCounts after: v0.35.0 12, v0.36.0 6, backlog 11.\n\nConfirmed with rivet validate (exit 0), rivet docs check (exit 0), 288\nartifacts, no duplicate ids. Re-ran the gap check: open issues with no artifact\nwent 7 -> 2, both external-watch.\n\nRefs: REQ-316, REQ-317, REQ-318, REQ-307",
          "timestamp": "2026-08-28T00:43:58+02:00",
          "tree_id": "20d5eb6e2d732ce4d39e0348ebc086de10fac0a5",
          "url": "https://github.com/pulseengine/rivet/commit/9d9a69784d09fb605b9776713553c619dec61896"
        },
        "date": 1787871349338,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 66482,
            "range": "± 3182",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 718522,
            "range": "± 3126",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12180882,
            "range": "± 522509",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1461,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 17816,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 258802,
            "range": "± 2208",
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
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1183968,
            "range": "± 12458",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126045,
            "range": "± 264",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1497016,
            "range": "± 23213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21409503,
            "range": "± 500407",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 344980,
            "range": "± 1286",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10667637,
            "range": "± 38321",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 753996489,
            "range": "± 5648610",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3209,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 33994,
            "range": "± 115",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 554924,
            "range": "± 2007",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47962,
            "range": "± 113",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 516450,
            "range": "± 1949",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6242821,
            "range": "± 139231",
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
            "value": 10410,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 170185,
            "range": "± 625",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16350,
            "range": "± 41",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 111521,
            "range": "± 478",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1038384,
            "range": "± 8076",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6254d59e79968ea65a329ad021cd96b580c1177d",
          "message": "fix(scanner): read verifies markers from shell scripts (REQ-319, #870) (#872)\n\ncoverage --tests read `# rivet: verifies REQ-X` from Python but not the\nidentical comment in a shell script: detect_language had no `sh` entry, so\nscan_file returned before any pattern ran and the file was skipped in silence.\n\nShell gets its own language category (the comment pattern matches Python, the\nenclosing-function regex does not), plus a shebang fallback consulted only for\nextensionless files, since a CI gate is often `tools/no-key-on-disk` rather\nthan `.sh`.\n\nThe PR-diff mutation gate then found three survivors in the new code, all real\nobservation gaps. The instructive one: the shell test already exercised the\nenclosing-function arm and already passed, but projected every marker down to\nits target id and discarded the attributed name — so deleting the arm degraded\nREQ-SH-001 from \"check_no_key_on_disk\" to a bare \"c.sh:3\" and nothing noticed.\nLine coverage called that arm fully covered throughout. Each mutant was\nre-applied by hand and confirmed to redden exactly the assertion written for\nit. Gate is green on the merge commit.\n\nREQ-319 flipped implemented -> verified in the same PR rather than a follow-up:\na trailer is a link, not a state transition (REQ-315), so nothing else advances\nit, and this would have been the sixth instance of that drift.\n\nKani Proofs is red at the toolchain-install step with `cargo kani` skipped —\nthe proofs never ran (#839). Security Audit is red from two new wasmtime\nadvisories present on main, negative-controlled against main's lockfile and\nfixed separately. Neither is in CI Gate's needs.\n\nCloses #870.\n\nImplements: REQ-319\nVerifies: REQ-319\nRefs: REQ-320, REQ-315",
          "timestamp": "2026-09-01T22:21:15+02:00",
          "tree_id": "3abd747a83462662acce69c5ab412adc5387714a",
          "url": "https://github.com/pulseengine/rivet/commit/6254d59e79968ea65a329ad021cd96b580c1177d"
        },
        "date": 1788294773441,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67056,
            "range": "± 639",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 820113,
            "range": "± 21088",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10432694,
            "range": "± 453622",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1316,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 15529,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 239306,
            "range": "± 2178",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 67,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 68,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 68,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1202535,
            "range": "± 12975",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 138657,
            "range": "± 315",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1604888,
            "range": "± 7569",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23263288,
            "range": "± 597344",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 378838,
            "range": "± 7633",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 13789929,
            "range": "± 707123",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1010801366,
            "range": "± 7820331",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3137,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35063,
            "range": "± 381",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757317,
            "range": "± 3260",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 47664,
            "range": "± 1563",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 491188,
            "range": "± 1951",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6125433,
            "range": "± 32230",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 808,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10314,
            "range": "± 50",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 296673,
            "range": "± 9441",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 18078,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 125632,
            "range": "± 9433",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1159888,
            "range": "± 65984",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3bffda8fcb2476d2e3f5a0d8d47ea82953292e76",
          "message": "fix(test): resolve the rivet binary at compile time in all 28 tests (REQ-314) (#881)\n\n27 of 28 integration tests read CARGO_BIN_EXE_rivet at RUN time and fell back to\na hardcoded <workspace>/target/debug/rivet. Cargo leaves that variable in the\ntest process environment so `cargo test` works; nextest spawns test processes\nitself and does not, so all 27 used the hardcoded path and ignored\nCARGO_TARGET_DIR entirely.\n\nMeasured with CARGO_TARGET_DIR=/tmp/rivet-build, after confirming the fallback\npath did not exist — a stale binary there would have made the measurement\nvacuous:\n\n  before   2315 tests run: 1924 passed, 391 failed   exit 100\n  after    2316 tests run: 2316 passed               exit 0\n\nCI could never have caught this and, after the fix, still could not catch a\nregression: CI does not set CARGO_TARGET_DIR, so the binary lands at exactly the\npath the old fallback hardcoded and the wrong lookup resolves by luck. The same\nnextest command is green there and 391-red locally. Only an assertion about the\nsource text can hold the invariant, hence tests/binary_resolution.rs — which\nasserts it scanned at least 20 files BEFORE asserting the offender set is empty,\nsince an empty scan would pass vacuously. Negative-controlled by reintroducing\nthe run-time lookup in one file.\n\nAlso corrects the comment in mcp_integration.rs, which asserted the exact\ninverse of the truth (\"this file was the sole holdout (27 of 28)\"). It was the\nonly file that used env!. #834 fixed that one file under that false belief,\nwhich is why the other 27 survived.\n\nImplements: REQ-314\nVerifies: REQ-314",
          "timestamp": "2026-09-04T14:27:59+02:00",
          "tree_id": "6f4af71b83f6e7d4adc2e4e465cc4cf808e8a7dd",
          "url": "https://github.com/pulseengine/rivet/commit/3bffda8fcb2476d2e3f5a0d8d47ea82953292e76"
        },
        "date": 1788525777440,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85359,
            "range": "± 369",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 905074,
            "range": "± 11657",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13961345,
            "range": "± 811408",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2258,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27563,
            "range": "± 996",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 463088,
            "range": "± 2124",
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
            "value": 1522209,
            "range": "± 22110",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163151,
            "range": "± 1844",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1906031,
            "range": "± 23523",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30470145,
            "range": "± 720106",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 496039,
            "range": "± 3619",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17767558,
            "range": "± 132764",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1450978388,
            "range": "± 14409756",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4296,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59944,
            "range": "± 1156",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 808335,
            "range": "± 13969",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59448,
            "range": "± 302",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692013,
            "range": "± 3396",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8183390,
            "range": "± 221019",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1137,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13932,
            "range": "± 57",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327341,
            "range": "± 2126",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22489,
            "range": "± 132",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164161,
            "range": "± 2024",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1473648,
            "range": "± 19124",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
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
      }
    ]
  }
}