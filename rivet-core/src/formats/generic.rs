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
use std::path::{Path, PathBuf};

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
                    links: a.links.clone(),
                    fields: a.fields.clone(),
                    fields_per_variant: a.fields_per_variant.clone(),
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
    links: Vec<Link>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    fields: BTreeMap<String, serde_yaml::Value>,
    #[serde(
        default,
        rename = "fields-per-variant",
        skip_serializing_if = "BTreeMap::is_empty"
    )]
    fields_per_variant: BTreeMap<String, BTreeMap<String, serde_yaml::Value>>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    provenance: Option<Provenance>,
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
            links: a.links,
            fields: a.fields,
            fields_per_variant: a.fields_per_variant,
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

/// Why a YAML file under a `generic`/`generic-yaml` source path was not
/// loaded as an artifact list.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SkipKind {
    /// The file looks like it was *meant* to be an artifact file but is
    /// malformed (not valid YAML, a broken `artifacts:` list, or an
    /// artifact written without the `artifacts:` wrapper). This is a
    /// user-facing error (F2a).
    ParseError,
    /// The file is legitimate non-artifact YAML that happens to live under
    /// the `artifacts/` source path (e.g. `bindings.yaml`,
    /// `feature-model.yaml`, `variants/*.yaml`). It is skipped silently
    /// with no diagnostic (F2b).
    NotArtifactFile,
}

/// A YAML file that `import_generic_file` declined to load, together with
/// the classification of *why* (see [`SkipKind`]).
#[derive(Debug, Clone)]
pub struct SkippedFile {
    /// Path to the file that failed to import.
    pub path: PathBuf,
    /// Human-readable reason (the underlying parse/IO error message).
    pub reason: String,
    /// Whether this is a malformed artifact file (`ParseError`) or
    /// legitimate non-artifact YAML (`NotArtifactFile`).
    pub kind: SkipKind,
}

/// Classify a `.yaml`/`.yml` file that failed `import_generic_file`.
///
/// Re-parses the raw content as a generic `serde_yaml::Value` and applies
/// the REQ-062 classification rule:
///
/// 1. Not valid YAML at all -> [`SkipKind::ParseError`] (F2a).
/// 2. Top-level mapping has an `artifacts` key -> [`SkipKind::ParseError`]
///    (a malformed artifacts list).
/// 3. Top-level mapping has BOTH `id` and `type` keys ->
///    [`SkipKind::ParseError`] (an artifact written without the
///    `artifacts:` wrapper — the exact F2a reproducer).
/// 4. Anything else -> [`SkipKind::NotArtifactFile`] (F2b — skip silently).
fn classify_skip(content: &str) -> SkipKind {
    let value: serde_yaml::Value = match serde_yaml::from_str(content) {
        Ok(v) => v,
        // Case 1: not valid YAML at all.
        Err(_) => return SkipKind::ParseError,
    };
    if let serde_yaml::Value::Mapping(map) = value {
        let has_key = |k: &str| map.contains_key(serde_yaml::Value::String(k.to_string()));
        // Case 2: a top-level `artifacts:` key means this was intended as
        // an artifact-list file; if `import_generic_file` rejected it, the
        // list itself is malformed.
        if has_key("artifacts") {
            return SkipKind::ParseError;
        }
        // Case 3: both `id` and `type` at top level — an artifact written
        // without the required `artifacts:` wrapper.
        if has_key("id") && has_key("type") {
            return SkipKind::ParseError;
        }
    }
    // Case 4: legitimate non-artifact YAML (mapping without the artifact
    // signals, a list, or a scalar).
    SkipKind::NotArtifactFile
}

/// Recursively collect `.yaml`/`.yml` file paths under `dir`, mirroring the
/// directory walk in [`import_generic_directory`].
fn collect_yaml_paths(dir: &Path, out: &mut Vec<PathBuf>) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.flatten() {
        let path = entry.path();
        if path
            .extension()
            .is_some_and(|ext| ext == "yaml" || ext == "yml")
        {
            out.push(path);
        } else if path.is_dir() {
            collect_yaml_paths(&path, out);
        }
    }
}

/// Walk `dir` exactly like [`import_generic_directory`] and report every
/// `.yaml`/`.yml` file that fails `import_generic_file`, classified per the
/// REQ-062 rule (see [`classify_skip`]).
///
/// Well-formed artifact files produce no entry. The returned vec is the
/// missing diagnostic signal: without it, malformed artifact files were
/// swallowed to a stderr `log::warn!` and `rivet validate` reported a green
/// PASS over an empty load.
pub fn scan_skipped_files(dir: &Path) -> Vec<SkippedFile> {
    let mut paths = Vec::new();
    collect_yaml_paths(dir, &mut paths);
    let mut skipped = Vec::new();
    for path in paths {
        match import_generic_file(&path) {
            Ok(_) => {}
            Err(e) => {
                let reason = e.to_string();
                let kind = match std::fs::read_to_string(&path) {
                    Ok(content) => classify_skip(&content),
                    // Couldn't even read the file (IO error / non-UTF-8) —
                    // treat as a parse error so it surfaces.
                    Err(_) => SkipKind::ParseError,
                };
                skipped.push(SkippedFile { path, reason, kind });
            }
        }
    }
    skipped
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::io::Write;

    /// REQ-062 / F2: genuinely corrupt YAML (not even parseable) is a
    /// ParseError; a bare list / scalar with no artifact signal is not.
    /// Complements `scan_skipped_files_classifies_malformed_vs_non_artifact`
    /// which covers the directory-walk + the `id`+`type` and `bindings`
    /// cases.
    ///
    /// rivet: verifies REQ-062
    #[test]
    fn classify_skip_treats_corrupt_yaml_as_parse_error() {
        assert_eq!(classify_skip("{[unbalanced: yaml"), SkipKind::ParseError);
        // A bare list / scalar with no artifact signal is not an error.
        assert_eq!(
            classify_skip("- just\n- a\n- list\n"),
            SkipKind::NotArtifactFile
        );
    }

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

    /// `scan_skipped_files` must distinguish a malformed artifact file
    /// (F2a — top-level `id:`/`type:` without the `artifacts:` wrapper)
    /// from legitimate non-artifact YAML (F2b — a `bindings:` file), and
    /// must produce no entry at all for a well-formed `artifacts:` file.
    ///
    /// rivet: implements REQ-004 verifies REQ-062
    #[test]
    fn scan_skipped_files_classifies_malformed_vs_non_artifact() {
        let dir = tempfile::tempdir().unwrap();

        // F2a: an artifact written WITHOUT the `artifacts:` wrapper.
        let malformed = dir.path().join("malformed.yaml");
        std::fs::write(
            &malformed,
            "id: REQ-001\ntype: requirement\ntitle: Orphan artifact\n",
        )
        .unwrap();

        // F2b: legitimate non-artifact YAML living under the source path.
        let bindings = dir.path().join("bindings.yaml");
        std::fs::write(&bindings, "bindings:\n  - core\n  - dashboard\n").unwrap();

        // Well-formed artifact file — must produce no skip entry.
        let good = dir.path().join("requirements.yaml");
        std::fs::write(
            &good,
            "artifacts:\n  - id: REQ-002\n    type: requirement\n    title: Valid\n",
        )
        .unwrap();

        let skipped = scan_skipped_files(dir.path());

        let malformed_entry = skipped
            .iter()
            .find(|s| s.path == malformed)
            .expect("malformed.yaml must be reported as skipped");
        assert_eq!(
            malformed_entry.kind,
            SkipKind::ParseError,
            "an artifact without the `artifacts:` wrapper is F2a (ParseError)"
        );

        let bindings_entry = skipped
            .iter()
            .find(|s| s.path == bindings)
            .expect("bindings.yaml must be reported as skipped");
        assert_eq!(
            bindings_entry.kind,
            SkipKind::NotArtifactFile,
            "a `bindings:` file is legitimate non-artifact YAML (F2b)"
        );

        assert!(
            !skipped.iter().any(|s| s.path == good),
            "a well-formed `artifacts:` file must produce no skip entry"
        );
    }
}
