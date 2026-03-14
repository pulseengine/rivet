use rivet_core::model::ProjectConfig;

// rivet: verifies REQ-020
#[test]
fn externals_parsed_from_yaml() {
    let yaml = r#"
project:
  name: test
  version: "0.1.0"
  schemas: [common, dev]
sources: []
externals:
  rivet:
    git: https://github.com/pulseengine/rivet
    ref: main
    prefix: rivet
  meld:
    path: ../meld
    prefix: meld
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    let ext = config.externals.as_ref().unwrap();
    assert_eq!(ext.len(), 2);

    let rivet = &ext["rivet"];
    assert_eq!(
        rivet.git.as_deref(),
        Some("https://github.com/pulseengine/rivet")
    );
    assert_eq!(rivet.git_ref.as_deref(), Some("main"));
    assert_eq!(rivet.prefix, "rivet");

    let meld = &ext["meld"];
    assert_eq!(meld.path.as_deref(), Some("../meld"));
    assert!(meld.git.is_none());
    assert_eq!(meld.prefix, "meld");
}

#[test]
fn no_externals_is_none() {
    let yaml = r#"
project:
  name: test
  version: "0.1.0"
  schemas: [common]
sources: []
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    assert!(config.externals.is_none());
}
