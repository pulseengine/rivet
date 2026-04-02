//! Embedded schemas — compiled into the binary via `include_str!`.
//!
//! Provides fallback schema loading when no `schemas/` directory is found,
//! and enables `rivet docs`, `rivet schema show`, etc. without filesystem.

use crate::error::Error;
use crate::schema::SchemaFile;

// ── Embedded schema content ─────────────────────────────────────────────

pub const SCHEMA_COMMON: &str = include_str!("../../schemas/common.yaml");
pub const SCHEMA_DEV: &str = include_str!("../../schemas/dev.yaml");
pub const SCHEMA_STPA: &str = include_str!("../../schemas/stpa.yaml");
pub const SCHEMA_ASPICE: &str = include_str!("../../schemas/aspice.yaml");
pub const SCHEMA_CYBERSECURITY: &str = include_str!("../../schemas/cybersecurity.yaml");
pub const SCHEMA_AADL: &str = include_str!("../../schemas/aadl.yaml");
pub const SCHEMA_SCORE: &str = include_str!("../../schemas/score.yaml");
pub const SCHEMA_EU_AI_ACT: &str = include_str!("../../schemas/eu-ai-act.yaml");
pub const SCHEMA_SAFETY_CASE: &str = include_str!("../../schemas/safety-case.yaml");
pub const SCHEMA_STPA_AI: &str = include_str!("../../schemas/stpa-ai.yaml");
pub const SCHEMA_DO_178C: &str = include_str!("../../schemas/do-178c.yaml");
pub const SCHEMA_EN_50128: &str = include_str!("../../schemas/en-50128.yaml");
pub const SCHEMA_IEC_61508: &str = include_str!("../../schemas/iec-61508.yaml");
pub const SCHEMA_IEC_62304: &str = include_str!("../../schemas/iec-62304.yaml");

/// All known built-in schema names.
pub const SCHEMA_NAMES: &[&str] = &[
    "common",
    "dev",
    "stpa",
    "stpa-ai",
    "aspice",
    "cybersecurity",
    "aadl",
    "score",
    "eu-ai-act",
    "safety-case",
    "do-178c",
    "en-50128",
    "iec-61508",
    "iec-62304",
];

/// Look up embedded schema content by name.
pub fn embedded_schema(name: &str) -> Option<&'static str> {
    match name {
        "common" => Some(SCHEMA_COMMON),
        "dev" => Some(SCHEMA_DEV),
        "stpa" => Some(SCHEMA_STPA),
        "aspice" => Some(SCHEMA_ASPICE),
        "cybersecurity" => Some(SCHEMA_CYBERSECURITY),
        "aadl" => Some(SCHEMA_AADL),
        "score" => Some(SCHEMA_SCORE),
        "eu-ai-act" => Some(SCHEMA_EU_AI_ACT),
        "safety-case" => Some(SCHEMA_SAFETY_CASE),
        "stpa-ai" => Some(SCHEMA_STPA_AI),
        "do-178c" => Some(SCHEMA_DO_178C),
        "en-50128" => Some(SCHEMA_EN_50128),
        "iec-61508" => Some(SCHEMA_IEC_61508),
        "iec-62304" => Some(SCHEMA_IEC_62304),
        _ => None,
    }
}

/// Parse an embedded schema by name.
pub fn load_embedded_schema(name: &str) -> Result<SchemaFile, Error> {
    let content = embedded_schema(name)
        .ok_or_else(|| Error::Schema(format!("unknown built-in schema: {name}")))?;
    serde_yaml::from_str(content)
        .map_err(|e| Error::Schema(format!("parsing embedded schema '{name}': {e}")))
}

/// Load schema content strings, falling back to embedded when files are not found.
///
/// Returns `(name, content)` pairs suitable for feeding into the salsa database.
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

    result
}

/// Load and merge schemas, falling back to embedded when files are not found.
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
            log::warn!("schema '{name}' not found on disk or embedded");
        }
    }

    Ok(crate::schema::Schema::merge(&files))
}
