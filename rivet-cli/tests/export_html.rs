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

//! Integration tests for `rivet export --html`.
//!
//! These run the real binary against the rivet project itself (the dogfood
//! corpus) and assert on the structure / size of the output. The
//! assertions verify REQ-087 (`--filter` actually narrows the per-artifact
//! page set) and REQ-088 (CSS/JS extracted to shared `_assets/` rather
//! than embedded per-page; per-page payload stays small).
//!
//! rivet: verifies REQ-087
//! rivet: verifies REQ-088

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

fn run_export(out: &std::path::Path, filter: Option<&str>) {
    let mut cmd = Command::new(rivet_bin());
    cmd.args([
        "export",
        "--format",
        "html",
        "--output",
        out.to_str().unwrap(),
    ])
    .current_dir(project_root());
    if let Some(f) = filter {
        cmd.arg("--filter").arg(f);
    }
    let status = cmd.status().expect("run rivet export");
    assert!(status.success(), "rivet export exited non-zero: {status:?}");
}

fn count_html(dir: &std::path::Path) -> usize {
    std::fs::read_dir(dir)
        .map(|rd| {
            rd.filter_map(Result::ok)
                .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("html"))
                .count()
        })
        .unwrap_or(0)
}

/// REQ-088: CSS + JS are extracted to a single `_assets/` directory and
/// referenced by relative URL; per-page HTML stays small.
#[test]
fn export_html_extracts_shared_assets() {
    let tmp = tempfile::tempdir().unwrap();
    let out = tmp.path().join("dist");
    run_export(&out, None);

    let assets = out.join("_assets");
    assert!(
        assets.join("styles.css").is_file(),
        "_assets/styles.css must exist"
    );
    assert!(
        assets.join("mermaid.min.js").is_file(),
        "_assets/mermaid.min.js must exist"
    );

    // Per-artifact pages must reference assets, not embed them.
    let artifacts = out.join("artifacts");
    let mut sample_pages = std::fs::read_dir(&artifacts)
        .unwrap()
        .filter_map(Result::ok)
        .filter(|e| e.path().extension().and_then(|s| s.to_str()) == Some("html"))
        .filter(|e| e.file_name() != *"index.html")
        .take(5);
    let first = sample_pages.next().expect("at least one artifact page");
    let body = std::fs::read_to_string(first.path()).unwrap();
    assert!(
        body.contains("_assets/mermaid.min.js"),
        "per-artifact page must reference shared mermaid.min.js, got:\n{}",
        &body[..body.len().min(2000)]
    );
    // The page must not contain the verbatim mermaid library source (that
    // signature only appears when the framework is inlined).
    assert!(
        !body.contains("function mermaid"),
        "per-artifact page must not embed mermaid library source"
    );
    let len = body.len();
    assert!(
        len < 100_000,
        "per-artifact page should be <100KB (was {len} bytes); REQ-088 budget"
    );
}

/// REQ-087: `--filter` actually narrows the per-artifact page set.
///
/// Uses a deliberately unmatching filter so the assertion is independent
/// of the rivet corpus's current contents — what matters is that
/// "filter set" -> "fewer per-artifact pages than the unfiltered baseline."
#[test]
fn export_html_filter_narrows_per_artifact_pages() {
    let tmp = tempfile::tempdir().unwrap();

    // Baseline: no filter, full per-artifact set.
    let full = tmp.path().join("full");
    run_export(&full, None);
    let full_count = count_html(&full.join("artifacts"));
    assert!(
        full_count > 10,
        "baseline should emit many per-artifact pages, got {full_count}"
    );

    // Filtered: a clause that no artifact satisfies. The per-artifact
    // page set should drop to (effectively) just artifacts/index.html.
    let filtered = tmp.path().join("filtered");
    run_export(
        &filtered,
        Some(r#"(has-tag "this-tag-definitely-does-not-exist-anywhere")"#),
    );
    let filtered_count = count_html(&filtered.join("artifacts"));
    assert!(
        filtered_count < full_count,
        "filter must narrow: full={full_count}, filtered={filtered_count}"
    );
    // Allow the artifacts/index.html shell to remain — what we're
    // proving is the per-artifact emission honoured the filter.
    assert!(
        filtered_count <= 2,
        "an unmatching filter should leave at most the index shell; \
         got {filtered_count} pages"
    );
}

/// #468 / REQ-200: a static export has no JS to fill the `.aadl-diagram`
/// placeholder, so it must not ship the perpetual "Loading AADL diagram..."
/// across ANY page. (REQ-196 patched a rivet-core fn the multi-page exporter
/// never calls, so the bug stayed live until fixed in `wrap_page`.)
#[test]
fn export_html_replaces_perpetual_aadl_loading_placeholder() {
    let tmp = tempfile::tempdir().unwrap();
    let out = tmp.path().join("dist");
    run_export(&out, None);
    let needle = "<p class=\"aadl-loading\">Loading AADL diagram...</p>";
    let mut offenders: Vec<std::path::PathBuf> = Vec::new();
    let mut stack = vec![out.clone()];
    while let Some(d) = stack.pop() {
        let Ok(rd) = std::fs::read_dir(&d) else {
            continue;
        };
        for e in rd.filter_map(Result::ok) {
            let p = e.path();
            if p.is_dir() {
                stack.push(p);
            } else if p.extension().and_then(|s| s.to_str()) == Some("html")
                && std::fs::read_to_string(&p)
                    .unwrap_or_default()
                    .contains(needle)
            {
                offenders.push(p.strip_prefix(&out).unwrap_or(&p).to_path_buf());
            }
        }
    }
    assert!(
        offenders.is_empty(),
        "static export still ships the perpetual AADL placeholder in: {offenders:?}"
    );
}
