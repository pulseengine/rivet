// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code, not by test harnesses.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_wrap,
    clippy::panic,
    clippy::print_stdout
)]

//! Differential gate: rivet's rowan CST path vs the serde_yaml path.
//!
//! rivet parses `generic-yaml` sources through `serde_yaml` and `stpa-yaml`
//! sources through its own rowan CST, with nothing asserting the two agree
//! (REQ-348). REQ-346 proposes migrating the artifact read path onto the CST,
//! and this corpus is that migration's gate — it has to exist before the
//! change, not after.
//!
//! The corpus is driven from the `sources:` list in `rivet.yaml`, not from a
//! path literal. A gate that hardcodes `artifacts/` silently covers two thirds
//! of the declared sources while reporting "every artifact file" — the exact
//! weak-green defect class this test exists to catch.
//!
//! `differential_survey` ASSERTS agreement over every file under every
//! declared source. `divergence_probe` ASSERTS where the two DO differ on
//! constructs the corpus happens not to use, so the survey's agreement reads
//! as a finding rather than as a comparison that cannot fail — and so that
//! fixing one of those divergences reddens the record instead of silently
//! flipping it to `agree`.

use std::path::{Path, PathBuf};

fn workspace_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

/// The schema set and source list rivet itself is configured with, read from
/// `rivet.yaml`. Hardcoding either here would let the gate drift away from
/// what the tool actually loads.
fn project_config(root: &Path) -> (Vec<String>, Vec<String>) {
    let raw = std::fs::read_to_string(root.join("rivet.yaml")).expect("read rivet.yaml");
    let doc: serde_yaml::Value = serde_yaml::from_str(&raw).expect("parse rivet.yaml");
    let schemas = doc["project"]["schemas"]
        .as_sequence()
        .expect("project.schemas")
        .iter()
        .filter_map(|v| v.as_str().map(str::to_owned))
        .collect();
    let sources = doc["sources"]
        .as_sequence()
        .expect("sources")
        .iter()
        .filter_map(|s| s["path"].as_str().map(str::to_owned))
        .collect();
    (schemas, sources)
}

fn yaml_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(rd) = std::fs::read_dir(dir) else {
        return;
    };
    for e in rd.flatten() {
        let p = e.path();
        if p.is_dir() {
            yaml_files(&p, out);
        } else if p.extension().is_some_and(|x| x == "yaml" || x == "yml") {
            out.push(p);
        }
    }
}

/// Compare a FINGERPRINT, not just ids. Matching id sequences would agree
/// while the two paths disagreed about type, status, links or provenance —
/// which is exactly the class of silent divergence REQ-348 is about.
/// `provenance` is here deliberately: it is written flow-style (`{…}`) in
/// eighteen artifacts and is the field the original investigation could not
/// compare, so leaving it out would assert agreement on the one shape most
/// likely to break.
fn fingerprint(a: &rivet_core::model::Artifact) -> String {
    let mut links: Vec<String> = a
        .links
        .iter()
        .map(|l| format!("{}->{}", l.link_type, l.target))
        .collect();
    links.sort();
    let prov = a.provenance.as_ref().map_or_else(
        || "-".to_owned(),
        |p| {
            serde_yaml::to_string(p)
                .unwrap_or_default()
                .replace('\n', ";")
        },
    );
    format!(
        "{}|{}|{}|{}|{}|{}|{}|{}",
        a.id,
        a.artifact_type,
        a.title,
        a.status.as_deref().unwrap_or(""),
        a.release.as_deref().unwrap_or(""),
        a.tags.join("+"),
        links.join(","),
        prov
    )
}

fn via_serde(content: &str, f: &Path) -> Vec<String> {
    match rivet_core::formats::generic::parse_generic_yaml(content, Some(f)) {
        Ok(v) => v.iter().map(fingerprint).collect(),
        Err(_) => Vec::new(),
    }
}

fn via_rowan(content: &str, schema: &rivet_core::schema::Schema, f: &Path) -> Vec<String> {
    rivet_core::yaml_hir::extract_schema_driven(content, schema, Some(f))
        .artifacts
        .iter()
        .map(|sa| fingerprint(&sa.artifact))
        .collect()
}

/// Which fingerprint COMPONENT differs, so a failure names the defect rather
/// than the file. The order matches `fingerprint`.
fn first_differing_component(a: &str, b: &str) -> &'static str {
    const NAMES: [&str; 8] = [
        "id",
        "type",
        "title",
        "status",
        "release",
        "tags",
        "links",
        "provenance",
    ];
    let (av, bv): (Vec<&str>, Vec<&str>) = (a.split('|').collect(), b.split('|').collect());
    for (i, name) in NAMES.iter().enumerate() {
        if av.get(i) != bv.get(i) {
            return name;
        }
    }
    "none"
}

/// Does the serde path structurally address this document at all? `GenericFile`
/// reads a top-level `artifacts:` key; an STPA file keyed on `hazards:` is not
/// a divergence, it is a different grammar layer. Partition on the mechanical
/// rule rather than on a path literal, and print each partition's size.
fn has_artifacts_key(content: &str) -> bool {
    serde_yaml::from_str::<serde_yaml::Value>(content)
        .ok()
        .and_then(|v| v.get("artifacts").cloned())
        .is_some()
}

/// The corpus's known, characterized divergence: eighteen artifacts write
/// `provenance:` as a FLOW mapping (`{created-by: …, model: …}`). serde reads
/// them; the CST has no `FlowMapping` node, so rowan yields no provenance at
/// all — silently, with no parse error. Pinned as an exact number so that a
/// nineteenth reddens this gate, and so that closing the CST gap (REQ-346)
/// reddens it too and forces the record to be updated rather than
/// re-baselined. See `divergence_probe` for the construct in isolation.
const KNOWN_FLOW_PROVENANCE_DIVERGENCES: usize = 18;

// rivet: verifies REQ-348
#[test]
fn differential_survey() {
    let root = workspace_root();
    let (schema_names, source_paths) = project_config(&root);
    let schema = rivet_core::load_schemas(&schema_names, &root.join("schemas"))
        .expect("load the project's own schema set");

    let mut files = Vec::new();
    for s in &source_paths {
        yaml_files(&root.join(s), &mut files);
    }
    files.sort();
    assert!(
        source_paths.len() >= 4 && !files.is_empty(),
        "the corpus must come from rivet.yaml's declared sources: \
         sources={source_paths:?} files={}",
        files.len()
    );

    let (mut compared, mut agree, mut differ) = (0, 0, 0);
    let (mut rowan_only_shape, mut neither_shape) = (0, 0);
    let (mut total_serde, mut total_rowan) = (0usize, 0usize);
    let mut by_component: std::collections::BTreeMap<&str, usize> =
        std::collections::BTreeMap::new();
    let mut count_mismatch: Vec<String> = Vec::new();
    let mut examples: Vec<String> = Vec::new();

    for f in &files {
        let content = std::fs::read_to_string(f).unwrap_or_default();
        let rel = f.strip_prefix(&root).unwrap_or(f).display().to_string();

        // Partition by shape, not by path. A document with no top-level
        // `artifacts:` key is outside the serde path's grammar by
        // construction, so comparing the two there would manufacture a
        // divergence that does not exist.
        if !has_artifacts_key(&content) {
            let n = via_rowan(&content, &schema, f).len();
            total_rowan += n;
            if n > 0 {
                rowan_only_shape += 1;
            } else {
                neither_shape += 1;
            }
            continue;
        }

        compared += 1;
        let serde_ids = via_serde(&content, f);
        let rowan_ids = via_rowan(&content, &schema, f);
        total_serde += serde_ids.len();
        total_rowan += rowan_ids.len();

        if serde_ids.len() != rowan_ids.len() {
            count_mismatch.push(format!(
                "{rel}: serde={} rowan={}",
                serde_ids.len(),
                rowan_ids.len()
            ));
        }
        if serde_ids == rowan_ids {
            agree += 1;
            continue;
        }
        differ += 1;
        for (a, b) in serde_ids.iter().zip(rowan_ids.iter()) {
            if a != b {
                *by_component
                    .entry(first_differing_component(a, b))
                    .or_default() += 1;
                if examples.len() < 4 {
                    examples.push(format!("{rel}\n      serde: {a}\n      rowan: {b}"));
                }
            }
        }
    }

    println!(
        "SURVEY sources={} files={} compared={compared} agree={agree} differ={differ}",
        source_paths.len(),
        files.len()
    );
    println!(
        "  out of scope: rowan-only-shape={rowan_only_shape} (schema-driven top-level keys, \
         no `artifacts:` — serde's GenericFile cannot address these at all)  \
         neither={neither_shape} (config documents under a source path)"
    );
    println!("  TOTALS serde={total_serde} rowan={total_rowan}");
    for (k, v) in &by_component {
        println!("  DIVERGENCE component={k} artifacts={v}");
    }
    for e in &examples {
        println!("  EXAMPLE {e}");
    }

    // Positive control first: two paths that both find nothing agree
    // vacuously, and that must read as a broken gate rather than a green one.
    assert!(
        total_serde > 0 && total_rowan > 0 && compared > 0,
        "both paths must find artifacts over a non-empty compared set, or agreement \
         is vacuous: serde={total_serde} rowan={total_rowan} compared={compared}"
    );
    assert!(
        rowan_only_shape > 0,
        "the stpa-yaml sources must land in the rowan-only partition; if this is 0 the \
         shape partition has silently swallowed them"
    );
    // Losing or gaining an ARTIFACT is a different, worse failure than losing a
    // field on one, so it gets its own assertion and its own message.
    assert!(
        count_mismatch.is_empty(),
        "the two paths must find the SAME NUMBER of artifacts in every \
         `artifacts:`-shaped file:\n  {}",
        count_mismatch.join("\n  ")
    );
    // The corpus does NOT fully agree, and this gate says so with a number
    // rather than dropping the field that disagrees. Every divergence must be
    // the one known, characterized case.
    let provenance_divergences = by_component.get("provenance").copied().unwrap_or(0);
    let other: Vec<String> = by_component
        .iter()
        .filter(|(k, _)| **k != "provenance")
        .map(|(k, v)| format!("{k}={v}"))
        .collect();
    assert!(
        other.is_empty(),
        "a NEW divergence class appeared between the two parsers: {}",
        other.join(", ")
    );
    assert_eq!(
        provenance_divergences, KNOWN_FLOW_PROVENANCE_DIVERGENCES,
        "the flow-style-provenance divergence count changed. Fewer means the CST \
         gained FlowMapping support (REQ-346) or the corpus was normalized — update \
         the record, do not re-baseline. More means a new artifact was written with \
         flow-style provenance that rivet's own CST cannot read."
    );
}

/// Where DO the two paths diverge? The survey says nowhere on the real corpus,
/// which is only meaningful if the comparison can detect divergence at all.
///
/// yaml_cst documents that it does not handle anchors, aliases, tags, flow
/// mappings, complex keys, multi-document streams or merge keys. serde_yaml
/// handles most of those. Each case below ASSERTS the counts the two paths
/// currently produce, so that closing one of these gaps (REQ-346 needs the
/// flow-mapping one closed before it can migrate) reddens this test and forces
/// the record to be updated, rather than silently flipping to `agree`.
#[test]
fn divergence_probe() {
    let root = workspace_root();
    let (schema_names, _) = project_config(&root);
    let schema = rivet_core::load_schemas(&schema_names, &root.join("schemas"))
        .expect("load the project's own schema set");

    // (name, document, expected serde count (-1 = parse error), expected rowan count)
    let cases: Vec<(&str, String, i64, i64)> = vec![
        (
            "plain",
            "artifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n"
                .to_owned(),
            1,
            1,
        ),
        (
            "quoted-key",
            "artifacts:\n  - \"id\": R-1\n    \"type\": requirement\n    title: t\n    status: draft\n"
                .to_owned(),
            1,
            1,
        ),
        // The dangerous one. serde finds the artifact; rowan returns NOTHING
        // and raises no error, so the artifact simply vanishes. REQ-346's
        // migration onto the CST cannot land while this holds.
        (
            "flow-mapping",
            "artifacts:\n  - {id: R-1, type: requirement, title: t, status: draft}\n".to_owned(),
            1,
            0,
        ),
        // Both fail, differently: serde rejects the merge key outright, rowan
        // yields nothing.
        (
            "anchor+merge",
            "artifacts:\n  - &b\n    id: R-1\n    type: requirement\n    title: t\n    status: draft\n  - <<: *b\n    id: R-2\n"
                .to_owned(),
            -1,
            0,
        ),
        // Rowan is the MORE permissive path here: serde rejects a
        // multi-document stream, rowan parses the first document.
        (
            "multi-doc",
            "---\nartifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n---\nartifacts: []\n"
                .to_owned(),
            -1,
            1,
        ),
    ];

    println!("DIVERGENCE PROBE");
    let mut mismatches: Vec<String> = Vec::new();
    for (name, doc, want_serde, want_rowan) in &cases {
        let serde_n = rivet_core::formats::generic::parse_generic_yaml(doc, None)
            .map_or(-1, |v| v.len() as i64);
        let rowan_n = rivet_core::yaml_hir::extract_schema_driven(doc, &schema, None)
            .artifacts
            .len() as i64;
        let verdict = if serde_n == rowan_n {
            "agree"
        } else {
            "DIVERGE"
        };
        println!("  {name:<14} serde={serde_n:<3} rowan={rowan_n:<3} {verdict}");
        if serde_n != *want_serde || rowan_n != *want_rowan {
            mismatches.push(format!(
                "{name}: got serde={serde_n} rowan={rowan_n}, recorded serde={want_serde} rowan={want_rowan}"
            ));
        }
    }
    assert!(
        mismatches.is_empty(),
        "the recorded divergences changed — update REQ-348's record and REQ-346's \
         migration risk, do not just re-baseline the numbers:\n  {}",
        mismatches.join("\n  ")
    );
}

/// The corpus divergence in isolation, at the FIELD level rather than the
/// artifact level.
///
/// `divergence_probe`'s `flow-mapping` case is an artifact written as a flow
/// mapping — rowan loses the whole artifact. This is the shape rivet's own
/// corpus actually contains: a block-mapped artifact whose `provenance:` VALUE
/// is a flow mapping. The artifact survives on both paths; the provenance does
/// not. That is why the survey reports 321 == 321 artifacts and still differs
/// on eighteen of them.
///
/// An earlier version of REQ-348 asserted the opposite — that flow-style field
/// values "both paths handle" — on no evidence. This test is that claim's
/// oracle.
#[test]
fn flow_style_field_value_silently_loses_provenance() {
    let root = workspace_root();
    let (schema_names, _) = project_config(&root);
    let schema = rivet_core::load_schemas(&schema_names, &root.join("schemas"))
        .expect("load the project's own schema set");

    let block = "artifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n    provenance:\n      created-by: ai-assisted\n      model: m\n";
    let flow = "artifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n    provenance: {created-by: ai-assisted, model: m}\n";

    let prov_serde = |doc: &str| {
        rivet_core::formats::generic::parse_generic_yaml(doc, None)
            .map(|v| v.iter().filter(|a| a.provenance.is_some()).count())
            .unwrap_or(0)
    };
    let prov_rowan = |doc: &str| {
        rivet_core::yaml_hir::extract_schema_driven(doc, &schema, None)
            .artifacts
            .iter()
            .filter(|sa| sa.artifact.provenance.is_some())
            .count()
    };

    // Control: block style is read by both. Without this the test below could
    // pass because rowan never reads provenance at all, which is a different
    // defect with a different fix.
    assert_eq!(
        prov_serde(block),
        1,
        "serde must read block-style provenance"
    );
    assert_eq!(
        prov_rowan(block),
        1,
        "rowan must read block-style provenance"
    );

    // The defect: the artifact survives on both paths, the provenance does not.
    assert_eq!(prov_serde(flow), 1, "serde reads flow-style provenance");
    assert_eq!(
        prov_rowan(flow),
        0,
        "recorded state: the CST has no FlowMapping node, so rowan drops \
         flow-style provenance with no error. If this is now 1 the gap is \
         closed — update REQ-348's record and REQ-346's migration risk."
    );
    // And it is silent: no parse error accompanies the loss.
    let parsed = rivet_core::yaml_hir::extract_schema_driven(flow, &schema, None);
    assert_eq!(
        parsed.artifacts.len(),
        1,
        "the artifact itself survives — which is what makes the loss silent"
    );
}
