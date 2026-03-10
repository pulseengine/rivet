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

/// Build spar WASM assets if they are missing and spar repo is available.
///
/// Checks `SPAR_DIR` env var, then `../spar` as default location.
/// Skips silently if spar is not found (WASM features are optional).
fn build_wasm_assets() {
    let wasm_js = Path::new("assets/wasm/js/spar_wasm.js");
    let wasm_core = Path::new("assets/wasm/js/spar_wasm.core.wasm");

    // Rebuild whenever the build script or existing assets change.
    println!("cargo:rerun-if-changed=../scripts/build-wasm.sh");
    println!("cargo:rerun-if-changed=assets/wasm/js/spar_wasm.js");

    // Locate the spar repository.
    let spar_dir = std::env::var("SPAR_DIR").unwrap_or_else(|_| "../spar".to_string());
    let spar_path = Path::new(&spar_dir);
    let spar_wasm_crate = spar_path.join("crates/spar-wasm");

    // Compare local spar HEAD against the rev pinned in Cargo.toml.
    if spar_path.join(".git").exists() {
        check_spar_version_drift(&spar_dir);
    }

    if wasm_js.exists() && wasm_core.exists() {
        return; // Assets already present, nothing to do.
    }

    if !spar_wasm_crate.exists() {
        println!(
            "cargo:warning=WASM assets missing and spar repo not found at {spar_dir}. \
             Set SPAR_DIR env var or run: ./scripts/build-wasm.sh /path/to/spar"
        );
        return;
    }

    // Run the build script from the workspace root.
    println!("cargo:warning=Building spar WASM assets from {spar_dir}...");
    let status = Command::new("bash")
        .arg("../scripts/build-wasm.sh")
        .arg(&spar_dir)
        .status();

    match status {
        Ok(s) if s.success() => {
            println!("cargo:warning=spar WASM assets built successfully.");
        }
        Ok(s) => {
            println!(
                "cargo:warning=WASM build script exited with {}. \
                 Dashboard AADL rendering may not work.",
                s
            );
        }
        Err(e) => {
            println!("cargo:warning=Failed to run WASM build script: {e}");
        }
    }
}

/// Compare the local spar repo HEAD against the rev pinned in workspace Cargo.toml.
/// Warns if they differ so developers know to bump the dep or update spar.
fn check_spar_version_drift(spar_dir: &str) {
    // Read the pinned rev from Cargo.toml.
    let cargo_toml = Path::new("../Cargo.toml");
    let pinned_rev = match std::fs::read_to_string(cargo_toml) {
        Ok(content) => {
            // Look for: spar-hir = { ... rev = "XXXXXXX" ... }
            content
                .lines()
                .find(|l| l.contains("spar-hir") && l.contains("rev"))
                .and_then(|line| {
                    let after_rev = line.split("rev = \"").nth(1)?;
                    Some(after_rev.split('"').next()?.to_string())
                })
        }
        Err(_) => None,
    };

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
            "cargo:warning=spar version drift: Cargo.toml pins rev {pinned}, \
             but local spar is at {head} ({distance} commits ahead). \
             Consider: cargo update -p spar-hir -p spar-analysis"
        );
    }
}
