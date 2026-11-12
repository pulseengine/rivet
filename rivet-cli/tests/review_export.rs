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

//! `rivet review export` (issue #1227, REQ-416): a commit-pinned JSON
//! snapshot of a release's artifacts, refused on a dirty tree, with a
//! `--since <ref>` delta mode. Each test builds a throwaway git repository
//! holding a small rivet project.

use std::path::{Path, PathBuf};
use std::process::{Command, Output};

use serde_json::Value;

fn rivet_bin() -> PathBuf {
    // Compile-time path (REQ-314).
    PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

fn git(dir: &Path, args: &[&str]) -> String {
    let out = Command::new("git")
        .args([
            "-c",
            "user.name=rivet-test",
            "-c",
            "user.email=rivet-test@example.invalid",
            "-c",
            "commit.gpgsign=false",
            "-c",
            "core.hooksPath=/dev/null",
        ])
        .args(args)
        .current_dir(dir)
        .output()
        .expect("run git");
    assert!(
        out.status.success(),
        "git {args:?} failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    String::from_utf8_lossy(&out.stdout).trim().to_string()
}

fn commit_all(dir: &Path, msg: &str) -> String {
    git(dir, &["add", "-A"]);
    git(dir, &["commit", "-q", "-m", msg]);
    git(dir, &["rev-parse", "HEAD"])
}

fn write_artifacts(dir: &Path, yaml: &str) {
    std::fs::write(dir.join("artifacts").join("reqs.yaml"), yaml).expect("write artifacts");
}

/// A git repository with a rivet project and one committed artifact file.
fn project(artifacts_yaml: &str) -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    git(dir, &["init", "-q", "--initial-branch=main"]);
    std::fs::write(
        dir.join("rivet.yaml"),
        "project:\n  name: review-test\n  version: \"0.1.0\"\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    write_artifacts(dir, artifacts_yaml);
    commit_all(dir, "initial");
    tmp
}

fn review(dir: &Path, extra: &[&str]) -> Output {
    Command::new(rivet_bin())
        .arg("--project")
        .arg(dir)
        .args(["review", "export"])
        .args(extra)
        .output()
        .expect("run rivet review export")
}

fn review_json(dir: &Path, extra: &[&str]) -> Value {
    let out = review(dir, extra);
    assert!(
        out.status.success(),
        "review export {extra:?} failed; stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_slice(&out.stdout)
        .unwrap_or_else(|e| panic!("not JSON ({e}): {}", String::from_utf8_lossy(&out.stdout)))
}

fn ids(doc: &Value) -> Vec<&str> {
    doc["artifacts"]
        .as_array()
        .unwrap()
        .iter()
        .map(|a| a["id"].as_str().unwrap())
        .collect()
}

fn by_id<'a>(doc: &'a Value, id: &str) -> &'a Value {
    doc["artifacts"]
        .as_array()
        .unwrap()
        .iter()
        .find(|a| a["id"] == id)
        .unwrap_or_else(|| panic!("{id} not in export: {doc}"))
}

const FULL: &str = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: Scoped with provenance
    status: approved
    release: v1.0.0
    description: The first one.
    tags: [core]
    fields:
      priority: must
    links:
      - type: traces-to
        target: REQ-002
    provenance:
      created-by: ai-assisted
      model: claude-opus-5-5
      timestamp: 2026-11-12T10:00:00Z
  - id: REQ-002
    type: requirement
    title: Scoped without provenance
    status: draft
    release: v1.0.0
  - id: REQ-003
    type: requirement
    title: Other release
    status: draft
    release: v2.0.0
  - id: REQ-004
    type: requirement
    title: Backlog
    status: draft
"#;

/// Acceptance 1: the full export pins HEAD's full sha and carries every
/// artifact scoped to the release with every documented key, provenance
/// included; artifacts of another release or of none are absent.
// rivet: verifies REQ-416
#[test]
fn full_export_is_pinned_to_head_and_carries_the_scoped_artifacts() {
    let tmp = project(FULL);
    let dir = tmp.path();
    let head = git(dir, &["rev-parse", "HEAD"]);
    assert_eq!(head.len(), 40);

    let doc = review_json(dir, &["--release", "v1.0.0", "--format", "json"]);
    assert_eq!(doc["command"], "review-export");
    assert_eq!(doc["commit"], head.as_str());
    assert_eq!(doc["release"], "v1.0.0");
    assert!(doc["since"].is_null());
    assert_eq!(doc["count"], 2);
    assert_eq!(ids(&doc), ["REQ-001", "REQ-002"]);

    let a = by_id(&doc, "REQ-001");
    assert_eq!(a["type"], "requirement");
    assert_eq!(a["title"], "Scoped with provenance");
    assert_eq!(a["status"], "approved");
    assert_eq!(a["release"], "v1.0.0");
    assert_eq!(a["description"], "The first one.");
    assert_eq!(a["tags"], serde_json::json!(["core"]));
    assert_eq!(a["fields"]["priority"], "must");
    assert_eq!(
        a["links"],
        serde_json::json!([{ "type": "traces-to", "target": "REQ-002" }])
    );
    assert_eq!(a["provenance"]["created-by"], "ai-assisted");
    assert_eq!(a["provenance"]["model"], "claude-opus-5-5");
    assert_eq!(a["provenance"]["timestamp"], "2026-11-12T10:00:00Z");
    assert!(
        a.get("change").is_none(),
        "no change marker without --since"
    );

    // Unset values are null, not omitted.
    let b = by_id(&doc, "REQ-002");
    assert!(b["provenance"].is_null());
    assert!(b["description"].is_null());
    assert_eq!(b["links"], serde_json::json!([]));

    // `--format json` is the default.
    let default = review_json(dir, &["--release", "v1.0.0"]);
    assert_eq!(default, doc);

    // Same scope as `rivet list --release`.
    let list = Command::new(rivet_bin())
        .arg("--project")
        .arg(dir)
        .args(["list", "--release", "v1.0.0", "--format", "json"])
        .output()
        .unwrap();
    let list: Value = serde_json::from_slice(&list.stdout).unwrap();
    assert_eq!(ids(&list), ids(&doc));
}

/// Acceptance 2: a dirty tree — a modified tracked file and an untracked
/// file under the artifact source — exits non-zero, names both paths, and
/// prints nothing on stdout.
// rivet: verifies REQ-416
#[test]
fn dirty_tree_is_refused_and_names_the_dirty_paths() {
    let tmp = project(FULL);
    let dir = tmp.path();
    write_artifacts(dir, &FULL.replace("The first one.", "Edited."));
    std::fs::write(
        dir.join("artifacts").join("untracked.yaml"),
        "artifacts: []\n",
    )
    .unwrap();

    let out = review(dir, &["--release", "v1.0.0"]);
    assert!(!out.status.success(), "a dirty tree must fail");
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(stderr.contains("dirty"), "{stderr}");
    assert!(stderr.contains("artifacts/reqs.yaml"), "{stderr}");
    assert!(stderr.contains("artifacts/untracked.yaml"), "{stderr}");
    assert!(out.stdout.is_empty(), "no partial export on stdout");

    // Committing makes it clean again.
    commit_all(dir, "edit");
    assert!(review(dir, &["--release", "v1.0.0"]).status.success());
}

const BEFORE: &str = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: Unchanged
    status: draft
    release: v1.0.0
  - id: REQ-002
    type: requirement
    title: Will change
    status: draft
    release: v1.0.0
    description: Old text.
  - id: REQ-003
    type: requirement
    title: Will be deleted
    status: draft
    release: v1.0.0
  - id: REQ-004
    type: requirement
    title: Will move out
    status: draft
    release: v1.0.0
  - id: REQ-005
    type: requirement
    title: Will move in
    status: draft
    release: v2.0.0
"#;

const AFTER: &str = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: Unchanged
    status: draft
    release: v1.0.0
  - id: REQ-002
    type: requirement
    title: Will change
    status: implemented
    release: v1.0.0
    description: New text.
    links:
      - type: traces-to
        target: REQ-001
  - id: REQ-004
    type: requirement
    title: Will move out
    status: draft
    release: v2.0.0
  - id: REQ-005
    type: requirement
    title: Will move in
    status: draft
    release: v1.0.0
  - id: REQ-006
    type: requirement
    title: Brand new
    status: draft
    release: v1.0.0
"#;

/// Acceptance 3: `--since` emits only what changed for the release, marked
/// added (new, and moved in), removed (deleted, and moved out — with the
/// old content) and changed (with the changed field names). The unchanged
/// artifact is absent.
// rivet: verifies REQ-416
#[test]
fn since_reports_added_removed_and_changed_for_the_release() {
    let tmp = project(BEFORE);
    let dir = tmp.path();
    let base = git(dir, &["rev-parse", "HEAD"]);
    write_artifacts(dir, AFTER);
    let head = commit_all(dir, "change v1.0.0");

    let doc = review_json(dir, &["--release", "v1.0.0", "--since", &base]);
    assert_eq!(doc["commit"], head.as_str());
    assert_eq!(doc["since"], base.as_str());
    assert_eq!(
        ids(&doc),
        ["REQ-002", "REQ-003", "REQ-004", "REQ-005", "REQ-006"],
        "REQ-001 is unchanged and must be absent"
    );
    assert_eq!(doc["count"], 5);

    let changed = by_id(&doc, "REQ-002");
    assert_eq!(changed["change"], "changed");
    assert_eq!(
        changed["changed_fields"],
        serde_json::json!(["status", "description", "links"])
    );
    assert_eq!(
        changed["status"], "implemented",
        "changed carries HEAD content"
    );

    let deleted = by_id(&doc, "REQ-003");
    assert_eq!(deleted["change"], "removed");
    assert_eq!(
        deleted["title"], "Will be deleted",
        "removed carries old content"
    );
    assert!(deleted.get("changed_fields").is_none());

    let moved_out = by_id(&doc, "REQ-004");
    assert_eq!(moved_out["change"], "removed");
    assert_eq!(moved_out["release"], "v1.0.0", "content as at the base ref");

    let moved_in = by_id(&doc, "REQ-005");
    assert_eq!(moved_in["change"], "added");
    assert_eq!(moved_in["release"], "v1.0.0");

    assert_eq!(by_id(&doc, "REQ-006")["change"], "added");

    // A short or symbolic ref resolves to the full sha.
    let doc = review_json(dir, &["--release", "v1.0.0", "--since", "HEAD~1"]);
    assert_eq!(doc["since"], base.as_str());

    // Against itself nothing changed.
    let doc = review_json(dir, &["--release", "v1.0.0", "--since", "HEAD"]);
    assert_eq!(doc["count"], 0);
}

/// Unsupported formats and unresolvable refs fail rather than guess.
// rivet: verifies REQ-416
#[test]
fn bad_format_and_bad_ref_fail() {
    let tmp = project(FULL);
    let dir = tmp.path();
    let out = review(dir, &["--release", "v1.0.0", "--format", "text"]);
    assert!(!out.status.success());
    let out = review(dir, &["--release", "v1.0.0", "--since", "no-such-ref"]);
    assert!(!out.status.success());
    assert!(
        String::from_utf8_lossy(&out.stderr).contains("no-such-ref"),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
}
