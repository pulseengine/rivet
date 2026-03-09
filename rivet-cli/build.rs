use std::process::Command;

fn main() {
    // Emit git metadata as compile-time environment variables.
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
