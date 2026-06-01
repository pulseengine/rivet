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

//! Integration tests for `rivet modify --where <filter>` (REQ-141).
//!
//! Query-driven bulk modify: select every artifact matching an s-expression
//! filter and apply the same `--set-*` change in a single in-process pass
//! (load once, write each affected file once). This is the ergonomic answer
//! to the bulk `draft -> implemented` task in issue #353, and — because it
//! never re-spawns a subprocess per ID — it cannot race the way a shell loop
//! of `rivet modify <ID>` calls can.
//!
//! rivet: verifies REQ-141

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Scaffold a minimal project: three requirements, two `draft` and one
/// `approved`. Returns the temp dir (kept alive by the caller).
fn scratch_project() -> tempfile::TempDir {
    let dir = tempfile::tempdir().unwrap();
    std::fs::write(
        dir.path().join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas:\n    - common\n    - dev\nsources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.path().join("artifacts")).unwrap();
    std::fs::write(
        dir.path().join("artifacts").join("reqs.yaml"),
        "artifacts:\n  \
         - id: REQ-1\n    type: requirement\n    title: One\n    status: draft\n  \
         - id: REQ-2\n    type: requirement\n    title: Two\n    status: draft\n  \
         - id: REQ-3\n    type: requirement\n    title: Three\n    status: approved\n",
    )
    .unwrap();
    dir
}

fn run(dir: &std::path::Path, args: &[&str]) -> std::process::Output {
    Command::new(rivet_bin())
        .args(args)
        .current_dir(dir)
        .output()
        .expect("run rivet")
}

/// `--dry-run` lists the matched artifacts and writes nothing.
#[test]
fn modify_where_dry_run_changes_nothing() {
    let proj = scratch_project();
    let reqs = proj.path().join("artifacts").join("reqs.yaml");
    let before = std::fs::read_to_string(&reqs).unwrap();

    let out = run(
        proj.path(),
        &[
            "modify",
            "--where",
            "(= status \"draft\")",
            "--set-status",
            "implemented",
            "--dry-run",
        ],
    );
    assert!(out.status.success(), "dry-run must exit 0");
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("dry run"), "stdout: {stdout}");
    assert!(
        stdout.contains("REQ-1") && stdout.contains("REQ-2"),
        "{stdout}"
    );
    assert!(!stdout.contains("REQ-3"), "approved REQ-3 must not match");

    let after = std::fs::read_to_string(&reqs).unwrap();
    assert_eq!(before, after, "dry-run must not modify the file");
}

/// `--where` applies to every match in one pass and leaves non-matches alone.
#[test]
fn modify_where_applies_to_all_matches() {
    let proj = scratch_project();
    let reqs = proj.path().join("artifacts").join("reqs.yaml");

    let out = run(
        proj.path(),
        &[
            "modify",
            "--where",
            "(= status \"draft\")",
            "--set-status",
            "implemented",
        ],
    );
    assert!(out.status.success());
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("modified 2 artifacts"), "{stdout}");

    let after = std::fs::read_to_string(&reqs).unwrap();
    // Both drafts flipped; the approved one is untouched.
    assert_eq!(
        after.matches("status: implemented").count(),
        2,
        "both drafts must be implemented:\n{after}"
    );
    assert_eq!(
        after.matches("status: approved").count(),
        1,
        "the approved artifact must be untouched:\n{after}"
    );
    assert_eq!(after.matches("status: draft").count(), 0);
}

/// A `--where` that matches nothing is a loud no-op (exit 0, explicit
/// message), so an agent never reads silence as success.
#[test]
fn modify_where_empty_match_is_loud_noop() {
    let proj = scratch_project();
    let out = run(
        proj.path(),
        &[
            "modify",
            "--where",
            "(= status \"nonexistent\")",
            "--set-status",
            "implemented",
        ],
    );
    assert!(out.status.success());
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(
        stdout.contains("no artifacts match"),
        "empty match must say so explicitly: {stdout}"
    );
}

/// Passing both a positional ID and `--where` is rejected by clap.
#[test]
fn modify_id_and_where_are_mutually_exclusive() {
    let proj = scratch_project();
    let out = run(
        proj.path(),
        &[
            "modify",
            "REQ-1",
            "--where",
            "(= status \"draft\")",
            "--set-status",
            "implemented",
        ],
    );
    assert!(!out.status.success(), "ID + --where must be rejected");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(stderr.contains("cannot be used with"), "stderr: {stderr}");
}
