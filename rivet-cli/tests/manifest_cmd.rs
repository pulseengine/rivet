// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code.
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

//! End-to-end tests for the embedded `manifest` schema and
//! `rivet manifest export` (#1159): `rivet init` enables the schema,
//! `rivet validate` rejects malformed `provides` / `consumes` artifacts
//! (negative controls), the export keeps every declared field, the exit
//! codes are 0 / 1 / 2, and `rivet docs manifest` is served. Conformance of
//! the export to `schemas/pulseengine.manifest.v1.json` is checked in
//! `json_output_contracts.rs`, next to the other JSON contracts.

// rivet: verifies REQ-415

use std::path::Path;
use std::process::{Command, Output};

fn rivet_bin() -> std::path::PathBuf {
    // Compile-time path (REQ-314).
    std::path::PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

fn rivet(dir: &Path, args: &[&str]) -> Output {
    Command::new(rivet_bin())
        .arg("--project")
        .arg(dir)
        .args(args)
        .output()
        .expect("run rivet")
}

/// A valid manifest fixture: one provides per interesting kind plus two
/// consumes. Every field value in it is asserted on in the export test.
const VALID_MANIFEST: &str = include_str!("fixtures/manifest/valid.yaml");

/// `rivet init --schema common,dev,manifest` plus `artifacts/manifest.yaml`.
fn project(manifest_yaml: &str) -> tempfile::TempDir {
    let tmp = tempfile::tempdir().expect("temp dir");
    let out = Command::new(rivet_bin())
        .args([
            "init",
            "--preset",
            "dev",
            "--schema",
            "common,dev,manifest",
            "--dir",
        ])
        .arg(tmp.path())
        .output()
        .expect("rivet init");
    assert!(
        out.status.success(),
        "init failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    std::fs::write(tmp.path().join("artifacts/manifest.yaml"), manifest_yaml).unwrap();
    tmp
}

fn assert_validate_fails(manifest_yaml: &str, expect: &str) {
    let tmp = project(manifest_yaml);
    let out = rivet(tmp.path(), &["validate"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert_eq!(
        out.status.code(),
        Some(1),
        "validate must exit 1 (expected {expect:?}); stdout:\n{stdout}"
    );
    assert!(
        stdout.contains(expect),
        "expected {expect:?} in validate output:\n{stdout}"
    );
    // The export refuses the same project, also with exit 1, writing nothing.
    let out = rivet(tmp.path(), &["manifest", "export"]);
    assert_eq!(out.status.code(), Some(1), "export must refuse");
    assert!(out.stdout.is_empty(), "nothing may be printed on refusal");
    assert!(
        String::from_utf8_lossy(&out.stderr).contains("manifest export refused"),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
}

/// AC 1: `rivet init` enables the embedded schema, and a well-formed
/// manifest validates.
#[test]
fn init_enables_manifest_schema_and_valid_manifest_validates() {
    let tmp = project(VALID_MANIFEST);
    let config = std::fs::read_to_string(tmp.path().join("rivet.yaml")).unwrap();
    assert!(config.contains("- manifest"), "{config}");
    let out = rivet(tmp.path(), &["validate"]);
    let stdout = String::from_utf8_lossy(&out.stdout);
    assert!(out.status.success(), "validate must pass:\n{stdout}");
    assert!(stdout.contains("manifest@0.1.0 (embedded)"), "{stdout}");
}

// ── AC 4: negative controls ─────────────────────────────────────────────

#[test]
fn consumes_without_pin_fails_validation() {
    assert_validate_fails(
        r#"artifacts:
  - id: CONS-001
    type: consumes
    title: no pin
    status: draft
    fields:
      repo: pulseengine/spar
      entry-id: spar-analysis
"#,
        "missing required field 'pin' for type 'consumes'",
    );
}

#[test]
fn unknown_pin_kind_fails_validation() {
    assert_validate_fails(
        r#"artifacts:
  - id: CONS-001
    type: consumes
    title: branch pin
    status: draft
    fields:
      repo: pulseengine/spar
      entry-id: spar-analysis
      pin: {kind: branch, value: main}
"#,
        "consumes pin.kind 'branch' is not a pin kind",
    );
}

#[test]
fn empty_pin_value_fails_validation() {
    assert_validate_fails(
        r#"artifacts:
  - id: CONS-001
    type: consumes
    title: empty pin
    status: draft
    fields:
      repo: pulseengine/spar
      entry-id: spar-analysis
      pin: {kind: sha256, value: ""}
"#,
        "consumes pin.value must be a non-empty value",
    );
}

#[test]
fn provides_without_version_fails_validation() {
    assert_validate_fails(
        r#"artifacts:
  - id: PROV-001
    type: provides
    title: no version
    status: draft
    fields:
      kind: tool
      entry-id: my-tool
      path: tools/my-tool
"#,
        "missing required field 'version' for type 'provides'",
    );
}

#[test]
fn unknown_provides_kind_fails_validation() {
    assert_validate_fails(
        r#"artifacts:
  - id: PROV-001
    type: provides
    title: unknown kind
    status: draft
    fields:
      kind: gizmo
      entry-id: g
      version: 0.1.0
      path: g
"#,
        "provides kind 'gizmo' is not a manifest kind",
    );
}

#[test]
fn crate_without_workspace_fails_validation() {
    assert_validate_fails(
        r#"artifacts:
  - id: PROV-001
    type: provides
    title: crate without workspace
    status: draft
    fields:
      kind: crate
      entry-id: c
      version: 0.1.0
      path: c
"#,
        "provides of kind 'crate' requires field 'workspace'",
    );
}

// ── AC 2/3: export ──────────────────────────────────────────────────────

fn export_json(dir: &Path, extra: &[&str]) -> serde_json::Value {
    let mut args = vec!["manifest", "export", "--format", "json"];
    args.extend_from_slice(extra);
    let out = rivet(dir, &args);
    assert!(
        out.status.success(),
        "export failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    serde_json::from_slice(&out.stdout).expect("export prints JSON")
}

fn find<'a>(arr: &'a serde_json::Value, artifact: &str) -> &'a serde_json::Value {
    arr.as_array()
        .unwrap()
        .iter()
        .find(|e| e["artifact"] == artifact)
        .unwrap_or_else(|| panic!("{artifact} missing from {arr}"))
}

/// AC 3: every field set on a provides / consumes artifact appears in the
/// export (entry-id as `id`), with top-level fields and gates.
#[test]
fn export_keeps_every_declared_field() {
    let tmp = project(VALID_MANIFEST);
    let doc = export_json(
        tmp.path(),
        &["--repo", "pulseengine/my-repo", "--tag", "v0.1.0"],
    );

    assert_eq!(doc["schema_version"], "pulseengine.manifest/1");
    assert_eq!(doc["repo"], "pulseengine/my-repo");
    assert_eq!(doc["release"]["tag"], "v0.1.0");

    let expected: &[(&str, &[(&str, serde_json::Value)])] = &[
        (
            "PROV-001",
            &[
                ("kind", serde_json::json!("crate")),
                ("id", serde_json::json!("my-core")),
                ("version", serde_json::json!("0.1.0")),
                ("path", serde_json::json!("crates/my-core")),
                ("workspace", serde_json::json!("nested")),
                (
                    "required-checks",
                    serde_json::json!(["ci / test", "ci / clippy"]),
                ),
                ("title", serde_json::json!("core crate")),
            ],
        ),
        (
            "PROV-002",
            &[
                ("kind", serde_json::json!("component")),
                ("id", serde_json::json!("pulseengine:my-component")),
                (
                    "oci",
                    serde_json::json!("ghcr.io/pulseengine/my-component:v0.1.0"),
                ),
                ("index", serde_json::json!("wa.dev")),
                ("world", serde_json::json!("pulseengine:my/world")),
            ],
        ),
        (
            "PROV-003",
            &[
                ("mode", serde_json::json!("waived")),
                (
                    "waiver",
                    serde_json::json!("https://github.com/pulseengine/rivet/issues/1159"),
                ),
            ],
        ),
        (
            "PROV-004",
            &[
                ("context", serde_json::json!("ci / test")),
                // `version: 1` is a YAML number; the export writes a string.
                ("version", serde_json::json!("1")),
            ],
        ),
    ];
    for (artifact, fields) in expected {
        let e = find(&doc["provides"], artifact);
        for (k, v) in *fields {
            assert_eq!(&e[*k], v, "{artifact}.{k} in {e}");
        }
        assert!(e.get("entry-id").is_none(), "entry-id is exported as id");
    }

    let c1 = find(&doc["consumes"], "CONS-001");
    assert_eq!(c1["repo"], "pulseengine/spar");
    assert_eq!(c1["id"], "spar-analysis");
    assert_eq!(
        c1["pin"],
        serde_json::json!({"kind": "tag", "value": "v0.1.0"})
    );
    let c2 = find(&doc["consumes"], "CONS-002");
    assert_eq!(c2["pin"]["kind"], "path+ref");
    assert_eq!(c2["pin"]["value"], "wit/deps@abc123");

    // Gate binding: the gated-by link and both required checks of PROV-001.
    let gates = doc["gates"].as_array().unwrap();
    let refs: Vec<(&str, &str)> = gates
        .iter()
        .map(|g| (g["kind"].as_str().unwrap(), g["ref"].as_str().unwrap()))
        .collect();
    assert_eq!(
        refs,
        vec![
            ("artifact", "REQ-001"),
            ("required-check", "ci / test"),
            ("required-check", "ci / clippy"),
        ]
    );
    assert!(gates.iter().all(|g| g["provides"] == "my-core"));
    assert_eq!(gates[0]["type"], "requirement");
}

/// Regression for the "keeps every field" contract: a field added to an
/// artifact must show up without any change to the exporter.
#[test]
fn export_carries_a_field_it_does_not_know() {
    let yaml = VALID_MANIFEST.replace(
        "      workspace: nested\n",
        "      workspace: nested\n      x-release-channel: nightly\n",
    );
    let tmp = project(&yaml);
    let doc = export_json(tmp.path(), &[]);
    assert_eq!(
        find(&doc["provides"], "PROV-001")["x-release-channel"],
        "nightly"
    );
    // Defaults: repo is the project name, tag is null.
    assert!(doc["release"]["tag"].is_null());
    assert!(doc["repo"].as_str().is_some_and(|r| !r.is_empty()));
}

/// `--output` writes the file (a directory gets pulseengine.manifest.json),
/// and stdout stays empty.
#[test]
fn export_output_writes_file() {
    let tmp = project(VALID_MANIFEST);
    let file = tmp.path().join("out.json");
    let out = rivet(
        tmp.path(),
        &["manifest", "export", "--output", file.to_str().unwrap()],
    );
    assert!(
        out.status.success(),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(out.stdout.is_empty());
    let doc: serde_json::Value =
        serde_json::from_str(&std::fs::read_to_string(&file).unwrap()).unwrap();
    assert_eq!(doc["schema_version"], "pulseengine.manifest/1");

    let dist = tmp.path().join("dist");
    std::fs::create_dir(&dist).unwrap();
    let out = rivet(
        tmp.path(),
        &["manifest", "export", "--output", dist.to_str().unwrap()],
    );
    assert!(
        out.status.success(),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(dist.join("pulseengine.manifest.json").is_file());
}

// ── AC 6: exit codes ────────────────────────────────────────────────────

#[test]
fn export_usage_errors_exit_2() {
    let tmp = project(VALID_MANIFEST);
    let out = rivet(tmp.path(), &["manifest", "export", "--format", "yaml"]);
    assert_eq!(out.status.code(), Some(2), "unknown --format");
    let out = rivet(tmp.path(), &["manifest", "export", "--bogus"]);
    assert_eq!(out.status.code(), Some(2), "unknown flag");

    // A project that does not load the manifest schema.
    let plain = tempfile::tempdir().unwrap();
    assert!(
        Command::new(rivet_bin())
            .args(["init", "--dir"])
            .arg(plain.path())
            .output()
            .unwrap()
            .status
            .success()
    );
    let out = rivet(plain.path(), &["manifest", "export"]);
    assert_eq!(out.status.code(), Some(2), "manifest schema not loaded");
    assert!(
        String::from_utf8_lossy(&out.stderr).contains("`manifest` schema is not loaded"),
        "{}",
        String::from_utf8_lossy(&out.stderr)
    );
}

#[test]
fn export_ok_exits_0() {
    let tmp = project(VALID_MANIFEST);
    assert_eq!(
        rivet(tmp.path(), &["manifest", "export"]).status.code(),
        Some(0)
    );
}

// ── AC 5: docs ──────────────────────────────────────────────────────────

#[test]
fn docs_manifest_topic_documents_schema_and_export() {
    let out = Command::new(rivet_bin())
        .args(["docs", "manifest"])
        .output()
        .unwrap();
    assert!(out.status.success());
    let body = String::from_utf8_lossy(&out.stdout);
    for needle in [
        "rivet manifest export",
        "pulseengine.manifest.json",
        "schemas/pulseengine.manifest.v1.json",
        "path+ref",
        "manifest-pin",
        "gated-by",
        "Exit codes",
        "name: manifest",
    ] {
        assert!(body.contains(needle), "docs manifest lacks {needle:?}");
    }
}
