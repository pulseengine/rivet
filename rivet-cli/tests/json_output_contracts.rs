// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
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

//! Full conformance of the `--format json` outputs to the contracts shipped
//! in `schemas/json/*.schema.json` (#956 lower tier, REQ-400).
//!
//! The earlier checks only tested that required top-level keys were present.
//! Types, nested shapes, enums and ranges went unchecked, which is how the
//! coverage contract kept saying `percentage` is a number in [0, 100] after
//! the CLI started emitting `null` for an empty scope (REQ-387).
//!
//! No JSON Schema crate is in the workspace (adding one is a supply-chain
//! decision), so this file validates the subset the shipped schemas use. A
//! keyword outside that subset fails the test, so the checker cannot fall
//! behind the schemas silently.

use std::path::{Path, PathBuf};
use std::process::Command;

use serde_json::Value;

fn rivet_bin() -> PathBuf {
    // Compile-time path (REQ-314): a run-time lookup fails under nextest with
    // a non-default CARGO_TARGET_DIR.
    PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

fn project_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

/// Keywords that carry no constraint and are ignored.
const ANNOTATIONS: &[&str] = &["$schema", "$id", "title", "description"];
/// Keywords this validator enforces.
const ENFORCED: &[&str] = &[
    "type",
    "required",
    "properties",
    "additionalProperties",
    "items",
    "const",
    "enum",
    "minimum",
    "maximum",
    "minLength",
];

fn type_matches(name: &str, v: &Value) -> bool {
    match name {
        "object" => v.is_object(),
        "array" => v.is_array(),
        "string" => v.is_string(),
        "number" => v.is_number(),
        "integer" => v.is_i64() || v.is_u64(),
        "boolean" => v.is_boolean(),
        "null" => v.is_null(),
        other => panic!("unsupported JSON Schema type {other:?}"),
    }
}

/// Validate `v` against `schema`, collecting every violation with its path.
fn check(schema: &Value, v: &Value, path: &str, errors: &mut Vec<String>) {
    let Some(obj) = schema.as_object() else {
        panic!("schema at {path} is not an object");
    };
    for key in obj.keys() {
        assert!(
            ANNOTATIONS.contains(&key.as_str()) || ENFORCED.contains(&key.as_str()),
            "schema keyword {key:?} at {path} is not supported by this checker; extend it"
        );
    }
    if let Some(t) = obj.get("type") {
        let names: Vec<&str> = match t {
            Value::String(s) => vec![s.as_str()],
            Value::Array(a) => a.iter().map(|x| x.as_str().expect("type name")).collect(),
            _ => panic!("type at {path} is neither a string nor an array"),
        };
        if !names.iter().any(|n| type_matches(n, v)) {
            errors.push(format!("{path}: expected type {names:?}, got {v}"));
            return;
        }
    }
    if let Some(c) = obj.get("const") {
        if v != c {
            errors.push(format!("{path}: expected const {c}, got {v}"));
        }
    }
    if let Some(Value::Array(options)) = obj.get("enum") {
        if !options.contains(v) {
            errors.push(format!("{path}: {v} is not one of {options:?}"));
        }
    }
    if let Some(n) = v.as_f64() {
        if let Some(min) = obj.get("minimum").and_then(Value::as_f64) {
            if n < min {
                errors.push(format!("{path}: {n} is below the minimum {min}"));
            }
        }
        if let Some(max) = obj.get("maximum").and_then(Value::as_f64) {
            if n > max {
                errors.push(format!("{path}: {n} is above the maximum {max}"));
            }
        }
    }
    if let (Some(min), Some(s)) = (obj.get("minLength").and_then(Value::as_u64), v.as_str()) {
        if (s.chars().count() as u64) < min {
            errors.push(format!("{path}: {s:?} is shorter than minLength {min}"));
        }
    }
    if let Some(map) = v.as_object() {
        if let Some(Value::Array(req)) = obj.get("required") {
            for r in req {
                let r = r.as_str().expect("required entry");
                if !map.contains_key(r) {
                    errors.push(format!("{path}: missing required field {r:?}"));
                }
            }
        }
        let props = obj.get("properties").and_then(Value::as_object);
        for (k, child) in map {
            let child_path = format!("{path}/{k}");
            match props.and_then(|p| p.get(k)) {
                Some(s) => check(s, child, &child_path, errors),
                None => match obj.get("additionalProperties") {
                    Some(Value::Bool(false)) => {
                        errors.push(format!("{path}: unexpected field {k:?}"))
                    }
                    Some(s @ Value::Object(_)) => check(s, child, &child_path, errors),
                    _ => {}
                },
            }
        }
    }
    if let (Some(items), Some(arr)) = (obj.get("items"), v.as_array()) {
        for (i, x) in arr.iter().enumerate() {
            check(items, x, &format!("{path}[{i}]"), errors);
        }
    }
}

fn schema(name: &str) -> Value {
    let p = project_root()
        .join("schemas")
        .join("json")
        .join(format!("{name}-output.schema.json"));
    serde_json::from_str(&std::fs::read_to_string(&p).expect("read schema")).expect("schema JSON")
}

fn run_json(project: &Path, args: &[&str]) -> Value {
    let out = Command::new(rivet_bin())
        .arg("--project")
        .arg(project)
        .args(args)
        .args(["--format", "json"])
        .output()
        .expect("run rivet");
    serde_json::from_slice(&out.stdout).unwrap_or_else(|e| {
        panic!(
            "{args:?} did not print JSON ({e}); stdout: {}",
            String::from_utf8_lossy(&out.stdout)
        )
    })
}

fn assert_conforms(name: &str, output: &Value) {
    let mut errors = Vec::new();
    check(&schema(name), output, "", &mut errors);
    assert!(
        errors.is_empty(),
        "{name} output violates schemas/json/{name}-output.schema.json:\n  {}",
        errors.join("\n  ")
    );
}

fn commands() -> [(&'static str, Vec<&'static str>); 5] {
    [
        ("validate", vec!["validate"]),
        ("stats", vec!["stats"]),
        ("coverage", vec!["coverage"]),
        ("list", vec!["list"]),
        ("query", vec!["query", "(= type \"requirement\")"]),
    ]
}

/// Every contract holds on this repository's own project.
// rivet: verifies REQ-400
#[test]
fn json_outputs_conform_on_the_rivet_project() {
    let root = project_root();
    for (name, args) in commands() {
        assert_conforms(name, &run_json(&root, &args));
    }
}

/// Every contract holds on a project with nothing in scope, where coverage
/// percentages are `null` (REQ-387): the case the old key-presence checks
/// could not see.
// rivet: verifies REQ-400
#[test]
fn json_outputs_conform_on_an_empty_scope() {
    let tmp = tempfile::tempdir().expect("temp dir");
    let dir = tmp.path();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--preset", "dev", "--dir"])
            .arg(dir)
            .output()
            .expect("init")
            .status
            .success()
    );
    for entry in std::fs::read_dir(dir.join("artifacts")).unwrap() {
        std::fs::remove_file(entry.unwrap().path()).unwrap();
    }
    let coverage = run_json(dir, &["coverage"]);
    assert!(
        coverage["overall"]["percentage"].is_null(),
        "the fixture must exercise the null case; got {coverage}"
    );
    for (name, args) in commands() {
        assert_conforms(name, &run_json(dir, &args));
    }
}

/// The checker is not vacuous: a wrong type, an out-of-range number, a
/// missing required field and a wrong const each produce a violation.
// rivet: verifies REQ-400
#[test]
fn the_checker_reports_each_kind_of_violation() {
    let mut output = run_json(&project_root(), &["coverage"]);
    let mut errors = Vec::new();
    check(&schema("coverage"), &output, "", &mut errors);
    assert!(errors.is_empty(), "baseline must conform: {errors:?}");

    output["overall"]["percentage"] = Value::String("100".into());
    output["rules"][0]["percentage"] = serde_json::json!(140.0);
    output["command"] = Value::String("stats".into());
    output.as_object_mut().unwrap().remove("rules");
    let mut errors = Vec::new();
    check(&schema("coverage"), &output, "", &mut errors);
    let joined = errors.join("\n");
    assert!(
        joined.contains("/overall/percentage: expected type"),
        "{joined}"
    );
    assert!(
        joined.contains("missing required field \"rules\""),
        "{joined}"
    );
    assert!(joined.contains("/command: expected const"), "{joined}");
}

// ── pulseengine.manifest/1 (#1159) ──────────────────────────────────────

fn manifest_schema() -> Value {
    let p = project_root()
        .join("schemas")
        .join("pulseengine.manifest.v1.json");
    serde_json::from_str(&std::fs::read_to_string(&p).expect("read manifest schema"))
        .expect("manifest schema JSON")
}

/// A project with the `manifest` schema and the shared valid fixture.
fn manifest_project() -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("temp dir");
    assert!(
        Command::new(rivet_bin())
            .args([
                "init",
                "--preset",
                "dev",
                "--schema",
                "common,dev,manifest",
                "--dir"
            ])
            .arg(tmp.path())
            .output()
            .expect("init")
            .status
            .success()
    );
    std::fs::write(
        tmp.path().join("artifacts").join("manifest.yaml"),
        include_str!("fixtures/manifest/valid.yaml"),
    )
    .expect("write fixture");
    tmp
}

/// `rivet manifest export --format json` on a fixture project emits a
/// document that validates against schemas/pulseengine.manifest.v1.json.
// rivet: verifies REQ-415
#[test]
fn manifest_export_conforms_to_its_json_schema() {
    let tmp = manifest_project();
    let doc = run_json(tmp.path(), &["manifest", "export", "--tag", "v0.1.0"]);
    assert!(
        !doc["provides"].as_array().unwrap().is_empty()
            && !doc["consumes"].as_array().unwrap().is_empty()
            && !doc["gates"].as_array().unwrap().is_empty(),
        "the fixture must populate every array; got {doc}"
    );
    let mut errors = Vec::new();
    check(&manifest_schema(), &doc, "", &mut errors);
    assert!(
        errors.is_empty(),
        "manifest export violates schemas/pulseengine.manifest.v1.json:\n  {}",
        errors.join("\n  ")
    );
    // The null-tag form conforms too.
    let doc = run_json(tmp.path(), &["manifest", "export"]);
    let mut errors = Vec::new();
    check(&manifest_schema(), &doc, "", &mut errors);
    assert!(errors.is_empty(), "{errors:?}");
}

/// The manifest JSON Schema is not vacuous: an unknown kind, an empty pin
/// value, a wrong schema_version and a missing top-level field each fail.
// rivet: verifies REQ-415
#[test]
fn manifest_json_schema_rejects_bad_documents() {
    let tmp = manifest_project();
    let mut doc = run_json(tmp.path(), &["manifest", "export"]);
    doc["provides"][0]["kind"] = Value::String("gizmo".into());
    doc["consumes"][0]["pin"]["value"] = Value::String(String::new());
    doc["schema_version"] = Value::String("pulseengine.manifest/2".into());
    doc.as_object_mut().unwrap().remove("gates");
    let mut errors = Vec::new();
    check(&manifest_schema(), &doc, "", &mut errors);
    let joined = errors.join("\n");
    assert!(joined.contains("/provides[0]/kind:"), "{joined}");
    assert!(joined.contains("/consumes[0]/pin/value:"), "{joined}");
    assert!(
        joined.contains("/schema_version: expected const"),
        "{joined}"
    );
    assert!(
        joined.contains("missing required field \"gates\""),
        "{joined}"
    );
}
