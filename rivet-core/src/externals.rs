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
        if !prefix.is_empty() && prefix.chars().all(|c| c.is_ascii_lowercase()) && !id.is_empty() {
            return ArtifactRef::External {
                prefix: prefix.to_string(),
                id: id.to_string(),
            };
        }
    }
    ArtifactRef::Local(s.to_string())
}

/// Check whether a git ref looks like a commit SHA (hex string, 7-40 chars).
fn is_sha(git_ref: &str) -> bool {
    let len = git_ref.len();
    (7..=40).contains(&len) && git_ref.chars().all(|c| c.is_ascii_hexdigit())
}

/// Sync a single external project into the cache directory.
///
/// For `path` externals: creates a symlink from `.rivet/repos/<prefix>` to the
/// working-tree directory (resolved and canonicalized), so that uncommitted
/// changes are visible immediately.
///
/// For `git` externals: clones or fetches the repo, checks out the specified ref.
///
/// When `local_only` is true and the external has a `path`, the git source is
/// skipped entirely — the symlink points straight at the working tree.
pub fn sync_external(
    ext: &ExternalProject,
    cache_dir: &Path,
    project_dir: &Path,
    local_only: bool,
) -> Result<PathBuf, crate::error::Error> {
    let dest = cache_dir.join(&ext.prefix);
    std::fs::create_dir_all(cache_dir)
        .map_err(|e| crate::error::Error::Io(format!("create cache dir: {e}")))?;

    // When --local is set and we have a path, always use the local path
    // (skip git entirely).
    let use_path = ext.path.is_some() && (local_only || ext.git.is_none());

    if use_path {
        let local_path = ext.path.as_ref().unwrap();
        // Resolve relative to project dir
        let resolved = if Path::new(local_path).is_relative() {
            project_dir.join(local_path)
        } else {
            PathBuf::from(local_path)
        };

        // Validate the directory exists before canonicalizing
        if !resolved.exists() {
            log::warn!(
                "external '{}': path '{}' does not exist (resolved to '{}'). \
                 Check that the path in rivet.yaml is correct and the directory is accessible.",
                ext.prefix,
                local_path,
                resolved.display()
            );
            return Err(crate::error::Error::Io(format!(
                "external '{}': path '{}' does not exist (resolved to '{}'). \
                 Ensure the directory exists and is accessible on this platform.",
                ext.prefix,
                local_path,
                resolved.display()
            )));
        }

        // Canonicalize to normalize platform-specific separators and resolve
        // symlinks, "..", etc.
        let resolved = resolved.canonicalize().map_err(|e| {
            crate::error::Error::Io(format!(
                "external '{}': failed to canonicalize path '{}' (resolved to '{}'): {e}. \
                 This may indicate a permissions issue or a broken symlink in the path.",
                ext.prefix,
                local_path,
                resolved.display()
            ))
        })?;

        // Remove existing symlink/dir if present
        if dest.exists() || dest.is_symlink() {
            if dest.is_symlink() {
                std::fs::remove_file(&dest).ok();
            } else {
                std::fs::remove_dir_all(&dest).ok();
            }
        }

        // Symlink directly to the working tree so uncommitted changes are
        // picked up immediately.
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
        let dest_str = dest
            .to_str()
            .ok_or_else(|| crate::error::Error::Io("invalid cache path".into()))?
            .to_string();

        // Disable git hooks for all git operations to prevent code execution
        // from malicious repositories (e.g., post-checkout, post-merge hooks).
        // Use `-c` (not `--config`) for compatibility with git < 2.32.
        let no_hooks = ["-c", "core.hooksPath=/dev/null"];

        if dest.join(".git").exists() {
            // Fetch updates — unshallow if this was a shallow clone and we
            // need a specific commit SHA that may not be in the shallow history.
            let mut fetch_args = vec!["fetch", "origin"];
            if is_sha(git_ref) {
                // Unshallow so arbitrary SHAs are reachable.
                let is_shallow = dest.join(".git/shallow").exists();
                if is_shallow {
                    fetch_args.push("--unshallow");
                }
            }
            let output = Command::new("git")
                .args(no_hooks)
                .args(&fetch_args)
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
                .args(no_hooks)
                .args(["checkout", git_ref])
                .current_dir(&dest)
                .output()
                .map_err(|e| crate::error::Error::Io(format!("git checkout: {e}")))?;
            if !output.status.success() {
                // Try as remote branch
                Command::new("git")
                    .args(no_hooks)
                    .args(["checkout", &format!("origin/{git_ref}")])
                    .current_dir(&dest)
                    .output()
                    .ok();
            }
        } else {
            // Clone fresh — use --depth 1 for performance and -b for
            // branch/tag selection.  Avoid --config which is not supported
            // by all git versions; any post-clone configuration is applied
            // as a separate step.
            if is_sha(git_ref) {
                // Cannot use -b with a commit SHA; do a full clone then checkout.
                let output = Command::new("git")
                    .args(no_hooks)
                    .args(["clone", git_url, &dest_str])
                    .output()
                    .map_err(|e| crate::error::Error::Io(format!("git clone: {e}")))?;
                if !output.status.success() {
                    return Err(crate::error::Error::Io(format!(
                        "git clone failed: {}",
                        String::from_utf8_lossy(&output.stderr)
                    )));
                }
                let output = Command::new("git")
                    .args(no_hooks)
                    .args(["checkout", git_ref])
                    .current_dir(&dest)
                    .output()
                    .map_err(|e| crate::error::Error::Io(format!("git checkout: {e}")))?;
                if !output.status.success() {
                    return Err(crate::error::Error::Io(format!(
                        "git checkout failed: {}",
                        String::from_utf8_lossy(&output.stderr)
                    )));
                }
            } else {
                // Branch or tag — use shallow clone with -b for efficiency.
                let output = Command::new("git")
                    .args(no_hooks)
                    .args(["clone", "--depth", "1", "-b", git_ref, git_url, &dest_str])
                    .output()
                    .map_err(|e| crate::error::Error::Io(format!("git clone: {e}")))?;
                if !output.status.success() {
                    // Fallback: the ref might not be directly cloneable with -b
                    // (e.g. it's a short tag that git doesn't resolve). Try a
                    // plain clone + checkout instead.
                    let output = Command::new("git")
                        .args(no_hooks)
                        .args(["clone", "--depth", "1", git_url, &dest_str])
                        .output()
                        .map_err(|e| crate::error::Error::Io(format!("git clone: {e}")))?;
                    if !output.status.success() {
                        return Err(crate::error::Error::Io(format!(
                            "git clone failed: {}",
                            String::from_utf8_lossy(&output.stderr)
                        )));
                    }
                    if git_ref != "main" && git_ref != "master" {
                        let co = Command::new("git")
                            .args(no_hooks)
                            .args(["checkout", git_ref])
                            .current_dir(&dest)
                            .output()
                            .map_err(|e| crate::error::Error::Io(format!("git checkout: {e}")))?;
                        if !co.status.success() {
                            Command::new("git")
                                .args(no_hooks)
                                .args(["checkout", &format!("origin/{git_ref}")])
                                .current_dir(&dest)
                                .output()
                                .ok();
                        }
                    }
                }
            }
        }
        return Ok(dest);
    }

    Err(crate::error::Error::Io(
        "external must have either 'git' or 'path'".into(),
    ))
}

/// Resolve the directory for an external project.
///
/// For `path` externals: resolves relative to project_dir, canonicalizes.
/// For `git` externals: returns `cache_dir/<prefix>`.
pub fn resolve_external_dir(
    ext: &ExternalProject,
    cache_dir: &Path,
    project_dir: &Path,
) -> PathBuf {
    if let Some(ref local_path) = ext.path {
        let p = if Path::new(local_path).is_relative() {
            project_dir.join(local_path)
        } else {
            PathBuf::from(local_path)
        };
        p.canonicalize().unwrap_or(p)
    } else {
        cache_dir.join(&ext.prefix)
    }
}

/// Sync all externals declared in the project config.
///
/// When `local_only` is true, externals that have a `path` will use it
/// directly (symlink to working tree) and skip any git fetch/clone.
pub fn sync_all(
    externals: &BTreeMap<String, ExternalProject>,
    project_dir: &Path,
    local_only: bool,
) -> Result<Vec<(String, PathBuf)>, crate::error::Error> {
    let cache_dir = project_dir.join(".rivet/repos");
    let mut results = Vec::new();
    for (name, ext) in externals {
        let path = sync_external(ext, &cache_dir, project_dir, local_only)?;
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
    if !config_path.exists() {
        return Err(crate::error::Error::Io(format!(
            "external project at {} has no rivet.yaml — \
             expected config at {}",
            project_dir.display(),
            config_path.display()
        )));
    }
    let config = crate::load_project_config(&config_path)?;

    if config.sources.is_empty() {
        log::warn!(
            "external project at {} has rivet.yaml but no sources declared",
            project_dir.display()
        );
    }

    let mut artifacts = Vec::new();
    for source in &config.sources {
        let source_path = project_dir.join(&source.path);
        if !source_path.exists() {
            log::warn!(
                "external project source '{}' does not exist at {} — \
                 check that the path in rivet.yaml matches the repository layout",
                source.path,
                source_path.display()
            );
            continue;
        }
        let loaded = crate::load_artifacts(source, project_dir, &crate::schema::Schema::merge(&[]))?;
        artifacts.extend(loaded);
    }

    if artifacts.is_empty() {
        log::warn!(
            "external project at {} loaded 0 artifacts — \
             check sources in rivet.yaml or run 'rivet validate' in that directory",
            project_dir.display()
        );
    } else {
        log::info!(
            "external project at {} loaded {} artifacts",
            project_dir.display(),
            artifacts.len()
        );
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
        let ext_dir = resolve_external_dir(ext, &cache_dir, project_dir);
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
        let ext_dir = resolve_external_dir(ext, &cache_dir, project_dir);
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

/// A detected version conflict: same repo referenced at different versions.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct VersionConflict {
    /// The git URL or path that conflicts.
    pub repo_identifier: String,
    /// The different refs/versions found, with their source chain.
    pub versions: Vec<ConflictEntry>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ConflictEntry {
    /// The prefix that declares this dependency.
    pub declared_by: String,
    /// The git ref or "local path" for path externals.
    pub version: String,
}

/// Check for version conflicts across all externals (direct + transitive).
///
/// Groups externals by their git URL. If the same URL appears with different
/// refs, reports a conflict. Direct dependencies take priority over transitive.
pub fn detect_version_conflicts(
    externals: &BTreeMap<String, ExternalProject>,
    project_name: &str,
    project_dir: &Path,
) -> Vec<VersionConflict> {
    // Build a map: git_url -> Vec<(declared_by, ref)>
    let mut by_url: BTreeMap<String, Vec<ConflictEntry>> = BTreeMap::new();

    // Add direct dependencies
    for (name, ext) in externals {
        let repo_id = ext
            .git
            .clone()
            .unwrap_or_else(|| ext.path.clone().unwrap_or_else(|| name.clone()));
        let version = ext.git_ref.clone().unwrap_or_else(|| "HEAD".into());
        by_url.entry(repo_id).or_default().push(ConflictEntry {
            declared_by: project_name.to_string(),
            version,
        });
    }

    // Add transitive dependencies (from each external's own rivet.yaml)
    let cache_dir = project_dir.join(".rivet/repos");
    for ext in externals.values() {
        let ext_dir = resolve_external_dir(ext, &cache_dir, project_dir);
        let config_path = ext_dir.join("rivet.yaml");
        if let Ok(ext_config) = crate::load_project_config(&config_path) {
            if let Some(ref ext_externals) = ext_config.externals {
                for (ext_name, ext_ext) in ext_externals {
                    let repo_id = ext_ext.git.clone().unwrap_or_else(|| {
                        ext_ext.path.clone().unwrap_or_else(|| ext_name.clone())
                    });
                    let version = ext_ext.git_ref.clone().unwrap_or_else(|| "HEAD".into());
                    by_url.entry(repo_id).or_default().push(ConflictEntry {
                        declared_by: ext.prefix.clone(),
                        version,
                    });
                }
            }
        }
    }

    // Find conflicts: same repo with different versions
    let mut conflicts = Vec::new();
    for (repo_id, entries) in &by_url {
        if entries.len() < 2 {
            continue;
        }
        // Check if versions actually differ
        let first_version = &entries[0].version;
        let has_conflict = entries.iter().any(|e| &e.version != first_version);
        if has_conflict {
            conflicts.push(VersionConflict {
                repo_identifier: repo_id.clone(),
                versions: entries.clone(),
            });
        }
    }

    conflicts
}

/// Status of a baseline tag in a repository.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum BaselineStatus {
    Present { commit: String },
    Missing,
}

impl BaselineStatus {
    pub fn is_present(&self) -> bool {
        matches!(self, BaselineStatus::Present { .. })
    }
}

/// Check if a git repo has a specific baseline tag.
pub fn check_baseline_tag(
    repo_dir: &Path,
    baseline_name: &str,
) -> Result<BaselineStatus, crate::error::Error> {
    let tag = format!("baseline/{baseline_name}");
    let output = Command::new("git")
        .args(["rev-parse", "--verify", &format!("refs/tags/{tag}")])
        .current_dir(repo_dir)
        .env_remove("GIT_DIR")
        .env_remove("GIT_WORK_TREE")
        .output()
        .map_err(|e| crate::error::Error::Io(format!("git rev-parse: {e}")))?;

    if output.status.success() {
        let commit = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(BaselineStatus::Present { commit })
    } else {
        Ok(BaselineStatus::Missing)
    }
}

/// List all baseline tags found in a repository.
pub fn list_baseline_tags(repo_dir: &Path) -> Result<Vec<String>, crate::error::Error> {
    let output = Command::new("git")
        .args(["tag", "--list", "baseline/*"])
        .current_dir(repo_dir)
        .env_remove("GIT_DIR")
        .env_remove("GIT_WORK_TREE")
        .output()
        .map_err(|e| crate::error::Error::Io(format!("git tag list: {e}")))?;

    let tags = String::from_utf8_lossy(&output.stdout)
        .lines()
        .map(|l| l.trim_start_matches("baseline/").to_string())
        .collect();
    Ok(tags)
}

/// Result of verifying a baseline across repos.
#[derive(Debug)]
pub struct BaselineVerification {
    pub baseline_name: String,
    pub local_status: BaselineStatus,
    pub external_statuses: Vec<(String, BaselineStatus)>,
}

/// Verify a baseline across the local repo and all externals.
///
/// Checks each repo for the `baseline/<name>` tag.
/// Optionally syncs externals at their baseline tag for cross-link validation.
pub fn verify_baseline(
    baseline_name: &str,
    externals: &BTreeMap<String, ExternalProject>,
    project_dir: &Path,
) -> Result<BaselineVerification, crate::error::Error> {
    let cache_dir = project_dir.join(".rivet/repos");

    // Check local repo
    let local_status = check_baseline_tag(project_dir, baseline_name)?;

    // Check each external
    let mut external_statuses = Vec::new();
    for ext in externals.values() {
        let ext_dir = resolve_external_dir(ext, &cache_dir, project_dir);

        let status = if ext_dir.exists() {
            check_baseline_tag(&ext_dir, baseline_name)?
        } else {
            BaselineStatus::Missing
        };
        external_statuses.push((ext.prefix.clone(), status));
    }

    Ok(BaselineVerification {
        baseline_name: baseline_name.to_string(),
        local_status,
        external_statuses,
    })
}

/// Recursively copy a directory (used on non-unix platforms instead of symlinks).
#[cfg(not(unix))]
fn copy_dir_recursive(src: &Path, dst: &Path) -> Result<(), crate::error::Error> {
    std::fs::create_dir_all(dst)
        .map_err(|e| crate::error::Error::Io(format!("create dir: {e}")))?;
    for entry in
        std::fs::read_dir(src).map_err(|e| crate::error::Error::Io(format!("read dir: {e}")))?
    {
        let entry = entry.map_err(|e| crate::error::Error::Io(format!("read dir entry: {e}")))?;
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
        let ext_dir = resolve_external_dir(ext, &cache_dir, project_dir);
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
    use serial_test::serial;

    // rivet: verifies REQ-020
    #[test]
    fn is_sha_detects_hex_strings() {
        // Full 40-char SHA
        assert!(is_sha("abc1234567890def1234567890abcdef12345678"));
        // Short 7-char SHA
        assert!(is_sha("abc1234"));
        // Too short (6 chars)
        assert!(!is_sha("abc123"));
        // Branch name
        assert!(!is_sha("main"));
        // Tag
        assert!(!is_sha("v1.0.0"));
        // Contains non-hex chars
        assert!(!is_sha("abc123g"));
        // 41 chars (too long)
        assert!(!is_sha("abc1234567890def1234567890abcdef123456789"));
    }

    // rivet: verifies REQ-020
    #[test]
    fn local_id_no_colon() {
        assert_eq!(
            parse_artifact_ref("REQ-001"),
            ArtifactRef::Local("REQ-001".into())
        );
    }

    // rivet: verifies REQ-020
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

    // rivet: verifies REQ-020
    #[test]
    fn local_id_with_hyphen_numbers() {
        // IDs like "H-1.2" should not be confused with prefix:id
        assert_eq!(
            parse_artifact_ref("H-1.2"),
            ArtifactRef::Local("H-1.2".into())
        );
    }

    // rivet: verifies REQ-020
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

    // rivet: verifies REQ-020
    #[test]
    #[serial]
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
        let result = sync_external(&ext, &cache_dir, dir.path(), false);
        assert!(result.is_ok());

        // For path externals, the cache should contain a symlink or copy
        let cached = cache_dir.join("ext");
        assert!(cached.exists());
    }

    // rivet: verifies REQ-020
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
        let result = sync_external(&ext, &cache_dir, dir.path(), false);
        assert!(result.is_err());
    }

    // rivet: verifies REQ-020
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

    // rivet: verifies REQ-020
    #[test]
    #[serial]
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

        let results = sync_all(&externals, dir.path(), false).unwrap();
        assert_eq!(results.len(), 2);
        assert!(dir.path().join(".rivet/repos/alpha").exists());
        assert!(dir.path().join(".rivet/repos/beta").exists());
    }

    // rivet: verifies REQ-020
    #[test]
    fn validate_cross_repo_links() {
        use std::collections::{BTreeMap, HashSet};

        // Local artifacts
        let local_ids: HashSet<String> = ["REQ-001", "FEAT-001"]
            .iter()
            .map(|s| s.to_string())
            .collect();

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

    // rivet: verifies REQ-020
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

    // rivet: verifies REQ-020
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

    // rivet: verifies REQ-020
    #[test]
    fn read_lockfile_missing() {
        let dir = tempfile::tempdir().unwrap();
        let result = read_lockfile(dir.path()).unwrap();
        assert!(result.is_none());
    }

    // rivet: verifies REQ-020
    #[test]
    #[serial]
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

    // rivet: verifies REQ-020
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
            provenance: None,
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

    // rivet: verifies REQ-020
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
            provenance: None,
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

    // rivet: verifies REQ-020
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
            provenance: None,
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

    // rivet: verifies REQ-020
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
        assert_eq!(
            chain.first(),
            chain.last(),
            "cycle must start and end with same node"
        );
    }

    // rivet: verifies REQ-020
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

    // rivet: verifies REQ-020
    #[test]
    fn circular_dependency_struct() {
        let cycle = CircularDependency {
            chain: vec!["a".into(), "b".into(), "c".into(), "a".into()],
        };
        assert_eq!(cycle.chain.len(), 4);
        assert_eq!(cycle.chain.first(), cycle.chain.last());
    }

    // rivet: verifies REQ-020
    #[test]
    fn detect_version_conflict_same_url_different_ref() {
        let dir = tempfile::tempdir().unwrap();

        // Create an external project that also depends on "shared" at a different ref
        let ext_dir = dir.path().join("ext-a");
        std::fs::create_dir_all(&ext_dir).unwrap();
        std::fs::write(
            ext_dir.join("rivet.yaml"),
            r#"project:
  name: ext-a
  version: "0.1.0"
  schemas: [common]
sources: []
externals:
  shared:
    git: https://github.com/org/shared
    ref: v2.0
    prefix: shared
"#,
        )
        .unwrap();

        // Direct externals: shared@v1.0 and ext-a (which depends on shared@v2.0)
        let mut externals = BTreeMap::new();
        externals.insert(
            "shared".into(),
            crate::model::ExternalProject {
                git: Some("https://github.com/org/shared".into()),
                path: None,
                git_ref: Some("v1.0".into()),
                prefix: "shared".into(),
            },
        );
        externals.insert(
            "ext-a".into(),
            crate::model::ExternalProject {
                git: None,
                path: Some(ext_dir.to_str().unwrap().into()),
                git_ref: None,
                prefix: "ext-a".into(),
            },
        );

        let conflicts = detect_version_conflicts(&externals, "myproject", dir.path());
        assert_eq!(conflicts.len(), 1);
        assert_eq!(
            conflicts[0].repo_identifier,
            "https://github.com/org/shared"
        );
        assert_eq!(conflicts[0].versions.len(), 2);
    }

    // rivet: verifies REQ-021
    #[test]
    fn baseline_status_is_present() {
        let present = BaselineStatus::Present {
            commit: "abc123".into(),
        };
        let missing = BaselineStatus::Missing;
        assert!(present.is_present());
        assert!(!missing.is_present());
    }

    // rivet: verifies REQ-021
    #[test]
    #[serial]
    fn check_baseline_tag_in_git_repo() {
        let dir = tempfile::tempdir().unwrap();

        // Helper: run git in the temp repo, clearing GIT_DIR / GIT_WORK_TREE
        // so the command targets the freshly-init'd repo rather than an
        // enclosing worktree that may share tags.
        let git = |args: &[&str]| {
            std::process::Command::new("git")
                .args(args)
                .current_dir(dir.path())
                .env_remove("GIT_DIR")
                .env_remove("GIT_WORK_TREE")
                .env_remove("GIT_COMMON_DIR")
                .output()
                .unwrap()
        };

        // Init a git repo with a baseline tag
        git(&["init"]);
        git(&["config", "user.email", "test@test.com"]);
        git(&["config", "user.name", "Test"]);
        git(&["config", "tag.forceSignAnnotated", "false"]);
        git(&["config", "tag.gpgSign", "false"]);
        git(&["config", "commit.gpgSign", "false"]);
        std::fs::write(dir.path().join("file.txt"), "hello").unwrap();
        git(&["add", "."]);
        git(&["commit", "-m", "init"]);
        git(&["tag", "baseline/v1.0"]);

        let status = check_baseline_tag(dir.path(), "v1.0").unwrap();
        assert!(status.is_present());

        let missing = check_baseline_tag(dir.path(), "v2.0").unwrap();
        assert!(!missing.is_present());
    }

    // rivet: verifies REQ-021
    #[test]
    #[serial]
    fn list_baseline_tags_finds_tags() {
        let dir = tempfile::tempdir().unwrap();

        // Helper: run git in the temp repo, clearing inherited env vars.
        let git = |args: &[&str]| {
            std::process::Command::new("git")
                .args(args)
                .current_dir(dir.path())
                .env_remove("GIT_DIR")
                .env_remove("GIT_WORK_TREE")
                .env_remove("GIT_COMMON_DIR")
                .output()
                .unwrap()
        };

        git(&["init"]);
        git(&["config", "user.email", "test@test.com"]);
        git(&["config", "user.name", "Test"]);
        git(&["config", "tag.forceSignAnnotated", "false"]);
        git(&["config", "tag.gpgSign", "false"]);
        git(&["config", "commit.gpgSign", "false"]);
        std::fs::write(dir.path().join("file.txt"), "hello").unwrap();
        git(&["add", "."]);
        git(&["commit", "-m", "init"]);
        git(&["tag", "baseline/v1.0"]);
        git(&["tag", "baseline/v2.0"]);

        let tags = list_baseline_tags(dir.path()).unwrap();
        assert!(tags.contains(&"v1.0".to_string()));
        assert!(tags.contains(&"v2.0".to_string()));
    }

    // rivet: verifies REQ-020
    #[test]
    fn no_conflict_when_same_version() {
        let dir = tempfile::tempdir().unwrap();

        let ext_dir = dir.path().join("ext-a");
        std::fs::create_dir_all(&ext_dir).unwrap();
        std::fs::write(
            ext_dir.join("rivet.yaml"),
            r#"project:
  name: ext-a
  version: "0.1.0"
  schemas: [common]
sources: []
externals:
  shared:
    git: https://github.com/org/shared
    ref: v1.0
    prefix: shared
"#,
        )
        .unwrap();

        let mut externals = BTreeMap::new();
        externals.insert(
            "shared".into(),
            crate::model::ExternalProject {
                git: Some("https://github.com/org/shared".into()),
                path: None,
                git_ref: Some("v1.0".into()),
                prefix: "shared".into(),
            },
        );
        externals.insert(
            "ext-a".into(),
            crate::model::ExternalProject {
                git: None,
                path: Some(ext_dir.to_str().unwrap().into()),
                git_ref: None,
                prefix: "ext-a".into(),
            },
        );

        let conflicts = detect_version_conflicts(&externals, "myproject", dir.path());
        assert!(conflicts.is_empty());
    }

    /// Verify that `sync_external` disables git hooks to prevent code
    /// execution from malicious repositories.  We check the source code
    /// to ensure the `core.hooksPath=/dev/null` config flag is present
    /// for all git commands inside the function.
    // rivet: verifies REQ-020
    #[test]
    fn git_clone_disables_hooks() {
        let source = include_str!("externals.rs");

        // Find the sync_external function body
        let fn_start = source
            .find("fn sync_external(")
            .expect("sync_external function must exist");
        let fn_body = &source[fn_start..];
        // Approximate end: next top-level `pub fn` or `fn ` at column 0
        let fn_end = fn_body[1..]
            .find("\npub fn ")
            .or_else(|| fn_body[1..].find("\nfn "))
            .unwrap_or(fn_body.len());
        let fn_body = &fn_body[..fn_end];

        // Count git Command invocations (excluding test code)
        let git_commands: Vec<_> = fn_body.match_indices("Command::new(\"git\")").collect();

        assert!(
            !git_commands.is_empty(),
            "sync_external must contain git Command invocations"
        );

        // The no_hooks config must be defined and used
        assert!(
            fn_body.contains("core.hooksPath=/dev/null"),
            "sync_external must disable git hooks via core.hooksPath=/dev/null"
        );

        assert!(
            fn_body.contains("no_hooks"),
            "sync_external must use the no_hooks config for all git commands"
        );
    }
}
