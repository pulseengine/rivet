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

//! Security floors for dependencies that run untrusted code (REQ-402).
//!
//! rivet's WASM adapter runtime (rivet-core's `wasm` feature) executes guest
//! components under wasmtime and bounds them with fuel. RUSTSEC-2026-0321..0327
//! (a fuel bypass, a native stack buffer overflow, GC heap corruption, ...)
//! affect wasmtime and wasmtime-wasi 48.0.3 and earlier, and
//! RUSTSEC-2026-0353..0364 (host panics, unaligned exception-tag data) affect
//! 48.0.5 and earlier, and RUSTSEC-2026-0378..0379 (a stream payload panic,
//! an aarch64 `br_table` miscompile) affect 48.0.6; together they leave the
//! patched ranges `>=48.0.7, <49.0.0` and `>=49.0.4`. The gated `cargo deny`
//! check catches an affected version only because deny.toml analyses every
//! feature (#1034); this test fails in every `cargo test` independently of that
//! configuration if the lockfile resolves an affected version again (a lock
//! revert, a downgrade, or a merge that keeps the old lock).

// rivet: verifies REQ-402

use std::path::Path;

/// Every version `Cargo.lock` resolves for `name` (a crate can appear twice).
fn locked_versions(lock: &str, name: &str) -> Vec<(u64, u64, u64)> {
    let mut out = Vec::new();
    let mut lines = lock.lines();
    while let Some(line) = lines.next() {
        if line.trim() != format!("name = \"{name}\"") {
            continue;
        }
        let Some(ver) = lines.next().and_then(|l| {
            l.trim()
                .strip_prefix("version = \"")?
                .strip_suffix('"')
                .map(str::to_owned)
        }) else {
            continue;
        };
        let parts: Option<Vec<u64>> = ver
            .split(['.', '-', '+'])
            .take(3)
            .map(|p| p.parse().ok())
            .collect();
        // An unparseable version is recorded as 0.0.0, which no patched range
        // accepts: the floor fails loudly instead of skipping the entry.
        match parts.as_deref() {
            Some([major, minor, patch]) => out.push((*major, *minor, *patch)),
            _ => out.push((0, 0, 0)),
        }
    }
    out
}

/// The patched ranges RUSTSEC-2026-0321..0327, 0353..0364 and 0378..0379 name
/// (the latest set raised the floor to 48.0.7 and 49.0.4).
fn is_patched(v: (u64, u64, u64)) -> bool {
    match v {
        (48, 0, p) => p >= 7,
        (48, _, _) => true,
        (49, 0, p) => p >= 4,
        (major, _, _) => major >= 49,
    }
}

#[test]
fn wasmtime_is_outside_the_rustsec_2026_advisory_ranges() {
    let lock_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../Cargo.lock");
    let lock = std::fs::read_to_string(&lock_path).expect("workspace Cargo.lock");
    for name in ["wasmtime", "wasmtime-wasi"] {
        let versions = locked_versions(&lock, name);
        assert!(
            !versions.is_empty(),
            "{name} not found in Cargo.lock: the floor would pass vacuously"
        );
        for v in versions {
            assert!(
                is_patched(v),
                "{name} {}.{}.{} is affected by RUSTSEC-2026-0321..0327, 0353..0364 or 0378..0379; \
                 the patched ranges are >=48.0.7,<49.0.0 and >=49.0.4",
                v.0,
                v.1,
                v.2
            );
        }
    }
}

#[test]
fn the_floor_rejects_the_affected_and_accepts_the_patched_versions() {
    for affected in [
        (48, 0, 3),
        (48, 0, 5),
        (48, 0, 6),
        (48, 0, 0),
        (47, 0, 4),
        (49, 0, 0),
        (49, 0, 2),
        (49, 0, 3),
    ] {
        assert!(!is_patched(affected), "{affected:?} must be rejected");
    }
    for patched in [(48, 0, 7), (48, 1, 0), (49, 0, 4), (49, 1, 0), (50, 0, 0)] {
        assert!(is_patched(patched), "{patched:?} must be accepted");
    }
    let lock = "[[package]]\nname = \"wasmtime\"\nversion = \"48.0.3\"\n\n\
                [[package]]\nname = \"wasmtime-wasi\"\nversion = \"48.0.5\"\n";
    assert_eq!(locked_versions(lock, "wasmtime"), vec![(48, 0, 3)]);
    assert_eq!(locked_versions(lock, "wasmtime-wasi"), vec![(48, 0, 5)]);
}

/// RUSTSEC-2026-0308 (salsa use-after-free) is fixed in salsa 0.28.5. rivet
/// shares salsa types with spar, so the fix needs ONE salsa in the tree: two
/// versions would mean spar and rivet-core disagree on the types (REQ-376).
/// `None` when `lock` resolves exactly one salsa at or above 0.28.5.
fn salsa_floor_violation(lock: &str) -> Option<String> {
    let versions = locked_versions(lock, "salsa");
    match versions.as_slice() {
        [v] if *v >= (0, 28, 5) => None,
        [v] => Some(format!(
            "salsa {}.{}.{} is affected by RUSTSEC-2026-0308; the fix is 0.28.5",
            v.0, v.1, v.2
        )),
        _ => Some(format!(
            "Cargo.lock must resolve exactly one salsa (rivet-core and spar share its types), got {versions:?}"
        )),
    }
}

// rivet: verifies REQ-376
#[test]
fn salsa_is_one_version_at_or_above_the_rustsec_2026_0308_fix() {
    let lock_path = Path::new(env!("CARGO_MANIFEST_DIR")).join("../Cargo.lock");
    let lock = std::fs::read_to_string(&lock_path).expect("workspace Cargo.lock");
    if let Some(problem) = salsa_floor_violation(&lock) {
        panic!("{problem}");
    }
}

#[test]
fn the_salsa_floor_rejects_old_split_and_missing_salsa() {
    let one = |v: &str| format!("[[package]]\nname = \"salsa\"\nversion = \"{v}\"\n");
    assert_eq!(salsa_floor_violation(&one("0.28.5")), None);
    assert_eq!(salsa_floor_violation(&one("0.29.0")), None);
    assert!(salsa_floor_violation(&one("0.26.1")).is_some());
    assert!(salsa_floor_violation(&one("0.28.4")).is_some());
    let split = format!("{}\n{}", one("0.26.2"), one("0.28.5"));
    assert!(salsa_floor_violation(&split).is_some());
    assert!(
        salsa_floor_violation("").is_some(),
        "no salsa must not pass vacuously"
    );
}
