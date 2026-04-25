//! `.rivet/` directory ownership model.
//!
//! Three ownership categories determine who may write which paths under
//! `.rivet/`:
//!
//! - **RivetOwned** — generated and maintained by rivet itself. Regenerated
//!   on `rivet upgrade`. Users who edit these files see their changes
//!   overwritten (with a warning on upgrade).
//! - **ProjectOwned** — scaffolded once by `rivet init --agents --bootstrap`
//!   and then never touched by rivet again. Users/agents own these.
//! - **AppendOnly** — runtime artifacts like the run history. Rivet
//!   appends new entries; never rewrites old ones.
//!
//! Callers ask `classify(path)` before writing; `guard_write(path, mode)`
//! refuses writes that violate the ownership rules.
//!
//! The canonical directory layout is:
//!
//! ```text
//! .rivet/
//! ├── .rivet-version     — RivetOwned (pin file, regenerated on upgrade)
//! ├── templates/         — RivetOwned
//! ├── pipelines/         — ProjectOwned
//! ├── context/           — ProjectOwned
//! ├── agents/            — ProjectOwned
//! └── runs/              — AppendOnly
//! ```

use std::path::{Path, PathBuf};

use crate::error::Error;

/// Ownership classification of a path under `.rivet/`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Ownership {
    /// Rivet writes on `init` and `upgrade`. User edits are overwritten.
    RivetOwned,
    /// Scaffolded once, then off-limits to rivet. User/agent owns.
    ProjectOwned,
    /// Append-only: rivet may create new entries, never rewrite existing ones.
    AppendOnly,
    /// Not under `.rivet/` at all — ownership doesn't apply.
    OutsideRivetDir,
}

/// Write mode a caller intends to perform; guards reject the mismatches.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WriteMode {
    /// Writing during fresh scaffold (`rivet init --agents --bootstrap`).
    /// Allowed on RivetOwned, ProjectOwned (only if file doesn't exist),
    /// and AppendOnly.
    Scaffold,
    /// Writing during `rivet upgrade`. Allowed on RivetOwned only.
    Upgrade,
    /// Writing during normal runtime (`close-gaps`, `runs record`, etc.).
    /// Allowed on AppendOnly only.
    Runtime,
    /// Explicit user-requested resync: `rivet upgrade --resync-project`.
    /// Allowed on ProjectOwned and RivetOwned.
    Resync,
}

/// Classify a path by which `.rivet/` subtree it falls under.
///
/// `rivet_dir` is the project's `.rivet/` root (usually `<project>/.rivet`).
/// `target` is the path being classified; may be absolute or relative to
/// `rivet_dir`.
pub fn classify(rivet_dir: &Path, target: &Path) -> Ownership {
    let Ok(rel) = target.strip_prefix(rivet_dir) else {
        // target isn't under rivet_dir; compare literal path components
        // (handles the case where target is given relative to rivet_dir
        // directly, e.g. `templates/foo.md`).
        return classify_rel(target);
    };
    classify_rel(rel)
}

fn classify_rel(rel: &Path) -> Ownership {
    let mut comps = rel.components();
    match comps.next().and_then(|c| c.as_os_str().to_str()) {
        None => Ownership::OutsideRivetDir,
        Some(".rivet-version") => Ownership::RivetOwned,
        Some("templates") => Ownership::RivetOwned,
        Some("pipelines") | Some("context") | Some("agents") => Ownership::ProjectOwned,
        Some("runs") => Ownership::AppendOnly,
        Some(_) => Ownership::OutsideRivetDir,
    }
}

/// Check whether a write at `target` with `mode` is permitted.
///
/// Returns `Ok(())` when allowed, `Err(Error::Ownership(..))` when the write
/// would violate the ownership rules. Call this at every site that writes
/// under `.rivet/` — it's the single enforcement point.
pub fn guard_write(
    rivet_dir: &Path,
    target: &Path,
    mode: WriteMode,
    file_exists: bool,
) -> Result<(), Error> {
    let ownership = classify(rivet_dir, target);
    match (ownership, mode) {
        // RivetOwned: scaffold + upgrade + resync OK, runtime rejected.
        (Ownership::RivetOwned, WriteMode::Scaffold) => Ok(()),
        (Ownership::RivetOwned, WriteMode::Upgrade) => Ok(()),
        (Ownership::RivetOwned, WriteMode::Resync) => Ok(()),
        (Ownership::RivetOwned, WriteMode::Runtime) => Err(Error::Ownership(format!(
            "refusing runtime write to rivet-owned path {}; rivet-owned paths are \
             only written during scaffold or upgrade",
            target.display()
        ))),

        // ProjectOwned: scaffold (only if file is new), resync, rejected otherwise.
        (Ownership::ProjectOwned, WriteMode::Scaffold) if !file_exists => Ok(()),
        (Ownership::ProjectOwned, WriteMode::Scaffold) => Err(Error::Ownership(format!(
            "refusing to overwrite project-owned file {} during scaffold; \
             rivet never overwrites project-owned files once created — \
             use `rivet upgrade --resync-project` if you really want to regenerate",
            target.display()
        ))),
        (Ownership::ProjectOwned, WriteMode::Resync) => Ok(()),
        (Ownership::ProjectOwned, _) => Err(Error::Ownership(format!(
            "refusing write to project-owned path {}; rivet creates these \
             once during `rivet init --agents --bootstrap` and then leaves them alone",
            target.display()
        ))),

        // AppendOnly: runtime, scaffold (for the initial directory). Upgrade rejected.
        (Ownership::AppendOnly, WriteMode::Runtime) => Ok(()),
        (Ownership::AppendOnly, WriteMode::Scaffold) => Ok(()),
        (Ownership::AppendOnly, WriteMode::Resync) => Err(Error::Ownership(format!(
            "refusing to resync append-only path {}; runs are never rewritten — \
             if you want to drop history, delete the directory manually",
            target.display()
        ))),
        (Ownership::AppendOnly, WriteMode::Upgrade) => Err(Error::Ownership(format!(
            "refusing upgrade write to append-only path {}",
            target.display()
        ))),

        // OutsideRivetDir: always allowed — ownership doesn't apply.
        (Ownership::OutsideRivetDir, _) => Ok(()),
    }
}

/// Compute the canonical `.rivet/` directory for a project root.
pub fn rivet_dir(project_root: &Path) -> PathBuf {
    project_root.join(".rivet")
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dir() -> PathBuf {
        PathBuf::from("/tmp/proj/.rivet")
    }

    #[test]
    fn classify_rivet_owned_templates() {
        assert_eq!(
            classify(&dir(), &dir().join("templates/pipelines/structural.tmpl")),
            Ownership::RivetOwned
        );
        assert_eq!(
            classify(&dir(), &dir().join(".rivet-version")),
            Ownership::RivetOwned
        );
    }

    #[test]
    fn classify_project_owned() {
        for sub in &["pipelines", "context", "agents"] {
            assert_eq!(
                classify(&dir(), &dir().join(sub).join("x.yaml")),
                Ownership::ProjectOwned,
                "subdir {sub} should be project-owned"
            );
        }
    }

    #[test]
    fn classify_runs_is_append_only() {
        assert_eq!(
            classify(
                &dir(),
                &dir().join("runs/2026-04-23T00-00-00Z-abc/manifest.json"),
            ),
            Ownership::AppendOnly
        );
    }

    #[test]
    fn classify_outside_rivet_dir() {
        assert_eq!(
            classify(&dir(), &PathBuf::from("/tmp/proj/src/main.rs")),
            Ownership::OutsideRivetDir
        );
    }

    #[test]
    fn guard_scaffold_creates_project_owned() {
        let ok = guard_write(
            &dir(),
            &dir().join("pipelines/dev.yaml"),
            WriteMode::Scaffold,
            false, // file does not exist yet
        );
        assert!(ok.is_ok());
    }

    #[test]
    fn guard_scaffold_refuses_project_owned_overwrite() {
        let err = guard_write(
            &dir(),
            &dir().join("pipelines/dev.yaml"),
            WriteMode::Scaffold,
            true, // file exists
        );
        assert!(err.is_err());
        let msg = format!("{}", err.unwrap_err());
        assert!(msg.contains("project-owned"), "msg: {msg}");
        assert!(msg.contains("resync-project"), "msg: {msg}");
    }

    #[test]
    fn guard_runtime_refuses_rivet_owned() {
        let err = guard_write(
            &dir(),
            &dir().join("templates/pipelines/structural.tmpl"),
            WriteMode::Runtime,
            true,
        );
        assert!(err.is_err());
        assert!(format!("{}", err.unwrap_err()).contains("runtime"));
    }

    #[test]
    fn guard_runtime_allows_runs() {
        let ok = guard_write(
            &dir(),
            &dir().join("runs/2026-04-23T00-00-00Z-abc/manifest.json"),
            WriteMode::Runtime,
            false,
        );
        assert!(ok.is_ok());
    }

    #[test]
    fn guard_resync_allows_project_owned() {
        let ok = guard_write(
            &dir(),
            &dir().join("pipelines/dev.yaml"),
            WriteMode::Resync,
            true,
        );
        assert!(ok.is_ok());
    }

    #[test]
    fn guard_resync_refuses_append_only() {
        let err = guard_write(
            &dir(),
            &dir().join("runs/old/manifest.json"),
            WriteMode::Resync,
            true,
        );
        assert!(err.is_err());
        assert!(format!("{}", err.unwrap_err()).contains("append-only"));
    }

    #[test]
    fn guard_allows_outside_rivet_dir() {
        let ok = guard_write(
            &dir(),
            &PathBuf::from("/tmp/proj/src/main.rs"),
            WriteMode::Runtime,
            true,
        );
        assert!(ok.is_ok());
    }
}
