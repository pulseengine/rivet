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

//! `allowed-values-severity` and list items (REQ-418), driven through the
//! binary with a project-local schema that adds a North Star `serves:`
//! field to `feature`, the way pulseengine.eu's objectives are pinned.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

/// A project whose `schemas/north-star.yaml` allows O1..O4 at `severity`,
/// with one feature whose `serves:` line is `serves`.
fn project(severity: &str, serves: &str) -> tempfile::TempDir {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path();
    std::fs::create_dir_all(p.join("artifacts")).unwrap();
    std::fs::create_dir_all(p.join("schemas")).unwrap();
    std::fs::write(
        p.join("rivet.yaml"),
        "project:\n  name: ns\n  version: \"0.0.0\"\n  schemas: [common, dev, north-star]\n\
         sources: [{ path: artifacts, format: generic-yaml }]\n",
    )
    .unwrap();
    std::fs::write(
        p.join("schemas/north-star.yaml"),
        format!(
            "schema:\n  name: north-star\n  version: \"0.1.0\"\nartifact-types:\n\
             \x20 - name: feature\n    description: serves a North Star objective\n    fields:\n\
             \x20     - name: serves\n        type: string\n\
             \x20       allowed-values: [O1, O2, O3, O4]\n{severity}"
        ),
    )
    .unwrap();
    std::fs::write(
        p.join("artifacts/f.yaml"),
        format!(
            "artifacts:\n  - id: FEAT-1\n    type: feature\n    title: F\n    status: draft\n{serves}"
        ),
    )
    .unwrap();
    dir
}

const ERROR: &str = "        allowed-values-severity: error\n";

fn validate(dir: &tempfile::TempDir) -> (bool, String) {
    let out = Command::new(rivet_bin())
        .args(["--project", dir.path().to_str().unwrap(), "validate"])
        .output()
        .expect("run validate");
    let text = format!(
        "{}{}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    (out.status.success(), text)
}

// rivet: verifies REQ-418
#[test]
fn a_planted_unknown_objective_fails_validation() {
    for serves in ["    serves: O9\n", "    serves: [O1, O9]\n"] {
        let (ok, text) = validate(&project(ERROR, serves));
        assert!(!ok, "{serves:?} must fail:\n{text}");
        assert!(
            text.contains("ERROR: [FEAT-1] field 'serves' has value 'O9', allowed: [\"O1\", \"O2\", \"O3\", \"O4\"]"),
            "{serves:?}:\n{text}"
        );
    }
}

// rivet: verifies REQ-418
#[test]
fn a_known_or_missing_objective_passes() {
    for serves in ["    serves: O2\n", "    serves: [O1, O4]\n", ""] {
        let (ok, text) = validate(&project(ERROR, serves));
        assert!(ok, "{serves:?} must pass:\n{text}");
        assert!(!text.contains("field 'serves'"), "{serves:?}:\n{text}");
    }
}

// rivet: verifies REQ-418
#[test]
fn without_the_severity_an_unknown_value_stays_a_warning() {
    let (ok, text) = validate(&project("", "    serves: [O1, O9]\n"));
    assert!(ok, "{text}");
    assert!(
        text.contains("WARN: [FEAT-1] field 'serves' has value 'O9'"),
        "{text}"
    );
}
