window.BENCHMARK_DATA = {
  "lastUpdate": 1784256814891,
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
          "id": "d6b6002fb87360a4830b83bd29ebd64c9c856ee5",
          "message": "Merge pull request #670 from pulseengine/fix/crossbeam-epoch-rustsec-2026-0204\n\nfix(security): bump crossbeam-epoch 0.9.18→0.9.20 (RUSTSEC-2026-0204)",
          "timestamp": "2026-07-08T05:45:13+02:00",
          "tree_id": "0174bb9af8165cc7c05b3df0578307b509e2239a",
          "url": "https://github.com/pulseengine/rivet/commit/d6b6002fb87360a4830b83bd29ebd64c9c856ee5"
        },
        "date": 1783482911883,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84527,
            "range": "± 311",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 883743,
            "range": "± 11474",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13014277,
            "range": "± 605033",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2193,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25885,
            "range": "± 39",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370186,
            "range": "± 1303",
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
            "value": 1518010,
            "range": "± 16915",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161141,
            "range": "± 2492",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1896985,
            "range": "± 15804",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26726208,
            "range": "± 1228422",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458029,
            "range": "± 2167",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15073037,
            "range": "± 126508",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1237118706,
            "range": "± 17820336",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4302,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 70132,
            "range": "± 347",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792732,
            "range": "± 5220",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60417,
            "range": "± 162",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 692098,
            "range": "± 2520",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7609905,
            "range": "± 104587",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1345,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14991,
            "range": "± 142",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 320428,
            "range": "± 1042",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23886,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 168855,
            "range": "± 1622",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1596027,
            "range": "± 15260",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "68c916ab8d757575a6945744ca2cee7b404e8b2f",
          "message": "Merge pull request #675 from pulseengine/feat/req-245-backend-down-indicator\n\nfeat(serve): backend-unavailable banner when the serve process is down (REQ-245, #621)",
          "timestamp": "2026-07-08T18:50:39+02:00",
          "tree_id": "2855368cf86cc18286d339294ecca52133152c1c",
          "url": "https://github.com/pulseengine/rivet/commit/68c916ab8d757575a6945744ca2cee7b404e8b2f"
        },
        "date": 1783530012380,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 84691,
            "range": "± 2174",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 887009,
            "range": "± 8254",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13766146,
            "range": "± 957395",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2132,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25641,
            "range": "± 101",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357130,
            "range": "± 2265",
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
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1542559,
            "range": "± 46590",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 163625,
            "range": "± 716",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1921522,
            "range": "± 6891",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 33987965,
            "range": "± 3340441",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 458674,
            "range": "± 4594",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15300676,
            "range": "± 229632",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1258360560,
            "range": "± 18084266",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4326,
            "range": "± 26",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60364,
            "range": "± 339",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 767738,
            "range": "± 5820",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60433,
            "range": "± 246",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694017,
            "range": "± 5230",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8095740,
            "range": "± 213445",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1141,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14662,
            "range": "± 69",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 318284,
            "range": "± 3817",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24699,
            "range": "± 146",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 177277,
            "range": "± 1186",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1619009,
            "range": "± 13806",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "e06ef3618c8b6a9b728f8b950bbc946fc863dd95",
          "message": "Merge pull request #676 from pulseengine/feat/req-248-test-result-links\n\nfeat(results): per-result tracking links to PRs / remote issues (REQ-248, DD-072, #548)",
          "timestamp": "2026-07-08T23:11:39+02:00",
          "tree_id": "14b641fb6a2e682b9a8787993c2736e21b2f4bb8",
          "url": "https://github.com/pulseengine/rivet/commit/e06ef3618c8b6a9b728f8b950bbc946fc863dd95"
        },
        "date": 1783545625237,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85216,
            "range": "± 554",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 893496,
            "range": "± 37130",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12462646,
            "range": "± 471284",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2215,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25056,
            "range": "± 1729",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 370853,
            "range": "± 11358",
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
            "value": 1547080,
            "range": "± 53800",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 168391,
            "range": "± 546",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1914413,
            "range": "± 14938",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26914783,
            "range": "± 1321817",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 453997,
            "range": "± 3860",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15138252,
            "range": "± 178537",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1248027922,
            "range": "± 17652919",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4276,
            "range": "± 19",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60630,
            "range": "± 681",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 714608,
            "range": "± 1778",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58934,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 694710,
            "range": "± 2664",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8281828,
            "range": "± 611294",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1194,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15110,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328497,
            "range": "± 5155",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 24091,
            "range": "± 571",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 169307,
            "range": "± 3349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1608982,
            "range": "± 24329",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7c23a4ec0f1ea96667f56707ff915c87d22bf6dd",
          "message": "feat(schema): warn when an embedded schema version drifts from a rivet.yaml pin (REQ-249, DD-073, #431) (#679)\n\nAdds a user-owned `project.schema-pins` map to rivet.yaml recording the\nexpected version per schema. `rivet validate` compares each resolved\nschema version against its pin and warns on stderr when they drift — the\nsilent-upgrade case where an embedded-schema bump changes validation out\nfrom under a project.\n\n.rivet-version already records scaffolded_from.schemas but is regenerated\non `rivet upgrade`, so it cannot serve as a stable pin baseline; a\nuser-owned map in rivet.yaml can (DD-073).\n\nWarnings go to stderr so `--format json` on stdout stays machine-clean.\nEscalation to a hard error under a strict flag is left as a follow-on.\n\nConfirmed with the new embedded::tests::schema_pin_drift_is_detected unit\ntest and a full `rivet validate` pass (Result: PASS).\n\nImplements: REQ-249\nRefs: DD-073, FEAT-001",
          "timestamp": "2026-07-09T07:51:09+02:00",
          "tree_id": "8351eca628954b16425ad6aace1c9b20a22d1715",
          "url": "https://github.com/pulseengine/rivet/commit/7c23a4ec0f1ea96667f56707ff915c87d22bf6dd"
        },
        "date": 1783576880263,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 76035,
            "range": "± 1680",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 906621,
            "range": "± 13752",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16354614,
            "range": "± 1007899",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1522,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18184,
            "range": "± 321",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 289611,
            "range": "± 15457",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 72,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 72,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 72,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1324976,
            "range": "± 37105",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 158578,
            "range": "± 1922",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1786387,
            "range": "± 17108",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 42078957,
            "range": "± 2300177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 408360,
            "range": "± 6618",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 14286123,
            "range": "± 170471",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 989917269,
            "range": "± 10362504",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3604,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 42016,
            "range": "± 1324",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 826168,
            "range": "± 7090",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 52490,
            "range": "± 1045",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 555440,
            "range": "± 12211",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6728734,
            "range": "± 159223",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 980,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 12016,
            "range": "± 239",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 278266,
            "range": "± 4369",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19928,
            "range": "± 605",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 139362,
            "range": "± 3216",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1290124,
            "range": "± 21639",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "dd6281bb0278ea73fe2870c0ed9c78c8dc715966",
          "message": "docs(release): record crates.io publishing decision + blocker (REQ-250, REQ-252, DD-074) (#681)\n\nInvestigating REQ-250 surfaced two independent walls, so no packaging code\nlands yet — this commit records the findings as traceable artifacts:\n\n- DD-074: publish under rivet-sdlc-core / rivet-sdlc-cli / rivet-etch because\n  the natural names are squatted upstream, keeping lib/bin names via Cargo\n  target renames. The rename itself is DEFERRED to the publish PR: it ripples\n  through ~40 `-p rivet-cli` / `-p rivet-core` specifiers across ci.yml,\n  release.yml, rivet-delta.yml, the compliance action, and scripts, so it must\n  land atomically with the publish rather than ahead of an indefinitely-blocked\n  one.\n- REQ-252: the dependency closure pulls git-only crates (pulseengine/spar's 9\n  spar-* crates via the aadl feature + a rowan fork via rowan-yaml); crates.io\n  rejects git deps transitively, so they must be published first. Cross-repo,\n  larger than one rivet release.\n- REQ-250 description updated: no release assignment until REQ-252 clears and a\n  CARGO_REGISTRY_TOKEN secret exists.\n\nConfirmed with `rivet validate` (Result: PASS) and `rivet docs check`\n(0 violations).\n\nRefs: REQ-250, REQ-252, DD-074, FEAT-001",
          "timestamp": "2026-07-10T13:49:54+02:00",
          "tree_id": "87713baf60befa2f5f8bf26e4a43c9c30482cbe8",
          "url": "https://github.com/pulseengine/rivet/commit/dd6281bb0278ea73fe2870c0ed9c78c8dc715966"
        },
        "date": 1783684977856,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 67942,
            "range": "± 1111",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 728790,
            "range": "± 22308",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 18285996,
            "range": "± 1446719",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1499,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 18200,
            "range": "± 334",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 269145,
            "range": "± 7338",
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
            "range": "± 1",
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
            "value": 1178132,
            "range": "± 10061",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 127592,
            "range": "± 1854",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1484741,
            "range": "± 15648",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 28419197,
            "range": "± 4248182",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 343628,
            "range": "± 7041",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 11373774,
            "range": "± 276710",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 827628915,
            "range": "± 8851306",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3254,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 41626,
            "range": "± 434",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 565518,
            "range": "± 2955",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 48505,
            "range": "± 865",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 535735,
            "range": "± 3669",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8431129,
            "range": "± 796295",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 903,
            "range": "± 11",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11057,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 167651,
            "range": "± 4836",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 16785,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 116551,
            "range": "± 644",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1094141,
            "range": "± 12593",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "41f76401b86f3c7a8882421d9b350eaef43edcd9",
          "message": "Merge pull request #683 from pulseengine/release/v0.25.0\n\nchore(release): v0.25.0",
          "timestamp": "2026-07-10T14:37:02+02:00",
          "tree_id": "27311c7c91a5c82daaa704accc63b5836e03bf9a",
          "url": "https://github.com/pulseengine/rivet/commit/41f76401b86f3c7a8882421d9b350eaef43edcd9"
        },
        "date": 1783687786482,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86830,
            "range": "± 357",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 891151,
            "range": "± 3298",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12762817,
            "range": "± 173808",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2162,
            "range": "± 12",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27343,
            "range": "± 245",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352537,
            "range": "± 1034",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 99,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 99,
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
            "value": 1507022,
            "range": "± 24359",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160985,
            "range": "± 502",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1931874,
            "range": "± 28917",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26788212,
            "range": "± 2782123",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 481736,
            "range": "± 4297",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15564500,
            "range": "± 167054",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1278885503,
            "range": "± 13592650",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4480,
            "range": "± 13",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61544,
            "range": "± 370",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 801513,
            "range": "± 151457",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60209,
            "range": "± 252",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 696720,
            "range": "± 14602",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7922000,
            "range": "± 857015",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1085,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14418,
            "range": "± 130",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328227,
            "range": "± 2510",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22749,
            "range": "± 1526",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157331,
            "range": "± 2438",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501561,
            "range": "± 24268",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "f3c0e939d9675ce7b3bac486499cd02edba332cd",
          "message": "ci(compliance): fail if the report tarball exceeds a hard MB cap (#671) (#677)\n\nv0.4.x / v0.7-0.9 shipped ~800 MB compliance-report tarballs (~5.4 GB\nof stale release storage) because build output was bundled by mistake.\nThe producer has since been fixed (v0.13.0+ is 1-2 MB), but nothing\nstops the regression from recurring.\n\nAdds a hard `max-archive-size-mb` cap (default 50 MB) on the compliance\ncomposite action:\n\n- Emits `compliance report size: N MB` and a step-summary table on green\n  so a slow creep is visible before it trips the cap.\n- Fails with a `::error::` line that names #671 when the tarball exceeds\n  the cap; message points at the likely root cause (build output packed\n  into the report directory).\n- Cap of 0 disables the guard for callers that intentionally emit the\n  multi-page dashboard (100s of MB).\n\nGuard logic is extracted to `verify_archive_size.sh` and exercised by\n`verify_archive_size_test.sh` (6 cases: under-cap, over-cap with #671\nmarker, disable-via-zero, missing-file usage error, ~2 MB reference\nshape under default, no-args usage error). The test runs in the\nexisting yaml-lint job so a broken guard fails PRs early — no compile\ncost added.\n\nScope: Part A of the #671 remediation (additive-only, no existing\nartifact touched). Part B — deleting the 7 stale ~800 MB assets on\nv0.4.x/v0.7-0.9 releases — is destructive, public-facing, and requires\nmaintainer sign-off; it is filed separately per the triage AC.\n\nTrace: skip\nRefs: #671\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-07-11T09:49:33+02:00",
          "tree_id": "69af9242ea2ea5adc413fa205d4ed1abd457730d",
          "url": "https://github.com/pulseengine/rivet/commit/f3c0e939d9675ce7b3bac486499cd02edba332cd"
        },
        "date": 1783761303945,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85124,
            "range": "± 713",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 889834,
            "range": "± 16506",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 12136780,
            "range": "± 298062",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2157,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25287,
            "range": "± 74",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 379997,
            "range": "± 1969",
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
            "value": 1513348,
            "range": "± 11947",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 159991,
            "range": "± 695",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1881609,
            "range": "± 44084",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 23467162,
            "range": "± 397068",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 482934,
            "range": "± 2442",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15536907,
            "range": "± 382728",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1270367444,
            "range": "± 25417915",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4388,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61877,
            "range": "± 202",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 773335,
            "range": "± 3576",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 60537,
            "range": "± 229",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 703252,
            "range": "± 3627",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8454617,
            "range": "± 760072",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1092,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14643,
            "range": "± 136",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 344767,
            "range": "± 3299",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22756,
            "range": "± 139",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 160364,
            "range": "± 10515",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1501851,
            "range": "± 10174",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "9d105e14ba9dfaa1667e499afa0011eee754dc4e",
          "message": "plan(v0.26): triage serve-filtering (#674) + release-vs-variant (#673); mark REQ-251 done (#686)\n\nTriages the two actionable open feature requests into v0.26 as proposed\nrequirements (the plan lives in rivet, not just the issue tracker):\n\n- REQ-253 (#674): richer serve filtering — reuse the existing s-expr filter\n  and/or the gluesql `rivet sql` facade rather than a serve-only filter\n  language.\n- REQ-254 (#673): check a release against variant scope — design-first\n  (needs a DD on release ∩ variant semantics before implementation).\n\nAlso corrects REQ-251 (serializer field-drop guard): proposed → implemented,\nrelease v0.25.0 — the compile-time exhaustiveness guard shipped as #634.\n\nConfirmed with `rivet validate` (Result: PASS) and `rivet docs check`\n(0 violations).\n\nRefs: REQ-253, REQ-254, REQ-251, FEAT-001",
          "timestamp": "2026-07-11T12:01:13+02:00",
          "tree_id": "c2cbea97f8c2800de530564600b8f41bf8b47c5a",
          "url": "https://github.com/pulseengine/rivet/commit/9d105e14ba9dfaa1667e499afa0011eee754dc4e"
        },
        "date": 1783770296116,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85360,
            "range": "± 662",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 922739,
            "range": "± 4056",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14191488,
            "range": "± 866352",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1925,
            "range": "± 18",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25044,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363730,
            "range": "± 1656",
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
            "value": 1510410,
            "range": "± 20676",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 170733,
            "range": "± 618",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1969451,
            "range": "± 22067",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 32398740,
            "range": "± 1374232",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 457398,
            "range": "± 1090",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15964208,
            "range": "± 146177",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1164372640,
            "range": "± 17244030",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4263,
            "range": "± 14",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 44490,
            "range": "± 493",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 750364,
            "range": "± 3689",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59245,
            "range": "± 246",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 716705,
            "range": "± 3138",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8635720,
            "range": "± 344258",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1094,
            "range": "± 56",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14616,
            "range": "± 53",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 227722,
            "range": "± 1607",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 21760,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 148620,
            "range": "± 1428",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1395200,
            "range": "± 16875",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "66fd38f5466b8844f7edf5a6300bf35f83912688",
          "message": "ci(mutants): cap address space at 48 GiB so a runaway mutant can't OOM the host (#590) (#685)\n\n#590: kernel OOM logs show `rivet_core-<hash>` native test binaries hitting\n70-100 GB anon-rss on the shared lean-mem runners, tripping the SYSTEM-WIDE\nOOM-killer and taking down neighboring jobs. The generators in rivet-core's\ntest suite are all tightly bounded (1..10, 0..1000, 1..50) — no real test\nallocates that much. The source is cargo-mutants: a mutation can delete an\nallocation bound and produce a test binary that allocates ~100 G in seconds,\nfaster than the 30 s per-mutant timeout, so the OOM-killer fires first.\n\nAdd `ulimit -v 50331648` (48 GiB RLIMIT_AS) before both `cargo mutants`\ninvocations (mutants-core matrix + mutants-cli gate) so a runaway mutant\naborts with ENOMEM inside its own process instead of OOM-killing the box.\nThe existing `|| true` already treats a clipped mutant as timeout/error, not\na gate failure, so mutation coverage is unaffected. Defense-in-depth alongside\nthe infra-side cgroup MemoryMax.\n\nSupersedes the stale PR #599 (same idea, but its branch predates the\nmutation-matrix-to-nightly + paths-filter ci.yml changes and would revert them).\n\nFixes #590\nTrace: skip",
          "timestamp": "2026-07-11T13:07:50+02:00",
          "tree_id": "594b6b35956ea43b29eb3471532cc0c4b634db54",
          "url": "https://github.com/pulseengine/rivet/commit/66fd38f5466b8844f7edf5a6300bf35f83912688"
        },
        "date": 1783770971262,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85926,
            "range": "± 1235",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897139,
            "range": "± 16311",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13427136,
            "range": "± 885303",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2245,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26402,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 389304,
            "range": "± 2515",
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
            "range": "± 4",
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
            "value": 1514848,
            "range": "± 17518",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 160252,
            "range": "± 441",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1892951,
            "range": "± 7836",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26959775,
            "range": "± 1724943",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460720,
            "range": "± 1967",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15411635,
            "range": "± 223684",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1282978206,
            "range": "± 10913354",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4334,
            "range": "± 42",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 60619,
            "range": "± 867",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 792610,
            "range": "± 7171",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62053,
            "range": "± 842",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701417,
            "range": "± 2509",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7720202,
            "range": "± 533980",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1161,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15418,
            "range": "± 61",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 339636,
            "range": "± 1112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22906,
            "range": "± 184",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 159827,
            "range": "± 1043",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1485045,
            "range": "± 22474",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fa2fd062aa9dc4d12099aa9e77f6374278df290c",
          "message": "feat(serve): richer artifact filtering — tag + s-expression predicates (REQ-253, #674) (#688)\n\nThe serve dashboard's /artifacts view only supported basic type/status/text\nfiltering. Surface the richer query surface rivet already has, reusing the\nexisting evaluator rather than inventing a serve-only filter language:\n\n- `tags=` — comma-separated; an artifact matches when it carries ALL listed\n  tags (previously a ViewParams field that was never applied in the list view).\n- `filter=` — a full s-expression predicate (same language as the JSON API's\n  `filter=` and `rivet list --filter`), e.g. `(has-tag \"safety\")`,\n  `(= status \"approved\")`, `(and (= type \"requirement\") (has-tag \"stpa\"))`.\n  Parsed once via rivet_core::sexpr_eval::parse_filter and applied per artifact\n  with matches_filter_with_store, so it composes with the active variant scope\n  (ctx.store/graph are already variant-scoped). An unparseable filter narrows\n  to nothing and renders an inline error rather than silently passing.\n\nA filter text input is added to the artifacts toolbar (htmx, same debounce\npattern as the search box), and both `tags` and `filter` are threaded through\nViewParams::to_query_string so they survive the type/status/sort/pagination\ncontrols (same preservation as ?variant=).\n\nConfirmed with two new serve_integration tests\n(artifacts_html_sexpr_filter_narrows_results, artifacts_html_tags_param_narrows_results,\nboth pass), a full build, and `cargo clippy --all-targets` on the CI toolchain\n(Rust 1.97) clean.\n\nImplements: REQ-253\nRefs: FEAT-001",
          "timestamp": "2026-07-11T17:03:05+02:00",
          "tree_id": "260c3a300ede0179fad8db5b444edb27e4186f77",
          "url": "https://github.com/pulseengine/rivet/commit/fa2fd062aa9dc4d12099aa9e77f6374278df290c"
        },
        "date": 1783783273868,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85431,
            "range": "± 1444",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 890033,
            "range": "± 17226",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14897710,
            "range": "± 1377314",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2182,
            "range": "± 4",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 26603,
            "range": "± 127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 367386,
            "range": "± 1719",
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
            "range": "± 1",
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
            "value": 1520557,
            "range": "± 20627",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161655,
            "range": "± 2635",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1899988,
            "range": "± 38114",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 26554380,
            "range": "± 644949",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 469293,
            "range": "± 2683",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15323613,
            "range": "± 144103",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1278532336,
            "range": "± 16622591",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4299,
            "range": "± 75",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 62092,
            "range": "± 760",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781347,
            "range": "± 11160",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58972,
            "range": "± 1643",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 698726,
            "range": "± 7547",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7824429,
            "range": "± 221035",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1126,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15385,
            "range": "± 268",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 331275,
            "range": "± 3561",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22767,
            "range": "± 2714",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 157710,
            "range": "± 2871",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1484654,
            "range": "± 20882",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "7ae35445c295fb24fb4d6ede9860d9cb9f431b9f",
          "message": "feat(release): `rivet release check --variant` — release ∩ variant consistency + scoped cuttability (REQ-254, DD-075, #673) (#689)\n\nrivet had releases (the `release:` field) and variants (feature-model\ncomposition) but no way to check how they intersect. Adds\n`rivet release check <version> --variant <name>` reporting both facets in one\nview (DD-075):\n\n- Consistency: partitions release-tagged artifacts against the variant's\n  resolved artifact-id set — in-scope (release ∩ variant), out-of-scope\n  (tagged for the release but excluded by the variant — the primary\n  inconsistency), and variant-only (bound by the variant, not yet tagged).\n- Cuttability: runs the existing release-readiness predicate scoped to the\n  in-scope intersection; an empty intersection is not cuttable (#628 rule).\n  Exit non-zero when not cuttable, or (under --strict) when any artifact is\n  out-of-scope. text + json output.\n\nThe readiness predicate (verified/accepted + release.ready-when + coverage\nV-closure) is refactored out of cmd_release_status into a shared ReadinessCtx\nthat both commands call, so the two can't drift; cmd_release_status behavior is\nunchanged. Variant→artifact-id resolution reuses the existing CLI feature-model\nsolve + bound-ids path (not the serve-only build_variant_scope).\n\nConfirmed with a new cli_commands test\n(release_check_partitions_release_against_variant), the existing 8 release\ntests still passing (no refactor regression), a full build, `cargo clippy\n--all-targets` on the CI toolchain (Rust 1.97) clean, and `rivet validate` PASS.\n\nImplements: REQ-254\nRefs: DD-075, FEAT-001",
          "timestamp": "2026-07-11T18:12:08+02:00",
          "tree_id": "c5699f8029c5193cc68744a7ac9c2c2e6f0090e7",
          "url": "https://github.com/pulseengine/rivet/commit/7ae35445c295fb24fb4d6ede9860d9cb9f431b9f"
        },
        "date": 1783788352173,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86425,
            "range": "± 893",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897535,
            "range": "± 18365",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 13027937,
            "range": "± 228221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2178,
            "range": "± 15",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27469,
            "range": "± 177",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 352198,
            "range": "± 1982",
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
            "value": 1508842,
            "range": "± 46348",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 161496,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1900626,
            "range": "± 18338",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24348960,
            "range": "± 783924",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 474388,
            "range": "± 1948",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15560458,
            "range": "± 77872",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1281359957,
            "range": "± 11685992",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4342,
            "range": "± 158",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 58911,
            "range": "± 159",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 753428,
            "range": "± 2000",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61475,
            "range": "± 225",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 700472,
            "range": "± 3680",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7901690,
            "range": "± 110530",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1287,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14887,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 328192,
            "range": "± 2313",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23721,
            "range": "± 228",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 167420,
            "range": "± 671",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1495686,
            "range": "± 19745",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "c3f45f28a156e4ad3363f08301c05554bf665603",
          "message": "Merge pull request #692 from pulseengine/release/v0.26.0\n\nchore(release): v0.26.0",
          "timestamp": "2026-07-11T19:34:40+02:00",
          "tree_id": "3d9688bbc73f7af98dfef1892a7f57fbb052bcbb",
          "url": "https://github.com/pulseengine/rivet/commit/c3f45f28a156e4ad3363f08301c05554bf665603"
        },
        "date": 1783791993808,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 85247,
            "range": "± 1861",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 899444,
            "range": "± 7055",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 14102199,
            "range": "± 539978",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2250,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27130,
            "range": "± 221",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 383479,
            "range": "± 1242",
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
            "value": 1524326,
            "range": "± 30457",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165343,
            "range": "± 1773",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1917937,
            "range": "± 7411",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 29490528,
            "range": "± 638866",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 463750,
            "range": "± 1856",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15446357,
            "range": "± 73254",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1248640970,
            "range": "± 13823531",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4458,
            "range": "± 24",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 61244,
            "range": "± 208",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786813,
            "range": "± 1309",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 59196,
            "range": "± 193",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 681136,
            "range": "± 2119",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 7594684,
            "range": "± 68066",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1126,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 14777,
            "range": "± 171",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 333406,
            "range": "± 4736",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23812,
            "range": "± 112",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 165992,
            "range": "± 1369",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1530051,
            "range": "± 15072",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "790e4c6d4d81e9f6ee2536c482c6a77ea792a97a",
          "message": "fix(modify): quote --set-field values so a colon-space no longer corrupts the file (#687) (#691)\n\n`rivet modify --set-field key=value` used to write the value RAW under a\nblock-style `fields:` sub-map — every sibling setter (`--set-title`,\n`--set-status`, `--set-release`, `--set-description`) already routes\nthrough `yaml_quote_inline_scalar`, but the `set_fields` loop skipped it.\nA value containing `: ` (or any other plain-scalar indicator — `#`,\nleading `-`/`?`/`[`/`{`, YAML booleans, …) then produced invalid YAML:\n\n    rationale: CURVE-AGILE: Ed25519 preferred, ECDSA-P256 fallback ...\n\nThe second `: ` reads as a mapping value → parse error on the whole\nsource file → rivet WARN-and-skips the file → every artifact in it\nsilently vanishes from the loaded store. Same data-loss shape as\n#573/#613/#618 (invalid YAML from a mutation drops the file), just via\nthe one setter that never got the quoting treatment.\n\nFix: route each `set_fields` value through the existing\n`yaml_quote_inline_scalar` helper before formatting. Applied at all three\nblock-style write sites (replace-existing sub-key, insert new sub-key,\ncreate new `fields:` section). The flow-style branch already went through\n`serde_yaml`, which quotes correctly — left alone.\n\nConfirmed end-to-end: `rivet modify DD-1 --set-field\n'rationale=CURVE-AGILE: Ed25519 preferred'` now writes\n`rationale: \"CURVE-AGILE: Ed25519 preferred\"`, the file stays parseable,\nboth artifacts round-trip through `rivet get`, and the hostile value\nsurvives verbatim. Three regression tests cover the insert branch, the\ncreate-fields-section branch, and the replace-existing branch.\n\nFixes: REQ-034\nVerifies: REQ-034\n\nCo-authored-by: Claude <noreply@anthropic.com>",
          "timestamp": "2026-07-14T20:13:04+02:00",
          "tree_id": "835667c88bfd546bf8c59e0ffe47dac1a62df0e4",
          "url": "https://github.com/pulseengine/rivet/commit/790e4c6d4d81e9f6ee2536c482c6a77ea792a97a"
        },
        "date": 1784054645223,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 87381,
            "range": "± 1610",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 930016,
            "range": "± 5767",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 15197762,
            "range": "± 480518",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1973,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25029,
            "range": "± 103",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 374659,
            "range": "± 6643",
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
            "value": 1546750,
            "range": "± 21862",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 175480,
            "range": "± 3080",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 2040903,
            "range": "± 12250",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 34809678,
            "range": "± 1999777",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 455018,
            "range": "± 6964",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15335493,
            "range": "± 280739",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1090874986,
            "range": "± 22045988",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4196,
            "range": "± 68",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45841,
            "range": "± 200",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805987,
            "range": "± 10388",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 58684,
            "range": "± 939",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 735661,
            "range": "± 10507",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 8413385,
            "range": "± 162648",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1205,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 13883,
            "range": "± 360",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 224861,
            "range": "± 1736",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22013,
            "range": "± 577",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 155025,
            "range": "± 1128",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1455507,
            "range": "± 127291",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6751cc8b4b2c361e7880372f62cf1801ade58e71",
          "message": "plan: REQ-255 — ingest ordeal certificates as re-checkable evidence (rivet#693, ordeal#67) (#694)\n\nFiles the rivet-side requirement for the FEAT-011 certificate-as-evidence\nspine: (1) an `ordeal-certificate` evidence artifact type rivet validate can\ntreat as a verification link, and (2) a `--certify` hook on\n`rivet release check --variant` / `variant solve`. Blocked-by ordeal#67 (SAT\nfront-end + certificate serialization); part (1) schema is co-designable now.\nThe uncertified baseline shipped as REQ-254 in v0.26.0.\n\nRefs: REQ-255, REQ-254, FEAT-001",
          "timestamp": "2026-07-14T20:18:39+02:00",
          "tree_id": "e63c46f54f83b2064c3d4f68a702481b9109aebf",
          "url": "https://github.com/pulseengine/rivet/commit/6751cc8b4b2c361e7880372f62cf1801ade58e71"
        },
        "date": 1784055201833,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86308,
            "range": "± 644",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 927391,
            "range": "± 6190",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 16634868,
            "range": "± 1239043",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1995,
            "range": "± 6",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 25216,
            "range": "± 71",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 357202,
            "range": "± 2406",
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
            "value": 1534048,
            "range": "± 12209",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 167709,
            "range": "± 946",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1995246,
            "range": "± 13733",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 48295936,
            "range": "± 2868223",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 460307,
            "range": "± 4231",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 15436391,
            "range": "± 205034",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1082505618,
            "range": "± 14009260",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4217,
            "range": "± 7",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 45921,
            "range": "± 150",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 815966,
            "range": "± 4063",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 61338,
            "range": "± 349",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 726140,
            "range": "± 2790",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 9328559,
            "range": "± 593233",
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
            "value": 15155,
            "range": "± 40",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 260606,
            "range": "± 2509",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 22229,
            "range": "± 85",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 158211,
            "range": "± 838",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1450552,
            "range": "± 12205",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "abcf1f6fe094d8bc50d3622af4db66329e2a9e7c",
          "message": "plan(variant): file 4-persona review findings as DD-076 + REQ-257..266 (#701)\n\nA four-persona honest review (writer / traceability-auditor / code-reviewer /\nintegrator) of variant/feature-model handling. Headline: there is NO\n`documentation` field — the confusion is \"attribute\" doing triple duty\n(attribute-schema type-decls vs per-feature attributes values vs a design-doc\nphantom), undocumented in the canonical reference.\n\nDD-076 governs the remediation (fail-loud over silent-pass). Requirements:\n- P0 correctness (v0.27): REQ-257 eval_constraint blanket-pass; REQ-258\n  dangling binding artifact ids + committed-broken full-desktop.yaml; REQ-259\n  feature-name resolution / vacuous satisfaction.\n- P1 silent-drops (v0.28): REQ-260 discover .ok(); REQ-261 attribute_warnings;\n  REQ-262 serve wrapped-variant blindness (#514 regression); REQ-263 CI gate.\n- P2 docs (v0.27): REQ-264 canonical attributes documentation.\n- P3 source linkage (v0.28): REQ-265. P4 solver proptests (v0.28): REQ-266.\n\nPer the maintainer: file all (this), then implement P0 + P2 first.\nConfirmed with `rivet validate` (PASS) and `rivet docs check` (0 violations).\n\nRefs: DD-076, REQ-257, REQ-258, REQ-259, REQ-264, FEAT-001",
          "timestamp": "2026-07-15T07:05:30+02:00",
          "tree_id": "d6265c6b9ac3a060b9fb364a8c078f8076442ecd",
          "url": "https://github.com/pulseengine/rivet/commit/abcf1f6fe094d8bc50d3622af4db66329e2a9e7c"
        },
        "date": 1784092409922,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 69079,
            "range": "± 2124",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 825120,
            "range": "± 14206",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 10659769,
            "range": "± 317127",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1317,
            "range": "± 17",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16180,
            "range": "± 383",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 363443,
            "range": "± 2512",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 66,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 69,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 69,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1214626,
            "range": "± 48152",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 141978,
            "range": "± 3371",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1659120,
            "range": "± 35768",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24276024,
            "range": "± 412168",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 373247,
            "range": "± 12511",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12073456,
            "range": "± 320766",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 830901321,
            "range": "± 17179672",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3364,
            "range": "± 131",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 39794,
            "range": "± 1248",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 805422,
            "range": "± 11825",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49089,
            "range": "± 1907",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 519892,
            "range": "± 19072",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6709710,
            "range": "± 138918",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 773,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 11038,
            "range": "± 397",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 288725,
            "range": "± 7289",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19298,
            "range": "± 510",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 139057,
            "range": "± 5085",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1237178,
            "range": "± 49496",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "04810cd9dc277d808a2ea7f7774f92e88cee0064",
          "message": "feat(lsp): enum-value + base-key completion (REQ-256, slice 2, #546) (#700)\n\nAdds the two highest-value remaining LSP completions to lsp_schema_completions,\nafter slice 1 (REQ-246: type / link-type / field-name):\n\n- Enum-value completion: on a `<field>: ` line whose schema FieldDef carries\n  `allowed_values`, complete those values (kind ENUM_MEMBER). The canonical\n  case — `status: ` — completes the status enum (draft/proposed/approved/…)\n  sourced from `schema.base_fields` (never hardcoded), with the type's own\n  fields taking precedence over base fields.\n- Base-key completion: at the artifact top level (not inside fields:/links:),\n  complete the base keys id/type/title/description/status/tags/links/fields\n  with `insert_text: \"<key>: \"`.\n\nReduces YAML authoring friction via the language server rather than a bespoke\neditor UI (the DD-071 direction).\n\nConfirmed with 3 new lsp_completion_context_tests\n(status enum values, base keys, slice-1 regression) + the full 42-test lsp\nsuite passing, a build, and `cargo clippy --all-targets` on the CI toolchain\n(Rust 1.97) clean.\n\nImplements: REQ-256\nRefs: DD-071, FEAT-001",
          "timestamp": "2026-07-15T07:51:07+02:00",
          "tree_id": "a27d0249ae6f6aa1a96d673c181be4b00f9e4239",
          "url": "https://github.com/pulseengine/rivet/commit/04810cd9dc277d808a2ea7f7774f92e88cee0064"
        },
        "date": 1784097695981,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 73160,
            "range": "± 3224",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 866256,
            "range": "± 22999",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 11154718,
            "range": "± 466771",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1383,
            "range": "± 48",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 16713,
            "range": "± 692",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 274081,
            "range": "± 5684",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/100",
            "value": 66,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/1000",
            "value": 67,
            "range": "± 3",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 67,
            "range": "± 2",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 1267993,
            "range": "± 62310",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 147316,
            "range": "± 5006",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1668438,
            "range": "± 41525",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 24326447,
            "range": "± 786590",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 376491,
            "range": "± 23438",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 12224692,
            "range": "± 326859",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 835458500,
            "range": "± 16603598",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 3370,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 34961,
            "range": "± 1058",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 781201,
            "range": "± 10933",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 49615,
            "range": "± 3091",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 518193,
            "range": "± 21988",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 6341125,
            "range": "± 175095",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 817,
            "range": "± 55",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 10280,
            "range": "± 490",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 274065,
            "range": "± 9117",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 19212,
            "range": "± 632",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 134175,
            "range": "± 4481",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1256742,
            "range": "± 67542",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "6a89ad474570423eda27312736d27346f5c7f05a",
          "message": "docs(variant): canonical feature-model attributes documentation (REQ-264, DD-076, #546) (#703)\n\nDisambiguates the \"attribute\" overload that confused contributors (per the\n4-persona review, DD-076):\n- feature-model-schema.md gains a canonical \"Feature attributes\" section: no\n  `documentation` field exists (Feature = name/group/children/parent/attributes,\n  feature_model.rs:113-129); a table separating top-level `attribute-schema:`\n  (type declarations) from per-feature `attributes:` (values); `required:` +\n  accepted type kinds/synonyms; the \"typed only when a schema is declared, else\n  free-form\" rule; and one worked example threading schema+attrs+variant+bindings.\n- design/variant-aware-properties.md + pure-variants-comparison.md: banner\n  marking them design/comparison notes (not the reference); `attribute-schema:`\n  relabelled SHIPPED (was framed as an unbuilt Gap/Remediation); the phantom\n  variant-config `attributes:` marked NOT IMPLEMENTED; stale file:line cites\n  corrected or softened to function refs. (Also corrected: `fields-per-variant:`\n  is actually SHIPPED, #255 — not a never-built proposal.)\n- getting-started.md: the misleading \"typed key/value metadata\" line corrected\n  to free-form-unless-schema.\n\nConfirmed with `rivet docs check` (0 violations) and `rivet validate` (PASS).\n\nRefs: REQ-264, DD-076, FEAT-001",
          "timestamp": "2026-07-15T09:23:16+02:00",
          "tree_id": "2dd39270618e494b9c5390768792b3bf429ed1d8",
          "url": "https://github.com/pulseengine/rivet/commit/6a89ad474570423eda27312736d27346f5c7f05a"
        },
        "date": 1784101932131,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 86202,
            "range": "± 1529",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 897788,
            "range": "± 7563",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 17512023,
            "range": "± 1063503",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 2224,
            "range": "± 63",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 27711,
            "range": "± 625",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 353413,
            "range": "± 5188",
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
            "range": "± 7",
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
            "value": 1536867,
            "range": "± 26591",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 165604,
            "range": "± 1719",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1933603,
            "range": "± 54539",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 37062961,
            "range": "± 3036081",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 471165,
            "range": "± 4133",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 16095089,
            "range": "± 249335",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 1209136578,
            "range": "± 14255561",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 4373,
            "range": "± 182",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 66996,
            "range": "± 1065",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 799501,
            "range": "± 5032",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 62014,
            "range": "± 352",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 701149,
            "range": "± 13310",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 11973247,
            "range": "± 349609",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 1158,
            "range": "± 8",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 15022,
            "range": "± 174",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 319090,
            "range": "± 4807",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 23281,
            "range": "± 179",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 164066,
            "range": "± 4890",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 1535095,
            "range": "± 24059",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
            "name": "Ralf Anton Beier",
            "username": "avrabe"
          },
          "committer": {
            "email": "noreply@github.com",
            "name": "GitHub",
            "username": "web-flow"
          },
          "distinct": true,
          "id": "fc253d86bdb9cbfcee3b437e24cca37d0136c69d",
          "message": "fix(variant): constraints fail loud instead of silently passing (REQ-257, DD-076) (#702)\n\nfeature_model.rs eval_constraint returned `true` for every expression shape it\ndid not implement (the `_ => true` fallthrough), so a constraint using a richer\npredicate the preprocessor accepts — e.g. `(> asil-numeric 2)` — parsed cleanly\nand was SILENTLY SATISFIED without evaluation. For a safety-configuration tool\nthat is the worst failure mode (per DD-076: fail-loud over silent-pass).\n\nAdds `constraint_evaluatable(expr)` which walks the tree and rejects any node\noutside the evaluatable set (feature-name leaves + and/or/not/implies/excludes/\nboollit). solve() calls it per constraint before evaluation and, on an\nunevaluatable shape, pushes a new `SolveError::UnevaluatableConstraint` naming\nthe constraint and the offending node, instead of reaching the silent pass.\neval_constraint's boolean semantics are unchanged; its `_ => true` is retained\nfor the `when:`-predicate path but is now unreachable for solve's constraints.\n\nThe repo's real feature-model constraints only use implies/and/or over feature\nnames, so no existing data regresses (regression test asserts the\nexamples/variant model still solves).\n\nConfirmed with new rivet-core tests (unevaluatable_attribute_constraint_fails_loud,\nexample_variant_implies_and_or_constraints_still_solve,\nexcludes_and_not_constraints_still_evaluate; 60 passed), a build, `cargo clippy\n--all-targets` on the CI toolchain (Rust 1.97) clean, and `rivet validate` PASS.\n\nImplements: REQ-257\nRefs: DD-076, FEAT-001",
          "timestamp": "2026-07-15T09:23:39+02:00",
          "tree_id": "74e1a4d761a0d6a9b586d78bdfc964a5d6b0fb75",
          "url": "https://github.com/pulseengine/rivet/commit/fc253d86bdb9cbfcee3b437e24cca37d0136c69d"
        },
        "date": 1784102392427,
        "tool": "cargo",
        "benches": [
          {
            "name": "store_insert/100",
            "value": 57289,
            "range": "± 4286",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/1000",
            "value": 781251,
            "range": "± 53329",
            "unit": "ns/iter"
          },
          {
            "name": "store_insert/10000",
            "value": 9268688,
            "range": "± 81138",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/100",
            "value": 1146,
            "range": "± 10",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/1000",
            "value": 13531,
            "range": "± 30",
            "unit": "ns/iter"
          },
          {
            "name": "store_lookup/10000",
            "value": 270904,
            "range": "± 20732",
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
            "value": 51,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "store_by_type/10000",
            "value": 51,
            "range": "± 0",
            "unit": "ns/iter"
          },
          {
            "name": "schema_load_and_merge",
            "value": 980821,
            "range": "± 17315",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/100",
            "value": 113665,
            "range": "± 255",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/1000",
            "value": 1414577,
            "range": "± 7264",
            "unit": "ns/iter"
          },
          {
            "name": "link_graph_build/10000",
            "value": 22669535,
            "range": "± 743753",
            "unit": "ns/iter"
          },
          {
            "name": "validate/100",
            "value": 291689,
            "range": "± 25314",
            "unit": "ns/iter"
          },
          {
            "name": "validate/1000",
            "value": 10289439,
            "range": "± 57040",
            "unit": "ns/iter"
          },
          {
            "name": "validate/10000",
            "value": 688292246,
            "range": "± 33752990",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/100",
            "value": 2634,
            "range": "± 5",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/1000",
            "value": 29606,
            "range": "± 38",
            "unit": "ns/iter"
          },
          {
            "name": "traceability_matrix/10000",
            "value": 786731,
            "range": "± 31238",
            "unit": "ns/iter"
          },
          {
            "name": "diff/100",
            "value": 45032,
            "range": "± 3370",
            "unit": "ns/iter"
          },
          {
            "name": "diff/1000",
            "value": 426478,
            "range": "± 27302",
            "unit": "ns/iter"
          },
          {
            "name": "diff/10000",
            "value": 5568831,
            "range": "± 189808",
            "unit": "ns/iter"
          },
          {
            "name": "query/100",
            "value": 503,
            "range": "± 1",
            "unit": "ns/iter"
          },
          {
            "name": "query/1000",
            "value": 8085,
            "range": "± 350",
            "unit": "ns/iter"
          },
          {
            "name": "query/10000",
            "value": 234751,
            "range": "± 1895",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/10",
            "value": 14991,
            "range": "± 878",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/100",
            "value": 104617,
            "range": "± 686",
            "unit": "ns/iter"
          },
          {
            "name": "document_parse/1000",
            "value": 952913,
            "range": "± 41940",
            "unit": "ns/iter"
          }
        ]
      },
      {
        "commit": {
          "author": {
            "email": "ralf_beier@me.com",
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
      }
    ]
  }
}