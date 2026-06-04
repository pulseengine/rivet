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

//! End-to-end CLI coverage for the v0.13.2 export/ReqIF findings:
//! - Finding #1 (REQ-102): `gherkin` listed in `export --help`.
//! - Finding #2 (REQ-103): `import-results --format reqif` round-trips.
//! - Finding #3 (REQ-104): exported ReqIF carries a SPECIFICATION tree.
//!
//! rivet: verifies REQ-102, REQ-103, REQ-104

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// A tiny self-contained rivet project with two linked requirements.
fn write_project(dir: &std::path::Path) {
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: rt\n  version: \"0.0.0\"\n  schemas: [common, dev]\n\
         sources: [{ path: artifacts, format: generic-yaml }]\n",
    )
    .unwrap();
    std::fs::write(
        dir.join("artifacts/reqs.yaml"),
        r#"artifacts:
  - id: REQ-1
    type: requirement
    title: First
    status: draft
    links:
      - type: satisfies
        target: REQ-2
  - id: REQ-2
    type: requirement
    title: Second
    status: draft
"#,
    )
    .unwrap();
}

/// Finding #1 (REQ-102): `gherkin` must appear in `export --help`.
#[test]
fn export_help_lists_gherkin() {
    let out = Command::new(rivet_bin())
        .args(["export", "--help"])
        .output()
        .expect("run export --help");
    let help = String::from_utf8_lossy(&out.stdout);
    assert!(
        help.contains("gherkin"),
        "export --help must advertise the gherkin format. Got:\n{help}"
    );
}

/// Finding #2 + #3 (REQ-103, REQ-104): export to ReqIF, confirm the
/// SPECIFICATION tree is present, then import the ReqIF back and confirm
/// the artifacts + links survive the round-trip — all via the CLI.
#[test]
fn reqif_export_has_specification_and_roundtrips_via_cli() {
    let tmp = tempfile::tempdir().unwrap();
    let proj = tmp.path().join("proj");
    write_project(&proj);

    // Export ReqIF.
    let reqif = proj.join("out.reqif");
    let status = Command::new(rivet_bin())
        .args([
            "export",
            "--format",
            "reqif",
            "--output",
            reqif.to_str().unwrap(),
        ])
        .current_dir(&proj)
        .status()
        .expect("run export reqif");
    assert!(status.success(), "export --format reqif must succeed");

    let xml = std::fs::read_to_string(&reqif).unwrap();
    assert!(
        xml.contains("<SPECIFICATION "),
        "exported ReqIF must contain a SPECIFICATION element (finding #3)"
    );
    assert!(
        xml.contains("<SPEC-HIERARCHY "),
        "exported ReqIF must contain SPEC-HIERARCHY entries (finding #3)"
    );

    // Import the ReqIF back via the CLI.
    let out_dir = proj.join("imported");
    let out = Command::new(rivet_bin())
        .args([
            "import-results",
            "--format",
            "reqif",
            reqif.to_str().unwrap(),
            "--output",
            out_dir.to_str().unwrap(),
        ])
        .output()
        .expect("run import-results reqif");
    assert!(
        out.status.success(),
        "import-results --format reqif must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let yaml = std::fs::read_to_string(out_dir.join("reqif-import.yaml"))
        .expect("reqif-import.yaml must be written");
    // Both artifacts survive.
    assert!(yaml.contains("REQ-1"), "REQ-1 must round-trip");
    assert!(yaml.contains("REQ-2"), "REQ-2 must round-trip");
    // The link survives.
    assert!(
        yaml.contains("satisfies"),
        "the satisfies link must survive the ReqIF round-trip"
    );
}

/// A file-format export (`reqif`/`generic-yaml`) to a directory `--output`
/// fails with an actionable message, not a raw "Is a directory" OS error.
/// REQ-182 (self-found by dogfooding).
#[test]
fn export_reqif_to_directory_gives_actionable_error() {
    let proj = tempfile::tempdir().unwrap();
    write_project(proj.path());
    let outdir = tempfile::tempdir().unwrap(); // an existing directory

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            proj.path().to_str().unwrap(),
            "export",
            "--format",
            "reqif",
            "--output",
            outdir.path().to_str().unwrap(),
        ])
        .output()
        .expect("run rivet export --format reqif --output <dir>");
    assert!(!out.status.success(), "exporting to a directory must fail");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("is a directory") && stderr.contains("single file"),
        "error must explain the file/directory mismatch. Got:\n{stderr}"
    );
    assert!(
        !stderr.contains("os error 21"),
        "must not leak the raw OS error. Got:\n{stderr}"
    );
}
