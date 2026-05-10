// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test crate.
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

//! End-to-end wiring test: `rivet close-gaps --format json` must surface a
//! `template_pair` per gap, picking up the schema's `template-kind:` and
//! resolving each prompt path to either an `embedded:…` marker or a
//! project override path.

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

const SCHEMA_WITH_PIPELINE: &str = r#"schema:
  name: tmpl-fixture
  version: "0.1.0"
  description: Schema with an explicit structural agent-pipeline.

artifact-types:
  - name: requirement
    description: A requirement
  - name: design-decision
    description: A design decision

link-types:
  - name: satisfies
    inverse: satisfied-by
    description: Source satisfies target
    source-types: [design-decision]
    target-types: [requirement]

agent-pipelines:
  oracles:
    - id: structural-trace
      command: rivet validate
      applies-to: ["*"]
      fires-on: { exit-code: nonzero }
  pipelines:
    vmodel:
      template-kind: structural
      uses-oracles: [structural-trace]
      auto-close:
        - when: { oracle: structural-trace, closure-kind: link-existing }
"#;

const RIVET_YAML: &str = r#"project:
  name: tmpl-fixture
  version: "0.1.0"
  schemas:
    - tmpl-fixture
sources:
  - path: artifacts
    format: generic-yaml
"#;

fn seed_project(dir: &Path) {
    std::fs::create_dir_all(dir.join("schemas")).unwrap();
    std::fs::create_dir_all(dir.join("artifacts")).unwrap();
    std::fs::write(dir.join("rivet.yaml"), RIVET_YAML).unwrap();
    std::fs::write(
        dir.join("schemas").join("tmpl-fixture.yaml"),
        SCHEMA_WITH_PIPELINE,
    )
    .unwrap();
}

fn run_rivet(dir: &Path, args: &[&str]) -> std::process::Output {
    let mut cmd = Command::new(rivet_bin());
    cmd.arg("--project")
        .arg(dir)
        .arg("--schemas")
        .arg(dir.join("schemas"));
    for a in args {
        cmd.arg(a);
    }
    cmd.output().expect("spawn rivet")
}

#[test]
fn close_gaps_emits_template_pair_with_embedded_paths_by_default() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    // Broken-link artifact => one gap.
    std::fs::write(
        dir.join("artifacts/dd.yaml"),
        r#"artifacts:
  - id: DD-001
    type: design-decision
    title: dd with dangling link
    status: draft
    links:
      - type: satisfies
        target: REQ-NONEXISTENT
"#,
    )
    .unwrap();

    let out = run_rivet(dir, &["close-gaps", "--format", "json"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        out.status.success(),
        "expected success; stderr={stderr}; stdout={stdout}"
    );

    let v: serde_json::Value =
        serde_json::from_str(&stdout).expect("stdout must be valid JSON");
    let gaps = v["gaps"].as_array().unwrap();
    assert!(!gaps.is_empty(), "expected at least one gap: {stdout}");

    for gap in gaps {
        let tp = &gap["template_pair"];
        assert_eq!(tp["kind"], "structural", "gap: {gap}");
        let discover = tp["discover"].as_str().unwrap();
        let validate = tp["validate"].as_str().unwrap();
        let emit = tp["emit"].as_str().unwrap();
        assert!(!discover.is_empty(), "discover empty: {tp}");
        assert!(!validate.is_empty(), "validate empty: {tp}");
        assert!(!emit.is_empty(), "emit empty: {tp}");
        // No project overrides exist => embedded markers.
        assert!(
            discover.starts_with("embedded:"),
            "expected embedded marker, got `{discover}`"
        );
        assert!(validate.starts_with("embedded:"));
        assert!(emit.starts_with("embedded:"));
    }
}

#[test]
fn close_gaps_template_pair_picks_up_project_override() {
    let tmp = tempfile::tempdir().unwrap();
    let dir = tmp.path();
    seed_project(dir);

    // Place a project override for structural/discover.md
    let override_dir = dir.join(".rivet/templates/pipelines/structural");
    std::fs::create_dir_all(&override_dir).unwrap();
    std::fs::write(override_dir.join("discover.md"), "OVERRIDE BODY").unwrap();

    // Broken-link artifact => one gap
    std::fs::write(
        dir.join("artifacts/dd.yaml"),
        r#"artifacts:
  - id: DD-001
    type: design-decision
    title: dd with dangling link
    status: draft
    links:
      - type: satisfies
        target: REQ-NONEXISTENT
"#,
    )
    .unwrap();

    let out = run_rivet(dir, &["close-gaps", "--format", "json"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(out.status.success(), "stderr: {}", String::from_utf8_lossy(&out.stderr));
    let v: serde_json::Value = serde_json::from_str(&stdout).unwrap();
    let gap = &v["gaps"].as_array().unwrap()[0];
    let discover = gap["template_pair"]["discover"].as_str().unwrap();
    assert!(
        discover.contains(".rivet/templates/pipelines/structural/discover.md"),
        "expected override path; got `{discover}`"
    );
    // The other two still embedded since we only overrode one.
    let validate = gap["template_pair"]["validate"].as_str().unwrap();
    assert!(validate.starts_with("embedded:"), "validate: {validate}");
}
