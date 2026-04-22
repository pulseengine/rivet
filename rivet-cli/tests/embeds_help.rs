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

//! Integration tests for `rivet docs embeds` — the computed embed listing.
//!
//! The listing is sourced from `rivet_core::embed::EMBED_REGISTRY` so these
//! tests also serve as regressions for the registry itself.

use std::process::Command;

fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// `rivet docs embeds` lists every registered computed embed.
#[test]
fn docs_embeds_lists_known_tokens() {
    let output = Command::new(rivet_bin())
        .args(["docs", "embeds"])
        .output()
        .expect("failed to execute rivet docs embeds");

    assert!(
        output.status.success(),
        "rivet docs embeds must exit 0; stderr: {}",
        String::from_utf8_lossy(&output.stderr),
    );

    let stdout = String::from_utf8_lossy(&output.stdout);

    // All dispatched embed names must appear — if resolve_embed grows a
    // new handler the author must also extend EMBED_REGISTRY.
    for name in [
        "stats",
        "coverage",
        "diagnostics",
        "matrix",
        "query",
        "group",
        "artifact",
        "links",
        "table",
    ] {
        assert!(
            stdout.contains(name),
            "embed '{name}' missing from `rivet docs embeds` output:\n{stdout}"
        );
    }

    // The output must be self-describing, not just a name dump.
    assert!(stdout.contains("NAME"), "expected NAME header, got:\n{stdout}");
    assert!(stdout.contains("ARGS"), "expected ARGS header, got:\n{stdout}");
    // Legacy markers help users understand that artifact/links/table live
    // in the inline resolver rather than resolve_embed.
    assert!(
        stdout.contains("(inline)"),
        "legacy embeds should be marked; got:\n{stdout}"
    );
    // Usage footer points users at concrete next steps.
    assert!(
        stdout.contains("rivet embed"),
        "expected `rivet embed` usage hint, got:\n{stdout}"
    );
}

/// `rivet docs embeds --format json` produces machine-readable output
/// matching the same registry.
#[test]
fn docs_embeds_json() {
    let output = Command::new(rivet_bin())
        .args(["docs", "embeds", "--format", "json"])
        .output()
        .expect("failed to execute rivet docs embeds --format json");

    assert!(output.status.success());
    let stdout = String::from_utf8_lossy(&output.stdout);

    let val: serde_json::Value =
        serde_json::from_str(&stdout).expect("output must be valid JSON");
    assert_eq!(val["command"], "docs-embeds");
    let embeds = val["embeds"].as_array().expect("embeds must be array");
    let names: Vec<&str> = embeds
        .iter()
        .filter_map(|v| v["name"].as_str())
        .collect();
    for required in ["stats", "coverage", "query", "group", "artifact"] {
        assert!(names.contains(&required), "missing {required} in {names:?}");
    }
    // Every entry has the four advertised fields.
    for e in embeds {
        assert!(e["name"].is_string());
        assert!(e["args"].is_string());
        assert!(e["summary"].is_string());
        assert!(e["example"].is_string());
        assert!(e["legacy"].is_boolean());
    }
}
