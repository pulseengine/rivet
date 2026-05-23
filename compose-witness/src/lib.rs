//! REQ-086 PoC — Wasm component exposing the REQ-083 composition core's
//! pure constraint-prefixing path. The pulseengine `witness` tool
//! instruments the resulting Wasm and emits MC/DC truth tables for every
//! decision in `prefix_model_yaml` / `prefix_constraint` /
//! `flush_constraint_token` — closing the witness->rivet
//! requirement-to-test evidence loop.
//!
//! The pure functions are inlined here (copied from
//! rivet-core/src/feature_model.rs) so this crate has zero dependency on
//! rivet-core — rivet-core uses `std::fs`/salsa/rowan etc. and would not
//! compile to wasm32 as-is. A v2 increment extracts the pure module into
//! a shared crate both depend on; v1 deliberately duplicates so the wasm
//! component is the absolute minimum surface witness needs to measure.
//!
//! rivet: verifies REQ-086

#![allow(clippy::missing_docs_in_private_items)]

#[allow(warnings)]
mod bindings;

use bindings::exports::pulseengine::compose_witness::compose::Guest;
use serde::{Deserialize, Serialize};
use std::collections::{BTreeMap, BTreeSet};

struct Component;

impl Guest for Component {
    fn prefix_features(model_yaml: String, prefix: String) -> Result<String, String> {
        prefix_features_impl(&model_yaml, &prefix)
    }
}

bindings::export!(Component with_types_in bindings);

// ── On-disk YAML shape (subset, mirrored from rivet-core) ────────────────
//
// Only the fields the prefixing path touches. Anything else (e.g.
// `attribute-schema`, an unknown future field) round-trips as a
// `serde_yaml::Value` so the rewriter is forward-compatible without
// pulling in the full rivet-core type set.

#[derive(Debug, Deserialize, Serialize)]
struct FeatureModelYaml {
    #[serde(default, skip_serializing_if = "Option::is_none")]
    kind: Option<String>,
    root: String,
    #[serde(default)]
    features: BTreeMap<String, FeatureYaml>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    constraints: Vec<String>,
    #[serde(
        default,
        rename = "attribute-schema",
        skip_serializing_if = "BTreeMap::is_empty"
    )]
    attribute_schema: BTreeMap<String, serde_yaml::Value>,
}

#[derive(Debug, Deserialize, Serialize)]
struct FeatureYaml {
    // `group` is preserved as a string — the prefixing logic does not
    // need GroupType semantics, only the field round-trips.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    group: Option<String>,
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    children: Vec<String>,
    #[serde(default, skip_serializing_if = "BTreeMap::is_empty")]
    attributes: BTreeMap<String, serde_yaml::Value>,
}

// ── Pure prefixing (mirrored from rivet-core/src/feature_model.rs) ───────

fn prefix_features_impl(model_yaml: &str, prefix: &str) -> Result<String, String> {
    if prefix.is_empty() {
        return Err("prefix must be non-empty".into());
    }
    let raw: FeatureModelYaml =
        serde_yaml::from_str(model_yaml).map_err(|e| format!("parse feature-model YAML: {e}"))?;
    let prefixed = prefix_model_yaml(raw, prefix);
    serde_yaml::to_string(&prefixed).map_err(|e| format!("emit feature-model YAML: {e}"))
}

fn prefix_model_yaml(raw: FeatureModelYaml, prefix: &str) -> FeatureModelYaml {
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
