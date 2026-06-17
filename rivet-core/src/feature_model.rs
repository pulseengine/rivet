//! Feature model schema and propositional constraint solver (PLE Phase 3).
//!
//! Implements a FODA-style feature tree with group types, variant
//! configuration, boolean constraint propagation, and feature-to-artifact
//! binding.

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

use std::collections::{BTreeMap, BTreeSet, VecDeque};
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::error::Error;
use crate::sexpr_eval::{self, Expr};

// ── Feature model ──────────────────────────────────────────────────────

/// A FODA-style feature model: a rooted tree of features with group
/// types and cross-tree constraints expressed as s-expressions.
#[derive(Debug, Clone)]
pub struct FeatureModel {
    pub root: String,
    pub features: BTreeMap<String, Feature>,
    pub constraints: Vec<Expr>,
    /// Optional per-attribute type declarations. Empty when no
    /// `attribute-schema:` section was provided in the YAML.
    ///
    /// When non-empty, every feature attribute whose key appears in this
    /// schema is checked at load time: type, range, enum membership,
    /// required-presence. Attribute keys absent from the schema produce
    /// a warning (not an error) so new keys can be introduced before the
    /// schema is updated.
    pub attribute_schema: BTreeMap<String, AttributeTypeDecl>,
    /// Warnings collected during load (e.g. unknown attribute keys).
    /// Distinct from `Error` returns: load succeeded, but the schema
    /// audit is non-empty. Callers can surface these via `--strict` or
    /// log them on every load.
    pub attribute_warnings: Vec<String>,
}

// ── Typed attribute schema (Gap 1) ─────────────────────────────────────

/// A single attribute type declaration in the optional
/// `attribute-schema:` section of a feature-model YAML.
///
/// Deliberately narrow: only the four scalar types plus `enum`. PV's full
/// 15-type hierarchy (ps:url, ps:datetime, ps:element, ...) is out of
/// scope — see `docs/pure-variants-comparison.md` Gap 1 for rationale.
#[derive(Debug, Clone, PartialEq)]
pub struct AttributeTypeDecl {
    pub kind: AttributeKind,
    /// `true` means the attribute MUST appear on every feature whose
    /// type-schema mentions the key. Default `false`.
    pub required: bool,
}

/// The closed set of attribute types Rivet understands.
#[derive(Debug, Clone, PartialEq)]
pub enum AttributeKind {
    Bool,
    Int {
        /// Optional `[lo, hi]` inclusive range constraint.
        range: Option<(i64, i64)>,
    },
    Float {
        /// Optional `[lo, hi]` inclusive range constraint.
        range: Option<(f64, f64)>,
    },
    Str,
    /// Enum: attribute value must be one of `values` (string match).
    Enum {
        values: Vec<String>,
    },
}

/// A single feature in the tree.
#[derive(Debug, Clone)]
pub struct Feature {
    pub name: String,
    pub group: GroupType,
    pub children: Vec<String>,
    pub parent: Option<String>,
    /// Typed key-value attributes attached to this feature. Looked up
    /// by `rivet variant attr FEATURE KEY` and by the formatters when
    /// emitting build-system-specific outputs. Values are kept as
    /// `serde_yaml::Value` so a feature can carry strings, integers,
    /// booleans, or small sub-maps without a schema change up front.
    ///
    /// Example: `asil-c` might declare `{ asil-numeric: 3, reqs: "fmea-dfa" }`
    /// so a release script can emit `-DASIL_NUMERIC=3 -DREQS=fmea-dfa`.
    pub attributes: BTreeMap<String, serde_yaml::Value>,
}

/// Group semantics governing child selection.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum GroupType {
    /// All children required when parent is selected.
    Mandatory,
    /// Children are individually selectable.
    Optional,
    /// Exactly one child must be selected (XOR).
    Alternative,
    /// At least one child must be selected.
    Or,
    /// Terminal feature — no children.
    Leaf,
}

// ── Variant configuration ──────────────────────────────────────────────

/// User-level variant configuration: a named selection of features.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VariantConfig {
    pub name: String,
    pub selects: Vec<String>,
}

impl VariantConfig {
    /// Parse a variant config from EITHER the flat form (`name:` / `selects:`
    /// at the top level) OR the feature-model-bindings form that `rivet
    /// variant init` scaffolds, where the same fields live under a top-level
    /// `variant:` key alongside `bindings:`. Accepting both lets `rivet
    /// variant check --variant <file>` work on the file `init` actually writes
    /// (#514): the two used to disagree (init wrapped, check expected flat).
    pub fn from_yaml_str(yaml: &str) -> Result<Self, serde_yaml::Error> {
        match serde_yaml::from_str::<VariantConfig>(yaml) {
            Ok(vc) => Ok(vc),
            Err(flat_err) => {
                #[derive(Deserialize)]
                struct Wrapped {
                    variant: VariantConfig,
                }
                // Fall back to the wrapped form; if that also fails, surface the
                // flat error — it's the more direct diagnostic for a config the
                // caller likely intended as flat.
                serde_yaml::from_str::<Wrapped>(yaml)
                    .map(|w| w.variant)
                    .map_err(|_| flat_err)
            }
        }
    }
}

/// Origin of a feature in a resolved variant — why did the solver
/// include it in the effective set?
///
/// This is reported per-feature so downstream tooling can distinguish
/// user intent from solver-driven choices. Pain point #8: flat lists
/// hid whether a feature was picked by the user, auto-selected via a
/// mandatory group, or pulled in by a constraint.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum FeatureOrigin {
    /// User picked this feature explicitly via `selects:`.
    UserSelected,
    /// Forced in because an ancestor group is `mandatory`, or because
    /// this is the root feature (root is always selected).
    Mandatory,
    /// A constraint (`implies X Y` and similar) propagated the
    /// selection from the named feature.
    ImpliedBy(String),
    /// Present in the model and allowed but not actively chosen by the
    /// user, group semantics, or a constraint. Surfaced for reporting
    /// only — the solver never materialises "allowed-but-unbound"
    /// features into `effective_features`; this variant exists so that
    /// future reporting (e.g. showing `optional` siblings that could
    /// still be toggled) has a slot.
    AllowedButUnbound,
}

/// Result of solving a variant against a feature model.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResolvedVariant {
    pub name: String,
    pub effective_features: BTreeSet<String>,
    /// Per-feature origin for every entry in `effective_features`.
    ///
    /// Keys mirror `effective_features`; the map is populated for new
    /// callers that want to distinguish user-selected, mandatory, and
    /// constraint-implied features. Empty for manually-constructed
    /// `ResolvedVariant` values (backwards-compatible default).
    pub origins: BTreeMap<String, FeatureOrigin>,
    /// Per-feature resolved source manifest.
    ///
    /// Maps every effective feature with a binding to the list of
    /// source globs whose `when:` predicate evaluated to true (or had no
    /// `when:` at all). This is the "Variant Result Model" equivalent
    /// that safety audits ask for — "which files participated in this
    /// variant?". Populated by `solve_with_bindings`; empty when the
    /// solver was called without a binding model (existing `solve` path).
    pub source_manifest: BTreeMap<String, Vec<PathBuf>>,
}

// ── Feature-to-artifact binding ────────────────────────────────────────

/// Maps features to artifact IDs and source globs.
///
/// May also carry a list of variant configurations that `rivet variant
/// check-all` iterates. Absent means "no declared variants" — check-all
/// reports an empty pass.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FeatureBinding {
    pub bindings: BTreeMap<String, Binding>,
    #[serde(default)]
    pub variants: Vec<VariantConfig>,
}

/// Artifacts and source files associated with a feature.
///
/// `source` accepts either a bare string (legacy shape, treated as a glob
/// with no `when:` predicate) or a `{ glob, when }` map for per-source
/// restrictions — see Gap 5 in `docs/pure-variants-comparison.md`. The
/// untagged enum makes both shapes parse from the same field.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Binding {
    #[serde(default)]
    pub artifacts: Vec<String>,
    #[serde(default)]
    pub source: Vec<SourceEntry>,
}

/// One source entry inside a feature binding.
///
/// Backward-compatible: a bare string in YAML deserialises to
/// `SourceEntry { glob: "...", when: None }`. The struct form
/// `{ glob, when }` adds an optional s-expression predicate evaluated
/// against the resolved feature set at solve time.
///
/// The `when:` predicate is parsed with `sexpr_eval::parse_filter` at
/// load time; parse errors are surfaced as `Error::Schema` with the
/// binding name, expression text, and underlying parser message.
#[derive(Debug, Clone, PartialEq, Serialize)]
pub struct SourceEntry {
    pub glob: String,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub when: Option<String>,
}

impl<'de> Deserialize<'de> for SourceEntry {
    fn deserialize<D: serde::Deserializer<'de>>(d: D) -> Result<Self, D::Error> {
        // Two YAML shapes:
        //   - "src/foo/**"                    (legacy)
        //   - { glob: "src/foo/**", when: ... }
        // We hand-roll deserialisation rather than using #[serde(untagged)]
        // because the latter swallows the inner error message — and these
        // bindings are exactly where users want a clear error.
        #[derive(Deserialize)]
        #[serde(untagged)]
        enum Repr {
            Bare(String),
            Struct {
                glob: String,
                #[serde(default)]
                when: Option<String>,
            },
        }
        match Repr::deserialize(d)? {
            Repr::Bare(s) => Ok(SourceEntry {
                glob: s,
                when: None,
            }),
            Repr::Struct { glob, when } => Ok(SourceEntry { glob, when }),
        }
    }
}

// ── YAML persistence ───────────────────────────────────────────────────

/// On-disk YAML representation of a feature model.
#[derive(Debug, Deserialize)]
struct FeatureModelYaml {
    #[allow(dead_code)]
    kind: Option<String>,
    root: String,
    #[serde(default)]
    features: BTreeMap<String, FeatureYaml>,
    #[serde(default)]
    constraints: Vec<String>,
    /// Optional typed attribute declarations. See `AttributeTypeDecl`.
    #[serde(default, rename = "attribute-schema")]
    attribute_schema: BTreeMap<String, AttributeTypeDeclYaml>,
}

#[derive(Debug, Deserialize)]
struct FeatureYaml {
    #[serde(default = "default_group")]
    group: GroupType,
    #[serde(default)]
    children: Vec<String>,
    #[serde(default)]
    attributes: BTreeMap<String, serde_yaml::Value>,
}

/// On-disk YAML shape for an attribute-schema entry.
///
/// `type` selects between `bool`, `int`, `float`, `string`, `enum`. The
/// other fields are conditionally present depending on `type`:
///   - `range: [lo, hi]` for `int` and `float`
///   - `values: [v1, v2, ...]` for `enum`
///   - `required: true` to make presence mandatory (default `false`)
#[derive(Debug, Deserialize)]
struct AttributeTypeDeclYaml {
    #[serde(rename = "type")]
    ty: String,
    #[serde(default)]
    range: Option<Vec<serde_yaml::Value>>,
    #[serde(default)]
    values: Option<Vec<String>>,
    #[serde(default)]
    required: bool,
}

fn default_group() -> GroupType {
    GroupType::Leaf
}

// ── Feature-model composition (REQ-083) ────────────────────────────────

/// On-disk YAML for a `feature-model-binding` file: declares how
/// standalone feature-model files compose into one resolved tree.
///
/// Each `compose` entry names a parent model file and the sub-models
/// mounted onto its features. A sub-model may itself appear as another
/// entry's `parent`, giving arbitrary-depth composition.
#[derive(Debug, Deserialize)]
struct FeatureModelBindingYaml {
    #[allow(dead_code)]
    kind: Option<String>,
    #[serde(default)]
    compose: Vec<ComposeEntryYaml>,
}

/// One parent model plus the sub-models mounted onto its features.
#[derive(Debug, Deserialize)]
struct ComposeEntryYaml {
    /// Path to the parent feature-model file, relative to the binding file.
    parent: String,
    /// Maps a feature name in the parent model (the mount point) to the
    /// sub-model mounted there.
    #[serde(default)]
    mount: BTreeMap<String, MountYaml>,
}

/// A single mount: which sub-model file, under which prefix.
#[derive(Debug, Deserialize)]
struct MountYaml {
    /// Path to the sub-model feature-model file, relative to the binding file.
    model: String,
    /// Prefix applied to every feature of the sub-model: the sub-model's
    /// feature `f` becomes `prefix:f` in the composed tree, so one
    /// sub-model can be mounted under several parents without collision.
    prefix: String,
}

/// Resolve a mount's `model:` path (REQ-085).
///
/// - `<external-prefix>:<inner-path>` where `<external-prefix>` is a key
///   in `externals` resolves to `externals[<external-prefix>].join(<inner-path>)`.
///   This is how cross-repo composition rides the existing `rivet sync`
///   plumbing: the consumer's `rivet.yaml` already declares + syncs the
///   external repo, and the binding only names the prefix.
/// - Any other path is `base_dir.join(model_path)` as before.
/// - An unknown prefix (the `:` form, no match in `externals`, and
///   `externals` is non-empty) is a hard error — the F2 silent-failure
///   ethos: a typo'd or missing external must not silently fall back to
///   a local path that won't exist.
fn resolve_model_path(
    model_path: &str,
    base_dir: &std::path::Path,
    externals: &BTreeMap<String, std::path::PathBuf>,
) -> Result<std::path::PathBuf, Error> {
    if let Some((prefix, rest)) = model_path.split_once(':') {
        if let Some(root) = externals.get(prefix) {
            return Ok(root.join(rest));
        }
        let prefix_is_external_shaped = !prefix.is_empty()
            && prefix
                .chars()
                .all(|c| c.is_ascii_alphanumeric() || c == '-' || c == '_');
        if !externals.is_empty() && prefix_is_external_shaped {
            let declared: Vec<&str> = externals.keys().map(String::as_str).collect();
            return Err(Error::Schema(format!(
                "feature-model-binding: mount `{model_path}` references external prefix \
                 `{prefix}` which is not declared (declared externals: [{}])",
                declared.join(", ")
            )));
        }
    }
    Ok(base_dir.join(model_path))
}

/// Load `model_path` (resolved against `base_dir` or `externals`) as raw
/// YAML, then recursively splice in every sub-model the binding mounts
/// onto it. `path` tracks the current recursion chain so a cyclic
/// composition fails loudly instead of recursing forever.
fn load_and_splice(
    model_path: &str,
    base_dir: &std::path::Path,
    entries: &BTreeMap<&str, &ComposeEntryYaml>,
    externals: &BTreeMap<String, std::path::PathBuf>,
    path: &mut BTreeSet<String>,
) -> Result<FeatureModelYaml, Error> {
    if !path.insert(model_path.to_string()) {
        return Err(Error::Schema(format!(
            "feature-model-binding: composition cycle through model `{model_path}`"
        )));
    }
    let full = resolve_model_path(model_path, base_dir, externals)?;
    let src = std::fs::read_to_string(&full)
        .map_err(|e| Error::Schema(format!("feature-model file `{}`: {e}", full.display())))?;
    let mut raw: FeatureModelYaml = serde_yaml::from_str(&src)
        .map_err(|e| Error::Schema(format!("feature-model file `{}`: {e}", full.display())))?;

    if let Some(entry) = entries.get(model_path) {
        for (mount_point, mount) in &entry.mount {
            let sub = load_and_splice(&mount.model, base_dir, entries, externals, path)?;
            let prefixed = prefix_model_yaml(sub, &mount.prefix);
            splice_into(&mut raw, mount_point, prefixed, model_path)?;
        }
    }
    path.remove(model_path);
    Ok(raw)
}

/// Splice a fully-composed, already-prefixed sub-model into `parent` at
/// the mount-point feature `mount_point`.
fn splice_into(
    parent: &mut FeatureModelYaml,
    mount_point: &str,
    sub: FeatureModelYaml,
    parent_path: &str,
) -> Result<(), Error> {
    let mp = parent.features.get_mut(mount_point).ok_or_else(|| {
        Error::Schema(format!(
            "feature-model-binding: mount point `{mount_point}` is not a feature \
             in parent model `{parent_path}`"
        ))
    })?;
    if mp.group == GroupType::Leaf {
        return Err(Error::Schema(format!(
            "feature-model-binding: mount point `{mount_point}` in `{parent_path}` is \
             `group: leaf`; declare it `group: mandatory` (or optional/alternative/or) \
             so the sub-model can attach"
        )));
    }
    mp.children.push(sub.root.clone());

    for (name, feat) in sub.features {
        if parent.features.contains_key(&name) {
            return Err(Error::Schema(format!(
                "feature-model-binding: composed feature `{name}` collides with an \
                 existing feature — a mount prefix is not unique enough"
            )));
        }
        parent.features.insert(name, feat);
    }
    parent.constraints.extend(sub.constraints);
    for (key, decl) in sub.attribute_schema {
        if parent.attribute_schema.contains_key(&key) {
            return Err(Error::Schema(format!(
                "feature-model-binding: attribute-schema key `{key}` is declared by \
                 more than one composed model"
            )));
        }
        parent.attribute_schema.insert(key, decl);
    }
    Ok(())
}

/// Prefix every feature of a sub-model with `prefix:` — feature-map keys,
/// child references, the root, and bare feature-name tokens inside
/// constraint strings. Attribute-schema keys are attribute names, not
/// feature names, and are left untouched.
fn prefix_model_yaml(raw: FeatureModelYaml, prefix: &str) -> FeatureModelYaml {
    // Only names defined by THIS model are rewritten inside constraints.
    let mut names: BTreeSet<String> = raw.features.keys().cloned().collect();
    names.insert(raw.root.clone());
    let pfx = |n: &str| format!("{prefix}:{n}");

    let features = raw
        .features
        .into_iter()
        .map(|(name, mut fy)| {
            fy.children = fy.children.iter().map(|c| pfx(c)).collect();
            (pfx(&name), fy)
        })
        .collect();

    let constraints = raw
        .constraints
        .iter()
        .map(|c| prefix_constraint(c, prefix, &names))
        .collect();

    FeatureModelYaml {
        kind: raw.kind,
        root: pfx(&raw.root),
        features,
        constraints,
        attribute_schema: raw.attribute_schema,
    }
}

/// Rewrite every bare feature-name token in a constraint string to its
/// prefixed form. Tokens are maximal runs of non-whitespace, non-paren
/// characters; only tokens that exactly match a feature name of the
/// sub-model being prefixed are rewritten, so operators (`implies`,
/// `and`, ...) and parentheses pass through untouched.
fn prefix_constraint(src: &str, prefix: &str, names: &BTreeSet<String>) -> String {
    let mut out = String::new();
    let mut tok = String::new();
    for ch in src.chars() {
        if ch.is_whitespace() || ch == '(' || ch == ')' {
            flush_constraint_token(&mut tok, prefix, names, &mut out);
            out.push(ch);
        } else {
            tok.push(ch);
        }
    }
    flush_constraint_token(&mut tok, prefix, names, &mut out);
    out
}

fn flush_constraint_token(
    tok: &mut String,
    prefix: &str,
    names: &BTreeSet<String>,
    out: &mut String,
) {
    if tok.is_empty() {
        return;
    }
    if names.contains(tok.as_str()) {
        out.push_str(prefix);
        out.push(':');
    }
    out.push_str(tok);
    tok.clear();
}

/// Build an `AttributeTypeDecl` from the YAML shape, applying narrow
/// validation. Errors include the attribute key and the offending field
/// for downstream debuggability.
fn build_attribute_decl(
    key: &str,
    raw: &AttributeTypeDeclYaml,
) -> Result<AttributeTypeDecl, Error> {
    let kind = match raw.ty.as_str() {
        "bool" | "boolean" => AttributeKind::Bool,
        "int" | "integer" => {
            let range = match &raw.range {
                None => None,
                Some(r) if r.len() == 2 => {
                    let lo = yaml_to_i64(&r[0]).ok_or_else(|| {
                        Error::Schema(format!(
                            "attribute-schema `{key}`: range[0] must be an integer (got {:?})",
                            r[0]
                        ))
                    })?;
                    let hi = yaml_to_i64(&r[1]).ok_or_else(|| {
                        Error::Schema(format!(
                            "attribute-schema `{key}`: range[1] must be an integer (got {:?})",
                            r[1]
                        ))
                    })?;
                    if lo > hi {
                        return Err(Error::Schema(format!(
                            "attribute-schema `{key}`: range [{lo}, {hi}] has lo > hi"
                        )));
                    }
                    Some((lo, hi))
                }
                Some(other) => {
                    return Err(Error::Schema(format!(
                        "attribute-schema `{key}`: range must be [lo, hi] (got {} elements)",
                        other.len()
                    )));
                }
            };
            AttributeKind::Int { range }
        }
        "float" | "double" => {
            let range = match &raw.range {
                None => None,
                Some(r) if r.len() == 2 => {
                    let lo = yaml_to_f64(&r[0]).ok_or_else(|| {
                        Error::Schema(format!(
                            "attribute-schema `{key}`: range[0] must be a number (got {:?})",
                            r[0]
                        ))
                    })?;
                    let hi = yaml_to_f64(&r[1]).ok_or_else(|| {
                        Error::Schema(format!(
                            "attribute-schema `{key}`: range[1] must be a number (got {:?})",
                            r[1]
                        ))
                    })?;
                    if lo > hi {
                        return Err(Error::Schema(format!(
                            "attribute-schema `{key}`: range [{lo}, {hi}] has lo > hi"
                        )));
                    }
                    Some((lo, hi))
                }
                Some(other) => {
                    return Err(Error::Schema(format!(
                        "attribute-schema `{key}`: range must be [lo, hi] (got {} elements)",
                        other.len()
                    )));
                }
            };
            AttributeKind::Float { range }
        }
        "string" | "str" => AttributeKind::Str,
        "enum" => {
            let values = raw.values.clone().ok_or_else(|| {
                Error::Schema(format!(
                    "attribute-schema `{key}`: enum type requires `values: [..]`"
                ))
            })?;
            if values.is_empty() {
                return Err(Error::Schema(format!(
                    "attribute-schema `{key}`: enum `values:` must list at least one allowed value"
                )));
            }
            AttributeKind::Enum { values }
        }
        other => {
            return Err(Error::Schema(format!(
                "attribute-schema `{key}`: unknown type `{other}` \
                 (allowed: bool, int, float, string, enum)"
            )));
        }
    };
    Ok(AttributeTypeDecl {
        kind,
        required: raw.required,
    })
}

fn yaml_to_i64(v: &serde_yaml::Value) -> Option<i64> {
    match v {
        serde_yaml::Value::Number(n) => n.as_i64(),
        _ => None,
    }
}

fn yaml_to_f64(v: &serde_yaml::Value) -> Option<f64> {
    match v {
        serde_yaml::Value::Number(n) => n.as_f64(),
        _ => None,
    }
}

/// Check a single attribute value against its declared type. Returns a
/// formatted message on mismatch; None on success.
///
/// The message names the feature, the attribute key, the declared type
/// (rendered as YAML for readability), and what was actually received.
fn check_attribute_value(
    feature: &str,
    key: &str,
    decl: &AttributeTypeDecl,
    value: &serde_yaml::Value,
) -> Option<String> {
    match (&decl.kind, value) {
        (AttributeKind::Bool, serde_yaml::Value::Bool(_)) => None,
        (AttributeKind::Bool, other) => Some(format!(
            "feature `{feature}` attribute `{key}`: schema declares type=bool, got {}",
            describe_yaml(other)
        )),
        (AttributeKind::Int { range }, serde_yaml::Value::Number(n)) if n.is_i64() => {
            // serde_yaml::Number::is_i64 also returns true for u64s that
            // fit in i64; the as_i64 below normalises both.
            let v = n.as_i64()?;
            if let Some((lo, hi)) = range {
                if v < *lo || v > *hi {
                    return Some(format!(
                        "feature `{feature}` attribute `{key}`: \
                         value {v} out of declared range [{lo}, {hi}]"
                    ));
                }
            }
            None
        }
        (AttributeKind::Int { .. }, other) => Some(format!(
            "feature `{feature}` attribute `{key}`: schema declares type=int, got {}",
            describe_yaml(other)
        )),
        (AttributeKind::Float { range }, serde_yaml::Value::Number(n)) => {
            let v = n.as_f64()?;
            if let Some((lo, hi)) = range {
                if v < *lo || v > *hi {
                    return Some(format!(
                        "feature `{feature}` attribute `{key}`: \
                         value {v} out of declared range [{lo}, {hi}]"
                    ));
                }
            }
            None
        }
        (AttributeKind::Float { .. }, other) => Some(format!(
            "feature `{feature}` attribute `{key}`: schema declares type=float, got {}",
            describe_yaml(other)
        )),
        (AttributeKind::Str, serde_yaml::Value::String(_)) => None,
        (AttributeKind::Str, other) => Some(format!(
            "feature `{feature}` attribute `{key}`: schema declares type=string, got {}",
            describe_yaml(other)
        )),
        (AttributeKind::Enum { values }, serde_yaml::Value::String(s)) => {
            if values.iter().any(|v| v == s) {
                None
            } else {
                Some(format!(
                    "feature `{feature}` attribute `{key}`: \
                     value `{s}` not in declared enum [{}]",
                    values.join(", ")
                ))
            }
        }
        (AttributeKind::Enum { values }, other) => Some(format!(
            "feature `{feature}` attribute `{key}`: \
             schema declares type=enum [{}], got {}",
            values.join(", "),
            describe_yaml(other)
        )),
    }
}

fn describe_yaml(v: &serde_yaml::Value) -> String {
    match v {
        serde_yaml::Value::Null => "null".into(),
        serde_yaml::Value::Bool(b) => format!("bool({b})"),
        serde_yaml::Value::Number(n) => {
            if n.is_i64() {
                format!("int({n})")
            } else {
                format!("float({n})")
            }
        }
        serde_yaml::Value::String(s) => format!("string({s:?})"),
        serde_yaml::Value::Sequence(_) => "sequence".into(),
        serde_yaml::Value::Mapping(_) => "mapping".into(),
        serde_yaml::Value::Tagged(_) => "tagged".into(),
    }
}

/// Preprocess a feature constraint string: replace bare feature names
/// with `(has-tag "name")` so the s-expression parser accepts them.
/// The solver later interprets HasTag as "feature is selected".
fn preprocess_feature_constraint(src: &str, features: &BTreeMap<String, Feature>) -> String {
    let tokens = crate::sexpr::lex(src);
    let mut result = String::new();
    for token in &tokens {
        if token.kind == crate::sexpr::SyntaxKind::Symbol {
            let name = token.text;
            // Known forms pass through unchanged.
            if matches!(
                name,
                "and"
                    | "or"
                    | "not"
                    | "implies"
                    | "excludes"
                    | "forall"
                    | "exists"
                    | "="
                    | "!="
                    | ">"
                    | "<"
                    | ">="
                    | "<="
                    | "has-tag"
                    | "has-field"
                    | "in"
                    | "linked-by"
                    | "linked-from"
                    | "linked-to"
                    | "links-count"
                    | "matches"
                    | "contains"
                    | "reachable-from"
                    | "reachable-to"
                    | "count"
            ) {
                result.push_str(name);
            } else if features.contains_key(name) {
                // Bare feature name → (has-tag "name")
                result.push_str(&format!("(has-tag \"{name}\")"));
            } else {
                result.push_str(name);
            }
        } else {
            result.push_str(token.text);
        }
    }
    result
}

impl FeatureModel {
    /// Parse a feature model from a YAML string.
    pub fn from_yaml(yaml: &str) -> Result<Self, Error> {
        let raw: FeatureModelYaml =
            serde_yaml::from_str(yaml).map_err(|e| Error::Schema(format!("feature model: {e}")))?;
        Self::from_yaml_struct(raw)
    }

    /// Build a `FeatureModel` from an already-parsed `FeatureModelYaml`.
    ///
    /// Shared by `from_yaml` (single file) and `load_composed` (multi-file
    /// composition, REQ-083). Composition is performed on the raw YAML
    /// structs, so this construction + tree-validation logic runs exactly
    /// once over the merged result.
    fn from_yaml_struct(raw: FeatureModelYaml) -> Result<Self, Error> {
        let mut features = BTreeMap::new();

        // First pass: create features without parent links.
        for (name, fy) in &raw.features {
            features.insert(
                name.clone(),
                Feature {
                    name: name.clone(),
                    group: fy.group,
                    children: fy.children.clone(),
                    parent: None,
                    attributes: fy.attributes.clone(),
                },
            );
        }

        // Ensure root exists (it may have no explicit entry).
        features.entry(raw.root.clone()).or_insert_with(|| Feature {
            name: raw.root.clone(),
            group: GroupType::Mandatory,
            children: vec![],
            parent: None,
            attributes: BTreeMap::new(),
        });

        // Second pass: set parent links from children references.
        let parent_map: Vec<(String, String)> = features
            .iter()
            .flat_map(|(pname, f)| f.children.iter().map(move |c| (c.clone(), pname.clone())))
            .collect();

        for (child, parent) in parent_map {
            // Ensure child feature exists.
            features.entry(child.clone()).or_insert_with(|| Feature {
                name: child.clone(),
                group: GroupType::Leaf,
                children: vec![],
                parent: None,
                attributes: BTreeMap::new(),
            });
            features.get_mut(&child).unwrap().parent = Some(parent);
        }

        // Parse constraint s-expressions.
        // Feature model constraints use bare symbols as feature names.
        // Wrap them in (has-tag "name") so the parser accepts them —
        // the solver interprets HasTag as "feature is selected".
        let mut constraints = Vec::new();
        for src in &raw.constraints {
            let preprocessed = preprocess_feature_constraint(src, &features);
            let expr = sexpr_eval::parse_filter(&preprocessed).map_err(|errs| {
                let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
                Error::Schema(format!("constraint `{src}`: {}", msgs.join("; ")))
            })?;
            constraints.push(expr);
        }

        // Build attribute schema if `attribute-schema:` was present.
        let mut attribute_schema = BTreeMap::new();
        for (key, raw_decl) in &raw.attribute_schema {
            let decl = build_attribute_decl(key, raw_decl)?;
            attribute_schema.insert(key.clone(), decl);
        }

        // Validate every feature attribute against the schema. Type
        // mismatches, range violations, and missing-required attributes
        // are hard errors. Unknown keys collect into `attribute_warnings`
        // so callers can surface them without blocking the load.
        let mut attribute_warnings = Vec::new();
        if !attribute_schema.is_empty() {
            for (fname, feature) in &features {
                // Required-key check.
                for (key, decl) in &attribute_schema {
                    if decl.required && !feature.attributes.contains_key(key) {
                        return Err(Error::Schema(format!(
                            "feature `{fname}`: missing required attribute `{key}` \
                             (declared in attribute-schema)"
                        )));
                    }
                }
                // Per-attribute type / range / enum check.
                for (key, value) in &feature.attributes {
                    match attribute_schema.get(key) {
                        Some(decl) => {
                            if let Some(msg) = check_attribute_value(fname, key, decl, value) {
                                return Err(Error::Schema(msg));
                            }
                        }
                        None => {
                            attribute_warnings.push(format!(
                                "feature `{fname}` attribute `{key}`: \
                                 not declared in attribute-schema"
                            ));
                        }
                    }
                }
            }
        }

        let model = FeatureModel {
            root: raw.root,
            features,
            constraints,
            attribute_schema,
            attribute_warnings,
        };

        model.validate_tree()?;
        Ok(model)
    }

    /// Load a feature model composed from multiple files via a
    /// `feature-model-binding` file (REQ-083).
    ///
    /// Every model file the binding references is itself a valid
    /// standalone feature model — `load_composed` is purely additive over
    /// `from_yaml`. Composition splices each mounted sub-model into its
    /// parent under an explicit, unique prefix (`prefix:feature`), then
    /// runs the normal construction + tree validation once over the
    /// merged result. A broken mount (missing file, absent or `leaf`
    /// mount point, duplicate prefix, cyclic composition) is a hard
    /// error, never a silent skip.
    pub fn load_composed(binding_path: &std::path::Path) -> Result<Self, Error> {
        Self::load_composed_with_externals(binding_path, &BTreeMap::new())
    }

    /// Like [`load_composed`](Self::load_composed) but lets the caller
    /// supply a map of `<external-prefix> -> <synced-repo-root>` (REQ-085).
    /// A mount whose `model:` field is of the form
    /// `<external-prefix>:<inner-path>` resolves to
    /// `<synced-repo-root>/<inner-path>`. Composition rides the existing
    /// `rivet sync` plumbing this way: the consumer's `rivet.yaml` is the
    /// single source of truth for which external repos exist, and the
    /// binding only names the prefix.
    ///
    /// An unknown external prefix is a hard error (never a silent fall-back
    /// to local path resolution).
    pub fn load_composed_with_externals(
        binding_path: &std::path::Path,
        externals: &BTreeMap<String, std::path::PathBuf>,
    ) -> Result<Self, Error> {
        let binding_src = std::fs::read_to_string(binding_path).map_err(|e| {
            Error::Schema(format!(
                "feature-model-binding `{}`: {e}",
                binding_path.display()
            ))
        })?;
        let binding: FeatureModelBindingYaml = serde_yaml::from_str(&binding_src).map_err(|e| {
            Error::Schema(format!(
                "feature-model-binding `{}`: {e}",
                binding_path.display()
            ))
        })?;
        if binding.compose.is_empty() {
            return Err(Error::Schema(
                "feature-model-binding: `compose:` is empty — nothing to compose".to_string(),
            ));
        }
        let base_dir = binding_path
            .parent()
            .unwrap_or_else(|| std::path::Path::new("."));

        // Index compose entries by parent path; reject a parent listed twice.
        let mut entries: BTreeMap<&str, &ComposeEntryYaml> = BTreeMap::new();
        for entry in &binding.compose {
            if entries.insert(entry.parent.as_str(), entry).is_some() {
                return Err(Error::Schema(format!(
                    "feature-model-binding: model `{}` is listed as `parent:` more than once",
                    entry.parent
                )));
            }
        }

        // Every mount prefix must be unique across the whole composition.
        let mut prefixes: BTreeSet<&str> = BTreeSet::new();
        let mut mounted: BTreeSet<&str> = BTreeSet::new();
        for entry in &binding.compose {
            for mount in entry.mount.values() {
                if !prefixes.insert(mount.prefix.as_str()) {
                    return Err(Error::Schema(format!(
                        "feature-model-binding: prefix `{}` is used by more than one mount \
                         — prefixes must be unique",
                        mount.prefix
                    )));
                }
                mounted.insert(mount.model.as_str());
            }
        }

        // The root model is the one `parent:` never itself mounted.
        let roots: Vec<&str> = entries
            .keys()
            .copied()
            .filter(|p| !mounted.contains(p))
            .collect();
        let root_model = match roots.as_slice() {
            [one] => *one,
            [] => {
                return Err(Error::Schema(
                    "feature-model-binding: every `parent:` is also mounted — \
                     no root model (composition is cyclic)"
                        .to_string(),
                ));
            }
            many => {
                return Err(Error::Schema(format!(
                    "feature-model-binding: {} candidate root models are never mounted ({}) \
                     — exactly one root expected",
                    many.len(),
                    many.join(", ")
                )));
            }
        };

        let merged = load_and_splice(
            root_model,
            base_dir,
            &entries,
            externals,
            &mut BTreeSet::new(),
        )?;
        Self::from_yaml_struct(merged)
    }

    /// Load a feature model from a file, dispatching on its `kind:`.
    ///
    /// A file declaring `kind: feature-model-binding` is composed via
    /// [`load_composed`](Self::load_composed); any other file is parsed as
    /// a single feature model via [`from_yaml`](Self::from_yaml). This is
    /// the entry point CLI commands use, so a `--model` argument
    /// transparently accepts either a plain model or a composition.
    pub fn load(path: &std::path::Path) -> Result<Self, Error> {
        Self::load_with_externals(path, &BTreeMap::new())
    }

    /// Like [`load`](Self::load) but passes through an externals map for
    /// the composition path (REQ-085). For a single-file model the
    /// externals map is irrelevant; for a `feature-model-binding` it
    /// resolves any `<external-prefix>:<inner-path>` mounts. The CLI is
    /// the natural site to build this map from the project's
    /// `rivet.yaml` externals.
    pub fn load_with_externals(
        path: &std::path::Path,
        externals: &BTreeMap<String, std::path::PathBuf>,
    ) -> Result<Self, Error> {
        let src = std::fs::read_to_string(path)
            .map_err(|e| Error::Schema(format!("feature model `{}`: {e}", path.display())))?;
        #[derive(Deserialize)]
        struct KindProbe {
            kind: Option<String>,
        }
        let probe: KindProbe = serde_yaml::from_str(&src)
            .map_err(|e| Error::Schema(format!("feature model `{}`: {e}", path.display())))?;
        if probe.kind.as_deref() == Some("feature-model-binding") {
            Self::load_composed_with_externals(path, externals)
        } else {
            Self::from_yaml(&src)
        }
    }

    /// Validate the feature tree: no cycles, all children referenced exist,
    /// group types consistent with child counts.
    fn validate_tree(&self) -> Result<(), Error> {
        // Check root exists.
        if !self.features.contains_key(&self.root) {
            return Err(Error::Schema(format!(
                "root feature `{}` not defined",
                self.root
            )));
        }

        // Cycle detection via BFS from root, tracking visited.
        let mut visited = BTreeSet::new();
        let mut queue = VecDeque::new();
        queue.push_back(self.root.clone());

        while let Some(name) = queue.pop_front() {
            if !visited.insert(name.clone()) {
                return Err(Error::Schema(format!(
                    "cycle detected involving feature `{name}`"
                )));
            }
            if let Some(f) = self.features.get(&name) {
                for child in &f.children {
                    if !self.features.contains_key(child) {
                        return Err(Error::Schema(format!(
                            "feature `{name}` references unknown child `{child}`"
                        )));
                    }
                    queue.push_back(child.clone());
                }
            }
        }

        // Validate group types vs children.
        for (name, f) in &self.features {
            match f.group {
                GroupType::Leaf if !f.children.is_empty() => {
                    return Err(Error::Schema(format!(
                        "feature `{name}` is leaf but has children"
                    )));
                }
                GroupType::Alternative | GroupType::Or if f.children.is_empty() => {
                    return Err(Error::Schema(format!(
                        "feature `{name}` is {:?} but has no children",
                        f.group
                    )));
                }
                _ => {}
            }
        }

        Ok(())
    }
}

// ── Constraint solver ──────────────────────────────────────────────────

/// Solver diagnostics — why a variant is invalid.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SolveError {
    /// A selected feature does not exist in the model.
    UnknownFeature(String),
    /// An `alternative` group has != 1 child selected.
    AlternativeViolation {
        parent: String,
        selected: Vec<String>,
    },
    /// An `or` group has zero children selected.
    OrViolation { parent: String },
    /// A constraint is violated after propagation.
    ConstraintViolation(String),
    /// A mandatory child is missing (should not happen after propagation,
    /// but reported defensively).
    MandatoryMissing { parent: String, child: String },
}

impl std::fmt::Display for SolveError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            SolveError::UnknownFeature(name) => write!(f, "unknown feature: {name}"),
            SolveError::AlternativeViolation { parent, selected } => {
                write!(
                    f,
                    "alternative group `{parent}` requires exactly 1 child, got {}: [{}]",
                    selected.len(),
                    selected.join(", ")
                )
            }
            SolveError::OrViolation { parent } => {
                write!(f, "or group `{parent}` requires at least 1 child selected")
            }
            SolveError::ConstraintViolation(msg) => write!(f, "constraint violated: {msg}"),
            SolveError::MandatoryMissing { parent, child } => {
                write!(f, "mandatory child `{child}` of `{parent}` not selected")
            }
        }
    }
}

/// Solve a variant configuration against a feature model.
///
/// 1. Start with user-selected features + root.
/// 2. Propagate mandatory children (fixpoint).
/// 3. Propagate `implies` constraints from s-expressions (fixpoint).
/// 4. Check group constraints and remaining constraints.
///
/// Returns `Ok(ResolvedVariant)` on success, `Err(Vec<SolveError>)` on failure.
pub fn solve(
    model: &FeatureModel,
    config: &VariantConfig,
) -> Result<ResolvedVariant, Vec<SolveError>> {
    let mut errors = Vec::new();

    // Validate all selected features exist.
    for name in &config.selects {
        if !model.features.contains_key(name) {
            errors.push(SolveError::UnknownFeature(name.clone()));
        }
    }
    if !errors.is_empty() {
        return Err(errors);
    }

    // Start with root + user selections.
    //
    // `origins` tracks *why* each feature entered the effective set.
    // We use `insert` with .or_insert so the first reason wins: a user
    // selection beats a subsequent mandatory/implied discovery.
    let mut selected: BTreeSet<String> = BTreeSet::new();
    let mut origins: BTreeMap<String, FeatureOrigin> = BTreeMap::new();

    // Root is always mandatory.
    selected.insert(model.root.clone());
    origins.insert(model.root.clone(), FeatureOrigin::Mandatory);

    for name in &config.selects {
        if selected.insert(name.clone()) {
            origins.insert(name.clone(), FeatureOrigin::UserSelected);
        } else {
            origins
                .entry(name.clone())
                .or_insert(FeatureOrigin::UserSelected);
        }
    }

    // Select ancestors of every selected feature. Ancestors are
    // "mandatory" in the sense that a child cannot be selected without
    // its parent also being selected.
    let initial: Vec<String> = selected.iter().cloned().collect();
    for name in initial {
        let mut cur = name.as_str();
        while let Some(f) = model.features.get(cur) {
            if let Some(ref p) = f.parent {
                if selected.insert(p.clone()) {
                    origins.insert(p.clone(), FeatureOrigin::Mandatory);
                }
                cur = p;
            } else {
                break;
            }
        }
    }

    // Boolean constraint propagation: fixpoint loop.
    let mut changed = true;
    let max_iterations = model.features.len() + model.constraints.len() + 1;
    let mut iteration = 0;
    while changed && iteration < max_iterations {
        changed = false;
        iteration += 1;

        // Propagate mandatory children.
        let snapshot: Vec<String> = selected.iter().cloned().collect();
        for name in &snapshot {
            if let Some(f) = model.features.get(name) {
                if f.group == GroupType::Mandatory {
                    for child in &f.children {
                        if selected.insert(child.clone()) {
                            origins.insert(child.clone(), FeatureOrigin::Mandatory);
                            changed = true;
                        }
                    }
                }
            }
        }

        // Propagate `implies` constraints: (implies A B)
        // If A is a feature name and it's selected, select B.
        for constraint in &model.constraints {
            if let Expr::Implies(antecedent, consequent) = constraint {
                if is_feature_selected(antecedent, &selected)
                    && !is_feature_selected(consequent, &selected)
                {
                    if let Some(name) = extract_feature_name(consequent) {
                        if model.features.contains_key(&name) {
                            let cause = extract_feature_name(antecedent)
                                .unwrap_or_else(|| "constraint".to_string());
                            if selected.insert(name.clone()) {
                                origins.insert(name.clone(), FeatureOrigin::ImpliedBy(cause));
                                changed = true;
                            }
                        }
                    }
                }
            }
        }
    }

    // Check group constraints.
    for (name, feature) in &model.features {
        if !selected.contains(name) {
            continue;
        }
        match feature.group {
            GroupType::Mandatory => {
                for child in &feature.children {
                    if !selected.contains(child) {
                        errors.push(SolveError::MandatoryMissing {
                            parent: name.clone(),
                            child: child.clone(),
                        });
                    }
                }
            }
            GroupType::Alternative => {
                let sel_children: Vec<String> = feature
                    .children
                    .iter()
                    .filter(|c| selected.contains(*c))
                    .cloned()
                    .collect();
                if sel_children.len() != 1 {
                    errors.push(SolveError::AlternativeViolation {
                        parent: name.clone(),
                        selected: sel_children,
                    });
                }
            }
            GroupType::Or => {
                let any = feature.children.iter().any(|c| selected.contains(c));
                if !any {
                    errors.push(SolveError::OrViolation {
                        parent: name.clone(),
                    });
                }
            }
            GroupType::Optional | GroupType::Leaf => {}
        }
    }

    // Check every cross-tree constraint as a boolean assertion over the
    // propagated selection. This catches violations that propagation
    // cannot (e.g. `(implies X (not Y))`, where the consequent is a
    // negation rather than a feature to be auto-selected).
    for constraint in &model.constraints {
        // `excludes` produces a dedicated message to preserve pre-fix
        // diagnostics; all other constraint shapes fall through to the
        // generic evaluator.
        if let Expr::Excludes(a, b) = constraint {
            if eval_constraint(a, &selected) && eval_constraint(b, &selected) {
                errors.push(SolveError::ConstraintViolation(format!(
                    "excludes({}, {})",
                    describe_expr(a),
                    describe_expr(b),
                )));
            }
            continue;
        }
        if !eval_constraint(constraint, &selected) {
            errors.push(SolveError::ConstraintViolation(describe_constraint(
                constraint,
            )));
        }
    }

    if errors.is_empty() {
        Ok(ResolvedVariant {
            name: config.name.clone(),
            effective_features: selected,
            origins,
            source_manifest: BTreeMap::new(),
        })
    } else {
        Err(errors)
    }
}

/// Solve a variant configuration AND resolve the source manifest from a
/// `FeatureBinding` model.
///
/// This is the Gap-5 entry point: identical to `solve` for the feature
/// selection, plus an additional pass that walks each effective feature's
/// binding entries, evaluates any `when:` predicate against the resolved
/// feature set, and accumulates the surviving globs into
/// `ResolvedVariant.source_manifest`.
///
/// If a `when:` expression fails to parse, propagation halts with the
/// binding name + when text + parser error embedded in the message — the
/// audit-facing path must be loud, not silent.
pub fn solve_with_bindings(
    model: &FeatureModel,
    config: &VariantConfig,
    binding: &FeatureBinding,
) -> Result<ResolvedVariant, Vec<SolveError>> {
    let mut resolved = solve(model, config)?;

    let mut manifest: BTreeMap<String, Vec<PathBuf>> = BTreeMap::new();
    for feature in &resolved.effective_features {
        let Some(bind) = binding.bindings.get(feature) else {
            continue;
        };
        let mut paths: Vec<PathBuf> = Vec::new();
        for entry in &bind.source {
            let keep = match &entry.when {
                None => true,
                Some(src) => match eval_when_clause(src, &resolved.effective_features) {
                    Ok(b) => b,
                    Err(msg) => {
                        return Err(vec![SolveError::ConstraintViolation(format!(
                            "binding `{feature}` source `{}` when `{src}`: {msg}",
                            entry.glob
                        ))]);
                    }
                },
            };
            if keep {
                paths.push(PathBuf::from(&entry.glob));
            }
        }
        if !paths.is_empty() {
            manifest.insert(feature.clone(), paths);
        }
    }
    resolved.source_manifest = manifest;
    Ok(resolved)
}

/// Parse and evaluate a `when:` s-expression against the resolved feature
/// set. The grammar is the same as feature-model constraints; bare
/// identifiers that match a feature name behave like `(has-tag "name")`.
///
/// Returns `Err(message)` if parsing fails (the caller wraps with
/// binding context) and `Ok(bool)` otherwise.
fn eval_when_clause(src: &str, selected: &BTreeSet<String>) -> Result<bool, String> {
    // Build a synthetic feature lookup so the constraint preprocessor
    // recognises bare feature names. We don't have access to the
    // FeatureModel here; the preprocessor only checks containment by
    // string key, so a fake map keyed by every selected feature is
    // sufficient for the common `(has-tag "...")` / `(and feat-x feat-y)`
    // shapes. Bare names that aren't in `selected` will pass through
    // unchanged — but the evaluator below treats unknown shapes as true,
    // so we wrap them defensively.
    let synthetic: BTreeMap<String, Feature> = selected
        .iter()
        .map(|n| {
            (
                n.clone(),
                Feature {
                    name: n.clone(),
                    group: GroupType::Leaf,
                    children: vec![],
                    parent: None,
                    attributes: BTreeMap::new(),
                },
            )
        })
        .collect();
    let preprocessed = preprocess_feature_constraint(src, &synthetic);
    let expr = sexpr_eval::parse_filter(&preprocessed).map_err(|errs| {
        let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
        format!("parse error: {}", msgs.join("; "))
    })?;
    Ok(eval_constraint(&expr, selected))
}

// ── Helpers ────────────────────────────────────────────────────────────

/// Check whether a simple expression refers to a selected feature.
///
/// For constraint propagation we handle simple cases:
///   - `Eq(Field("id"), Str(name))` — the usual pattern from `(= id "feat")`
///   - A bare identifier that parsed as `Eq(Field(name), Str("true"))` or
///     similar — we also check the field name against the selected set.
///
/// For compound expressions, fall back to checking recursively.
fn is_feature_selected(expr: &Expr, selected: &BTreeSet<String>) -> bool {
    if let Some(name) = extract_feature_name(expr) {
        return selected.contains(&name);
    }
    // For `And`, all sub-features must be selected.
    if let Expr::And(children) = expr {
        return children.iter().all(|c| is_feature_selected(c, selected));
    }
    // For `Or`, any sub-feature selected.
    if let Expr::Or(children) = expr {
        return children.iter().any(|c| is_feature_selected(c, selected));
    }
    // For `Not`, invert.
    if let Expr::Not(inner) = expr {
        return !is_feature_selected(inner, selected);
    }
    false
}

/// Try to extract a single feature name from an expression.
///
/// Recognises patterns produced by `parse_filter`:
///   - `(= id "feature-name")` → `Some("feature-name")`
///   - bare identifier → heuristic via `HasField`
fn extract_feature_name(expr: &Expr) -> Option<String> {
    match expr {
        Expr::Eq(sexpr_eval::Accessor::Field(field), sexpr_eval::Value::Str(val))
            if field == "id" =>
        {
            Some(val.clone())
        }
        Expr::HasField(sexpr_eval::Value::Str(name)) => Some(name.clone()),
        Expr::HasTag(sexpr_eval::Value::Str(name)) => Some(name.clone()),
        _ => None,
    }
}

/// Produce a short description of an expression for error messages.
fn describe_expr(expr: &Expr) -> String {
    if let Some(name) = extract_feature_name(expr) {
        name
    } else {
        format!("{expr:?}")
    }
}

/// Describe a top-level constraint for a `ConstraintViolation` message.
///
/// Renders the common logical shapes as human-readable text; falls back
/// to the `Debug` representation for anything exotic.
fn describe_constraint(expr: &Expr) -> String {
    match expr {
        Expr::Implies(a, b) => format!("implies({}, {})", describe_expr(a), describe_expr(b)),
        Expr::Excludes(a, b) => format!("excludes({}, {})", describe_expr(a), describe_expr(b)),
        Expr::Not(inner) => format!("not({})", describe_expr(inner)),
        Expr::And(children) => format!(
            "and({})",
            children
                .iter()
                .map(describe_expr)
                .collect::<Vec<_>>()
                .join(", ")
        ),
        Expr::Or(children) => format!(
            "or({})",
            children
                .iter()
                .map(describe_expr)
                .collect::<Vec<_>>()
                .join(", ")
        ),
        _ => describe_expr(expr),
    }
}

/// Evaluate a constraint expression as a boolean over the selected set.
///
/// Distinct from `is_feature_selected` in two ways:
///   - `Implies(a, b)` evaluates to `(not a) or b` — the standard
///     propositional semantics — rather than recursing structurally.
///   - `Excludes(a, b)` evaluates to `not (a and b)`.
///
/// Leaves (feature-name equality, `HasTag`, `HasField` on a known name)
/// are resolved via `extract_feature_name` + membership in `selected`.
/// Unknown expression shapes evaluate to `true` so the solver remains
/// permissive for constraint flavours it does not understand (forward
/// compatibility with richer predicates).
fn eval_constraint(expr: &Expr, selected: &BTreeSet<String>) -> bool {
    if let Some(name) = extract_feature_name(expr) {
        return selected.contains(&name);
    }
    match expr {
        Expr::And(children) => children.iter().all(|c| eval_constraint(c, selected)),
        Expr::Or(children) => children.iter().any(|c| eval_constraint(c, selected)),
        Expr::Not(inner) => !eval_constraint(inner, selected),
        Expr::Implies(a, b) => !eval_constraint(a, selected) || eval_constraint(b, selected),
        Expr::Excludes(a, b) => !(eval_constraint(a, selected) && eval_constraint(b, selected)),
        Expr::BoolLit(v) => *v,
        // Unknown / artifact-oriented predicates (link queries, regex
        // matches, etc.) are not meaningful over a feature selection;
        // treat as satisfied so we do not raise spurious violations.
        _ => true,
    }
}

// ── Variant config directory loader (issue #287) ───────────────────────

/// Load every `*.yaml` / `*.yml` file in `dir` as a [`VariantConfig`].
///
/// Returns the list sorted by file name for deterministic order. Errors
/// out on the first malformed file. Used by `rivet validate`,
/// `rivet coverage`, `rivet list`, and `rivet query` to resolve their
/// `--variant <name>` flag against the project's `artifacts/variants/`
/// directory (or any other directory the caller picks).
///
/// Empty / missing dirs return `Ok(vec![])` so callers can use this
/// unconditionally without first checking `dir.exists()`.
///
/// Name collisions across files (two `*.yaml` files declaring the same
/// `name:`) are returned as an error — a project that ships duplicate
/// variant names has an ambiguity bug the user must fix before any
/// downstream consumer can pick the "right" one.
pub fn load_variant_configs_from_dir(dir: &std::path::Path) -> Result<Vec<VariantConfig>, Error> {
    if !dir.exists() {
        return Ok(Vec::new());
    }
    let entries = std::fs::read_dir(dir)
        .map_err(|e| Error::Io(format!("reading variants dir {}: {e}", dir.display())))?;
    let mut paths: Vec<std::path::PathBuf> = entries
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| {
            p.extension()
                .and_then(|s| s.to_str())
                .is_some_and(|ext| ext == "yaml" || ext == "yml")
        })
        .collect();
    paths.sort();

    let mut configs: Vec<VariantConfig> = Vec::new();
    let mut seen: BTreeSet<String> = BTreeSet::new();
    for path in &paths {
        let yaml = std::fs::read_to_string(path)
            .map_err(|e| Error::Io(format!("reading {}: {e}", path.display())))?;
        // A feature-model binding file (the `bindings:` map + optional
        // `variants:` list shape of `FeatureBinding`) can legitimately live
        // beside the single-variant configs it binds. Detect and skip it so
        // the loader doesn't fail trying to parse it as `VariantConfig`
        // (#532). The discriminator is a top-level `bindings:` key with
        // neither `name:` (flat variant config) nor `variant:` (wrapped
        // variant config from `rivet variant init`, see #514) present.
        if is_feature_binding_file(&yaml) {
            continue;
        }
        let vc: VariantConfig = serde_yaml::from_str(&yaml).map_err(|e| {
            Error::Schema(format!("parsing variant config {}: {e}", path.display()))
        })?;
        if !seen.insert(vc.name.clone()) {
            return Err(Error::Schema(format!(
                "duplicate variant name '{}' in {}",
                vc.name,
                path.display()
            )));
        }
        configs.push(vc);
    }
    Ok(configs)
}

/// True when `yaml` is structurally a feature-model binding file (a
/// top-level `bindings:` map with no `name:`/`variant:` siblings), as
/// opposed to a single-variant config. Used by `load_variant_configs_from_dir`
/// to skip binding files that share the `artifacts/variants/` directory
/// with the variant configs they bind (#532). Unparseable YAML returns
/// `false` so the caller's existing error path still fires.
fn is_feature_binding_file(yaml: &str) -> bool {
    let Ok(value) = serde_yaml::from_str::<serde_yaml::Value>(yaml) else {
        return false;
    };
    let serde_yaml::Value::Mapping(map) = value else {
        return false;
    };
    let key = |k: &str| serde_yaml::Value::String(k.to_string());
    map.contains_key(key("bindings"))
        && !map.contains_key(key("name"))
        && !map.contains_key(key("variant"))
}

// ── Tests ──────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    // #514: `VariantConfig::from_yaml_str` must accept both the flat form and
    // the `variant:`-wrapped feature-model-bindings form that `rivet variant
    // init` scaffolds, so init→check stops disagreeing.
    #[test]
    fn variant_config_accepts_flat_and_wrapped_forms() {
        let flat = "name: a\nselects: [x, y]\n";
        let vc = VariantConfig::from_yaml_str(flat).expect("flat form must parse");
        assert_eq!(vc.name, "a");
        assert_eq!(vc.selects, ["x", "y"]);

        // The exact shape `rivet variant init` writes: variant: wrapper +
        // a bindings: block (which the variant check ignores).
        let wrapped = "variant:\n  name: kiln\n  selects: [telemetry]\nbindings:\n  telemetry:\n    artifacts: []\n";
        let vc = VariantConfig::from_yaml_str(wrapped).expect("wrapped form must parse");
        assert_eq!(vc.name, "kiln");
        assert_eq!(vc.selects, ["telemetry"]);

        // A genuinely malformed config still errors (no silent acceptance).
        assert!(VariantConfig::from_yaml_str("selects: [x]\n").is_err());
    }

    fn vehicle_model_yaml() -> &'static str {
        r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [engine, safety, market]
  engine:
    group: alternative
    children: [petrol, electric]
  petrol:
    group: leaf
  electric:
    group: leaf
  safety:
    group: optional
    children: [abs, esc, pedestrian-detection]
  abs:
    group: leaf
  esc:
    group: leaf
  pedestrian-detection:
    group: leaf
  market:
    group: alternative
    children: [eu, us, cn]
  eu:
    group: leaf
  us:
    group: leaf
  cn:
    group: leaf
constraints:
  - (implies (= id "eu") (= id "pedestrian-detection"))
  - (excludes (= id "petrol") (= id "cn"))
"#
    }

    #[test]
    fn parse_feature_model_roundtrip() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        assert_eq!(model.root, "vehicle");
        assert_eq!(model.features.len(), 12);
        assert_eq!(model.constraints.len(), 2);
        assert_eq!(model.features["engine"].group, GroupType::Alternative);
        assert_eq!(
            model.features["vehicle"].children,
            vec!["engine", "safety", "market"]
        );
    }

    #[test]
    fn mandatory_propagation() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "eu-electric".into(),
            selects: vec!["electric".into(), "eu".into(), "abs".into()],
        };
        let resolved = solve(&model, &config).unwrap();

        // Root and mandatory children must be present.
        assert!(resolved.effective_features.contains("vehicle"));
        assert!(resolved.effective_features.contains("engine"));
        assert!(resolved.effective_features.contains("safety"));
        assert!(resolved.effective_features.contains("market"));

        // User selections present.
        assert!(resolved.effective_features.contains("electric"));
        assert!(resolved.effective_features.contains("eu"));
        assert!(resolved.effective_features.contains("abs"));

        // `implies eu pedestrian-detection` should have fired.
        assert!(
            resolved.effective_features.contains("pedestrian-detection"),
            "EU implies pedestrian-detection"
        );
    }

    #[test]
    fn alternative_violation_detected() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "two-engines".into(),
            selects: vec!["petrol".into(), "electric".into(), "eu".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| matches!(
            e,
            SolveError::AlternativeViolation { parent, .. } if parent == "engine"
        )));
    }

    #[test]
    fn or_group_validation() {
        let yaml = r#"
kind: feature-model
root: app
features:
  app:
    group: mandatory
    children: [auth]
  auth:
    group: or
    children: [oauth, ldap, saml]
  oauth:
    group: leaf
  ldap:
    group: leaf
  saml:
    group: leaf
constraints: []
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();

        // No auth children selected → or violation.
        let config = VariantConfig {
            name: "no-auth-method".into(),
            selects: vec![],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| matches!(
            e,
            SolveError::OrViolation { parent } if parent == "auth"
        )));

        // One selected → ok.
        let config2 = VariantConfig {
            name: "oauth-only".into(),
            selects: vec!["oauth".into()],
        };
        assert!(solve(&model, &config2).is_ok());

        // Two selected → also ok for `or`.
        let config3 = VariantConfig {
            name: "multi-auth".into(),
            selects: vec!["oauth".into(), "ldap".into()],
        };
        assert!(solve(&model, &config3).is_ok());
    }

    #[test]
    fn excludes_constraint() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        // petrol + cn violates `(excludes petrol cn)`.
        let config = VariantConfig {
            name: "petrol-cn".into(),
            selects: vec!["petrol".into(), "cn".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        let errors = result.unwrap_err();
        assert!(errors.iter().any(|e| matches!(
            e,
            SolveError::ConstraintViolation(msg) if msg.contains("excludes")
        )));
    }

    #[test]
    fn unknown_feature_detected() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "bad".into(),
            selects: vec!["nonexistent".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_err());
        assert!(result.unwrap_err().iter().any(|e| matches!(
            e,
            SolveError::UnknownFeature(n) if n == "nonexistent"
        )));
    }

    #[test]
    fn cycle_detection() {
        let yaml = r#"
kind: feature-model
root: a
features:
  a:
    group: mandatory
    children: [b]
  b:
    group: mandatory
    children: [a]
constraints: []
"#;
        let result = FeatureModel::from_yaml(yaml);
        assert!(result.is_err());
        let msg = format!("{}", result.unwrap_err());
        assert!(msg.contains("cycle"), "expected cycle error, got: {msg}");
    }

    #[test]
    fn leaf_with_children_rejected() {
        let yaml = r#"
kind: feature-model
root: a
features:
  a:
    group: leaf
    children: [b]
  b:
    group: leaf
constraints: []
"#;
        let result = FeatureModel::from_yaml(yaml);
        assert!(result.is_err());
        let msg = format!("{}", result.unwrap_err());
        assert!(
            msg.contains("leaf") && msg.contains("children"),
            "expected leaf-with-children error, got: {msg}"
        );
    }

    #[test]
    fn binding_deserialization() {
        let yaml = r#"
bindings:
  pedestrian-detection:
    artifacts: ["REQ-PD-001", "SPEC-PD-001"]
    source: ["src/pd/**/*.rs"]
  abs:
    artifacts: ["REQ-ABS-001"]
    source: []
"#;
        let binding: FeatureBinding = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(binding.bindings.len(), 2);
        assert_eq!(
            binding.bindings["pedestrian-detection"].artifacts,
            vec!["REQ-PD-001", "SPEC-PD-001"]
        );
        let pd_source = &binding.bindings["pedestrian-detection"].source;
        assert_eq!(pd_source.len(), 1);
        assert_eq!(pd_source[0].glob, "src/pd/**/*.rs");
        assert!(pd_source[0].when.is_none());
    }

    #[test]
    fn variant_config_deserialization() {
        let yaml = r#"
name: eu-electric
selects:
  - electric
  - eu
  - abs
"#;
        let config: VariantConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.name, "eu-electric");
        assert_eq!(config.selects, vec!["electric", "eu", "abs"]);
    }

    #[test]
    fn empty_model_with_root_only() {
        let yaml = r#"
kind: feature-model
root: single
features:
  single:
    group: leaf
constraints: []
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();
        let config = VariantConfig {
            name: "minimal".into(),
            selects: vec![],
        };
        let resolved = solve(&model, &config).unwrap();
        assert_eq!(resolved.effective_features.len(), 1);
        assert!(resolved.effective_features.contains("single"));
    }

    /// Shared model for cross-tree constraint tests: `system` is a
    /// mandatory parent containing an optional subtree with two
    /// independently selectable siblings, so we can test variants where
    /// only one of {feature-x, feature-y} is selected.
    fn cross_tree_model_yaml() -> &'static str {
        r#"
kind: feature-model
root: system
features:
  system:
    group: mandatory
    children: [base, extras]
  base:
    group: leaf
  extras:
    group: optional
    children: [feature-x, feature-y]
  feature-x:
    group: leaf
  feature-y:
    group: leaf
constraints:
  - (implies feature-x (not feature-y))
"#
    }

    #[test]
    fn cross_tree_implies_not_violation_detected() {
        // Regression: `(implies X (not Y))` with both X and Y selected
        // must produce a ConstraintViolation. Before the fix, the solver
        // only used `implies` for forward propagation (selecting
        // consequent features when antecedent was selected) and had no
        // code path that actually evaluated the implication as a logical
        // assertion — so a negated consequent with a selected Y was
        // silently accepted as PASS.
        let model = FeatureModel::from_yaml(cross_tree_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "both-x-and-y".into(),
            selects: vec!["feature-x".into(), "feature-y".into()],
        };
        let result = solve(&model, &config);
        assert!(
            result.is_err(),
            "expected FAIL for `(implies feature-x (not feature-y))` with both selected, got PASS: {result:?}"
        );
        let errors = result.unwrap_err();
        assert!(
            errors.iter().any(|e| matches!(
                e,
                SolveError::ConstraintViolation(msg) if msg.contains("implies")
            )),
            "expected ConstraintViolation for implies, got: {errors:?}"
        );
    }

    #[test]
    fn cross_tree_implies_not_allows_valid_variant() {
        // Companion to the regression test above: when Y is NOT selected,
        // `(implies X (not Y))` must PASS. This guards against an
        // over-eager fix that flags every `implies (not ...)` as a
        // violation.
        let model = FeatureModel::from_yaml(cross_tree_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "x-only".into(),
            selects: vec!["feature-x".into()],
        };
        let result = solve(&model, &config);
        assert!(result.is_ok(), "expected PASS for x-only, got: {result:?}");
    }

    #[test]
    fn cross_tree_implies_positive_propagates() {
        // `(implies feature-x feature-y)` + select only X: the solver
        // propagates Y into the selection and returns PASS. This guards
        // against the fix breaking forward propagation.
        let yaml = r#"
kind: feature-model
root: system
features:
  system:
    group: mandatory
    children: [base, extras]
  base:
    group: leaf
  extras:
    group: optional
    children: [feature-x, feature-y]
  feature-x:
    group: leaf
  feature-y:
    group: leaf
constraints:
  - (implies feature-x feature-y)
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();
        let config = VariantConfig {
            name: "x-only".into(),
            selects: vec!["feature-x".into()],
        };
        let resolved = solve(&model, &config).unwrap();
        assert!(resolved.effective_features.contains("feature-y"));
    }

    // ── Feature origin tracking (pain point #8) ─────────────────────

    #[test]
    fn origin_marks_user_selected_features() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "eu-electric".into(),
            selects: vec!["electric".into(), "eu".into()],
        };
        let resolved = solve(&model, &config).unwrap();

        assert_eq!(
            resolved.origins.get("electric"),
            Some(&FeatureOrigin::UserSelected),
            "electric was named in selects → UserSelected"
        );
        assert_eq!(
            resolved.origins.get("eu"),
            Some(&FeatureOrigin::UserSelected)
        );
    }

    #[test]
    fn origin_marks_mandatory_ancestors_and_root() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "eu-electric".into(),
            selects: vec!["electric".into(), "eu".into()],
        };
        let resolved = solve(&model, &config).unwrap();

        // Root and ancestor `engine` / `market` are pulled in by the tree,
        // not by the user. Root is always Mandatory; ancestors are too.
        assert_eq!(
            resolved.origins.get("vehicle"),
            Some(&FeatureOrigin::Mandatory),
            "root must be Mandatory"
        );
        assert_eq!(
            resolved.origins.get("engine"),
            Some(&FeatureOrigin::Mandatory),
            "engine is the parent of electric — ancestors are mandatory"
        );
        assert_eq!(
            resolved.origins.get("market"),
            Some(&FeatureOrigin::Mandatory)
        );
    }

    #[test]
    fn origin_marks_constraint_implied_features() {
        // Model has `(implies eu pedestrian-detection)`. Selecting eu
        // should mark pedestrian-detection as ImpliedBy("eu").
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "eu".into(),
            selects: vec!["electric".into(), "eu".into()],
        };
        let resolved = solve(&model, &config).unwrap();

        let origin = resolved
            .origins
            .get("pedestrian-detection")
            .expect("pedestrian-detection must be in the effective set");
        match origin {
            FeatureOrigin::ImpliedBy(cause) => {
                assert_eq!(cause, "eu", "cause should be `eu`, got {cause:?}");
            }
            other => panic!("pedestrian-detection should be ImpliedBy(eu), got {other:?}"),
        }
    }

    #[test]
    fn origins_cover_every_effective_feature() {
        // Every feature in `effective_features` must have a matching
        // entry in `origins`. No orphans.
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let config = VariantConfig {
            name: "full".into(),
            selects: vec!["electric".into(), "eu".into(), "abs".into()],
        };
        let resolved = solve(&model, &config).unwrap();
        for name in &resolved.effective_features {
            assert!(
                resolved.origins.contains_key(name),
                "missing origin for feature `{name}`"
            );
        }
    }

    #[test]
    fn ancestor_propagation() {
        // Selecting a deep leaf should auto-select all ancestors.
        let yaml = r#"
kind: feature-model
root: root
features:
  root:
    group: optional
    children: [mid]
  mid:
    group: optional
    children: [deep]
  deep:
    group: leaf
constraints: []
"#;
        let model = FeatureModel::from_yaml(yaml).unwrap();
        let config = VariantConfig {
            name: "deep-select".into(),
            selects: vec!["deep".into()],
        };
        let resolved = solve(&model, &config).unwrap();
        assert!(resolved.effective_features.contains("root"));
        assert!(resolved.effective_features.contains("mid"));
        assert!(resolved.effective_features.contains("deep"));
    }

    // ── Typed attribute schema (Gap 1) ──────────────────────────────

    fn schema_yaml(extra_attrs: &str) -> String {
        format!(
            r#"
kind: feature-model
root: app
attribute-schema:
  asil-numeric:
    type: int
    range: [0, 4]
    required: false
  compliance:
    type: enum
    values: [unece-r157, fmvss-127, gb-7258]
  locale:
    type: string
features:
  app:
    group: mandatory
    children: [unit]
  unit:
    group: leaf
    attributes:
{extra_attrs}
"#
        )
    }

    #[test]
    fn attribute_schema_parses_and_validates_ok() {
        let yaml = schema_yaml(
            "      asil-numeric: 3\n      \
                          compliance: unece-r157\n      \
                          locale: en_EU",
        );
        let model = FeatureModel::from_yaml(&yaml).expect("valid attributes");
        assert_eq!(model.attribute_schema.len(), 3);
        // Schema decls are reachable from the public API.
        let asil = &model.attribute_schema["asil-numeric"];
        assert!(matches!(
            asil.kind,
            AttributeKind::Int {
                range: Some((0, 4))
            }
        ));
        assert!(model.attribute_warnings.is_empty());
    }

    #[test]
    fn attribute_schema_type_mismatch_errors_with_field_info() {
        let yaml = schema_yaml(
            "      asil-numeric: \"three\"\n      \
                          compliance: unece-r157",
        );
        let err = FeatureModel::from_yaml(&yaml).unwrap_err();
        let msg = format!("{err}");
        assert!(
            msg.contains("asil-numeric") && msg.contains("type=int"),
            "expected feature/key/type in error, got: {msg}"
        );
        assert!(
            msg.contains("unit"),
            "must name the offending feature: {msg}"
        );
    }

    #[test]
    fn attribute_schema_enum_violation_lists_allowed_values() {
        let yaml = schema_yaml(
            "      asil-numeric: 2\n      \
                          compliance: nonsense",
        );
        let err = FeatureModel::from_yaml(&yaml).unwrap_err();
        let msg = format!("{err}");
        assert!(
            msg.contains("compliance") && msg.contains("unece-r157"),
            "expected enum-not-in-list with allowed values, got: {msg}"
        );
    }

    #[test]
    fn attribute_schema_range_violation_errors() {
        let yaml = schema_yaml(
            "      asil-numeric: 7\n      \
                          compliance: gb-7258",
        );
        let err = FeatureModel::from_yaml(&yaml).unwrap_err();
        let msg = format!("{err}");
        assert!(
            msg.contains("asil-numeric") && msg.contains("[0, 4]"),
            "expected range message, got: {msg}"
        );
    }

    #[test]
    fn attribute_schema_required_missing_errors() {
        // Mark `compliance` required and omit it on the only feature.
        let yaml = r#"
kind: feature-model
root: app
attribute-schema:
  compliance:
    type: enum
    values: [unece-r157, fmvss-127]
    required: true
features:
  app:
    group: mandatory
    children: [unit]
  unit:
    group: leaf
"#;
        let err = FeatureModel::from_yaml(yaml).unwrap_err();
        let msg = format!("{err}");
        assert!(
            msg.contains("missing required attribute `compliance`"),
            "got: {msg}"
        );
    }

    #[test]
    fn attribute_schema_unknown_key_warns_not_errors() {
        // Schema only declares `compliance`; YAML uses an extra `extra-key`.
        let yaml = r#"
kind: feature-model
root: app
attribute-schema:
  compliance:
    type: enum
    values: [unece-r157]
features:
  app:
    group: mandatory
    children: [unit]
  unit:
    group: leaf
    attributes:
      compliance: unece-r157
      extra-key: yolo
"#;
        let model = FeatureModel::from_yaml(yaml).expect("unknown key warns, not errors");
        assert!(
            model
                .attribute_warnings
                .iter()
                .any(|w| w.contains("extra-key")),
            "warning should name the unknown key, got: {:?}",
            model.attribute_warnings
        );
    }

    #[test]
    fn attribute_schema_float_range_works() {
        let yaml = r#"
kind: feature-model
root: app
attribute-schema:
  ratio:
    type: float
    range: [0.0, 1.0]
features:
  app:
    group: mandatory
    children: [unit]
  unit:
    group: leaf
    attributes:
      ratio: 1.5
"#;
        let err = FeatureModel::from_yaml(yaml).unwrap_err();
        assert!(format!("{err}").contains("[0, 1]") || format!("{err}").contains("ratio"));
    }

    #[test]
    fn attribute_schema_bool_type_enforced() {
        let yaml = r#"
kind: feature-model
root: app
attribute-schema:
  enabled:
    type: bool
features:
  app:
    group: mandatory
    children: [u]
  u:
    group: leaf
    attributes:
      enabled: 1
"#;
        let err = FeatureModel::from_yaml(yaml).unwrap_err();
        assert!(format!("{err}").contains("type=bool"));
    }

    // ── solve_with_bindings + when: (Gap 5) ─────────────────────────

    #[test]
    fn solve_with_bindings_no_when_clause_uses_all_globs() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let binding_yaml = r#"
bindings:
  pedestrian-detection:
    artifacts: [REQ-042]
    source:
      - "src/pd/**"
"#;
        let binding: FeatureBinding = serde_yaml::from_str(binding_yaml).unwrap();
        let config = VariantConfig {
            name: "eu".into(),
            selects: vec!["electric".into(), "eu".into()],
        };
        let resolved = solve_with_bindings(&model, &config, &binding).unwrap();
        let pd_paths = resolved
            .source_manifest
            .get("pedestrian-detection")
            .expect("pd should be in manifest");
        assert_eq!(pd_paths, &vec![PathBuf::from("src/pd/**")]);
    }

    #[test]
    fn solve_with_bindings_when_clause_filters_globs() {
        let model = FeatureModel::from_yaml(vehicle_model_yaml()).unwrap();
        let binding_yaml = r#"
bindings:
  pedestrian-detection:
    artifacts: [REQ-042]
    source:
      - glob: src/pd/core/**
      - glob: src/pd/electric/**
        when: (has-tag "electric")
      - glob: src/pd/petrol/**
        when: (has-tag "petrol")
"#;
        let binding: FeatureBinding = serde_yaml::from_str(binding_yaml).unwrap();
        let config = VariantConfig {
            name: "eu-electric".into(),
            selects: vec!["electric".into(), "eu".into()],
        };
        let resolved = solve_with_bindings(&model, &config, &binding).unwrap();
        let pd_paths = resolved
            .source_manifest
            .get("pedestrian-detection")
            .unwrap();
        assert!(pd_paths.contains(&PathBuf::from("src/pd/core/**")));
        assert!(pd_paths.contains(&PathBuf::from("src/pd/electric/**")));
        assert!(
            !pd_paths.contains(&PathBuf::from("src/pd/petrol/**")),
            "petrol when-clause must drop the glob from the manifest"
        );
    }

    // ── load_variant_configs_from_dir (issue #287, Phase 2) ──────────────

    #[test]
    fn load_variant_configs_from_dir_missing_dir_returns_empty() {
        let tmp = tempfile::tempdir().unwrap();
        let missing = tmp.path().join("does-not-exist");
        let got = load_variant_configs_from_dir(&missing).unwrap();
        assert!(
            got.is_empty(),
            "missing directory must return empty list, not an error"
        );
    }

    #[test]
    fn load_variant_configs_from_dir_loads_every_yaml_sorted() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("zeta.yaml"), "name: zeta\nselects: [a, b]\n").unwrap();
        std::fs::write(dir.join("alpha.yaml"), "name: alpha\nselects: [x]\n").unwrap();
        std::fs::write(
            dir.join("notes.txt"),
            "ignored because the extension is wrong\n",
        )
        .unwrap();
        let got = load_variant_configs_from_dir(dir).unwrap();
        let names: Vec<&str> = got.iter().map(|v| v.name.as_str()).collect();
        assert_eq!(
            names,
            vec!["alpha", "zeta"],
            "results must be sorted by filename for reproducibility"
        );
        assert_eq!(got[0].selects, vec!["x"]);
        assert_eq!(got[1].selects, vec!["a", "b"]);
    }

    #[test]
    fn load_variant_configs_from_dir_rejects_duplicate_names() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("a.yaml"), "name: dupe\nselects: [x]\n").unwrap();
        std::fs::write(dir.join("b.yaml"), "name: dupe\nselects: [y]\n").unwrap();
        let err = load_variant_configs_from_dir(dir).unwrap_err();
        let msg = format!("{err}");
        assert!(msg.contains("duplicate variant name 'dupe'"), "got: {msg}");
    }

    #[test]
    fn load_variant_configs_from_dir_surfaces_parse_errors() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("bad.yaml"), "name: 12345\nselects: not-a-list\n").unwrap();
        let err = load_variant_configs_from_dir(dir).unwrap_err();
        let msg = format!("{err}");
        assert!(msg.contains("parsing variant config"), "got: {msg}");
    }

    // #532: a feature-model binding file (`variants:` list + `bindings:` map)
    // can legitimately live in artifacts/variants/ beside the single-variant
    // configs it binds. The loader must skip it rather than fail with
    // "missing field `name`".
    #[test]
    fn load_variant_configs_from_dir_skips_binding_files() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        // The repro from #532: real single-variant configs beside a binding
        // file. Only the named configs should load; the binding file is
        // silently skipped.
        std::fs::write(
            dir.join("sem-m3-gcc.yaml"),
            "name: sem-m3-gcc\nselects: [m3, gcc]\n",
        )
        .unwrap();
        std::fs::write(
            dir.join("sem-smp-x86.yaml"),
            "name: sem-smp-x86\nselects: [smp, x86]\n",
        )
        .unwrap();
        std::fs::write(
            dir.join("bindings.yaml"),
            r#"
variants:
  - name: sem-m3-gcc
    selects: [m3, gcc]
bindings:
  m3:
    artifacts: []
  gcc:
    artifacts: []
"#,
        )
        .unwrap();
        let got = load_variant_configs_from_dir(dir).expect("binding file must not fail the load");
        let names: Vec<&str> = got.iter().map(|v| v.name.as_str()).collect();
        assert_eq!(
            names,
            vec!["sem-m3-gcc", "sem-smp-x86"],
            "binding file must be skipped; only single-variant configs load"
        );
    }

    // The wrapped variant config form `rivet variant init` writes (#514) has
    // a top-level `variant:` key alongside a `bindings:` block. The skip
    // discriminator must NOT confuse it with a pure binding file — and the
    // loader must still surface its parse failure (it's not in flat form),
    // not silently drop it. This is the regression guard for the discriminator.
    #[test]
    fn load_variant_configs_from_dir_does_not_skip_wrapped_variant_form() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(
            dir.join("init.yaml"),
            r#"
variant:
  name: kiln
  selects: [telemetry]
bindings:
  telemetry:
    artifacts: []
"#,
        )
        .unwrap();
        // The loader currently uses flat-form parsing, so this surfaces as a
        // parse error rather than silently disappearing — that's the
        // contract we need to preserve. (If/when the loader adopts
        // `VariantConfig::from_yaml_str`, this test should flip to assert
        // the wrapped form loads, which is fine — but the binding-file
        // skip must not have absorbed it.)
        let err = load_variant_configs_from_dir(dir).unwrap_err();
        let msg = format!("{err}");
        assert!(msg.contains("parsing variant config"), "got: {msg}");
    }

    // ── Feature-model composition (REQ-083) ────────────────────────────

    const SUB_POWERTRAIN: &str = r#"
kind: feature-model
root: powertrain
features:
  powertrain:
    group: alternative
    children: [four-wheel, two-wheel]
  four-wheel: { group: leaf }
  two-wheel: { group: leaf }
"#;

    /// rivet: verifies REQ-083
    #[test]
    fn compose_two_files_namespaces_submodel() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("powertrain.yaml"), SUB_POWERTRAIN).unwrap();
        std::fs::write(
            dir.join("vehicle.yaml"),
            r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        let model = FeatureModel::load_composed(&bpath).unwrap();
        assert_eq!(model.root, "vehicle");
        // Sub-model features are namespaced under the mount prefix.
        assert!(model.features.contains_key("pwt:powertrain"));
        assert!(model.features.contains_key("pwt:four-wheel"));
        assert!(model.features.contains_key("pwt:two-wheel"));
        // The mount-point feature gained the sub-model root as a child.
        assert_eq!(
            model.features["powertrain"].children,
            vec!["pwt:powertrain".to_string()]
        );
        // The sub-model file is also a valid standalone model.
        let standalone = FeatureModel::from_yaml(SUB_POWERTRAIN).unwrap();
        assert_eq!(standalone.root, "powertrain");
        assert!(standalone.features.contains_key("four-wheel"));
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_three_files_recursive() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(
            dir.join("ecu.yaml"),
            r#"
kind: feature-model
root: ecu-control
features:
  ecu-control:
    group: or
    children: [torque-vectoring, abs]
  torque-vectoring: { group: leaf }
  abs: { group: leaf }
"#,
        )
        .unwrap();
        std::fs::write(
            dir.join("powertrain.yaml"),
            r#"
kind: feature-model
root: powertrain
features:
  powertrain:
    group: mandatory
    children: [wheels, ecu-control]
  wheels: { group: leaf }
  ecu-control:
    group: mandatory
"#,
        )
        .unwrap();
        std::fs::write(
            dir.join("vehicle.yaml"),
            r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
  - parent: powertrain.yaml
    mount:
      ecu-control:
        model: ecu.yaml
        prefix: ecu
"#,
        )
        .unwrap();

        let model = FeatureModel::load_composed(&bpath).unwrap();
        assert_eq!(model.root, "vehicle");
        assert!(model.features.contains_key("pwt:powertrain"));
        assert!(model.features.contains_key("pwt:wheels"));
        // The deepest sub-model is mounted into powertrain, which is
        // itself mounted — so its features carry both prefixes, namespaced
        // by the full mount path.
        assert!(model.features.contains_key("pwt:ecu:ecu-control"));
        assert!(model.features.contains_key("pwt:ecu:torque-vectoring"));
        assert!(model.features.contains_key("pwt:ecu:abs"));
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_parent_constraint_references_prefixed_child() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("sub.yaml"), SUB_POWERTRAIN).unwrap();
        std::fs::write(
            dir.join("top.yaml"),
            r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [body, powertrain]
  body:
    group: alternative
    children: [car, motorcycle]
  car: { group: leaf }
  motorcycle: { group: leaf }
  powertrain:
    group: mandatory
constraints:
  - (implies car pwt:four-wheel)
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: top.yaml
    mount:
      powertrain:
        model: sub.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        // The top model's constraint references a prefixed child feature;
        // it must parse against the composed feature set.
        let model = FeatureModel::load_composed(&bpath).unwrap();
        assert_eq!(model.constraints.len(), 1);
        assert!(model.features.contains_key("pwt:four-wheel"));
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_same_submodel_two_prefixes_no_collision() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(
            dir.join("axle.yaml"),
            r#"
kind: feature-model
root: axle
features:
  axle:
    group: alternative
    children: [driven, free]
  driven: { group: leaf }
  free: { group: leaf }
"#,
        )
        .unwrap();
        std::fs::write(
            dir.join("car.yaml"),
            r#"
kind: feature-model
root: car
features:
  car:
    group: mandatory
    children: [front-axle, rear-axle]
  front-axle:
    group: mandatory
  rear-axle:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: car.yaml
    mount:
      front-axle:
        model: axle.yaml
        prefix: front
      rear-axle:
        model: axle.yaml
        prefix: rear
"#,
        )
        .unwrap();

        let model = FeatureModel::load_composed(&bpath).unwrap();
        assert!(model.features.contains_key("front:axle"));
        assert!(model.features.contains_key("front:driven"));
        assert!(model.features.contains_key("rear:axle"));
        assert!(model.features.contains_key("rear:driven"));
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_missing_model_file_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(
            dir.join("top.yaml"),
            r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: top.yaml
    mount:
      powertrain:
        model: nonexistent.yaml
        prefix: pwt
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("nonexistent.yaml"), "got: {err}");
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_duplicate_prefix_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("sub.yaml"), SUB_POWERTRAIN).unwrap();
        std::fs::write(
            dir.join("car.yaml"),
            r#"
kind: feature-model
root: car
features:
  car:
    group: mandatory
    children: [a, b]
  a:
    group: mandatory
  b:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: car.yaml
    mount:
      a:
        model: sub.yaml
        prefix: dup
      b:
        model: sub.yaml
        prefix: dup
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("prefix"), "got: {err}");
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_unknown_mount_point_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("sub.yaml"), SUB_POWERTRAIN).unwrap();
        std::fs::write(
            dir.join("top.yaml"),
            r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [chassis]
  chassis:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: top.yaml
    mount:
      no-such-feature:
        model: sub.yaml
        prefix: pwt
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(
            format!("{err}").contains("mount point")
                && format!("{err}").contains("no-such-feature"),
            "got: {err}"
        );
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_leaf_mount_point_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("sub.yaml"), SUB_POWERTRAIN).unwrap();
        std::fs::write(
            dir.join("top.yaml"),
            r#"
kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain: { group: leaf }
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"
kind: feature-model-binding
compose:
  - parent: top.yaml
    mount:
      powertrain:
        model: sub.yaml
        prefix: pwt
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("leaf"), "got: {err}");
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_empty_compose_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let bpath = tmp.path().join("binding.yaml");
        std::fs::write(&bpath, "kind: feature-model-binding\ncompose: []\n").unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("empty"), "got: {err}");
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_parent_listed_twice_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let bpath = tmp.path().join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      a:
        model: sub.yaml
        prefix: p1
  - parent: vehicle.yaml
    mount:
      b:
        model: sub.yaml
        prefix: p2
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("more than once"), "got: {err}");
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_multiple_roots_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let bpath = tmp.path().join("binding.yaml");
        // Two parents, neither mounted by the other — no single root.
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: a.yaml
    mount:
      f:
        model: x.yaml
        prefix: p1
  - parent: b.yaml
    mount:
      g:
        model: y.yaml
        prefix: p2
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("root"), "got: {err}");
    }

    /// rivet: verifies REQ-083
    #[test]
    fn compose_cyclic_binding_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let bpath = tmp.path().join("binding.yaml");
        // a mounts b, b mounts a — every parent is also mounted, no root.
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: a.yaml
    mount:
      fa:
        model: b.yaml
        prefix: pb
  - parent: b.yaml
    mount:
      fb:
        model: a.yaml
        prefix: pa
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("cyclic"), "got: {err}");
    }

    /// A composition cycle deeper than the root (root -> a -> b -> a) is
    /// caught by the recursion-path guard, not root detection.
    ///
    /// rivet: verifies REQ-083
    #[test]
    fn compose_deep_cycle_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        let model = |root: &str, child: &str| {
            format!(
                "kind: feature-model\nroot: {root}\nfeatures:\n  {root}:\n    \
                 group: mandatory\n    children: [{child}]\n  {child}:\n    \
                 group: mandatory\n"
            )
        };
        std::fs::write(dir.join("root.yaml"), model("r", "ma")).unwrap();
        std::fs::write(dir.join("a.yaml"), model("a", "mb")).unwrap();
        std::fs::write(dir.join("b.yaml"), model("b", "ma2")).unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: root.yaml
    mount:
      ma:
        model: a.yaml
        prefix: pa
  - parent: a.yaml
    mount:
      mb:
        model: b.yaml
        prefix: pb
  - parent: b.yaml
    mount:
      ma2:
        model: a.yaml
        prefix: pa2
"#,
        )
        .unwrap();
        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("cycle"), "got: {err}");
    }

    /// A sub-model's own constraints are prefixed during composition so
    /// they keep referring to the right (now namespaced) features. Proven
    /// end-to-end: the constraint must still fire under the solver.
    ///
    /// rivet: verifies REQ-083
    #[test]
    fn compose_prefixes_submodel_constraints() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(
            dir.join("powertrain.yaml"),
            r#"kind: feature-model
root: powertrain
features:
  powertrain:
    group: mandatory
    children: [drive, extras]
  drive:
    group: alternative
    children: [four-wheel, two-wheel]
  four-wheel: { group: leaf }
  two-wheel: { group: leaf }
  extras:
    group: optional
    children: [traction-control]
  traction-control: { group: leaf }
constraints:
  - (implies four-wheel traction-control)
"#,
        )
        .unwrap();
        std::fs::write(
            dir.join("vehicle.yaml"),
            r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        let model = FeatureModel::load_composed(&bpath).unwrap();
        assert_eq!(model.constraints.len(), 1);

        // If `four-wheel` in the sub-model's constraint was not rewritten
        // to `pwt:four-wheel`, the implication would not fire for the
        // prefixed selection. Solving proves the prefixing happened.
        let vc = VariantConfig {
            name: "t".to_string(),
            selects: vec!["pwt:four-wheel".to_string()],
        };
        let resolved = solve(&model, &vc).unwrap();
        assert!(
            resolved.effective_features.contains("pwt:traction-control"),
            "the sub-model constraint must be prefixed and still fire: {:?}",
            resolved.effective_features
        );
    }

    /// A sub-model's `attribute-schema` is carried into the composed model.
    ///
    /// rivet: verifies REQ-083
    #[test]
    fn compose_merges_submodel_attribute_schema() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(
            dir.join("powertrain.yaml"),
            r#"kind: feature-model
root: powertrain
attribute-schema:
  power-kw:
    type: int
features:
  powertrain:
    group: alternative
    children: [four-wheel, two-wheel]
  four-wheel:
    group: leaf
    attributes:
      power-kw: 150
  two-wheel:
    group: leaf
    attributes:
      power-kw: 60
"#,
        )
        .unwrap();
        std::fs::write(
            dir.join("vehicle.yaml"),
            r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        let model = FeatureModel::load_composed(&bpath).unwrap();
        assert!(
            model.attribute_schema.contains_key("power-kw"),
            "the sub-model's attribute-schema must be carried into the \
             composed model"
        );
    }

    /// The same attribute-schema key declared by two composed models is a
    /// hard error — composition must not silently pick one.
    ///
    /// rivet: verifies REQ-083
    #[test]
    fn compose_attribute_schema_collision_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(
            dir.join("powertrain.yaml"),
            r#"kind: feature-model
root: powertrain
attribute-schema:
  power-kw:
    type: int
features:
  powertrain: { group: leaf }
"#,
        )
        .unwrap();
        std::fs::write(
            dir.join("vehicle.yaml"),
            r#"kind: feature-model
root: vehicle
attribute-schema:
  power-kw:
    type: string
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        let err = FeatureModel::load_composed(&bpath).unwrap_err();
        assert!(format!("{err}").contains("attribute-schema"), "got: {err}");
    }

    /// `FeatureModel::load` dispatches on `kind:` — a plain model file is
    /// parsed directly, a `feature-model-binding` file is composed.
    ///
    /// rivet: verifies REQ-083
    #[test]
    fn load_dispatches_on_kind() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();

        let plain = dir.join("plain.yaml");
        std::fs::write(&plain, SUB_POWERTRAIN).unwrap();
        let m = FeatureModel::load(&plain).unwrap();
        assert_eq!(m.root, "powertrain");

        std::fs::write(dir.join("powertrain.yaml"), SUB_POWERTRAIN).unwrap();
        std::fs::write(
            dir.join("vehicle.yaml"),
            r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();
        let composed = FeatureModel::load(&bpath).unwrap();
        assert_eq!(composed.root, "vehicle");
        assert!(composed.features.contains_key("pwt:four-wheel"));
    }

    /// An unreadable or malformed binding file fails loudly, naming the
    /// file — never a silent skip.
    ///
    /// rivet: verifies REQ-083
    #[test]
    fn compose_unreadable_binding_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        // Nonexistent binding path.
        let missing = tmp.path().join("nope.yaml");
        assert!(FeatureModel::load_composed(&missing).is_err());
        // Malformed YAML.
        let bad = tmp.path().join("bad.yaml");
        std::fs::write(&bad, "kind: feature-model-binding\ncompose: [: : :\n").unwrap();
        let err = FeatureModel::load_composed(&bad).unwrap_err();
        assert!(
            format!("{err}").contains("feature-model-binding"),
            "got: {err}"
        );
    }

    // ── Cross-repo composition (REQ-085) ────────────────────────────────

    /// `load_composed_with_externals` resolves a mount whose `model:` is
    /// of the form `<external-prefix>:<inner-path>` against the
    /// externals map (the synced-repo-root for that prefix), exactly
    /// matching how `rivet.yaml` `externals:` already work for
    /// artifact cross-references.
    ///
    /// rivet: verifies REQ-085
    #[test]
    fn compose_with_externals_resolves_prefixed_mount() {
        let tmp = tempfile::tempdir().unwrap();
        let consumer = tmp.path().join("consumer");
        let ext = tmp.path().join("externals").join("acme-pwt");
        std::fs::create_dir_all(&consumer).unwrap();
        std::fs::create_dir_all(&ext).unwrap();

        // External repo (synced root): the powertrain sub-model.
        std::fs::write(ext.join("powertrain.yaml"), SUB_POWERTRAIN).unwrap();

        // Consumer: the top model + the binding.
        std::fs::write(
            consumer.join("vehicle.yaml"),
            r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = consumer.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: acme-pwt:powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        let mut externals: BTreeMap<String, std::path::PathBuf> = BTreeMap::new();
        externals.insert("acme-pwt".to_string(), ext.clone());

        let model = FeatureModel::load_composed_with_externals(&bpath, &externals).unwrap();
        assert_eq!(model.root, "vehicle");
        // The external's features are mounted under the binding's prefix —
        // proves the path resolved through the externals map, not through
        // base_dir.
        assert!(model.features.contains_key("pwt:powertrain"));
        assert!(model.features.contains_key("pwt:four-wheel"));
        assert!(model.features.contains_key("pwt:two-wheel"));
    }

    /// A mount that names an external prefix `rivet.yaml` does not
    /// declare must fail loudly — never a silent fall-back to local
    /// path resolution that won't find the file. Inherits REQ-083's
    /// F2 ethos.
    ///
    /// rivet: verifies REQ-085
    #[test]
    fn compose_with_externals_unknown_prefix_is_error() {
        let tmp = tempfile::tempdir().unwrap();
        std::fs::write(
            tmp.path().join("vehicle.yaml"),
            r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = tmp.path().join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: typo-prefix:powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        // Externals declare `acme-pwt`, NOT `typo-prefix`.
        let mut externals: BTreeMap<String, std::path::PathBuf> = BTreeMap::new();
        externals.insert("acme-pwt".to_string(), tmp.path().to_path_buf());

        let err = FeatureModel::load_composed_with_externals(&bpath, &externals).unwrap_err();
        let msg = format!("{err}");
        assert!(
            msg.contains("typo-prefix") && msg.contains("declared"),
            "unknown external prefix must error loudly naming the prefix and \
             the declared set; got: {msg}"
        );
    }

    /// Backward compat: `load_composed_with_externals` called with an
    /// empty externals map behaves exactly like `load_composed` for
    /// bindings that use only local relative paths — REQ-083's existing
    /// composition is unchanged.
    ///
    /// rivet: verifies REQ-085
    #[test]
    fn compose_with_empty_externals_treats_paths_as_local() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path();
        std::fs::write(dir.join("powertrain.yaml"), SUB_POWERTRAIN).unwrap();
        std::fs::write(
            dir.join("vehicle.yaml"),
            r#"kind: feature-model
root: vehicle
features:
  vehicle:
    group: mandatory
    children: [powertrain]
  powertrain:
    group: mandatory
"#,
        )
        .unwrap();
        let bpath = dir.join("binding.yaml");
        std::fs::write(
            &bpath,
            r#"kind: feature-model-binding
compose:
  - parent: vehicle.yaml
    mount:
      powertrain:
        model: powertrain.yaml
        prefix: pwt
"#,
        )
        .unwrap();

        let externals: BTreeMap<String, std::path::PathBuf> = BTreeMap::new();
        let model = FeatureModel::load_composed_with_externals(&bpath, &externals).unwrap();
        assert_eq!(model.root, "vehicle");
        assert!(model.features.contains_key("pwt:powertrain"));
        assert!(model.features.contains_key("pwt:four-wheel"));
    }
}
