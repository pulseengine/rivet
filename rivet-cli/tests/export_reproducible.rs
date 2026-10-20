// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code. Tests
// legitimately use unwrap/expect/panic/assert-indexing patterns because a
// test failure should panic with a clear stack. Same blanket allow as the
// other integration tests in this directory.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

//! `rivet export -f html` is byte-reproducible and carries no local paths
//! (REQ-406, #1104). Two exports of the same project must be identical, and
//! no exported file may contain the project's absolute path.
//!
//! rivet: verifies REQ-406

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::Command;

fn rivet_bin() -> PathBuf {
    PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

/// A project whose first requirement has 12 incoming links of three types, so
/// an unsorted (HashMap-ordered) backlink table would differ between runs.
fn scratch_project() -> tempfile::TempDir {
    let dir = tempfile::tempdir().unwrap();
    std::fs::write(
        dir.path().join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas:\n    - common\n    - dev\nsources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.path().join("artifacts")).unwrap();
    let mut y = String::from(
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: Target\n    status: draft\n",
    );
    for i in 0..12 {
        let lt = ["satisfies", "verifies", "refines"][i % 3];
        y.push_str(&format!(
            "  - id: DD-{i}\n    type: design-decision\n    title: D{i}\n    status: draft\n    links:\n      - type: {lt}\n        target: REQ-1\n"
        ));
    }
    std::fs::write(dir.path().join("artifacts").join("a.yaml"), y).unwrap();
    dir
}

fn export(project: &Path, out: &Path) {
    let o = Command::new(rivet_bin())
        .args(["export", "--format", "html", "--output"])
        .arg(out)
        .current_dir(project)
        .output()
        .expect("run rivet export");
    assert!(
        o.status.success(),
        "export failed: {}",
        String::from_utf8_lossy(&o.stderr)
    );
}

fn read_tree(root: &Path) -> BTreeMap<String, Vec<u8>> {
    fn walk(root: &Path, dir: &Path, out: &mut BTreeMap<String, Vec<u8>>) {
        for e in std::fs::read_dir(dir).unwrap().flatten() {
            let p = e.path();
            if p.is_dir() {
                walk(root, &p, out);
            } else {
                let rel = p.strip_prefix(root).unwrap().to_string_lossy().into_owned();
                out.insert(rel, std::fs::read(&p).unwrap());
            }
        }
    }
    let mut m = BTreeMap::new();
    walk(root, root, &mut m);
    m
}

// rivet: verifies REQ-406
#[test]
fn html_export_is_reproducible_and_path_free() {
    let proj = scratch_project();
    let a = tempfile::tempdir().unwrap();
    let b = tempfile::tempdir().unwrap();
    export(proj.path(), a.path());
    export(proj.path(), b.path());
    let (ta, tb) = (read_tree(a.path()), read_tree(b.path()));

    assert!(ta.contains_key("artifacts/REQ-1.html"), "page missing");
    let page = String::from_utf8_lossy(&ta["artifacts/REQ-1.html"]).into_owned();
    assert!(
        page.matches("link-pill").count() >= 12,
        "target page must list its incoming links"
    );

    let differing: Vec<&String> = ta
        .keys()
        .filter(|k| tb.get(*k) != ta.get(*k))
        .chain(tb.keys().filter(|k| !ta.contains_key(*k)))
        .collect();
    assert!(differing.is_empty(), "exports differ: {differing:?}");

    // No absolute project path (raw or canonical) in any exported file.
    let raw = proj.path().to_string_lossy().into_owned();
    let canon = proj
        .path()
        .canonicalize()
        .unwrap()
        .to_string_lossy()
        .into_owned();
    for (name, bytes) in &ta {
        let text = String::from_utf8_lossy(bytes);
        assert!(
            !text.contains(&raw) && !text.contains(&canon),
            "{name} leaks the absolute project path"
        );
    }
    // The source link is kept, project-relative.
    assert!(
        page.contains("data-source-file=\"artifacts/a.yaml\""),
        "expected project-relative data-source-file"
    );
}
