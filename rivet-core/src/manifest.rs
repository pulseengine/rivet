//! Repository boundary manifest (rivet#1159).
//!
//! The embedded `manifest` schema (`schemas/manifest.yaml`) declares two
//! artifact types: `provides` (what a repository ships) and `consumes` (what
//! it pins from other repositories). This module holds the two pieces the
//! YAML schema cannot express on its own:
//!
//! - [`validate_manifest`]: structured checks that fail `rivet validate`
//!   with an ERROR — the `kind` enum, kind-specific required fields and
//!   enums, the locator, and the nested `pin: {kind, value}` mapping.
//!   Generic `allowed-values` findings are only warnings, and the
//!   conditional-rule engine can neither scope a rule to one artifact type
//!   nor test membership in a set, so these live here.
//! - [`export`]: the `pulseengine.manifest/1` JSON document written by
//!   `rivet manifest export` (contract: `schemas/pulseengine.manifest.v1.json`).
//!
//! Both are no-ops for projects that do not load the `manifest` schema:
//! they only look at artifacts of the two manifest types, and only when the
//! merged schema declares those types.

use crate::model::Artifact;
use crate::schema::{Schema, Severity};
use crate::store::Store;
use crate::validate::Diagnostic;

/// `schema_version` of the exported document.
pub const MANIFEST_SCHEMA_VERSION: &str = "pulseengine.manifest/1";

/// Conventional file name of the exported document.
pub const MANIFEST_FILE_NAME: &str = "pulseengine.manifest.json";

/// Artifact type for a provided deliverable.
pub const PROVIDES_TYPE: &str = "provides";

/// Artifact type for a consumed (pinned) upstream deliverable.
pub const CONSUMES_TYPE: &str = "consumes";

/// Schema field holding the manifest entry's identifier. `id` itself is the
/// rivet artifact id (a reserved top-level key), so the entry id lives here
/// and is exported as `id`.
pub const ENTRY_ID_FIELD: &str = "entry-id";

/// Link type for the gate binding of a `provides` entry.
pub const GATED_BY_LINK: &str = "gated-by";

/// Field listing CI check contexts that gate a `provides` entry.
pub const REQUIRED_CHECKS_FIELD: &str = "required-checks";

/// Allowed values of `pin.kind` on a `consumes` artifact.
pub const PIN_KINDS: &[&str] = &["tag", "rev", "sha256", "path+ref", "oci"];

/// What each `provides` kind requires beyond the always-required fields.
pub struct KindRule {
    /// The `kind` value.
    pub kind: &'static str,
    /// Fields that must be present for this kind.
    pub required_fields: &'static [&'static str],
    /// Whether a locator (`path` or `oci`) is required.
    pub needs_locator: bool,
}

/// Every allowed `provides` kind with its kind-specific requirements.
/// The order is the order of `allowed-values` in `schemas/manifest.yaml`;
/// `kind_table_matches_schema` keeps the two in sync.
pub const PROVIDES_KINDS: &[KindRule] = &[
    KindRule {
        kind: "crate",
        required_fields: &["workspace"],
        needs_locator: true,
    },
    KindRule {
        kind: "component",
        required_fields: &[],
        needs_locator: true,
    },
    KindRule {
        kind: "wit-package",
        required_fields: &[],
        needs_locator: true,
    },
    KindRule {
        kind: "release-asset",
        required_fields: &["asset"],
        needs_locator: true,
    },
    KindRule {
        kind: "proof-target",
        required_fields: &["backend"],
        needs_locator: true,
    },
    KindRule {
        kind: "bazel-target",
        required_fields: &["mode"],
        needs_locator: true,
    },
    KindRule {
        kind: "required-check",
        required_fields: &["context"],
        needs_locator: false,
    },
    KindRule {
        kind: "contract",
        required_fields: &["contract"],
        needs_locator: true,
    },
    KindRule {
        kind: "tool",
        required_fields: &[],
        needs_locator: true,
    },
    KindRule {
        kind: "oci",
        required_fields: &["oci"],
        needs_locator: true,
    },
];

/// Kind-specific enum fields on `provides`, enforced at ERROR severity.
pub const PROVIDES_ENUMS: &[(&str, &[&str])] = &[
    ("workspace", &["root", "nested"]),
    ("backend", &["kani", "verus", "rocq", "lean"]),
    ("mode", &["must-build", "waived"]),
    ("contract", &["seam", "wire-binding", "table"]),
];

/// The scalar text of a field value, or `None` when it is absent, null, or
/// not a scalar.
fn scalar_text(v: &rivet_yaml::Value) -> Option<String> {
    match v {
        rivet_yaml::Value::String(s) => Some(s.clone()),
        rivet_yaml::Value::Number(n) => Some(n.to_string()),
        rivet_yaml::Value::Bool(b) => Some(b.to_string()),
        rivet_yaml::Value::Tagged(t) => scalar_text(&t.value),
        rivet_yaml::Value::Null
        | rivet_yaml::Value::Sequence(_)
        | rivet_yaml::Value::Mapping(_) => None,
    }
}

fn field_text(artifact: &Artifact, name: &str) -> Option<String> {
    artifact.fields.get(name).and_then(scalar_text)
}

fn error(artifact: &Artifact, rule: &str, message: String) -> Diagnostic {
    Diagnostic {
        severity: Severity::Error,
        artifact_id: Some(artifact.id.clone()),
        rule: rule.to_string(),
        message,
        source_file: None,
        line: None,
        column: None,
    }
}

fn is_external(artifact: &Artifact) -> bool {
    artifact.id.contains(':')
}

/// Structured checks for `provides` / `consumes` artifacts.
///
/// Returns ERROR diagnostics only. Missing always-required fields (`kind`,
/// `entry-id`, `version`, `repo`, `pin`) are reported by the generic
/// `required-field` check and are not repeated here.
pub fn validate_manifest(store: &Store, schema: &Schema) -> Vec<Diagnostic> {
    let has_provides = schema.artifact_type(PROVIDES_TYPE).is_some();
    let has_consumes = schema.artifact_type(CONSUMES_TYPE).is_some();
    let mut out = Vec::new();
    if !has_provides && !has_consumes {
        return out;
    }
    for artifact in store.iter_sorted() {
        if is_external(artifact) {
            continue;
        }
        if has_provides && artifact.artifact_type == PROVIDES_TYPE {
            check_provides(artifact, &mut out);
        } else if has_consumes && artifact.artifact_type == CONSUMES_TYPE {
            check_consumes(artifact, &mut out);
        }
    }
    out
}

/// A required string field that is present but empty (`version: ""`)
/// passes the generic presence check; reject it here.
fn check_non_empty(artifact: &Artifact, fields: &[&str], out: &mut Vec<Diagnostic>) {
    for field in fields {
        if field_text(artifact, field).is_some_and(|v| v.trim().is_empty()) {
            out.push(error(
                artifact,
                "manifest-empty",
                format!(
                    "{} field '{field}' must not be empty",
                    artifact.artifact_type
                ),
            ));
        }
    }
}

fn check_provides(artifact: &Artifact, out: &mut Vec<Diagnostic>) {
    check_non_empty(artifact, &[ENTRY_ID_FIELD, "version"], out);
    // Enum fields first: a wrong value is reported whatever the kind.
    for (field, allowed) in PROVIDES_ENUMS {
        if let Some(v) = field_text(artifact, field) {
            if !allowed.contains(&v.as_str()) {
                out.push(error(
                    artifact,
                    "manifest-enum",
                    format!(
                        "provides field '{field}' has value '{v}'; allowed: {}",
                        allowed.join(", ")
                    ),
                ));
            }
        }
    }

    let Some(kind) = field_text(artifact, "kind") else {
        // Absent: `required-field` reports it. Non-scalar: say so here.
        if artifact.fields.contains_key("kind") {
            out.push(error(
                artifact,
                "manifest-kind",
                "provides field 'kind' must be a string".to_string(),
            ));
        }
        return;
    };
    let Some(rule) = PROVIDES_KINDS.iter().find(|r| r.kind == kind) else {
        let allowed: Vec<&str> = PROVIDES_KINDS.iter().map(|r| r.kind).collect();
        out.push(error(
            artifact,
            "manifest-kind",
            format!(
                "provides kind '{kind}' is not a manifest kind; allowed: {}",
                allowed.join(", ")
            ),
        ));
        return;
    };

    for field in rule.required_fields {
        if field_text(artifact, field).is_none_or(|v| v.trim().is_empty()) {
            out.push(error(
                artifact,
                "manifest-kind-field",
                format!("provides of kind '{kind}' requires field '{field}'"),
            ));
        }
    }
    if kind == "bazel-target"
        && field_text(artifact, "mode").as_deref() == Some("waived")
        && field_text(artifact, "waiver").is_none_or(|v| v.trim().is_empty())
    {
        out.push(error(
            artifact,
            "manifest-kind-field",
            "a waived bazel-target requires field 'waiver' (the issue that tracks the waiver)"
                .to_string(),
        ));
    }
    if rule.needs_locator {
        let has = |f: &str| field_text(artifact, f).is_some_and(|v| !v.trim().is_empty());
        if !has("path") && !has("oci") {
            out.push(error(
                artifact,
                "manifest-locator",
                format!("provides of kind '{kind}' needs a locator: set 'path' or 'oci'"),
            ));
        }
    }
}

fn check_consumes(artifact: &Artifact, out: &mut Vec<Diagnostic>) {
    check_non_empty(artifact, &["repo", ENTRY_ID_FIELD], out);
    // Absent `pin`: `required-field` reports it.
    let Some(pin) = artifact.fields.get("pin") else {
        return;
    };
    let Some(map) = pin.as_mapping() else {
        out.push(error(
            artifact,
            "manifest-pin",
            "consumes field 'pin' must be a mapping {kind: <kind>, value: <value>}".to_string(),
        ));
        return;
    };
    match map.get("kind").and_then(scalar_text) {
        None => out.push(error(
            artifact,
            "manifest-pin",
            format!(
                "consumes pin is missing 'kind' (one of {})",
                PIN_KINDS.join(", ")
            ),
        )),
        Some(k) if !PIN_KINDS.contains(&k.as_str()) => out.push(error(
            artifact,
            "manifest-pin",
            format!(
                "consumes pin.kind '{k}' is not a pin kind; allowed: {}",
                PIN_KINDS.join(", ")
            ),
        )),
        Some(_) => {}
    }
    if map
        .get("value")
        .and_then(scalar_text)
        .is_none_or(|v| v.trim().is_empty())
    {
        out.push(error(
            artifact,
            "manifest-pin",
            "consumes pin.value must be a non-empty value".to_string(),
        ));
    }
}

// ── Export ──────────────────────────────────────────────────────────────

/// Inputs for [`export`] that do not come from the store.
#[derive(Debug, Clone)]
pub struct ExportOptions {
    /// Repository identity written to `repo`.
    pub repo: String,
    /// Release tag written to `release.tag` (`null` when `None`).
    pub tag: Option<String>,
}

/// A field value as JSON. A scalar in a field the schema declares `string`
/// is emitted as a string even when YAML read it as a number or boolean
/// (`version: 1`), so the document matches its JSON Schema; the `pin`
/// mapping's `kind` / `value` get the same treatment.
fn field_json(name: &str, v: &rivet_yaml::Value, string_fields: &[&str]) -> serde_json::Value {
    if string_fields.contains(&name) {
        if let Some(s) = scalar_text(v) {
            return serde_json::Value::String(s);
        }
    }
    if name == "pin" {
        if let Some(map) = v.as_mapping() {
            let mut out = serde_json::Map::new();
            for (k, child) in map {
                let key = scalar_text(k).unwrap_or_default();
                let val = match scalar_text(child) {
                    Some(s) if key == "kind" || key == "value" => serde_json::Value::String(s),
                    _ => crate::variant_emit::yaml_to_json(child),
                };
                out.insert(key, val);
            }
            return serde_json::Value::Object(out);
        }
    }
    crate::variant_emit::yaml_to_json(v)
}

/// One manifest entry: every declared field of the artifact, with
/// `entry-id` renamed to `id`, plus the rivet `artifact` id and `title`.
fn entry(artifact: &Artifact, schema: &Schema) -> serde_json::Map<String, serde_json::Value> {
    let string_fields: Vec<&str> = schema
        .artifact_type(&artifact.artifact_type)
        .map(|t| {
            t.fields
                .iter()
                .filter(|f| f.field_type == "string")
                .map(|f| f.name.as_str())
                .collect()
        })
        .unwrap_or_default();
    let mut m = serde_json::Map::new();
    for (k, v) in &artifact.fields {
        let key = if k == ENTRY_ID_FIELD {
            "id"
        } else {
            k.as_str()
        };
        m.insert(key.to_string(), field_json(k, v, &string_fields));
    }
    m.insert(
        "artifact".to_string(),
        serde_json::Value::String(artifact.id.clone()),
    );
    m.insert(
        "title".to_string(),
        serde_json::Value::String(artifact.title.clone()),
    );
    m
}

/// Build the `pulseengine.manifest/1` document from the store.
///
/// `provides[]` / `consumes[]` carry every field of their artifact (in id
/// order). `gates[]` flattens each `provides` entry's gate binding: one
/// record per `gated-by` link (`kind: artifact`) and one per
/// `required-checks` entry (`kind: required-check`).
pub fn export(store: &Store, schema: &Schema, opts: &ExportOptions) -> serde_json::Value {
    let mut provides = Vec::new();
    let mut consumes = Vec::new();
    let mut gates = Vec::new();
    for artifact in store.iter_sorted() {
        if is_external(artifact) {
            continue;
        }
        if artifact.artifact_type == PROVIDES_TYPE {
            let e = entry(artifact, schema);
            let entry_id = e.get("id").cloned().unwrap_or(serde_json::Value::Null);
            for link in artifact
                .links
                .iter()
                .filter(|l| l.link_type == GATED_BY_LINK)
            {
                let target = store.get(&link.target);
                gates.push(serde_json::json!({
                    "provides": entry_id,
                    "artifact": artifact.id,
                    "kind": "artifact",
                    "ref": link.target,
                    "type": target.map(|t| t.artifact_type.clone()),
                    "status": target.and_then(|t| t.status.clone()),
                }));
            }
            if let Some(rivet_yaml::Value::Sequence(checks)) =
                artifact.fields.get(REQUIRED_CHECKS_FIELD)
            {
                for check in checks.iter().filter_map(scalar_text) {
                    gates.push(serde_json::json!({
                        "provides": entry_id,
                        "artifact": artifact.id,
                        "kind": "required-check",
                        "ref": check,
                    }));
                }
            }
            provides.push(serde_json::Value::Object(e));
        } else if artifact.artifact_type == CONSUMES_TYPE {
            consumes.push(serde_json::Value::Object(entry(artifact, schema)));
        }
    }
    serde_json::json!({
        "schema_version": MANIFEST_SCHEMA_VERSION,
        "repo": opts.repo,
        "release": { "tag": opts.tag },
        "provides": provides,
        "consumes": consumes,
        "gates": gates,
    })
}

#[cfg(test)]
#[allow(clippy::unwrap_used, clippy::expect_used, clippy::indexing_slicing)]
mod tests {
    use super::*;
    use crate::test_helpers::minimal_artifact;

    fn schema() -> Schema {
        let files = vec![
            crate::embedded::load_embedded_schema("common").unwrap(),
            crate::embedded::load_embedded_schema("manifest").unwrap(),
        ];
        Schema::merge(&files)
    }

    fn yaml(s: &str) -> rivet_yaml::Value {
        rivet_yaml::from_str(s).unwrap()
    }

    fn provides(id: &str, fields: &[(&str, &str)]) -> Artifact {
        let mut a = minimal_artifact(id, PROVIDES_TYPE);
        for (k, v) in fields {
            a.fields.insert((*k).to_string(), yaml(v));
        }
        a
    }

    fn consumes(id: &str, pin: Option<&str>) -> Artifact {
        let mut a = minimal_artifact(id, CONSUMES_TYPE);
        a.fields.insert("repo".into(), yaml("pulseengine/spar"));
        a.fields
            .insert(ENTRY_ID_FIELD.into(), yaml("spar-analysis"));
        if let Some(p) = pin {
            a.fields.insert("pin".into(), yaml(p));
        }
        a
    }

    fn rules_for(artifacts: Vec<Artifact>) -> Vec<String> {
        let mut store = Store::default();
        for a in artifacts {
            store.upsert(a);
        }
        validate_manifest(&store, &schema())
            .into_iter()
            .map(|d| format!("{}: {}", d.rule, d.message))
            .collect()
    }

    /// The kind table, the enum table and the YAML schema's
    /// `allowed-values` stay in sync.
    // rivet: verifies REQ-415
    #[test]
    fn kind_table_matches_schema() {
        let s = schema();
        let t = s.artifact_type(PROVIDES_TYPE).unwrap();
        let allowed = |name: &str| {
            t.fields
                .iter()
                .find(|f| f.name == name)
                .and_then(|f| f.allowed_values.clone())
                .unwrap()
        };
        let kinds: Vec<String> = PROVIDES_KINDS.iter().map(|r| r.kind.to_string()).collect();
        assert_eq!(allowed("kind"), kinds);
        for (field, values) in PROVIDES_ENUMS {
            let v: Vec<String> = values.iter().map(|s| s.to_string()).collect();
            assert_eq!(allowed(field), v, "{field}");
        }
        for rule in PROVIDES_KINDS {
            for f in rule.required_fields {
                assert!(
                    t.fields.iter().any(|d| d.name == *f),
                    "kind {} requires undeclared field {f}",
                    rule.kind
                );
            }
        }
    }

    // rivet: verifies REQ-415
    #[test]
    fn valid_entries_produce_no_diagnostics() {
        let d = rules_for(vec![
            provides(
                "PROV-1",
                &[
                    ("kind", "crate"),
                    ("entry-id", "rivet-core"),
                    ("version", "0.1.0"),
                    ("path", "rivet-core"),
                    ("workspace", "nested"),
                ],
            ),
            provides(
                "PROV-2",
                &[
                    ("kind", "required-check"),
                    ("entry-id", "ci-test"),
                    ("version", "1"),
                    ("context", "ci / test"),
                ],
            ),
            consumes("CONS-1", Some("{kind: tag, value: v0.1.0}")),
        ]);
        assert!(d.is_empty(), "{d:?}");
    }

    // rivet: verifies REQ-415
    #[test]
    fn unknown_kind_is_an_error() {
        let d = rules_for(vec![provides(
            "PROV-1",
            &[("kind", "gizmo"), ("entry-id", "x"), ("version", "1")],
        )]);
        assert_eq!(d.len(), 1, "{d:?}");
        assert!(d[0].starts_with("manifest-kind:"), "{d:?}");
    }

    // rivet: verifies REQ-415
    #[test]
    fn kind_specific_fields_enums_and_locator_are_errors() {
        let d = rules_for(vec![
            // crate without workspace and without a locator
            provides(
                "PROV-1",
                &[("kind", "crate"), ("entry-id", "c"), ("version", "1")],
            ),
            // waived bazel target without a waiver
            provides(
                "PROV-2",
                &[
                    ("kind", "bazel-target"),
                    ("entry-id", "//x:y"),
                    ("version", "1"),
                    ("path", "x"),
                    ("mode", "waived"),
                ],
            ),
            // unknown backend
            provides(
                "PROV-3",
                &[
                    ("kind", "proof-target"),
                    ("entry-id", "p"),
                    ("version", "1"),
                    ("path", "proofs"),
                    ("backend", "coq"),
                ],
            ),
        ]);
        let joined = d.join("\n");
        assert!(joined.contains("requires field 'workspace'"), "{joined}");
        assert!(joined.contains("manifest-locator"), "{joined}");
        assert!(joined.contains("requires field 'waiver'"), "{joined}");
        assert!(
            joined.contains("manifest-enum: provides field 'backend' has value 'coq'"),
            "{joined}"
        );
    }

    // rivet: verifies REQ-415
    #[test]
    fn pin_shape_kind_and_value_are_checked() {
        let cases = [
            ("{kind: branch, value: main}", "is not a pin kind"),
            ("{value: v1}", "missing 'kind'"),
            ("{kind: tag, value: ''}", "non-empty"),
            ("{kind: rev}", "non-empty"),
            ("v0.1.0", "must be a mapping"),
        ];
        for (pin, expect) in cases {
            let d = rules_for(vec![consumes("CONS-1", Some(pin))]);
            assert!(
                d.iter().any(|m| m.contains(expect)),
                "pin {pin}: expected {expect:?} in {d:?}"
            );
        }
        // Absent pin is the generic required-field check's job.
        assert!(rules_for(vec![consumes("CONS-1", None)]).is_empty());
        for kind in PIN_KINDS {
            let d = rules_for(vec![consumes(
                "CONS-1",
                Some(&format!("{{kind: '{kind}', value: x}}")),
            )]);
            assert!(d.is_empty(), "{kind}: {d:?}");
        }
    }

    // rivet: verifies REQ-415
    #[test]
    fn no_manifest_schema_means_no_checks() {
        let files = vec![crate::embedded::load_embedded_schema("common").unwrap()];
        let s = Schema::merge(&files);
        let mut store = Store::default();
        store.upsert(provides("PROV-1", &[("kind", "gizmo")]));
        assert!(validate_manifest(&store, &s).is_empty());
    }

    // rivet: verifies REQ-415
    #[test]
    fn export_keeps_every_field_and_flattens_gates() {
        let mut p = provides(
            "PROV-1",
            &[
                ("kind", "crate"),
                ("entry-id", "rivet-core"),
                ("version", "1"),
                ("path", "rivet-core"),
                ("workspace", "nested"),
                ("x-extra", "kept"),
                ("required-checks", "[ci / test]"),
            ],
        );
        p.links.push(crate::model::Link {
            link_type: GATED_BY_LINK.into(),
            target: "TEST-1".into(),
            external: None,
        });
        let mut store = Store::default();
        store.upsert(p);
        store.upsert(consumes("CONS-1", Some("{kind: rev, value: 1234567}")));
        let doc = export(
            &store,
            &schema(),
            &ExportOptions {
                repo: "pulseengine/rivet".into(),
                tag: Some("v0.1.0".into()),
            },
        );
        assert_eq!(doc["schema_version"], MANIFEST_SCHEMA_VERSION);
        assert_eq!(doc["release"]["tag"], "v0.1.0");
        let e = &doc["provides"][0];
        assert_eq!(e["id"], "rivet-core");
        assert!(e.get("entry-id").is_none());
        assert_eq!(e["x-extra"], "kept");
        assert_eq!(e["workspace"], "nested");
        assert_eq!(e["artifact"], "PROV-1");
        // `version: 1` / a numeric rev are YAML numbers; the export emits
        // the strings the JSON Schema requires.
        assert_eq!(e["version"], "1");
        assert_eq!(doc["consumes"][0]["pin"]["kind"], "rev");
        assert_eq!(doc["consumes"][0]["pin"]["value"], "1234567");
        let gates = doc["gates"].as_array().unwrap();
        assert_eq!(gates.len(), 2, "{gates:?}");
        assert_eq!(gates[0]["kind"], "artifact");
        assert_eq!(gates[0]["ref"], "TEST-1");
        assert_eq!(gates[1]["kind"], "required-check");
        assert_eq!(gates[1]["ref"], "ci / test");
    }
}
