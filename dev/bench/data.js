window.BENCHMARK_DATA = {
  "lastUpdate": 1782543675760,
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
          "id": "9220c3a5fa556b0c256d9963cbe7061bddc6f905",
          "message": "feat(schema): cited-source usable on any type incl. verification (REQ-225, #556) (#565)\n\ncited-source (sha256-stamped, drift-checked) was declared only on requirement-ish\ntypes, so on a verification artifact (sw/unit/sys-verification) it was flagged\nunknown-field — even though requirement->test->evidence is exactly where a\ntamper-evident citation is wanted. Declare cited-source as a common base-field and\nteach the unknown-field check to treat base-field names as known on every type.\nThe drift checker discovers the field by name, so it now runs on verification\nartifacts too. common 0.2.0 -> 0.3.0.\n\nImplements: REQ-225\nRefs: REQ-010\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T10:49:00-05:00",
          "tree_id": "06d190f5079501cbd590d0dc2083c5059a513d6d",
          "url": "https://github.com/pulseengine/rivet/commit/9220c3a5fa556b0c256d9963cbe7061bddc6f905"
        },
        "date": 1782230281632,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83043,
            "range": "± 1070",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 876200,
            "range": "± 13676",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12971897,
            "range": "± 498564",
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
            "value": 25980,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370423,
            "range": "± 1777",
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
            "value": 1496469,
            "range": "± 10176",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165535,
            "range": "± 3048",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1907911,
            "range": "± 12200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23952179,
            "range": "± 192647",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 483333,
            "range": "± 2893",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17031303,
            "range": "± 171691",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1445059524,
            "range": "± 13529881",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4377,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59774,
            "range": "± 198",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746009,
            "range": "± 20357",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 57134,
            "range": "± 164",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688224,
            "range": "± 2028",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7382392,
            "range": "± 34023",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1296,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15815,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 349708,
            "range": "± 1583",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26268,
            "range": "± 160",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 190597,
            "range": "± 773",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1736436,
            "range": "± 33942",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "65008cb4414974afb6fb92ff089c6d40ad4078e5",
          "message": "feat(cli): `rivet verify <ID>` advances to verified on verifying evidence (REQ-226, #559) (#566)\n\nNothing advanced a requirement's status to verified from its test evidence:\nimport-results is a separate run-log, and coverage --tests mapped markers but\nnever wrote status. `rivet verify <ID>` advances an implemented artifact to\nverified iff it has verifying evidence — an incoming `verifies` link OR a\n`// rivet: verifies <ID>` source marker (scanned from src/ + tests/, or --scan).\nRefuses with an actionable message when there's no evidence; no-ops if already\nverified; rejects non-implemented states. The write reuses the modify\n--set-status path (schema-validated YAML edit).\n\nImplements: REQ-226\nRefs: REQ-007\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T11:05:46-05:00",
          "tree_id": "bf090fbb29f6778f9da76d0e1806bd16084f7895",
          "url": "https://github.com/pulseengine/rivet/commit/65008cb4414974afb6fb92ff089c6d40ad4078e5"
        },
        "date": 1782231279642,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83736,
            "range": "± 724",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883497,
            "range": "± 20118",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13805350,
            "range": "± 631965",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2190,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25757,
            "range": "± 197",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370566,
            "range": "± 1921",
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
            "value": 1494532,
            "range": "± 27465",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166836,
            "range": "± 1035",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902132,
            "range": "± 22127",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28088587,
            "range": "± 4220870",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 486982,
            "range": "± 2726",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17663314,
            "range": "± 157139",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1458580112,
            "range": "± 10770301",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4365,
            "range": "± 54",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 57389,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744298,
            "range": "± 3224",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62581,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 678037,
            "range": "± 3849",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7612474,
            "range": "± 213162",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1367,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15730,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 344300,
            "range": "± 1222",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25639,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 183484,
            "range": "± 1544",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1753748,
            "range": "± 33864",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "950f0aed9d00e186e45e6e841946783ac7a29c9a",
          "message": "chore(release): v0.18.0 — close the right side of the V (#568)\n\nRelease-prep for v0.18.0: bump workspace + VS Code extension + Cargo.lock to\n0.18.0; CHANGELOG [Unreleased] -> [0.18.0]. Scope (all merged): REQ-226/#559,\nREQ-222/#555, REQ-225/#556, REQ-224/#550, REQ-223/#552, REQ-221/#530, #560.\nSchemas: common@0.3.0, dev@0.2.0.\n\nTrace: skip\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T12:39:40-05:00",
          "tree_id": "d28ebd4f145673f0a40215254ad2d32904a16b5c",
          "url": "https://github.com/pulseengine/rivet/commit/950f0aed9d00e186e45e6e841946783ac7a29c9a"
        },
        "date": 1782236904160,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77579,
            "range": "± 373",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918487,
            "range": "± 3053",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 21513409,
            "range": "± 1340087",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1708,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19421,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 346079,
            "range": "± 2105",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1372937,
            "range": "± 9898",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158205,
            "range": "± 4624",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1889142,
            "range": "± 34548",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 56341760,
            "range": "± 1527247",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 435758,
            "range": "± 5435",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17208776,
            "range": "± 206871",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1112911608,
            "range": "± 7407696",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3956,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41033,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 809739,
            "range": "± 24515",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 54774,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 594644,
            "range": "± 3773",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7431446,
            "range": "± 538836",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 973,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11654,
            "range": "± 34",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 313960,
            "range": "± 2357",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23317,
            "range": "± 49",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170331,
            "range": "± 309",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1584830,
            "range": "± 24024",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f80298f7a064dcfd375bdae83518176380d000bc",
          "message": "fix(wasm): `rivet-core --features wasm` test build compiles — drop host-only Link.external (REQ-227, #543) (#569)\n\nDrop `external` from the two `wit::Link` constructors in wasm_runtime.rs. The host\nmodel::Link gained an `external` field (prefix:ID externals); an \"add it everywhere\"\npass leaked it into the WIT-generated types::Link, which carries only link-type +\ntarget, breaking `cargo test -p rivet-core --features wasm --tests` (E0560). external\nis a host-side composition concept the wasm guest ABI doesn't model; host->WIT omits\nit, WIT->host keeps `external: None`. The .wit is unchanged (guest contract source of\ntruth; no spar regen).\n\nFixes: REQ-227\nRefs: REQ-008\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T13:21:25-05:00",
          "tree_id": "683dda81a095655533fa6b0ac3ade376d9d0c810",
          "url": "https://github.com/pulseengine/rivet/commit/f80298f7a064dcfd375bdae83518176380d000bc"
        },
        "date": 1782239421235,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86588,
            "range": "± 402",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 908096,
            "range": "± 3509",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13125515,
            "range": "± 423288",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2164,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26529,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391481,
            "range": "± 2359",
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
            "value": 1497520,
            "range": "± 23011",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167970,
            "range": "± 1254",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920620,
            "range": "± 13627",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24326169,
            "range": "± 530624",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 479903,
            "range": "± 7836",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17012513,
            "range": "± 225393",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1456180799,
            "range": "± 9906918",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4355,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59464,
            "range": "± 199",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 744879,
            "range": "± 2927",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63045,
            "range": "± 503",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 709691,
            "range": "± 3407",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7565567,
            "range": "± 52538",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1292,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15141,
            "range": "± 89",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326874,
            "range": "± 909",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25745,
            "range": "± 243",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 183305,
            "range": "± 1284",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1717850,
            "range": "± 24152",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "74aa83069804ed5439ce3c9ff30c79c0090a65ba",
          "message": "fix(yaml): parse plain multi-line scalars as sequence items (#572)\n\nparse_block_sequence now consumes continuation lines of a plain scalar\nsequence item (reusing is_plain_scalar_continuation), fixing false\n\"expected . after mapping key\" errors and the silent dropping of the\nlinks: block that followed — which had let rivet validate return a false\nPASS over broken traceability. Fixes #570.\n\nTrace: skip",
          "timestamp": "2026-06-23T22:35:19-05:00",
          "tree_id": "4e218e9c5067d78fb651e2f7f29c2c19872571f2",
          "url": "https://github.com/pulseengine/rivet/commit/74aa83069804ed5439ce3c9ff30c79c0090a65ba"
        },
        "date": 1782272649598,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84993,
            "range": "± 306",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 918693,
            "range": "± 9568",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15109120,
            "range": "± 1591883",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1934,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25284,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365888,
            "range": "± 1716",
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
            "value": 1471510,
            "range": "± 22806",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167813,
            "range": "± 7465",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1978581,
            "range": "± 49489",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33111637,
            "range": "± 5086489",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 465576,
            "range": "± 3020",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18019906,
            "range": "± 323457",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1400072017,
            "range": "± 22200424",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4221,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 47499,
            "range": "± 823",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 745762,
            "range": "± 17363",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63883,
            "range": "± 286",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 731158,
            "range": "± 5983",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8823317,
            "range": "± 563647",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1158,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14357,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 236809,
            "range": "± 6839",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23551,
            "range": "± 385",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164064,
            "range": "± 4505",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1580042,
            "range": "± 64580",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c33b2554a9aa7779a079431c0c0ca235af1ed2cd",
          "message": "feat(coverage): combined V-closure metric — satisfied AND verified (REQ-228) (#571)\n\nPer-rule coverage reports satisfied and verified separately, hiding the\nintersection a release needs: a requirement is closed in the V only when BOTH\nsides are. Add CoverageReport::v_closure() — for every source type with >1\ntraceability rule, the share not strictly missing on ANY applicable rule\n(covered OR external-boundary, the 3-state accounted convention). rivet coverage\nprints a V-closure: line per type; --format json adds a closure array. On this\nrepo requirements are 12.8% V-closed (29/227) vs 25.1% satisfied.\n\nImplements: REQ-228\nRefs: REQ-004\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-23T22:49:19-05:00",
          "tree_id": "78f55be335a3c676b8048b59fadd065f01945856",
          "url": "https://github.com/pulseengine/rivet/commit/c33b2554a9aa7779a079431c0c0ca235af1ed2cd"
        },
        "date": 1782273487385,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84895,
            "range": "± 355",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 909329,
            "range": "± 18790",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15041732,
            "range": "± 1076114",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1930,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24772,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 360262,
            "range": "± 1539",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 97,
            "range": "± 4",
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
            "value": 1473162,
            "range": "± 22411",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169929,
            "range": "± 1262",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1994513,
            "range": "± 21782",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30657536,
            "range": "± 2028242",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 466915,
            "range": "± 1627",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 18347976,
            "range": "± 206937",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1387216238,
            "range": "± 20053667",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4204,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43127,
            "range": "± 705",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737225,
            "range": "± 3714",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59717,
            "range": "± 650",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 717750,
            "range": "± 9804",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8542491,
            "range": "± 592460",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1277,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15472,
            "range": "± 288",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 242874,
            "range": "± 2842",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24093,
            "range": "± 80",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172027,
            "range": "± 462",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1629553,
            "range": "± 18672",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "a251fbd89608130973b888ee51c6807fc116d7fc",
          "message": "chore(release): v0.19.0 — measure the V (#575)\n\nBump workspace + VS Code extension + Cargo.lock to 0.19.0; CHANGELOG -> [0.19.0].\nScope: REQ-228/#571 (V-closure metric), REQ-227/#543 (wasm test build), #572/#570\n(yaml multi-line scalar). Schemas unchanged.\n\nTrace: skip\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T00:00:39-05:00",
          "tree_id": "d022723ae8b36a62261c1eda61c066e7ca0f3847",
          "url": "https://github.com/pulseengine/rivet/commit/a251fbd89608130973b888ee51c6807fc116d7fc"
        },
        "date": 1782278162764,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77712,
            "range": "± 405",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 949864,
            "range": "± 9423",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15593524,
            "range": "± 976569",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1689,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19402,
            "range": "± 73",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 343439,
            "range": "± 860",
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
            "value": 1380021,
            "range": "± 40978",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157980,
            "range": "± 374",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1866206,
            "range": "± 81659",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 40296411,
            "range": "± 2080701",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 432281,
            "range": "± 3827",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15312921,
            "range": "± 233993",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 989987931,
            "range": "± 8146748",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3933,
            "range": "± 121",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40532,
            "range": "± 107",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 742573,
            "range": "± 3087",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52508,
            "range": "± 116",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 587704,
            "range": "± 1788",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8529398,
            "range": "± 557988",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 910,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11661,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 298933,
            "range": "± 1534",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23024,
            "range": "± 62",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171518,
            "range": "± 411",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1600272,
            "range": "± 12056",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "0caff9a6f8a46e8bd627e9998721609a5b9500e6",
          "message": "docs(design): SQL virtual-table facade over the live store — CLI-first, no MCP required (REQ-229, DD-068) (#578)\n\nDesign artifacts (REQ-229 + DD-068): SQL query interface over the artifact graph\nvia SQLite virtual tables (rusqlite vtab) backed by the live store. Baseline\ntransport is `rivet sql \"<query>\"` (no MCP, no server); serve POST /sql + MCP\nrivet_sql tool are additive. Read-only MVP first; writable xUpdate is a gated\nsecond slice.\n\nRefs: REQ-229, DD-068\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T13:10:25-05:00",
          "tree_id": "30757475e9b128667e2eae59fd788127351f9b75",
          "url": "https://github.com/pulseengine/rivet/commit/0caff9a6f8a46e8bd627e9998721609a5b9500e6"
        },
        "date": 1782325156752,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85115,
            "range": "± 455",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 892822,
            "range": "± 3564",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12706433,
            "range": "± 452368",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2285,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26801,
            "range": "± 86",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383445,
            "range": "± 1824",
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
            "value": 1478411,
            "range": "± 28439",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160355,
            "range": "± 693",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1904030,
            "range": "± 16303",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26027379,
            "range": "± 2728907",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 476181,
            "range": "± 2117",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17152993,
            "range": "± 123080",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1405294957,
            "range": "± 14955436",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 5165,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60766,
            "range": "± 5807",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 736963,
            "range": "± 2894",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61882,
            "range": "± 260",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 705092,
            "range": "± 6661",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7670996,
            "range": "± 790083",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1183,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14737,
            "range": "± 256",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 326735,
            "range": "± 602",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26235,
            "range": "± 189",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 189916,
            "range": "± 2011",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1738608,
            "range": "± 20035",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "40c8e3d5b89e5b139f6e7707ce873b453830edce",
          "message": "feat(sql): `rivet sql` — read-only SQL over the store, no MCP/server (REQ-229) (#580)\n\nRead-only SQL facade over the artifact store. `rivet sql \"<query>\"` projects the\nlive store into an ephemeral in-memory SQLite (artifacts/links/fields/provenance)\nand runs read-only SQL — no server, no MCP. table/json/csv output; writes refused.\nFeature-gated sql (default, bundled SQLite). The V-closure set is now one query.\n\nImplements: REQ-229\nRefs: DD-068\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T14:59:59-05:00",
          "tree_id": "0838c5c449c6e9572f950c1747920ba5cdf293ea",
          "url": "https://github.com/pulseengine/rivet/commit/40c8e3d5b89e5b139f6e7707ce873b453830edce"
        },
        "date": 1782332070730,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85765,
            "range": "± 2378",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 921690,
            "range": "± 4432",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16896528,
            "range": "± 1461969",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1996,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24707,
            "range": "± 84",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 369009,
            "range": "± 3359",
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
            "value": 1479008,
            "range": "± 27515",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169204,
            "range": "± 1931",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2008536,
            "range": "± 46704",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 47421570,
            "range": "± 6228502",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461975,
            "range": "± 2026",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 19487887,
            "range": "± 657696",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1467947400,
            "range": "± 29735275",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4232,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43410,
            "range": "± 735",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 737933,
            "range": "± 24372",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64460,
            "range": "± 238",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 721480,
            "range": "± 9021",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8112549,
            "range": "± 539864",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1290,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14851,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 244904,
            "range": "± 5210",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23507,
            "range": "± 95",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169076,
            "range": "± 831",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1586355,
            "range": "± 53847",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "773cc3c1fde683cc0948ee612e5f792b5f47e125",
          "message": "feat(sql): `rivet sql` write slice — UPDATE via validate + safe YAML edit (REQ-230) (#582)\n\nSQL write slice: `rivet sql \"UPDATE artifacts SET status='verified' WHERE id='X'\"`\nroutes through plan_write (staging diff) -> validate_modify -> the indentation-safe\nmodify_artifact_in_file editor (preserves sibling fields, no allowlist drop).\nAll-or-nothing: invalid values rejected before any write. fields/links/INSERT/DELETE\nrefused. No MCP/server. core 7/7, cli 3/3 incl. round-trip fidelity.\n\nImplements: REQ-230\nRefs: DD-068, REQ-229\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T16:14:26-05:00",
          "tree_id": "4f41bcad4f80376ed3532da9e2a34ccbe87cb42d",
          "url": "https://github.com/pulseengine/rivet/commit/773cc3c1fde683cc0948ee612e5f792b5f47e125"
        },
        "date": 1782336206059,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85740,
            "range": "± 638",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 885471,
            "range": "± 7111",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12821384,
            "range": "± 441812",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26919,
            "range": "± 333",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 391665,
            "range": "± 3590",
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
            "value": 1466931,
            "range": "± 36743",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164623,
            "range": "± 1983",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1932893,
            "range": "± 9937",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27019622,
            "range": "± 805106",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 454118,
            "range": "± 11976",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17801078,
            "range": "± 95577",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1469432635,
            "range": "± 15820216",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4315,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60330,
            "range": "± 353",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 746710,
            "range": "± 4258",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59987,
            "range": "± 526",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 725073,
            "range": "± 5061",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8011502,
            "range": "± 139627",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1200,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15662,
            "range": "± 59",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 330545,
            "range": "± 5718",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 26362,
            "range": "± 194",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 191439,
            "range": "± 1005",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1767225,
            "range": "± 24898",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "829013299d4153d1e9935fd8810fbbe392a5f863",
          "message": "design: adopt gluesql-core as the SQL engine, drop bundled SQLite (DD-069, REQ-231) (#585)\n\nDD-069 + REQ-231: migrate the rivet sql engine from rusqlite (bundled SQLite C)\nto gluesql-core (pure Rust). Prototype-verified: dialect works (V-closure JOIN +\nUPDATE), gluesql-core is pure Rust no cc (~19s vs umbrella crate's 55s + cc),\nasync via block_on. Removes the SQLite-C CI compile weight (#567).\n\nRefs: REQ-231, DD-069, REQ-229\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T22:48:41-05:00",
          "tree_id": "eda15dded68f04df3c0d262b7ff15a786b487d4c",
          "url": "https://github.com/pulseengine/rivet/commit/829013299d4153d1e9935fd8810fbbe392a5f863"
        },
        "date": 1782359834591,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 77823,
            "range": "± 499",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 948439,
            "range": "± 10845",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13416727,
            "range": "± 1091231",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1687,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19317,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 342745,
            "range": "± 1233",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1387106,
            "range": "± 48832",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 157222,
            "range": "± 472",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1820027,
            "range": "± 12833",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28111813,
            "range": "± 3093018",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 434383,
            "range": "± 2112",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14315475,
            "range": "± 235500",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 975436679,
            "range": "± 4711654",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3976,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40478,
            "range": "± 90",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748118,
            "range": "± 3100",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52810,
            "range": "± 1457",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 595981,
            "range": "± 10881",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6734738,
            "range": "± 451192",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 911,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11731,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 300740,
            "range": "± 2046",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23457,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 171153,
            "range": "± 424",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1617597,
            "range": "± 44584",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "db5395bf125d6b60aad0a9697583db8d6ee7e906",
          "message": "feat(serve): POST /api/v1/sql — read-only SQL over the live server (REQ-229) (#583)\n\nExposes rivet_core::sql over HTTP (POST /api/v1/sql) so a running serve is\nqueryable by any agent that can POST JSON — no MCP. Read-only by design;\ncross-origin requests rejected 403 (permissive-CORS exfiltration guard);\nnon-SELECT 400. Read-only is guaranteed at the executor layer (ephemeral\nin-memory db, no write-back).\n\nRefs: REQ-229, DD-068\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T22:48:44-05:00",
          "tree_id": "a4572fa9a353ae575b283cc107150f67fded2e45",
          "url": "https://github.com/pulseengine/rivet/commit/db5395bf125d6b60aad0a9697583db8d6ee7e906"
        },
        "date": 1782360811453,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87203,
            "range": "± 1688",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 941882,
            "range": "± 3333",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13484781,
            "range": "± 403454",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1948,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25093,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373585,
            "range": "± 2447",
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
            "value": 1482951,
            "range": "± 22170",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 169933,
            "range": "± 793",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1970157,
            "range": "± 14981",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27688140,
            "range": "± 165235",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470216,
            "range": "± 2116",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17944021,
            "range": "± 217910",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1371703232,
            "range": "± 19542943",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4149,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44278,
            "range": "± 867",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 728259,
            "range": "± 2156",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64963,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 719152,
            "range": "± 9258",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8019536,
            "range": "± 51625",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1210,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14965,
            "range": "± 123",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 237633,
            "range": "± 3019",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23794,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172409,
            "range": "± 501",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1624292,
            "range": "± 37942",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "59b99c0ac5d79da48ab6aa829e3914b5abadc3a2",
          "message": "feat(sql): migrate engine rusqlite → gluesql-core, drop bundled SQLite (REQ-231) (#586)\n\nSwap the SQL engine from rusqlite (bundled SQLite C) to gluesql-core (pure Rust)\nbehind the unchanged sql::query/plan_write API. Removes the SQLite-C compile from\nevery CI job (#567 weight). Behavior identical — core 7/7, cli 3/3, serve 1/1 all\npass. rusqlite + libsqlite3-sys removed. Enables a native gluesql Store/StoreMut\n(virtual tables) as the path to INSERT/DELETE/fields/links writes.\n\nImplements: REQ-231\nRefs: DD-069, REQ-229, REQ-230\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T23:32:29-05:00",
          "tree_id": "16467472a5ab3900af0e16d6220bb5ffe472f52b",
          "url": "https://github.com/pulseengine/rivet/commit/59b99c0ac5d79da48ab6aa829e3914b5abadc3a2"
        },
        "date": 1782362563022,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85861,
            "range": "± 1632",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 901045,
            "range": "± 3394",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12970030,
            "range": "± 986603",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2152,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25364,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379750,
            "range": "± 4671",
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
            "value": 1480431,
            "range": "± 20044",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 162047,
            "range": "± 1200",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1927297,
            "range": "± 18511",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25355776,
            "range": "± 602440",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458644,
            "range": "± 1511",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16637061,
            "range": "± 130073",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1380724636,
            "range": "± 12885350",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4187,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63934,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 757171,
            "range": "± 14316",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 56786,
            "range": "± 1651",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696701,
            "range": "± 2816",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7660967,
            "range": "± 308807",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1214,
            "range": "± 28",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15130,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 327442,
            "range": "± 6367",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25272,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 181584,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1729245,
            "range": "± 23295",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3f12f437ff99891b3adda9ba3c9e334cd7a616a6",
          "message": "docs(status): advance SQL REQs via dogfooding — 229/230 verified, 231 implemented (#587)\n\nFlipped REQ-229/230/231 to implemented via `rivet sql UPDATE` (the write feature\non the gluesql engine), then `rivet verify REQ-229/230` to verified on their\nsource markers. rivet validate PASS — round-trip fidelity on real artifacts.\n\nRefs: REQ-229, REQ-230, REQ-231, REQ-226\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-24T23:51:22-05:00",
          "tree_id": "74fc4c0e490bf4da7baa34350179287cb1123a2a",
          "url": "https://github.com/pulseengine/rivet/commit/3f12f437ff99891b3adda9ba3c9e334cd7a616a6"
        },
        "date": 1782363630954,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85360,
            "range": "± 1576",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897012,
            "range": "± 4142",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12141812,
            "range": "± 275642",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 23750,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 365017,
            "range": "± 792",
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
            "value": 1481251,
            "range": "± 15279",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167285,
            "range": "± 623",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1926066,
            "range": "± 13856",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24203389,
            "range": "± 189442",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 459014,
            "range": "± 1431",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16618013,
            "range": "± 110471",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1389935910,
            "range": "± 10821481",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4277,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63073,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 739785,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62796,
            "range": "± 261",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 693517,
            "range": "± 2826",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7511446,
            "range": "± 53096",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1243,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15766,
            "range": "± 64",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 319095,
            "range": "± 1071",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25420,
            "range": "± 945",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184423,
            "range": "± 1267",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1747627,
            "range": "± 12273",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1c185abc3fa8dac0695a8d414433985417ec47ec",
          "message": "docs: sync documentation with current implementation (#584)\n\nAudited docs against the live binary: fixed a broken README demo command,\nunderstated export formats, stale MCP tool count + curl URL, incomplete preset\nlist; documented rivet sql (read+write), rivet verify, the V-closure coverage\nmetric, cited-source base field, vendor-schemas. rivet docs check PASS.\n\nRefs: REQ-229, REQ-230\nCo-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>",
          "timestamp": "2026-06-25T05:10:08-05:00",
          "tree_id": "4b3a7e927d93e032790b7398b8458976145ca6f1",
          "url": "https://github.com/pulseengine/rivet/commit/1c185abc3fa8dac0695a8d414433985417ec47ec"
        },
        "date": 1782383062673,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85812,
            "range": "± 1472",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 945878,
            "range": "± 9456",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15021755,
            "range": "± 1953129",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1954,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25246,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357662,
            "range": "± 71587",
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
            "value": 96,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1475707,
            "range": "± 30640",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168084,
            "range": "± 807",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1999917,
            "range": "± 7213",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29725382,
            "range": "± 1214738",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463316,
            "range": "± 2508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16899363,
            "range": "± 153138",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1258865487,
            "range": "± 19809358",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4275,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44864,
            "range": "± 433",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 821722,
            "range": "± 4821",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63859,
            "range": "± 316",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 744618,
            "range": "± 6049",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8505173,
            "range": "± 178853",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1324,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16076,
            "range": "± 51",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 273723,
            "range": "± 2449",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23768,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 170774,
            "range": "± 372",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1627193,
            "range": "± 23913",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c3159616fd4a19a69520015e3aa2063989f4a0ab",
          "message": "Merge pull request #589 from pulseengine/release/v0.20.0\n\nchore(release): v0.20.0 — SQL over the artifact store",
          "timestamp": "2026-06-25T11:26:03-05:00",
          "tree_id": "63ccdfa4b5cc4d4d3c7e52fb2de4030f96b58f3b",
          "url": "https://github.com/pulseengine/rivet/commit/c3159616fd4a19a69520015e3aa2063989f4a0ab"
        },
        "date": 1782405319155,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85277,
            "range": "± 438",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 907981,
            "range": "± 38066",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15693850,
            "range": "± 1459981",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2119,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24523,
            "range": "± 106",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366101,
            "range": "± 2315",
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
            "value": 1487903,
            "range": "± 12956",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163672,
            "range": "± 877",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1906142,
            "range": "± 53368",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 30286504,
            "range": "± 2314093",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 467395,
            "range": "± 8922",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17508124,
            "range": "± 242239",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1455041849,
            "range": "± 11728542",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4441,
            "range": "± 21",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61552,
            "range": "± 495",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 836266,
            "range": "± 11630",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62565,
            "range": "± 627",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 706853,
            "range": "± 4960",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9674697,
            "range": "± 823292",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1159,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16476,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 336336,
            "range": "± 4100",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24418,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 174073,
            "range": "± 849",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1641324,
            "range": "± 26134",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3fc2db946d081409ea25f4cea2ca54f6a680248a",
          "message": "Merge pull request #592 from pulseengine/fix/import-alias-test-cfg-gate\n\nfix(test): cfg-gate import-alias reqif test to match the alias (#293)",
          "timestamp": "2026-06-25T22:37:23-05:00",
          "tree_id": "5434d56457f2ca9c9d1b0604c67811d93d2e5fd4",
          "url": "https://github.com/pulseengine/rivet/commit/3fc2db946d081409ea25f4cea2ca54f6a680248a"
        },
        "date": 1782445885505,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 83969,
            "range": "± 1484",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 913096,
            "range": "± 19390",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15864865,
            "range": "± 1290861",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2151,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26307,
            "range": "± 144",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 373746,
            "range": "± 5128",
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
            "value": 1501189,
            "range": "± 28181",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164089,
            "range": "± 1207",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1902626,
            "range": "± 20864",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28294060,
            "range": "± 2679887",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 471679,
            "range": "± 6524",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17683678,
            "range": "± 618981",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1463613428,
            "range": "± 14511609",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4224,
            "range": "± 67",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59850,
            "range": "± 476",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 747638,
            "range": "± 3499",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61427,
            "range": "± 196",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 689608,
            "range": "± 3000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8033346,
            "range": "± 618330",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1245,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15865,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339823,
            "range": "± 8406",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24521,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 172903,
            "range": "± 3707",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1623855,
            "range": "± 37137",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "d969d74e5b75c73a3f461563a2e2acc720c21e6a",
          "message": "Merge pull request #593 from pulseengine/fix/573-flow-style-fields-corruption\n\nfix(modify): normalize flow-style `fields:` maps instead of corrupting them (#573)",
          "timestamp": "2026-06-25T23:05:51-05:00",
          "tree_id": "c35e80baa54200e3940431e303dc98ed86ca25e5",
          "url": "https://github.com/pulseengine/rivet/commit/d969d74e5b75c73a3f461563a2e2acc720c21e6a"
        },
        "date": 1782447910760,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84244,
            "range": "± 294",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 907920,
            "range": "± 51882",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13534799,
            "range": "± 542065",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2096,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25524,
            "range": "± 831",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351413,
            "range": "± 1979",
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
            "value": 1466304,
            "range": "± 10691",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159751,
            "range": "± 1111",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1908366,
            "range": "± 16522",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 27771933,
            "range": "± 1673164",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 467153,
            "range": "± 2095",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15907239,
            "range": "± 231647",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1279053142,
            "range": "± 19484029",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4320,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58958,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 751556,
            "range": "± 4053",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61686,
            "range": "± 948",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 688627,
            "range": "± 3682",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7822017,
            "range": "± 212085",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1127,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15026,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 323274,
            "range": "± 4376",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24984,
            "range": "± 180",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180667,
            "range": "± 4947",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1701612,
            "range": "± 28580",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "55331f40a195a458a7258a39118b6b5f8879a434",
          "message": "Merge pull request #594 from pulseengine/test/574-verify-workspace-scan-guard\n\ntest(verify): guard workspace-layout default marker scan (#574)",
          "timestamp": "2026-06-25T23:51:09-05:00",
          "tree_id": "5314ab81cb00392c6253686ec5aedb0cd9c8b2e2",
          "url": "https://github.com/pulseengine/rivet/commit/55331f40a195a458a7258a39118b6b5f8879a434"
        },
        "date": 1782450060487,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85067,
            "range": "± 1022",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 888693,
            "range": "± 5750",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12935785,
            "range": "± 668221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2259,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25574,
            "range": "± 108",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379335,
            "range": "± 1494",
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
            "value": 1474945,
            "range": "± 20385",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164038,
            "range": "± 4688",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1881341,
            "range": "± 24629",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37846210,
            "range": "± 2532558",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 474258,
            "range": "± 3984",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 17681949,
            "range": "± 297660",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1318938050,
            "range": "± 21080187",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4393,
            "range": "± 16",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61000,
            "range": "± 322",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 806132,
            "range": "± 2005",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63303,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 699761,
            "range": "± 2277",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7621582,
            "range": "± 87890",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1192,
            "range": "± 9",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14893,
            "range": "± 248",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 316070,
            "range": "± 3203",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25990,
            "range": "± 125",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 184743,
            "range": "± 1940",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1727444,
            "range": "± 23230",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "855f794fbcc7d1d0bc37251fede696808ee6557b",
          "message": "Merge pull request #595 from pulseengine/feat/516-release-field-core\n\nfeat(model): first-class `release:` field on artifacts (#516)",
          "timestamp": "2026-06-26T00:43:48-05:00",
          "tree_id": "3973ae1e620fc7d5158f6ddc4805034519020a30",
          "url": "https://github.com/pulseengine/rivet/commit/855f794fbcc7d1d0bc37251fede696808ee6557b"
        },
        "date": 1782453232285,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84944,
            "range": "± 966",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 908047,
            "range": "± 11186",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18072391,
            "range": "± 1333350",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2183,
            "range": "± 43",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27004,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 378051,
            "range": "± 2067",
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
            "value": 96,
            "range": "± 14",
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
            "value": 1467102,
            "range": "± 20470",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160643,
            "range": "± 1816",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1873874,
            "range": "± 113812",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 25785509,
            "range": "± 2601473",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 474489,
            "range": "± 3552",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15630432,
            "range": "± 172556",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1281094512,
            "range": "± 17534709",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4314,
            "range": "± 58",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 63639,
            "range": "± 622",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 852069,
            "range": "± 4235",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 65199,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 697149,
            "range": "± 25477",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8215795,
            "range": "± 938769",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1194,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15125,
            "range": "± 629",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 323798,
            "range": "± 4812",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25400,
            "range": "± 249",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180564,
            "range": "± 4001",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1648921,
            "range": "± 42534",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "49f1fa136dceae6ce02916a9aad88ac43ad38193",
          "message": "Merge pull request #596 from pulseengine/release/v0.21.0\n\nchore(release): v0.21.0 — Authoring & release ergonomics",
          "timestamp": "2026-06-26T01:26:12-05:00",
          "tree_id": "0acad4a654100ac06015dcc2d56c8a6aa81a6cf6",
          "url": "https://github.com/pulseengine/rivet/commit/49f1fa136dceae6ce02916a9aad88ac43ad38193"
        },
        "date": 1782455922469,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85456,
            "range": "± 783",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 929379,
            "range": "± 22697",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 19617313,
            "range": "± 1172391",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1963,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25022,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 351087,
            "range": "± 2104",
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
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1476786,
            "range": "± 96424",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165397,
            "range": "± 715",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1944300,
            "range": "± 99563",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 35896102,
            "range": "± 3039017",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 454984,
            "range": "± 2069",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15853200,
            "range": "± 158166",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1138299468,
            "range": "± 19910244",
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
            "value": 52802,
            "range": "± 424",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 727776,
            "range": "± 2759",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63528,
            "range": "± 147",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 733156,
            "range": "± 8219",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10632824,
            "range": "± 456676",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1300,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15062,
            "range": "± 44",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 235353,
            "range": "± 2470",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22491,
            "range": "± 212",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158670,
            "range": "± 718",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1473956,
            "range": "± 8351",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "11db4663619ce7fd29de4001438a0ccadeef455c",
          "message": "Merge pull request #598 from pulseengine/feat/490-per-id-source-layout\n\nfeat(add): per-id directory source layout for conflict-free parallel adds (#490)",
          "timestamp": "2026-06-26T03:46:21-05:00",
          "tree_id": "27c51c44cba2830cdf908947b24f91ea68c46d0e",
          "url": "https://github.com/pulseengine/rivet/commit/11db4663619ce7fd29de4001438a0ccadeef455c"
        },
        "date": 1782464348052,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78897,
            "range": "± 1194",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 949699,
            "range": "± 4203",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17249732,
            "range": "± 754509",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1680,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19362,
            "range": "± 110",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364670,
            "range": "± 3815",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 87,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 87,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1389332,
            "range": "± 48091",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161475,
            "range": "± 770",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1939624,
            "range": "± 43777",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42455032,
            "range": "± 2249295",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 428076,
            "range": "± 5348",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14503147,
            "range": "± 241828",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 914370645,
            "range": "± 5183624",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3930,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 40796,
            "range": "± 521",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 788714,
            "range": "± 7008",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 53109,
            "range": "± 411",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 590833,
            "range": "± 3936",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9092371,
            "range": "± 471351",
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
            "value": 11489,
            "range": "± 47",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 304970,
            "range": "± 1458",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23544,
            "range": "± 149",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 173852,
            "range": "± 643",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1637973,
            "range": "± 13711",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f489a91c2dd09b9ae3ab91bcb33749649d9c8cef",
          "message": "Merge pull request #600 from pulseengine/fix/set-field-insert-before-block\n\nfix(modify): insert new base fields after trailing block mappings, not inside",
          "timestamp": "2026-06-26T12:33:39-05:00",
          "tree_id": "8b5558ed8b568a53a8e9b99118ff639e10a1beac",
          "url": "https://github.com/pulseengine/rivet/commit/f489a91c2dd09b9ae3ab91bcb33749649d9c8cef"
        },
        "date": 1782495741452,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86509,
            "range": "± 2974",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925043,
            "range": "± 4234",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14831471,
            "range": "± 874389",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2054,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24919,
            "range": "± 263",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 366585,
            "range": "± 1098",
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
            "value": 1463947,
            "range": "± 18108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 166088,
            "range": "± 787",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1906752,
            "range": "± 27138",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28760784,
            "range": "± 604122",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 452472,
            "range": "± 1348",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15440549,
            "range": "± 133675",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1119098140,
            "range": "± 20345153",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4154,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45641,
            "range": "± 205",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 755969,
            "range": "± 8594",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63066,
            "range": "± 165",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 722338,
            "range": "± 10560",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8955673,
            "range": "± 365517",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1331,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15354,
            "range": "± 96",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 238638,
            "range": "± 1752",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22379,
            "range": "± 45",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 156270,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1476048,
            "range": "± 6932",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1e73574fe87053634e733de289e858af4b4ef4f9",
          "message": "Merge pull request #601 from pulseengine/release/v0.21.1\n\nchore(release): v0.21.1 — fix --set-release artifact corruption",
          "timestamp": "2026-06-26T12:50:54-05:00",
          "tree_id": "a9653fd39deb3248ec3b67814ed1e56bcf6376a5",
          "url": "https://github.com/pulseengine/rivet/commit/1e73574fe87053634e733de289e858af4b4ef4f9"
        },
        "date": 1782496797098,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86679,
            "range": "± 1020",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 912162,
            "range": "± 7659",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18454767,
            "range": "± 1768811",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2214,
            "range": "± 33",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25460,
            "range": "± 156",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 350593,
            "range": "± 3624",
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
            "value": 1530273,
            "range": "± 18738",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 164583,
            "range": "± 2141",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1973248,
            "range": "± 12668",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34760088,
            "range": "± 5940945",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 481706,
            "range": "± 6572",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15906703,
            "range": "± 411320",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1286969397,
            "range": "± 11886480",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4397,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60432,
            "range": "± 790",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 756032,
            "range": "± 4743",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 64107,
            "range": "± 414",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 708360,
            "range": "± 5373",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9216410,
            "range": "± 883288",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1242,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 16026,
            "range": "± 210",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318378,
            "range": "± 1875",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24811,
            "range": "± 346",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 175868,
            "range": "± 2880",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1641829,
            "range": "± 22095",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "59092c35234b44d7bc58a47d3c4ae9a52621d709",
          "message": "Merge pull request #602 from pulseengine/plan/v0.22-release-planning\n\nplan(v0.22): release-planning slices as requirements (release: v0.22.0)",
          "timestamp": "2026-06-27T00:05:11-05:00",
          "tree_id": "4f8922c012dc19ec4dd53be13f0e5478bb456b10",
          "url": "https://github.com/pulseengine/rivet/commit/59092c35234b44d7bc58a47d3c4ae9a52621d709"
        },
        "date": 1782537175265,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 73977,
            "range": "± 3063",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 777563,
            "range": "± 14883",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14923113,
            "range": "± 467865",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1592,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 20119,
            "range": "± 361",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 285388,
            "range": "± 4523",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 80,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 78,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 78,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1217480,
            "range": "± 21332",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 137562,
            "range": "± 2505",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1598690,
            "range": "± 29945",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24811330,
            "range": "± 918225",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 367208,
            "range": "± 6085",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12089229,
            "range": "± 244320",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 837256231,
            "range": "± 11635150",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3390,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 35216,
            "range": "± 455",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 595536,
            "range": "± 8324",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48327,
            "range": "± 627",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 540985,
            "range": "± 11385",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7039336,
            "range": "± 796792",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1008,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12719,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 191122,
            "range": "± 2618",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17750,
            "range": "± 218",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 124839,
            "range": "± 1099",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1190511,
            "range": "± 18123",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "87dfc154034845ed5305160d5cad6bbf0c1a1fc7",
          "message": "Merge pull request #604 from pulseengine/feat/req-232-list-release\n\nfeat(list): --release <ver> release-planning view (REQ-232, #516)",
          "timestamp": "2026-06-27T00:26:08-05:00",
          "tree_id": "8b3ee0e330749217d529b86a682292266ead1a83",
          "url": "https://github.com/pulseengine/rivet/commit/87dfc154034845ed5305160d5cad6bbf0c1a1fc7"
        },
        "date": 1782538492233,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84658,
            "range": "± 962",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 909319,
            "range": "± 4666",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12325188,
            "range": "± 722701",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2155,
            "range": "± 29",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27106,
            "range": "± 152",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 364501,
            "range": "± 1377",
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
            "value": 1475165,
            "range": "± 21816",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159901,
            "range": "± 455",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1915033,
            "range": "± 15774",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23922491,
            "range": "± 534867",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 461252,
            "range": "± 2803",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14911816,
            "range": "± 60636",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1246300403,
            "range": "± 14420379",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4383,
            "range": "± 25",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61376,
            "range": "± 217",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 797819,
            "range": "± 21065",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61250,
            "range": "± 379",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 707333,
            "range": "± 3620",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7680910,
            "range": "± 251844",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1162,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14748,
            "range": "± 76",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 338945,
            "range": "± 6587",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24631,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 176240,
            "range": "± 1122",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1604312,
            "range": "± 81646",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "1b33c6bcd01799bb0810ae5ff2d13dfdd6ec0bcc",
          "message": "Merge pull request #605 from pulseengine/feat/req-233-release-status\n\nfeat(release): rivet release status <ver> readiness burn-down (REQ-233, #516)",
          "timestamp": "2026-06-27T00:44:32-05:00",
          "tree_id": "efda2b7366cb7c5c1da54265022645708aec8203",
          "url": "https://github.com/pulseengine/rivet/commit/1b33c6bcd01799bb0810ae5ff2d13dfdd6ec0bcc"
        },
        "date": 1782539599487,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86162,
            "range": "± 348",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 898129,
            "range": "± 4221",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13254512,
            "range": "± 738493",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2083,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 24137,
            "range": "± 137",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 350256,
            "range": "± 2156",
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
            "range": "± 1",
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
            "value": 1488859,
            "range": "± 14550",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160836,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1920284,
            "range": "± 17664",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36168219,
            "range": "± 2005349",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 470192,
            "range": "± 2874",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16147028,
            "range": "± 199970",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1260681924,
            "range": "± 18597909",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4272,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 59174,
            "range": "± 328",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 748420,
            "range": "± 4491",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 63388,
            "range": "± 299",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 724411,
            "range": "± 7115",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 10102489,
            "range": "± 748851",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1320,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15709,
            "range": "± 78",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 325176,
            "range": "± 2387",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24221,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169831,
            "range": "± 1297",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1581191,
            "range": "± 14263",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "3bbe915187f6a14c1834b51add99f8bdf9231974",
          "message": "Merge pull request #606 from pulseengine/feat/req-234-release-move\n\nfeat(release): rivet release move <id> <ver> logged scope change (REQ-234, #516)",
          "timestamp": "2026-06-27T01:07:03-05:00",
          "tree_id": "9cc2bd7433a3dfa3534414f6f71725f3ac160fc8",
          "url": "https://github.com/pulseengine/rivet/commit/3bbe915187f6a14c1834b51add99f8bdf9231974"
        },
        "date": 1782540923054,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 78398,
            "range": "± 2231",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 925609,
            "range": "± 3113",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13826717,
            "range": "± 682216",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1705,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18531,
            "range": "± 126",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 330955,
            "range": "± 1132",
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
            "value": 90,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1387189,
            "range": "± 35020",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158492,
            "range": "± 326",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1828432,
            "range": "± 34023",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 36181646,
            "range": "± 2961016",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 427118,
            "range": "± 3453",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14388889,
            "range": "± 291734",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 925546825,
            "range": "± 4051589",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3901,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41027,
            "range": "± 279",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 714523,
            "range": "± 2161",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 51765,
            "range": "± 191",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 588624,
            "range": "± 2066",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8209027,
            "range": "± 687430",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 952,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11926,
            "range": "± 20",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 294765,
            "range": "± 2211",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22502,
            "range": "± 66",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159115,
            "range": "± 344",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1505877,
            "range": "± 27657",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "12b592093139a523bcf897c8a40a82133a48b5d1",
          "message": "Merge pull request #607 from pulseengine/feat/req-235-shard\n\nfeat(shard): rivet shard <file> splits a source into per-id files (REQ-235, #490)",
          "timestamp": "2026-06-27T01:25:23-05:00",
          "tree_id": "311e7caf9804b233e2c8b12ab8d73098a2498e16",
          "url": "https://github.com/pulseengine/rivet/commit/12b592093139a523bcf897c8a40a82133a48b5d1"
        },
        "date": 1782542293324,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85528,
            "range": "± 3597",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 910706,
            "range": "± 5418",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15865823,
            "range": "± 977075",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2148,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26367,
            "range": "± 1096",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363156,
            "range": "± 2257",
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
            "value": 1498651,
            "range": "± 15732",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 174772,
            "range": "± 1082",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2127578,
            "range": "± 14104",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34782551,
            "range": "± 2924354",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 474476,
            "range": "± 1812",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15778612,
            "range": "± 217257",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1256542925,
            "range": "± 13064314",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4412,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60037,
            "range": "± 224",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 760525,
            "range": "± 6801",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62191,
            "range": "± 930",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703390,
            "range": "± 2935",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9736601,
            "range": "± 810597",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1145,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15773,
            "range": "± 111",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 345993,
            "range": "± 8512",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 25418,
            "range": "± 77",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 180143,
            "range": "± 668",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1623733,
            "range": "± 20849",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "8542cb96909bda9455f425f723ea2140c66c335f",
          "message": "Merge pull request #608 from pulseengine/release/v0.22.0\n\nchore(release): v0.22.0 — Release planning, complete",
          "timestamp": "2026-06-27T01:47:19-05:00",
          "tree_id": "148785c956d2b604caecfae0a7a9d8b9ec0b3664",
          "url": "https://github.com/pulseengine/rivet/commit/8542cb96909bda9455f425f723ea2140c66c335f"
        },
        "date": 1782543674758,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67997,
            "range": "± 796",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 730864,
            "range": "± 2878",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11311600,
            "range": "± 307901",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1493,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 19356,
            "range": "± 36",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 266493,
            "range": "± 1628",
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
            "value": 1164431,
            "range": "± 20633",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 126113,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1465882,
            "range": "± 8561",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 21217324,
            "range": "± 341841",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 343098,
            "range": "± 1210",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11291113,
            "range": "± 36251",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 847531538,
            "range": "± 6173150",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3170,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 43172,
            "range": "± 358",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 578828,
            "range": "± 2492",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48043,
            "range": "± 92",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 525135,
            "range": "± 1917",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6130511,
            "range": "± 169379",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 930,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10938,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 168867,
            "range": "± 1587",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 17895,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 128931,
            "range": "± 1560",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1181999,
            "range": "± 13780",
            "unit": "ns/iter"
          }
        ]
      }
    ]
  }
}