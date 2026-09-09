// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code.
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
    clippy::panic
)]

//! Repo invariant: every module gated behind `#[cfg(kani)]` is excluded from
//! the mutation gate's scope.
//!
//! Mutants inside `#[cfg(kani)]` code are unkillable by construction — the
//! gates run `cargo mutants -- --lib` and `cargo test` never compiles those
//! modules. Reporting them trains readers to dismiss the report, which is what
//! makes the NEXT real survivor cheap to ignore (REQ-324).
//!
//! The invariant is deliberately narrow: it looks for a `#[cfg(kani)]`
//! attribute on a `mod <name>;` DECLARATION and requires the file that
//! declaration names to be excluded. A broader "any file mentioning
//! `#[cfg(kani)]`" scan matches two things it must not — `rivet-core/src/lib.rs`,
//! which merely declares the module and is itself ordinary code that has to
//! stay in scope, and `rivet-cli/src/docs.rs`, which contains the string inside
//! a documentation topic. Excluding either would silently drop real code from
//! the gate, which is a worse defect than the noise this fixes.

use std::path::{Path, PathBuf};

fn workspace_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

/// Files declared as `#[cfg(kani)] mod <name>;`, resolved to their source
/// path relative to the workspace root.
fn cfg_kani_modules(dir: &Path, root: &Path, out: &mut Vec<String>) {
    let Ok(entries) = std::fs::read_dir(dir) else {
        return;
    };
    for entry in entries.flatten() {
        let path = entry.path();
        let name = entry.file_name();
        let name = name.to_string_lossy();
        if name.starts_with('.') || name == "target" || name == "node_modules" {
            continue;
        }
        if path.is_dir() {
            cfg_kani_modules(&path, root, out);
            continue;
        }
        if path.extension().is_none_or(|e| e != "rs") {
            continue;
        }
        let Ok(text) = std::fs::read_to_string(&path) else {
            continue;
        };
        let lines: Vec<&str> = text.lines().collect();
        for (i, line) in lines.iter().enumerate() {
            if line.trim() != "#[cfg(kani)]" {
                continue;
            }
            // The declaration may sit a few lines below (attributes, comments).
            for next in lines.iter().skip(i + 1).take(4) {
                let t = next.trim();
                if t.is_empty() || t.starts_with("//") || t.starts_with('#') {
                    continue;
                }
                if let Some(rest) = t.strip_prefix("mod ") {
                    if let Some(modname) = rest.strip_suffix(';') {
                        let parent = path.parent().unwrap_or(root);
                        let flat = parent.join(format!("{}.rs", modname.trim()));
                        let nested = parent.join(modname.trim()).join("mod.rs");
                        let target = if flat.exists() { flat } else { nested };
                        if let Ok(rel) = target.strip_prefix(root) {
                            out.push(rel.to_string_lossy().replace('\\', "/"));
                        }
                    }
                }
                break;
            }
        }
    }
}

/// The config must live where cargo-mutants actually reads it.
///
/// cargo-mutants 27.0.0 reads `.cargo/mutants.toml` and IGNORES a root-level
/// `mutants.toml` with no warning. That is not hypothetical: the first version
/// of REQ-324 put the file at the root, the scope test below passed, and
/// `cargo mutants -p rivet-core --list` still enumerated 236 mutants in
/// proofs.rs. A config in the wrong place is worse than none, because it reads
/// as a solved problem.
///
/// Both assertions are unconditional. A `if exists { assert }` guard here would
/// pass on a repository with no config at all.
///
// rivet: verifies REQ-324
#[test]
fn the_mutants_config_is_where_cargo_mutants_reads_it() {
    let root = workspace_root();
    assert!(
        root.join(".cargo").join("mutants.toml").is_file(),
        "the cargo-mutants config must be at .cargo/mutants.toml — that is the \
         path the tool reads"
    );
    assert!(
        !root.join("mutants.toml").exists(),
        "a root-level mutants.toml must NOT exist: cargo-mutants ignores it \
         silently, so its presence would suggest a scope is configured when \
         none is in effect"
    );
}

// rivet: verifies REQ-324
#[test]
fn every_cfg_kani_module_is_excluded_from_the_mutation_scope() {
    let root = workspace_root();
    // `.cargo/mutants.toml`, NOT `mutants.toml` at the root: cargo-mutants
    // 27.0.0 reads the former and silently ignores the latter. A root-level
    // file left 236 mutants listed in proofs.rs while this test passed —
    // caught by listing mutants for real rather than trusting the config's
    // existence.
    let raw = std::fs::read_to_string(root.join(".cargo").join("mutants.toml")).expect(
        ".cargo/mutants.toml must exist — it is what scopes the mutation \
             gate. cargo-mutants does NOT read a root-level mutants.toml.",
    );
    // Parse the exclude_globs ARRAY, not the whole file. Substring-matching
    // the file matches the rationale comment above the setting, which made an
    // earlier version of this test pass with the real exclusion deleted —
    // found because the negative control failed to redden.
    let config: String = raw
        .split_once("exclude_globs")
        .map(|(_, rest)| rest)
        .and_then(|rest| rest.split_once('['))
        .map(|(_, rest)| rest)
        .and_then(|rest| rest.split_once(']'))
        .map(|(list, _)| list.to_string())
        .expect("mutants.toml must declare an `exclude_globs = [...]` array");

    let mut found = Vec::new();
    for crate_dir in ["rivet-core", "rivet-cli", "etch"] {
        let src = root.join(crate_dir).join("src");
        if src.is_dir() {
            cfg_kani_modules(&src, &root, &mut found);
        }
    }
    found.sort();
    found.dedup();

    assert_eq!(
        found,
        vec!["rivet-core/src/proofs.rs".to_string()],
        "the set of #[cfg(kani)] modules changed. Every entry must also appear \
         in .cargo/mutants.toml's exclude_globs, because mutants are unkillable \
         by construction (REQ-324). Update both together."
    );

    for file in &found {
        assert!(
            config.contains(file.as_str()),
            "`{file}` is declared `#[cfg(kani)] mod ...;` but is not in \
             .cargo/mutants.toml's exclude_globs. The gate runs \
             `cargo mutants -- --lib` and `cargo test` never compiles the \
             module, so every survivor reported there is noise (REQ-324)."
        );
    }

    // Guard the false positives a coarser scan would have produced: these
    // files MENTION #[cfg(kani)] (a module declaration, and documentation
    // prose) but are ordinary code that must stay in the gate's scope.
    for must_stay in ["rivet-core/src/lib.rs", "rivet-cli/src/docs.rs"] {
        assert!(
            !config.contains(must_stay),
            "`{must_stay}` must NOT be excluded: it only mentions #[cfg(kani)] \
             and is real code the mutation gate has to keep covering. \
             Excluding it would drop live code from the gate, which is worse \
             than the noise REQ-324 removes."
        );
    }
}
