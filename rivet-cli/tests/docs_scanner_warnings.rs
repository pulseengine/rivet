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

//! End-to-end coverage for the docs-scanner warn-or-allowlist behavior:
//! `rivet validate` against a project whose `docs/` contains a non-rivet
//! file must emit a stderr warning, and adding the file to
//! `docs[].exclude` must silence that warning.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Write a minimal viable rivet project under `dir` whose `docs/` folder
/// contains both a well-formed rivet doc and a generated file with no
/// front-matter. Returns the project root.
fn fixture_with_generated_doc(dir: &std::path::Path, docs_section: &str) {
    std::fs::write(
        dir.join("rivet.yaml"),
        format!(
            "project:\n  \
              name: test\n  \
              version: \"0.1.0\"\n  \
              schemas: []\n\
             sources:\n  \
              - path: artifacts\n    \
                format: generic-yaml\n\
             {docs_section}",
        ),
    )
    .expect("write rivet.yaml");

    let artifacts = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts).expect("create artifacts/");
    // Empty artifacts dir — no need for content for the docs scan.

    let docs = dir.join("docs");
    std::fs::create_dir_all(&docs).expect("create docs/");

    // A real rivet doc — passes the scanner.
    std::fs::write(
        docs.join("real.md"),
        "---\nid: D-1\ntitle: Real\ntype: document\n---\n\nbody\n",
    )
    .expect("write real.md");

    // A generated/unrelated file — no front-matter, the scanner declines.
    std::fs::write(
        docs.join("generated-report.md"),
        "# Generated report\n\nNo front-matter here.\n",
    )
    .expect("write generated-report.md");
}

#[test]
fn rivet_validate_warns_on_unfrontmattered_doc() {
    let tmp = tempfile::tempdir().expect("tempdir");
    fixture_with_generated_doc(tmp.path(), "docs:\n  - docs\n");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("run rivet validate");

    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("rivet doc scanner skipping"),
        "stderr should warn about the un-frontmattered file. stderr:\n{stderr}",
    );
    assert!(
        stderr.contains("generated-report.md"),
        "stderr should name the offending file. stderr:\n{stderr}",
    );
    assert!(
        stderr.contains("docs[].exclude"),
        "stderr should hint at the exclude knob. stderr:\n{stderr}",
    );
}

#[test]
fn rivet_validate_silent_when_file_is_excluded() {
    let tmp = tempfile::tempdir().expect("tempdir");
    fixture_with_generated_doc(
        tmp.path(),
        "docs:\n  - path: docs\n    exclude:\n      - \"generated-*.md\"\n",
    );

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("run rivet validate");

    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        !stderr.contains("rivet doc scanner skipping"),
        "stderr must not warn for files that match an exclude glob. stderr:\n{stderr}",
    );
    // The summary line should still note the allowlist hit.
    assert!(
        stderr.contains("excluded by allowlist"),
        "stderr should report the allowlist count. stderr:\n{stderr}",
    );
}

#[test]
fn rivet_validate_legacy_string_docs_still_works() {
    // Pure-legacy syntax: `docs: [docs]`. No exclude knob, but the
    // warning should still fire — that's the whole point of this PR.
    let tmp = tempfile::tempdir().expect("tempdir");
    fixture_with_generated_doc(tmp.path(), "docs: [docs]\n");

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "validate",
            "--format",
            "json",
        ])
        .output()
        .expect("run rivet validate");

    assert!(
        !String::from_utf8_lossy(&out.stdout).is_empty(),
        "validate should still produce JSON on stdout under the legacy schema",
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("rivet doc scanner skipping"),
        "legacy form must still warn for unfrontmattered files. stderr:\n{stderr}",
    );
}
