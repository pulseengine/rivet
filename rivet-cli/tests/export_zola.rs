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

//! Integration tests for `rivet export --format zola`.
//!
//! These assert on the *generated* Zola content rather than on a live
//! `zola build` (CI runners don't have the `zola` binary). The key
//! property: artifact cross-links, document wiki-links, and the
//! `rivet_artifact` shortcode must use Zola-relative link forms — internal
//! `@/…md` links in markdown and `get_url(…)` in the shortcode — so the
//! site survives a sub-directory deploy (e.g. a GitHub Pages project site
//! served under `/repo/`). A previous version emitted absolute
//! `/<prefix>/artifacts/<slug>/` paths that drop the deploy sub-path and
//! 404 in the browser.
//!
//! rivet: verifies REQ-115
//! rivet: verifies REQ-116
//! rivet: verifies REQ-118

use std::process::Command;
/// Absolute path to the `rivet` binary under test.
///
/// `env!` (compile time), NOT `std::env::var` (run time). Cargo sets
/// `CARGO_BIN_EXE_<name>` for an integration test and substitutes the real
/// path at build time. Reading it at RUN time works under `cargo test`,
/// which happens to leave the variable in the test process environment, but
/// nextest spawns test processes itself and does not — so the old code fell
/// through to a hardcoded `<workspace>/target/debug/rivet` that ignores
/// `CARGO_TARGET_DIR` entirely. See REQ-314.
fn rivet_bin() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

fn project_root() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

/// Scaffold a minimal Zola site at `dir` and export the rivet corpus into
/// it with `--shortcodes`.
fn export_zola(dir: &std::path::Path) {
    std::fs::write(
        dir.join("config.toml"),
        "base_url = \"https://example.github.io/rivet-docs\"\ntitle = \"Rivet\"\n[[taxonomies]]\nname = \"tags\"\n",
    )
    .unwrap();
    std::fs::create_dir_all(dir.join("content")).unwrap();
    let status = Command::new(rivet_bin())
        .args([
            "export",
            "--format",
            "zola",
            "--shortcodes",
            "--output",
            dir.to_str().unwrap(),
        ])
        .current_dir(project_root())
        .status()
        .expect("run rivet export --format zola");
    assert!(status.success(), "zola export exited non-zero: {status:?}");
}

/// Collect every `.md` file written under `content/`.
fn content_markdown(dir: &std::path::Path) -> Vec<String> {
    let mut out = Vec::new();
    let mut stack = vec![dir.join("content")];
    while let Some(d) = stack.pop() {
        let Ok(rd) = std::fs::read_dir(&d) else {
            continue;
        };
        for e in rd.filter_map(Result::ok) {
            let p = e.path();
            if p.is_dir() {
                stack.push(p);
            } else if p.extension().and_then(|s| s.to_str()) == Some("md") {
                out.push(std::fs::read_to_string(&p).unwrap());
            }
        }
    }
    out
}

/// REQ-115 / REQ-118: generated markdown must not emit absolute
/// `/<prefix>/artifacts/<slug>/` links (which break a sub-directory
/// deploy). Cross-links and wiki-links that resolve use Zola internal
/// `@/…md` links instead.
#[test]
fn zola_export_uses_internal_links_not_absolute_paths() {
    let tmp = tempfile::tempdir().unwrap();
    export_zola(tmp.path());
    let pages = content_markdown(tmp.path());
    assert!(!pages.is_empty(), "expected exported markdown pages");

    // No generated artifact link may use the absolute `](/rivet/artifacts/…/)`
    // form. We look specifically for the markdown-link opener `](/` followed
    // by the prefixed artifacts path, which only the generator emits.
    for body in &pages {
        assert!(
            !body.contains("](/rivet/artifacts/"),
            "generated page leaks an absolute artifact link `](/rivet/artifacts/…`:\n{}",
            &body[..body.len().min(1500)]
        );
    }

    // At least one page must use the subpath-safe internal-link form, proving
    // links are emitted (not merely absent).
    let internal_links = pages
        .iter()
        .filter(|b| b.contains("](@/rivet/artifacts/") && b.contains(".md)"))
        .count();
    assert!(
        internal_links > 0,
        "expected at least one Zola internal `@/…md` artifact link in the export"
    );
}

/// REQ-116: the generated `rivet_artifact` shortcode must build its card
/// link with `get_url(...)` (which honours `base_url`), not a hardcoded
/// absolute `/<prefix>/artifacts/…` href.
#[test]
fn zola_shortcode_card_uses_get_url() {
    let tmp = tempfile::tempdir().unwrap();
    export_zola(tmp.path());
    let shortcode = std::fs::read_to_string(
        tmp.path()
            .join("templates")
            .join("shortcodes")
            .join("rivet_artifact.html"),
    )
    .expect("rivet_artifact shortcode must be written with --shortcodes");

    assert!(
        shortcode.contains("get_url("),
        "shortcode card link must use get_url(...) to honour base_url:\n{shortcode}"
    );
    assert!(
        !shortcode.contains("href=\"/{{ prefix }}/artifacts/"),
        "shortcode must not hardcode an absolute /<prefix>/artifacts/ href:\n{shortcode}"
    );
}

/// Regression: a literal backslash in an artifact description (e.g. a regex
/// like `\.rs$`) must be escaped in the emitted TOML front matter. A
/// multi-line basic string (""") processes escapes, so a bare `\` is an
/// invalid escape that makes `zola build` fail to parse the page. #392 / REQ-181.
// rivet: verifies REQ-181
#[test]
fn zola_frontmatter_escapes_backslashes_in_description() {
    let proj = tempfile::tempdir().unwrap();
    std::fs::write(
        proj.path().join("rivet.yaml"),
        "project:\n  name: t\n  schemas: [common, dev]\n\
         sources:\n  - path: artifacts\n    format: generic-yaml\n",
    )
    .unwrap();
    std::fs::create_dir_all(proj.path().join("artifacts")).unwrap();
    // Single-quoted YAML keeps the backslash literal: description = `matches \.rs$ files`.
    std::fs::write(
        proj.path().join("artifacts/a.yaml"),
        "artifacts:\n  - id: REQ-1\n    type: requirement\n    title: Backslash regex test\n    \
         description: 'matches \\.rs$ files'\n",
    )
    .unwrap();

    let site = tempfile::tempdir().unwrap();
    std::fs::write(
        site.path().join("config.toml"),
        "base_url = \"https://example.test/x\"\ntitle = \"t\"\n[[taxonomies]]\nname = \"tags\"\n",
    )
    .unwrap();
    std::fs::create_dir_all(site.path().join("content")).unwrap();

    let status = Command::new(rivet_bin())
        .args([
            "--project",
            proj.path().to_str().unwrap(),
            "export",
            "--format",
            "zola",
            "--output",
            site.path().to_str().unwrap(),
        ])
        .status()
        .expect("run rivet export --format zola");
    assert!(status.success(), "export exited non-zero: {status:?}");

    let mds = content_markdown(site.path());
    let md = mds
        .iter()
        .find(|m| m.contains("Backslash regex test"))
        .expect("the REQ-1 page must be exported");
    // The backslash must be doubled (escaped) in the front matter.
    assert!(
        md.contains("\\\\.rs$"),
        "description backslash must be escaped to \\\\ in TOML front matter:\n{md}"
    );
}
