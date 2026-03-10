// rivet-core/src/externals.rs

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::Command;

use serde::{Deserialize, Serialize};

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
    externals: &BTreeMap<String, ExternalProject>,
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

/// Load artifacts from an external project directory.
///
/// Reads the external project's `rivet.yaml`, discovers its sources,
/// and loads all artifacts. Does NOT validate against schema (the
/// external project validates itself).
pub fn load_external_project(
    project_dir: &Path,
) -> Result<Vec<crate::model::Artifact>, crate::error::Error> {
    let config_path = project_dir.join("rivet.yaml");
    let config = crate::load_project_config(&config_path)?;

    let mut artifacts = Vec::new();
    for source in &config.sources {
        let loaded = crate::load_artifacts(source, project_dir)?;
        artifacts.extend(loaded);
    }
    Ok(artifacts)
}

/// A resolved external with its loaded artifacts.
#[derive(Debug)]
pub struct ResolvedExternal {
    pub prefix: String,
    pub project_dir: PathBuf,
    pub artifacts: Vec<crate::model::Artifact>,
}

/// Load all external projects from cache and return their artifacts.
pub fn load_all_externals(
    externals: &BTreeMap<String, ExternalProject>,
    project_dir: &Path,
) -> Result<Vec<ResolvedExternal>, crate::error::Error> {
    let cache_dir = project_dir.join(".rivet/repos");
    let mut resolved = Vec::new();
    for ext in externals.values() {
        let ext_dir = if let Some(ref local_path) = ext.path {
            let p = if Path::new(local_path).is_relative() {
                project_dir.join(local_path)
            } else {
                PathBuf::from(local_path)
            };
            p.canonicalize().unwrap_or(p)
        } else {
            cache_dir.join(&ext.prefix)
        };
        let artifacts = load_external_project(&ext_dir)?;
        resolved.push(ResolvedExternal {
            prefix: ext.prefix.clone(),
            project_dir: ext_dir,
            artifacts,
        });
    }
    Ok(resolved)
}

/// A broken cross-repo reference.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct BrokenRef {
    pub reference: String,
    pub reason: BrokenRefReason,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BrokenRefReason {
    UnknownPrefix(String),
    NotFoundInExternal { prefix: String, id: String },
    NotFoundLocally(String),
}

/// Validate a list of artifact reference strings against local and external ID sets.
///
/// Returns a list of broken references. An empty return means all refs resolved.
pub fn validate_refs(
    refs: &[&str],
    local_ids: &std::collections::HashSet<String>,
    external_ids: &BTreeMap<String, std::collections::HashSet<String>>,
) -> Vec<BrokenRef> {
    let mut broken = Vec::new();
    for r in refs {
        match parse_artifact_ref(r) {
            ArtifactRef::Local(id) => {
                if !local_ids.contains(&id) {
                    broken.push(BrokenRef {
                        reference: r.to_string(),
                        reason: BrokenRefReason::NotFoundLocally(id),
                    });
                }
            }
            ArtifactRef::External { prefix, id } => {
                if let Some(ids) = external_ids.get(&prefix) {
                    if !ids.contains(&id) {
                        broken.push(BrokenRef {
                            reference: r.to_string(),
                            reason: BrokenRefReason::NotFoundInExternal { prefix, id },
                        });
                    }
                } else {
                    broken.push(BrokenRef {
                        reference: r.to_string(),
                        reason: BrokenRefReason::UnknownPrefix(prefix),
                    });
                }
            }
        }
    }
    broken
}

/// A lockfile pinning externals to exact commits.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lockfile {
    pub pins: BTreeMap<String, LockEntry>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LockEntry {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub git: Option<String>,
    pub commit: String,
    pub prefix: String,
}

/// Read the current commit SHA of a git repository.
pub fn git_head_sha(repo_dir: &Path) -> Result<String, crate::error::Error> {
    let output = Command::new("git")
        .args(["rev-parse", "HEAD"])
        .current_dir(repo_dir)
        .output()
        .map_err(|e| crate::error::Error::Io(format!("git rev-parse: {e}")))?;
    Ok(String::from_utf8_lossy(&output.stdout).trim().to_string())
}

/// Generate a lockfile from current external state.
pub fn generate_lockfile(
    externals: &BTreeMap<String, ExternalProject>,
    project_dir: &Path,
) -> Result<Lockfile, crate::error::Error> {
    let cache_dir = project_dir.join(".rivet/repos");
    let mut pins = BTreeMap::new();
    for (name, ext) in externals {
        let ext_dir = if let Some(ref local_path) = ext.path {
            let p = if Path::new(local_path).is_relative() {
                project_dir.join(local_path)
            } else {
                PathBuf::from(local_path)
            };
            p.canonicalize().unwrap_or(p)
        } else {
            cache_dir.join(&ext.prefix)
        };
        let commit = git_head_sha(&ext_dir)?;
        pins.insert(
            name.clone(),
            LockEntry {
                git: ext.git.clone(),
                commit,
                prefix: ext.prefix.clone(),
            },
        );
    }
    Ok(Lockfile { pins })
}

/// Write lockfile to `rivet.lock`.
pub fn write_lockfile(lock: &Lockfile, project_dir: &Path) -> Result<(), crate::error::Error> {
    let path = project_dir.join("rivet.lock");
    let yaml = serde_yaml::to_string(lock)
        .map_err(|e| crate::error::Error::Schema(format!("serialize lockfile: {e}")))?;
    std::fs::write(&path, yaml)
        .map_err(|e| crate::error::Error::Io(format!("write rivet.lock: {e}")))?;
    Ok(())
}

/// Read lockfile from `rivet.lock`.
pub fn read_lockfile(project_dir: &Path) -> Result<Option<Lockfile>, crate::error::Error> {
    let path = project_dir.join("rivet.lock");
    if !path.exists() {
        return Ok(None);
    }
    let content = std::fs::read_to_string(&path)
        .map_err(|e| crate::error::Error::Io(format!("read rivet.lock: {e}")))?;
    let lock: Lockfile = serde_yaml::from_str(&content)
        .map_err(|e| crate::error::Error::Schema(format!("parse rivet.lock: {e}")))?;
    Ok(Some(lock))
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

/// A backlink from an external artifact to a local (or other external) artifact.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CrossRepoBacklink {
    /// The external project prefix where the link originates.
    pub source_prefix: String,
    /// The artifact ID in the external project that contains the link.
    pub source_id: String,
    /// The target reference (may be local ID or another prefix:ID).
    pub target: String,
}

/// Compute backlinks: scan external artifacts' links for references to local artifacts
/// or to other external projects.
///
/// A "backlink" is a link stored in an external project's artifact that points back
/// to an artifact in the local project (or to another external). This enables
/// bidirectional awareness without requiring both sides to declare the link.
pub fn compute_backlinks(
    resolved: &[ResolvedExternal],
    local_ids: &std::collections::HashSet<String>,
) -> Vec<CrossRepoBacklink> {
    let mut backlinks = Vec::new();
    for ext in resolved {
        for artifact in &ext.artifacts {
            for link in &artifact.links {
                let parsed = parse_artifact_ref(&link.target);
                match parsed {
                    // External artifact links to a local ID in our project
                    ArtifactRef::Local(ref id) if local_ids.contains(id) => {
                        backlinks.push(CrossRepoBacklink {
                            source_prefix: ext.prefix.clone(),
                            source_id: artifact.id.clone(),
                            target: link.target.clone(),
                        });
                    }
                    // External artifact links to another external (cross-external)
                    ArtifactRef::External { .. } => {
                        backlinks.push(CrossRepoBacklink {
                            source_prefix: ext.prefix.clone(),
                            source_id: artifact.id.clone(),
                            target: link.target.clone(),
                        });
                    }
                    _ => {}
                }
            }
        }
    }
    backlinks
}

/// A detected circular dependency chain between repos.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CircularDependency {
    /// The chain of prefixes forming the cycle (e.g., ["a", "b", "c", "a"]).
    pub chain: Vec<String>,
}

/// Detect circular dependencies in the externals graph.
///
/// Reads each external's own `rivet.yaml` to discover their declared externals,
/// then checks for cycles using DFS. Circular deps are warnings (valid in mesh
/// topology) but should be reported so users are aware.
pub fn detect_circular_deps(
    externals: &BTreeMap<String, ExternalProject>,
    project_name: &str,
    project_dir: &Path,
) -> Vec<CircularDependency> {
    let cache_dir = project_dir.join(".rivet/repos");
    let mut graph: BTreeMap<String, Vec<String>> = BTreeMap::new();

    // Add edges from current project
    let deps: Vec<String> = externals.keys().cloned().collect();
    graph.insert(project_name.to_string(), deps);

    // Add edges from each external's own externals
    for ext in externals.values() {
        let ext_dir = if let Some(ref local_path) = ext.path {
            let p = if std::path::Path::new(local_path).is_relative() {
                project_dir.join(local_path)
            } else {
                std::path::PathBuf::from(local_path)
            };
            p.canonicalize().unwrap_or(p)
        } else {
            cache_dir.join(&ext.prefix)
        };
        let config_path = ext_dir.join("rivet.yaml");
        if let Ok(ext_config) = crate::load_project_config(&config_path) {
            if let Some(ref ext_externals) = ext_config.externals {
                let ext_deps: Vec<String> = ext_externals.keys().cloned().collect();
                graph.insert(ext.prefix.clone(), ext_deps);
            }
        }
    }

    // DFS cycle detection
    let mut cycles = Vec::new();
    let mut visited = std::collections::HashSet::new();
    let mut path = Vec::new();

    fn dfs(
        node: &str,
        graph: &BTreeMap<String, Vec<String>>,
        visited: &mut std::collections::HashSet<String>,
        path: &mut Vec<String>,
        cycles: &mut Vec<CircularDependency>,
    ) {
        if let Some(pos) = path.iter().position(|n| n == node) {
            let mut chain: Vec<String> = path[pos..].to_vec();
            chain.push(node.to_string());
            cycles.push(CircularDependency { chain });
            return;
        }
        if visited.contains(node) {
            return;
        }
        path.push(node.to_string());
        if let Some(neighbors) = graph.get(node) {
            for neighbor in neighbors {
                dfs(neighbor, graph, visited, path, cycles);
            }
        }
        path.pop();
        visited.insert(node.to_string());
    }

    for node in graph.keys() {
        dfs(node, &graph, &mut visited, &mut path, &mut cycles);
    }

    cycles
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

    #[test]
    fn validate_cross_repo_links() {
        use std::collections::{BTreeMap, HashSet};

        // Local artifacts
        let local_ids: HashSet<String> =
            ["REQ-001", "FEAT-001"].iter().map(|s| s.to_string()).collect();

        // External artifacts keyed by prefix
        let mut external_ids: BTreeMap<String, HashSet<String>> = BTreeMap::new();
        external_ids.insert(
            "meld".into(),
            ["UCA-C-1", "H-1"].iter().map(|s| s.to_string()).collect(),
        );

        // Valid references
        let refs = vec!["REQ-001", "meld:UCA-C-1", "meld:H-1", "FEAT-001"];
        let broken = validate_refs(&refs, &local_ids, &external_ids);
        assert!(broken.is_empty());

        // Broken references
        let refs2 = vec!["meld:NOPE-999", "unknown:REQ-001", "MISSING-001"];
        let broken2 = validate_refs(&refs2, &local_ids, &external_ids);
        assert_eq!(broken2.len(), 3);

        // Verify specific reasons
        assert_eq!(
            broken2[0].reason,
            BrokenRefReason::NotFoundInExternal {
                prefix: "meld".into(),
                id: "NOPE-999".into(),
            }
        );
        assert_eq!(
            broken2[1].reason,
            BrokenRefReason::UnknownPrefix("unknown".into())
        );
        assert_eq!(
            broken2[2].reason,
            BrokenRefReason::NotFoundLocally("MISSING-001".into())
        );
    }

    #[test]
    fn lockfile_roundtrip() {
        let mut pins = BTreeMap::new();
        pins.insert(
            "rivet".into(),
            LockEntry {
                git: Some("https://github.com/pulseengine/rivet".into()),
                commit: "abc123def456".into(),
                prefix: "rivet".into(),
            },
        );
        pins.insert(
            "meld".into(),
            LockEntry {
                git: None,
                commit: "789abc012def".into(),
                prefix: "meld".into(),
            },
        );

        let lock = Lockfile { pins };
        let yaml = serde_yaml::to_string(&lock).unwrap();
        let parsed: Lockfile = serde_yaml::from_str(&yaml).unwrap();
        assert_eq!(parsed.pins.len(), 2);
        assert_eq!(parsed.pins["rivet"].commit, "abc123def456");
        assert!(parsed.pins["rivet"].git.is_some());
        assert!(parsed.pins["meld"].git.is_none());
    }

    #[test]
    fn lockfile_write_and_read() {
        let dir = tempfile::tempdir().unwrap();
        let mut pins = BTreeMap::new();
        pins.insert(
            "ext".into(),
            LockEntry {
                git: Some("https://example.com/ext.git".into()),
                commit: "deadbeef".into(),
                prefix: "ext".into(),
            },
        );
        let lock = Lockfile { pins };
        write_lockfile(&lock, dir.path()).unwrap();

        let read_back = read_lockfile(dir.path()).unwrap();
        assert!(read_back.is_some());
        let read_back = read_back.unwrap();
        assert_eq!(read_back.pins.len(), 1);
        assert_eq!(read_back.pins["ext"].commit, "deadbeef");
    }

    #[test]
    fn read_lockfile_missing() {
        let dir = tempfile::tempdir().unwrap();
        let result = read_lockfile(dir.path()).unwrap();
        assert!(result.is_none());
    }

    #[test]
    fn load_external_artifacts() {
        let dir = tempfile::tempdir().unwrap();
        let ext_dir = dir.path().join("ext");
        std::fs::create_dir_all(ext_dir.join("artifacts")).unwrap();
        std::fs::write(
            ext_dir.join("rivet.yaml"),
            "project:\n  name: ext\n  version: '0.1.0'\n  schemas: [common, dev]\nsources:\n  - path: artifacts\n    format: generic-yaml\n",
        ).unwrap();
        std::fs::write(
            ext_dir.join("artifacts/reqs.yaml"),
            "artifacts:\n  - id: EXT-001\n    type: requirement\n    title: External req\n  - id: EXT-002\n    type: feature\n    title: External feat\n",
        ).unwrap();

        let artifacts = load_external_project(&ext_dir).unwrap();
        assert_eq!(artifacts.len(), 2);
        assert!(artifacts.iter().any(|a| a.id == "EXT-001"));
        assert!(artifacts.iter().any(|a| a.id == "EXT-002"));
    }

    #[test]
    fn compute_backlinks_finds_reverse_refs() {
        use crate::model::{Artifact, Link};

        let mut local_ids = std::collections::HashSet::new();
        local_ids.insert("REQ-001".to_string());
        local_ids.insert("FEAT-001".to_string());

        let ext_artifact = Artifact {
            id: "EXT-UCA-1".to_string(),
            artifact_type: "uca".to_string(),
            title: "External UCA".to_string(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![
                Link {
                    link_type: "traces-to".to_string(),
                    target: "REQ-001".to_string(), // links back to our local artifact
                },
                Link {
                    link_type: "mitigates".to_string(),
                    target: "EXT-OTHER".to_string(), // links to something in their own project
                },
            ],
            fields: std::collections::BTreeMap::new(),
            source_file: None,
        };

        let resolved = vec![ResolvedExternal {
            prefix: "meld".to_string(),
            project_dir: std::path::PathBuf::from("/tmp/meld"),
            artifacts: vec![ext_artifact],
        }];

        let backlinks = compute_backlinks(&resolved, &local_ids);
        assert_eq!(backlinks.len(), 1);
        assert_eq!(backlinks[0].source_prefix, "meld");
        assert_eq!(backlinks[0].source_id, "EXT-UCA-1");
        assert_eq!(backlinks[0].target, "REQ-001");
    }

    #[test]
    fn compute_backlinks_finds_cross_external_refs() {
        use crate::model::{Artifact, Link};

        let local_ids = std::collections::HashSet::new(); // empty — no local matches

        let ext_artifact = Artifact {
            id: "EXT-UCA-1".to_string(),
            artifact_type: "uca".to_string(),
            title: "External UCA".to_string(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![Link {
                link_type: "traces-to".to_string(),
                target: "other:REQ-001".to_string(), // cross-external ref
            }],
            fields: std::collections::BTreeMap::new(),
            source_file: None,
        };

        let resolved = vec![ResolvedExternal {
            prefix: "meld".to_string(),
            project_dir: std::path::PathBuf::from("/tmp/meld"),
            artifacts: vec![ext_artifact],
        }];

        let backlinks = compute_backlinks(&resolved, &local_ids);
        assert_eq!(backlinks.len(), 1);
        assert_eq!(backlinks[0].source_prefix, "meld");
        assert_eq!(backlinks[0].target, "other:REQ-001");
    }

    #[test]
    fn compute_backlinks_empty_when_no_matches() {
        use crate::model::Artifact;

        let mut local_ids = std::collections::HashSet::new();
        local_ids.insert("REQ-001".to_string());

        let ext_artifact = Artifact {
            id: "EXT-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "External req".to_string(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![], // no links at all
            fields: std::collections::BTreeMap::new(),
            source_file: None,
        };

        let resolved = vec![ResolvedExternal {
            prefix: "meld".to_string(),
            project_dir: std::path::PathBuf::from("/tmp/meld"),
            artifacts: vec![ext_artifact],
        }];

        let backlinks = compute_backlinks(&resolved, &local_ids);
        assert!(backlinks.is_empty());
    }

    #[test]
    fn detect_circular_deps_finds_cycle() {
        // Test with actual temp dirs containing rivet.yaml files that reference each other
        let dir = tempfile::tempdir().unwrap();

        // Create project A (current project) that depends on B
        // Create project B that depends on A (cycle: A -> B -> A)
        let b_dir = dir.path().join("b");
        std::fs::create_dir_all(&b_dir).unwrap();
        std::fs::write(
            b_dir.join("rivet.yaml"),
            "project:\n  name: b\n  version: '0.1.0'\n  schemas: [common]\nsources: []\nexternals:\n  a:\n    path: ../\n    prefix: a\n",
        )
        .unwrap();

        let mut externals = BTreeMap::new();
        externals.insert(
            "b".into(),
            crate::model::ExternalProject {
                git: None,
                path: Some(b_dir.to_str().unwrap().into()),
                git_ref: None,
                prefix: "b".into(),
            },
        );

        let cycles = detect_circular_deps(&externals, "a", dir.path());
        assert!(!cycles.is_empty(), "should detect A->B->A cycle");
        // The cycle should contain both "a" and "b"
        let chain = &cycles[0].chain;
        assert!(chain.contains(&"a".to_string()));
        assert!(chain.contains(&"b".to_string()));
        assert_eq!(chain.first(), chain.last(), "cycle must start and end with same node");
    }

    #[test]
    fn detect_circular_deps_no_cycle() {
        // Project A depends on B, B has no externals => no cycle
        let dir = tempfile::tempdir().unwrap();

        let b_dir = dir.path().join("b");
        std::fs::create_dir_all(&b_dir).unwrap();
        std::fs::write(
            b_dir.join("rivet.yaml"),
            "project:\n  name: b\n  version: '0.1.0'\n  schemas: [common]\nsources: []\n",
        )
        .unwrap();

        let mut externals = BTreeMap::new();
        externals.insert(
            "b".into(),
            crate::model::ExternalProject {
                git: None,
                path: Some(b_dir.to_str().unwrap().into()),
                git_ref: None,
                prefix: "b".into(),
            },
        );

        let cycles = detect_circular_deps(&externals, "a", dir.path());
        assert!(cycles.is_empty(), "no cycle expected");
    }

    #[test]
    fn circular_dependency_struct() {
        let cycle = CircularDependency {
            chain: vec!["a".into(), "b".into(), "c".into(), "a".into()],
        };
        assert_eq!(cycle.chain.len(), 4);
        assert_eq!(cycle.chain.first(), cycle.chain.last());
    }
}
