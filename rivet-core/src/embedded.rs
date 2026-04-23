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
