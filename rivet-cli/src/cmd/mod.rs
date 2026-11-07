//! Subcommand implementations split out of `main.rs` (#1143).
//!
//! Each submodule holds one command group, moved verbatim from `main.rs`.

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
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
    clippy::print_stderr,
    // SCRC Phase 2 (DD-063): `clippy::exit` is the right lint to enforce
    // in library code but `rivet-cli` is a CLI binary where
    // `std::process::exit(2)` is the idiomatic way to signal the
    // POSIX "misuse" exit code for `rivet variant value/attr`
    // (0 = selected/present, 1 = absent-but-defined, 2 = unknown/error).
    // Returning Result<bool> cannot express the three-valued contract.
    clippy::exit
)]

pub(crate) mod coverage;
pub(crate) mod export;
pub(crate) mod externals;
pub(crate) mod mutate;
pub(crate) mod release;
pub(crate) mod verify;
