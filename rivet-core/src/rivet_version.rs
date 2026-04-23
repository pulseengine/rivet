//! `.rivet/.rivet-version` — the scaffold pin file.
//!
//! Written once by `rivet init --agents --bootstrap` and updated by
//! `rivet upgrade`. Records:
//! - which rivet version ran the scaffold
//! - which template version produced which project file
//! - the content SHA at scaffold time (so upgrade can detect user edits)
//!
//! Example:
//!
//! ```yaml
//! rivet-cli: "0.5.0"
//! template-version: 1
//! scaffolded-at: "2026-04-23T16:00:00Z"
//! scaffolded-from:
//!   templates-version: 1
//!   schemas:
//!     dev: "0.5.0"
//! files:
//!   - path: .rivet/pipelines/dev.yaml
//!     from-template: templates/pipelines/structural.tmpl@v1
//!     scaffolded-sha: "abc123..."
//! ```

use std::collections::BTreeMap;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::Error;

/// Top-level shape of `.rivet/.rivet-version`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct RivetVersion {
    /// The `rivet-cli` version that wrote this pin.
    pub rivet_cli: String,
    /// The shipped-templates version when scaffold happened.
    pub template_version: u32,
    /// ISO 8601 UTC timestamp of scaffold.
    pub scaffolded_at: String,
    /// Per-scaffolded-file provenance — used by `rivet upgrade` to show
    /// which files can be regenerated without clobbering user edits.
    #[serde(default)]
    pub files: Vec<FileRecord>,
    /// Per-schema version pins at scaffold time. Used to detect schema
    /// changes that invalidate cached pipeline configs.
    #[serde(default)]
    pub scaffolded_from: ScaffoldedFrom,
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct ScaffoldedFrom {
    pub templates_version: u32,
    #[serde(default)]
    pub schemas: BTreeMap<String, String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct FileRecord {
    /// Path relative to project root.
    pub path: String,
    /// Template the file was generated from, with version (`@v1`).
    pub from_template: String,
    /// SHA-256 of the file contents at scaffold time.
    pub scaffolded_sha: String,
}

impl RivetVersion {
    /// Parse a YAML pin file.
    pub fn from_yaml(yaml: &str) -> Result<Self, Error> {
        serde_yaml::from_str(yaml).map_err(|e| Error::Schema(format!(".rivet-version: {e}")))
    }

    /// Serialise to YAML for writing.
    pub fn to_yaml(&self) -> Result<String, Error> {
        serde_yaml::to_string(self)
            .map_err(|e| Error::Schema(format!(".rivet-version to_yaml: {e}")))
    }

    /// Load from disk. Returns `Ok(None)` if the file does not exist
    /// (a fresh project) and `Err(..)` on parse error.
    pub fn load(rivet_dir: &Path) -> Result<Option<Self>, Error> {
        let path = rivet_dir.join(".rivet-version");
        if !path.exists() {
            return Ok(None);
        }
        let content = std::fs::read_to_string(&path)
            .map_err(|e| Error::Io(format!("reading {}: {e}", path.display())))?;
        Self::from_yaml(&content).map(Some)
    }

    /// Look up the recorded provenance for a project file. None if the
    /// file was not scaffolded by rivet (or if the pin file is absent).
    pub fn record_for(&self, relative_path: &str) -> Option<&FileRecord> {
        self.files.iter().find(|r| r.path == relative_path)
    }
}

/// Compute the canonical SHA-256 of a byte slice as a lowercase hex string.
/// Used to fingerprint scaffolded files so upgrade can detect user edits.
pub fn content_sha256(bytes: &[u8]) -> String {
    use sha2::{Digest, Sha256};
    let mut hasher = Sha256::new();
    hasher.update(bytes);
    format!("{:x}", hasher.finalize())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_minimal() {
        let yaml = r#"
rivet-cli: "0.5.0"
template-version: 1
scaffolded-at: "2026-04-23T16:00:00Z"
"#;
        let v = RivetVersion::from_yaml(yaml).unwrap();
        assert_eq!(v.rivet_cli, "0.5.0");
        assert_eq!(v.template_version, 1);
        assert!(v.files.is_empty());
    }

    #[test]
    fn parse_full() {
        let yaml = r#"
rivet-cli: "0.5.0"
template-version: 1
scaffolded-at: "2026-04-23T16:00:00Z"
scaffolded-from:
  templates-version: 1
  schemas:
    dev: "0.5.0"
    stpa: "0.5.0"
files:
  - path: .rivet/pipelines/dev.yaml
    from-template: templates/pipelines/structural.tmpl@v1
    scaffolded-sha: abc123
"#;
        let v = RivetVersion::from_yaml(yaml).unwrap();
        assert_eq!(v.scaffolded_from.schemas.len(), 2);
        assert_eq!(v.files.len(), 1);
        assert_eq!(v.files[0].scaffolded_sha, "abc123");
    }

    #[test]
    fn roundtrip_through_yaml() {
        let original = RivetVersion {
            rivet_cli: "0.5.0".into(),
            template_version: 1,
            scaffolded_at: "2026-04-23T16:00:00Z".into(),
            files: vec![FileRecord {
                path: ".rivet/pipelines/dev.yaml".into(),
                from_template: "templates/pipelines/structural.tmpl@v1".into(),
                scaffolded_sha: "abc123".into(),
            }],
            scaffolded_from: ScaffoldedFrom {
                templates_version: 1,
                schemas: [("dev".to_string(), "0.5.0".to_string())]
                    .into_iter()
                    .collect(),
            },
        };
        let yaml = original.to_yaml().unwrap();
        let parsed = RivetVersion::from_yaml(&yaml).unwrap();
        assert_eq!(parsed.rivet_cli, original.rivet_cli);
        assert_eq!(parsed.files.len(), 1);
        assert_eq!(parsed.scaffolded_from.schemas.len(), 1);
    }

    #[test]
    fn record_for_finds_path() {
        let v = RivetVersion {
            rivet_cli: "0.5.0".into(),
            template_version: 1,
            scaffolded_at: "2026-04-23T16:00:00Z".into(),
            files: vec![FileRecord {
                path: ".rivet/pipelines/dev.yaml".into(),
                from_template: "x@v1".into(),
                scaffolded_sha: "abc".into(),
            }],
            scaffolded_from: Default::default(),
        };
        assert!(v.record_for(".rivet/pipelines/dev.yaml").is_some());
        assert!(v.record_for(".rivet/pipelines/other.yaml").is_none());
    }

    #[test]
    fn content_sha_is_stable() {
        let a = content_sha256(b"hello");
        let b = content_sha256(b"hello");
        assert_eq!(a, b);
        let c = content_sha256(b"hello!");
        assert_ne!(a, c);
        // Known SHA-256 of "hello"
        assert_eq!(
            a,
            "2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824"
        );
    }
}
