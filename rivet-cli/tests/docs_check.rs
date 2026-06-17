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

//! End-to-end coverage for `rivet check docs` — the dedicated oracle
//! that enumerates every candidate path the doc scanner considered and
//! tags each `loaded` / `skipped (<reason>)` / `excluded (<glob>)`.
//!
//! Verifies the issue #540 kill-criterion against synthetic fixtures
//! with the same three failure modes as the gale skip cases:
//!   * no YAML frontmatter
//!   * frontmatter missing the required `id` field
//!   * file covered by a `docs[].exclude` glob

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Lay out a minimal rivet project with four candidate docs:
///   * `good.md`          — well-formed frontmatter (loaded)
///   * `no-frontmatter.md` — plain markdown, no `---` (skipped)
///   * `missing-id.md`    — frontmatter present but `id:` field missing (skipped)
///   * `generated.md`     — would skip on no-frontmatter, here for excluding
///
/// `docs_section` is the literal `docs:` block to splice into rivet.yaml,
/// so each test can vary the allowlist independently.
fn fixture(dir: &std::path::Path, docs_section: &str) {
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

    let docs = dir.join("docs");
    std::fs::create_dir_all(&docs).expect("create docs/");

    // Loaded
    std::fs::write(
        docs.join("good.md"),
        "---\nid: D-1\ntitle: Good\ntype: document\n---\n\nbody\n",
    )
    .expect("write good.md");

    // Skipped — no frontmatter (matches gale's mcuboot-coverage-analysis.md)
    std::fs::write(
        docs.join("no-frontmatter.md"),
        "# No frontmatter here\n\nplain markdown\n",
    )
    .expect("write no-frontmatter.md");

    // Skipped — frontmatter present but missing required `id` field
    // (matches gale's release-plan.md)
    std::fs::write(
        docs.join("missing-id.md"),
        "---\ntitle: Missing ID\ntype: document\n---\n\nbody\n",
    )
    .expect("write missing-id.md");

    // Either excluded (when allowlisted) or skipped (when not). Used to
    // mirror the third gale case (wasm-module-distribution.md) and to
    // demonstrate that an exclude glob keeps `--strict` green.
    std::fs::write(
        docs.join("generated.md"),
        "# Generated\n\nno frontmatter, generated artifact\n",
    )
    .expect("write generated.md");
}

#[test]
fn cmd_check_docs_enumerates_loaded_skipped_excluded() {
    let tmp = tempfile::tempdir().expect("tempdir");
    fixture(
        tmp.path(),
        "docs:\n  - path: docs\n    exclude:\n      - \"generated.md\"\n",
    );

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "check",
            "docs",
            "--format",
            "json",
        ])
        .output()
        .expect("run rivet check docs");

    let stdout = String::from_utf8_lossy(&out.stdout);
    let v: serde_json::Value =
        serde_json::from_str(&stdout).unwrap_or_else(|e| panic!("bad JSON: {e}\n{stdout}"));

    assert_eq!(v["oracle"], "docs");
    assert_eq!(v["total"], 4);
    assert_eq!(v["by_status"]["loaded"], 1);
    assert_eq!(v["by_status"]["skipped"], 2);
    assert_eq!(v["by_status"]["excluded"], 1);

    let entries = v["entries"].as_array().expect("entries array");

    let find = |name: &str| {
        entries
            .iter()
            .find(|e| e["path"].as_str().unwrap_or("").ends_with(name))
            .unwrap_or_else(|| panic!("no entry for {name} in {stdout}"))
    };

    assert_eq!(find("good.md")["status"], "loaded");

    let no_fm = find("no-frontmatter.md");
    assert_eq!(no_fm["status"], "skipped");
    assert_eq!(no_fm["reason"], "no YAML frontmatter");

    let missing_id = find("missing-id.md");
    assert_eq!(missing_id["status"], "skipped");
    let reason = missing_id["reason"]
        .as_str()
        .expect("missing-id has reason");
    assert!(
        reason.contains("id"),
        "missing-id reason should mention the absent `id` field, got: {reason}"
    );

    let generated = find("generated.md");
    assert_eq!(generated["status"], "excluded");
    assert_eq!(generated["reason"], "generated.md");
}

#[test]
fn cmd_check_docs_strict_exits_nonzero_when_any_skipped() {
    let tmp = tempfile::tempdir().expect("tempdir");
    // No excludes — both no-frontmatter.md and missing-id.md are
    // genuine skips that should trip --strict.
    fixture(tmp.path(), "docs:\n  - docs\n");

    // Un-strict run: passes despite the skips.
    let lenient = Command::new(rivet_bin())
        .args(["--project", tmp.path().to_str().unwrap(), "check", "docs"])
        .output()
        .expect("run rivet check docs");
    assert!(
        lenient.status.success(),
        "non-strict check docs must pass: stderr={}",
        String::from_utf8_lossy(&lenient.stderr)
    );

    // Strict run: any skipped entry trips exit 1.
    let strict = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "check",
            "docs",
            "--strict",
        ])
        .output()
        .expect("run rivet check docs --strict");
    assert!(
        !strict.status.success(),
        "strict check docs must fail when any candidate is skipped"
    );
}

#[test]
fn cmd_check_docs_strict_passes_when_skipped_files_excluded() {
    let tmp = tempfile::tempdir().expect("tempdir");
    // Allowlist every file the scanner would have skipped. Only good.md
    // remains as a loaded entry; generated.md, no-frontmatter.md, and
    // missing-id.md all flip from `skipped` to `excluded`.
    fixture(
        tmp.path(),
        "docs:\n  - path: docs\n    exclude:\n      \
         - \"no-frontmatter.md\"\n      \
         - \"missing-id.md\"\n      \
         - \"generated.md\"\n",
    );

    let out = Command::new(rivet_bin())
        .args([
            "--project",
            tmp.path().to_str().unwrap(),
            "check",
            "docs",
            "--strict",
            "--format",
            "json",
        ])
        .output()
        .expect("run rivet check docs --strict");

    assert!(
        out.status.success(),
        "strict check docs must pass when all skips are allowlisted: stderr={}",
        String::from_utf8_lossy(&out.stderr)
    );

    let v: serde_json::Value =
        serde_json::from_str(&String::from_utf8_lossy(&out.stdout)).expect("valid JSON");
    assert_eq!(v["by_status"]["skipped"], 0);
    assert_eq!(v["by_status"]["excluded"], 3);
    assert_eq!(v["by_status"]["loaded"], 1);
}

#[test]
fn cmd_check_docs_text_format_is_human_readable() {
    let tmp = tempfile::tempdir().expect("tempdir");
    fixture(
        tmp.path(),
        "docs:\n  - path: docs\n    exclude:\n      - \"generated.md\"\n",
    );

    let out = Command::new(rivet_bin())
        .args(["--project", tmp.path().to_str().unwrap(), "check", "docs"])
        .output()
        .expect("run rivet check docs");
    let stdout = String::from_utf8_lossy(&out.stdout);

    // One line per candidate.
    assert!(
        stdout.contains("loaded: "),
        "missing loaded line:\n{stdout}"
    );
    assert!(
        stdout.contains("skipped: "),
        "missing skipped line:\n{stdout}"
    );
    assert!(
        stdout.contains("excluded: "),
        "missing excluded line:\n{stdout}"
    );
    assert!(stdout.contains("good.md"), "missing good.md:\n{stdout}");
    assert!(
        stdout.contains("no-frontmatter.md"),
        "missing no-frontmatter.md:\n{stdout}"
    );
    assert!(
        stdout.contains("no YAML frontmatter"),
        "missing reason text:\n{stdout}"
    );
    assert!(
        stdout.contains("generated.md"),
        "missing generated.md:\n{stdout}"
    );

    // Trailing summary line.
    assert!(
        stdout.contains("Total: 4 (loaded: 1, skipped: 2, excluded: 1)"),
        "missing summary line:\n{stdout}"
    );
}
