window.BENCHMARK_DATA = {
  "lastUpdate": 1780473826471,
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
          "id": "1363ca7a485e53822082ebd8dcc84f4fc3770053",
          "message": "fix(modify): correct s-expr syntax in --where help examples (REQ-141) (#382)\n\nThe `modify --where` after_help examples I added in #380 used an invalid\nfilter shorthand — `(type \"requirement\")` / `(status \"draft\")` — where\nthe head symbol must be an operator, not the field name. Run verbatim\nthey error with \"unknown form 'type'/'status'\". Corrected to the\ncanonical `(= field \"value\")` form, both examples now run clean:\n\n  rivet modify --where '(= status \"draft\")' --set-status implemented\n  rivet modify --where '(and (= type \"requirement\") (= status \"draft\"))' …\n\nVerified both examples execute (dry-run) without a parse error. The\nbroader discoverability gap (the parse error shows no example of the\ncommon field-equality form) is tracked in #381.\n\nImplements: REQ-141\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-01T19:28:22-05:00",
          "tree_id": "5356ccd2deffd4deab8740cf49ab22dc10f27dce",
          "url": "https://github.com/pulseengine/rivet/commit/1363ca7a485e53822082ebd8dcc84f4fc3770053"
        },
        "date": 1780360498214,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83992,
            "range": "± 853",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882608,
            "range": "± 24154",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13111470,
            "range": "± 466967",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2106,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25572,
            "range": "± 331",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365279,
            "range": "± 788",
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
            "value": 1479601,
            "range": "± 20295",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159214,
            "range": "± 4156",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1867251,
            "range": "± 39424",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26585904,
            "range": "± 2402999",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 133182,
            "range": "± 1189",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1146310,
            "range": "± 13434",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 13014679,
            "range": "± 1149462",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4248,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60053,
            "range": "± 824",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 807644,
            "range": "± 11903",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60248,
            "range": "± 187",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 682060,
            "range": "± 3627",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7521663,
            "range": "± 119826",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 749,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6906,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117224,
            "range": "± 1544",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22670,
            "range": "± 79",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154235,
            "range": "± 943",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1444685,
            "range": "± 37419",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "944424500d638a0868c644dd655da5b9a5ba0fc0",
          "message": "fix(sexpr): show field-equality example in filter parse error (REQ-142, #381) (#383)\n\nThe s-expression filter dialect (query / list --filter / export --filter\n/ modify --where) puts an operator in head position, but the single most\ncommon first attempt is `(status \"draft\")` — field name in head — which\nfails with `unknown form 'status'`. The error listed every supported\nhead form but showed no example of the correct `(= field \"value\")`\nshape, so every first-time author (human or agent) burned a round-trip\nand a grep through the tests to discover it.\n\nThe `unknown head symbol` note now states the head is an operator (not a\nfield name) and shows the form inline: `(= status \"draft\")` /\n`(and (= type \"requirement\") (has-tag \"safety\"))`. Generated once in\n`sexpr_eval`, so it reaches every command that parses a filter. Verified\non `modify --where` and `list --filter`. Also added an example to the\n`export --filter` help (it had none, unlike list/query). Test asserts\nthe example is present.\n\nImplements: REQ-142\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-01T22:51:06-05:00",
          "tree_id": "70e81b7ea87fdf4b68aafab9b5216711e86a5a1e",
          "url": "https://github.com/pulseengine/rivet/commit/944424500d638a0868c644dd655da5b9a5ba0fc0"
        },
        "date": 1780372666304,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84950,
            "range": "± 401",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925914,
            "range": "± 6045",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 20013565,
            "range": "± 1202693",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1978,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25021,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364785,
            "range": "± 9086",
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
            "value": 96,
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
            "value": 1428472,
            "range": "± 26793",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167163,
            "range": "± 1873",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1940187,
            "range": "± 20495",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 45975577,
            "range": "± 3848604",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 125638,
            "range": "± 1259",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1180145,
            "range": "± 26510",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 29019341,
            "range": "± 1098408",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4158,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43826,
            "range": "± 145",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 783089,
            "range": "± 27936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63557,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 744004,
            "range": "± 5963",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11982422,
            "range": "± 849329",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 766,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6755,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 99079,
            "range": "± 650",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20877,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145877,
            "range": "± 1848",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1352346,
            "range": "± 18816",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7965e6dab2624e7f3b12fb9b75aebf25c2702756",
          "message": "fix(externals): resolve refs with a hyphenated (kebab) prefix (REQ-143) (#384)\n\nUser-reported (0.14.0): `/artifacts/linc-mesh:A-AVTP-STREAM` in serve\nreturned \"Artifact does not exist\", and external `prefix:ID` refs with a\nkebab-case prefix were unresolved in document rendering, although the\nartifact existed in the external project.\n\nRoot cause: `parse_artifact_ref` required the prefix to be purely\n`is_ascii_lowercase()` — no hyphens — so a project slug like `linc-mesh`\nfell through to `ArtifactRef::Local(\"linc-mesh:A-AVTP-STREAM\")` and was\nlooked up as a local id (404). But externals are stored as\n`<prefix>:<id>` with that same hyphenated prefix, so the parser no longer\nround-tripped its own stored form. Every external whose prefix contained\na hyphen was unreachable in the serve detail view and in document link\nresolution (both delegate to this one function).\n\nFix: accept a kebab-case slug prefix — leading lowercase letter, then\nlowercase letters / digits / hyphens. Updated the Kani round-trip proof\nto the new contract. Regression tests: `linc-mesh:A-AVTP-STREAM` and\n`linc2:REQ-1` parse as External; non-slug `H-1:2` / `-bad:REQ-1` stay\nLocal; all 28 externals tests pass.\n\nAlso files REQ-144 (source-view substring mis-link) and REQ-145\n(test-results `rivet_tc_id` property) — two more user reports triaged\nthis iteration, draft, to be worked next.\n\nFixes: REQ-143\nRefs: REQ-085, REQ-144, REQ-145\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T00:59:43-05:00",
          "tree_id": "2d155d72be22039fce160337d951032c91148735",
          "url": "https://github.com/pulseengine/rivet/commit/7965e6dab2624e7f3b12fb9b75aebf25c2702756"
        },
        "date": 1780380377464,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85575,
            "range": "± 303",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900003,
            "range": "± 9263",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15573801,
            "range": "± 1703085",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2186,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25680,
            "range": "± 402",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 381195,
            "range": "± 4317",
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
            "value": 1436838,
            "range": "± 25454",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169202,
            "range": "± 1136",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2006784,
            "range": "± 18196",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 46589696,
            "range": "± 2317155",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 135230,
            "range": "± 1835",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1199598,
            "range": "± 29338",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12753787,
            "range": "± 400759",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4292,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59604,
            "range": "± 437",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760882,
            "range": "± 7988",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63539,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725423,
            "range": "± 25285",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7616565,
            "range": "± 97203",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 739,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6871,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 129172,
            "range": "± 841",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22553,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161398,
            "range": "± 1823",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1519446,
            "range": "± 13819",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "78ae68eb2d0bb1d2e763833e87191cef4f6e9bd9",
          "message": "fix(source-view): match artifact ids as whole tokens, not substrings (REQ-144) (#387)\n\nUser-reported: in the source view, an id that is a SUBSTRING of a longer\nid was wrongly linked — e.g. `SWR-001` linked inside `SDV-BCM-SWR-001`,\na phantom trace edge. The viewer gated and linkified ids with\n`line.contains(id)`, a raw substring test.\n\nAdd `line_contains_id_token`: an id matches only when bounded on both\nsides by a non-`[A-Za-z0-9-]` character (or a string boundary). Ids\ncontain hyphens, so a hyphen is part of the token, not a delimiter —\nwhich is exactly what distinguishes `SWR-001` from `SDV-BCM-SWR-001`.\nUsed at both the highlight gate and the linkify filter. Ids are ASCII,\nso byte-boundary checks align with char boundaries.\n\nRegression test covers: substring NOT matched (`SWR-001` in\n`SDV-BCM-SWR-001`), longer id matched, exact/delimited occurrences\nmatched, trailing-alnum (`SWR-0011`) and leading-alnum (`xSWR-001`) not\nmatched. `rivet validate` PASS.\n\nImplements: REQ-144\nRefs: REQ-092\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T01:43:46-05:00",
          "tree_id": "4eef0ebdacb739f3ce8c641ff7055dd73081c5e3",
          "url": "https://github.com/pulseengine/rivet/commit/78ae68eb2d0bb1d2e763833e87191cef4f6e9bd9"
        },
        "date": 1780382995762,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 68238,
            "range": "± 1469",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 718667,
            "range": "± 6115",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12437079,
            "range": "± 546421",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1486,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18549,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 261971,
            "range": "± 959",
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
            "value": 1128582,
            "range": "± 17441",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127092,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1501015,
            "range": "± 26095",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28895237,
            "range": "± 2353824",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 98772,
            "range": "± 508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 899359,
            "range": "± 14586",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19303757,
            "range": "± 1134257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3230,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35700,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 597872,
            "range": "± 4012",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 46675,
            "range": "± 857",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 517642,
            "range": "± 2925",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6648145,
            "range": "± 423645",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 566,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 5096,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 75119,
            "range": "± 201",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16739,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 112704,
            "range": "± 378",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1040184,
            "range": "± 12268",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6ccc2f3492f1fb2c284899088abed16945edc64b",
          "message": "feat(junit): honor a rivet_tc_id testcase property as the artifact id (REQ-145) (#388)\n\nUser-reported (#386): importing JUnit results derived the artifact id\nfrom `classname` + `name`, which rarely matches a real artifact, so the\nresult linked to nothing. The user records an explicit id per testcase\nvia `<property name=\"rivet_tc_id\" value=\"...\"/>`, but the parser ignored\n`<property>` children entirely.\n\nNow the parser reads `<property>` children of a `<testcase>`; a\n`rivet_tc_id` property value becomes the result's artifact id, taking\npriority over every classname/name heuristic AND the marker fallback. A\nsuite-level or unrelated property is ignored; absent the property,\nbehaviour is unchanged (back-compatible).\n\nTests: property-present (overrides classname.name), property overrides a\nclassname that is itself an artifact id, property-absent keeps the\nclassname.name behaviour. All 25 junit tests pass; clippy --all-targets\n+ fmt clean; rivet validate PASS; docs check PASS.\n\nImplements: REQ-145\nRefs: REQ-101\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T02:03:12-05:00",
          "tree_id": "11be501a015a72b781c8196cb5ea71afe763f231",
          "url": "https://github.com/pulseengine/rivet/commit/6ccc2f3492f1fb2c284899088abed16945edc64b"
        },
        "date": 1780384183129,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84446,
            "range": "± 1352",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890132,
            "range": "± 6549",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12470120,
            "range": "± 253802",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2200,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26906,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353908,
            "range": "± 1608",
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
            "value": 1437101,
            "range": "± 10354",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164464,
            "range": "± 558",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917217,
            "range": "± 5975",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25193457,
            "range": "± 926623",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 130677,
            "range": "± 2335",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1156110,
            "range": "± 25083",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12522737,
            "range": "± 423960",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4302,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59263,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745164,
            "range": "± 2812",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62515,
            "range": "± 387",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701328,
            "range": "± 8785",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7633418,
            "range": "± 60183",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 757,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7136,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 123703,
            "range": "± 1073",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23241,
            "range": "± 93",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159715,
            "range": "± 1996",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1480980,
            "range": "± 37316",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "02b689372c6fc4743b41f6134889e068458c52e0",
          "message": "test(serve): give graph_type_filter test a 15s budget to kill the flake (#389) (#390)\n\n`graph_type_filter_renders_when_under_budget` fetched\n`/graph?types=requirement` with the default 5s read timeout. That\nendpoint does a BFS + layout over the dogfood corpus (~742 nodes / 1477\nedges), which on a loaded CI runner can brush past 5s; `fetch_with_timeout`\nparses a timed-out/empty response's status as 0, so the timeout surfaced\nas `status == 0` and failed the `== 200` assertion. Same chronic flake\nthe focus-graph tests already fixed with a 15s budget — this one test\nwas missed. It falsely failed CI on #380, #387, and #388.\n\nSwitch it to `fetch_with_timeout(..., 15s)`, matching the other graph\nendpoints. The test asserts on the response shape (SVG or budget\nmessage), not a hard latency bound, so the wider timeout is safe.\nVerified locally: passes 3/3 runs.\n\nTrace: skip\nCloses: #389\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T02:30:35-05:00",
          "tree_id": "5675d70fd1de6fb6f55b9e09895e963300b92aa4",
          "url": "https://github.com/pulseengine/rivet/commit/02b689372c6fc4743b41f6134889e068458c52e0"
        },
        "date": 1780385837847,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84493,
            "range": "± 511",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921216,
            "range": "± 6056",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14629996,
            "range": "± 707108",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1929,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25144,
            "range": "± 98",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352207,
            "range": "± 2546",
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
            "value": 1419041,
            "range": "± 16461",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167101,
            "range": "± 1041",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1923783,
            "range": "± 15862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30436376,
            "range": "± 2033373",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 123336,
            "range": "± 2485",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1168099,
            "range": "± 10103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14125962,
            "range": "± 607250",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4241,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44805,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 770312,
            "range": "± 3538",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63932,
            "range": "± 559",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 717722,
            "range": "± 5397",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8330878,
            "range": "± 365070",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 737,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6585,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 98150,
            "range": "± 570",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 20966,
            "range": "± 211",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 145274,
            "range": "± 570",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1348069,
            "range": "± 23484",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a37bda6c1a6f72458613689890fbc0102d9143ea",
          "message": "feat(scripts): Zola export build smoke check (REQ-138, #378) (#391)\n\nAdds scripts/zola-export-smoke.sh: exports the corpus into a scaffolded\nZola site whose base_url is a sub-directory deploy, runs a real\n`zola build`, and fails on a build error OR on any built-HTML\nartifact/document link that drops the deploy sub-path.\n\nThis is the end-to-end gate the string-asserting unit tests can't give —\n\"export succeeded\" now provably implies \"the site builds and its links\nresolve under a sub-directory deploy.\" It catches the REQ-115/116/118\nabsolute-link class that previously shipped undetected. The script skips\ncleanly (exit 0 + notice) when `zola` is absent, so it can gate on\navailability.\n\nVerified locally: passes on the current corpus (1219 pages, 0 leaks);\nthe leak detector fires on the pre-fix `/<prefix>/artifacts/…` pattern\nwhile ignoring correctly-resolved full-URL links. Wiring it as a gated\nCI job (needs a zola install on the runner) is a follow-up.\n\nImplements: REQ-138\nRefs: REQ-115\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T03:33:08-05:00",
          "tree_id": "80d4292bf17c65a7e35426c1596c89362ca719d1",
          "url": "https://github.com/pulseengine/rivet/commit/a37bda6c1a6f72458613689890fbc0102d9143ea"
        },
        "date": 1780389585524,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85531,
            "range": "± 502",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890957,
            "range": "± 5594",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12398686,
            "range": "± 372468",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2193,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25429,
            "range": "± 128",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 371437,
            "range": "± 920",
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
            "value": 1432148,
            "range": "± 20454",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160056,
            "range": "± 1630",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1876137,
            "range": "± 8527",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24086899,
            "range": "± 1136601",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 132245,
            "range": "± 1149",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1151829,
            "range": "± 27943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12815374,
            "range": "± 582007",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4255,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57545,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 829558,
            "range": "± 7393",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62249,
            "range": "± 1306",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700128,
            "range": "± 9984",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7873722,
            "range": "± 205789",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 777,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6695,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 126259,
            "range": "± 1432",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22267,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 154605,
            "range": "± 753",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1466195,
            "range": "± 19725",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7a41f0d2655bc7ecad45759b51315b9adda52ce6",
          "message": "fix(validate): salsa path evaluates status-gate validation-rules (REQ-146, #355) (#393)\n\n`rivet validate` runs the incremental salsa path (`db::validate_all`),\nwhich evaluated structural rules (phases 1-7) and conditional rules\n(phase 8) but NOT the status-gate `validation-rules` (phase 9 — the\n`(implies …)` V-model promotion gates). The direct `validate::validate*`\npath (used by `rivet check gaps-json` and `rivet validate --direct`) DID\nevaluate them. So the default `rivet validate` silently PASSED a project\nwith a status-gate violation that gaps-json / --direct correctly FAILED\n— the divergence reported in #355 Finding 3, and a soundness gap since\nthe default validation surface under-reported.\n\nFix: `db::validate_all` and `validate_all_with_extras` now also call\n`validate::evaluate_validation_rules` against the same materialized\nstore/schema/graph, so every validation surface agrees.\n\nReproduced + verified: a project with an aspice `validation-rules` gate\n(an approved sys-verification verifying a draft system-req) previously\ngave salsa `FAIL (1 error)` vs direct `FAIL (2 errors)`; now both report\n2 including the gate. rivet's own corpus still PASS (181→ unchanged) on\nboth paths. New regression test\n`db::tests::validation_rules_evaluated_in_validate_all`; rivet-core db\n(24) + validation_rule (3) tests pass; clippy --all-targets + fmt clean;\nrivet validate + docs check PASS.\n\nFixes: REQ-146\nRefs: REQ-029, REQ-004\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T04:43:07-05:00",
          "tree_id": "21286356b785b9859c0da9d58a121391bde2e72e",
          "url": "https://github.com/pulseengine/rivet/commit/7a41f0d2655bc7ecad45759b51315b9adda52ce6"
        },
        "date": 1780393798112,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83525,
            "range": "± 310",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 900312,
            "range": "± 25882",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16620328,
            "range": "± 1512508",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2219,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26775,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353876,
            "range": "± 5369",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1444891,
            "range": "± 20746",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163861,
            "range": "± 2396",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921167,
            "range": "± 22633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33166952,
            "range": "± 4043120",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 131454,
            "range": "± 4619",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1148634,
            "range": "± 30451",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 18635963,
            "range": "± 1894118",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4488,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62279,
            "range": "± 972",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 741233,
            "range": "± 5587",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62814,
            "range": "± 1037",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703553,
            "range": "± 11893",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10270186,
            "range": "± 863184",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 772,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7349,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 139414,
            "range": "± 1007",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22600,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156887,
            "range": "± 1133",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1475639,
            "range": "± 42095",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "b097e49ea7b523d5ba4c627770ed05ae25c4ec2a",
          "message": "fix(validate): coverage diagnostics name the link + satisfier types (REQ-147, #350) (#394)\n\nMarking a sw-req `implemented` then running `rivet validate` produced\ncoverage diagnostics that said WHAT was missing but not HOW to satisfy\nit; the reporter reverse-engineered the required shape from an unrelated\nlink-target rejection (\"a whole detour\").\n\nTwo schema-agnostic guidance improvements (no rule semantics changed):\n- The `required-backlink` coverage diagnostic now appends the incoming\n  link type and allowed source types, e.g. \"… — needs an incoming\n  `verifies` link from one of [sw-verification, unit-verification,\n  sw-integration-verification]\".\n- The `Lifecycle coverage gaps` summary now points at\n  `rivet validate --explain <ID>`, which lists each rule's\n  satisfied/MISSING state with the exact incoming link + source types\n  (and alternates) — verified the pointer resolves to that breakdown.\n\nAlso files REQ-148 (draft): a generic `coverage-rule-consistency`\nmeta-check to flag a `required-backlink` rule whose `from-types` include\ntypes no link rule permits to form the backlink (the aspice\n`swe1-has-verification` lists unit/integration-verification as sw-req\nsatisfiers, but only sw-verification can `verifies`→sw-req). Deferred —\nneeds conservative implementation to avoid false positives; the aspice\nfrom-types intent itself is a maintainer/compliance call (#350/#355).\n\nAll 74 validate tests pass; clippy --all-targets + fmt clean; rivet\nvalidate + docs check PASS.\n\nImplements: REQ-147\nRefs: REQ-125, REQ-148\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T05:39:32-05:00",
          "tree_id": "3a025daaac0dfff2f81c3f05930f2922418d82e9",
          "url": "https://github.com/pulseengine/rivet/commit/b097e49ea7b523d5ba4c627770ed05ae25c4ec2a"
        },
        "date": 1780397178636,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86314,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 949508,
            "range": "± 10870",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15556394,
            "range": "± 713216",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24973,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 362926,
            "range": "± 1991",
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
            "value": 1430609,
            "range": "± 14947",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167345,
            "range": "± 817",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1948494,
            "range": "± 15784",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42245995,
            "range": "± 5885746",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 137009,
            "range": "± 4351",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1271303,
            "range": "± 14161",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 19561737,
            "range": "± 4260572",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4177,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44599,
            "range": "± 1060",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757531,
            "range": "± 7019",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 66103,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 754610,
            "range": "± 11864",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8311482,
            "range": "± 473848",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 765,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 6536,
            "range": "± 82",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 95635,
            "range": "± 615",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21259,
            "range": "± 273",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146018,
            "range": "± 799",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1360606,
            "range": "± 17449",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "737a99caa217c45eb5179d0249ebb4076441114e",
          "message": "docs(schemas): recipe for extending a built-in artifact type with project fields (REQ-149, #350) (#395)\n\n#350 suggestion 4: a project's `crate:` field on an ASPICE `sw-req`\nproduced dozens of `INFO: field 'crate' is not defined in schema`\nadvisories, and the reporter asked for an easy per-project field\nextension without forking the schema.\n\nVerified the mechanism already exists — `ArtifactTypeDef::merge_in_place`\nunions `fields` by name across schemas sharing a type name, so a\nproject-local schema re-declaring the built-in type with only the extra\nfield (registered after the built-in in `project.schemas`) adds the\nfield without forking. Confirmed empirically: with the extension the\n`crate` INFO disappears; without it, it's present.\n\nIt was just undocumented. Added the \"Extending a built-in artifact type\nwith project fields\" recipe to docs/schemas.md (copy-pasteable, plus the\n`--min-severity warning` alternative), and corrected the merging-behavior\nnote (same-named artifact types merge fields by name; they don't replace\nwholesale). `rivet docs check` PASS.\n\nImplements: REQ-149\nRefs: REQ-010\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T06:35:48-05:00",
          "tree_id": "a460dba62fb4850519d6889cff2ebcea1b80b35b",
          "url": "https://github.com/pulseengine/rivet/commit/737a99caa217c45eb5179d0249ebb4076441114e"
        },
        "date": 1780400549507,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85051,
            "range": "± 333",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918604,
            "range": "± 8403",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14614623,
            "range": "± 348828",
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
            "value": 24979,
            "range": "± 338",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 368567,
            "range": "± 3476",
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
            "value": 1437697,
            "range": "± 18866",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167265,
            "range": "± 899",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1949367,
            "range": "± 25171",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28816203,
            "range": "± 434255",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 128677,
            "range": "± 2345",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1219694,
            "range": "± 12625",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14273310,
            "range": "± 228383",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4092,
            "range": "± 22",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45132,
            "range": "± 176",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 749984,
            "range": "± 5665",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61933,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 730309,
            "range": "± 3152",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8217909,
            "range": "± 696764",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 771,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7006,
            "range": "± 35",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 94603,
            "range": "± 450",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21067,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 146721,
            "range": "± 653",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1356043,
            "range": "± 10348",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8891494b2bfea0335682ec1ce4c05072fb8140d5",
          "message": "chore(artifacts): dogfood REQ audit — flip REQ-134 implemented, reconcile REQ-149 duplicate, file REQ-150 (#396)\n\nUsed `rivet list --type requirement` + `--explain` to audit the REQs\nfiled over recent iterations. Findings, each verified against merged\ncode (not flipped blindly):\n\n- REQ-134 (per-project field extension) → implemented: both acceptance\n  criteria are met — the schema-merge field-union mechanism works\n  (verified empirically) and it's documented in docs/schemas.md (#395).\n- REQ-149 was an accidental duplicate of REQ-134 (filed before noticing\n  the pre-existing one). Linked REQ-149 -> REQ-134 and tagged it so the\n  relationship is explicit rather than a stray parallel item.\n- Left correctly-draft: REQ-128 (orphans filter shipped, but the\n  inbound-count ranking report is still outstanding), REQ-132 (single-hop\n  link naming done in REQ-147; the multi-hop chain naming is not),\n  REQ-135 (validate/modify enforcement built but inert pending the\n  maintainer's canonical status set + artifact reconciliation).\n- Filed REQ-150 (draft): `rivet add` warns on no near-duplicate, only\n  duplicate id — the gap that let me file REQ-149. A non-blocking\n  \"similar to <ID>\" advisory would catch it.\n\n`rivet validate` PASS.\n\nImplements: REQ-134\nRefs: REQ-149, REQ-150, REQ-010\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T07:36:32-05:00",
          "tree_id": "3731278dcabbc26eba4868063a3d01009439dbe3",
          "url": "https://github.com/pulseengine/rivet/commit/8891494b2bfea0335682ec1ce4c05072fb8140d5"
        },
        "date": 1780404190661,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83250,
            "range": "± 470",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 869975,
            "range": "± 12222",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17282984,
            "range": "± 2427530",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2142,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27472,
            "range": "± 289",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 386900,
            "range": "± 2738",
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
            "value": 93,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1451574,
            "range": "± 17472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163501,
            "range": "± 2361",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1933336,
            "range": "± 14256",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25284311,
            "range": "± 1141574",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139306,
            "range": "± 1289",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1201425,
            "range": "± 25355",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 12996001,
            "range": "± 417453",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4160,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60925,
            "range": "± 257",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 845768,
            "range": "± 1628",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60959,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697258,
            "range": "± 6255",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7771074,
            "range": "± 117800",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 778,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7556,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 115362,
            "range": "± 1046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23375,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167156,
            "range": "± 3540",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1538263,
            "range": "± 34666",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "ca21dc15a282f0bec2ab32adad1fdfe6ecb0f251",
          "message": "feat(list): --rank-by-backlinks — rank artifacts by inbound-link count (REQ-128) (#398)\n\nCompletes REQ-128: `--orphans` finds artifacts with no links (asserted-\nbut-unanchored); this adds the complement — rank by inbound-link count\n(descending) to surface the most depended-upon artifacts, i.e. the\nhighest-impact-if-changed hubs.\n\n- Text: an inbound-count column (\"  58 in  REQ-004 …  23 out  …\").\n- JSON: an `inbound_links` field per artifact.\n- Built on `LinkGraph::backlinks_to`; exact integer counts only (no\n  semantic/relevance ranking, per REQ-128 acceptance); deterministic,\n  ties break by id. Composes with `--type` / `--filter`.\n\nOn the rivet corpus the top requirements are REQ-004 (Validation engine,\n58 inbound), REQ-014, REQ-007, REQ-010 — the central nodes.\n\nIntegration test asserts the ordering is non-increasing and every entry\ncarries inbound_links; clippy --all-targets + fmt clean; rivet validate\n+ docs check PASS. REQ-128 flipped to implemented (both halves now done).\n\nImplements: REQ-128\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T08:42:55-05:00",
          "tree_id": "a6d257aa2d9e017af5198918d38cea7d4a11cd15",
          "url": "https://github.com/pulseengine/rivet/commit/ca21dc15a282f0bec2ab32adad1fdfe6ecb0f251"
        },
        "date": 1780408189511,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83622,
            "range": "± 3146",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893786,
            "range": "± 7127",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15099956,
            "range": "± 737273",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2202,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26194,
            "range": "± 87",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 372511,
            "range": "± 5080",
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
            "value": 1463116,
            "range": "± 37155",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160562,
            "range": "± 3595",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1912653,
            "range": "± 25438",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30332938,
            "range": "± 3099886",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 140926,
            "range": "± 2137",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1244294,
            "range": "± 12393",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 23340502,
            "range": "± 3313596",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4268,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61620,
            "range": "± 419",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 799476,
            "range": "± 6000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61563,
            "range": "± 443",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689195,
            "range": "± 3541",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8530499,
            "range": "± 892399",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 757,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7280,
            "range": "± 52",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117790,
            "range": "± 737",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23038,
            "range": "± 109",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161038,
            "range": "± 514",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1507922,
            "range": "± 19121",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8e9bb4d40478d15bac51024b0050f2847d12ae48",
          "message": "feat(cli): global -q/--quiet flag to suppress the WARN log preamble (REQ-151, #353) (#399)\n\n#353 feature ask: every invocation can emit WARN-level log lines before a\ncommand's real output (e.g. \"could not load externals: …\"), noise for\nscripted/agent consumption — especially with `--format json`. There was\n`-v/--verbose` to raise the log level but no way to lower it below the\ndefault `warn`.\n\nAdd a global `-q/--quiet` (mutually exclusive with `--verbose`) that sets\nthe log filter to `error`: the WARN preamble is suppressed while the\ncommand's own stdout and hard-error reporting stay intact. Pairs with\n`--format json` for clean machine-consumable output.\n\nVerified: on a project with a misconfigured external, default emits\n`[WARN rivet] could not load externals: …` but `--quiet` emits nothing on\nstderr and stdout still lists the artifact; a hard config error is still\nreported under `--quiet`. New `cli_commands::quiet_suppresses_warn_preamble`\ntest; clippy --all-targets + fmt clean; rivet validate + docs check PASS.\n\nAlso records (verified this iteration, no code needed): #353 part 3 (the\n\"tight modify loop silently no-op'd\" race) does NOT reproduce on current\nmain — 90/90 rapid sequential `modify`s succeeded and persisted across 3\ntrials; superseded anyway by `modify --where` (#380).\n\nImplements: REQ-151\nRefs: REQ-007\n\nCo-authored-by: Claude Opus 4.8 (1M context) <noreply@anthropic.com>",
          "timestamp": "2026-06-02T09:58:04-05:00",
          "tree_id": "c60a0d181a3ff03c9e5ca98844139d123b35b391",
          "url": "https://github.com/pulseengine/rivet/commit/8e9bb4d40478d15bac51024b0050f2847d12ae48"
        },
        "date": 1780412695479,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 82350,
            "range": "± 1064",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 882716,
            "range": "± 4971",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16847280,
            "range": "± 1657321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2112,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26356,
            "range": "± 148",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 376473,
            "range": "± 2160",
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
            "value": 1463446,
            "range": "± 26762",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163964,
            "range": "± 404",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1918470,
            "range": "± 58122",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37663218,
            "range": "± 6464910",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 140615,
            "range": "± 2408",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1233190,
            "range": "± 18180",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 25226909,
            "range": "± 2731368",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4206,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 64954,
            "range": "± 639",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 808011,
            "range": "± 18486",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59019,
            "range": "± 219",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706171,
            "range": "± 4126",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10362894,
            "range": "± 885449",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 747,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7328,
            "range": "± 314",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 117962,
            "range": "± 667",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23362,
            "range": "± 332",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 161800,
            "range": "± 643",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1543497,
            "range": "± 42521",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "930e531ea57722eade917eb5fbc48d898f43bae9",
          "message": "release(v0.15.0): sub-directory-safe exports + agent-ergonomic CLI (#400)\n\nBump workspace version 0.14.0 -> 0.15.0 (+ vscode-rivet/package.json,\nCargo.lock) and finalize the CHANGELOG [0.15.0] section.\n\nHeadline: the Zola/HTML export no longer emits absolute\n`/<prefix>/artifacts/…` links that 404 on a sub-directory deploy\n(REQ-115/116/118) — that fix merged ~17h after v0.14.0 was tagged, so\n0.14.0 users still hit it; this ships it. Also: external `prefix:ID`\nresolution for hyphenated slugs (REQ-143), the localhost-oEmbed drop\n(REQ-117), the export build smoke check (REQ-138), query-driven\n`modify --where` (REQ-141), `list --rank-by-backlinks` (REQ-128),\nglobal `--quiet` (REQ-151), `validate --explain` (REQ-125) /\n`--min-severity` (REQ-137), the salsa status-gate soundness fix\n(REQ-146), the source-view whole-token match (REQ-144), and the\ntest-results `rivet_tc_id` property (REQ-145).\n\n`rivet validate` PASS; `rivet docs check` PASS (VersionConsistency\ngreen — all version files at 0.15.0).\n\nRefs: REQ-115, REQ-116, REQ-118, REQ-143",
          "timestamp": "2026-06-02T10:51:32-05:00",
          "tree_id": "df12cf44503df0f2ff1e6df9adddc7a6526dfa87",
          "url": "https://github.com/pulseengine/rivet/commit/930e531ea57722eade917eb5fbc48d898f43bae9"
        },
        "date": 1780415895043,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84502,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 896451,
            "range": "± 4890",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15179003,
            "range": "± 1065333",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2270,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25972,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379913,
            "range": "± 1913",
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
            "value": 1481618,
            "range": "± 19736",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165185,
            "range": "± 3056",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1891940,
            "range": "± 14607",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28210592,
            "range": "± 1805104",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 139001,
            "range": "± 2409",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 1212464,
            "range": "± 23437",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 14531088,
            "range": "± 1458099",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4278,
            "range": "± 23",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61466,
            "range": "± 264",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786409,
            "range": "± 6032",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61927,
            "range": "± 747",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689915,
            "range": "± 3884",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7738218,
            "range": "± 651751",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 801,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 7287,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 116522,
            "range": "± 1253",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23142,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160627,
            "range": "± 709",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1498523,
            "range": "± 19529",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
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
      }
    ]
  }
}