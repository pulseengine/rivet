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

//! Guards how integration tests locate the `rivet` binary (REQ-314).
//!
//! Every test in this directory must resolve it with the COMPILE-time
//! `env!("CARGO_BIN_EXE_rivet")`, never the RUN-time
//! `std::env::var("CARGO_BIN_EXE_rivet")` with a hand-built fallback path.
//!
//! Why this is a source-scanning test rather than a behavioural one: the
//! failure is invisible to CI by construction. CI does not set
//! `CARGO_TARGET_DIR`, so the binary lands in `<workspace>/target/debug/rivet`
//! — exactly the path the old fallback hardcoded — and the wrong lookup
//! resolves to the right file by luck. The bug only appears where the target
//! directory is somewhere else: a developer with a shared `CARGO_TARGET_DIR`,
//! or the compliance-evidence build. Measured before the fix, with
//! `CARGO_TARGET_DIR=/tmp/rivet-build`: 2315 tests run, 391 failed, every one
//! `spawn rivet: Os { code: 2, kind: NotFound }`. The same command in CI is
//! green. So no test run this repo performs can catch a regression, and only
//! an assertion about the source text can.

use std::path::Path;

/// No integration test may resolve the binary at run time.
///
/// rivet: verifies REQ-314
#[test]
fn integration_tests_resolve_the_binary_at_compile_time() {
    let dir = Path::new(env!("CARGO_MANIFEST_DIR")).join("tests");
    let mut offenders: Vec<String> = Vec::new();
    let mut scanned = 0usize;

    for entry in std::fs::read_dir(&dir).expect("read tests dir").flatten() {
        let path = entry.path();
        if path.extension().and_then(|e| e.to_str()) != Some("rs") {
            continue;
        }
        // This file necessarily contains the forbidden spelling — it is the
        // needle. Skip it by name rather than by obfuscating the literal,
        // which would make the check harder to read than the rule it enforces.
        if path.file_name().and_then(|n| n.to_str()) == Some("binary_resolution.rs") {
            continue;
        }
        let text = std::fs::read_to_string(&path).expect("read test file");
        scanned += 1;
        if text.contains("env::var(\"CARGO_BIN_EXE_rivet\")") {
            offenders.push(
                path.file_name()
                    .and_then(|n| n.to_str())
                    .unwrap_or("?")
                    .to_string(),
            );
        }
    }

    // Assert we actually looked at something. An empty scan would make the
    // check below pass vacuously, which is the failure mode this whole
    // requirement is about.
    assert!(
        scanned >= 20,
        "expected to scan the integration-test suite, only saw {scanned} files"
    );
    assert!(
        offenders.is_empty(),
        "these tests resolve the rivet binary at RUN time and will fail under \
         nextest with a non-default CARGO_TARGET_DIR — use \
         `env!(\"CARGO_BIN_EXE_rivet\")`: {offenders:?}"
    );
}
