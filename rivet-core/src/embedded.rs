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

/// All known built-in schema names.
pub const SCHEMA_NAMES: &[&str] = &[
    "common",
    "dev",
    "stpa",
    "aspice",
    "cybersecurity",
    "aadl",
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
