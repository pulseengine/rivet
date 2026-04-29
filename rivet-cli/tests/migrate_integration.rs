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

//! Integration tests for `rivet schema migrate` Phase 1 (issue #236).
//!
//! Covers:
//!  * `--apply` rewrites a fresh `dev` project into ASPICE shape and
//!    `rivet validate` passes.
//!  * `--abort` restores byte-identical pre-migration state.
//!  * Plan-only run produces a parseable plan.yaml + manifest.yaml.
//!  * Roundtrip-style: A -> B yields a valid B project (the deeper
//!    A -> B -> A property test depends on a reverse recipe; tracked
//!    for a later phase).

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::Command;

fn rivet_bin() -> PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return PathBuf::from(bin);
    }
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

fn schemas_dir_arg() -> PathBuf {
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("schemas")
}

fn make_dev_project() -> (tempfile::TempDir, PathBuf) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();
    let output = Command::new(rivet_bin())
        .args([
            "--schemas",
            schemas_dir_arg().to_str().unwrap(),
            "init",
            "--preset",
            "dev",
            "--dir",
            dir.to_str().unwrap(),
        ])
        .output()
        .expect("run rivet init");
    assert!(
        output.status.success(),
        "rivet init failed. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    (tmp, dir)
}

fn run_rivet(project: &Path, extra: &[&str]) -> std::process::Output {
    let mut args = vec![
        "--project".to_string(),
        project.to_str().unwrap().to_string(),
        "--schemas".to_string(),
        schemas_dir_arg().to_str().unwrap().to_string(),
    ];
    for e in extra {
        args.push((*e).to_string());
    }
    Command::new(rivet_bin())
        .args(&args)
        .output()
        .expect("run rivet")
}

/// Read every .yaml file under `artifacts/` into a (relative path -> content)
/// map. Used by the abort byte-identical assertion.
fn snapshot_artifacts(project: &Path) -> BTreeMap<String, String> {
    let mut out = BTreeMap::new();
    let dir = project.join("artifacts");
    walk(&dir, &dir, &mut out);
    out
}

fn walk(root: &Path, dir: &Path, out: &mut BTreeMap<String, String>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.filter_map(|e| e.ok()) {
        let p = entry.path();
        if p.is_dir() {
            walk(root, &p, out);
        } else if p.extension().is_some_and(|e| e == "yaml" || e == "yml") {
            let rel = p.strip_prefix(root).unwrap_or(&p).display().to_string();
            let content = std::fs::read_to_string(&p).unwrap_or_default();
            out.insert(rel, content);
        }
    }
}

// ── Tests ───────────────────────────────────────────────────────────────

#[test]
fn plan_dev_to_aspice_writes_plan_and_manifest() {
    let (_tmp, dir) = make_dev_project();
    let out = run_rivet(&dir, &["schema", "migrate", "aspice"]);
    assert!(
        out.status.success(),
        "plan failed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let migrations = dir.join(".rivet").join("migrations");
    assert!(migrations.exists(), "expected .rivet/migrations to exist");

    let entries: Vec<_> = std::fs::read_dir(&migrations)
        .expect("read migrations dir")
        .filter_map(|e| e.ok().map(|e| e.path()))
        .collect();
    assert_eq!(entries.len(), 1, "expected exactly one migration dir");
    let mig_dir = &entries[0];
    assert!(mig_dir.join("plan.yaml").exists());
    assert!(mig_dir.join("manifest.yaml").exists());
    let state = std::fs::read_to_string(mig_dir.join("state")).unwrap();
    assert_eq!(state.trim(), "PLANNED");

    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(stdout.contains("Migration plan:"));
    assert!(stdout.contains("dev -> aspice"));
}

#[test]
fn apply_rewrites_dev_to_aspice_and_validate_passes() {
    let (_tmp, dir) = make_dev_project();
    // Plan first.
    let plan = run_rivet(&dir, &["schema", "migrate", "aspice"]);
    assert!(
        plan.status.success(),
        "plan: {}",
        String::from_utf8_lossy(&plan.stderr)
    );

    // Apply.
    let apply = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);
    assert!(
        apply.status.success(),
        "apply failed. stderr: {}\nstdout: {}",
        String::from_utf8_lossy(&apply.stderr),
        String::from_utf8_lossy(&apply.stdout)
    );

    // Inspect the rewritten artifacts: there should be sw-req / sw-arch-component
    // types, and no `requirement` / `feature`.
    let snap = snapshot_artifacts(&dir);
    let combined: String = snap.values().cloned().collect::<Vec<_>>().join("\n");
    assert!(
        combined.contains("type: sw-req"),
        "expected sw-req in output: {combined}"
    );
    assert!(
        combined.contains("type: sw-arch-component"),
        "expected sw-arch-component in output: {combined}"
    );
    assert!(
        !combined.contains("type: requirement"),
        "should not contain `type: requirement` after migration"
    );
    assert!(
        !combined.contains("type: feature"),
        "should not contain `type: feature` after migration"
    );

    // Status should now report COMPLETE.
    let status = run_rivet(&dir, &["schema", "migrate", "aspice", "--status"]);
    assert!(status.status.success());
    let s = String::from_utf8_lossy(&status.stdout);
    assert!(
        s.contains("State:      COMPLETE"),
        "expected COMPLETE state, got: {s}"
    );

    // Migration doesn't update rivet.yaml in Phase 1 — the user is
    // expected to do that separately. For the test we patch
    // rivet.yaml to load aspice schemas, then assert `rivet validate`
    // exits 0 on the migrated tree.
    let cfg = dir.join("rivet.yaml");
    let cfg_text = std::fs::read_to_string(&cfg).unwrap();
    let patched = cfg_text.replace("- dev", "- aspice");
    std::fs::write(&cfg, patched).unwrap();

    let val = run_rivet(&dir, &["validate"]);
    assert!(
        val.status.success(),
        "post-migration validate failed:\nstderr={}\nstdout={}",
        String::from_utf8_lossy(&val.stderr),
        String::from_utf8_lossy(&val.stdout)
    );
}

#[test]
fn abort_restores_byte_identical_artifacts() {
    let (_tmp, dir) = make_dev_project();

    // Capture pre-migration state.
    let before = snapshot_artifacts(&dir);

    // Plan + apply.
    let plan = run_rivet(&dir, &["schema", "migrate", "aspice"]);
    assert!(
        plan.status.success(),
        "plan: {}",
        String::from_utf8_lossy(&plan.stderr)
    );
    let apply = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);
    assert!(
        apply.status.success(),
        "apply: {}",
        String::from_utf8_lossy(&apply.stderr)
    );

    // Sanity: state has actually changed.
    let mid = snapshot_artifacts(&dir);
    assert_ne!(before, mid, "apply should have rewritten files");

    // Abort.
    let abort = run_rivet(&dir, &["schema", "migrate", "aspice", "--abort"]);
    assert!(
        abort.status.success(),
        "abort failed: {}",
        String::from_utf8_lossy(&abort.stderr)
    );

    // Byte-identical.
    let after = snapshot_artifacts(&dir);
    assert_eq!(
        before, after,
        "abort should produce byte-identical artifacts"
    );

    // Migration directory should be gone.
    let migrations = dir.join(".rivet").join("migrations");
    if migrations.exists() {
        let n = std::fs::read_dir(&migrations).unwrap().count();
        assert_eq!(n, 0, "expected migration dir to be empty after abort");
    }
}

#[test]
fn finish_deletes_snapshot_and_keeps_manifest() {
    let (_tmp, dir) = make_dev_project();
    let _ = run_rivet(&dir, &["schema", "migrate", "aspice"]);
    let apply = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);
    assert!(
        apply.status.success(),
        "apply: {}",
        String::from_utf8_lossy(&apply.stderr)
    );

    let migrations = dir.join(".rivet").join("migrations");
    let mig_dir = std::fs::read_dir(&migrations)
        .unwrap()
        .next()
        .unwrap()
        .unwrap()
        .path();
    assert!(mig_dir.join("snapshot").exists());

    let finish = run_rivet(&dir, &["schema", "migrate", "aspice", "--finish"]);
    assert!(
        finish.status.success(),
        "finish: {}",
        String::from_utf8_lossy(&finish.stderr)
    );

    assert!(
        !mig_dir.join("snapshot").exists(),
        "snapshot should be deleted"
    );
    assert!(
        mig_dir.join("manifest.yaml").exists(),
        "manifest should be retained for audit"
    );
}

#[test]
fn roundtrip_dev_to_aspice_keeps_artifact_count_constant() {
    // We don't yet have an aspice-to-dev recipe for the full
    // round-trip; this test exercises the half we do have and
    // ensures the artifact set is preserved (no spurious
    // additions/deletions through the rewrite).
    //
    // We count artifacts by parsing the YAML and counting `id:`
    // entries, which survives the re-serialization performed by
    // serde_yaml on the apply path.
    let (_tmp, dir) = make_dev_project();

    fn count_ids(snap: &BTreeMap<String, String>) -> usize {
        let mut n = 0usize;
        for content in snap.values() {
            let Ok(v) = serde_yaml::from_str::<serde_yaml::Value>(content) else {
                continue;
            };
            if let Some(arts) = v.get("artifacts").and_then(|a| a.as_sequence()) {
                n += arts.len();
            }
        }
        n
    }

    let before = snapshot_artifacts(&dir);
    let before_ids = count_ids(&before);
    assert!(before_ids > 0, "fixture should have artifacts");

    let _ = run_rivet(&dir, &["schema", "migrate", "aspice"]);
    let apply = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);
    assert!(
        apply.status.success(),
        "apply: {}",
        String::from_utf8_lossy(&apply.stderr)
    );

    let after = snapshot_artifacts(&dir);
    let after_ids = count_ids(&after);
    assert_eq!(
        before_ids, after_ids,
        "artifact count should be preserved through the rewrite"
    );
}
