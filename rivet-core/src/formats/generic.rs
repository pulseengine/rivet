//! Generic YAML format adapter.
//!
//! Reads artifacts from YAML files using the canonical format:
//!
//! ```yaml
//! artifacts:
//!   - id: SWREQ-001
//!     type: sw-req
//!     title: Memory isolation
//!     description: ...
//!     status: approved
//!     tags: [safety]
//!     links:
//!       - type: derives-from
//!         target: SYSREQ-010
//!     fields:
//!       priority: must
//!       req-type: safety
//! ```

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

use std::collections::BTreeMap;
use std::path::Path;

/// Maximum allowed YAML file size (10 MB). Files exceeding this limit are
/// rejected before parsing to mitigate resource-exhaustion attacks (SSC-6).
const MAX_YAML_FILE_SIZE: u64 = 10 * 1024 * 1024;

use serde::Deserialize;

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::{Artifact, Link, Provenance};

pub struct GenericYamlAdapter {
    supported: Vec<String>,
}

impl GenericYamlAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec![], // accepts all types
        }
    }
}

impl Default for GenericYamlAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for GenericYamlAdapter {
    fn id(&self) -> &str {
        "generic-yaml"
    }
    fn name(&self) -> &str {
        "Generic YAML Format"
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
            AdapterSource::Path(path) => import_generic_file(path),
            AdapterSource::Directory(dir) => import_generic_directory(dir),
            AdapterSource::Bytes(bytes) => {
                let content = std::str::from_utf8(bytes)
                    .map_err(|e| Error::Adapter(format!("invalid UTF-8: {}", e)))?;
                parse_generic_yaml(content, None)
            }
        }
    }
    fn export(&self, artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        let file = GenericFile {
            artifacts: artifacts
                .iter()
                .map(|a| GenericArtifact {
                    id: a.id.clone(),
                    artifact_type: a.artifact_type.clone(),
                    title: a.title.clone(),
                    description: a.description.clone(),
                    status: a.status.clone(),
                    tags: a.tags.clone(),
                    links: a
                        .links
                        .iter()
                        .map(|l| GenericLink {
                            link_type: l.link_type.clone(),
                            target: l.target.clone(),
                        })
                        .collect(),
                    fields: a.fields.clone(),
                    provenance: a.provenance.clone(),
                })
                .collect(),
        };
        let yaml = serde_yaml::to_string(&file)?;
        Ok(yaml.into_bytes())
    }
}

// `deny_unknown_fields` is deliberate: without it, typos like `artifact:`
// (singular) or `Artifacts:` (wrong case) silently deserialize to an empty
// `GenericFile`, and the offending top-level block becomes invisible to the
// trace graph. The YAML footgun fuzzer confirmed this class of bug.
#[derive(Deserialize, serde::Serialize)]
#[serde(deny_unknown_fields)]
struct GenericFile {
    artifacts: Vec<GenericArtifact>,
}

#[derive(Deserialize, serde::Serialize)]
struct GenericArtifact {
    id: String,
    #[serde(rename = "type")]
    artifact_type: String,
    title: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    description: Option<String>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    status: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    tags: Vec<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    links: Vec<GenericLink>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    fields: BTreeMap<String, serde_yaml::Value>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    provenance: Option<Provenance>,
}

#[derive(Deserialize, serde::Serialize)]
struct GenericLink {
    #[serde(rename = "type")]
    link_type: String,
    target: String,
}

pub fn parse_generic_yaml(content: &str, source: Option<&Path>) -> Result<Vec<Artifact>, Error> {
    let file: GenericFile = serde_yaml::from_str(content)?;

    Ok(file
        .artifacts
        .into_iter()
        .map(|a| Artifact {
            id: a.id,
            artifact_type: a.artifact_type,
            title: a.title,
            description: a.description,
            status: a.status,
            tags: a.tags,
            links: a
                .links
                .into_iter()
                .map(|l| Link {
                    link_type: l.link_type,
                    target: l.target,
                })
                .collect(),
            fields: a.fields,
            provenance: a.provenance,
            source_file: source.map(|p| p.to_path_buf()),
        })
        .collect())
}

fn import_generic_file(path: &Path) -> Result<Vec<Artifact>, Error> {
    let metadata =
        std::fs::metadata(path).map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
    if metadata.len() > MAX_YAML_FILE_SIZE {
        return Err(Error::Adapter(format!(
            "{}: file size {} bytes exceeds {} byte limit",
            path.display(),
            metadata.len(),
            MAX_YAML_FILE_SIZE
        )));
    }
    let content = std::fs::read_to_string(path)
        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
    parse_generic_yaml(&content, Some(path))
}

fn import_generic_directory(dir: &Path) -> Result<Vec<Artifact>, Error> {
    let mut artifacts = Vec::new();
    let entries =
        std::fs::read_dir(dir).map_err(|e| Error::Io(format!("{}: {}", dir.display(), e)))?;

    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path
            .extension()
            .is_some_and(|ext| ext == "yaml" || ext == "yml")
        {
            match import_generic_file(&path) {
                Ok(arts) => artifacts.extend(arts),
                Err(e) => log::warn!("skipping {}: {}", path.display(), e),
            }
        } else if path.is_dir() {
            artifacts.extend(import_generic_directory(&path)?);
        }
    }

    Ok(artifacts)
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    #[test]
    fn rejects_oversized_yaml_file() {
        let dir = tempfile::tempdir().unwrap();
        let path = dir.path().join("huge.yaml");
        {
            let mut f = std::fs::File::create(&path).unwrap();
            // Write a file slightly over the 10 MB limit
            let buf = vec![b'#'; (MAX_YAML_FILE_SIZE as usize) + 1];
            f.write_all(&buf).unwrap();
        }
        let err = import_generic_file(&path).unwrap_err();
        let msg = err.to_string();
        assert!(
            msg.contains("exceeds"),
            "expected size-limit error, got: {msg}"
        );
    }

    /// When a file has both a correct `artifacts:` key AND a typo-ed
    /// companion key, `serde_yaml` without `deny_unknown_fields` would
    /// silently drop the typo-ed key — losing any artifacts the user
    /// accidentally placed there. Discovered by the YAML footgun fuzzer.
    ///
    /// rivet: fixes REQ-004 verifies REQ-010
    #[test]
    fn typo_companion_key_produces_parse_error() {
        // Both keys at top level: `artifacts:` is valid but `artifact:`
        // (singular typo) contains artifacts the user meant to include.
        // Without deny_unknown_fields, this parses Ok and the typo'd
        // block is invisible.
        let yaml = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Valid entry
artifact:
  - id: REQ-002
    type: requirement
    title: Typo'd entry
";
        let result = parse_generic_yaml(yaml, None);
        assert!(
            result.is_err(),
            "parse must fail on unknown top-level key 'artifact'; got Ok({:?})",
            result.as_ref().ok()
        );
        let msg = result.unwrap_err().to_string();
        assert!(
            msg.contains("artifact") || msg.contains("unknown field"),
            "error message should mention the offending key, got: {msg}"
        );
    }

    /// A file with `Artifacts:` (wrong case) alongside `artifacts:`.
    ///
    /// rivet: fixes REQ-004 verifies REQ-010
    #[test]
    fn capitalized_artifacts_companion_key_produces_parse_error() {
        let yaml = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: Valid entry
Artifacts:
  - id: REQ-002
    type: requirement
    title: Wrong-case typo
";
        let result = parse_generic_yaml(yaml, None);
        assert!(
            result.is_err(),
            "parse must fail on wrong-case top-level key 'Artifacts'; got Ok({:?})",
            result.as_ref().ok()
        );
    }
}
