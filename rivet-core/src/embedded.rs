//! Embedded schemas — compiled into the binary via `include_str!`.
//!
//! Provides fallback schema loading when no `schemas/` directory is found,
//! and enables `rivet docs`, `rivet schema show`, etc. without filesystem.
//!
//! Bridge schemas (`.bridge.yaml`) define cross-domain traceability rules
//! between two or more schemas.  They are auto-discovered: when the loaded
//! schema set covers every schema in a bridge's `extends` list, the bridge
//! is loaded automatically — no explicit listing required.

use std::collections::HashSet;

use crate::error::Error;
use crate::schema::SchemaFile;

// ── Embedded schema content ─────────────────────────────────────────────

pub const SCHEMA_COMMON: &str = include_str!("../../schemas/common.yaml");
pub const SCHEMA_DEV: &str = include_str!("../../schemas/dev.yaml");
pub const SCHEMA_STPA: &str = include_str!("../../schemas/stpa.yaml");
pub const SCHEMA_ASPICE: &str = include_str!("../../schemas/aspice.yaml");
pub const SCHEMA_ISO_26262: &str = include_str!("../../schemas/iso-26262.yaml");
pub const SCHEMA_CYBERSECURITY: &str = include_str!("../../schemas/cybersecurity.yaml");
pub const SCHEMA_AADL: &str = include_str!("../../schemas/aadl.yaml");
pub const SCHEMA_SCORE: &str = include_str!("../../schemas/score.yaml");
pub const SCHEMA_EU_AI_ACT: &str = include_str!("../../schemas/eu-ai-act.yaml");
pub const SCHEMA_SAFETY_CASE: &str = include_str!("../../schemas/safety-case.yaml");
pub const SCHEMA_STPA_AI: &str = include_str!("../../schemas/stpa-ai.yaml");
pub const SCHEMA_STPA_SEC: &str = include_str!("../../schemas/stpa-sec.yaml");
pub const SCHEMA_RESEARCH: &str = include_str!("../../schemas/research.yaml");
pub const SCHEMA_ISO_PAS_8800: &str = include_str!("../../schemas/iso-pas-8800.yaml");
pub const SCHEMA_SOTIF: &str = include_str!("../../schemas/sotif.yaml");
pub const SCHEMA_SUPPLY_CHAIN: &str = include_str!("../../schemas/supply-chain.yaml");
pub const SCHEMA_VV_COVERAGE: &str = include_str!("../../schemas/vv-coverage.yaml");
pub const SCHEMA_DO_178C: &str = include_str!("../../schemas/do-178c.yaml");
pub const SCHEMA_EN_50128: &str = include_str!("../../schemas/en-50128.yaml");
pub const SCHEMA_IEC_61508: &str = include_str!("../../schemas/iec-61508.yaml");
pub const SCHEMA_IEC_62304: &str = include_str!("../../schemas/iec-62304.yaml");

// ── Embedded migration recipes ──────────────────────────────────────────

pub const MIGRATION_DEV_TO_ASPICE: &str =
    include_str!("../../schemas/migrations/dev-to-aspice.yaml");

/// All shipped migration recipes: `(name, content)`.
pub const MIGRATION_RECIPES: &[(&str, &str)] = &[("dev-to-aspice", MIGRATION_DEV_TO_ASPICE)];

/// Look up an embedded migration recipe by name (e.g. `"dev-to-aspice"`).
pub fn embedded_migration_recipe(name: &str) -> Option<&'static str> {
    MIGRATION_RECIPES
        .iter()
        .find(|(n, _)| *n == name)
        .map(|(_, c)| *c)
}

// ── Embedded bridge schema content ──────────────────────────────────────

pub const BRIDGE_EU_AI_ACT_ASPICE: &str =
    include_str!("../../schemas/eu-ai-act-aspice.bridge.yaml");
pub const BRIDGE_EU_AI_ACT_STPA: &str = include_str!("../../schemas/eu-ai-act-stpa.bridge.yaml");
pub const BRIDGE_ISO_8800_STPA: &str = include_str!("../../schemas/iso-8800-stpa.bridge.yaml");
pub const BRIDGE_SAFETY_CASE_EU_AI_ACT: &str =
    include_str!("../../schemas/safety-case-eu-ai-act.bridge.yaml");
pub const BRIDGE_SAFETY_CASE_STPA: &str =
    include_str!("../../schemas/safety-case-stpa.bridge.yaml");
pub const BRIDGE_SOTIF_STPA: &str = include_str!("../../schemas/sotif-stpa.bridge.yaml");
pub const BRIDGE_STPA_DEV: &str = include_str!("../../schemas/stpa-dev.bridge.yaml");

/// All known built-in schema names.
pub const SCHEMA_NAMES: &[&str] = &[
    "common",
    "dev",
    "stpa",
    "stpa-ai",
    "stpa-sec",
    "aspice",
    "iso-26262",
    "cybersecurity",
    "aadl",
    "score",
    "eu-ai-act",
    "safety-case",
    "research",
    "iso-pas-8800",
    "sotif",
    "supply-chain",
    "vv-coverage",
    "do-178c",
    "en-50128",
    "iec-61508",
    "iec-62304",
];

/// Metadata for a built-in bridge schema.
///
/// `filename` is the stem used for on-disk lookup (e.g. `eu-ai-act-stpa.bridge`).
/// `extends` lists the schemas that must all be present for the bridge to apply.
pub struct BridgeInfo {
    pub filename: &'static str,
    pub extends: &'static [&'static str],
    pub content: &'static str,
}

/// All known built-in bridge schemas.
pub const BRIDGE_SCHEMAS: &[BridgeInfo] = &[
    BridgeInfo {
        filename: "eu-ai-act-aspice.bridge",
        extends: &["eu-ai-act", "aspice"],
        content: BRIDGE_EU_AI_ACT_ASPICE,
    },
    BridgeInfo {
        filename: "eu-ai-act-stpa.bridge",
        extends: &["eu-ai-act", "stpa"],
        content: BRIDGE_EU_AI_ACT_STPA,
    },
    BridgeInfo {
        filename: "iso-8800-stpa.bridge",
        extends: &["iso-pas-8800", "stpa", "stpa-ai"],
        content: BRIDGE_ISO_8800_STPA,
    },
    BridgeInfo {
        filename: "safety-case-eu-ai-act.bridge",
        extends: &["safety-case", "eu-ai-act"],
        content: BRIDGE_SAFETY_CASE_EU_AI_ACT,
    },
    BridgeInfo {
        filename: "safety-case-stpa.bridge",
        extends: &["safety-case", "stpa"],
        content: BRIDGE_SAFETY_CASE_STPA,
    },
    BridgeInfo {
        filename: "sotif-stpa.bridge",
        extends: &["sotif", "stpa"],
        content: BRIDGE_SOTIF_STPA,
    },
    BridgeInfo {
        filename: "stpa-dev.bridge",
        extends: &["stpa", "dev"],
        content: BRIDGE_STPA_DEV,
    },
];

/// Where a schema named in `rivet.yaml` resolves from.
///
/// Mirrors the resolution order of [`load_schemas_with_fallback`]: an on-disk
/// file under `<schemas_dir>/` wins; otherwise the compiled-in embedded copy is
/// used. Surfacing this lets callers tell a user when a builtin schema is
/// *embedded* (version-bound to the rivet binary, so it changes silently on
/// upgrade) vs *on-disk* (pinned in the project, version-controlled). #431.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SchemaSource {
    /// Resolved from a project file at this path (pinned in git).
    OnDisk(std::path::PathBuf),
    /// Resolved from the copy compiled into the rivet binary.
    Embedded,
    /// Neither on-disk nor embedded — an unknown schema name.
    Missing,
}

impl SchemaSource {
    /// A short machine token: `on-disk` / `embedded` / `missing`.
    pub fn kind(&self) -> &'static str {
        match self {
            SchemaSource::OnDisk(_) => "on-disk",
            SchemaSource::Embedded => "embedded",
            SchemaSource::Missing => "missing",
        }
    }
}

/// For each requested schema name, report where it resolves from, using the
/// same precedence as [`load_schemas_with_fallback`] (on-disk file else
/// embedded copy). Pure: only checks path existence and the embedded registry.
/// Order follows `names`.
pub fn schema_sources(
    names: &[String],
    schemas_dir: &std::path::Path,
) -> Vec<(String, SchemaSource)> {
    names
        .iter()
        .map(|name| {
            let path = schemas_dir.join(format!("{name}.yaml"));
            let source = if path.exists() {
                SchemaSource::OnDisk(path)
            } else if embedded_schema(name).is_some() {
                SchemaSource::Embedded
            } else {
                SchemaSource::Missing
            };
            (name.clone(), source)
        })
        .collect()
}

/// Look up embedded schema content by name.
pub fn embedded_schema(name: &str) -> Option<&'static str> {
    match name {
        "common" => Some(SCHEMA_COMMON),
        "dev" => Some(SCHEMA_DEV),
        "stpa" => Some(SCHEMA_STPA),
        "aspice" => Some(SCHEMA_ASPICE),
        "iso-26262" => Some(SCHEMA_ISO_26262),
        "cybersecurity" => Some(SCHEMA_CYBERSECURITY),
        "aadl" => Some(SCHEMA_AADL),
        "score" => Some(SCHEMA_SCORE),
        "eu-ai-act" => Some(SCHEMA_EU_AI_ACT),
        "safety-case" => Some(SCHEMA_SAFETY_CASE),
        "stpa-ai" => Some(SCHEMA_STPA_AI),
        "stpa-sec" => Some(SCHEMA_STPA_SEC),
        "research" => Some(SCHEMA_RESEARCH),
        "iso-pas-8800" => Some(SCHEMA_ISO_PAS_8800),
        "sotif" => Some(SCHEMA_SOTIF),
        "supply-chain" => Some(SCHEMA_SUPPLY_CHAIN),
        "vv-coverage" => Some(SCHEMA_VV_COVERAGE),
        "do-178c" => Some(SCHEMA_DO_178C),
        "en-50128" => Some(SCHEMA_EN_50128),
        "iec-61508" => Some(SCHEMA_IEC_61508),
        "iec-62304" => Some(SCHEMA_IEC_62304),
        _ => None,
    }
}

/// Look up embedded bridge schema content by filename stem
/// (e.g. `"eu-ai-act-stpa.bridge"`).
pub fn embedded_bridge(name: &str) -> Option<&'static str> {
    BRIDGE_SCHEMAS
        .iter()
        .find(|b| b.filename == name)
        .map(|b| b.content)
}

/// Return the bridge names whose `extends` list is a subset of `loaded`.
///
/// This is the core auto-discovery logic: for each known bridge, check
/// whether every schema it depends on is already in the loaded set.
pub fn discover_bridges(loaded_schemas: &[String]) -> Vec<&'static str> {
    let set: HashSet<&str> = loaded_schemas.iter().map(|s| s.as_str()).collect();
    BRIDGE_SCHEMAS
        .iter()
        .filter(|b| b.extends.iter().all(|dep| set.contains(dep)))
        .map(|b| b.filename)
        .collect()
}

/// Parse an embedded schema by name (regular or bridge).
pub fn load_embedded_schema(name: &str) -> Result<SchemaFile, Error> {
    let content = embedded_schema(name)
        .or_else(|| embedded_bridge(name))
        .ok_or_else(|| Error::Schema(format!("unknown built-in schema: {name}")))?;
    serde_yaml::from_str(content)
        .map_err(|e| Error::Schema(format!("parsing embedded schema '{name}': {e}")))
}

/// Load schema content strings, falling back to embedded when files are not found.
///
/// Returns `(name, content)` pairs suitable for feeding into the salsa database.
/// Automatically discovers and appends applicable bridge schemas.
pub fn load_schema_contents(
    schema_names: &[String],
    schemas_dir: &std::path::Path,
) -> Vec<(String, String)> {
    let mut result = Vec::new();

    for name in schema_names {
        let path = schemas_dir.join(format!("{name}.yaml"));
        if path.exists() {
            if let Ok(content) = std::fs::read_to_string(&path) {
                result.push((name.clone(), content));
            }
        } else if let Some(content) = embedded_schema(name) {
            result.push((name.clone(), content.to_string()));
        } else {
            log::warn!("schema '{name}' not found on disk or embedded");
        }
    }

    // Auto-discover bridge schemas
    let bridge_names = discover_bridges(schema_names);
    for bridge_name in bridge_names {
        // Skip if already explicitly listed
        if schema_names.iter().any(|n| n == bridge_name) {
            continue;
        }
        let path = schemas_dir.join(format!("{bridge_name}.yaml"));
        if path.exists() {
            if let Ok(content) = std::fs::read_to_string(&path) {
                log::info!("auto-loaded bridge schema: {bridge_name}");
                result.push((bridge_name.to_string(), content));
            }
        } else if let Some(content) = embedded_bridge(bridge_name) {
            log::info!("auto-loaded bridge schema: {bridge_name} (embedded)");
            result.push((bridge_name.to_string(), content.to_string()));
        }
    }

    result
}

/// Provenance of a resolved schema: which version was used and whether it came
/// from a vendored (on-disk) file or the embedded (compiled-into-the-binary)
/// copy. Surfaced by `rivet validate` so an upgrade-induced validation change —
/// a builtin schema that tightened or added rules between rivet releases —
/// becomes visible instead of silent (issue #431).
#[derive(Debug, Clone, PartialEq, Eq, serde::Serialize)]
pub struct SchemaProvenance {
    pub name: String,
    pub version: String,
    /// `"vendored"` (on-disk, pinned in the project's git) or `"embedded"`
    /// (compiled into this rivet binary, so it changes when rivet is upgraded).
    pub source: &'static str,
    /// Path to the on-disk schema when `source == "vendored"`.
    #[serde(skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
}

/// Resolve the provenance (name, version, source) of every schema `validate`
/// will use for the given names — including auto-discovered bridges. Builds on
/// [`schema_sources`] (the single on-disk/embedded classifier, REQ-177) and adds
/// the schema `version` plus the bridge set, so the CLI can surface exactly
/// which schema set, and which version of each, a given `rivet validate` ran
/// against (issue #431). `Missing` schemas are omitted (already warned about by
/// the loader). The `source` string matches [`SchemaSource::kind`]
/// (`"on-disk"` / `"embedded"`) for one vocabulary across `validate` and
/// `rivet schema sources`.
pub fn resolve_schema_provenance(
    schema_names: &[String],
    schemas_dir: &std::path::Path,
) -> Vec<SchemaProvenance> {
    // Expand to the same name set the loader uses: requested names + bridges.
    let mut names: Vec<String> = schema_names.to_vec();
    for bridge in discover_bridges(schema_names) {
        if !names.iter().any(|n| n == bridge) {
            names.push(bridge.to_string());
        }
    }

    schema_sources(&names, schemas_dir)
        .into_iter()
        .filter_map(|(name, source)| {
            let (version, path) = match &source {
                SchemaSource::OnDisk(p) => {
                    let version = std::fs::read_to_string(p)
                        .ok()
                        .and_then(|c| serde_yaml::from_str::<SchemaFile>(&c).ok())
                        .map(|s| s.schema.version)
                        .unwrap_or_default();
                    (version, Some(p.display().to_string()))
                }
                SchemaSource::Embedded => {
                    let version = load_embedded_schema(&name)
                        .ok()
                        .map(|s| s.schema.version)
                        .unwrap_or_default();
                    (version, None)
                }
                SchemaSource::Missing => return None,
            };
            Some(SchemaProvenance {
                name,
                version,
                source: source.kind(),
                path,
            })
        })
        .collect()
}

/// Load and merge schemas, falling back to embedded when files are not found.
///
/// Automatically discovers and appends applicable bridge schemas.
pub fn load_schemas_with_fallback(
    schema_names: &[String],
    schemas_dir: &std::path::Path,
) -> Result<crate::schema::Schema, Error> {
    let mut files = Vec::new();

    for name in schema_names {
        let path = schemas_dir.join(format!("{name}.yaml"));
        if path.exists() {
            let file = crate::schema::Schema::load_file(&path)?;
            files.push(file);
        } else if let Some(content) = embedded_schema(name) {
            let file: SchemaFile = serde_yaml::from_str(content)
                .map_err(|e| Error::Schema(format!("embedded '{name}': {e}")))?;
            files.push(file);
        } else {
            return Err(Error::Schema(format!(
                "schema '{name}' not found on disk ({}) or as embedded schema",
                schemas_dir.join(format!("{name}.yaml")).display()
            )));
        }
    }

    // Auto-discover bridge schemas
    let bridge_names = discover_bridges(schema_names);
    for bridge_name in bridge_names {
        // Skip if already explicitly listed
        if schema_names.iter().any(|n| n == bridge_name) {
            continue;
        }
        let path = schemas_dir.join(format!("{bridge_name}.yaml"));
        if path.exists() {
            match crate::schema::Schema::load_file(&path) {
                Ok(file) => {
                    log::info!("auto-loaded bridge schema: {bridge_name}");
                    files.push(file);
                }
                Err(e) => log::warn!("failed to load bridge schema '{bridge_name}': {e}"),
            }
        } else if let Some(content) = embedded_bridge(bridge_name) {
            match serde_yaml::from_str::<SchemaFile>(content) {
                Ok(file) => {
                    log::info!("auto-loaded bridge schema: {bridge_name} (embedded)");
                    files.push(file);
                }
                Err(e) => log::warn!("failed to parse embedded bridge '{bridge_name}': {e}"),
            }
        }
    }

    Ok(crate::schema::Schema::merge(&files))
}

#[cfg(test)]
mod tests {
    use super::*;

    // rivet: verifies REQ-177
    #[test]
    fn schema_sources_classifies_on_disk_embedded_and_missing() {
        let dir = tempfile::tempdir().unwrap();
        // An on-disk file shadows the embedded copy.
        std::fs::write(dir.path().join("common.yaml"), "schema:\n  name: common\n").unwrap();

        let names = vec![
            "common".to_string(),  // on-disk (file present)
            "stpa".to_string(),    // embedded (no file, but a known embedded name)
            "made-up".to_string(), // missing (neither)
        ];
        let got = schema_sources(&names, dir.path());

        assert_eq!(got[0].1.kind(), "on-disk");
        assert!(matches!(&got[0].1, SchemaSource::OnDisk(p) if p.ends_with("common.yaml")));
        assert_eq!(got[1].1, SchemaSource::Embedded);
        assert_eq!(got[2].1, SchemaSource::Missing);
        // Order follows the input names.
        assert_eq!(
            got.iter().map(|(n, _)| n.as_str()).collect::<Vec<_>>(),
            vec!["common", "stpa", "made-up"]
        );
    }

    // rivet: verifies REQ-205
    #[test]
    fn resolve_schema_provenance_reports_version_and_source() {
        let dir = tempfile::tempdir().unwrap();
        // An on-disk schema with an explicit version shadows any embedded copy.
        std::fs::write(
            dir.path().join("common.yaml"),
            "schema:\n  name: common\n  version: 9.9.9\n",
        )
        .unwrap();

        let names = vec![
            "common".to_string(),  // on-disk (file present, version 9.9.9)
            "stpa".to_string(),    // embedded (known builtin)
            "made-up".to_string(), // missing -> omitted
        ];
        let prov = resolve_schema_provenance(&names, dir.path());

        let common = prov.iter().find(|p| p.name == "common").unwrap();
        assert_eq!(common.source, "on-disk");
        assert_eq!(common.version, "9.9.9");
        assert!(common.path.as_deref().unwrap().ends_with("common.yaml"));

        let stpa = prov.iter().find(|p| p.name == "stpa").unwrap();
        assert_eq!(stpa.source, "embedded");
        assert!(
            !stpa.version.is_empty(),
            "embedded schema must report its compiled-in version"
        );
        assert!(stpa.path.is_none());

        // Missing schemas are not surfaced (the loader already warns).
        assert!(prov.iter().all(|p| p.name != "made-up"));
    }
}
