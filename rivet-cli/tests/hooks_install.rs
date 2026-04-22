// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
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

//! Integration tests for the `rivet init --hooks` pre-commit hook generator.
//!
//! Pain point #4: the hook must survive relocation of `rivet.yaml` within
//! the git tree via marker discovery — walk up from `$PWD` until a
//! `rivet.yaml` is found, then `cd` there before validating. A hard-coded
//! `-p <path>` would silently validate the wrong project after a move.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Build a fresh git repo with a rivet project inside, then install hooks.
/// Returns (tempdir keep-alive, project dir, hooks dir).
fn setup_with_hooks() -> (
    tempfile::TempDir,
    std::path::PathBuf,
    std::path::PathBuf,
) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();

    // `git init` so `rivet init --hooks` has somewhere to install.
    let status = Command::new("git")
        .args(["init", "--initial-branch=main"])
        .current_dir(&dir)
        .output()
        .expect("git init");
    assert!(status.status.success());

    // Create a rivet project at the git root.
    let init = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("rivet init");
    assert!(
        init.status.success(),
        "rivet init must succeed. stderr: {}",
        String::from_utf8_lossy(&init.stderr)
    );

    let hooks_install = Command::new(rivet_bin())
        .args([
            "--project",
            dir.to_str().unwrap(),
            "init",
            "--hooks",
            "--dir",
            dir.to_str().unwrap(),
        ])
        .output()
        .expect("rivet init --hooks");
    assert!(
        hooks_install.status.success(),
        "rivet init --hooks must succeed. stderr: {}",
        String::from_utf8_lossy(&hooks_install.stderr)
    );

    let hooks_dir = dir.join(".git").join("hooks");
    (tmp, dir, hooks_dir)
}

/// The installed pre-commit hook must not embed a hard-coded `-p <path>`
/// flag (relocation hazard); it must use marker discovery.
#[test]
fn pre_commit_hook_uses_marker_discovery_not_hardcoded_path() {
    let (_keep, _dir, hooks_dir) = setup_with_hooks();

    let pre_commit = hooks_dir.join("pre-commit");
    assert!(pre_commit.exists(), "pre-commit hook not installed");

    let body = std::fs::read_to_string(&pre_commit).expect("read pre-commit");

    // Regression against the hard-coded path hazard: a previous generator
    // emitted `rivet -p <path> validate`. The replacement walks up to find
    // rivet.yaml — `-p` must be absent.
    assert!(
        !body.contains(" -p "),
        "pre-commit must not embed a hard-coded `-p <path>`. body:\n{body}"
    );
    assert!(
        !body.contains("--project "),
        "pre-commit must not embed a hard-coded `--project <path>`. body:\n{body}"
    );

    // Marker-discovery contract: must walk up to find rivet.yaml and cd there.
    assert!(
        body.contains("rivet.yaml"),
        "pre-commit must look for rivet.yaml. body:\n{body}"
    );
    assert!(
        body.contains("dirname") && body.contains("while"),
        "pre-commit must walk up parent directories. body:\n{body}"
    );
    assert!(
        body.contains("cd \""),
        "pre-commit must `cd` into the discovered project dir. body:\n{body}"
    );
}

/// End-to-end: if the user relocates `rivet.yaml` to a subdirectory
/// inside the git tree, the installed hook must still find it via
/// marker discovery when executed from that subdirectory.
#[test]
fn pre_commit_hook_finds_relocated_rivet_yaml() {
    let (_keep, dir, hooks_dir) = setup_with_hooks();

    // Relocate rivet.yaml (and the artifacts it references) into subdir/.
    let sub = dir.join("subdir");
    std::fs::create_dir_all(&sub).unwrap();

    // Move the complete project tree into subdir/ so paths still resolve.
    for entry in ["rivet.yaml", "artifacts", "schemas"] {
        let from = dir.join(entry);
        if from.exists() {
            let to = sub.join(entry);
            std::fs::rename(&from, &to)
                .unwrap_or_else(|e| panic!("moving {entry}: {e}"));
        }
    }

    let pre_commit = hooks_dir.join("pre-commit");

    // Run the hook from a nested directory inside the project. Marker
    // discovery must walk up from $PWD and find subdir/rivet.yaml.
    let nested = sub.join("artifacts");
    let run_dir = if nested.exists() { nested } else { sub.clone() };

    // Put the rivet binary on PATH so the hook can find it.
    let bin = rivet_bin();
    let bin_dir = bin.parent().expect("rivet bin parent").to_path_buf();
    let orig_path = std::env::var("PATH").unwrap_or_default();
    let new_path = format!("{}:{}", bin_dir.display(), orig_path);

    let output = Command::new("bash")
        .arg(&pre_commit)
        .current_dir(&run_dir)
        .env("PATH", &new_path)
        .output()
        .expect("running pre-commit hook");

    // Either the hook ran successfully (project has no errors) or it failed
    // citing rivet validate errors. What it must NOT do is silently skip
    // validation or fail with "rivet.yaml not found".
    let stderr = String::from_utf8_lossy(&output.stderr);
    let stdout = String::from_utf8_lossy(&output.stdout);
    assert!(
        !stderr.contains("no rivet.yaml"),
        "hook must discover the relocated rivet.yaml. stderr: {stderr}"
    );
    // If the hook fails, it must be because of validate errors (i.e. the
    // discovery worked), not because it couldn't find the project.
    if !output.status.success() {
        assert!(
            stdout.contains("rivet validate") || stderr.contains("rivet validate"),
            "hook failure must come from rivet validate, not missing project.\nstdout: {stdout}\nstderr: {stderr}"
        );
    }
}
