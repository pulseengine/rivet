// rivet-core/src/externals.rs

use std::path::{Path, PathBuf};
use std::process::Command;

use crate::model::ExternalProject;

/// A parsed artifact reference — either local or cross-repo.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ArtifactRef {
    /// Local artifact ID (no prefix).
    Local(String),
    /// Cross-repo artifact: (prefix, id).
    External { prefix: String, id: String },
}

/// Parse an artifact reference string.
///
/// - `"REQ-001"` → `ArtifactRef::Local("REQ-001")`
/// - `"rivet:REQ-001"` → `ArtifactRef::External { prefix: "rivet", id: "REQ-001" }`
pub fn parse_artifact_ref(s: &str) -> ArtifactRef {
    // Only split on first colon. The prefix must be purely alphabetic
    // (no digits, hyphens, or dots) to avoid confusion with IDs like "H-1.2".
    if let Some((prefix, id)) = s.split_once(':') {
        if !prefix.is_empty()
            && prefix.chars().all(|c| c.is_ascii_lowercase())
            && !id.is_empty()
        {
            return ArtifactRef::External {
                prefix: prefix.to_string(),
                id: id.to_string(),
            };
        }
    }
    ArtifactRef::Local(s.to_string())
}

/// Sync a single external project into the cache directory.
///
/// For `path` externals: creates a symlink from `.rivet/repos/<prefix>` to the path.
/// For `git` externals: clones or fetches the repo, checks out the specified ref.
pub fn sync_external(
    ext: &ExternalProject,
    cache_dir: &Path,
    project_dir: &Path,
) -> Result<PathBuf, crate::error::Error> {
    let dest = cache_dir.join(&ext.prefix);
    std::fs::create_dir_all(cache_dir)
        .map_err(|e| crate::error::Error::Io(format!("create cache dir: {e}")))?;

    if let Some(ref local_path) = ext.path {
        // Resolve relative to project dir
        let resolved = if Path::new(local_path).is_relative() {
            project_dir.join(local_path)
        } else {
            PathBuf::from(local_path)
        };
        let resolved = resolved
            .canonicalize()
            .map_err(|e| crate::error::Error::Io(format!("resolve path '{local_path}': {e}")))?;

        // Remove existing symlink/dir if present
        if dest.exists() || dest.is_symlink() {
            if dest.is_symlink() {
                std::fs::remove_file(&dest).ok();
            } else {
                std::fs::remove_dir_all(&dest).ok();
            }
        }

        #[cfg(unix)]
        std::os::unix::fs::symlink(&resolved, &dest)
            .map_err(|e| crate::error::Error::Io(format!("symlink: {e}")))?;

        #[cfg(not(unix))]
        {
            copy_dir_recursive(&resolved, &dest)?;
        }

        return Ok(dest);
    }

    if let Some(ref git_url) = ext.git {
        let git_ref = ext.git_ref.as_deref().unwrap_or("main");

        if dest.join(".git").exists() {
            // Fetch updates
            let output = Command::new("git")
                .args(["fetch", "origin"])
                .current_dir(&dest)
                .output()
                .map_err(|e| crate::error::Error::Io(format!("git fetch: {e}")))?;
            if !output.status.success() {
                return Err(crate::error::Error::Io(format!(
                    "git fetch failed: {}",
                    String::from_utf8_lossy(&output.stderr)
                )));
            }
            // Checkout ref
            let output = Command::new("git")
                .args(["checkout", git_ref])
                .current_dir(&dest)
                .output()
                .map_err(|e| crate::error::Error::Io(format!("git checkout: {e}")))?;
            if !output.status.success() {
                // Try as remote branch
                Command::new("git")
                    .args(["checkout", &format!("origin/{git_ref}")])
                    .current_dir(&dest)
                    .output()
                    .ok();
            }
        } else {
            // Clone fresh
            let output = Command::new("git")
                .args(["clone", git_url, dest.to_str().unwrap_or(".")])
                .output()
                .map_err(|e| crate::error::Error::Io(format!("git clone: {e}")))?;
            if !output.status.success() {
                return Err(crate::error::Error::Io(format!(
                    "git clone failed: {}",
                    String::from_utf8_lossy(&output.stderr)
                )));
            }
            if git_ref != "main" && git_ref != "master" {
                Command::new("git")
                    .args(["checkout", git_ref])
                    .current_dir(&dest)
                    .output()
                    .ok();
            }
        }
        return Ok(dest);
    }

    Err(crate::error::Error::Io(
        "external must have either 'git' or 'path'".into(),
    ))
}

/// Sync all externals declared in the project config.
pub fn sync_all(
    externals: &std::collections::BTreeMap<String, ExternalProject>,
    project_dir: &Path,
) -> Result<Vec<(String, PathBuf)>, crate::error::Error> {
    let cache_dir = project_dir.join(".rivet/repos");
    let mut results = Vec::new();
    for (name, ext) in externals {
        let path = sync_external(ext, &cache_dir, project_dir)?;
        results.push((name.clone(), path));
    }
    Ok(results)
}

/// Ensure `.rivet/` is in `.gitignore`. Returns true if added, false if already present.
pub fn ensure_gitignore(project_dir: &Path) -> Result<bool, crate::error::Error> {
    let gitignore = project_dir.join(".gitignore");
    if gitignore.exists() {
        let content = std::fs::read_to_string(&gitignore)
            .map_err(|e| crate::error::Error::Io(format!("read .gitignore: {e}")))?;
        if content
            .lines()
            .any(|l| l.trim() == ".rivet/" || l.trim() == ".rivet")
        {
            return Ok(false); // already present
        }
    }
    // Append
    use std::io::Write;
    let mut f = std::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&gitignore)
        .map_err(|e| crate::error::Error::Io(format!("open .gitignore: {e}")))?;
    writeln!(f, "\n# Rivet external project cache\n.rivet/")
        .map_err(|e| crate::error::Error::Io(format!("write .gitignore: {e}")))?;
    Ok(true) // added
}

/// Recursively copy a directory (used on non-unix platforms instead of symlinks).
#[cfg(not(unix))]
fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), crate::error::Error> {
    std::fs::create_dir_all(dst)
        .map_err(|e| crate::error::Error::Io(format!("create dir: {e}")))?;
    for entry in std::fs::read_dir(src)
        .map_err(|e| crate::error::Error::Io(format!("read dir: {e}")))?
    {
        let entry =
            entry.map_err(|e| crate::error::Error::Io(format!("read dir entry: {e}")))?;
        let ty = entry
            .file_type()
            .map_err(|e| crate::error::Error::Io(format!("file type: {e}")))?;
        let dest_path = dst.join(entry.file_name());
        if ty.is_dir() {
            copy_dir_recursive(&entry.path(), &dest_path)?;
        } else {
            std::fs::copy(entry.path(), &dest_path)
                .map_err(|e| crate::error::Error::Io(format!("copy file: {e}")))?;
        }
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn local_id_no_colon() {
        assert_eq!(
            parse_artifact_ref("REQ-001"),
            ArtifactRef::Local("REQ-001".into())
        );
    }

    #[test]
    fn external_id_with_prefix() {
        assert_eq!(
            parse_artifact_ref("rivet:REQ-001"),
            ArtifactRef::External {
                prefix: "rivet".into(),
                id: "REQ-001".into(),
            }
        );
    }

    #[test]
    fn local_id_with_hyphen_numbers() {
        // IDs like "H-1.2" should not be confused with prefix:id
        assert_eq!(
            parse_artifact_ref("H-1.2"),
            ArtifactRef::Local("H-1.2".into())
        );
    }

    #[test]
    fn external_with_complex_id() {
        assert_eq!(
            parse_artifact_ref("meld:UCA-C-1"),
            ArtifactRef::External {
                prefix: "meld".into(),
                id: "UCA-C-1".into(),
            }
        );
    }

    #[test]
    fn sync_local_path_external() {
        let dir = tempfile::tempdir().unwrap();
        // Create a fake external project with rivet.yaml and an artifact
        let ext_dir = dir.path().join("ext-project");
        std::fs::create_dir_all(&ext_dir).unwrap();
        std::fs::write(
            ext_dir.join("rivet.yaml"),
            "project:\n  name: ext\n  version: '0.1.0'\n  schemas: [common, dev]\nsources:\n  - path: artifacts\n    format: generic-yaml\n",
        )
        .unwrap();
        let art_dir = ext_dir.join("artifacts");
        std::fs::create_dir_all(&art_dir).unwrap();
        std::fs::write(
            art_dir.join("reqs.yaml"),
            "artifacts:\n  - id: EXT-001\n    type: requirement\n    title: External req\n",
        )
        .unwrap();

        let ext = crate::model::ExternalProject {
            git: None,
            path: Some(ext_dir.to_str().unwrap().into()),
            git_ref: None,
            prefix: "ext".into(),
        };

        let cache_dir = dir.path().join(".rivet/repos");
        let result = sync_external(&ext, &cache_dir, dir.path());
        assert!(result.is_ok());

        // For path externals, the cache should contain a symlink or copy
        let cached = cache_dir.join("ext");
        assert!(cached.exists());
    }

    #[test]
    fn sync_external_requires_git_or_path() {
        let dir = tempfile::tempdir().unwrap();
        let ext = crate::model::ExternalProject {
            git: None,
            path: None,
            git_ref: None,
            prefix: "bad".into(),
        };
        let cache_dir = dir.path().join(".rivet/repos");
        let result = sync_external(&ext, &cache_dir, dir.path());
        assert!(result.is_err());
    }

    #[test]
    fn ensure_gitignore_adds_entry() {
        let dir = tempfile::tempdir().unwrap();
        // First call should add the entry
        let added = ensure_gitignore(dir.path()).unwrap();
        assert!(added);

        // Second call should detect it already exists
        let added_again = ensure_gitignore(dir.path()).unwrap();
        assert!(!added_again);

        // Verify contents
        let content = std::fs::read_to_string(dir.path().join(".gitignore")).unwrap();
        assert!(content.contains(".rivet/"));
    }

    #[test]
    fn sync_all_multiple_externals() {
        let dir = tempfile::tempdir().unwrap();

        // Create two external projects
        for name in &["alpha", "beta"] {
            let ext_dir = dir.path().join(name);
            std::fs::create_dir_all(&ext_dir).unwrap();
            std::fs::write(
                ext_dir.join("rivet.yaml"),
                format!(
                    "project:\n  name: {name}\n  version: '0.1.0'\n  schemas: [common]\nsources: []\n"
                ),
            )
            .unwrap();
        }

        let mut externals = std::collections::BTreeMap::new();
        externals.insert(
            "alpha".into(),
            crate::model::ExternalProject {
                git: None,
                path: Some(dir.path().join("alpha").to_str().unwrap().into()),
                git_ref: None,
                prefix: "alpha".into(),
            },
        );
        externals.insert(
            "beta".into(),
            crate::model::ExternalProject {
                git: None,
                path: Some(dir.path().join("beta").to_str().unwrap().into()),
                git_ref: None,
                prefix: "beta".into(),
            },
        );

        let results = sync_all(&externals, dir.path()).unwrap();
        assert_eq!(results.len(), 2);
        assert!(dir.path().join(".rivet/repos/alpha").exists());
        assert!(dir.path().join(".rivet/repos/beta").exists());
    }
}
