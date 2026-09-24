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
pub const SCHEMA_ORDEAL_CERTIFICATE: &str = include_str!("../../schemas/ordeal-certificate.yaml");

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
    "ordeal-certificate",
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
            } else if embedded_schema(name).is_some() || embedded_bridge(name).is_some() {
                // #530: bridges resolve by name too (e.g. `stpa-dev.bridge`).
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
        "ordeal-certificate" => Some(SCHEMA_ORDEAL_CERTIFICATE),
        _ => None,
    }
}

/// Names of every embedded schema preset — the set a user may list in
/// `rivet.yaml`'s `schemas:`. Reuses the existing `SCHEMA_NAMES` registry;
/// surfaced by `rivet schema presets` (#510) so the declarable set is
/// self-documenting. The `every_embedded_preset_resolves_and_parses` test
/// guards that every name here also resolves via `embedded_schema`.
pub fn embedded_schema_names() -> impl Iterator<Item = &'static str> {
    SCHEMA_NAMES.iter().copied()
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

fn missing_join(v: &[String]) -> String {
    v.iter()
        .map(|s| format!("'{s}'"))
        .collect::<Vec<_>>()
        .join(", ")
}

/// The `extends` list of a declared bridge, for the error message.
fn extends_of(name: &str, schemas_dir: &std::path::Path) -> Vec<String> {
    let path = schemas_dir.join(format!("{name}.yaml"));
    if path.exists() {
        if let Some(f) = std::fs::read_to_string(&path)
            .ok()
            .and_then(|c| rivet_yaml::from_str::<SchemaFile>(&c).ok())
        {
            return f.schema.extends;
        }
    }
    BRIDGE_SCHEMAS
        .iter()
        .find(|b| b.filename == name)
        .map(|b| b.extends.iter().map(|s| (*s).to_owned()).collect())
        .unwrap_or_default()
}

/// Bridges that are dormant: not declared, and one or more bases away from applying.
/// Reported on demand, never as an error — see `unsatisfied_bridge_bases`.
pub fn dormant_bridges(schema_names: &[String]) -> Vec<(&'static str, Vec<String>)> {
    let loaded: HashSet<&str> = schema_names.iter().map(String::as_str).collect();
    BRIDGE_SCHEMAS
        .iter()
        .filter(|b| !schema_names.iter().any(|n| n == b.filename))
        .filter_map(|b| {
            let missing: Vec<String> = b
                .extends
                .iter()
                .filter(|d| !loaded.contains(*d))
                .map(|d| (*d).to_owned())
                .collect();
            // One or more bases away, but at least one base already present —
            // otherwise every bridge in the catalogue is "dormant" and the
            // list says nothing.
            if missing.is_empty() || missing.len() == b.extends.len() {
                None
            } else {
                Some((b.filename, missing))
            }
        })
        .collect()
}

/// Bridge files present in `schemas_dir` that no one has declared.
///
/// Returns `(stem, missing_bases)`. `missing_bases` is empty when every base
/// is already loaded — i.e. the bridge would apply the moment it is declared.
///
/// REPORT, NOT A LOAD, and the distinction is the decision (REQ-359).
/// `discover_bridges` iterates the compiled-in `BRIDGE_SCHEMAS` list, so a
/// bridge dropped into `schemas/` is unreachable by auto-discovery — an
/// on-disk file can only override a built-in NAME. The obvious fix is to make
/// discovery scan the directory. That was considered and rejected: REQ-356
/// established that a declared bridge is CHECKED, and auto-discovery is the
/// opposite of a declaration — obligations appearing and disappearing
/// according to which files happen to be present. That is the silent
/// rigour-selection hazard REQ-356 closed, reintroduced one layer down, in
/// exactly the repositories where a safety chain lives.
///
/// So this makes the file VISIBLE and leaves activation to an explicit
/// `schemas:` entry, which REQ-356 then checks. Built-ins are excluded even
/// when vendored on disk: they already auto-discover, and listing one would
/// tell the reader to declare something already active.
pub fn undeclared_local_bridges(
    schema_names: &[String],
    schemas_dir: &std::path::Path,
) -> Vec<(String, Vec<String>)> {
    let loaded: HashSet<&str> = schema_names.iter().map(String::as_str).collect();
    let Ok(rd) = std::fs::read_dir(schemas_dir) else {
        return Vec::new();
    };

    let mut out = Vec::new();
    for entry in rd.flatten() {
        let path = entry.path();
        if path.extension().is_none_or(|e| e != "yaml") {
            continue;
        }
        let Some(stem) = path.file_stem().and_then(|s| s.to_str()) else {
            continue;
        };
        if !stem.ends_with(".bridge") {
            continue;
        }
        // Already declared, so REQ-356's check owns it.
        if loaded.contains(stem) {
            continue;
        }
        // A vendored built-in is already auto-discovered.
        if BRIDGE_SCHEMAS.iter().any(|b| b.filename == stem) {
            continue;
        }
        let Some(file) = std::fs::read_to_string(&path)
            .ok()
            .and_then(|c| rivet_yaml::from_str::<SchemaFile>(&c).ok())
        else {
            continue;
        };
        let missing: Vec<String> = file
            .schema
            .extends
            .iter()
            .filter(|d| !loaded.contains(d.as_str()))
            .cloned()
            .collect();
        out.push((stem.to_owned(), missing));
    }
    out.sort();
    out
}

/// Bridges that are DECLARED in `schema_names` but whose `extends` bases are
/// not all present. Returns `(bridge_name, missing_bases)` pairs.
///
/// A bridge fires only when every schema it extends is loaded, which makes the
/// loaded set a rigour selector: dropping one line from `project.schemas`
/// removes a whole tier of obligations. That is legitimate as a maturity
/// dimension — a proof-of-concept need not carry a safety chain — but it has
/// to be a DECLARED property rather than an incidental edit, or the tier
/// disappears with no diagnostic.
///
/// Naming a bridge explicitly is the only way a project can say "I depend on
/// this tier", so that declaration is what this makes load-bearing. Measured
/// before this existed, on a fixture with no artifacts so nothing unrelated
/// could fire: `[common, stpa, stpa-dev.bridge]` with `dev` absent exited 0 and
/// applied nothing. The declaration bought no assurance at all.
///
/// Deliberately says nothing about UNDECLARED dormant bridges. A project
/// loading only `stpa` has six of them one base away, and an alarm that fires
/// on every legitimate partial schema set is one people learn to ignore.
/// Dormancy is reported on demand by `rivet schema list`, not as an error.
pub fn unsatisfied_bridge_bases(
    schema_names: &[String],
    schemas_dir: &std::path::Path,
) -> Vec<(String, Vec<String>)> {
    let loaded: HashSet<&str> = schema_names.iter().map(String::as_str).collect();
    let mut out = Vec::new();

    for name in schema_names {
        // The bases a declared bridge needs, from disk first so a local bridge
        // is checked on the same footing as a built-in. Auto-discovery only
        // ever consulted BRIDGE_SCHEMAS, so an explicit declaration is the only
        // way to load an on-disk bridge — which makes this its only safety net.
        let path = schemas_dir.join(format!("{name}.yaml"));
        let extends: Vec<String> = if path.exists() {
            match std::fs::read_to_string(&path)
                .ok()
                .and_then(|c| rivet_yaml::from_str::<SchemaFile>(&c).ok())
            {
                Some(f) => f.schema.extends.clone(),
                None => continue,
            }
        } else if let Some(b) = BRIDGE_SCHEMAS.iter().find(|b| b.filename == name) {
            b.extends.iter().map(|s| (*s).to_owned()).collect()
        } else {
            continue;
        };

        // Only bridges. A plain schema's `extends: [common]` is a base-field
        // relationship the loader already resolves, not a conjunction the
        // project has to satisfy, and treating it as one would reject ordinary
        // configurations.
        if !name.ends_with(".bridge") {
            continue;
        }

        let missing: Vec<String> = extends
            .iter()
            .filter(|dep| !loaded.contains(dep.as_str()))
            .cloned()
            .collect();
        if !missing.is_empty() {
            out.push((name.clone(), missing));
        }
    }
    out
}

/// Parse an embedded schema by name (regular or bridge).
pub fn load_embedded_schema(name: &str) -> Result<SchemaFile, Error> {
    let content = embedded_schema(name)
        .or_else(|| embedded_bridge(name))
        .ok_or_else(|| Error::Schema(format!("unknown built-in schema: {name}")))?;
    rivet_yaml::from_str(content)
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
        } else if let Some(content) = embedded_bridge(name) {
            // #530: bridges are loadable by explicit name too.
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

/// Parse the declared `version:` of a resolved schema. Returns an empty string
/// when the version can't be determined (unparseable on-disk file, or a
/// `Missing` schema). Shared by [`resolve_schema_provenance`] and the
/// `rivet schema sources` command so both surfaces report the same version.
pub fn schema_version_of(name: &str, source: &SchemaSource) -> String {
    match source {
        SchemaSource::OnDisk(p) => std::fs::read_to_string(p)
            .ok()
            .and_then(|c| rivet_yaml::from_str::<SchemaFile>(&c).ok())
            .map(|s| s.schema.version)
            .unwrap_or_default(),
        SchemaSource::Embedded => load_embedded_schema(name)
            .ok()
            .map(|s| s.schema.version)
            .unwrap_or_default(),
        SchemaSource::Missing => String::new(),
    }
}

/// A declared `schema-pins` entry whose pinned version differs from the version
/// actually resolved for a `rivet validate` (REQ-249, #431).
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SchemaPinMismatch {
    pub name: String,
    /// The version the project pinned in `rivet.yaml :: project.schema-pins`.
    pub pinned: String,
    /// The version actually resolved (embedded in this binary, or on-disk).
    pub resolved: String,
    /// `"embedded"` or `"on-disk"` — an embedded mismatch is the silent-upgrade
    /// case the pin exists to catch; on-disk means a vendored file drifted.
    pub source: &'static str,
}

/// Compare declared `schema-pins` against the versions actually resolved for a
/// `rivet validate` (REQ-249, #431). Returns one mismatch per pinned schema
/// whose resolved version differs from its pin, in a deterministic order (by
/// schema name). Pins for schemas that aren't in the resolved set are ignored —
/// there's nothing loaded to check. This is what makes an upgrade-induced
/// schema change loud instead of silent: the resolved embedded version moved
/// but the pin didn't.
pub fn check_schema_pins(
    pins: &std::collections::BTreeMap<String, String>,
    provenance: &[SchemaProvenance],
) -> Vec<SchemaPinMismatch> {
    let mut out: Vec<SchemaPinMismatch> = provenance
        .iter()
        .filter_map(|prov| {
            let pinned = pins.get(&prov.name)?;
            (pinned != &prov.version).then(|| SchemaPinMismatch {
                name: prov.name.clone(),
                pinned: pinned.clone(),
                resolved: prov.version.clone(),
                source: prov.source,
            })
        })
        .collect();
    out.sort_by(|a, b| a.name.cmp(&b.name));
    out
}

/// Expand a requested schema-name list to the full effective set the loader
/// uses: the requested names plus any auto-discovered bridge schemas (dedup'd,
/// order-preserving). Shared by `validate` and `rivet schema sources` so both
/// report the same set.
pub fn schema_names_with_bridges(schema_names: &[String]) -> Vec<String> {
    let mut names: Vec<String> = schema_names.to_vec();
    for bridge in discover_bridges(schema_names) {
        if !names.iter().any(|n| n == bridge) {
            names.push(bridge.to_string());
        }
    }
    names
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
    let names = schema_names_with_bridges(schema_names);

    schema_sources(&names, schemas_dir)
        .into_iter()
        .filter_map(|(name, source)| {
            if matches!(source, SchemaSource::Missing) {
                return None;
            }
            let version = schema_version_of(&name, &source);
            let path = match &source {
                SchemaSource::OnDisk(p) => Some(p.display().to_string()),
                _ => None,
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
            let file: SchemaFile = rivet_yaml::from_str(content)
                .map_err(|e| Error::Schema(format!("embedded '{name}': {e}")))?;
            files.push(file);
        } else if let Some(content) = embedded_bridge(name) {
            // #530: a consumer project may list a bundled bridge schema (e.g.
            // `stpa-dev.bridge`, `eu-ai-act-stpa.bridge`) by name in its
            // `schemas:` to pull the cross-domain links it needs. Bridges are
            // embedded, but resolution only auto-discovered them from the loaded
            // schema set and never resolved them by explicit name — so a
            // consumer's `schemas: [stpa-dev.bridge]` failed as "not found".
            let file: SchemaFile = rivet_yaml::from_str(content)
                .map_err(|e| Error::Schema(format!("embedded bridge '{name}': {e}")))?;
            files.push(file);
        } else {
            return Err(Error::Schema(format!(
                "schema '{name}' not found on disk ({}) or as an embedded schema \
                 or bridge. Built-in bridges are listed by their `<a>-<b>.bridge` \
                 stem (e.g. `stpa-dev.bridge`); run `rivet schema presets` to see \
                 declarable names.",
                schemas_dir.join(format!("{name}.yaml")).display()
            )));
        }
    }

    // REQ-356: a DECLARED bridge whose bases are not all loaded is an error, in
    // the same class as naming a schema that does not exist. Without this, the
    // declaration is not load-bearing: the bridge simply does not apply and the
    // project loses a tier of obligations in silence.
    let unsatisfied = unsatisfied_bridge_bases(schema_names, schemas_dir);
    if let Some((bridge, missing)) = unsatisfied.first() {
        return Err(Error::Schema(format!(
            "bridge schema '{bridge}' is declared in `schemas:` but does not apply: \
             it extends [{}], and {} not loaded. A bridge fires only when ALL of \
             its bases are present, so leaving this would silently drop the \
             obligations the bridge contributes. Either add the missing schema(s) \
             to `schemas:`, or remove '{bridge}' to state that this project does \
             not carry that tier.",
            missing_join(&extends_of(bridge, schemas_dir)),
            if missing.len() == 1 {
                format!("'{}' is", missing[0])
            } else {
                format!("[{}] are", missing_join(missing))
            }
        )));
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
            match rivet_yaml::from_str::<SchemaFile>(content) {
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
    // ── REQ-356: a declared bridge must actually fire ───────────────────
    //
    // A bridge applies only when ALL its base schemas are loaded, so the
    // loaded schema set is itself a rigour selector: dropping one line from
    // `project.schemas` removes a whole tier of obligations. Measured before
    // this landed, on a fixture with no artifacts so nothing unrelated could
    // fire:
    //
    //   [common, stpa, dev]              -> bridge loads,           exit 0
    //   [common, stpa]                   -> bridge silently gone,   exit 0
    //   [common, stpa, stpa-dev.bridge]  -> bridge DECLARED, base
    //                                       missing, silently gone, exit 0
    //   [common, stpa, not-a-schema]     -> error,                  exit 1
    //
    // The third row is the defect. Naming a bridge explicitly is the only way
    // a project can SAY it depends on that tier, and it bought nothing — the
    // declaration was not load-bearing. The fourth row is the precedent: the
    // loader already errors on a schema problem, so an unsatisfiable
    // declaration belongs in the same class.

    /// Declaring a bridge whose bases are all loaded must succeed.
    #[test]
    fn declared_bridge_with_all_bases_loaded_is_accepted() {
        let names: Vec<String> = ["common", "stpa", "dev", "stpa-dev.bridge"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        let missing = unsatisfied_bridge_bases(&names, std::path::Path::new("/nonexistent"));
        assert!(
            missing.is_empty(),
            "all bases are present, so nothing may be reported: {missing:?}"
        );
    }

    /// Declaring a bridge whose base is absent must be reported, naming the
    /// bridge AND the missing base — a message that says only "something is
    /// wrong" would leave the reader to re-derive what this test knows.
    // rivet: verifies REQ-356
    #[test]
    fn declared_bridge_with_a_missing_base_is_reported() {
        let names: Vec<String> = ["common", "stpa", "stpa-dev.bridge"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        let missing = unsatisfied_bridge_bases(&names, std::path::Path::new("/nonexistent"));
        assert_eq!(
            missing.len(),
            1,
            "exactly one unsatisfied bridge: {missing:?}"
        );
        assert_eq!(missing[0].0, "stpa-dev.bridge");
        assert_eq!(missing[0].1, vec!["dev".to_owned()]);
    }

    /// A bridge that is NOT declared must stay silent. Warning about every
    /// dormant bridge would fire on any legitimate partial schema set — a
    /// project loading only `stpa` would be told about six of them — and an
    /// alarm that fires on the normal case trains people to ignore it.
    #[test]
    fn an_undeclared_dormant_bridge_is_not_reported() {
        let names: Vec<String> = ["common", "stpa"].iter().map(|s| (*s).to_owned()).collect();
        let missing = unsatisfied_bridge_bases(&names, std::path::Path::new("/nonexistent"));
        assert!(
            missing.is_empty(),
            "only an EXPLICIT declaration is a promise; dormancy is not an error: {missing:?}"
        );
    }

    // ── REQ-359: local bridges are discoverable as a REPORT, never a load ──
    //
    // `discover_bridges` iterates the compiled-in BRIDGE_SCHEMAS list, so a
    // bridge file dropped into `schemas/` is unreachable by auto-discovery: an
    // on-disk file can only OVERRIDE a built-in name. Reproduced with both
    // bases loaded and schemas/local-demo.bridge.yaml present — zero mentions,
    // while the built-in stpa-dev.bridge auto-loaded from embedded beside it.
    //
    // The approved answer is NOT to make them auto-load. REQ-356 established
    // that a DECLARED bridge is checked; auto-discovery is the opposite, with
    // obligations appearing and disappearing by directory listing — the same
    // silent rigour-selection hazard one layer down, in exactly the repos
    // where a safety chain lives. So discovery becomes visible without
    // becoming implicit: find them, name them, and print the line to add.

    fn write_bridge(dir: &std::path::Path, stem: &str, extends: &str) {
        std::fs::create_dir_all(dir).expect("temp dir");
        std::fs::write(
            dir.join(format!("{stem}.yaml")),
            format!(
                "schema:\n  name: {stem}\n  version: \"0.1.0\"\n  extends: [{extends}]\nartifact-types: []\n"
            ),
        )
        .expect("write bridge");
    }

    // rivet: verifies REQ-359
    #[test]
    fn an_undeclared_local_bridge_is_reported_with_its_bases() {
        let dir = std::env::temp_dir().join(format!("rivet-loc-a-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        write_bridge(&dir, "local-demo.bridge", "stpa, dev");
        let names: Vec<String> = ["common", "stpa", "dev"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        let found = undeclared_local_bridges(&names, &dir);
        std::fs::remove_dir_all(&dir).ok();
        assert_eq!(
            found.len(),
            1,
            "the on-disk bridge must be found: {found:?}"
        );
        assert_eq!(found[0].0, "local-demo.bridge");
        assert!(
            found[0].1.is_empty(),
            "both bases are loaded, so nothing is missing"
        );
    }

    /// Reporting it must NOT load it. This is the whole point of the decision,
    /// so it gets an assertion rather than a comment: the returned list is
    /// informational and `discover_bridges` — which is what actually loads —
    /// must still not see the file.
    // rivet: verifies REQ-359
    #[test]
    fn reporting_a_local_bridge_does_not_make_it_load() {
        let dir = std::env::temp_dir().join(format!("rivet-loc-b-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        write_bridge(&dir, "local-demo.bridge", "stpa, dev");
        let names: Vec<String> = ["common", "stpa", "dev"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        assert_eq!(undeclared_local_bridges(&names, &dir).len(), 1);
        assert!(
            !discover_bridges(&names)
                .iter()
                .any(|b| b.contains("local-demo")),
            "auto-discovery must still be built-ins only — a report is not a load"
        );
        std::fs::remove_dir_all(&dir).ok();
    }

    /// A local bridge that IS declared is not "undeclared" — it would already
    /// be loaded, and REQ-356 already checks its bases.
    #[test]
    fn a_declared_local_bridge_is_not_reported_as_undeclared() {
        let dir = std::env::temp_dir().join(format!("rivet-loc-c-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        write_bridge(&dir, "local-demo.bridge", "stpa, dev");
        let names: Vec<String> = ["common", "stpa", "dev", "local-demo.bridge"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        let found = undeclared_local_bridges(&names, &dir);
        std::fs::remove_dir_all(&dir).ok();
        assert!(
            found.is_empty(),
            "a declared bridge is not undeclared: {found:?}"
        );
    }

    /// Missing bases are reported alongside, so the reader learns both that
    /// the file exists and what it would still need.
    #[test]
    fn an_undeclared_local_bridge_reports_its_missing_bases() {
        let dir = std::env::temp_dir().join(format!("rivet-loc-d-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        write_bridge(&dir, "local-demo.bridge", "stpa, dev");
        let names: Vec<String> = ["common", "stpa"].iter().map(|s| (*s).to_owned()).collect();
        let found = undeclared_local_bridges(&names, &dir);
        std::fs::remove_dir_all(&dir).ok();
        assert_eq!(found.len(), 1);
        assert_eq!(found[0].1, vec!["dev".to_owned()]);
    }

    /// A built-in whose file is vendored on disk must not be reported as a
    /// local discovery — it is already auto-discovered, and listing it would
    /// tell the reader to declare something that is already active.
    #[test]
    fn a_vendored_builtin_bridge_is_not_reported_as_local() {
        let dir = std::env::temp_dir().join(format!("rivet-loc-e-{}", std::process::id()));
        let _ = std::fs::remove_dir_all(&dir);
        write_bridge(&dir, "stpa-dev.bridge", "stpa, dev");
        let names: Vec<String> = ["common", "stpa", "dev"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        let found = undeclared_local_bridges(&names, &dir);
        std::fs::remove_dir_all(&dir).ok();
        assert!(
            found.is_empty(),
            "stpa-dev.bridge is a built-in and already auto-discovers: {found:?}"
        );
    }

    /// A PLAIN schema with an unloaded `extends` base must NOT be reported.
    ///
    /// This pins the scope boundary, and it was found by a surviving mutant:
    /// deleting the `.bridge` guard reddened nothing, which meant the guard's
    /// reason was unasserted. `stpa-sec` extends `stpa`, and a project may list
    /// it without `stpa` — that is an ordinary base-field relationship the
    /// loader already resolves, not a conjunction the project promised to
    /// satisfy. Reporting it here would reject working configurations for a
    /// defect this requirement is not about.
    #[test]
    fn a_plain_schema_with_an_unloaded_base_is_not_reported() {
        // Must be an ON-DISK schema. For an embedded non-bridge, `extends` is
        // never resolved at all (the lookup falls through BRIDGE_SCHEMAS and
        // continues), so the guard is unreachable by that route — a first
        // version of this test used embedded `stpa-sec` and stayed green with
        // the guard deleted, which is how the wrong route was found.
        let dir = std::env::temp_dir().join(format!("rivet-plain-{}", std::process::id()));
        std::fs::create_dir_all(&dir).expect("temp dir");
        let f = dir.join("local-plain.yaml");
        std::fs::write(
            &f,
            "schema:\n  name: local-plain\n  version: \"0.1.0\"\n  extends: [stpa]\nartifact-types: []\n",
        )
        .expect("write plain schema");
        let names: Vec<String> = ["common", "local-plain"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        let missing = unsatisfied_bridge_bases(&names, &dir);
        std::fs::remove_file(&f).ok();
        assert!(
            missing.is_empty(),
            "only `.bridge` schemas carry the all-bases-or-nothing promise; a plain \
             schema's extends is an ordinary base-field relationship the loader \
             already resolves, and reporting it would reject working configs: {missing:?}"
        );
    }

    /// The same rule must hold for a LOCAL bridge on disk, not just the
    /// compiled-in ones. Auto-discovery only ever considered `BRIDGE_SCHEMAS`,
    /// so a dropped-in bridge is invisible to it; an explicit declaration is
    /// the only way to load one, which makes this check its only safety net.
    // rivet: verifies REQ-356
    #[test]
    fn declared_local_bridge_with_a_missing_base_is_reported() {
        let dir = std::env::temp_dir().join(format!("rivet-bridge-{}", std::process::id()));
        std::fs::create_dir_all(&dir).expect("temp dir");
        let f = dir.join("local-demo.bridge.yaml");
        std::fs::write(
            &f,
            "schema:\n  name: local-demo-bridge\n  version: \"0.1.0\"\n  extends: [stpa, dev]\nartifact-types: []\n",
        )
        .expect("write local bridge");
        let names: Vec<String> = ["common", "stpa", "local-demo.bridge"]
            .iter()
            .map(|s| (*s).to_owned())
            .collect();
        let missing = unsatisfied_bridge_bases(&names, &dir);
        std::fs::remove_file(&f).ok();
        assert_eq!(
            missing.len(),
            1,
            "the on-disk bridge must be checked too: {missing:?}"
        );
        assert_eq!(missing[0].1, vec!["dev".to_owned()]);
    }

    use super::*;

    // REQ-249 (#431): schema-pin drift check flags a resolved version that
    // differs from the pin, ignores schemas with no pin or a matching pin, and
    // ignores pins for schemas not in the resolved set.
    // rivet: verifies REQ-249
    #[test]
    fn schema_pin_drift_is_detected() {
        let prov = |name: &str, version: &str| SchemaProvenance {
            name: name.to_string(),
            version: version.to_string(),
            source: "embedded",
            path: None,
        };
        let provenance = vec![prov("common", "0.4.0"), prov("aspice", "0.2.0")];
        let mut pins = std::collections::BTreeMap::new();
        pins.insert("common".to_string(), "0.3.0".to_string()); // drifted 0.3.0 -> 0.4.0
        pins.insert("aspice".to_string(), "0.2.0".to_string()); // matches → no mismatch
        pins.insert("stpa".to_string(), "9.9.9".to_string()); // not loaded → ignored

        let mismatches = check_schema_pins(&pins, &provenance);
        assert_eq!(mismatches.len(), 1, "only common drifted: {mismatches:?}");
        assert_eq!(mismatches[0].name, "common");
        assert_eq!(mismatches[0].pinned, "0.3.0");
        assert_eq!(mismatches[0].resolved, "0.4.0");
        assert_eq!(mismatches[0].source, "embedded");

        // No pins → no mismatches, regardless of resolved versions.
        assert!(check_schema_pins(&std::collections::BTreeMap::new(), &provenance).is_empty());
    }

    // rivet: verifies REQ-213
    #[test]
    fn every_embedded_preset_resolves_and_parses() {
        // The single-source array must stay self-consistent: every listed
        // name resolves via `embedded_schema`, parses as a SchemaFile, and is
        // surfaced by `embedded_schema_names`. Guards #510 (`schema presets`)
        // against a preset that lists but can't load (or vice-versa).
        let names: Vec<&str> = embedded_schema_names().collect();
        assert_eq!(names.len(), SCHEMA_NAMES.len());
        for standard in ["do-178c", "iso-26262", "iec-61508", "en-50128"] {
            assert!(
                names.contains(&standard),
                "preset list missing '{standard}'"
            );
        }
        for name in names {
            let content = embedded_schema(name)
                .unwrap_or_else(|| panic!("preset '{name}' has no embedded content"));
            assert!(!content.is_empty(), "preset '{name}' is empty");
            // Must parse — `schema presets` reads each one's version/types.
            load_embedded_schema(name)
                .unwrap_or_else(|e| panic!("preset '{name}' failed to parse: {e}"));
        }
    }

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

    // rivet: verifies REQ-205
    #[test]
    fn schema_version_of_reads_on_disk_embedded_and_missing() {
        let dir = tempfile::tempdir().unwrap();
        std::fs::write(
            dir.path().join("common.yaml"),
            "schema:\n  name: common\n  version: 9.9.9\n",
        )
        .unwrap();

        let on_disk = SchemaSource::OnDisk(dir.path().join("common.yaml"));
        assert_eq!(schema_version_of("common", &on_disk), "9.9.9");

        // A known embedded schema reports its compiled-in version.
        assert!(!schema_version_of("stpa", &SchemaSource::Embedded).is_empty());

        // Missing -> empty.
        assert_eq!(schema_version_of("made-up", &SchemaSource::Missing), "");
    }

    // rivet: verifies REQ-205
    #[test]
    fn schema_names_with_bridges_appends_discovered_bridges() {
        // stpa + dev should pull in the stpa-dev bridge (auto-discovered).
        let names = vec!["common".to_string(), "stpa".to_string(), "dev".to_string()];
        let expanded = schema_names_with_bridges(&names);
        // Original names are preserved and come first.
        assert_eq!(&expanded[..3], &names[..]);
        // At least one bridge was appended beyond the requested names.
        assert!(
            expanded.len() > names.len(),
            "expected bridge schemas to be appended, got {expanded:?}"
        );
        assert!(expanded.iter().any(|n| n.contains("bridge")));
    }

    // #530: a consumer project must be able to load a bundled bridge schema by
    // its `<a>-<b>.bridge` name in `schemas:` — previously only auto-discovered,
    // never resolvable by explicit name (failed as "not found").
    #[test]
    fn bundled_bridges_are_loadable_by_explicit_name() {
        let empty = std::path::Path::new("/nonexistent-schemas-dir");

        // The bridge resolves by name through the main loader (no on-disk dir).
        //
        // `dev` is in this list deliberately and must stay (REQ-356). The
        // fixture originally omitted it, which meant this test loaded a bridge
        // whose own link type was unusable: `constraint-satisfies` declares
        // `source-types: [requirement]`, and `requirement` is declared ONLY by
        // `dev`. Without `dev` the link type resolves to a source type no
        // loaded schema defines, so any artifact using it fails with
        // `unknown artifact type 'requirement'`. #530's point was that a
        // bundled bridge RESOLVES by explicit name, which this still asserts;
        // it was never that a bridge should apply without its bases.
        let names = vec![
            "common".to_string(),
            "stpa".to_string(),
            "dev".to_string(),
            "stpa-dev.bridge".to_string(),
        ];
        let schema = load_schemas_with_fallback(&names, empty)
            .expect("a bundled bridge must load by explicit name");
        // The bridge's own link types are present (it defines the cross-domain
        // links the consumer asked for — #530's `constraint-satisfies`).
        assert!(
            schema.link_types.contains_key("constraint-satisfies"),
            "the stpa-dev bridge's link types must be loaded, got {:?}",
            schema.link_types.keys().collect::<Vec<_>>()
        );

        // It also reports as Embedded (not Missing) in source resolution.
        let sources = schema_sources(&["stpa-dev.bridge".to_string()], empty);
        assert!(
            matches!(sources[0].1, SchemaSource::Embedded),
            "a bridge must resolve as Embedded by name, got {:?}",
            sources[0].1
        );

        // A genuinely unknown name still errors.
        assert!(load_schemas_with_fallback(&["no-such.bridge".to_string()], empty).is_err());

        // And the link type the bridge contributes is actually usable: its
        // source type is declared by a loaded schema. Asserting the link type
        // merely EXISTS is what let the incomplete fixture look correct.
        let lt = schema
            .link_types
            .get("constraint-satisfies")
            .expect("bridge link type");
        for src in &lt.source_types {
            assert!(
                schema.artifact_types.contains_key(src),
                "bridge link 'constraint-satisfies' names source type '{src}', which no \
                 loaded schema declares — the bridge is present but unusable"
            );
        }
    }
}
