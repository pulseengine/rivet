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

//! Lint tests for the serve module HTML output.
//!
//! These tests read the source code of `serve.rs` and verify structural
//! invariants that are easy to regress on, like ensuring all HTMX navigation
//! links push their URL to the browser history.

use std::path::PathBuf;

/// Read all Rust source files from the serve module directory.
fn read_serve_source() -> String {
    let dir = PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("src/serve");
    let mut combined = String::new();
    for entry in std::fs::read_dir(&dir).expect("failed to read serve/ dir") {
        let entry = entry.expect("bad entry");
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) == Some("rs") {
            let content = std::fs::read_to_string(&path)
                .unwrap_or_else(|e| panic!("failed to read {}: {e}", path.display()));
            combined.push_str(&content);
            combined.push('\n');
        }
    }
    combined
}

/// Every `hx-get` link that targets `#content` MUST also include
/// `hx-push-url="true"` so the browser URL bar stays in sync with the
/// displayed page. Without this, reload/F5 navigates the user to the
/// wrong page.
///
/// Exemptions:
/// - `<form>` elements (search/filter forms don't need push-url)
/// - Lines that already contain `hx-push-url`
#[test]
fn all_content_links_push_url() {
    let source = read_serve_source();

    let mut violations = Vec::new();

    for (line_num, line) in source.lines().enumerate() {
        let line_num = line_num + 1; // 1-indexed

        // Skip lines that already have hx-push-url
        if line.contains("hx-push-url") {
            continue;
        }

        // Only check lines that have both hx-get and hx-target="#content"
        // (with escaped quotes as they appear in Rust string literals)
        let has_hx_get = line.contains("hx-get=") || line.contains("hx-get =");
        let has_content_target = line.contains(r##"hx-target="#content""##)
            || line.contains(r##"hx-target=\"#content\""##);

        if !has_hx_get || !has_content_target {
            continue;
        }

        // Exempt forms — they submit search/filter queries, not navigation
        let trimmed = line.trim();
        if trimmed.contains("<form") || trimmed.contains("form ") {
            continue;
        }

        violations.push(format!(
            "  line {line_num}: {}",
            trimmed.chars().take(120).collect::<String>()
        ));
    }

    assert!(
        violations.is_empty(),
        "Found {} hx-get links targeting #content without hx-push-url=\"true\".\n\
         Every navigational link must push its URL so reload/F5 works correctly.\n\
         Fix by adding hx-push-url=\"true\" to each link:\n{}",
        violations.len(),
        violations.join("\n")
    );
}

/// Verify that the `wrap_full_page` middleware pattern is present.
/// This ensures direct browser navigations (typing URL, F5 refresh) get
/// the full page layout with content already rendered (no redirect needed).
#[test]
fn wrap_middleware_exists() {
    let source = read_serve_source();

    assert!(
        source.contains("hx-request") || source.contains("HX-Request"),
        "serve.rs must check the HX-Request header to distinguish \
         HTMX partial requests from direct browser navigations"
    );

    assert!(
        source.contains("wrap_full_page"),
        "serve.rs must contain the wrap_full_page middleware \
         for direct-access full-page rendering"
    );

    assert!(
        source.contains("page_layout"),
        "wrap_full_page middleware must call page_layout to wrap \
         partial HTML in the full shell"
    );
}

/// Verify that the CSP (Content-Security-Policy) middleware is present.
/// This prevents XSS attacks by restricting which resources the browser
/// is allowed to load.
#[test]
fn csp_header_middleware_exists() {
    let source = read_serve_source();

    assert!(
        source.contains("Content-Security-Policy"),
        "serve.rs must set a Content-Security-Policy header on all responses"
    );

    assert!(
        source.contains("default-src 'self'"),
        "CSP must include a default-src directive"
    );

    assert!(
        source.contains("script-src"),
        "CSP must include a script-src directive"
    );
}

/// Verify that the reload handler uses HX-Location (not HX-Refresh)
/// so reloading stays on the current page instead of navigating to root.
#[test]
fn reload_uses_hx_location() {
    let source = read_serve_source();

    // The reload handler should reference HX-Location for in-place reload
    assert!(
        source.contains("HX-Location"),
        "reload handler must use HX-Location header to stay on current page"
    );

    // It should read HX-Current-URL to know where the user is
    assert!(
        source.contains("HX-Current-URL") || source.contains("hx-current-url"),
        "reload handler must read HX-Current-URL to determine current page"
    );
}
