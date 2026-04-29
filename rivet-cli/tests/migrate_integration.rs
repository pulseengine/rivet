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

//! Integration tests for `rivet schema migrate` Phase 1 + Phase 2
//! (issue #236).
//!
//! Phase 1 coverage:
//!  * `--apply` rewrites a fresh `dev` project into ASPICE shape and
//!    `rivet validate` passes.
//!  * `--abort` restores byte-identical pre-migration state.
//!  * Plan-only run produces a parseable plan.yaml + manifest.yaml.
//!  * Roundtrip-style: A -> B yields a valid B project (the deeper
//!    A -> B -> A property test depends on a reverse recipe; tracked
//!    for a later phase).
//!
//! Phase 2 coverage:
//!  * `--apply` pauses on the first conflict and writes markers; state
//!    flips to CONFLICT.
//!  * `--continue` advances after the user resolves markers; rejects
//!    files with leftover markers.
//!  * `--skip` restores the conflicted artifact from snapshot and
//!    advances.
//!  * `--edit <id>` re-opens a previously-resolved conflict.
//!  * `rivet docs check` flags artifact YAMLs with leftover markers via
//!    the `MigrationConflict` invariant.

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

// ── Phase 2: conflict resolution flow ──────────────────────────────────

/// Build a fake migration directory pre-populated with a single
/// `FieldValueConflict` (priority numeric -> enum). Returns the
/// project tempdir and the migration directory's relative dir name.
fn make_conflicted_project() -> (tempfile::TempDir, PathBuf, String) {
    let tmp = tempfile::tempdir().expect("temp");
    let dir = tmp.path().to_path_buf();

    // Minimal project: rivet.yaml, artifacts/req.yaml.
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: t\n  version: \"0.1.0\"\n  schemas:\n    - common\n    - dev\nsources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    let art_yaml = "artifacts:\n  - id: REQ-001\n    type: requirement\n    title: First\n    fields:\n      priority: 5\n";
    std::fs::write(dir.join("artifacts/req.yaml"), art_yaml).unwrap();

    // Hand-built migration directory.
    let mig_name = "20260101-0000-dev-to-aspice".to_string();
    let mig_root = dir.join(".rivet").join("migrations").join(&mig_name);
    std::fs::create_dir_all(&mig_root).unwrap();

    // Plan with one conflict entry (priority value 5 -> enum).
    // Use the public type names of rivet_core::migrate.
    use rivet_core::migrate::{
        ActionClass, ChangeKind, MigrationManifest, MigrationState, PlannedChange,
        ResolutionStatus, RewriteMap,
    };
    let rewrite = RewriteMap {
        recipe_name: "dev-to-aspice".into(),
        source_preset: "dev".into(),
        target_preset: "aspice".into(),
        changes: vec![PlannedChange {
            artifact_id: "REQ-001".into(),
            source_file: Some("artifacts/req.yaml".into()),
            action: ActionClass::Conflict,
            change: ChangeKind::FieldValueConflict {
                in_type: "sw-req".into(),
                field: "priority".into(),
                from_value: "5".into(),
                target_constraint: "[must|should|could|wont]".into(),
            },
        }],
    };
    std::fs::write(
        mig_root.join("plan.yaml"),
        serde_yaml::to_string(&rewrite).unwrap(),
    )
    .unwrap();

    let manifest = MigrationManifest {
        recipe: "dev-to-aspice".into(),
        source_preset: "dev".into(),
        target_preset: "aspice".into(),
        created_at: "unix:0".into(),
        state: MigrationState::Planned,
        mechanical_count: 0,
        decidable_count: 0,
        conflict_count: 1,
        resolutions: BTreeMap::new(),
    };
    let _ = ResolutionStatus::Pending; // ensure import is referenced
    std::fs::write(
        mig_root.join("manifest.yaml"),
        serde_yaml::to_string(&manifest).unwrap(),
    )
    .unwrap();
    std::fs::write(mig_root.join("state"), "PLANNED").unwrap();

    (tmp, dir, mig_name)
}

#[test]
fn apply_pauses_on_conflict_and_writes_markers() {
    let (_tmp, dir, mig_name) = make_conflicted_project();
    // `apply` will discover the existing PLANNED migration and try to
    // re-plan against the live project. Our hand-written plan is the
    // one used because cmd_apply finds the latest PLANNED migration.
    let apply = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);
    // Non-zero exit because conflict left in flight.
    assert!(
        !apply.status.success(),
        "apply should not succeed when paused on conflict; stdout: {}\nstderr: {}",
        String::from_utf8_lossy(&apply.stdout),
        String::from_utf8_lossy(&apply.stderr)
    );

    // State must be CONFLICT, current-conflict points to REQ-001.
    let state = std::fs::read_to_string(
        dir.join(".rivet")
            .join("migrations")
            .join(&mig_name)
            .join("state"),
    )
    .unwrap();
    assert_eq!(state.trim(), "CONFLICT", "state file: {state:?}");

    let current = std::fs::read_to_string(
        dir.join(".rivet")
            .join("migrations")
            .join(&mig_name)
            .join("current-conflict"),
    )
    .unwrap();
    assert_eq!(current.trim(), "REQ-001");

    // The artifact YAML now contains conflict markers.
    let after = std::fs::read_to_string(dir.join("artifacts/req.yaml")).unwrap();
    assert!(after.contains("<<<<<<<"), "no open marker: {after}");
    assert!(after.contains("======="), "no separator: {after}");
    assert!(after.contains(">>>>>>>"), "no close marker: {after}");
    assert!(after.contains("source: dev"));
    assert!(after.contains("target: aspice"));
}

#[test]
fn continue_advances_after_user_resolves_markers() {
    let (_tmp, dir, mig_name) = make_conflicted_project();
    // Trigger the conflict pause.
    let _ = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);

    // Programmatically pretend the user resolved the conflict by
    // writing a clean file with `priority: must`.
    let resolved = "artifacts:\n  - id: REQ-001\n    type: requirement\n    title: First\n    fields:\n      priority: must\n";
    std::fs::write(dir.join("artifacts/req.yaml"), resolved).unwrap();

    let cont = run_rivet(&dir, &["schema", "migrate", "aspice", "--continue"]);
    assert!(
        cont.status.success(),
        "continue failed. stderr: {}\nstdout: {}",
        String::from_utf8_lossy(&cont.stderr),
        String::from_utf8_lossy(&cont.stdout)
    );

    let state = std::fs::read_to_string(
        dir.join(".rivet")
            .join("migrations")
            .join(&mig_name)
            .join("state"),
    )
    .unwrap();
    assert_eq!(state.trim(), "COMPLETE");

    // current-conflict pointer should be gone.
    let cur = dir
        .join(".rivet")
        .join("migrations")
        .join(&mig_name)
        .join("current-conflict");
    assert!(!cur.exists(), "current-conflict file should be removed");
}

#[test]
fn continue_rejects_unresolved_markers() {
    let (_tmp, dir, _) = make_conflicted_project();
    let _ = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);

    // Don't touch the file — markers still in place.
    let cont = run_rivet(&dir, &["schema", "migrate", "aspice", "--continue"]);
    assert!(
        !cont.status.success(),
        "continue should refuse with markers present"
    );
    let stderr = String::from_utf8_lossy(&cont.stderr);
    assert!(
        stderr.to_lowercase().contains("conflict marker")
            || stderr.contains("<<<<<<<")
            || stderr.contains("conflict marker(s)"),
        "expected marker complaint, got: {stderr}"
    );
}

#[test]
fn skip_restores_artifact_from_snapshot() {
    let (_tmp, dir, mig_name) = make_conflicted_project();
    // Pre-conflict file content; snapshot must match it after apply.
    let pre = std::fs::read_to_string(dir.join("artifacts/req.yaml")).unwrap();

    let _ = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);

    let mid = std::fs::read_to_string(dir.join("artifacts/req.yaml")).unwrap();
    assert_ne!(pre, mid, "apply should have stamped markers");

    let skip = run_rivet(&dir, &["schema", "migrate", "aspice", "--skip"]);
    assert!(
        skip.status.success(),
        "skip failed: {}",
        String::from_utf8_lossy(&skip.stderr)
    );

    let after = std::fs::read_to_string(dir.join("artifacts/req.yaml")).unwrap();
    // The artifact was restored — it should not contain conflict
    // markers anymore.
    assert!(!after.contains("<<<<<<<"));
    assert!(!after.contains(">>>>>>>"));
    // priority should be back to the pre-migration numeric value.
    assert!(after.contains("priority: 5"), "after: {after}");

    let state = std::fs::read_to_string(
        dir.join(".rivet")
            .join("migrations")
            .join(&mig_name)
            .join("state"),
    )
    .unwrap();
    // Only one conflict in the plan, so skip leaves us COMPLETE.
    assert_eq!(state.trim(), "COMPLETE");
}

#[test]
fn edit_reopens_resolved_conflict() {
    let (_tmp, dir, mig_name) = make_conflicted_project();
    let _ = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);
    // Resolve.
    let resolved = "artifacts:\n  - id: REQ-001\n    type: requirement\n    title: First\n    fields:\n      priority: must\n";
    std::fs::write(dir.join("artifacts/req.yaml"), resolved).unwrap();
    let cont = run_rivet(&dir, &["schema", "migrate", "aspice", "--continue"]);
    assert!(cont.status.success());

    // Re-open via --edit.
    let edit = run_rivet(&dir, &["schema", "migrate", "aspice", "--edit", "REQ-001"]);
    assert!(
        edit.status.success(),
        "edit failed: {}",
        String::from_utf8_lossy(&edit.stderr)
    );

    let state = std::fs::read_to_string(
        dir.join(".rivet")
            .join("migrations")
            .join(&mig_name)
            .join("state"),
    )
    .unwrap();
    assert_eq!(state.trim(), "CONFLICT");

    let after = std::fs::read_to_string(dir.join("artifacts/req.yaml")).unwrap();
    assert!(after.contains("<<<<<<<"), "markers re-written: {after}");
    let cur = std::fs::read_to_string(
        dir.join(".rivet")
            .join("migrations")
            .join(&mig_name)
            .join("current-conflict"),
    )
    .unwrap();
    assert_eq!(cur.trim(), "REQ-001");
}

#[test]
fn docs_check_flags_unresolved_conflict_markers() {
    let (_tmp, dir, _) = make_conflicted_project();
    // Stamp markers via --apply.
    let _ = run_rivet(&dir, &["schema", "migrate", "aspice", "--apply"]);

    // `rivet docs check` should now flag MigrationConflict.
    let check = run_rivet(&dir, &["docs", "check", "-f", "json"]);
    let stdout = String::from_utf8_lossy(&check.stdout);
    assert!(
        !check.status.success(),
        "docs check should fail when markers are present; stdout: {stdout}"
    );
    assert!(
        stdout.contains("MigrationConflict"),
        "expected MigrationConflict in JSON output: {stdout}"
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
