//! Oracle subcommands under `rivet check`.
//!
//! Oracles are mechanical checks that either pass (exit 0, quiet) or fire
//! (exit 1, diagnostics on stderr and optional JSON on stdout). Each oracle
//! is a narrow, reusable gate that agent pipelines can declare in a
//! schema's `agent-pipelines:` block.
//!
//! Three oracles live here (v0.4.4 initial set):
//!
//! * [`bidirectional`] — every forward link whose type has an `inverse:`
//!   declared in the schema must have that inverse registered on the
//!   target. Catches broken bidirectional traceability.
//! * [`review_signoff`] — artifacts in `released` status must have a
//!   reviewer distinct from the author, optionally matching a role.
//! * [`gaps_json`] — runs `rivet validate` internally and emits a
//!   canonical JSON summary grouped by artifact. Feeds `rivet
//!   close-gaps` and other meta-oracles without re-parsing validator
//!   output.
//!
//! Each oracle emits JSON on `--format json` and human text by default.
//! The JSON shape is the contract pipelines consume.

pub mod bidirectional;
pub mod gaps_json;
pub mod review_signoff;
pub mod sources;
