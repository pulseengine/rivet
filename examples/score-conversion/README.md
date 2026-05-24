# Eclipse S-CORE → Rivet conversion (worked sketch)

A small, end-to-end conversion of the **persistency::kvs** slice from
Eclipse S-CORE's sphinx-needs RST artifacts into rivet generic-YAML
against the bundled `score` schema.

This directory exists to answer two questions:

1. **What does the conversion actually look like?** — see
   `artifacts/persistency.yaml` for a hand-converted slice covering one
   stakeholder requirement → feature requirements → component requirement
   → architecture → detailed design → software unit → test → FMEA →
   decision record + a process-layer workflow.
2. **Is rivet's `schemas/score.yaml` still valid against the real
   eclipse-score metamodel?** — partly. `rivet validate` flags 2 errors
   and a handful of warnings that map to concrete schema deltas; see
   the [Schema deltas](#schema-deltas) section.

---

## Where the data lives upstream

```
eclipse-score/
├── docs-as-code/            # the sphinx extension + the metamodel
│   └── src/extensions/score_metamodel/
│       ├── metamodel.yaml          # 1065-line single source of truth
│       ├── metamodel-schema.json   # JSON Schema for metamodel.yaml itself
│       └── checks/                 # graph_checks, attributes_format, …
├── process_description/     # process layer (workflow, role, gd_*, std_*)
├── score/                   # platform reqs + arch (stkh_req, feat_req, feat_*)
└── persistency/ lifecycle/ baselibs/ communication/ feo/ …
                              # component reqs + arch (comp_req, comp_*)
```

Each Sphinx build emits `needs.json` + `metrics.json` (schema_version=1);
downstream repos pull each other's `needs.json` via sphinx-needs
`external_needs`.

## Conversion: 1:1 field mapping

| sphinx-needs option | rivet equivalent | Notes |
|---|---|---|
| `:id:` | `id` | Eclipse enforces `^[A-Za-z0-9_-]{6,}`; rivet enforces per-schema prefix conventions but no global regex. |
| `:status: valid` | `status: approved` | `draft → draft`, `valid → approved`, `invalid → obsolete`. dec_rec adds `proposed/accepted/rejected/superseded`. |
| `:safety: QM|ASIL_B` | `fields.safety-level` | Same enum: `[QM, ASIL_A, ASIL_B, ASIL_C, ASIL_D]`. |
| `:security: YES|NO` | `fields.security` | **Field missing in `score.yaml`** — see deltas. |
| `:reqtype: Functional|Non-Functional|Interface|Process` | `fields.req-type` | **`non-functional` missing from allowed-values** — see deltas. |
| `:rationale:` | `fields.rationale` | |
| free-text after directive | `description` | Sphinx-needs uses the directive body; rivet uses the explicit field. |
| `:satisfies:` | `links: type=satisfies` | |
| `:belongs_to:` | `links: type=belongs-to` | |
| `:implements:` | `links: type=implements` | |
| `:fulfils:` | `links: type=fulfils` | |
| `:provides:` (arch) | `links: type=provides` | **`provides` link-type missing** — see deltas. |
| `:includes:` / `:included_by:` | `links: type=includes` | **Missing in rivet** — see deltas. |
| `:realizes:` | `links: type=realizes` | rivet restricts `realizes` source to `comp` and target to `feat`. Eclipse also uses `document → workproduct` `realizes` — needs broader signature or a second link type. |
| `:covers:` (req → aou_req) | `links: type=covers` | **Missing** — see deltas. |
| `:violates:` | `links: type=violates` | |
| `:mitigated_by:` | `links: type=mitigates` (forward) | **Bug in `score.yaml`**: declared as a link-field name but `mitigated-by` is only the auto-computed inverse of `mitigates` (common.yaml). Use `mitigates` in the forward direction. |
| `:fully_verifies:` / `:partially_verifies:` | `links: type=fully-verifies / partially-verifies` | |
| `:responsible:` / `:approved_by:` / `:supported_by:` (workflow) | **Missing** | No process-role link vocabulary in rivet's score schema. |
| `:input:` / `:output:` / `:contains:` / `:has:` (workflow) | **Missing** | Workflow-side link vocabulary not modelled. |
| `:complies:` (req|wp → std_*) | `links: type=complies` | Works, but no `std-req`/`std-wp` artifact types exist as targets. |
| `:codelink:` / `:testlink:` / `:source_code_link:` | `fields.source-file` (partial) | Eclipse has a separate `score_source_code_linker` extension that resolves `# req-Id:` comments — corresponds roughly to rivet's `links: type=implements` from sw-unit. |

## Conversion: type mapping

| Eclipse need type (group) | Rivet artifact type | Status |
|---|---|---|
| **Requirements** | | |
| `stkh_req` | `stkh-req` | ✅ have it (needs `req-type` field) |
| `feat_req` | `feat-req` | ✅ have it (allowed-values miss `non-functional`) |
| `comp_req` | `comp-req` | ✅ have it (allowed-values miss `non-functional`) |
| `aou_req` | `aou-req` | ✅ have it |
| `tool_req` | `tool-req` | ✅ have it |
| **Architecture** | | |
| `feat` | `feat` | ✅ have it |
| `feat_arc_sta`, `feat_arc_dyn` | — | ❌ missing (eclipse splits feature arch into static/dynamic views) |
| `logic_arc_int`, `logic_arc_int_op` | — | ❌ missing (logical interface + operations) |
| `comp` | `comp` | ✅ have it |
| `comp_arc_sta`, `comp_arc_dyn` | — | ❌ missing |
| `real_arc_int`, `real_arc_int_op` | — | ❌ missing (realised interface) |
| `mod` | `mod` | ✅ have it |
| `mod_view_sta`, `mod_view_dyn` | — | ❌ missing |
| **Detailed design / impl** | | |
| `dd_sta`, `dd_dyn` | `dd-sta`, `dd-dyn` | ✅ have it |
| `sw_unit` | `sw-unit` | ✅ have it |
| `sw_unit_int` | — | ❌ missing (sw unit interface) |
| **Safety analysis** | | |
| `feat_saf_fmea`, `comp_saf_fmea` | `fmea-entry` | ⚠️ collapsed — eclipse keeps scope (`plat/feat/comp`) in the type name; rivet uses `belongs-to` to disambiguate |
| `plat_saf_dfa`, `feat_saf_dfa`, `comp_saf_dfa` | `dfa-entry` | ⚠️ collapsed (same) |
| **Verification** | | |
| `testcase` (generated from JUnit XML) | `test-spec` + `test-exec` + `test-verdict` triad | ⚠️ different model. Rivet separates spec/exec/verdict; eclipse rolls them into a single `testcase` need. Converter must group XML rows by spec id and emit three rivet artifacts per test. |
| **Process** | | |
| `workflow` | `workflow` | ✅ have it (link vocabulary incomplete) |
| `role` | — | ❌ missing |
| `workproduct` | — | ❌ missing |
| `gd_req`, `gd_temp`, `gd_chklst`, `gd_guidl`, `gd_method` | `guidance` (single bucket) | ⚠️ rivet collapses five eclipse types into one. Either expand or accept the loss. |
| `doc_concept`, `doc_getstrt`, `doc_tool` | — | ❌ missing |
| `document` | `doc` | ✅ have it |
| `std_req`, `std_wp` | — | ❌ missing (standards register) |
| **Trustable framework** | | |
| `tsf` | `tsf` | ✅ have it |
| `tenet`, `assertion` | — | ❌ missing |
| **Other** | | |
| `dec_rec` | `decision-record` | ✅ have it |

---

## Schema deltas

The oracle (`rivet --schemas ../../schemas validate`) was used to drive
the gap discovery. Before the deltas landed it reported **2 errors +
6 warnings**; after, it reports **PASS (5 warnings — all about example
incompleteness, not schema issues).**

### Landed in `schemas/score.yaml`

**Bug fix**
- `fmea-entry` / `dfa-entry` no longer reference the non-existent forward
  link `mitigated-by` (which was only the auto-inverse of `mitigates`).
  Replaced with a new clean forward link `is-mitigated-by` with inverse
  `provides-mitigation-for`.
- `traceability-rules.fmea-has-mitigation` updated to require
  `is-mitigated-by`. New twin rule `dfa-has-mitigation`.

**Fields**
- `security: YES|NO` added to `stkh-req`, `feat-req`, `comp-req`,
  `aou-req`, `feat`, `comp` (and to every new architecture refinement
  type).
- `req-type` added to `stkh-req`. Allowed-values extended on
  `stkh-req` / `feat-req` / `comp-req` to include `non-functional` and
  `process`.

**Link types**
- `provides` / `provided-by` (feat|comp → logic-arc-int|real-arc-int)
- `includes` / `included-by` (feat-arc-sta|comp-arc-sta → logic/real-arc-int)
- `covers` / `covered-by` (feat-req|comp-req → aou-req)
- `responsible` / `responsible-for` (workflow → role)
- `approved-by` / `approves` (workflow → role)
- `supported-by` / `supports` (workflow → role)
- `input` / `input-to` (workflow → workproduct)
- `output` / `output-of` (workflow → workproduct)
- `contains-guidance` / `guidance-of` (workflow → guidance|doc; avoids
  clashing with aadl's `contains`)
- `has-document` / `document-of` (workflow → doc|guidance)
- `fulfils-process-req` / `fulfilled-by-guidance` (guidance → workflow|tool-req)
- `is-mitigated-by` (see bug fix)
- `realizes` source/target widened to also allow `doc → workproduct`

**Artifact types**
- Architecture refinements: `feat-arc-sta`, `feat-arc-dyn`,
  `comp-arc-sta`, `comp-arc-dyn`, `logic-arc-int`, `real-arc-int`,
  `mod-view-sta`, `mod-view-dyn`
- Process: `role`, `workproduct`
- Standards register: `std-req`, `std-wp`
- Trustable framework: `tenet`, `assertion`

After the edits: **39 artifact types, 33 link types, 15 rules**
(`rivet --schemas ../../schemas schema validate`).

### Deferred (intentional)

- Splitting rivet's single `guidance` bucket into the five eclipse
  `gd_*` types (`gd-req`, `gd-temp`, `gd-chklst`, `gd-guidl`, `gd-method`).
  Eclipse uses `:tags:` to disambiguate purpose; the same trick works in
  rivet without inflating the type registry.
- `doc_concept` / `doc_getstrt` / `doc_tool` — same reasoning; covered
  by `doc` + `doc-type` allowed-value.
- A converter for eclipse-score's `testcase` need type (generated from
  JUnit XML) into rivet's `test-spec` + `test-exec` + `test-verdict`
  triad. The model difference is intentional — rivet separates spec,
  execution, and verdict so that one spec can have many executions
  across releases. The converter will need to group by spec id.
- `valid` / `invalid` as canonical rivet status values. Currently the
  converter maps `valid → approved`, `invalid → obsolete`. Aligning
  upstream `common.yaml`'s status enum is a separate decision.

### Cosmetic / status mapping

The converter applies these mappings:
- `:status: valid` → `status: approved`
- `:status: draft` → `status: draft`
- `:status: invalid` → `status: obsolete`
- `dec_rec :status: accepted` → `status: approved`
- `dec_rec :status: proposed` → `status: draft`
- `dec_rec :status: rejected|superseded` → `status: obsolete`

---

## Converter shape

The natural input for the converter is **not the RST** but
**`needs.json`** that sphinx-needs emits at build time. Schema:
`schema_version=1`, top-level keys `versions.<ver>.needs.<id>` → an
object with all `:option:` keys flattened, plus `links` per link type.

Sketch:

```python
# pulseengine-score-import / src/import.py  (illustrative)
import json, yaml, sys
from pathlib import Path

# eclipse type → rivet type
TYPE_MAP = {
    "stkh_req":  "stkh-req",   "feat_req":  "feat-req",
    "comp_req":  "comp-req",   "aou_req":   "aou-req",
    "tool_req":  "tool-req",
    "feat":      "feat",       "comp":      "comp", "mod": "mod",
    "dd_sta":    "dd-sta",     "dd_dyn":    "dd-dyn",
    "sw_unit":   "sw-unit",
    "feat_saf_fmea": "fmea-entry", "comp_saf_fmea": "fmea-entry",
    "plat_saf_dfa": "dfa-entry",   "feat_saf_dfa":  "dfa-entry",
    "comp_saf_dfa": "dfa-entry",
    "dec_rec":   "decision-record",
    "document":  "doc",        "workflow":  "workflow",
    "tsf":       "tsf",
    # Types below currently lossy until schema-deltas land:
    # "role", "workproduct", "std_req", "std_wp",
    # "feat_arc_sta", "feat_arc_dyn", "logic_arc_int", "comp_arc_sta",
    # "comp_arc_dyn", "real_arc_int", "mod_view_sta", "mod_view_dyn",
    # "gd_req", "gd_temp", "gd_chklst", "gd_guidl", "gd_method",
    # "doc_concept", "doc_getstrt", "doc_tool", "tenet", "assertion",
    # "sw_unit_int", "testcase".
}

STATUS_MAP = {"valid": "approved", "draft": "draft", "invalid": "obsolete",
              "accepted": "approved", "proposed": "draft",
              "rejected": "obsolete", "superseded": "obsolete"}

LINK_MAP = {  # eclipse link name -> rivet link type
    "satisfies": "satisfies", "implements": "implements",
    "fulfils": "fulfils", "belongs_to": "belongs-to",
    "realizes": "realizes", "uses": "uses",
    "fully_verifies": "fully-verifies",
    "partially_verifies": "partially-verifies",
    "violates": "violates",
    "mitigated_by": "mitigates",        # invert: target becomes source
    # Lossy until schema-deltas land:
    # "provides", "includes", "covers",
    # "responsible", "approved_by", "supported_by",
    # "input", "output", "contains", "has",
}

def convert(need: dict) -> dict:
    rt = TYPE_MAP.get(need["type"])
    if rt is None:
        return None  # skip until covered by schema-deltas
    art = {
        "id":          need["id"].upper(),
        "type":        rt,
        "title":       need["title"],
        "status":      STATUS_MAP.get(need.get("status", "draft"), "draft"),
        "description": need.get("content", "").strip(),
        "tags":        need.get("tags", []),
        "fields":      {k: need[k] for k in
                        ("safety", "security", "reqtype", "rationale")
                        if k in need},
        "links":       [],
    }
    for elink, rlink in LINK_MAP.items():
        for tgt in need.get(elink, []):
            art["links"].append({"type": rlink, "target": tgt.upper()})
    return art

def main(needs_json: Path, out: Path):
    data = json.loads(needs_json.read_text())
    needs = next(iter(data["versions"].values()))["needs"]
    artifacts = [a for n in needs.values() if (a := convert(n))]
    out.write_text(yaml.safe_dump({"artifacts": artifacts}, sort_keys=False))

if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
```

Run as:
```sh
python -m pulseengine_score_import needs.json artifacts/imported.yaml
rivet --schemas ../../schemas validate
```

Per [[oracle-gated-verification]] — `rivet validate` is the gate; a
conversion is "done" only when it goes green.

## Suggested fork shape

Two options, depending on appetite:

**A. Lightweight (this directory + a converter).** Land schema deltas in
`schemas/score.yaml`, ship the converter as a small `pulseengine/score-import`
crate (or `rivet import-results --format sphinx-needs`), and let eclipse
keep RST as the source of truth. Pulseengine consumes their published
`needs.json` and emits rivet YAML.

**B. Full fork (`pulseengine/score-rivet`).** New repo that mirrors the
eclipse-score directory structure but with `artifacts/*.yaml` instead of
`*.rst`. RST is regenerated from rivet YAML for human reading (rivet has
docs export). This is more work, but breaks the dependency on sphinx-needs
and brings the methodology fully under the pulseengine stack (rivet +
spar + witness + sigil).

Option A is the right first move — schema gaps fixed, converter shipped,
real `needs.json` cycled through, then decide whether to graduate to B.
