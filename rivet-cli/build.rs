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
    clippy::print_stderr
)]

use std::path::Path;
use std::process::Command;

fn main() {
    // ── WASM asset build (spar) ────────────────────────────────────────
    build_wasm_assets();

    // ── Git metadata ───────────────────────────────────────────────────
    println!("cargo:rerun-if-changed=../.git/HEAD");
    println!("cargo:rerun-if-changed=../.git/index");

    let git = |args: &[&str]| -> String {
        Command::new("git")
            .args(args)
            .output()
            .ok()
            .filter(|o| o.status.success())
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
            .unwrap_or_default()
    };

    let commit = git(&["rev-parse", "--short=8", "HEAD"]);
    let branch = git(&["rev-parse", "--abbrev-ref", "HEAD"]);
    let dirty = !git(&["status", "--porcelain"]).is_empty();

    // Count uncommitted changes by category
    let status_output = git(&["status", "--porcelain"]);
    let mut staged = 0u32;
    let mut modified = 0u32;
    let mut untracked = 0u32;
    for line in status_output.lines() {
        if line.len() < 2 {
            continue;
        }
        let index = line.as_bytes()[0];
        let worktree = line.as_bytes()[1];
        if line.starts_with("??") {
            untracked += 1;
        } else {
            if index != b' ' && index != b'?' {
                staged += 1;
            }
            if worktree != b' ' && worktree != b'?' {
                modified += 1;
            }
        }
    }

    let build_date = Command::new("date")
        .arg("+%Y-%m-%d")
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| "unknown".to_string());

    println!("cargo:rustc-env=RIVET_GIT_COMMIT={commit}");
    println!("cargo:rustc-env=RIVET_GIT_BRANCH={branch}");
    println!("cargo:rustc-env=RIVET_GIT_DIRTY={dirty}");
    println!("cargo:rustc-env=RIVET_GIT_STAGED={staged}");
    println!("cargo:rustc-env=RIVET_GIT_MODIFIED={modified}");
    println!("cargo:rustc-env=RIVET_GIT_UNTRACKED={untracked}");
    println!("cargo:rustc-env=RIVET_BUILD_DATE={build_date}");
}

/// Build or stub spar WASM assets.
///
/// If WASM assets exist on disk, they are used as-is.
/// If a local spar repo is found, the build script is run to compile them.
/// Otherwise, stub files are generated so `include_str!`/`include_bytes!`
/// always succeeds — the JS runtime detects empty stubs and shows a fallback.
fn build_wasm_assets() {
    let wasm_dir = Path::new("assets/wasm/js");
    let wasm_js = wasm_dir.join("spar_wasm.js");
    let wasm_core = wasm_dir.join("spar_wasm.core.wasm");
    let wasm_core2 = wasm_dir.join("spar_wasm.core2.wasm");
    let wasm_core3 = wasm_dir.join("spar_wasm.core3.wasm");

    // Rebuild whenever the build script or existing assets change.
    println!("cargo:rerun-if-changed=../scripts/build-wasm.sh");
    println!("cargo:rerun-if-changed=assets/wasm/js/spar_wasm.js");

    // Locate the spar repository.
    let spar_dir = std::env::var("SPAR_DIR").unwrap_or_else(|_| "../spar".to_string());
    let spar_path = Path::new(&spar_dir);
    let spar_wasm_crate = spar_path.join("crates/spar-wasm");

    // Compare local spar HEAD against the commit Cargo.lock pins (REQ-390).
    if spar_path.join(".git").exists() {
        check_spar_version_drift(&spar_dir);
    }

    if wasm_js.exists() && wasm_core.exists() {
        return; // Real assets already present.
    }

    // Try to build from local spar repo.
    if spar_wasm_crate.exists() {
        // REQ-390 / #951: this used to `git checkout` the pin INSIDE the
        // sibling spar repository — a build rewriting another repo's working
        // tree. It never ran, only because the pin lookup could not match a
        // `tag =` pin. build-wasm.sh now refuses a checkout that is not the
        // Cargo.lock commit, and says which commit to check out.
        println!("cargo:warning=Building spar WASM assets from {spar_dir}...");
        let status = Command::new("bash")
            .arg("../scripts/build-wasm.sh")
            .arg(&spar_dir)
            .status();

        match status {
            Ok(s) if s.success() => {
                println!("cargo:warning=spar WASM assets built successfully.");
                return;
            }
            Ok(s) => {
                println!(
                    "cargo:warning=WASM build script exited with {}. Generating stubs.",
                    s
                );
            }
            Err(e) => {
                println!("cargo:warning=Failed to run WASM build script: {e}. Generating stubs.");
            }
        }
    }

    // Generate stub files so include_str!/include_bytes! always succeeds.
    // The JS runtime detects empty stubs via the HEAD probe and shows a fallback.
    std::fs::create_dir_all(wasm_dir).ok();
    if !wasm_js.exists() {
        std::fs::write(&wasm_js, "// stub: spar WASM not available\n").ok();
    }
    if !wasm_core.exists() {
        std::fs::write(&wasm_core, b"").ok();
    }
    if !wasm_core2.exists() {
        std::fs::write(&wasm_core2, b"").ok();
    }
    if !wasm_core3.exists() {
        std::fs::write(&wasm_core3, b"").ok();
    }
    println!(
        "cargo:warning=WASM assets not found — generated stubs. AADL diagrams will show a fallback."
    );
}

/// REQ-390 / #951: the spar commit the native build compiled, from the
/// workspace Cargo.lock. The old lookup searched Cargo.toml for `rev =`, but
/// the pin is `tag =`, so it never matched and the drift check never fired.
/// The lock records the commit whatever form the pin takes. Mirrors
/// tools/release/spar-rev.sh, whose oracle is tools/release/spar-rev_test.sh.
fn get_pinned_spar_rev() -> Option<String> {
    let lock = std::fs::read_to_string(Path::new("../Cargo.lock")).ok()?;
    let mut revs: Vec<&str> = lock
        .lines()
        .filter_map(|l| l.strip_prefix("source = \"git+https://github.com/pulseengine/spar"))
        .filter(|rest| rest.starts_with(".git?") || rest.starts_with('?') || rest.starts_with('#'))
        .filter_map(|rest| rest.rsplit_once('#'))
        .map(|(_, rev)| rev.trim_end_matches('"'))
        .filter(|rev| rev.len() == 40 && rev.bytes().all(|b| b.is_ascii_hexdigit()))
        .collect();
    revs.sort_unstable();
    revs.dedup();
    match revs.as_slice() {
        [one] => Some((*one).to_string()),
        _ => None,
    }
}

/// Compare the local spar repo HEAD against the commit Cargo.lock pins.
/// Warns if they differ so developers know to bump the dep or update spar.
fn check_spar_version_drift(spar_dir: &str) {
    let pinned_rev = get_pinned_spar_rev();

    let Some(pinned) = pinned_rev else {
        return; // Can't determine pinned rev, skip check.
    };

    // Get the local spar HEAD.
    let local_head = Command::new("git")
        .args(["rev-parse", "--short=7", "HEAD"])
        .current_dir(spar_dir)
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string());

    let Some(head) = local_head else {
        return;
    };

    // Compare (short revs — check prefix match).
    let pinned_short = &pinned[..pinned.len().min(7)];
    if !head.starts_with(pinned_short) && !pinned_short.starts_with(&head) {
        // Count distance.
        let distance = Command::new("git")
            .args(["rev-list", "--count", &format!("{pinned}..HEAD")])
            .current_dir(spar_dir)
            .output()
            .ok()
            .filter(|o| o.status.success())
            .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
            .unwrap_or_else(|| "?".to_string());

        println!(
            "cargo:warning=spar version drift: Cargo.lock pins {pinned}, \
             but local spar is at {head} ({distance} commits ahead). \
             build-wasm.sh will refuse it; check out the pin, or bump the dependency \
             with cargo update -p spar-hir -p spar-analysis"
        );
    }
}
