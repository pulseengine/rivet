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

    // Compare local spar HEAD against the rev pinned in Cargo.toml.
    if spar_path.join(".git").exists() {
        check_spar_version_drift(&spar_dir);
    }

    if wasm_js.exists() && wasm_core.exists() {
        return; // Real assets already present.
    }

    // Try to build from local spar repo.
    if spar_wasm_crate.exists() {
        // Check out the pinned rev before building so WASM matches the dependency.
        if let Some(pinned_rev) = get_pinned_spar_rev() {
            let checkout = Command::new("git")
                .args(["checkout", &pinned_rev])
                .current_dir(&spar_dir)
                .status();
            if let Ok(s) = checkout {
                if s.success() {
                    println!("cargo:warning=Checked out spar at pinned rev {pinned_rev}");
                }
            }
        }

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

/// Extract the pinned spar rev from workspace Cargo.toml.
fn get_pinned_spar_rev() -> Option<String> {
    let cargo_toml = Path::new("../Cargo.toml");
    let content = std::fs::read_to_string(cargo_toml).ok()?;
    content
        .lines()
        .find(|l| l.contains("spar-hir") && l.contains("rev"))
        .and_then(|line| {
            let after_rev = line.split("rev = \"").nth(1)?;
            Some(after_rev.split('"').next()?.to_string())
        })
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
