# Cross-Repository Artifact Linking Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable rivet projects to declare external dependencies on other rivet repos, resolve cross-repo artifact links (`prefix:ID`), sync external repos into a local cache, and pin versions with a lockfile.

**Architecture:** New `ExternalsConfig` in `model.rs`. New `externals` module in rivet-core for parsing prefixed IDs, syncing repos via `git clone/fetch`, and managing `rivet.lock`. New CLI subcommands `sync`, `lock`, `baseline`. Cross-repo link resolution integrated into existing `validate` and `links` modules.

**Tech Stack:** Rust, serde (config), `std::process::Command` (git), petgraph (cross-repo graph), clap (CLI)

---

### Task 1: Data model — Add `ExternalsConfig` and `ExternalProject`

**Files:**
- Modify: `rivet-core/src/model.rs`
- Test: `rivet-core/tests/externals_config.rs` (create)

**Step 1: Write the failing test**

```rust
// rivet-core/tests/externals_config.rs
use rivet_core::model::ProjectConfig;

#[test]
fn externals_parsed_from_yaml() {
    let yaml = r#"
project:
  name: test
  version: "0.1.0"
  schemas: [common, dev]
sources: []
externals:
  rivet:
    git: https://github.com/pulseengine/rivet
    ref: main
    prefix: rivet
  meld:
    path: ../meld
    prefix: meld
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    let ext = config.externals.as_ref().unwrap();
    assert_eq!(ext.len(), 2);

    let rivet = &ext["rivet"];
    assert_eq!(rivet.git.as_deref(), Some("https://github.com/pulseengine/rivet"));
    assert_eq!(rivet.git_ref.as_deref(), Some("main"));
    assert_eq!(rivet.prefix, "rivet");

    let meld = &ext["meld"];
    assert_eq!(meld.path.as_deref(), Some("../meld"));
    assert!(meld.git.is_none());
    assert_eq!(meld.prefix, "meld");
}

#[test]
fn no_externals_is_none() {
    let yaml = r#"
project:
  name: test
  version: "0.1.0"
  schemas: [common]
sources: []
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    assert!(config.externals.is_none());
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test externals_config 2>&1`
Expected: FAIL — `externals` field doesn't exist on `ProjectConfig`

**Step 3: Write minimal implementation**

Add to `rivet-core/src/model.rs`:

```rust
/// Configuration for a single external project dependency.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExternalProject {
    /// Git clone URL (mutually exclusive with `path`).
    #[serde(default)]
    pub git: Option<String>,
    /// Local filesystem path (mutually exclusive with `git`).
    #[serde(default)]
    pub path: Option<String>,
    /// Git ref to checkout (branch, tag, or commit SHA).
    #[serde(default, rename = "ref")]
    pub git_ref: Option<String>,
    /// Short prefix used in cross-links (e.g., "rivet" for "rivet:REQ-001").
    pub prefix: String,
}
```

Add to `ProjectConfig`:

```rust
    /// External project dependencies for cross-repo linking.
    #[serde(default)]
    pub externals: Option<BTreeMap<String, ExternalProject>>,
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core --test externals_config 2>&1`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/model.rs rivet-core/tests/externals_config.rs
git commit -m "feat: add ExternalsConfig to data model

Implements: FEAT-033"
```

---

### Task 2: Prefixed ID parser — `externals` module

**Files:**
- Create: `rivet-core/src/externals.rs`
- Modify: `rivet-core/src/lib.rs`

**Step 1: Write the failing tests (inside the new module)**

```rust
// rivet-core/src/externals.rs

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
    todo!()
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
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core externals 2>&1`
Expected: FAIL — `todo!()` panics

**Step 3: Implement `parse_artifact_ref`**

```rust
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
```

Add `pub mod externals;` to `rivet-core/src/lib.rs`.

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core externals 2>&1`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs rivet-core/src/lib.rs
git commit -m "feat: add externals module with prefixed ID parser

Implements: FEAT-033"
```

---

### Task 3: Git sync — `rivet sync` core logic

**Files:**
- Modify: `rivet-core/src/externals.rs`

**Step 1: Write the failing test**

```rust
#[test]
fn sync_local_path_external() {
    let dir = tempfile::tempdir().unwrap();
    // Create a fake external project with rivet.yaml and an artifact
    let ext_dir = dir.path().join("ext-project");
    std::fs::create_dir_all(&ext_dir).unwrap();
    std::fs::write(
        ext_dir.join("rivet.yaml"),
        "project:\n  name: ext\n  version: '0.1.0'\n  schemas: [common, dev]\nsources:\n  - path: artifacts\n    format: generic-yaml\n",
    ).unwrap();
    let art_dir = ext_dir.join("artifacts");
    std::fs::create_dir_all(&art_dir).unwrap();
    std::fs::write(
        art_dir.join("reqs.yaml"),
        "artifacts:\n  - id: EXT-001\n    type: requirement\n    title: External req\n",
    ).unwrap();

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
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core externals::tests::sync_local_path_external 2>&1`
Expected: FAIL — `sync_external` not defined

**Step 3: Implement sync logic**

```rust
use std::path::{Path, PathBuf};
use std::process::Command;
use crate::model::ExternalProject;

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
        let resolved = resolved.canonicalize()
            .map_err(|e| crate::error::Error::Io(format!("resolve path '{}': {e}", local_path)))?;

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
            // Fallback: copy directory for non-unix
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

/// Ensure `.rivet/` is in `.gitignore`. Warns and appends if missing.
pub fn ensure_gitignore(project_dir: &Path) -> Result<bool, crate::error::Error> {
    let gitignore = project_dir.join(".gitignore");
    if gitignore.exists() {
        let content = std::fs::read_to_string(&gitignore)
            .map_err(|e| crate::error::Error::Io(format!("read .gitignore: {e}")))?;
        if content.lines().any(|l| l.trim() == ".rivet/" || l.trim() == ".rivet") {
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
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core externals 2>&1`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs
git commit -m "feat: add sync_external for git and path externals

Implements: FEAT-034"
```

---

### Task 4: Load external artifacts

**Files:**
- Modify: `rivet-core/src/externals.rs`

**Step 1: Write the failing test**

```rust
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
```

**Step 2: Run test to verify it fails**

Expected: FAIL — `load_external_project` not defined

**Step 3: Implement**

```rust
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
    externals: &std::collections::BTreeMap<String, ExternalProject>,
    project_dir: &Path,
) -> Result<Vec<ResolvedExternal>, crate::error::Error> {
    let cache_dir = project_dir.join(".rivet/repos");
    let mut resolved = Vec::new();
    for (_name, ext) in externals {
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
```

**Step 4: Run tests**

Run: `cargo test -p rivet-core externals 2>&1`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs
git commit -m "feat: load external project artifacts from cache

Implements: FEAT-038"
```

---

### Task 5: Cross-repo link validation

**Files:**
- Modify: `rivet-core/src/externals.rs`

**Step 1: Write the failing test**

```rust
#[test]
fn validate_cross_repo_links() {
    use std::collections::{BTreeMap, HashSet};

    // Local artifacts
    let local_ids: HashSet<String> = ["REQ-001", "FEAT-001"].iter().map(|s| s.to_string()).collect();

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
}
```

**Step 2: Run test — FAIL**

**Step 3: Implement**

```rust
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
pub fn validate_refs(
    refs: &[&str],
    local_ids: &std::collections::HashSet<String>,
    external_ids: &std::collections::BTreeMap<String, std::collections::HashSet<String>>,
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
```

**Step 4: Run tests — PASS**

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs
git commit -m "feat: cross-repo link validation with broken ref reporting

Implements: FEAT-038"
```

---

### Task 6: Lockfile — `rivet lock` / `rivet.lock`

**Files:**
- Modify: `rivet-core/src/externals.rs`

**Step 1: Write the failing test**

```rust
#[test]
fn lockfile_roundtrip() {
    let mut pins = BTreeMap::new();
    pins.insert("rivet".into(), LockEntry {
        git: Some("https://github.com/pulseengine/rivet".into()),
        commit: "abc123def456".into(),
        prefix: "rivet".into(),
    });
    pins.insert("meld".into(), LockEntry {
        git: None,
        commit: "789abc012def".into(),
        prefix: "meld".into(),
    });

    let lock = Lockfile { pins };
    let yaml = serde_yaml::to_string(&lock).unwrap();
    let parsed: Lockfile = serde_yaml::from_str(&yaml).unwrap();
    assert_eq!(parsed.pins.len(), 2);
    assert_eq!(parsed.pins["rivet"].commit, "abc123def456");
}
```

**Step 2: Run test — FAIL**

**Step 3: Implement**

```rust
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
        pins.insert(name.clone(), LockEntry {
            git: ext.git.clone(),
            commit,
            prefix: ext.prefix.clone(),
        });
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
```

**Step 4: Run tests — PASS**

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs
git commit -m "feat: lockfile generation and parsing for rivet.lock

Implements: FEAT-035"
```

---

### Task 7: CLI — `rivet sync` and `rivet lock` subcommands

**Files:**
- Modify: `rivet-cli/src/main.rs`

**Step 1: Add CLI variants**

Add to the `Command` enum:

```rust
    /// Sync external project dependencies into .rivet/repos/
    Sync,

    /// Pin external dependencies to exact commits in rivet.lock
    Lock {
        /// Update all pins to latest refs
        #[arg(long)]
        update: bool,
    },
```

**Step 2: Implement handlers**

```rust
fn cmd_sync(cli: &Cli) -> Result<bool> {
    let config = rivet_core::load_project_config(&cli.project.join("rivet.yaml"))?;
    let externals = config.externals.as_ref();
    if externals.is_none() || externals.unwrap().is_empty() {
        eprintln!("No externals declared in rivet.yaml");
        return Ok(true);
    }
    let externals = externals.unwrap();

    // Ensure .rivet/ is gitignored
    let added = rivet_core::externals::ensure_gitignore(&cli.project)?;
    if added {
        eprintln!("Added .rivet/ to .gitignore");
    }

    let results = rivet_core::externals::sync_all(externals, &cli.project)?;
    for (name, path) in &results {
        eprintln!("  Synced {} → {}", name, path.display());
    }
    eprintln!("\n{} externals synced.", results.len());
    Ok(true)
}

fn cmd_lock(cli: &Cli, _update: bool) -> Result<bool> {
    let config = rivet_core::load_project_config(&cli.project.join("rivet.yaml"))?;
    let externals = config.externals.as_ref();
    if externals.is_none() || externals.unwrap().is_empty() {
        eprintln!("No externals declared in rivet.yaml");
        return Ok(true);
    }
    let lock = rivet_core::externals::generate_lockfile(externals.unwrap(), &cli.project)?;
    rivet_core::externals::write_lockfile(&lock, &cli.project)?;
    eprintln!("Wrote rivet.lock with {} pins", lock.pins.len());
    Ok(true)
}
```

Wire up in match statement:

```rust
Command::Sync => cmd_sync(&cli),
Command::Lock { update } => cmd_lock(&cli, *update),
```

**Step 3: Build and test manually**

Run: `cargo build -p rivet-cli 2>&1`
Expected: compiles

**Step 4: Commit**

```bash
git add rivet-cli/src/main.rs
git commit -m "feat: add rivet sync and rivet lock CLI subcommands

Implements: FEAT-034, FEAT-035"
```

---

### Task 8: Integrate cross-repo validation into `rivet validate`

**Files:**
- Modify: `rivet-cli/src/main.rs` (in the validate handler)

**Step 1: Update validate to load externals and check cross-repo links**

In the existing validate command handler, after loading local artifacts and
running local validation, add:

```rust
// Cross-repo link validation
if let Some(ref externals) = config.externals {
    if !externals.is_empty() {
        let resolved = rivet_core::externals::load_all_externals(externals, &cli.project)?;

        // Build external ID sets
        let mut external_ids: std::collections::BTreeMap<String, std::collections::HashSet<String>> =
            std::collections::BTreeMap::new();
        for ext in &resolved {
            let ids: std::collections::HashSet<String> =
                ext.artifacts.iter().map(|a| a.id.clone()).collect();
            external_ids.insert(ext.prefix.clone(), ids);
        }

        // Collect all link targets from local artifacts
        let local_ids: std::collections::HashSet<String> =
            store.all().map(|a| a.id.clone()).collect();
        let all_refs: Vec<&str> = store
            .all()
            .flat_map(|a| a.links.iter().map(|l| l.target.as_str()))
            .collect();

        let broken = rivet_core::externals::validate_refs(&all_refs, &local_ids, &external_ids);
        for b in &broken {
            eprintln!("  broken cross-ref: {} — {:?}", b.reference, b.reason);
        }
    }
}
```

**Step 2: Build and test**

Run: `cargo build -p rivet-cli && cargo test --all 2>&1`
Expected: compiles, all tests pass

**Step 3: Commit**

```bash
git add rivet-cli/src/main.rs
git commit -m "feat: integrate cross-repo link validation into rivet validate

Implements: FEAT-038"
```

---

### Task 9: WASM asset embedding

**Files:**
- Modify: `rivet-cli/src/serve.rs`
- Modify: `rivet-cli/build.rs` (create if needed)

**Step 1: Add conditional include_bytes for WASM assets**

At the top of `serve.rs`, add embedded asset constants:

```rust
// Embedded WASM/JS assets for single-binary distribution.
// These are populated by the build script when assets exist.
#[cfg(feature = "embed-wasm")]
mod embedded_wasm {
    pub const SPAR_JS: &str = include_str!("../assets/wasm/js/spar_wasm.js");
    pub const CORE_WASM: &[u8] = include_bytes!("../assets/wasm/js/spar_wasm.core.wasm");
    pub const CORE2_WASM: &[u8] = include_bytes!("../assets/wasm/js/spar_wasm.core2.wasm");
    pub const CORE3_WASM: &[u8] = include_bytes!("../assets/wasm/js/spar_wasm.core3.wasm");
}
```

**Step 2: Update `wasm_asset` handler to serve from embedded**

Replace the filesystem-based handler with:

```rust
async fn wasm_asset(Path(path): Path<String>) -> impl IntoResponse {
    let content_type = if path.ends_with(".js") {
        "application/javascript"
    } else if path.ends_with(".wasm") {
        "application/wasm"
    } else {
        "application/octet-stream"
    };

    // Try embedded assets first
    #[cfg(feature = "embed-wasm")]
    {
        let bytes: Option<&[u8]> = match path.as_str() {
            "spar_wasm.js" => Some(embedded_wasm::SPAR_JS.as_bytes()),
            "spar_wasm.core.wasm" => Some(embedded_wasm::CORE_WASM),
            "spar_wasm.core2.wasm" => Some(embedded_wasm::CORE2_WASM),
            "spar_wasm.core3.wasm" => Some(embedded_wasm::CORE3_WASM),
            _ => None,
        };
        if let Some(data) = bytes {
            return (
                axum::http::StatusCode::OK,
                [
                    (axum::http::header::CONTENT_TYPE, content_type),
                    (axum::http::header::CACHE_CONTROL, "public, max-age=86400"),
                ],
                data.to_vec(),
            )
                .into_response();
        }
    }

    // Fallback to filesystem (development mode)
    let candidates = [
        // ... existing filesystem candidates ...
    ];
    // ... existing fallback logic ...
}
```

**Step 3: Add feature flag to `rivet-cli/Cargo.toml`**

```toml
[features]
embed-wasm = []
```

**Step 4: Build and test**

Run: `cargo build -p rivet-cli --features embed-wasm 2>&1`
Expected: compiles (if assets exist), or skip this feature flag if they don't

**Step 5: Commit**

```bash
git add rivet-cli/src/serve.rs rivet-cli/Cargo.toml
git commit -m "feat: embed WASM/JS assets for single-binary distribution

Implements: FEAT-037"
```

---

### Task 10: Dogfood artifacts

**Files:**
- Modify: `artifacts/requirements.yaml`
- Modify: `artifacts/features.yaml`
- Modify: `artifacts/decisions.yaml`

**Step 1: Add requirement artifacts**

```yaml
  - id: REQ-020
    type: requirement
    title: Cross-repository artifact linking via prefixed IDs
    status: draft
    description: >
      Rivet projects must be able to declare external dependencies on other
      rivet repositories and reference their artifacts using prefix:ID syntax.
    tags: [cross-repo, traceability]
    fields:
      priority: must
      category: functional

  - id: REQ-021
    type: requirement
    title: Distributed baselining via convention tags
    status: draft
    description: >
      Multiple rivet repositories must be able to form consistent baselines
      using git tags without requiring a central platform repository.
    tags: [cross-repo, baseline]
    fields:
      priority: should
      category: functional

  - id: REQ-022
    type: requirement
    title: Single-binary WASM asset embedding
    status: draft
    description: >
      The rivet binary must optionally embed all WASM and JavaScript assets
      so it can be distributed as a single self-contained executable.
    tags: [packaging, wasm]
    fields:
      priority: should
      category: functional
```

**Step 2: Add design decision artifacts**

```yaml
  - id: DD-014
    type: design-decision
    title: Prefixed IDs over URI-style references
    status: accepted
    description: >
      Cross-repo links use prefix:ID syntax (e.g., rivet:REQ-001) rather than
      full URIs. Simpler to type, more readable in YAML.
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo]
    fields:
      decision: Use prefix:ID syntax with prefix declared in rivet.yaml
      rationale: >
        Simpler and more readable than URIs. Prefix is a local alias
        configured per project, matching sphinx-needs id_prefix pattern.

  - id: DD-015
    type: design-decision
    title: Mesh topology over hub-and-spoke
    status: accepted
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo]
    fields:
      decision: Any repo can link to any other repo directly
      rationale: >
        Avoids central authority requirement. Matches distributed team
        workflows. Transitive resolution handles indirect dependencies.

  - id: DD-016
    type: design-decision
    title: Distributed baselining over centralized manifest
    status: accepted
    links:
      - type: satisfies
        target: REQ-021
    tags: [cross-repo, baseline]
    fields:
      decision: Repos tag themselves with baseline/* tags; consistency verified not enforced
      rationale: >
        No platform repo required. Each repo joins baselines independently.
        Matches OSLC global configuration model where contributions are optional.

  - id: DD-017
    type: design-decision
    title: Transitive dependency resolution
    status: accepted
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo]
    fields:
      decision: Declare direct dependencies only; discover transitively
      rationale: >
        Scales naturally. Avoids redundant declarations. Similar to cargo/npm
        dependency resolution.
```

**Step 3: Add feature artifacts**

```yaml
  - id: FEAT-033
    type: feature
    title: Externals config block and prefix resolution
    status: draft
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo]

  - id: FEAT-034
    type: feature
    title: rivet sync — fetch external repos
    status: draft
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo, cli]

  - id: FEAT-035
    type: feature
    title: rivet lock — pin externals to commits
    status: draft
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo, cli]

  - id: FEAT-036
    type: feature
    title: rivet baseline verify — cross-repo validation
    status: draft
    links:
      - type: satisfies
        target: REQ-021
    tags: [cross-repo, baseline, cli]

  - id: FEAT-037
    type: feature
    title: Embedded WASM/JS assets for single binary
    status: draft
    links:
      - type: satisfies
        target: REQ-022
    tags: [packaging, wasm]

  - id: FEAT-038
    type: feature
    title: Cross-repo link validation in rivet validate
    status: draft
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo, validation]

  - id: FEAT-039
    type: feature
    title: Dashboard external project browsing
    status: draft
    links:
      - type: satisfies
        target: REQ-020
    tags: [cross-repo, dashboard]
```

**Step 4: Validate**

Run: `cargo build --release && ./target/release/rivet validate 2>&1`
Expected: PASS

**Step 5: Commit**

```bash
git add artifacts/requirements.yaml artifacts/features.yaml artifacts/decisions.yaml
git commit -m "feat: dogfood cross-repo linking artifacts (REQ/DD/FEAT)

Implements: FEAT-033
Trace: skip"
```

---

### Task 11: Documentation — reference links and built-in docs update

**Files:**
- Modify: `rivet-cli/src/docs.rs`

**Step 1: Add cross-repo docs topic**

Add a `DocTopic` entry for `"cross-repo"` and a `CROSS_REPO_DOC` constant
covering the externals config, prefix syntax, sync, lock, and baseline
commands.

**Step 2: Add methodology references to schema topics**

Update the `schema/stpa` topic content to append a References section:

```
## References

- Leveson, N.G. & Thomas, J.P. (2018). *STPA Handbook*.
  MIT Partnership for Systems Approaches to Safety and Security (PSASS).
  https://psas.scripts.mit.edu/home/get_file.php?name=STPA_handbook.pdf
- Leveson, N.G. (2011). *Engineering a Safer World*.
  MIT Press. https://mitpress.mit.edu/9780262533690/
```

Similarly for `schema/aspice` and `schema/cybersecurity` with their relevant
standard references.

**Step 3: Build and test**

Run: `cargo build -p rivet-cli && ./target/release/rivet docs cross-repo 2>&1`
Expected: displays the topic

**Step 4: Commit**

```bash
git add rivet-cli/src/docs.rs
git commit -m "docs: add cross-repo linking topic and methodology references

Implements: FEAT-033
Trace: skip"
```

---

### Task 12: Baseline verify (Phase A)

**Files:**
- Modify: `rivet-core/src/externals.rs`
- Modify: `rivet-cli/src/main.rs`

**Step 1: Write failing test for baseline tag discovery**

```rust
#[test]
fn check_baseline_tag_reports_missing() {
    // Simulate a repo without the baseline tag
    let result = BaselineStatus::Missing;
    assert!(!result.is_present());
}

#[test]
fn check_baseline_tag_reports_present() {
    let result = BaselineStatus::Present {
        commit: "abc123".into(),
    };
    assert!(result.is_present());
}
```

**Step 2: Implement baseline types and git tag check**

```rust
#[derive(Debug, Clone)]
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
        .output()
        .map_err(|e| crate::error::Error::Io(format!("git rev-parse: {e}")))?;

    if output.status.success() {
        let commit = String::from_utf8_lossy(&output.stdout).trim().to_string();
        Ok(BaselineStatus::Present { commit })
    } else {
        Ok(BaselineStatus::Missing)
    }
}
```

**Step 3: Add CLI subcommand**

```rust
    /// Manage distributed baselines across repos
    Baseline {
        #[command(subcommand)]
        action: BaselineAction,
    },
```

```rust
#[derive(Debug, Subcommand)]
enum BaselineAction {
    /// Verify baseline consistency across all externals
    Verify {
        /// Baseline name (e.g., "v1.0")
        name: String,
        /// Fail on missing baseline tags
        #[arg(long)]
        strict: bool,
    },
    /// List baselines found across externals
    List,
}
```

**Step 4: Implement verify handler**

The handler checks each external for the `baseline/<name>` tag, syncs at
that tag if present, validates cross-links, and reports status per project.

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs rivet-cli/src/main.rs
git commit -m "feat: distributed baseline verify via convention tags

Implements: FEAT-036"
```

---

Plan complete and saved to `docs/plans/2026-03-10-cross-repo-linking-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?