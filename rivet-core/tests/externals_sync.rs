//! Cross-repo artifact sync integration tests.
//!
//! Tests the full pipeline: syncing an external project from a local path,
//! loading its artifacts, validating cross-repo links, and computing backlinks.
//!
//! Uses the test fixture at `tests/fixtures/spar-external/` which simulates
//! what a spar rivet project would look like.

use std::collections::{BTreeMap, HashSet};

use rivet_core::externals::{
    ResolvedExternal, load_all_externals, load_external_project, sync_external, validate_refs,
};
use rivet_core::model::ExternalProject;
use serial_test::serial;

/// Path to the spar external fixture relative to the workspace root.
fn spar_fixture_dir() -> std::path::PathBuf {
    let manifest_dir = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    manifest_dir.join("../tests/fixtures/spar-external")
}

// rivet: verifies REQ-020
#[test]
#[serial]
fn sync_spar_external_via_local_path() {
    let fixture = spar_fixture_dir();
    assert!(
        fixture.join("rivet.yaml").exists(),
        "spar-external fixture must have rivet.yaml at {}",
        fixture.display()
    );

    let dir = tempfile::tempdir().unwrap();
    let ext = ExternalProject {
        git: Some("https://github.com/pulseengine/spar.git".into()),
        path: Some(fixture.to_str().unwrap().into()),
        git_ref: Some("84a7363".into()),
        prefix: "spar".into(),
    };

    let cache_dir = dir.path().join(".rivet/repos");
    let result = sync_external(&ext, &cache_dir, dir.path(), true);
    assert!(result.is_ok(), "sync_external failed: {:?}", result.err());

    // The cache should contain a symlink to the fixture
    let cached = cache_dir.join("spar");
    assert!(cached.exists(), "cached spar dir must exist after sync");
}

// rivet: verifies REQ-020
#[test]
#[serial]
fn load_spar_external_artifacts() {
    let fixture = spar_fixture_dir();
    let artifacts = load_external_project(&fixture).unwrap();

    // The fixture has 4 artifacts: 3 aadl-component + 1 requirement
    assert!(
        artifacts.len() >= 4,
        "expected at least 4 artifacts from spar fixture, got {}",
        artifacts.len()
    );

    let ids: Vec<&str> = artifacts.iter().map(|a| a.id.as_str()).collect();
    assert!(ids.contains(&"SPAR-SYS-001"), "missing SPAR-SYS-001");
    assert!(ids.contains(&"SPAR-PROC-001"), "missing SPAR-PROC-001");
    assert!(ids.contains(&"SPAR-THR-001"), "missing SPAR-THR-001");
    assert!(ids.contains(&"SPAR-REQ-001"), "missing SPAR-REQ-001");

    // Verify types are correct
    let sys = artifacts.iter().find(|a| a.id == "SPAR-SYS-001").unwrap();
    assert_eq!(sys.artifact_type, "aadl-component");

    let req = artifacts.iter().find(|a| a.id == "SPAR-REQ-001").unwrap();
    assert_eq!(req.artifact_type, "requirement");
}

// rivet: verifies REQ-020
#[test]
#[serial]
fn cross_repo_link_resolution_with_spar() {
    let fixture = spar_fixture_dir();
    let spar_artifacts = load_external_project(&fixture).unwrap();

    // Build external ID sets
    let spar_ids: HashSet<String> = spar_artifacts.iter().map(|a| a.id.clone()).collect();
    let mut external_ids: BTreeMap<String, HashSet<String>> = BTreeMap::new();
    external_ids.insert("spar".into(), spar_ids);

    // Simulate local artifacts that reference spar artifacts
    let local_ids: HashSet<String> = ["REQ-001", "FEAT-001"]
        .iter()
        .map(|s| s.to_string())
        .collect();

    // Valid cross-repo references
    let refs = vec![
        "REQ-001",           // local
        "spar:SPAR-SYS-001", // valid external
        "spar:SPAR-REQ-001", // valid external
    ];
    let broken = validate_refs(&refs, &local_ids, &external_ids);
    assert!(
        broken.is_empty(),
        "expected no broken refs for valid links, got: {:?}",
        broken
    );

    // Broken cross-repo references
    let bad_refs = vec![
        "spar:NONEXISTENT", // valid prefix, missing ID
        "unknown:REQ-001",  // unknown prefix
    ];
    let broken2 = validate_refs(&bad_refs, &local_ids, &external_ids);
    assert_eq!(
        broken2.len(),
        2,
        "expected 2 broken refs, got: {:?}",
        broken2
    );
}

// rivet: verifies REQ-020
#[test]
#[serial]
fn load_all_externals_with_spar() {
    let fixture = spar_fixture_dir();

    let dir = tempfile::tempdir().unwrap();
    let mut externals = BTreeMap::new();
    externals.insert(
        "spar".into(),
        ExternalProject {
            git: None,
            path: Some(fixture.to_str().unwrap().into()),
            git_ref: None,
            prefix: "spar".into(),
        },
    );

    // Sync first so that the cache is populated
    rivet_core::externals::sync_all(&externals, dir.path(), true).unwrap();

    // Then load all externals
    let resolved = load_all_externals(&externals, dir.path()).unwrap();
    assert_eq!(resolved.len(), 1, "expected 1 external");
    assert_eq!(resolved[0].prefix, "spar");
    assert!(
        resolved[0].artifacts.len() >= 4,
        "expected at least 4 spar artifacts, got {}",
        resolved[0].artifacts.len()
    );
}

// rivet: verifies REQ-020
#[test]
#[serial]
fn backlinks_from_spar_to_local() {
    use rivet_core::externals::compute_backlinks;
    use rivet_core::model::{Artifact, Link};

    // Create a spar artifact that links to a local artifact
    let spar_artifact = Artifact {
        id: "SPAR-LINK-001".into(),
        artifact_type: "aadl-component".into(),
        title: "Component linking to local req".into(),
        description: None,
        status: None,
        tags: vec![],
        links: vec![Link {
            link_type: "allocated-from".into(),
            target: "REQ-001".into(),
        }],
        fields: BTreeMap::new(),
        provenance: None,
        source_file: None,
    };

    let resolved = vec![ResolvedExternal {
        prefix: "spar".into(),
        project_dir: spar_fixture_dir(),
        artifacts: vec![spar_artifact],
    }];

    let mut local_ids = HashSet::new();
    local_ids.insert("REQ-001".into());

    let backlinks = compute_backlinks(&resolved, &local_ids);
    assert_eq!(backlinks.len(), 1, "expected 1 backlink");
    assert_eq!(backlinks[0].source_prefix, "spar");
    assert_eq!(backlinks[0].source_id, "SPAR-LINK-001");
    assert_eq!(backlinks[0].target, "REQ-001");
}

// rivet: verifies REQ-020
#[test]
#[serial]
fn dogfood_rivet_yaml_with_spar_external() {
    // Load the actual project's rivet.yaml and verify it parses with the spar external
    let project_root = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..");
    let config_path = project_root.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path).unwrap();

    let externals = config
        .externals
        .as_ref()
        .expect("externals must be configured");
    assert!(externals.contains_key("spar"), "spar must be in externals");

    let spar = &externals["spar"];
    assert_eq!(spar.prefix, "spar");
    assert_eq!(
        spar.git.as_deref(),
        Some("https://github.com/pulseengine/spar.git")
    );
    assert_eq!(spar.git_ref.as_deref(), Some("84a7363"));
    assert_eq!(spar.path.as_deref(), Some("tests/fixtures/spar-external"));
}
