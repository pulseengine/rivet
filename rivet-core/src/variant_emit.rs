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
        serde_yaml::Value::Sequence(_) | serde_yaml::Value::Mapping(_) => {
            Err(Error::Schema(format!(
                "feature `{feature}` attribute `{key}`: non-scalar values (lists/maps) are only \
                 supported in --format json; split into multiple scalar keys or use the JSON \
                 formatter"
            )))
        }
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
        .map(|mut s| {
            s.push('\n');
            s
        })
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
                    other => serde_yaml::to_string(other)
                        .unwrap_or_default()
                        .trim()
                        .to_string(),
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
    writeln!(
        out,
        "# rivet variant features (env) — variant={}",
        resolved.name
    )
    .unwrap();
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
    writeln!(
        out,
        "# rivet variant features (cargo) — variant={}",
        resolved.name
    )
    .unwrap();
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
    writeln!(
        out,
        "# rivet variant features (cmake) — variant={}",
        resolved.name
    )
    .unwrap();
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
    writeln!(
        out,
        "// rivet variant features (cpp-header) — variant={}",
        resolved.name
    )
    .unwrap();
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
            writeln!(
                out,
                "#define RIVET_ATTR_{}_{} {}",
                slug(name),
                slug(key),
                rhs
            )
            .unwrap();
        }
    }
    writeln!(out, "#endif").unwrap();
    Ok(out)
}

fn emit_bazel(model: &FeatureModel, resolved: &ResolvedVariant) -> Result<String, Error> {
    let mut out = String::new();
    writeln!(
        out,
        "# rivet variant features (bazel) — variant={}",
        resolved.name
    )
    .unwrap();
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
    writeln!(
        out,
        "# rivet variant features (make) — variant={}",
        resolved.name
    )
    .unwrap();
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

// ══ CI matrix emission ═════════════════════════════════════════════════
//
// Given a `FeatureModel` + a `FeatureBinding` (which carries a list of
// `VariantConfig`), build one `MatrixEntry` per variant and render them
// as a target-CI matrix fragment. Currently only `github-actions` is
// implemented; the `MatrixSpec` IR is designed so GitLab `parallel:matrix:`
// and Azure `strategy.matrix:` emitters can plug in as ~40-line
// functions over the same spec.
//
// Design (see `.rivet/mythos/variant-matrix-design.md`): one variant =
// one `include:` entry. Attributes prefixed `attr_` to dodge GHA-reserved
// keys. Features comma-joined string so `${{ matrix.features }}` is
// scalar-substitutable in `run:` steps.

use crate::feature_model::{FeatureBinding, FeatureModel as FMStruct, solve};

/// One entry in a CI matrix — corresponds to one rivet variant.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MatrixEntry {
    /// Variant name, unchanged from the binding file.
    pub variant: String,
    /// Effective features, in deterministic order, to be rendered as a
    /// comma-joined scalar.
    pub features: Vec<String>,
    /// Scalar attributes sourced from the root feature's `attributes:` map.
    /// Keys are already slugged; values already stringified.
    pub attrs: BTreeMap<String, String>,
    /// Optional CI runner label. `None` means "use default runner".
    pub runner: Option<String>,
}

/// An enumerated CI matrix — one entry per variant, in binding-file order.
#[derive(Debug, Clone, PartialEq, Eq, Default)]
pub struct MatrixSpec {
    pub variants: Vec<MatrixEntry>,
}

impl MatrixSpec {
    pub fn len(&self) -> usize {
        self.variants.len()
    }

    pub fn is_empty(&self) -> bool {
        self.variants.is_empty()
    }
}

/// Filters controlling which variants land in the matrix.
#[derive(Debug, Clone, Default)]
pub struct MatrixFilters {
    /// If non-empty, only include variants whose name exactly matches one
    /// of these entries. (v1: no glob support — use shell for wildcards.)
    pub variants: Vec<String>,
    /// AND-combined attribute equality filters, e.g. ("asil", "C").
    /// Each filter looks up the named key on the variant's `attrs` map.
    pub attrs: Vec<(String, String)>,
    /// Name of the root-feature attribute whose value becomes `runner:`.
    /// Default: `ci-runner`.
    pub runner_attr: String,
    /// Fallback runner label when the runner attribute is absent.
    pub default_runner: Option<String>,
}

/// Build a `MatrixSpec` by solving every `VariantConfig` in the binding
/// and collecting one entry per successful solve.
///
/// Returns `Err` on the first variant that fails to solve. Use
/// `rivet variant check-all` first if you want to diagnose which
/// variants are broken.
pub fn build_matrix_spec(
    model: &FMStruct,
    binding: &FeatureBinding,
    filters: &MatrixFilters,
) -> Result<MatrixSpec, Error> {
    let runner_attr_slug = if filters.runner_attr.is_empty() {
        "ci-runner".to_string()
    } else {
        filters.runner_attr.clone()
    };

    let mut out = MatrixSpec::default();

    for vc in &binding.variants {
        // Filter by variant name.
        if !filters.variants.is_empty() && !filters.variants.iter().any(|n| n == &vc.name) {
            continue;
        }

        let resolved = solve(model, vc).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| format!("{e}")).collect();
            Error::Schema(format!(
                "variant `{}` failed to solve:\n  {}",
                vc.name,
                msgs.join("\n  ")
            ))
        })?;

        let entry = build_matrix_entry(model, &vc.name, &resolved, &runner_attr_slug)?;

        // Filter by attribute equality (AND).
        let mut keep = true;
        for (k, v) in &filters.attrs {
            let have = entry.attrs.get(k).map(String::as_str).unwrap_or("");
            if have != v.as_str() {
                keep = false;
                break;
            }
        }
        if !keep {
            continue;
        }

        out.variants.push(entry);
    }

    // Apply default runner fallback.
    if let Some(default) = &filters.default_runner {
        for e in out.variants.iter_mut() {
            if e.runner.is_none() {
                e.runner = Some(default.clone());
            }
        }
    }

    Ok(out)
}

/// Extract a single MatrixEntry from a solved variant.
///
/// Attributes come from the ROOT feature's `attributes:` map (the first
/// feature in the model, always Mandatory). Non-scalar attributes are
/// rejected via `attr_scalar`. The runner attribute (if present) is
/// pulled out into `entry.runner` and omitted from `entry.attrs` so it
/// isn't double-emitted under `attr_runner`.
fn build_matrix_entry(
    model: &FMStruct,
    name: &str,
    resolved: &ResolvedVariant,
    runner_attr: &str,
) -> Result<MatrixEntry, Error> {
    let root_name = &model.root;
    let root_attrs = model
        .features
        .get(root_name)
        .map(|f| &f.attributes)
        .cloned()
        .unwrap_or_default();

    let mut attrs = BTreeMap::new();
    let mut runner: Option<String> = None;

    for (key, val) in root_attrs.iter() {
        let scalar = attr_scalar(root_name, key, val)?;
        if key == runner_attr {
            runner = Some(scalar);
        } else {
            attrs.insert(attr_slug(key), scalar);
        }
    }

    let features: Vec<String> = resolved.effective_features.iter().cloned().collect();

    Ok(MatrixEntry {
        variant: name.to_string(),
        features,
        attrs,
        runner,
    })
}

/// Lowercase slug for matrix-attribute keys. Same shape as `slug()` but
/// preserves case-insensitivity so `asil-c` and `ASIL-C` don't collide
/// with different casings. Non-alphanumerics collapse to `_`.
fn attr_slug(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for ch in s.chars() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch.to_ascii_lowercase());
        } else {
            out.push('_');
        }
    }
    out
}

/// How to frame the emitted GHA YAML.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum GhaWrap {
    /// Emit only the `strategy:` block. Composes into a user's workflow.
    Fragment,
    /// Wrap in a minimal `jobs.build:` skeleton with a `checkout` step.
    /// The user fills in the build steps.
    Job,
}

/// Options for `emit_matrix_github_actions`.
#[derive(Debug, Clone)]
pub struct GhaOpts {
    pub wrap: GhaWrap,
    /// Emit `fail-fast: false` (default true, matches the recommendation
    /// that one variant failure must not cancel peers).
    pub fail_fast_off: bool,
    /// Header comment lines (typically source-file paths, variant counts).
    /// Each line is prefixed with `# ` on emission.
    pub header_comments: Vec<String>,
}

impl Default for GhaOpts {
    fn default() -> Self {
        Self {
            wrap: GhaWrap::Fragment,
            fail_fast_off: true,
            header_comments: Vec::new(),
        }
    }
}

/// Render a `MatrixSpec` as a GitHub Actions `strategy.matrix:` fragment.
pub fn emit_matrix_github_actions(spec: &MatrixSpec, opts: &GhaOpts) -> String {
    let mut out = String::new();
    for line in &opts.header_comments {
        writeln!(&mut out, "# {line}").ok();
    }

    // Produce the strategy/matrix block with appropriate indentation.
    // - Fragment: strategy: starts at column 0
    // - Job:      strategy: is a child of jobs.build, so column 4 (2-space
    //             YAML indent × 2 levels)
    let (indent, job_prelude) = match opts.wrap {
        GhaWrap::Fragment => ("", String::new()),
        GhaWrap::Job => (
            "    ",
            String::from(
                "jobs:\n\
                 \x20\x20build:\n\
                 \x20\x20\x20\x20runs-on: ${{ matrix.runner }}\n\
                 \x20\x20\x20\x20steps:\n\
                 \x20\x20\x20\x20\x20\x20- uses: actions/checkout@v4\n",
            ),
        ),
    };

    out.push_str(&job_prelude);
    writeln!(&mut out, "{indent}strategy:").ok();
    if opts.fail_fast_off {
        writeln!(&mut out, "{indent}  fail-fast: false").ok();
    }
    writeln!(&mut out, "{indent}  matrix:").ok();
    writeln!(&mut out, "{indent}    include:").ok();

    for entry in &spec.variants {
        writeln!(&mut out, "{indent}      - variant: {}", entry.variant).ok();
        writeln!(
            &mut out,
            "{indent}        features: \"{}\"",
            entry.features.join(",")
        )
        .ok();
        for (k, v) in &entry.attrs {
            writeln!(
                &mut out,
                "{indent}        attr_{}: \"{}\"",
                k,
                escape_yaml_scalar(v)
            )
            .ok();
        }
        if let Some(runner) = &entry.runner {
            writeln!(&mut out, "{indent}        runner: {runner}").ok();
        }
    }

    out
}

/// Minimal YAML scalar escape: double-quote any `"` inside a value we
/// already wrap in double quotes. Sufficient for rivet's attribute
/// values (strings, numbers, bools) — YAML spec is richer but we don't
/// need it.
fn escape_yaml_scalar(s: &str) -> String {
    s.replace('\\', "\\\\").replace('"', "\\\"")
}

/// Header-comment lines shared across all matrix emitters.
#[derive(Debug, Clone, Default)]
pub struct MatrixCommonOpts {
    pub header_comments: Vec<String>,
}

/// Render a `MatrixSpec` as a GitLab CI `parallel.matrix:` fragment.
///
/// The output is a `test:` job with a `parallel:` matrix where each
/// entry is one variant. GitLab treats each map under `matrix:` as a
/// distinct job — when every value is a scalar (not an array), the
/// entry produces exactly one job. Users will typically rename `test:`
/// and add their own `script:` / `stage:` fields.
///
/// Variable naming: UPPERCASE convention matching CI environment
/// variable practice. Attributes are `ATTR_<KEY>:` to dodge collisions
/// with GitLab-reserved variable names like `CI_*`.
pub fn emit_matrix_gitlab(spec: &MatrixSpec, opts: &MatrixCommonOpts) -> String {
    let mut out = String::new();
    for line in &opts.header_comments {
        writeln!(&mut out, "# {line}").ok();
    }
    writeln!(&mut out, "test:").ok();
    writeln!(&mut out, "  parallel:").ok();
    writeln!(&mut out, "    matrix:").ok();
    for entry in &spec.variants {
        writeln!(&mut out, "      - VARIANT: {}", entry.variant).ok();
        writeln!(
            &mut out,
            "        FEATURES: \"{}\"",
            entry.features.join(",")
        )
        .ok();
        for (k, v) in &entry.attrs {
            writeln!(
                &mut out,
                "        ATTR_{}: \"{}\"",
                k.to_uppercase(),
                escape_yaml_scalar(v)
            )
            .ok();
        }
        if let Some(runner) = &entry.runner {
            writeln!(&mut out, "        RUNNER: {runner}").ok();
        }
    }
    out
}

/// Render a `MatrixSpec` as an Azure DevOps `strategy.matrix:` fragment.
///
/// Azure's matrix is a *map* of job-name → variable-map, unlike GitHub
/// Actions (list of include entries) and GitLab (list of variable maps).
/// Each top-level key becomes a parallel job. Variant names are
/// converted to Azure-acceptable job keys by replacing `-` with `_`
/// (Azure requires `[A-Za-z][A-Za-z0-9_]*`).
pub fn emit_matrix_azure(spec: &MatrixSpec, opts: &MatrixCommonOpts) -> String {
    let mut out = String::new();
    for line in &opts.header_comments {
        writeln!(&mut out, "# {line}").ok();
    }
    writeln!(&mut out, "strategy:").ok();
    writeln!(&mut out, "  matrix:").ok();
    for entry in &spec.variants {
        let job_key = azure_job_key(&entry.variant);
        writeln!(&mut out, "    {job_key}:").ok();
        writeln!(&mut out, "      VARIANT: {}", entry.variant).ok();
        writeln!(&mut out, "      FEATURES: \"{}\"", entry.features.join(",")).ok();
        for (k, v) in &entry.attrs {
            writeln!(
                &mut out,
                "      ATTR_{}: \"{}\"",
                k.to_uppercase(),
                escape_yaml_scalar(v)
            )
            .ok();
        }
        if let Some(runner) = &entry.runner {
            writeln!(&mut out, "      RUNNER: {runner}").ok();
        }
    }
    out
}

/// Convert a variant name to an Azure-acceptable job-key:
/// `[A-Za-z][A-Za-z0-9_]*`. Replaces hyphens and other punctuation with
/// underscores. Prepends `J_` if the name starts with a digit.
fn azure_job_key(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    for (i, ch) in s.chars().enumerate() {
        if ch.is_ascii_alphanumeric() {
            out.push(ch);
        } else {
            out.push('_');
        }
        if i == 0 && ch.is_ascii_digit() {
            // Recover: prepend J_ in front of the digit just pushed.
            let leading = out.remove(0);
            out.insert_str(0, "J_");
            out.push(leading);
        }
    }
    out
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
            assert!(
                msg.contains("non-scalar"),
                "expected loud error, got: {msg}"
            );
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

    // ── Matrix tests ────────────────────────────────────────────────

    fn matrix_model_yaml() -> &'static str {
        r#"
kind: feature-model
root: product
features:
  product:
    group: mandatory
    children: [scope]
    attributes:
      asil: "QM"
      ci-runner: "ubuntu-latest"
      description: "Tiny matrix test model"
  scope:
    group: alternative
    children: [tiny, full]
  tiny:
    group: leaf
  full:
    group: leaf
constraints: []
"#
    }

    fn matrix_binding_yaml() -> &'static str {
        r#"
bindings: {}
variants:
  - name: "tiny-ci"
    selects: ["tiny"]
  - name: "full-ci"
    selects: ["full"]
"#
    }

    fn load_matrix_fixture() -> (FMStruct, FeatureBinding) {
        let model = FeatureModel::from_yaml(matrix_model_yaml()).expect("parse model");
        let binding: FeatureBinding =
            serde_yaml::from_str(matrix_binding_yaml()).expect("parse binding");
        (model, binding)
    }

    #[test]
    fn matrix_build_produces_one_entry_per_variant() {
        let (model, binding) = load_matrix_fixture();
        let spec =
            build_matrix_spec(&model, &binding, &MatrixFilters::default()).expect("matrix builds");
        assert_eq!(spec.len(), 2);
        assert_eq!(spec.variants[0].variant, "tiny-ci");
        assert_eq!(spec.variants[1].variant, "full-ci");
    }

    #[test]
    fn matrix_entry_carries_effective_features() {
        let (model, binding) = load_matrix_fixture();
        let spec = build_matrix_spec(&model, &binding, &MatrixFilters::default()).unwrap();
        // effective_features contains the root + the selected child.
        let tiny = &spec.variants[0];
        assert!(tiny.features.contains(&"tiny".to_string()));
        assert!(tiny.features.contains(&"product".to_string()));
        assert!(!tiny.features.contains(&"full".to_string()));
    }

    #[test]
    fn matrix_entry_extracts_root_attrs_and_runner() {
        let (model, binding) = load_matrix_fixture();
        let spec = build_matrix_spec(&model, &binding, &MatrixFilters::default()).unwrap();
        let tiny = &spec.variants[0];
        // ci-runner promoted out of attrs into the runner field.
        assert_eq!(tiny.runner.as_deref(), Some("ubuntu-latest"));
        assert!(!tiny.attrs.contains_key("ci_runner"));
        // Other scalar attrs stay.
        assert_eq!(tiny.attrs.get("asil"), Some(&"QM".to_string()));
        assert_eq!(
            tiny.attrs.get("description"),
            Some(&"Tiny matrix test model".to_string())
        );
    }

    #[test]
    fn matrix_filter_by_variant_name() {
        let (model, binding) = load_matrix_fixture();
        let filters = MatrixFilters {
            variants: vec!["full-ci".to_string()],
            ..Default::default()
        };
        let spec = build_matrix_spec(&model, &binding, &filters).unwrap();
        assert_eq!(spec.len(), 1);
        assert_eq!(spec.variants[0].variant, "full-ci");
    }

    #[test]
    fn matrix_filter_by_attr() {
        let (model, binding) = load_matrix_fixture();
        // Everything has asil=QM, so this filter keeps all.
        let filters = MatrixFilters {
            attrs: vec![("asil".to_string(), "QM".to_string())],
            ..Default::default()
        };
        assert_eq!(
            build_matrix_spec(&model, &binding, &filters).unwrap().len(),
            2
        );
        // A non-matching attr value drops everything.
        let filters = MatrixFilters {
            attrs: vec![("asil".to_string(), "D".to_string())],
            ..Default::default()
        };
        assert_eq!(
            build_matrix_spec(&model, &binding, &filters).unwrap().len(),
            0
        );
    }

    #[test]
    fn matrix_default_runner_applies_when_attr_absent() {
        // Build a model that has NO ci-runner attribute.
        let model_yaml = r#"
kind: feature-model
root: product
features:
  product:
    group: mandatory
    children: [scope]
    attributes:
      asil: "QM"
  scope:
    group: alternative
    children: [tiny]
  tiny:
    group: leaf
constraints: []
"#;
        let binding_yaml = r#"
bindings: {}
variants:
  - name: "t"
    selects: ["tiny"]
"#;
        let model = FeatureModel::from_yaml(model_yaml).unwrap();
        let binding: FeatureBinding = serde_yaml::from_str(binding_yaml).unwrap();
        let filters = MatrixFilters {
            default_runner: Some("macos-latest".to_string()),
            ..Default::default()
        };
        let spec = build_matrix_spec(&model, &binding, &filters).unwrap();
        assert_eq!(spec.variants[0].runner.as_deref(), Some("macos-latest"));
    }

    #[test]
    fn matrix_github_actions_emits_expected_shape() {
        let (model, binding) = load_matrix_fixture();
        let spec = build_matrix_spec(&model, &binding, &MatrixFilters::default()).unwrap();
        let opts = GhaOpts {
            header_comments: vec!["Generated by: rivet variant matrix".to_string()],
            ..Default::default()
        };
        let out = emit_matrix_github_actions(&spec, &opts);
        // Header comment present.
        assert!(out.contains("# Generated by: rivet variant matrix"));
        // Top-level strategy with fail-fast: false.
        assert!(out.contains("strategy:"));
        assert!(out.contains("fail-fast: false"));
        // Each variant as an include entry.
        assert!(out.contains("- variant: tiny-ci"));
        assert!(out.contains("- variant: full-ci"));
        // Attributes prefixed attr_.
        assert!(out.contains("attr_asil: \"QM\""));
        // Runner key at its own level.
        assert!(out.contains("runner: ubuntu-latest"));
        // Output must round-trip as valid YAML.
        let _: serde_yaml::Value = serde_yaml::from_str(&out).expect("emitted YAML parses");
    }

    #[test]
    fn matrix_github_actions_job_wrap_adds_skeleton() {
        let (model, binding) = load_matrix_fixture();
        let spec = build_matrix_spec(&model, &binding, &MatrixFilters::default()).unwrap();
        let opts = GhaOpts {
            wrap: GhaWrap::Job,
            ..Default::default()
        };
        let out = emit_matrix_github_actions(&spec, &opts);
        assert!(out.contains("jobs:"));
        assert!(out.contains("build:"));
        assert!(out.contains("runs-on: ${{ matrix.runner }}"));
        assert!(out.contains("actions/checkout@v4"));
        let _: serde_yaml::Value = serde_yaml::from_str(&out).expect("job-wrapped YAML parses");
    }

    #[test]
    fn matrix_attr_slug_collapses_specials() {
        assert_eq!(attr_slug("asil"), "asil");
        assert_eq!(attr_slug("ASIL-C"), "asil_c");
        assert_eq!(attr_slug("os"), "os"); // bare; `attr_` prefix is applied at emit time
        assert_eq!(attr_slug("10-year-warranty"), "10_year_warranty");
    }

    #[test]
    fn matrix_github_actions_fail_fast_off_by_default() {
        let (model, binding) = load_matrix_fixture();
        let spec = build_matrix_spec(&model, &binding, &MatrixFilters::default()).unwrap();
        let out = emit_matrix_github_actions(&spec, &GhaOpts::default());
        assert!(out.contains("fail-fast: false"));
    }

    #[test]
    fn matrix_gitlab_emits_parallel_matrix_shape() {
        let (model, binding) = load_matrix_fixture();
        let spec = build_matrix_spec(&model, &binding, &MatrixFilters::default()).unwrap();
        let out = emit_matrix_gitlab(&spec, &MatrixCommonOpts::default());
        assert!(out.contains("test:"));
        assert!(out.contains("parallel:"));
        assert!(out.contains("matrix:"));
        // Each entry is a list-item map with VARIANT/FEATURES/RUNNER scalars.
        assert!(out.contains("- VARIANT: tiny-ci"));
        assert!(out.contains("- VARIANT: full-ci"));
        // Attributes uppercase + ATTR_-prefixed.
        assert!(out.contains("ATTR_ASIL: \"QM\""));
        assert!(out.contains("RUNNER: ubuntu-latest"));
        // Round-trip parse.
        let _: serde_yaml::Value = serde_yaml::from_str(&out).expect("gitlab YAML parses");
    }

    #[test]
    fn matrix_azure_emits_strategy_matrix_map() {
        let (model, binding) = load_matrix_fixture();
        let spec = build_matrix_spec(&model, &binding, &MatrixFilters::default()).unwrap();
        let out = emit_matrix_azure(&spec, &MatrixCommonOpts::default());
        assert!(out.contains("strategy:"));
        assert!(out.contains("matrix:"));
        // Top-level map keys per variant. Hyphens become underscores per
        // Azure's identifier rule.
        assert!(out.contains("tiny_ci:"));
        assert!(out.contains("full_ci:"));
        // Variables nested under each job-key.
        assert!(out.contains("VARIANT: tiny-ci"));
        assert!(out.contains("VARIANT: full-ci"));
        assert!(out.contains("ATTR_ASIL: \"QM\""));
        // Round-trip parse.
        let _: serde_yaml::Value = serde_yaml::from_str(&out).expect("azure YAML parses");
    }

    #[test]
    fn azure_job_key_normalises_punctuation() {
        assert_eq!(azure_job_key("tiny-ci"), "tiny_ci");
        assert_eq!(azure_job_key("eu_autonomous"), "eu_autonomous");
        assert_eq!(azure_job_key("v1.0"), "v1_0");
        // Leading digit gets a J_ prefix so the key is a valid identifier.
        assert_eq!(azure_job_key("1tiny"), "J_1tiny");
    }
}
