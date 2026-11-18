// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code; see
// other tests/*.rs for the rationale.
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

//! `rivet import-results --environment` (#1241, REQ-417).
//!
//! A result says where it ran, and readiness keeps the latest result per
//! environment. These tests drive the binary: import one JUnit file per
//! environment, then read the trace. Before #1241 the importer always wrote
//! `environment: None`, and a newer pass on one target replaced an older
//! failure on another.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

/// REQ-1 verified by TEST-1; results in `results/`.
fn write_project(dir: &std::path::Path) {
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: env\n  version: \"0.0.0\"\n  schemas: [common, dev]\n\
         sources: [{ path: artifacts, format: generic-yaml }]\nresults: results\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts/a.yaml"),
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: R\n    status: draft\n\
         \x20 - id: TEST-1\n    type: verification\n    title: T\n    status: draft\n\
         \x20   links:\n      - type: verifies\n        target: REQ-1\n",
    )
    .unwrap();
}

/// One JUnit suite with a single case recorded against TEST-1.
fn junit(dir: &std::path::Path, name: &str, ts: &str, failed: bool) -> std::path::PathBuf {
    let failure = if failed {
        "<failure message=\"boom\"/>"
    } else {
        ""
    };
    let xml = format!(
        "<testsuite name=\"s\" timestamp=\"{ts}\"><testcase classname=\"c\" name=\"t\">\
         <properties><property name=\"rivet_tc_id\" value=\"TEST-1\"/></properties>\
         {failure}</testcase></testsuite>"
    );
    let path = dir.join(name);
    std::fs::write(&path, xml).unwrap();
    path
}

fn import(proj: &std::path::Path, file: &std::path::Path, env: &str) -> std::process::Output {
    Command::new(rivet_bin())
        .args(["--project", proj.to_str().unwrap(), "import-results"])
        .args(["--format", "junit", "--environment", env])
        .arg(file)
        .args(["--output", proj.join("results").to_str().unwrap()])
        .output()
        .expect("run import-results")
}

// rivet: verifies REQ-417
#[test]
fn a_pass_imported_for_one_environment_does_not_hide_a_failure_on_another() {
    let proj = tempfile::tempdir().unwrap();
    let p = proj.path();
    write_project(p);
    let fail = junit(p, "rpi5.xml", "2026-11-13T10:00:00Z", true);
    let pass = junit(p, "mac.xml", "2026-11-13T11:00:00Z", false);
    for (file, env) in [(&fail, "rpi5"), (&pass, "macos-arm64")] {
        let out = import(p, file, env);
        assert!(
            out.status.success(),
            "import {env}: {}",
            String::from_utf8_lossy(&out.stderr)
        );
    }

    // Two results files, each naming its environment.
    let mut envs: Vec<String> = std::fs::read_dir(p.join("results"))
        .unwrap()
        .map(|e| std::fs::read_to_string(e.unwrap().path()).unwrap())
        .filter_map(|y| {
            y.lines()
                .find_map(|l| l.trim().strip_prefix("environment: ").map(String::from))
        })
        .collect();
    envs.sort();
    assert_eq!(envs, vec!["macos-arm64", "rpi5"]);

    let out = Command::new(rivet_bin())
        .args(["--project", p.to_str().unwrap(), "trace-results", "REQ-1"])
        .args(["--format", "json"])
        .output()
        .expect("run trace-results");
    let json: serde_json::Value = serde_json::from_slice(&out.stdout)
        .unwrap_or_else(|e| panic!("{e}: {}", String::from_utf8_lossy(&out.stdout)));
    assert_eq!(json["verdict"], "failing", "{json}");
}

// rivet: verifies REQ-417
#[test]
fn environment_is_refused_for_formats_that_import_artifacts() {
    let proj = tempfile::tempdir().unwrap();
    let file = proj.path().join("x.reqif");
    std::fs::write(&file, "").unwrap();
    let out = Command::new(rivet_bin())
        .args([
            "import-results",
            "--format",
            "reqif",
            "--environment",
            "rpi5",
        ])
        .arg(&file)
        .output()
        .expect("run import-results");
    assert!(!out.status.success());
    assert!(
        String::from_utf8_lossy(&out.stderr)
            .contains("--environment applies to test results, which only the junit format imports"),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
}
