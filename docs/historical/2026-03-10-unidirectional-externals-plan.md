# Unidirectional External Repo Imports — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Enable rivet to import artifacts from non-rivet repos (Doorstop, StrictDoc) via format-specific adapters, with readonly cross-linking and upstream coverage analysis.

**Architecture:** Extend `ExternalProject` with `format` and `import-path` fields. When `format` is set to a non-rivet value, `load_external_project` dispatches to the named adapter instead of reading `rivet.yaml`. New adapters (`doorstop`, `sdoc`) implement the existing `Adapter` trait and live in `rivet-core/src/formats/`.

**Tech Stack:** Rust, serde_yaml, existing Adapter trait, no new dependencies.

**Depends on:** The `feat/cross-repo-linking` branch (PR #8) must be merged first. This plan extends `ExternalProject` and `load_external_project` from that branch.

---

### Task 1: Extend ExternalProject model with `format` and `import-path`

**Files:**
- Modify: `rivet-core/src/model.rs` (ExternalProject struct)
- Test: `rivet-core/tests/externals_config.rs`

**Step 1: Write the failing test**

Add to `rivet-core/tests/externals_config.rs`:

```rust
#[test]
fn external_project_readonly_fields() {
    let yaml = r#"
project:
  name: test
  schemas: [common]
sources: []
externals:
  zephyr:
    git: https://github.com/zephyrproject-rtos/reqmgmt
    ref: main
    prefix: zep
    format: sdoc
    import-path: docs/
  ros:
    git: https://github.com/ros-safety/requirements-playground
    ref: main
    prefix: ros
    format: doorstop
    import-path: reqs/
"#;
    let config: rivet_core::model::ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    let externals = config.externals.unwrap();

    let zep = &externals["zephyr"];
    assert_eq!(zep.format.as_deref(), Some("sdoc"));
    assert_eq!(zep.import_path.as_deref(), Some("docs/"));

    let ros = &externals["ros"];
    assert_eq!(ros.format.as_deref(), Some("doorstop"));
    assert_eq!(ros.import_path.as_deref(), Some("reqs/"));

    // Rivet-native external (no format) should default to None
    let yaml2 = r#"
project:
  name: test
  schemas: [common]
sources: []
externals:
  loom:
    git: https://github.com/pulseengine/loom
    ref: main
    prefix: loom
"#;
    let config2: rivet_core::model::ProjectConfig = serde_yaml::from_str(yaml2).unwrap();
    let loom = &config2.externals.unwrap()["loom"];
    assert!(loom.format.is_none());
    assert!(loom.import_path.is_none());
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test externals_config external_project_readonly_fields -- --exact`
Expected: FAIL — `ExternalProject` has no `format` or `import_path` fields.

**Step 3: Add fields to ExternalProject**

In `rivet-core/src/model.rs`, add to `ExternalProject`:

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ExternalProject {
    #[serde(default)]
    pub git: Option<String>,
    #[serde(default)]
    pub path: Option<String>,
    #[serde(default, rename = "ref")]
    pub git_ref: Option<String>,
    pub prefix: String,
    /// Adapter format for non-rivet externals (e.g., "doorstop", "sdoc").
    /// When set, the external is treated as readonly/unidirectional.
    #[serde(default)]
    pub format: Option<String>,
    /// Subdirectory within the external repo to parse (defaults to root).
    #[serde(default, rename = "import-path")]
    pub import_path: Option<String>,
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core --test externals_config external_project_readonly_fields -- --exact`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/model.rs rivet-core/tests/externals_config.rs
git commit -m "feat: add format and import-path fields to ExternalProject

Implements: FEAT-040
Refs: REQ-023"
```

---

### Task 2: Helper method `ExternalProject::is_readonly()`

**Files:**
- Modify: `rivet-core/src/model.rs`
- Test: inline unit test

**Step 1: Write the failing test**

Add a `#[cfg(test)]` module at the bottom of `rivet-core/src/model.rs`:

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn external_project_is_readonly() {
        let rivet_ext = ExternalProject {
            git: Some("https://example.com/repo".into()),
            path: None,
            git_ref: Some("main".into()),
            prefix: "ext".into(),
            format: None,
            import_path: None,
        };
        assert!(!rivet_ext.is_readonly());

        let doorstop_ext = ExternalProject {
            git: Some("https://example.com/repo".into()),
            path: None,
            git_ref: Some("main".into()),
            prefix: "ros".into(),
            format: Some("doorstop".into()),
            import_path: Some("reqs/".into()),
        };
        assert!(doorstop_ext.is_readonly());

        // format: rivet is NOT readonly
        let rivet_format = ExternalProject {
            git: Some("https://example.com/repo".into()),
            path: None,
            git_ref: Some("main".into()),
            prefix: "other".into(),
            format: Some("rivet".into()),
            import_path: None,
        };
        assert!(!rivet_format.is_readonly());
    }
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core model::tests::external_project_is_readonly -- --exact`
Expected: FAIL — `is_readonly()` method doesn't exist.

**Step 3: Implement**

Add to the `ExternalProject` impl block in `model.rs`:

```rust
impl ExternalProject {
    /// Returns true if this external uses a non-rivet format (readonly/unidirectional).
    pub fn is_readonly(&self) -> bool {
        match &self.format {
            None => false,
            Some(f) => f != "rivet",
        }
    }
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core model::tests::external_project_is_readonly -- --exact`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/model.rs
git commit -m "feat: add ExternalProject::is_readonly() helper

Refs: FEAT-040"
```

---

### Task 3: Doorstop adapter — document discovery

**Files:**
- Create: `rivet-core/src/formats/doorstop.rs`
- Modify: `rivet-core/src/formats/mod.rs`
- Test: `rivet-core/tests/doorstop_adapter.rs`

**Step 1: Write the failing test**

Create `rivet-core/tests/doorstop_adapter.rs`:

```rust
use std::collections::BTreeMap;
use std::fs;
use tempfile::TempDir;

/// Create a minimal Doorstop document directory structure.
fn create_doorstop_fixture(dir: &std::path::Path) {
    // System requirements document
    let sys_dir = dir.join("sys");
    fs::create_dir_all(&sys_dir).unwrap();
    fs::write(
        sys_dir.join(".doorstop.yml"),
        "settings:\n  prefix: SYS\n  digits: 3\n  sep: '-'\n",
    )
    .unwrap();
    fs::write(
        sys_dir.join("SYS-001.yml"),
        "active: true\nderived: false\nheader: |\n  System power management\nlevel: '1.1'\nnormative: true\ntext: |\n  The system shall manage power states.\n",
    )
    .unwrap();
    fs::write(
        sys_dir.join("SYS-002.yml"),
        "active: true\nderived: false\nheader: |\n  System logging\nlevel: '1.2'\nnormative: true\ntext: |\n  The system shall log all events.\npriority: high\n",
    )
    .unwrap();

    // Software requirements document (child of SYS)
    let swrs_dir = dir.join("swrs");
    fs::create_dir_all(&swrs_dir).unwrap();
    fs::write(
        swrs_dir.join(".doorstop.yml"),
        "settings:\n  prefix: SWRS\n  digits: 3\n  sep: '-'\n  parent: SYS\n",
    )
    .unwrap();
    fs::write(
        swrs_dir.join("SWRS-001.yml"),
        "active: true\nderived: false\nheader: |\n  Power state transitions\nlevel: '1.1'\nlinks:\n- SYS-001: null\ntext: |\n  The software shall handle power state transitions.\n",
    )
    .unwrap();
    // Inactive requirement
    fs::write(
        swrs_dir.join("SWRS-002.yml"),
        "active: false\nheader: |\n  Deprecated feature\nlevel: '1.2'\ntext: |\n  This is no longer needed.\n",
    )
    .unwrap();
}

#[test]
fn doorstop_discover_documents() {
    let tmp = TempDir::new().unwrap();
    create_doorstop_fixture(tmp.path());

    let docs = rivet_core::formats::doorstop::discover_documents(tmp.path()).unwrap();
    assert_eq!(docs.len(), 2);

    let sys = docs.iter().find(|d| d.prefix == "SYS").unwrap();
    assert_eq!(sys.digits, 3);
    assert_eq!(sys.sep, "-");
    assert!(sys.parent.is_none());

    let swrs = docs.iter().find(|d| d.prefix == "SWRS").unwrap();
    assert_eq!(swrs.parent.as_deref(), Some("SYS"));
}

#[test]
fn doorstop_import_artifacts() {
    let tmp = TempDir::new().unwrap();
    create_doorstop_fixture(tmp.path());

    let adapter = rivet_core::formats::doorstop::DoorstopAdapter::new();
    let source = rivet_core::adapter::AdapterSource::Directory(tmp.path().to_path_buf());
    let config = rivet_core::adapter::AdapterConfig::default();
    let artifacts = rivet_core::adapter::Adapter::import(&adapter, &source, &config).unwrap();

    // 4 items total: SYS-001, SYS-002, SWRS-001, SWRS-002
    assert_eq!(artifacts.len(), 4);

    // Check SYS-001
    let sys1 = artifacts.iter().find(|a| a.id == "SYS-001").unwrap();
    assert_eq!(sys1.title, "System power management");
    assert_eq!(sys1.artifact_type, "sys");
    assert_eq!(sys1.status.as_deref(), Some("active"));

    // Check SWRS-001 has link to SYS-001
    let swrs1 = artifacts.iter().find(|a| a.id == "SWRS-001").unwrap();
    assert_eq!(swrs1.links.len(), 1);
    assert_eq!(swrs1.links[0].target, "SYS-001");
    assert_eq!(swrs1.links[0].link_type, "traces-to");

    // Check inactive item
    let swrs2 = artifacts.iter().find(|a| a.id == "SWRS-002").unwrap();
    assert_eq!(swrs2.status.as_deref(), Some("inactive"));

    // Check custom field preserved
    let sys2 = artifacts.iter().find(|a| a.id == "SYS-002").unwrap();
    assert_eq!(
        sys2.fields.get("priority"),
        Some(&serde_yaml::Value::String("high".into()))
    );
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test doorstop_adapter -- --exact`
Expected: FAIL — `rivet_core::formats::doorstop` doesn't exist.

**Step 3: Create the Doorstop adapter**

Add `pub mod doorstop;` to `rivet-core/src/formats/mod.rs`.

Create `rivet-core/src/formats/doorstop.rs`:

```rust
//! Doorstop adapter — imports artifacts from Doorstop YAML repositories.
//!
//! Doorstop stores one YAML file per requirement, organized in document
//! directories identified by `.doorstop.yml` config files.
//!
//! Reference: https://doorstop.readthedocs.io/en/latest/reference/item.html

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use serde::Deserialize;

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::{Artifact, Link};

// ── Public adapter ───────────────────────────────────────────────────────

pub struct DoorstopAdapter {
    supported: Vec<String>,
}

impl DoorstopAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec!["doorstop-requirement".into()],
        }
    }
}

impl Default for DoorstopAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for DoorstopAdapter {
    fn id(&self) -> &str {
        "doorstop"
    }

    fn name(&self) -> &str {
        "Doorstop YAML"
    }

    fn supported_types(&self) -> &[String] {
        &self.supported
    }

    fn import(
        &self,
        source: &AdapterSource,
        _config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        match source {
            AdapterSource::Directory(dir) => import_doorstop_directory(dir),
            AdapterSource::Path(path) => {
                // Single .yml file — parse as a Doorstop item.
                if path.is_dir() {
                    import_doorstop_directory(path)
                } else {
                    Err(Error::Adapter(
                        "Doorstop adapter requires a directory, not a single file".into(),
                    ))
                }
            }
            AdapterSource::Bytes(_) => Err(Error::Adapter(
                "Doorstop adapter does not support byte input".into(),
            )),
        }
    }

    fn export(&self, _artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        Err(Error::Adapter("Doorstop export is not supported".into()))
    }
}

// ── Document discovery ──────────────────────────────────────────────────

/// A discovered Doorstop document (directory with `.doorstop.yml`).
#[derive(Debug, Clone)]
pub struct DoorstopDocument {
    pub prefix: String,
    pub digits: u32,
    pub sep: String,
    pub parent: Option<String>,
    pub dir: PathBuf,
}

/// Settings block from `.doorstop.yml`.
#[derive(Debug, Deserialize)]
struct DoorstopConfig {
    settings: DoorstopSettings,
}

#[derive(Debug, Deserialize)]
struct DoorstopSettings {
    prefix: String,
    #[serde(default = "default_digits")]
    digits: u32,
    #[serde(default = "default_sep")]
    sep: String,
    #[serde(default)]
    parent: Option<String>,
}

fn default_digits() -> u32 {
    3
}
fn default_sep() -> String {
    "-".into()
}

/// Recursively discover all Doorstop documents under a root directory.
pub fn discover_documents(root: &Path) -> Result<Vec<DoorstopDocument>, Error> {
    let mut docs = Vec::new();
    discover_documents_recursive(root, &mut docs)?;
    Ok(docs)
}

fn discover_documents_recursive(
    dir: &Path,
    docs: &mut Vec<DoorstopDocument>,
) -> Result<(), Error> {
    let config_path = dir.join(".doorstop.yml");
    if config_path.exists() {
        let content = std::fs::read_to_string(&config_path)
            .map_err(|e| Error::Io(format!("{}: {}", config_path.display(), e)))?;
        let config: DoorstopConfig = serde_yaml::from_str(&content)
            .map_err(|e| Error::Adapter(format!("{}: {}", config_path.display(), e)))?;
        docs.push(DoorstopDocument {
            prefix: config.settings.prefix,
            digits: config.settings.digits,
            sep: config.settings.sep,
            parent: config.settings.parent,
            dir: dir.to_path_buf(),
        });
    }

    // Recurse into subdirectories.
    let entries = std::fs::read_dir(dir)
        .map_err(|e| Error::Io(format!("{}: {}", dir.display(), e)))?;
    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path.is_dir() {
            discover_documents_recursive(&path, docs)?;
        }
    }
    Ok(())
}

// ── Item parsing ────────────────────────────────────────────────────────

/// Raw Doorstop item as deserialized from YAML.
#[derive(Debug, Deserialize)]
struct DoorstopItem {
    #[serde(default = "default_true")]
    active: bool,
    #[serde(default)]
    derived: bool,
    #[serde(default)]
    header: Option<String>,
    #[serde(default)]
    level: Option<serde_yaml::Value>,
    #[serde(default)]
    links: Vec<serde_yaml::Value>,
    #[serde(default)]
    normative: Option<bool>,
    #[serde(default)]
    text: Option<String>,
    #[serde(default)]
    reviewed: Option<serde_yaml::Value>,
    #[serde(rename = "ref", default)]
    ext_ref: Option<String>,
    #[serde(default)]
    references: Option<serde_yaml::Value>,
    // All remaining keys → custom fields.
    #[serde(flatten)]
    extra: BTreeMap<String, serde_yaml::Value>,
}

fn default_true() -> bool {
    true
}

/// Parse a Doorstop link entry.
///
/// Links can be:
/// - `SYS-001` (bare string)
/// - `SYS-001: null` (map with null fingerprint)
/// - `SYS-001: abc123...` (map with fingerprint hash)
fn parse_doorstop_link(value: &serde_yaml::Value) -> Option<String> {
    match value {
        serde_yaml::Value::String(s) => Some(s.clone()),
        serde_yaml::Value::Mapping(map) => {
            // Single-entry map: {UID: fingerprint_or_null}
            map.keys().next().and_then(|k| k.as_str().map(String::from))
        }
        _ => None,
    }
}

/// Import all Doorstop items from a directory tree.
fn import_doorstop_directory(root: &Path) -> Result<Vec<Artifact>, Error> {
    let documents = discover_documents(root)?;
    let mut artifacts = Vec::new();

    for doc in &documents {
        let entries = std::fs::read_dir(&doc.dir)
            .map_err(|e| Error::Io(format!("{}: {}", doc.dir.display(), e)))?;

        for entry in entries {
            let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
            let path = entry.path();
            let ext = path.extension().and_then(|e| e.to_str());
            if ext != Some("yml") && ext != Some("yaml") {
                continue;
            }
            // Skip .doorstop.yml itself.
            if path.file_name().is_some_and(|n| n == ".doorstop.yml") {
                continue;
            }

            let uid = path
                .file_stem()
                .unwrap_or_default()
                .to_string_lossy()
                .into_owned();

            let content = std::fs::read_to_string(&path)
                .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;

            match serde_yaml::from_str::<DoorstopItem>(&content) {
                Ok(item) => {
                    artifacts.push(doorstop_item_to_artifact(
                        uid,
                        &item,
                        &doc.prefix,
                        &path,
                    ));
                }
                Err(e) => {
                    log::warn!("skipping {}: {}", path.display(), e);
                }
            }
        }
    }

    Ok(artifacts)
}

/// Convert a parsed Doorstop item to a rivet Artifact.
fn doorstop_item_to_artifact(
    uid: String,
    item: &DoorstopItem,
    doc_prefix: &str,
    source: &Path,
) -> Artifact {
    let title = item
        .header
        .as_deref()
        .unwrap_or("")
        .trim()
        .to_string();

    let description = item.text.as_ref().map(|t| t.trim().to_string());

    let status = if item.active {
        Some("active".into())
    } else {
        Some("inactive".into())
    };

    // Artifact type = document prefix lowercase.
    let artifact_type = doc_prefix.to_lowercase();

    // Parse links (strip fingerprint hashes).
    let links: Vec<Link> = item
        .links
        .iter()
        .filter_map(parse_doorstop_link)
        .map(|target| Link {
            link_type: "traces-to".into(),
            target,
        })
        .collect();

    // Build fields from known + custom attributes.
    let mut fields = BTreeMap::new();
    if item.derived {
        fields.insert("derived".into(), serde_yaml::Value::Bool(true));
    }
    if let Some(ref level) = item.level {
        fields.insert("level".into(), level.clone());
    }
    // Merge extra (custom) fields, excluding known fields already handled.
    for (key, value) in &item.extra {
        fields.insert(key.clone(), value.clone());
    }

    Artifact {
        id: uid,
        artifact_type,
        title,
        description,
        status,
        tags: vec!["doorstop".into()],
        links,
        fields,
        source_file: Some(source.to_path_buf()),
    }
}
```

**Step 4: Run tests to verify they pass**

Run: `cargo test -p rivet-core --test doorstop_adapter`
Expected: PASS (both `doorstop_discover_documents` and `doorstop_import_artifacts`)

**Step 5: Commit**

```bash
git add rivet-core/src/formats/doorstop.rs rivet-core/src/formats/mod.rs rivet-core/tests/doorstop_adapter.rs
git commit -m "feat: add Doorstop YAML adapter with document discovery and item parsing

Implements: FEAT-041
Refs: REQ-024"
```

---

### Task 4: Wire Doorstop adapter into `load_artifacts`

**Files:**
- Modify: `rivet-core/src/lib.rs:62-80` (load_artifacts match)

**Step 1: Write the failing test**

Add to `rivet-core/tests/doorstop_adapter.rs`:

```rust
#[test]
fn doorstop_via_load_artifacts() {
    let tmp = TempDir::new().unwrap();
    create_doorstop_fixture(tmp.path());

    let source = rivet_core::model::SourceConfig {
        path: tmp.path().to_string_lossy().into_owned(),
        format: "doorstop".into(),
        config: BTreeMap::new(),
    };
    let artifacts = rivet_core::load_artifacts(&source, std::path::Path::new(".")).unwrap();
    assert_eq!(artifacts.len(), 4);
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test doorstop_adapter doorstop_via_load_artifacts -- --exact`
Expected: FAIL — `unknown format: doorstop`

**Step 3: Add doorstop to the format match**

In `rivet-core/src/lib.rs`, add a new arm to the `match source.format.as_str()` block:

```rust
        "doorstop" => {
            let adapter = formats::doorstop::DoorstopAdapter::new();
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core --test doorstop_adapter doorstop_via_load_artifacts -- --exact`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/lib.rs
git commit -m "feat: wire Doorstop adapter into load_artifacts format dispatch

Refs: FEAT-041"
```

---

### Task 5: Update `load_external_project` for readonly externals

**Files:**
- Modify: `rivet-core/src/externals.rs` (load_external_project, load_all_externals)

**Step 1: Write the failing test**

Add to `rivet-core/tests/doorstop_adapter.rs`:

```rust
#[test]
fn doorstop_as_readonly_external() {
    let tmp = TempDir::new().unwrap();

    // Create a fake "external repo" with Doorstop layout
    let ext_dir = tmp.path().join("ext-repo");
    let reqs_dir = ext_dir.join("reqs");
    std::fs::create_dir_all(&reqs_dir).unwrap();
    create_doorstop_fixture(&reqs_dir);

    // Load it as a readonly external with import-path
    let ext = rivet_core::model::ExternalProject {
        git: None,
        path: Some(ext_dir.to_string_lossy().into_owned()),
        git_ref: None,
        prefix: "ros".into(),
        format: Some("doorstop".into()),
        import_path: Some("reqs/".into()),
    };

    let artifacts =
        rivet_core::externals::load_external_project_with_format(&ext_dir, &ext).unwrap();
    assert_eq!(artifacts.len(), 4);
    assert!(artifacts.iter().any(|a| a.id == "SYS-001"));
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test doorstop_adapter doorstop_as_readonly_external -- --exact`
Expected: FAIL — `load_external_project_with_format` doesn't exist.

**Step 3: Implement format-aware loading**

In `rivet-core/src/externals.rs`, add:

```rust
/// Load artifacts from an external project, dispatching by format.
///
/// - `format: None` or `format: Some("rivet")` → reads `rivet.yaml` (existing behavior)
/// - `format: Some("doorstop")` → runs Doorstop adapter on import-path
/// - `format: Some("sdoc")` → runs StrictDoc adapter on import-path (future)
pub fn load_external_project_with_format(
    project_dir: &Path,
    ext: &ExternalProject,
) -> Result<Vec<crate::model::Artifact>, crate::error::Error> {
    let import_dir = match &ext.import_path {
        Some(p) => project_dir.join(p),
        None => project_dir.to_path_buf(),
    };

    match ext.format.as_deref() {
        None | Some("rivet") => load_external_project(project_dir),
        Some("doorstop") => {
            let adapter = crate::formats::doorstop::DoorstopAdapter::new();
            let source = crate::adapter::AdapterSource::Directory(import_dir);
            let config = crate::adapter::AdapterConfig::default();
            crate::adapter::Adapter::import(&adapter, &source, &config)
        }
        Some(other) => Err(crate::error::Error::Adapter(
            format!("unsupported external format: {other}")
        )),
    }
}
```

Then update `load_all_externals` to use `load_external_project_with_format`:

```rust
pub fn load_all_externals(
    externals: &BTreeMap<String, ExternalProject>,
    project_dir: &Path,
) -> Result<Vec<ResolvedExternal>, crate::error::Error> {
    let cache_dir = project_dir.join(".rivet/repos");
    let mut resolved = Vec::new();
    for ext in externals.values() {
        let ext_dir = resolve_external_dir(ext, &cache_dir, project_dir);
        let artifacts = load_external_project_with_format(&ext_dir, ext)?;
        resolved.push(ResolvedExternal {
            prefix: ext.prefix.clone(),
            project_dir: ext_dir,
            artifacts,
        });
    }
    Ok(resolved)
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core --test doorstop_adapter doorstop_as_readonly_external -- --exact`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs
git commit -m "feat: format-aware external project loading (doorstop dispatch)

Implements: FEAT-040
Refs: REQ-023"
```

---

### Task 6: StrictDoc SDoc parser — core state machine

**Files:**
- Create: `rivet-core/src/formats/sdoc.rs`
- Modify: `rivet-core/src/formats/mod.rs`
- Test: `rivet-core/tests/sdoc_adapter.rs`

**Step 1: Write the failing test**

Create `rivet-core/tests/sdoc_adapter.rs`:

```rust
use rivet_core::formats::sdoc;

const MINIMAL_SDOC: &str = r#"
[DOCUMENT]
TITLE: Test Requirements

[REQUIREMENT]
UID: REQ-001
TITLE: First requirement
STATEMENT: The system shall do X.

[REQUIREMENT]
UID: REQ-002
TITLE: Second requirement
STATUS: Approved
STATEMENT: >>>
The system shall do Y.
This is a multiline statement.
<<<
RELATIONS:
- TYPE: Parent
  VALUE: REQ-001
"#;

#[test]
fn sdoc_parse_basic() {
    let artifacts = sdoc::parse_sdoc(MINIMAL_SDOC, None).unwrap();
    assert_eq!(artifacts.len(), 2);

    let r1 = artifacts.iter().find(|a| a.id == "REQ-001").unwrap();
    assert_eq!(r1.title, "First requirement");
    assert_eq!(r1.description.as_deref(), Some("The system shall do X."));
    assert!(r1.links.is_empty());

    let r2 = artifacts.iter().find(|a| a.id == "REQ-002").unwrap();
    assert_eq!(r2.title, "Second requirement");
    assert_eq!(r2.status.as_deref(), Some("Approved"));
    assert!(r2
        .description
        .as_deref()
        .unwrap()
        .contains("multiline statement"));
    assert_eq!(r2.links.len(), 1);
    assert_eq!(r2.links[0].target, "REQ-001");
    assert_eq!(r2.links[0].link_type, "traces-to");
}

#[test]
fn sdoc_parse_with_sections() {
    let sdoc_text = r#"
[DOCUMENT]
TITLE: Zephyr SRS

[[SECTION]]
TITLE: Threads

[REQUIREMENT]
UID: ZEP-SRS-1-1
TITLE: Creating threads
STATEMENT: The RTOS shall provide an interface to create a thread.
RELATIONS:
- TYPE: Parent
  VALUE: ZEP-SYRS-15

[[/SECTION]]

[[SECTION]]
TITLE: Semaphores

[REQUIREMENT]
UID: ZEP-SRS-2-1
TITLE: Semaphore init
STATEMENT: The RTOS shall provide semaphore initialization.

[[/SECTION]]
"#;
    let artifacts = sdoc::parse_sdoc(sdoc_text, None).unwrap();
    assert_eq!(artifacts.len(), 2);

    let t = artifacts.iter().find(|a| a.id == "ZEP-SRS-1-1").unwrap();
    assert_eq!(t.fields.get("section").and_then(|v| v.as_str()), Some("Threads"));
    assert_eq!(t.links.len(), 1);
    assert_eq!(t.links[0].target, "ZEP-SYRS-15");

    let s = artifacts.iter().find(|a| a.id == "ZEP-SRS-2-1").unwrap();
    assert_eq!(s.fields.get("section").and_then(|v| v.as_str()), Some("Semaphores"));
}

#[test]
fn sdoc_parse_with_roles() {
    let sdoc_text = r#"
[DOCUMENT]
TITLE: Test

[REQUIREMENT]
UID: IMPL-001
TITLE: Implementation
STATEMENT: Implements the parent.
RELATIONS:
- TYPE: Parent
  VALUE: REQ-001
  ROLE: Implements
- TYPE: Parent
  VALUE: REQ-002
  ROLE: Verifies
"#;
    let artifacts = sdoc::parse_sdoc(sdoc_text, None).unwrap();
    assert_eq!(artifacts.len(), 1);
    let a = &artifacts[0];
    assert_eq!(a.links.len(), 2);
    assert_eq!(a.links[0].link_type, "implements");
    assert_eq!(a.links[0].target, "REQ-001");
    assert_eq!(a.links[1].link_type, "verifies");
    assert_eq!(a.links[1].target, "REQ-002");
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test sdoc_adapter`
Expected: FAIL — `rivet_core::formats::sdoc` doesn't exist.

**Step 3: Create the SDoc parser**

Add `pub mod sdoc;` to `rivet-core/src/formats/mod.rs`.

Create `rivet-core/src/formats/sdoc.rs`:

```rust
//! StrictDoc SDoc adapter — parses `.sdoc` files into rivet artifacts.
//!
//! SDoc is a custom DSL used by StrictDoc for requirements management.
//! This parser handles the core syntax: `[DOCUMENT]`, `[[SECTION]]`,
//! `[REQUIREMENT]`, field parsing, `>>>` / `<<<` multiline delimiters,
//! and `RELATIONS` blocks.
//!
//! Reference: https://strictdoc.readthedocs.io

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::{Artifact, Link};

// ── Public adapter ───────────────────────────────────────────────────────

pub struct SDocAdapter {
    supported: Vec<String>,
}

impl SDocAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec!["sdoc-requirement".into()],
        }
    }
}

impl Default for SDocAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for SDocAdapter {
    fn id(&self) -> &str {
        "sdoc"
    }

    fn name(&self) -> &str {
        "StrictDoc SDoc"
    }

    fn supported_types(&self) -> &[String] {
        &self.supported
    }

    fn import(
        &self,
        source: &AdapterSource,
        _config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        match source {
            AdapterSource::Path(path) => import_sdoc_file(path),
            AdapterSource::Directory(dir) => import_sdoc_directory(dir),
            AdapterSource::Bytes(bytes) => {
                let content = std::str::from_utf8(bytes)
                    .map_err(|e| Error::Adapter(format!("invalid UTF-8: {e}")))?;
                parse_sdoc(content, None)
            }
        }
    }

    fn export(&self, _artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        Err(Error::Adapter("SDoc export is not supported".into()))
    }
}

// ── Parser ──────────────────────────────────────────────────────────────

/// Parser state machine for SDoc format.
#[derive(Debug, PartialEq)]
enum State {
    /// Outside any block.
    Top,
    /// Inside a [DOCUMENT] header.
    Document,
    /// Inside a [REQUIREMENT] block, collecting fields.
    Requirement,
    /// Collecting a multiline field value (between >>> and <<<).
    Multiline,
    /// Inside a RELATIONS: block, collecting relation entries.
    Relations,
}

/// A partially-parsed requirement being built up.
#[derive(Debug, Default)]
struct ReqBuilder {
    uid: Option<String>,
    title: Option<String>,
    statement: Option<String>,
    status: Option<String>,
    tags: Vec<String>,
    fields: BTreeMap<String, serde_yaml::Value>,
    links: Vec<Link>,
    section: Option<String>,
}

/// A partially-parsed relation entry.
#[derive(Debug, Default)]
struct RelationBuilder {
    rel_type: Option<String>,
    value: Option<String>,
    role: Option<String>,
}

/// Parse SDoc content into rivet artifacts.
pub fn parse_sdoc(content: &str, source: Option<&Path>) -> Result<Vec<Artifact>, Error> {
    let mut artifacts = Vec::new();
    let mut state = State::Top;
    let mut current_req = ReqBuilder::default();
    let mut current_section: Option<String> = None;
    let mut multiline_field: Option<String> = None;
    let mut multiline_buf = String::new();
    let mut current_relation = RelationBuilder::default();

    for line in content.lines() {
        let trimmed = line.trim();

        // Handle multiline field terminator.
        if state == State::Multiline {
            if trimmed == "<<<" {
                let value = multiline_buf.trim().to_string();
                if let Some(field) = multiline_field.take() {
                    match field.as_str() {
                        "STATEMENT" => current_req.statement = Some(value),
                        "TITLE" => current_req.title = Some(value),
                        "RATIONALE" | "COMMENT" => {
                            current_req.fields.insert(
                                field.to_lowercase(),
                                serde_yaml::Value::String(value),
                            );
                        }
                        other => {
                            current_req.fields.insert(
                                other.to_lowercase(),
                                serde_yaml::Value::String(value),
                            );
                        }
                    }
                }
                multiline_buf.clear();
                state = State::Requirement;
                continue;
            }
            if !multiline_buf.is_empty() {
                multiline_buf.push('\n');
            }
            multiline_buf.push_str(line);
            continue;
        }

        // Block markers.
        if trimmed == "[DOCUMENT]" {
            state = State::Document;
            continue;
        }
        if trimmed == "[REQUIREMENT]" || trimmed == "[COMPOSITE_REQUIREMENT]" {
            // Flush previous requirement if any.
            if current_req.uid.is_some() {
                artifacts.push(build_artifact(&current_req, source));
            }
            current_req = ReqBuilder::default();
            current_req.section = current_section.clone();
            state = State::Requirement;
            continue;
        }
        if trimmed.starts_with("[[SECTION]]") {
            // Flush previous requirement if any.
            if current_req.uid.is_some() {
                artifacts.push(build_artifact(&current_req, source));
                current_req = ReqBuilder::default();
            }
            state = State::Top;
            continue;
        }
        if trimmed == "[[/SECTION]]" {
            if current_req.uid.is_some() {
                artifacts.push(build_artifact(&current_req, source));
                current_req = ReqBuilder::default();
            }
            current_section = None;
            state = State::Top;
            continue;
        }
        if trimmed == "[TEXT]" || trimmed == "[/TEXT]" {
            continue;
        }

        // Field parsing within blocks.
        match state {
            State::Document => {
                // We only care about document-level TITLE for section context.
                // Skip other document fields.
            }
            State::Top => {
                // Look for TITLE after [[SECTION]].
                if let Some(value) = trimmed.strip_prefix("TITLE:") {
                    current_section = Some(value.trim().to_string());
                }
            }
            State::Requirement => {
                // Check for RELATIONS block start.
                if trimmed == "RELATIONS:" {
                    state = State::Relations;
                    current_relation = RelationBuilder::default();
                    continue;
                }

                // Parse KEY: VALUE fields.
                if let Some((key, value)) = trimmed.split_once(':') {
                    let key = key.trim();
                    let value = value.trim();

                    // Check for multiline start.
                    if value == ">>>" {
                        multiline_field = Some(key.to_string());
                        multiline_buf.clear();
                        state = State::Multiline;
                        continue;
                    }

                    match key {
                        "UID" => current_req.uid = Some(value.to_string()),
                        "TITLE" => current_req.title = Some(value.to_string()),
                        "STATEMENT" => current_req.statement = Some(value.to_string()),
                        "STATUS" => current_req.status = Some(value.to_string()),
                        "TAGS" => {
                            current_req.tags = value
                                .split(',')
                                .map(|t| t.trim().to_string())
                                .filter(|t| !t.is_empty())
                                .collect();
                        }
                        _ => {
                            current_req.fields.insert(
                                key.to_lowercase(),
                                serde_yaml::Value::String(value.to_string()),
                            );
                        }
                    }
                }
            }
            State::Relations => {
                // Relation entries look like:
                // - TYPE: Parent
                //   VALUE: REQ-001
                //   ROLE: Implements
                if trimmed.starts_with("- TYPE:") {
                    // Flush previous relation if any.
                    if current_relation.value.is_some() {
                        flush_relation(&current_relation, &mut current_req.links);
                    }
                    current_relation = RelationBuilder::default();
                    current_relation.rel_type =
                        Some(trimmed.strip_prefix("- TYPE:").unwrap().trim().to_string());
                } else if let Some(val) = trimmed.strip_prefix("VALUE:") {
                    current_relation.value = Some(val.trim().to_string());
                } else if let Some(role) = trimmed.strip_prefix("ROLE:") {
                    current_relation.role = Some(role.trim().to_string());
                } else if trimmed.is_empty()
                    || trimmed.starts_with('[')
                    || (!trimmed.starts_with('-') && !trimmed.starts_with(' '))
                {
                    // End of RELATIONS block.
                    if current_relation.value.is_some() {
                        flush_relation(&current_relation, &mut current_req.links);
                        current_relation = RelationBuilder::default();
                    }
                    // Re-process this line in requirement state.
                    state = State::Requirement;
                    // Check if it's a new block marker.
                    if trimmed == "[REQUIREMENT]" || trimmed == "[COMPOSITE_REQUIREMENT]" {
                        if current_req.uid.is_some() {
                            artifacts.push(build_artifact(&current_req, source));
                        }
                        current_req = ReqBuilder::default();
                        current_req.section = current_section.clone();
                    } else if trimmed.starts_with("[[SECTION]]") {
                        if current_req.uid.is_some() {
                            artifacts.push(build_artifact(&current_req, source));
                            current_req = ReqBuilder::default();
                        }
                        state = State::Top;
                    } else if trimmed == "[[/SECTION]]" {
                        if current_req.uid.is_some() {
                            artifacts.push(build_artifact(&current_req, source));
                            current_req = ReqBuilder::default();
                        }
                        current_section = None;
                        state = State::Top;
                    }
                }
            }
            State::Multiline => unreachable!(), // handled above
        }
    }

    // Flush final relation and requirement.
    if state == State::Relations && current_relation.value.is_some() {
        flush_relation(&current_relation, &mut current_req.links);
    }
    if current_req.uid.is_some() {
        artifacts.push(build_artifact(&current_req, source));
    }

    Ok(artifacts)
}

fn flush_relation(rel: &RelationBuilder, links: &mut Vec<Link>) {
    if let Some(ref target) = rel.value {
        let link_type = match &rel.role {
            Some(role) => role.to_lowercase(),
            None => match rel.rel_type.as_deref() {
                Some("Parent") | Some("Child") => "traces-to".into(),
                Some(other) => other.to_lowercase(),
                None => "traces-to".into(),
            },
        };
        links.push(Link {
            link_type,
            target: target.clone(),
        });
    }
}

fn build_artifact(req: &ReqBuilder, source: Option<&Path>) -> Artifact {
    let mut fields = req.fields.clone();
    if let Some(ref section) = req.section {
        fields.insert(
            "section".into(),
            serde_yaml::Value::String(section.clone()),
        );
    }

    Artifact {
        id: req.uid.clone().unwrap_or_default(),
        artifact_type: "sdoc-requirement".into(),
        title: req.title.clone().unwrap_or_default(),
        description: req.statement.clone(),
        status: req.status.clone(),
        tags: if req.tags.is_empty() {
            vec!["sdoc".into()]
        } else {
            req.tags.clone()
        },
        links: req.links.clone(),
        fields,
        source_file: source.map(|p| p.to_path_buf()),
    }
}

// ── File / directory import ─────────────────────────────────────────────

fn import_sdoc_file(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
    parse_sdoc(&content, Some(path))
}

fn import_sdoc_directory(dir: &Path) -> Result<Vec<Artifact>, Error> {
    let mut artifacts = Vec::new();
    collect_sdoc_files(dir, &mut artifacts)?;
    Ok(artifacts)
}

fn collect_sdoc_files(dir: &Path, artifacts: &mut Vec<Artifact>) -> Result<(), Error> {
    let entries =
        std::fs::read_dir(dir).map_err(|e| Error::Io(format!("{}: {}", dir.display(), e)))?;

    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path.extension().is_some_and(|ext| ext == "sdoc") {
            match import_sdoc_file(&path) {
                Ok(arts) => artifacts.extend(arts),
                Err(e) => log::warn!("skipping {}: {}", path.display(), e),
            }
        } else if path.is_dir() {
            collect_sdoc_files(&path, artifacts)?;
        }
    }
    Ok(())
}
```

**Step 4: Run tests to verify they pass**

Run: `cargo test -p rivet-core --test sdoc_adapter`
Expected: PASS (all 3 tests)

**Step 5: Commit**

```bash
git add rivet-core/src/formats/sdoc.rs rivet-core/src/formats/mod.rs rivet-core/tests/sdoc_adapter.rs
git commit -m "feat: add StrictDoc SDoc adapter with state machine parser

Implements: FEAT-042
Refs: REQ-025"
```

---

### Task 7: Wire SDoc adapter into `load_artifacts` and `load_external_project_with_format`

**Files:**
- Modify: `rivet-core/src/lib.rs` (load_artifacts match)
- Modify: `rivet-core/src/externals.rs` (load_external_project_with_format)

**Step 1: Write the failing test**

Add to `rivet-core/tests/sdoc_adapter.rs`:

```rust
use tempfile::TempDir;

#[test]
fn sdoc_via_load_artifacts() {
    let tmp = TempDir::new().unwrap();
    let sdoc_path = tmp.path().join("reqs.sdoc");
    std::fs::write(&sdoc_path, MINIMAL_SDOC).unwrap();

    let source = rivet_core::model::SourceConfig {
        path: sdoc_path.to_string_lossy().into_owned(),
        format: "sdoc".into(),
        config: std::collections::BTreeMap::new(),
    };
    let artifacts = rivet_core::load_artifacts(&source, std::path::Path::new(".")).unwrap();
    assert_eq!(artifacts.len(), 2);
}

#[test]
fn sdoc_directory_import() {
    let tmp = TempDir::new().unwrap();
    let docs_dir = tmp.path().join("docs");
    std::fs::create_dir_all(&docs_dir).unwrap();
    std::fs::write(docs_dir.join("sys.sdoc"), MINIMAL_SDOC).unwrap();
    std::fs::write(
        docs_dir.join("threads.sdoc"),
        "[DOCUMENT]\nTITLE: Threads\n\n[REQUIREMENT]\nUID: THR-001\nTITLE: Thread create\nSTATEMENT: Shall create threads.\n",
    )
    .unwrap();

    let source = rivet_core::model::SourceConfig {
        path: docs_dir.to_string_lossy().into_owned(),
        format: "sdoc".into(),
        config: std::collections::BTreeMap::new(),
    };
    let artifacts = rivet_core::load_artifacts(&source, std::path::Path::new(".")).unwrap();
    assert_eq!(artifacts.len(), 3); // 2 from MINIMAL_SDOC + 1 from threads.sdoc
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test sdoc_adapter sdoc_via_load_artifacts -- --exact`
Expected: FAIL — `unknown format: sdoc`

**Step 3: Add sdoc to both dispatch points**

In `rivet-core/src/lib.rs`, add to the `match`:

```rust
        "sdoc" => {
            let adapter = formats::sdoc::SDocAdapter::new();
            adapter::Adapter::import(&adapter, &source_input, &adapter_config)
        }
```

In `rivet-core/src/externals.rs`, add to `load_external_project_with_format`:

```rust
        Some("sdoc") => {
            let adapter = crate::formats::sdoc::SDocAdapter::new();
            let source = crate::adapter::AdapterSource::Directory(import_dir);
            let config = crate::adapter::AdapterConfig::default();
            crate::adapter::Adapter::import(&adapter, &source, &config)
        }
```

**Step 4: Run tests to verify they pass**

Run: `cargo test -p rivet-core --test sdoc_adapter`
Expected: PASS (all 5 tests)

**Step 5: Commit**

```bash
git add rivet-core/src/lib.rs rivet-core/src/externals.rs rivet-core/tests/sdoc_adapter.rs
git commit -m "feat: wire SDoc adapter into load_artifacts and external loading

Refs: FEAT-042, REQ-025"
```

---

### Task 8: Upstream coverage analysis (reverse index)

**Files:**
- Modify: `rivet-core/src/externals.rs` (add `upstream_coverage` function)
- Test: `rivet-core/tests/doorstop_adapter.rs`

**Step 1: Write the failing test**

Add to `rivet-core/tests/doorstop_adapter.rs`:

```rust
#[test]
fn upstream_coverage_analysis() {
    use rivet_core::model::{Artifact, Link};

    // Local artifacts that link to external ones.
    let local = vec![
        Artifact {
            id: "MY-REQ-001".into(),
            artifact_type: "requirement".into(),
            title: "Our requirement".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![Link {
                link_type: "traces-to".into(),
                target: "ros:SYS-001".into(),
            }],
            fields: BTreeMap::new(),
            source_file: None,
        },
        Artifact {
            id: "MY-REQ-002".into(),
            artifact_type: "requirement".into(),
            title: "Another requirement".into(),
            description: None,
            status: Some("approved".into()),
            tags: vec![],
            links: vec![
                Link {
                    link_type: "traces-to".into(),
                    target: "ros:SYS-001".into(),
                },
                Link {
                    link_type: "traces-to".into(),
                    target: "ros:SYS-002".into(),
                },
            ],
            fields: BTreeMap::new(),
            source_file: None,
        },
    ];

    // External artifacts (from Doorstop).
    let external_ids: Vec<String> = vec!["SYS-001".into(), "SYS-002".into(), "SYS-003".into()];

    let coverage =
        rivet_core::externals::upstream_coverage("ros", &external_ids, &local);

    // SYS-001 is covered by 2 local artifacts.
    assert_eq!(coverage.covered.get("SYS-001").unwrap().len(), 2);
    // SYS-002 is covered by 1 local artifact.
    assert_eq!(coverage.covered.get("SYS-002").unwrap().len(), 1);
    // SYS-003 is not covered.
    assert!(coverage.uncovered.contains(&"SYS-003".to_string()));
    // Coverage ratio.
    assert_eq!(coverage.total, 3);
    assert_eq!(coverage.covered_count, 2);
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test -p rivet-core --test doorstop_adapter upstream_coverage_analysis -- --exact`
Expected: FAIL — `upstream_coverage` doesn't exist.

**Step 3: Implement upstream coverage**

In `rivet-core/src/externals.rs`, add:

```rust
/// Result of upstream coverage analysis.
#[derive(Debug)]
pub struct UpstreamCoverage {
    /// External artifact ID → list of local artifact IDs linking to it.
    pub covered: BTreeMap<String, Vec<String>>,
    /// External artifact IDs with no local artifacts linking to them.
    pub uncovered: Vec<String>,
    /// Total number of external artifacts.
    pub total: usize,
    /// Number of external artifacts covered by at least one local artifact.
    pub covered_count: usize,
}

/// Compute upstream coverage: which external artifacts are linked-to by local artifacts.
pub fn upstream_coverage(
    prefix: &str,
    external_ids: &[String],
    local_artifacts: &[crate::model::Artifact],
) -> UpstreamCoverage {
    let target_prefix = format!("{prefix}:");
    let mut covered: BTreeMap<String, Vec<String>> = BTreeMap::new();

    for local in local_artifacts {
        for link in &local.links {
            if let Some(ext_id) = link.target.strip_prefix(&target_prefix) {
                covered
                    .entry(ext_id.to_string())
                    .or_default()
                    .push(local.id.clone());
            }
        }
    }

    let uncovered: Vec<String> = external_ids
        .iter()
        .filter(|id| !covered.contains_key(id.as_str()))
        .cloned()
        .collect();

    let covered_count = covered.len();
    let total = external_ids.len();

    UpstreamCoverage {
        covered,
        uncovered,
        total,
        covered_count,
    }
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test -p rivet-core --test doorstop_adapter upstream_coverage_analysis -- --exact`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/externals.rs rivet-core/tests/doorstop_adapter.rs
git commit -m "feat: upstream coverage analysis for readonly externals

Implements: FEAT-043
Refs: DD-020"
```

---

### Task 9: Add dogfooding artifacts

**Files:**
- Modify: `artifacts/requirements.yaml`
- Modify: `artifacts/decisions.yaml`
- Modify: `artifacts/features.yaml`

**Step 1: Add requirements REQ-023..025**

Append to `artifacts/requirements.yaml`:

```yaml
- id: REQ-023
  type: requirement
  title: Unidirectional external repo imports with native format parsing
  status: approved
  links:
    - type: derives-from
      target: REQ-020

- id: REQ-024
  type: requirement
  title: Doorstop YAML format adapter
  status: approved
  links:
    - type: derives-from
      target: REQ-023

- id: REQ-025
  type: requirement
  title: StrictDoc SDoc format adapter
  status: approved
  links:
    - type: derives-from
      target: REQ-023
```

**Step 2: Add design decisions DD-018..020**

Append to `artifacts/decisions.yaml`:

```yaml
- id: DD-018
  type: design-decision
  title: Native format parsing over pre-conversion
  status: approved
  description: >
    Rivet parses Doorstop, SDoc, etc. directly rather than requiring
    repos to export to rivet YAML. Consuming repos as-is is the point.
  links:
    - type: implements
      target: REQ-023

- id: DD-019
  type: design-decision
  title: Explicit format declaration over auto-detect
  status: approved
  description: >
    format: doorstop in config is predictable and debuggable.
    Auto-detect is convenient but fragile for edge cases.
  links:
    - type: implements
      target: REQ-023

- id: DD-020
  type: design-decision
  title: Reverse index for upstream coverage analysis
  status: approved
  description: >
    Readonly externals support "which of our artifacts link to this
    external artifact" queries, enabling upstream coverage reporting.
  links:
    - type: implements
      target: REQ-023
```

**Step 3: Add features FEAT-040..044**

Append to `artifacts/features.yaml`:

```yaml
- id: FEAT-040
  type: feature
  title: format and import-path fields on externals config
  status: draft
  links:
    - type: implements
      target: REQ-023
    - type: implements
      target: DD-019

- id: FEAT-041
  type: feature
  title: Doorstop adapter — .doorstop.yml discovery and YAML item parsing
  status: draft
  links:
    - type: implements
      target: REQ-024

- id: FEAT-042
  type: feature
  title: StrictDoc SDoc adapter — state machine parser with grammar support
  status: draft
  links:
    - type: implements
      target: REQ-025

- id: FEAT-043
  type: feature
  title: Upstream coverage analysis via reverse index
  status: draft
  links:
    - type: implements
      target: DD-020

- id: FEAT-044
  type: feature
  title: sphinx-needs JSON adapter (future)
  status: draft
  links:
    - type: implements
      target: REQ-023
```

**Step 4: Validate**

Run: `cargo run --bin rivet -- validate`
Expected: PASS — no broken links, no schema violations.

**Step 5: Commit**

```bash
git add artifacts/requirements.yaml artifacts/decisions.yaml artifacts/features.yaml
git commit -m "docs: add dogfooding artifacts for unidirectional externals

Refs: REQ-023, REQ-024, REQ-025, DD-018, DD-019, DD-020, FEAT-040..044"
```

---

### Task 10: Clippy, fmt, full test suite

**Step 1: Format**

Run: `cargo fmt --all`

**Step 2: Clippy**

Run: `cargo clippy --all-targets -- -D warnings`
Fix any warnings.

**Step 3: Full test suite**

Run: `cargo test --workspace`
Expected: All tests pass.

**Step 4: Commit any fixes**

```bash
git add -A
git commit -m "style: fmt and clippy fixes for unidirectional externals"
```
