// rivet-core/src/providers.rs
//
//! Build-system provider layer for discovering external dependencies.
//!
//! Instead of (or in addition to) manually declaring externals in `rivet.yaml`,
//! this module can discover them from build-system manifests such as
//! `MODULE.bazel` (Bazel) or `flake.lock` (Nix).

use std::path::{Path, PathBuf};

use crate::bazel::{Override, parse_module_bazel};
use crate::model::ExternalProject;

/// Discovered external dependency from a build-system manifest.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct DiscoveredExternal {
    /// Dependency name as declared in the manifest.
    pub name: String,
    /// Prefix for cross-repo links (lowercase, hyphens replaced with underscores).
    pub prefix: String,
    /// Git clone URL (from `git_override` or Nix locked input).
    pub git_url: Option<String>,
    /// Git ref — commit SHA from `git_override` or Nix `rev`.
    pub git_ref: Option<String>,
    /// Local filesystem path (from `local_path_override`).
    pub local_path: Option<PathBuf>,
    /// Version string from the manifest.
    pub version: String,
    /// Which provider discovered this (`"bazel"` or `"nix"`).
    pub source: String,
    /// Parser diagnostics collected during discovery.
    pub diagnostics: Vec<String>,
}

/// Discover externals from `MODULE.bazel` in the given directory.
///
/// Returns an empty vec if the file does not exist. Dev dependencies are
/// skipped. Override directives (`git_override`, `local_path_override`) are
/// matched to their corresponding `bazel_dep` entries to enrich the result
/// with git URLs or local paths.
pub fn discover_bazel_externals(project_dir: &Path) -> Result<Vec<DiscoveredExternal>, String> {
    let module_path = project_dir.join("MODULE.bazel");
    if !module_path.exists() {
        return Ok(vec![]);
    }
    let source =
        std::fs::read_to_string(&module_path).map_err(|e| format!("reading MODULE.bazel: {e}"))?;

    discover_bazel_externals_from_str(&source)
}

/// Core logic that works on a source string — used directly in tests.
pub fn discover_bazel_externals_from_str(source: &str) -> Result<Vec<DiscoveredExternal>, String> {
    let module = parse_module_bazel(source);

    let mut externals = Vec::new();

    for dep in &module.deps {
        if dep.dev_dependency {
            continue;
        }

        let mut ext = DiscoveredExternal {
            name: dep.name.clone(),
            prefix: dep.name.to_lowercase().replace('-', "_"),
            git_url: None,
            git_ref: None,
            local_path: None,
            version: dep.version.clone(),
            source: "bazel".into(),
            diagnostics: module.diagnostics.clone(),
        };

        // Enrich from overrides that reference this dep.
        for ovr in &module.overrides {
            match ovr {
                Override::Git {
                    module_name,
                    remote,
                    commit,
                } if module_name == &dep.name => {
                    ext.git_url = Some(remote.clone());
                    ext.git_ref = Some(commit.clone());
                }
                Override::LocalPath { module_name, path } if module_name == &dep.name => {
                    ext.local_path = Some(PathBuf::from(path));
                }
                _ => {}
            }
        }

        externals.push(ext);
    }

    Ok(externals)
}

/// Discover externals from `flake.lock` (Nix) in the given directory.
///
/// Parses the JSON lock file and extracts locked inputs (skipping the
/// synthetic `"root"` node). GitHub-style `owner`/`repo` entries are
/// expanded to full HTTPS URLs.
pub fn discover_nix_externals(project_dir: &Path) -> Result<Vec<DiscoveredExternal>, String> {
    let lock_path = project_dir.join("flake.lock");
    if !lock_path.exists() {
        return Ok(vec![]);
    }
    let content =
        std::fs::read_to_string(&lock_path).map_err(|e| format!("reading flake.lock: {e}"))?;

    discover_nix_externals_from_str(&content)
}

/// Core logic for Nix discovery, operating on a JSON string.
pub fn discover_nix_externals_from_str(content: &str) -> Result<Vec<DiscoveredExternal>, String> {
    let lock: serde_json::Value =
        serde_json::from_str(content).map_err(|e| format!("parsing flake.lock: {e}"))?;

    let mut externals = Vec::new();

    if let Some(nodes) = lock.get("nodes").and_then(|n| n.as_object()) {
        for (name, node) in nodes {
            if name == "root" {
                continue;
            }

            let locked = node.get("locked").and_then(|l| l.as_object());
            if let Some(locked) = locked {
                let rev = locked.get("rev").and_then(|v| v.as_str());

                // Try explicit URL first, then GitHub shorthand.
                let url: Option<String> = locked
                    .get("url")
                    .and_then(|v| v.as_str())
                    .map(|s| s.to_string())
                    .or_else(|| {
                        let owner = locked.get("owner").and_then(|v| v.as_str())?;
                        let repo = locked.get("repo").and_then(|v| v.as_str())?;
                        Some(format!("https://github.com/{owner}/{repo}"))
                    });

                externals.push(DiscoveredExternal {
                    name: name.clone(),
                    prefix: name.to_lowercase().replace('-', "_"),
                    git_url: url,
                    git_ref: rev.map(|s| s.to_string()),
                    local_path: None,
                    version: rev.unwrap_or("unknown").to_string(),
                    source: "nix".into(),
                    diagnostics: vec![],
                });
            }
        }
    }

    Ok(externals)
}

/// Convert discovered externals to `ExternalProject` configs suitable for
/// the externals module.
///
/// Returns `(name, ExternalProject)` pairs. The `name` key matches the
/// dependency name from the manifest and doubles as the map key in the
/// `externals` section of `ProjectConfig`.
pub fn to_external_projects(discovered: &[DiscoveredExternal]) -> Vec<(String, ExternalProject)> {
    discovered
        .iter()
        .map(|d| {
            let ext = ExternalProject {
                git: d.git_url.clone(),
                path: d.local_path.as_ref().map(|p| p.display().to_string()),
                git_ref: d.git_ref.clone(),
                prefix: d.prefix.clone(),
            };
            (d.name.clone(), ext)
        })
        .collect()
}

/// Merge discovered externals with manually configured ones.
///
/// Manual entries (from `rivet.yaml`) take precedence: if a dependency
/// appears in both the manual map and the discovered list, the manual
/// entry wins.
pub fn merge_externals(
    manual: &std::collections::BTreeMap<String, ExternalProject>,
    discovered: &[DiscoveredExternal],
) -> std::collections::BTreeMap<String, ExternalProject> {
    let mut merged = manual.clone();
    for (name, ext) in to_external_projects(discovered) {
        merged.entry(name).or_insert(ext);
    }
    merged
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn discover_bazel_basic() {
        let src = r#"
module(name = "my_project", version = "1.0.0")

bazel_dep(name = "rules_go", version = "0.41.0")
bazel_dep(name = "rules_rust", version = "0.30.0")
"#;
        let result = discover_bazel_externals_from_str(src).unwrap();
        assert_eq!(result.len(), 2);
        assert_eq!(result[0].name, "rules_go");
        assert_eq!(result[0].prefix, "rules_go");
        assert_eq!(result[0].version, "0.41.0");
        assert_eq!(result[0].source, "bazel");
        assert!(result[0].git_url.is_none());
        assert!(result[0].local_path.is_none());
        assert_eq!(result[1].name, "rules_rust");
    }

    #[test]
    fn discover_bazel_with_git_override() {
        let src = r#"
bazel_dep(name = "meld", version = "0.1.0")
git_override(
    module_name = "meld",
    remote = "https://github.com/pulseengine/meld.git",
    commit = "abc123def456",
)
"#;
        let result = discover_bazel_externals_from_str(src).unwrap();
        assert_eq!(result.len(), 1);
        let ext = &result[0];
        assert_eq!(ext.name, "meld");
        assert_eq!(
            ext.git_url.as_deref(),
            Some("https://github.com/pulseengine/meld.git")
        );
        assert_eq!(ext.git_ref.as_deref(), Some("abc123def456"));
        assert!(ext.local_path.is_none());
    }

    #[test]
    fn discover_bazel_with_local_path_override() {
        let src = r#"
bazel_dep(name = "my_lib", version = "0.2.0")
local_path_override(
    module_name = "my_lib",
    path = "../my_lib",
)
"#;
        let result = discover_bazel_externals_from_str(src).unwrap();
        assert_eq!(result.len(), 1);
        let ext = &result[0];
        assert_eq!(ext.name, "my_lib");
        assert!(ext.git_url.is_none());
        assert_eq!(ext.local_path, Some(PathBuf::from("../my_lib")));
    }

    #[test]
    fn discover_bazel_skips_dev_deps() {
        let src = r#"
bazel_dep(name = "prod_dep", version = "1.0.0")
bazel_dep(name = "test_dep", version = "2.0.0", dev_dependency = True)
"#;
        let result = discover_bazel_externals_from_str(src).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].name, "prod_dep");
    }

    #[test]
    fn discover_nix_basic() {
        let json = r#"{
  "nodes": {
    "root": {
      "inputs": { "nixpkgs": "nixpkgs", "meld": "meld" }
    },
    "nixpkgs": {
      "locked": {
        "owner": "NixOS",
        "repo": "nixpkgs",
        "rev": "abc123",
        "type": "github"
      }
    },
    "meld": {
      "locked": {
        "owner": "pulseengine",
        "repo": "meld",
        "rev": "def456",
        "type": "github"
      }
    }
  },
  "version": 7
}"#;
        let result = discover_nix_externals_from_str(json).unwrap();
        assert_eq!(result.len(), 2);

        // Sort for deterministic assertions (JSON object iteration order
        // is not guaranteed by serde_json with default features).
        let mut result = result;
        result.sort_by(|a, b| a.name.cmp(&b.name));

        let meld = &result[0];
        assert_eq!(meld.name, "meld");
        assert_eq!(
            meld.git_url.as_deref(),
            Some("https://github.com/pulseengine/meld")
        );
        assert_eq!(meld.git_ref.as_deref(), Some("def456"));
        assert_eq!(meld.version, "def456");
        assert_eq!(meld.source, "nix");

        let nixpkgs = &result[1];
        assert_eq!(nixpkgs.name, "nixpkgs");
        assert_eq!(
            nixpkgs.git_url.as_deref(),
            Some("https://github.com/NixOS/nixpkgs")
        );
    }

    #[test]
    fn discover_empty_directory_returns_empty() {
        let tmp = tempfile::tempdir().unwrap();
        let bazel_result = discover_bazel_externals(tmp.path()).unwrap();
        assert!(bazel_result.is_empty());
        let nix_result = discover_nix_externals(tmp.path()).unwrap();
        assert!(nix_result.is_empty());
    }

    #[test]
    fn discover_bazel_collects_diagnostics() {
        let src = r#"
load("@rules_go//go:defs.bzl", "go_library")
bazel_dep(name = "foo", version = "1.0")
"#;
        let result = discover_bazel_externals_from_str(src).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].name, "foo");
        // The load() statement should produce a diagnostic.
        assert!(
            !result[0].diagnostics.is_empty(),
            "expected diagnostics from unsupported load() statement"
        );
        assert!(
            result[0]
                .diagnostics
                .iter()
                .any(|d| d.contains("unsupported")),
            "expected 'unsupported' in diagnostics: {:?}",
            result[0].diagnostics
        );
    }

    #[test]
    fn to_external_projects_conversion() {
        let discovered = vec![
            DiscoveredExternal {
                name: "meld".into(),
                prefix: "meld".into(),
                git_url: Some("https://github.com/pulseengine/meld.git".into()),
                git_ref: Some("abc123".into()),
                local_path: None,
                version: "0.1.0".into(),
                source: "bazel".into(),
                diagnostics: vec![],
            },
            DiscoveredExternal {
                name: "my-lib".into(),
                prefix: "my_lib".into(),
                git_url: None,
                git_ref: None,
                local_path: Some(PathBuf::from("../my-lib")),
                version: "0.2.0".into(),
                source: "bazel".into(),
                diagnostics: vec![],
            },
        ];

        let projects = to_external_projects(&discovered);
        assert_eq!(projects.len(), 2);

        let (name0, ext0) = &projects[0];
        assert_eq!(name0, "meld");
        assert_eq!(ext0.prefix, "meld");
        assert_eq!(
            ext0.git.as_deref(),
            Some("https://github.com/pulseengine/meld.git")
        );
        assert_eq!(ext0.git_ref.as_deref(), Some("abc123"));
        assert!(ext0.path.is_none());

        let (name1, ext1) = &projects[1];
        assert_eq!(name1, "my-lib");
        assert_eq!(ext1.prefix, "my_lib");
        assert!(ext1.git.is_none());
        assert_eq!(ext1.path.as_deref(), Some("../my-lib"));
    }

    #[test]
    fn merge_manual_takes_precedence() {
        use std::collections::BTreeMap;

        let mut manual = BTreeMap::new();
        manual.insert(
            "meld".into(),
            ExternalProject {
                git: Some("https://github.com/pulseengine/meld.git".into()),
                path: None,
                git_ref: Some("manual-ref".into()),
                prefix: "meld".into(),
            },
        );

        let discovered = vec![DiscoveredExternal {
            name: "meld".into(),
            prefix: "meld".into(),
            git_url: Some("https://github.com/pulseengine/meld.git".into()),
            git_ref: Some("discovered-ref".into()),
            local_path: None,
            version: "0.1.0".into(),
            source: "bazel".into(),
            diagnostics: vec![],
        }];

        let merged = merge_externals(&manual, &discovered);
        assert_eq!(merged.len(), 1);
        // Manual entry should win.
        assert_eq!(merged["meld"].git_ref.as_deref(), Some("manual-ref"));
    }

    #[test]
    fn merge_adds_discovered_when_not_manual() {
        use std::collections::BTreeMap;

        let manual = BTreeMap::new();
        let discovered = vec![DiscoveredExternal {
            name: "spar".into(),
            prefix: "spar".into(),
            git_url: Some("https://github.com/pulseengine/spar.git".into()),
            git_ref: Some("abc".into()),
            local_path: None,
            version: "0.1.0".into(),
            source: "bazel".into(),
            diagnostics: vec![],
        }];

        let merged = merge_externals(&manual, &discovered);
        assert_eq!(merged.len(), 1);
        assert_eq!(merged["spar"].git_ref.as_deref(), Some("abc"));
    }

    #[test]
    fn discover_nix_with_explicit_url() {
        let json = r#"{
  "nodes": {
    "root": { "inputs": { "custom": "custom" } },
    "custom": {
      "locked": {
        "url": "https://example.com/custom.git",
        "rev": "deadbeef",
        "type": "git"
      }
    }
  },
  "version": 7
}"#;
        let result = discover_nix_externals_from_str(json).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].name, "custom");
        assert_eq!(
            result[0].git_url.as_deref(),
            Some("https://example.com/custom.git")
        );
        assert_eq!(result[0].git_ref.as_deref(), Some("deadbeef"));
    }

    #[test]
    fn discover_bazel_prefix_normalization() {
        let src = r#"
bazel_dep(name = "rules-rust", version = "0.30.0")
"#;
        let result = discover_bazel_externals_from_str(src).unwrap();
        assert_eq!(result.len(), 1);
        // Hyphens should be replaced with underscores in the prefix.
        assert_eq!(result[0].prefix, "rules_rust");
    }
}
