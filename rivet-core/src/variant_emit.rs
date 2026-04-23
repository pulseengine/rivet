//! Emit a resolved variant as build-system-specific configuration.
//!
//! Given a `FeatureModel` plus a `ResolvedVariant`, render the effective
//! feature set and per-feature `attributes:` section as one of:
//!
//! - `json`       – structured, for downstream scripts
//! - `env`        – POSIX `export` lines, sourceable from a shell
//! - `cargo`      – `cargo:rustc-cfg=` / `cargo:rustc-env=` lines for `build.rs`
//! - `cmake`      – `set(...)` + `add_compile_definitions(...)`
//! - `cpp-header` – `#define` guarded by `RIVET_VARIANT_H`
//! - `bazel`      – `.bzl` constants (`RIVET_FEATURES`, `RIVET_ATTRS`)
//! - `make`       – Makefile-includable `:=` assignments
//!
//! Design decisions (matching the v0.4.3 variant-surface spec):
//! - **long, namespaced names** — every emitted identifier is prefixed
//!   `RIVET_FEATURE_` / `RIVET_ATTR_` so a project can embed several
//!   rivet models without collision.
//! - **both booleans and strings** — feature presence is emitted as a
//!   boolean-ish `1`, and every attribute key/value pair on a selected
//!   feature is emitted as its own long-named entry.
//! - **loud on shape mismatch** — non-scalar attribute values (lists,
//!   maps) are not silently flattened. JSON preserves them; every other
//!   formatter returns an `Error::Schema` so the caller sees the problem
//!   and can decide whether to simplify the attribute or add a new
//!   scalar key.

use std::collections::BTreeMap;
use std::fmt::Write as _;

use crate::error::Error;
use crate::feature_model::{FeatureModel, ResolvedVariant};

/// Output format for `rivet variant features`.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EmitFormat {
    Json,
    Env,
    Cargo,
    CMake,
    CppHeader,
    Bazel,
    Make,
}

impl EmitFormat {
    /// Parse the `--format` argument. Accepted tokens match the CLI help text.
    pub fn parse(s: &str) -> Result<Self, Error> {
        match s {
            "json" => Ok(Self::Json),
            "env" | "sh" => Ok(Self::Env),
            "cargo" => Ok(Self::Cargo),
            "cmake" => Ok(Self::CMake),
            "cpp-header" | "cpp" | "header" => Ok(Self::CppHeader),
            "bazel" | "bzl" => Ok(Self::Bazel),
            "make" | "makefile" => Ok(Self::Make),
            other => Err(Error::Schema(format!(
                "unknown --format `{other}`: expected one of json, env, cargo, cmake, cpp-header, bazel, make"
            ))),
        }
    }
}

/// Render a resolved variant in the requested format.
///
/// The model is consulted for each feature's `attributes:` entry; only
/// features present in `resolved.effective_features` are emitted.
pub fn emit(
    model: &FeatureModel,
    resolved: &ResolvedVariant,
    fmt: EmitFormat,
) -> Result<String, Error> {
    match fmt {
        EmitFormat::Json => emit_json(model, resolved),
        EmitFormat::Env => emit_env(model, resolved),
        EmitFormat::Cargo => emit_cargo(model, resolved),
        EmitFormat::CMake => emit_cmake(model, resolved),
        EmitFormat::CppHeader => emit_cpp_header(model, resolved),
        EmitFormat::Bazel => emit_bazel(model, resolved),
        EmitFormat::Make => emit_make(model, resolved),
    }
}

// ── Identifier slugging ────────────────────────────────────────────────

/// Uppercase, replace non-alphanumerics with `_`. Used for every emitted
/// identifier so `asil-c` / `c++` / `10-year-warranty` all map to sane
/// C/sh/Make identifier tokens.
///
/// This is loud rather than lossy: if two feature names collide after
/// slugging, both entries are still emitted (the caller's YAML is the
/// source of truth) but a future validator should flag the collision.
fn slug(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_uppercase());
        } else {
            out.push('_');
        }
    }
    out
}

// ── Attribute value rendering ──────────────────────────────────────────

/// Render a YAML attribute value as a scalar for non-JSON formatters.
///
/// Strings are emitted raw (quoting is the format's job), numbers and
/// booleans stringify via `Display`. Non-scalars (sequences, mappings)
/// return an error — JSON is the only format that preserves structure;
/// all others would have to invent a flattening convention, and doing
/// that silently has bitten users before. Callers surface the error so
/// the YAML author can choose an explicit representation.
fn attr_scalar(feature: &str, key: &str, v: &serde_yaml::Value) -> Result<String, Error> {
    match v {
        serde_yaml::Value::Null => Ok(String::new()),
        serde_yaml::Value::Bool(b) => Ok(if *b { "1".into() } else { "0".into() }),
        serde_yaml::Value::Number(n) => Ok(n.to_string()),
        serde_yaml::Value::String(s) => Ok(s.clone()),
        serde_yaml::Value::Sequence(_) | serde_yaml::Value::Mapping(_) => Err(Error::Schema(
            format!(
                "feature `{feature}` attribute `{key}`: non-scalar values (lists/maps) are only \
                 supported in --format json; split into multiple scalar keys or use the JSON \
                 formatter"
            ),
        )),
        serde_yaml::Value::Tagged(t) => attr_scalar(feature, key, &t.value),
    }
}

/// Shell-single-quote a value so `eval`/`source` round-trip safely.
fn sh_quote(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('\'');
    for ch in s.chars() {
        if ch == '\'' {
            out.push_str("'\\''");
        } else {
            out.push(ch);
        }
    }
    out.push('\'');
    out
}

// ── Walkers ────────────────────────────────────────────────────────────

/// Iterate effective features in deterministic (BTreeSet) order along
/// with each feature's attribute map. Features not present in the model
/// (defensive fallback) yield an empty map.
fn walk<'a>(
    model: &'a FeatureModel,
    resolved: &'a ResolvedVariant,
) -> impl Iterator<Item = (&'a str, &'a BTreeMap<String, serde_yaml::Value>)> + 'a {
    static EMPTY: std::sync::OnceLock<BTreeMap<String, serde_yaml::Value>> =
        std::sync::OnceLock::new();
    let empty = EMPTY.get_or_init(BTreeMap::new);
    resolved
        .effective_features
        .iter()
        .map(move |name| match model.features.get(name) {
            Some(f) => (name.as_str(), &f.attributes),
            None => (name.as_str(), empty),
        })
}

// ── Formatters ─────────────────────────────────────────────────────────

fn emit_json(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let attrs: serde_json::Map<String, serde_json::Value> = walk(model, resolved)
        .filter(|(_, attrs)| !attrs.is_empty())
        .map(|(name, attrs)| {
            let inner: serde_json::Map<String, serde_json::Value> = attrs
                .iter()
                .map(|(k, v)| (k.clone(), yaml_to_json(v)))
                .collect();
            (name.to_string(), serde_json::Value::Object(inner))
        })
        .collect();
    let output = serde_json::json!({
        "variant": resolved.name,
        "features": resolved.effective_features,
        "attributes": attrs,
    });
    serde_json::to_string_pretty(&output)
        .map(|mut s| { s.push('\n'); s })
        .map_err(|e| Error::Schema(format!("json serialization: {e}")))
}

fn yaml_to_json(v: &serde_yaml::Value) -> serde_json::Value {
    match v {
        serde_yaml::Value::Null => serde_json::Value::Null,
        serde_yaml::Value::Bool(b) => serde_json::Value::Bool(*b),
        serde_yaml::Value::Number(n) => {
            if let Some(i) = n.as_i64() {
                serde_json::json!(i)
            } else if let Some(u) = n.as_u64() {
                serde_json::json!(u)
            } else if let Some(f) = n.as_f64() {
                serde_json::Number::from_f64(f)
                    .map(serde_json::Value::Number)
                    .unwrap_or(serde_json::Value::Null)
            } else {
                serde_json::Value::Null
            }
        }
        serde_yaml::Value::String(s) => serde_json::Value::String(s.clone()),
        serde_yaml::Value::Sequence(items) => {
            serde_json::Value::Array(items.iter().map(yaml_to_json).collect())
        }
        serde_yaml::Value::Mapping(m) => {
            let mut out = serde_json::Map::new();
            for (k, v) in m {
                let key = match k {
                    serde_yaml::Value::String(s) => s.clone(),
                    other => serde_yaml::to_string(other).unwrap_or_default().trim().to_string(),
                };
                out.insert(key, yaml_to_json(v));
            }
            serde_json::Value::Object(out)
        }
        serde_yaml::Value::Tagged(t) => yaml_to_json(&t.value),
    }
}

fn emit_env(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let mut out = String::new();
    writeln!(out, "# rivet variant features (env) — variant={}", resolved.name).unwrap();
    for (name, attrs) in walk(model, resolved) {
        writeln!(out, "export RIVET_FEATURE_{}=1", slug(name)).unwrap();
        for (key, value) in attrs {
            let v = attr_scalar(name, key, value)?;
            writeln!(
                out,
                "export RIVET_ATTR_{}_{}={}",
                slug(name),
                slug(key),
                sh_quote(&v)
            )
            .unwrap();
        }
    }
    Ok(out)
}

fn emit_cargo(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let mut out = String::new();
    writeln!(out, "# rivet variant features (cargo) — variant={}", resolved.name).unwrap();
    writeln!(out, "cargo:rustc-env=RIVET_VARIANT={}", resolved.name).unwrap();
    for (name, attrs) in walk(model, resolved) {
        writeln!(out, "cargo:rustc-cfg=rivet_feature=\"{}\"", name).unwrap();
        writeln!(out, "cargo:rustc-env=RIVET_FEATURE_{}=1", slug(name)).unwrap();
        for (key, value) in attrs {
            let v = attr_scalar(name, key, value)?;
            writeln!(
                out,
                "cargo:rustc-env=RIVET_ATTR_{}_{}={}",
                slug(name),
                slug(key),
                v
            )
            .unwrap();
        }
    }
    Ok(out)
}

fn emit_cmake(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let mut out = String::new();
    writeln!(out, "# rivet variant features (cmake) — variant={}", resolved.name).unwrap();
    writeln!(out, "set(RIVET_VARIANT \"{}\")", resolved.name).unwrap();
    let mut defs: Vec<String> = Vec::new();
    for (name, attrs) in walk(model, resolved) {
        writeln!(out, "set(RIVET_FEATURE_{} ON)", slug(name)).unwrap();
        defs.push(format!("RIVET_FEATURE_{}=1", slug(name)));
        for (key, value) in attrs {
            let v = attr_scalar(name, key, value)?;
            writeln!(
                out,
                "set(RIVET_ATTR_{}_{} \"{}\")",
                slug(name),
                slug(key),
                v.replace('"', "\\\"")
            )
            .unwrap();
            defs.push(format!("RIVET_ATTR_{}_{}={}", slug(name), slug(key), v));
        }
    }
    writeln!(out, "add_compile_definitions({})", defs.join(" ")).unwrap();
    Ok(out)
}

fn emit_cpp_header(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let mut out = String::new();
    writeln!(out, "// rivet variant features (cpp-header) — variant={}", resolved.name).unwrap();
    writeln!(out, "#ifndef RIVET_VARIANT_H").unwrap();
    writeln!(out, "#define RIVET_VARIANT_H").unwrap();
    writeln!(out, "#define RIVET_VARIANT \"{}\"", resolved.name).unwrap();
    for (name, attrs) in walk(model, resolved) {
        writeln!(out, "#define RIVET_FEATURE_{} 1", slug(name)).unwrap();
        for (key, value) in attrs {
            let v = attr_scalar(name, key, value)?;
            // numeric values emit bare; strings get quoted
            let rhs = if v.parse::<i64>().is_ok() || v.parse::<f64>().is_ok() {
                v
            } else {
                format!("\"{}\"", v.replace('"', "\\\""))
            };
            writeln!(out, "#define RIVET_ATTR_{}_{} {}", slug(name), slug(key), rhs).unwrap();
        }
    }
    writeln!(out, "#endif").unwrap();
    Ok(out)
}

fn emit_bazel(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let mut out = String::new();
    writeln!(out, "# rivet variant features (bazel) — variant={}", resolved.name).unwrap();
    writeln!(out, "RIVET_VARIANT = \"{}\"", resolved.name).unwrap();
    writeln!(
        out,
        "RIVET_FEATURES = [{}]",
        resolved
            .effective_features
            .iter()
            .map(|n| format!("\"{}\"", n))
            .collect::<Vec<_>>()
            .join(", ")
    )
    .unwrap();
    writeln!(out, "RIVET_ATTRS = {{").unwrap();
    for (name, attrs) in walk(model, resolved) {
        if attrs.is_empty() {
            continue;
        }
        writeln!(out, "    \"{}\": {{", name).unwrap();
        for (key, value) in attrs {
            let v = attr_scalar(name, key, value)?;
            let rhs = if v.parse::<i64>().is_ok() {
                v
            } else {
                format!("\"{}\"", v.replace('"', "\\\""))
            };
            writeln!(out, "        \"{}\": {},", key, rhs).unwrap();
        }
        writeln!(out, "    }},").unwrap();
    }
    writeln!(out, "}}").unwrap();
    Ok(out)
}

fn emit_make(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let mut out = String::new();
    writeln!(out, "# rivet variant features (make) — variant={}", resolved.name).unwrap();
    writeln!(out, "RIVET_VARIANT := {}", resolved.name).unwrap();
    writeln!(
        out,
        "RIVET_FEATURES := {}",
        resolved
            .effective_features
            .iter()
            .cloned()
            .collect::<Vec<_>>()
            .join(" ")
    )
    .unwrap();
    for (name, attrs) in walk(model, resolved) {
        writeln!(out, "RIVET_FEATURE_{} := 1", slug(name)).unwrap();
        for (key, value) in attrs {
            let v = attr_scalar(name, key, value)?;
            writeln!(out, "RIVET_ATTR_{}_{} := {}", slug(name), slug(key), v).unwrap();
        }
    }
    Ok(out)
}

// ── Tests ──────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::feature_model::FeatureModel;

    fn tiny_model() -> (FeatureModel, ResolvedVariant) {
        let yaml = r#"
root: rt
features:
  rt:
    group: mandatory
    children: [core, asil-c]
  core:
    group: leaf
    attributes:
      version: "1.2.3"
  asil-c:
    group: leaf
    attributes:
      asil-numeric: 3
      reqs: "fmea-dfa"
"#;
        let model = FeatureModel::from_yaml(yaml).expect("parses");
        let variant = crate::feature_model::VariantConfig {
            name: "prod".into(),
            selects: vec!["core".into(), "asil-c".into()],
        };
        let resolved = crate::feature_model::solve(&model, &variant).expect("solves");
        (model, resolved)
    }

    #[test]
    fn slug_handles_dashes_and_unicode() {
        assert_eq!(slug("asil-c"), "ASIL_C");
        assert_eq!(slug("c++"), "C__");
        assert_eq!(slug("10-year"), "10_YEAR");
    }

    #[test]
    fn env_format_emits_long_prefixed_names() {
        let (model, resolved) = tiny_model();
        let out = emit(&model, &resolved, EmitFormat::Env).unwrap();
        assert!(out.contains("export RIVET_FEATURE_CORE=1"));
        assert!(out.contains("export RIVET_FEATURE_ASIL_C=1"));
        assert!(out.contains("export RIVET_ATTR_ASIL_C_ASIL_NUMERIC='3'"));
        assert!(out.contains("export RIVET_ATTR_ASIL_C_REQS='fmea-dfa'"));
    }

    #[test]
    fn cargo_format_emits_rustc_cfg_and_env() {
        let (model, resolved) = tiny_model();
        let out = emit(&model, &resolved, EmitFormat::Cargo).unwrap();
        assert!(out.contains("cargo:rustc-env=RIVET_VARIANT=prod"));
        assert!(out.contains("cargo:rustc-cfg=rivet_feature=\"asil-c\""));
        assert!(out.contains("cargo:rustc-env=RIVET_FEATURE_ASIL_C=1"));
        assert!(out.contains("cargo:rustc-env=RIVET_ATTR_ASIL_C_ASIL_NUMERIC=3"));
    }

    #[test]
    fn cmake_format_emits_set_and_add_compile_definitions() {
        let (model, resolved) = tiny_model();
        let out = emit(&model, &resolved, EmitFormat::CMake).unwrap();
        assert!(out.contains("set(RIVET_FEATURE_CORE ON)"));
        assert!(out.contains("add_compile_definitions("));
        assert!(out.contains("RIVET_FEATURE_ASIL_C=1"));
    }

    #[test]
    fn cpp_header_numeric_unquoted_string_quoted() {
        let (model, resolved) = tiny_model();
        let out = emit(&model, &resolved, EmitFormat::CppHeader).unwrap();
        assert!(out.contains("#define RIVET_ATTR_ASIL_C_ASIL_NUMERIC 3"));
        assert!(out.contains("#define RIVET_ATTR_ASIL_C_REQS \"fmea-dfa\""));
        assert!(out.contains("#ifndef RIVET_VARIANT_H"));
    }

    #[test]
    fn bazel_format_emits_dict_of_attrs() {
        let (model, resolved) = tiny_model();
        let out = emit(&model, &resolved, EmitFormat::Bazel).unwrap();
        assert!(out.contains("RIVET_FEATURES = ["));
        assert!(out.contains("\"asil-c\":"));
        assert!(out.contains("\"asil-numeric\": 3"));
    }

    #[test]
    fn make_format_emits_colon_equals() {
        let (model, resolved) = tiny_model();
        let out = emit(&model, &resolved, EmitFormat::Make).unwrap();
        assert!(out.contains("RIVET_VARIANT := prod"));
        assert!(out.contains("RIVET_FEATURE_CORE := 1"));
        assert!(out.contains("RIVET_ATTR_ASIL_C_ASIL_NUMERIC := 3"));
    }

    #[test]
    fn json_format_preserves_attribute_structure() {
        let (model, resolved) = tiny_model();
        let out = emit(&model, &resolved, EmitFormat::Json).unwrap();
        let v: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert_eq!(v["variant"], "prod");
        assert_eq!(v["attributes"]["asil-c"]["asil-numeric"], 3);
        assert_eq!(v["attributes"]["core"]["version"], "1.2.3");
    }

    #[test]
    fn non_scalar_attr_is_loud_in_non_json_formats() {
        let yaml = r#"
root: rt
features:
  rt:
    group: mandatory
    children: [c]
  c:
    group: leaf
    attributes:
      deps: [a, b]
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();
        let variant = crate::feature_model::VariantConfig {
            name: "v".into(),
            selects: vec!["c".into()],
        };
        let resolved = crate::feature_model::solve(&model, &variant).unwrap();
        // Non-scalar is an error in every format except JSON
        for fmt in [
            EmitFormat::Env,
            EmitFormat::Cargo,
            EmitFormat::CMake,
            EmitFormat::CppHeader,
            EmitFormat::Bazel,
            EmitFormat::Make,
        ] {
            let err = emit(&model, &resolved, fmt).unwrap_err();
            let msg = format!("{err}");
            assert!(msg.contains("non-scalar"), "expected loud error, got: {msg}");
        }
        // JSON preserves the list
        let out = emit(&model, &resolved, EmitFormat::Json).unwrap();
        let v: serde_json::Value = serde_json::from_str(&out).unwrap();
        assert_eq!(v["attributes"]["c"]["deps"], serde_json::json!(["a", "b"]));
    }

    #[test]
    fn sh_quote_escapes_single_quotes() {
        assert_eq!(sh_quote("plain"), "'plain'");
        assert_eq!(sh_quote("it's"), "'it'\\''s'");
    }

    #[test]
    fn parse_format_accepts_aliases() {
        assert_eq!(EmitFormat::parse("sh").unwrap(), EmitFormat::Env);
        assert_eq!(EmitFormat::parse("cpp").unwrap(), EmitFormat::CppHeader);
        assert_eq!(EmitFormat::parse("header").unwrap(), EmitFormat::CppHeader);
        assert_eq!(EmitFormat::parse("makefile").unwrap(), EmitFormat::Make);
        assert!(EmitFormat::parse("toml").is_err());
    }
}
