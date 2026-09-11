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
//! `differential_survey` ASSERTS agreement over every artifact file.
//! `divergence_probe` documents where the two DO differ on constructs the
//! corpus happens not to use, so the survey's agreement reads as a finding
//! rather than as a comparison that cannot fail.

use std::path::{Path, PathBuf};

fn workspace_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
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

// rivet: verifies REQ-348
#[test]
fn differential_survey() {
    let root = workspace_root();
    let schema = rivet_core::load_schemas(&["common".into(), "dev".into()], &root.join("schemas"))
        .expect("load schemas");

    let mut files = Vec::new();
    yaml_files(&root.join("artifacts"), &mut files);
    files.sort();

    let (mut agree, mut differ, mut serde_only, mut rowan_only) = (0, 0, 0, 0);
    let (mut total_serde, mut total_rowan) = (0usize, 0usize);
    let mut examples: Vec<String> = Vec::new();

    for f in &files {
        let content = std::fs::read_to_string(f).unwrap_or_default();
        // Compare a FINGERPRINT, not just ids. Matching id sequences would
        // agree while the two paths disagreed about type, status or links —
        // which is exactly the class of silent divergence REQ-348 is about.
        let fingerprint = |a: &rivet_core::model::Artifact| -> String {
            let mut links: Vec<String> = a
                .links
                .iter()
                .map(|l| format!("{}->{}", l.link_type, l.target))
                .collect();
            links.sort();
            format!(
                "{}|{}|{}|{}|{}",
                a.id,
                a.artifact_type,
                a.title,
                a.status.as_deref().unwrap_or(""),
                links.join(",")
            )
        };
        let serde_ids: Vec<String> =
            match rivet_core::formats::generic::parse_generic_yaml(&content, Some(f)) {
                Ok(v) => v.iter().map(&fingerprint).collect(),
                Err(_) => Vec::new(),
            };
        let rowan_ids: Vec<String> =
            rivet_core::yaml_hir::extract_schema_driven(&content, &schema, Some(f))
                .artifacts
                .iter()
                .map(|sa| fingerprint(&sa.artifact))
                .collect();

        total_serde += serde_ids.len();
        total_rowan += rowan_ids.len();
        if serde_ids == rowan_ids {
            agree += 1;
        } else {
            differ += 1;
            if examples.len() < 6 {
                let first_diff = serde_ids
                    .iter()
                    .zip(rowan_ids.iter())
                    .find(|(a, b)| a != b)
                    .map(|(a, b)| format!("\n      serde: {a}\n      rowan: {b}"))
                    .unwrap_or_default();
                examples.push(format!(
                    "{}: serde={} rowan={}{first_diff}",
                    f.file_name().unwrap_or_default().to_string_lossy(),
                    serde_ids.len(),
                    rowan_ids.len()
                ));
            }
            if serde_ids.len() > rowan_ids.len() {
                serde_only += 1;
            } else {
                rowan_only += 1;
            }
        }
    }

    println!("SURVEY files={} agree={agree} differ={differ}", files.len());
    for e in &examples {
        println!("  {e}");
    }
    println!("  TOTALS serde={total_serde} rowan={total_rowan}");
    // Positive control first: two paths that both find nothing agree
    // vacuously, and that must read as a broken gate rather than a green one.
    assert!(
        total_serde > 0 && total_rowan > 0,
        "both paths must find artifacts, or agreement is vacuous: serde={total_serde} rowan={total_rowan}"
    );
    assert_eq!(
        differ, 0,
        "the two parsers must agree on every artifact in the corpus; {differ} file(s) differ"
    );
    println!("  serde-found-more={serde_only}  rowan-found-more={rowan_only}");
}

/// Where DO the two paths diverge? The survey says nowhere on the real corpus,
/// which is only meaningful if the comparison can detect divergence at all.
///
/// yaml_cst documents that it does not handle anchors, aliases, tags, flow
/// mappings, complex keys, multi-document streams or merge keys. serde_yaml
/// handles most of those. This probes each construct and prints what each path
/// makes of it — establishing that the corpus agreement is a finding rather
/// than an artefact of a comparison that cannot fail.
#[test]
fn divergence_probe() {
    let root = workspace_root();
    let schema = rivet_core::load_schemas(&["common".into(), "dev".into()], &root.join("schemas"))
        .expect("load schemas");

    let cases: Vec<(&str, String)> = vec![
        (
            "plain",
            "artifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n"
                .to_string(),
        ),
        (
            "flow-mapping",
            "artifacts:\n  - {id: R-1, type: requirement, title: t, status: draft}\n".to_string(),
        ),
        (
            "anchor+merge",
            "artifacts:\n  - &b\n    id: R-1\n    type: requirement\n    title: t\n    status: draft\n  - <<: *b\n    id: R-2\n"
                .to_string(),
        ),
        (
            "quoted-key",
            "artifacts:\n  - \"id\": R-1\n    \"type\": requirement\n    title: t\n    status: draft\n"
                .to_string(),
        ),
        (
            "multi-doc",
            "---\nartifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n---\nartifacts: []\n"
                .to_string(),
        ),
    ];

    println!("DIVERGENCE PROBE");
    for (name, doc) in &cases {
        let serde_n = rivet_core::formats::generic::parse_generic_yaml(doc, None)
            .map(|v| v.len() as i64)
            .unwrap_or(-1);
        let rowan_n = rivet_core::yaml_hir::extract_schema_driven(doc, &schema, None)
            .artifacts
            .len() as i64;
        let verdict = if serde_n == rowan_n {
            "agree"
        } else {
            "DIVERGE"
        };
        println!("  {name:<14} serde={serde_n:<3} rowan={rowan_n:<3} {verdict}");
    }
}
