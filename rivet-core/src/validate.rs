use crate::document::DocumentStore;
use crate::links::LinkGraph;
use crate::schema::{Cardinality, Schema, Severity};
use crate::store::Store;

/// A single validation diagnostic.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Diagnostic {
    pub severity: Severity,
    pub artifact_id: Option<String>,
    pub rule: String,
    pub message: String,
    /// Source file for diagnostics not tied to an artifact (e.g., parse errors).
    pub source_file: Option<std::path::PathBuf>,
    /// 0-based line number (from serde_yaml error location).
    pub line: Option<u32>,
    /// 0-based column number.
    pub column: Option<u32>,
}

impl Diagnostic {
    /// Create a new diagnostic with no location info.
    pub fn new(
        severity: Severity,
        artifact_id: Option<String>,
        rule: impl Into<String>,
        message: impl Into<String>,
    ) -> Self {
        Self {
            severity,
            artifact_id,
            rule: rule.into(),
            message: message.into(),
            source_file: None,
            line: None,
            column: None,
        }
    }
}

impl std::fmt::Display for Diagnostic {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let level = match self.severity {
            Severity::Error => "ERROR",
            Severity::Warning => "WARN",
            Severity::Info => "INFO",
        };
        match &self.artifact_id {
            Some(id) => write!(f, "  {level}: [{id}] {}", self.message),
            None => write!(f, "  {level}: {}", self.message),
        }
    }
}

/// Validate a store against a schema and link graph.
///
/// Returns a list of diagnostics (errors, warnings, info).
/// The caller decides whether to fail on errors.
///
/// This is the full validation pipeline including conditional rules.
/// For the salsa incremental layer, use [`validate_structural`] for phases
/// 1-7 and [`evaluate_conditional_rules`](crate::db::evaluate_conditional_rules)
/// for phase 8 as a separate tracked query.
pub fn validate(store: &Store, schema: &Schema, graph: &LinkGraph) -> Vec<Diagnostic> {
    let mut diagnostics = validate_structural(store, schema, graph);

    // 0. Check conditional rule consistency (schema-level)
    diagnostics.extend(crate::schema::check_conditional_consistency(
        &schema.conditional_rules,
    ));

    // 8. Check conditional rules (pre-compile regexes to avoid re-compilation per artifact)
    for rule in &schema.conditional_rules {
        let compiled_re = rule.when.compile_regex();
        for artifact in store.iter() {
            if rule
                .when
                .matches_artifact_with(artifact, compiled_re.as_ref())
            {
                diagnostics.extend(rule.then.check(artifact, &rule.name, rule.severity));
            }
        }
    }

    diagnostics
}

/// Structural validation only (phases 1-7).
///
/// Validates types, required fields, allowed values, link cardinality,
/// link target types, broken links, and traceability rules.
/// Conditional rules (phase 8) are NOT included — the salsa layer runs
/// those as a separate tracked query for finer-grained invalidation.
pub fn validate_structural(store: &Store, schema: &Schema, graph: &LinkGraph) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();

    // 1. Check that every artifact has a known type
    for artifact in store.iter() {
        let Some(type_def) = schema.artifact_type(&artifact.artifact_type) else {
            diagnostics.push(Diagnostic {
                source_file: None,
                line: None,
                column: None,
                severity: Severity::Error,
                artifact_id: Some(artifact.id.clone()),
                rule: "known-type".to_string(),
                message: format!("unknown artifact type '{}'", artifact.artifact_type),
            });
            continue;
        };

        // 2. Check required fields
        for field in &type_def.fields {
            if field.required && !artifact.fields.contains_key(&field.name) {
                // Also check if the field name matches a base field (description, etc.)
                let has_base = match field.name.as_str() {
                    "description" => artifact.description.is_some(),
                    "status" => artifact.status.is_some(),
                    _ => false,
                };
                if !has_base {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Error,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "required-field".to_string(),
                        message: format!(
                            "missing required field '{}' for type '{}'",
                            field.name, artifact.artifact_type
                        ),
                    });
                }
            }

            // 3. Check allowed values
            if let Some(allowed) = &field.allowed_values {
                if let Some(value) = artifact.fields.get(&field.name) {
                    if let Some(s) = value.as_str() {
                        // Value is already a YAML string — straightforward check
                        if !allowed.iter().any(|a| a == s) {
                            diagnostics.push(Diagnostic {
                                source_file: None,
                                line: None,
                                column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "allowed-values".to_string(),
                                message: format!(
                                    "field '{}' has value '{}', allowed: {:?}",
                                    field.name, s, allowed
                                ),
                            });
                        }
                    } else if let Some(b) = value.as_bool() {
                        // YAML 1.1 coerces yes/no/on/off/true/false to booleans.
                        // Check canonical and common aliases against allowed values.
                        let candidates: &[&str] = if b {
                            &["true", "yes"]
                        } else {
                            &["false", "no"]
                        };
                        if !candidates.iter().any(|c| allowed.iter().any(|a| a == c)) {
                            diagnostics.push(Diagnostic {
                                source_file: None,
                                line: None,
                                column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "allowed-values".to_string(),
                                message: format!(
                                    "field '{}' has value '{}' (boolean), allowed: {:?}",
                                    field.name, b, allowed
                                ),
                            });
                        }
                        // Warn when field is declared as string but YAML coerced the value
                        if field.field_type == "string" {
                            diagnostics.push(Diagnostic { source_file: None, line: None, column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "yaml-type-coercion".to_string(),
                                message: format!(
                                    "field '{}' is declared as string but YAML parsed the value as boolean ({}); consider quoting it",
                                    field.name, b
                                ),
                            });
                        }
                    } else if value.is_number() {
                        // YAML coerces unquoted numbers (1.0, 42, etc.)
                        let num_str = if let Some(u) = value.as_u64() {
                            u.to_string()
                        } else if let Some(i) = value.as_i64() {
                            i.to_string()
                        } else if let Some(f) = value.as_f64() {
                            f.to_string()
                        } else {
                            format!("{:?}", value)
                        };
                        if !allowed.iter().any(|a| a == &num_str) {
                            diagnostics.push(Diagnostic {
                                source_file: None,
                                line: None,
                                column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "allowed-values".to_string(),
                                message: format!(
                                    "field '{}' has value '{}' (number), allowed: {:?}",
                                    field.name, num_str, allowed
                                ),
                            });
                        }
                        // Warn when field is declared as string but YAML coerced the value
                        if field.field_type == "string" {
                            diagnostics.push(Diagnostic { source_file: None, line: None, column: None,
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "yaml-type-coercion".to_string(),
                                message: format!(
                                    "field '{}' is declared as string but YAML parsed the value as number ({}); consider quoting it",
                                    field.name, num_str
                                ),
                            });
                        }
                    }
                }
            }
        }

        // 4. Check link field cardinality
        for link_field in &type_def.link_fields {
            let count = artifact
                .links
                .iter()
                .filter(|l| l.link_type == link_field.link_type)
                .count();

            match link_field.cardinality {
                Cardinality::ExactlyOne if count != 1 => {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Error,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "cardinality".to_string(),
                        message: format!(
                            "link '{}' requires exactly 1 target, found {}",
                            link_field.link_type, count
                        ),
                    });
                }
                Cardinality::OneOrMany if count == 0 && link_field.required => {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Error,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "cardinality".to_string(),
                        message: format!(
                            "link '{}' requires at least 1 target, found 0",
                            link_field.link_type
                        ),
                    });
                }
                Cardinality::ZeroOrOne if count > 1 => {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: Severity::Warning,
                        artifact_id: Some(artifact.id.clone()),
                        rule: "cardinality".to_string(),
                        message: format!(
                            "link '{}' allows at most 1 target, found {}",
                            link_field.link_type, count
                        ),
                    });
                }
                _ => {}
            }

            // 5. Check link target types
            for link in &artifact.links {
                if link.link_type != link_field.link_type {
                    continue;
                }
                if let Some(target) = store.get(&link.target) {
                    if !link_field.target_types.is_empty()
                        && !link_field.target_types.contains(&target.artifact_type)
                    {
                        diagnostics.push(Diagnostic {
                            source_file: None,
                            line: None,
                            column: None,
                            severity: Severity::Error,
                            artifact_id: Some(artifact.id.clone()),
                            rule: "link-target-type".to_string(),
                            message: format!(
                                "link '{}' targets '{}' (type '{}'), allowed target types: {:?}",
                                link.link_type,
                                link.target,
                                target.artifact_type,
                                link_field.target_types
                            ),
                        });
                    }
                }
            }
        }
    }

    // 6. Check broken links
    for broken in &graph.broken {
        diagnostics.push(Diagnostic {
            source_file: None,
            line: None,
            column: None,
            severity: Severity::Error,
            artifact_id: Some(broken.source.clone()),
            rule: "broken-link".to_string(),
            message: format!(
                "link '{}' targets '{}' which does not exist",
                broken.link_type, broken.target
            ),
        });
    }

    // 7. Check traceability rules (forward + backlink coverage)
    for rule in &schema.traceability_rules {
        for id in store.by_type(&rule.source_type) {
            let artifact = store.get(id).unwrap();

            // Draft artifacts get downgraded to Info for traceability rule violations.
            // Active and approved artifacts receive full error-level enforcement.
            let effective_severity =
                if artifact.status.as_deref().map(str::to_lowercase).as_deref() == Some("draft") {
                    Severity::Info
                } else {
                    rule.severity
                };

            // Forward link check
            if let Some(required_link) = &rule.required_link {
                let has_link = artifact.links.iter().any(|l| {
                    l.link_type == *required_link
                        && store
                            .get(&l.target)
                            .is_some_and(|t| rule.target_types.contains(&t.artifact_type))
                });
                if !has_link {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: effective_severity,
                        artifact_id: Some(id.clone()),
                        rule: rule.name.clone(),
                        message: format!(
                            "{}: missing '{}' link to {:?}",
                            rule.description, required_link, rule.target_types
                        ),
                    });
                }
            }

            // Backlink check (coverage)
            if let Some(required_backlink) = &rule.required_backlink {
                let has_backlink = graph.backlinks_to(id).iter().any(|bl| {
                    bl.link_type == *required_backlink
                        && store
                            .get(&bl.source)
                            .is_some_and(|s| rule.from_types.contains(&s.artifact_type))
                });
                if !has_backlink {
                    diagnostics.push(Diagnostic {
                        source_file: None,
                        line: None,
                        column: None,
                        severity: effective_severity,
                        artifact_id: Some(id.clone()),
                        rule: rule.name.clone(),
                        message: rule.description.clone(),
                    });
                }
            }
        }
    }

    diagnostics
}

/// Validate document `[[ID]]` references against the artifact store.
///
/// Returns diagnostics for any reference that points to a non-existent artifact.
pub fn validate_documents(doc_store: &DocumentStore, store: &Store) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();

    for doc in doc_store.iter() {
        for reference in &doc.references {
            if !store.contains(&reference.artifact_id) {
                diagnostics.push(Diagnostic {
                    source_file: None,
                    line: None,
                    column: None,
                    severity: Severity::Warning,
                    artifact_id: Some(doc.id.clone()),
                    rule: "doc-broken-ref".into(),
                    message: format!(
                        "document references [[{}]] (line {}) which does not exist",
                        reference.artifact_id, reference.line
                    ),
                });
            }
        }
    }

    diagnostics
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::links::LinkGraph;
    use crate::model::{Artifact, Link};
    use crate::schema::{
        ArtifactTypeDef, Condition, ConditionalRule, FieldDef, Requirement, Severity,
        TraceabilityRule,
    };
    use crate::test_helpers::{minimal_artifact, minimal_schema};
    use std::collections::BTreeMap;

    /// Helper: create an artifact with given id, type, status, optional fields, and links.
    fn make_artifact(
        id: &str,
        artifact_type: &str,
        status: Option<&str>,
        description: Option<&str>,
        fields: Vec<(&str, &str)>,
        links: Vec<Link>,
    ) -> Artifact {
        let mut field_map = BTreeMap::new();
        for (k, v) in fields {
            field_map.insert(k.to_string(), serde_yaml::Value::String(v.to_string()));
        }
        let mut a = minimal_artifact(id, artifact_type);
        a.description = description.map(|s| s.to_string());
        a.status = status.map(|s| s.to_string());
        a.links = links;
        a.fields = field_map;
        a
    }

    /// Helper: create a minimal schema that knows about the "test" artifact type.
    fn make_schema(conditional_rules: Vec<ConditionalRule>) -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "test".to_string(),
            description: "Test type".to_string(),
            fields: vec![],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
        }];
        file.conditional_rules = conditional_rules;
        Schema::merge(&[file])
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_equals_matches_correct_status() {
        let cond = Condition::Equals {
            field: "status".to_string(),
            value: "approved".to_string(),
        };
        let art = make_artifact("A-1", "test", Some("approved"), None, vec![], vec![]);
        assert!(cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_equals_does_not_match_wrong_status() {
        let cond = Condition::Equals {
            field: "status".to_string(),
            value: "approved".to_string(),
        };
        let art = make_artifact("A-1", "test", Some("draft"), None, vec![], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_equals_does_not_match_missing_status() {
        let cond = Condition::Equals {
            field: "status".to_string(),
            value: "approved".to_string(),
        };
        let art = make_artifact("A-1", "test", None, None, vec![], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_matches_regex() {
        let cond = Condition::Matches {
            field: "safety".to_string(),
            pattern: "ASIL_.*".to_string(),
        };
        let art = make_artifact(
            "A-1",
            "test",
            None,
            None,
            vec![("safety", "ASIL_B")],
            vec![],
        );
        assert!(cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_matches_regex_no_match() {
        let cond = Condition::Matches {
            field: "safety".to_string(),
            pattern: "ASIL_.*".to_string(),
        };
        let art = make_artifact("A-1", "test", None, None, vec![("safety", "QM")], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_exists_present_field() {
        let cond = Condition::Exists {
            field: "description".to_string(),
        };
        let art = make_artifact(
            "A-1",
            "test",
            None,
            Some("Has a description"),
            vec![],
            vec![],
        );
        assert!(cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-023
    #[test]
    fn condition_exists_missing_field() {
        let cond = Condition::Exists {
            field: "description".to_string(),
        };
        let art = make_artifact("A-1", "test", None, None, vec![], vec![]);
        assert!(!cond.matches_artifact(&art));
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_fields_catches_missing_field() {
        let req = Requirement::RequiredFields {
            fields: vec!["description".to_string()],
        };
        let art = make_artifact("A-1", "test", Some("approved"), None, vec![], vec![]);
        let diags = req.check(&art, "test-rule", Severity::Error);
        assert_eq!(diags.len(), 1);
        assert!(diags[0].message.contains("description"));
        assert_eq!(diags[0].severity, Severity::Error);
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_fields_passes_when_field_present() {
        let req = Requirement::RequiredFields {
            fields: vec!["description".to_string()],
        };
        let art = make_artifact(
            "A-1",
            "test",
            Some("approved"),
            Some("Has desc"),
            vec![],
            vec![],
        );
        let diags = req.check(&art, "test-rule", Severity::Error);
        assert!(diags.is_empty());
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_links_catches_missing_link() {
        let req = Requirement::RequiredLinks {
            link_types: vec!["mitigated_by".to_string()],
        };
        let art = make_artifact("A-1", "test", None, None, vec![], vec![]);
        let diags = req.check(&art, "test-rule", Severity::Warning);
        assert_eq!(diags.len(), 1);
        assert!(diags[0].message.contains("mitigated_by"));
        assert_eq!(diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-004
    #[test]
    fn required_links_passes_when_link_present() {
        let req = Requirement::RequiredLinks {
            link_types: vec!["mitigated_by".to_string()],
        };
        let links = vec![Link {
            link_type: "mitigated_by".to_string(),
            target: "MIT-1".to_string(),
        }];
        let art = make_artifact("A-1", "test", None, None, vec![], links);
        let diags = req.check(&art, "test-rule", Severity::Warning);
        assert!(diags.is_empty());
    }

    // rivet: verifies REQ-023
    #[test]
    fn conditional_rule_only_fires_when_condition_true() {
        let rule = ConditionalRule {
            name: "approved-needs-desc".to_string(),
            description: None,
            when: Condition::Equals {
                field: "status".to_string(),
                value: "approved".to_string(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["description".to_string()],
            },
            severity: Severity::Error,
        };

        let schema = make_schema(vec![rule]);

        // Artifact with status=draft (condition NOT met) -- no description, no diagnostic
        let mut store = Store::new();
        store
            .insert(make_artifact(
                "A-1",
                "test",
                Some("draft"),
                None,
                vec![],
                vec![],
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let cond_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert!(cond_diags.is_empty(), "should not fire for draft status");

        // Artifact with status=approved (condition met) -- no description, should fire
        let mut store2 = Store::new();
        store2
            .insert(make_artifact(
                "A-2",
                "test",
                Some("approved"),
                None,
                vec![],
                vec![],
            ))
            .unwrap();
        let graph2 = LinkGraph::build(&store2, &schema);
        let diags2 = validate(&store2, &schema, &graph2);
        let cond_diags2: Vec<_> = diags2
            .iter()
            .filter(|d| d.rule == "approved-needs-desc")
            .collect();
        assert_eq!(
            cond_diags2.len(),
            1,
            "should fire for approved without desc"
        );
    }

    // rivet: verifies REQ-023
    #[test]
    fn rule_with_warning_severity_produces_warning() {
        let rule = ConditionalRule {
            name: "warn-rule".to_string(),
            description: None,
            when: Condition::Equals {
                field: "status".to_string(),
                value: "approved".to_string(),
            },
            then: Requirement::RequiredFields {
                fields: vec!["description".to_string()],
            },
            severity: Severity::Warning,
        };

        let schema = make_schema(vec![rule]);

        let mut store = Store::new();
        store
            .insert(make_artifact(
                "A-1",
                "test",
                Some("approved"),
                None,
                vec![],
                vec![],
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate(&store, &schema, &graph);
        let cond_diags: Vec<_> = diags.iter().filter(|d| d.rule == "warn-rule").collect();
        assert_eq!(cond_diags.len(), 1);
        assert_eq!(cond_diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-023
    #[test]
    fn serde_roundtrip_conditional_rule_equals() {
        let yaml = r#"
name: test-rule
when:
  field: status
  equals: approved
then:
  required-fields: [description]
severity: warning
"#;
        let rule: ConditionalRule = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(rule.name, "test-rule");
        assert!(matches!(rule.when, Condition::Equals { .. }));
        assert!(matches!(rule.then, Requirement::RequiredFields { .. }));
        assert_eq!(rule.severity, Severity::Warning);
    }

    // rivet: verifies REQ-023
    #[test]
    fn serde_roundtrip_conditional_rule_matches() {
        let yaml = r#"
name: asil-rule
when:
  field: safety
  matches: "ASIL_.*"
then:
  required-links: [mitigated_by]
severity: error
"#;
        let rule: ConditionalRule = serde_yaml::from_str(yaml).unwrap();
        assert!(matches!(rule.when, Condition::Matches { .. }));
        assert!(matches!(rule.then, Requirement::RequiredLinks { .. }));
    }

    // rivet: verifies REQ-023
    #[test]
    fn serde_roundtrip_conditional_rule_exists() {
        let yaml = r#"
name: exists-rule
when:
  field: rationale
  exists: true
then:
  required-fields: [alternatives]
"#;
        let rule: ConditionalRule = serde_yaml::from_str(yaml).unwrap();
        assert!(matches!(rule.when, Condition::Exists { .. }));
        // Default severity should be Error
        assert_eq!(rule.severity, Severity::Error);
    }

    // rivet: verifies REQ-023
    #[test]
    fn consistency_detects_duplicate_names() {
        let rules = vec![
            ConditionalRule {
                name: "dup".to_string(),
                description: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "a".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["x".to_string()],
                },
                severity: Severity::Error,
            },
            ConditionalRule {
                name: "dup".to_string(),
                description: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "b".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["y".to_string()],
                },
                severity: Severity::Error,
            },
        ];
        let diags = crate::schema::check_conditional_consistency(&rules);
        assert!(!diags.is_empty());
        assert!(diags[0].message.contains("dup"));
    }

    /// Helper: build a Schema with a single traceability rule requiring a forward link.
    fn make_schema_with_forward_traceability_rule() -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "design-decision".to_string(),
            description: "Design decision".to_string(),
            fields: vec![],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
        }];
        file.traceability_rules = vec![TraceabilityRule {
            name: "dd-needs-satisfies".into(),
            description: "Every design-decision must satisfy a requirement".into(),
            source_type: "design-decision".into(),
            required_link: Some("satisfies".into()),
            required_backlink: None,
            target_types: vec!["requirement".into()],
            from_types: vec![],
            severity: Severity::Error,
        }];
        Schema::merge(&[file])
    }

    // rivet: verifies FEAT-070
    #[test]
    fn draft_artifact_missing_required_link_gets_info_severity() {
        let schema = make_schema_with_forward_traceability_rule();
        let mut store = Store::new();
        // Draft artifact — missing the required 'satisfies' link
        let mut art = minimal_artifact("DD-001", "design-decision");
        art.status = Some("draft".to_string());
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-needs-satisfies")
            .collect();
        assert_eq!(rule_diags.len(), 1, "should produce one diagnostic");
        assert_eq!(
            rule_diags[0].severity,
            Severity::Info,
            "draft artifact traceability violation must be Info, not Error"
        );
    }

    // rivet: verifies FEAT-070
    #[test]
    fn active_artifact_missing_required_link_gets_error_severity() {
        let schema = make_schema_with_forward_traceability_rule();
        let mut store = Store::new();
        // Active artifact — missing the required 'satisfies' link
        let mut art = minimal_artifact("DD-002", "design-decision");
        art.status = Some("active".to_string());
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-needs-satisfies")
            .collect();
        assert_eq!(rule_diags.len(), 1, "should produce one diagnostic");
        assert_eq!(
            rule_diags[0].severity,
            Severity::Error,
            "active artifact traceability violation must be Error"
        );
    }

    // rivet: verifies FEAT-070
    #[test]
    fn approved_artifact_missing_required_link_gets_error_severity() {
        let schema = make_schema_with_forward_traceability_rule();
        let mut store = Store::new();
        // Approved artifact — missing the required 'satisfies' link
        let mut art = minimal_artifact("DD-003", "design-decision");
        art.status = Some("approved".to_string());
        store.insert(art).unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);
        let rule_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "dd-needs-satisfies")
            .collect();
        assert_eq!(rule_diags.len(), 1, "should produce one diagnostic");
        assert_eq!(
            rule_diags[0].severity,
            Severity::Error,
            "approved artifact traceability violation must be Error"
        );
    }

    // rivet: verifies REQ-023
    #[test]
    fn consistency_detects_overlapping_requirements() {
        let rules = vec![
            ConditionalRule {
                name: "rule-a".to_string(),
                description: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "approved".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["description".to_string()],
                },
                severity: Severity::Error,
            },
            ConditionalRule {
                name: "rule-b".to_string(),
                description: None,
                when: Condition::Equals {
                    field: "status".to_string(),
                    value: "approved".to_string(),
                },
                then: Requirement::RequiredFields {
                    fields: vec!["description".to_string(), "rationale".to_string()],
                },
                severity: Severity::Warning,
            },
        ];
        let diags = crate::schema::check_conditional_consistency(&rules);
        assert!(!diags.is_empty());
        assert!(diags[0].message.contains("overlapping"));
    }

    // ── YAML type coercion tests ─────────────────────────────────────────

    /// Helper: build a schema whose single artifact type has a field with
    /// `allowed-values` and a specific `type`.
    fn make_schema_with_allowed_field(
        field_name: &str,
        field_type: &str,
        allowed: Vec<&str>,
    ) -> Schema {
        let mut file = minimal_schema("test");
        file.artifact_types = vec![ArtifactTypeDef {
            name: "test".to_string(),
            description: "Test type".to_string(),
            fields: vec![FieldDef {
                name: field_name.to_string(),
                field_type: field_type.to_string(),
                required: false,
                description: None,
                allowed_values: Some(allowed.into_iter().map(String::from).collect()),
            }],
            link_fields: vec![],
            aspice_process: None,
            common_mistakes: vec![],
            example: None,
        }];
        Schema::merge(&[file])
    }

    /// Helper: build an artifact whose field holds a raw `serde_yaml::Value`.
    fn make_artifact_with_yaml_field(
        id: &str,
        field_name: &str,
        value: serde_yaml::Value,
    ) -> Artifact {
        let mut a = minimal_artifact(id, "test");
        a.fields.insert(field_name.to_string(), value);
        a
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_rejects_yaml_bool_not_in_list() {
        // `yes` in YAML 1.1 is parsed as boolean `true`.
        // allowed values are ["draft", "active"] — boolean must be rejected.
        let schema = make_schema_with_allowed_field("priority", "string", vec!["draft", "active"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "priority",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert_eq!(
            av_diags.len(),
            1,
            "should emit allowed-values diagnostic for boolean not in list"
        );
        assert!(av_diags[0].message.contains("boolean"));
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_accepts_yaml_bool_when_yes_in_list() {
        // If "yes" is in allowed values, boolean `true` should be accepted.
        let schema = make_schema_with_allowed_field("enabled", "string", vec!["yes", "no"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "enabled",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert!(
            av_diags.is_empty(),
            "should NOT emit allowed-values when 'yes' is in allowed list for bool true"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_accepts_yaml_bool_false_when_no_in_list() {
        let schema = make_schema_with_allowed_field("enabled", "string", vec!["yes", "no"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "enabled",
                serde_yaml::Value::Bool(false),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert!(
            av_diags.is_empty(),
            "should NOT emit allowed-values when 'no' is in allowed list for bool false"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_rejects_yaml_number_not_in_list() {
        let schema = make_schema_with_allowed_field("level", "string", vec!["1", "2", "3"]);
        let mut store = Store::new();
        // serde_yaml parses unquoted `99` as a number
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "level",
                serde_yaml::Value::Number(serde_yaml::Number::from(99)),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert_eq!(
            av_diags.len(),
            1,
            "should emit allowed-values diagnostic for number not in list"
        );
        assert!(av_diags[0].message.contains("number"));
    }

    // rivet: verifies REQ-004
    #[test]
    fn allowed_values_accepts_yaml_number_when_in_list() {
        let schema = make_schema_with_allowed_field("level", "string", vec!["1", "2", "3"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "level",
                serde_yaml::Value::Number(serde_yaml::Number::from(2)),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let av_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "allowed-values")
            .collect();
        assert!(
            av_diags.is_empty(),
            "should NOT emit allowed-values when number string representation is in list"
        );
    }

    // rivet: verifies REQ-004
    #[test]
    fn yaml_type_coercion_warning_for_bool_in_string_field() {
        let schema = make_schema_with_allowed_field("enabled", "string", vec!["yes", "no"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "enabled",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let coercion_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "yaml-type-coercion")
            .collect();
        assert_eq!(
            coercion_diags.len(),
            1,
            "should emit yaml-type-coercion warning for bool in string field"
        );
        assert!(coercion_diags[0].message.contains("boolean"));
        assert!(coercion_diags[0].message.contains("quoting"));
        assert_eq!(coercion_diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-004
    #[test]
    fn yaml_type_coercion_warning_for_number_in_string_field() {
        let schema = make_schema_with_allowed_field("level", "string", vec!["1", "2", "3"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "level",
                serde_yaml::Value::Number(serde_yaml::Number::from(2)),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let coercion_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "yaml-type-coercion")
            .collect();
        assert_eq!(
            coercion_diags.len(),
            1,
            "should emit yaml-type-coercion warning for number in string field"
        );
        assert!(coercion_diags[0].message.contains("number"));
        assert!(coercion_diags[0].message.contains("quoting"));
        assert_eq!(coercion_diags[0].severity, Severity::Warning);
    }

    // rivet: verifies REQ-004
    #[test]
    fn no_coercion_warning_for_non_string_field_type() {
        // When the field type is "boolean" (not "string"), we should NOT emit
        // the yaml-type-coercion warning — the YAML type matches the schema intent.
        let schema = make_schema_with_allowed_field("flag", "boolean", vec!["true", "false"]);
        let mut store = Store::new();
        store
            .insert(make_artifact_with_yaml_field(
                "A-1",
                "flag",
                serde_yaml::Value::Bool(true),
            ))
            .unwrap();
        let graph = LinkGraph::build(&store, &schema);
        let diags = validate_structural(&store, &schema, &graph);

        let coercion_diags: Vec<_> = diags
            .iter()
            .filter(|d| d.rule == "yaml-type-coercion")
            .collect();
        assert!(
            coercion_diags.is_empty(),
            "should NOT emit coercion warning when field type is boolean"
        );
    }
}
