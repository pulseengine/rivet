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
pub fn validate(store: &Store, schema: &Schema, graph: &LinkGraph) -> Vec<Diagnostic> {
    let mut diagnostics = Vec::new();

    // 1. Check that every artifact has a known type
    for artifact in store.iter() {
        if schema.artifact_type(&artifact.artifact_type).is_none() {
            diagnostics.push(Diagnostic {
                severity: Severity::Error,
                artifact_id: Some(artifact.id.clone()),
                rule: "known-type".to_string(),
                message: format!("unknown artifact type '{}'", artifact.artifact_type),
            });
            continue;
        }

        let type_def = schema.artifact_type(&artifact.artifact_type).unwrap();

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
                        if !allowed.contains(&s.to_string()) {
                            diagnostics.push(Diagnostic {
                                severity: Severity::Warning,
                                artifact_id: Some(artifact.id.clone()),
                                rule: "allowed-values".to_string(),
                                message: format!(
                                    "field '{}' has value '{}', allowed: {:?}",
                                    field.name, s, allowed
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
            severity: Severity::Error,
            artifact_id: Some(broken.source.clone()),
            rule: "broken-link".to_string(),
            message: format!(
                "link '{}' targets '{}' which does not exist",
                broken.link_type, broken.target
            ),
        });
    }

    // 7. Check traceability rules
    for rule in &schema.traceability_rules {
        for id in store.by_type(&rule.source_type) {
            // Forward link check
            if let Some(required_link) = &rule.required_link {
                let artifact = store.get(id).unwrap();
                let has_link = artifact.links.iter().any(|l| {
                    l.link_type == *required_link
                        && store
                            .get(&l.target)
                            .is_some_and(|t| rule.target_types.contains(&t.artifact_type))
                });
                if !has_link {
                    diagnostics.push(Diagnostic {
                        severity: rule.severity.clone(),
                        artifact_id: Some(id.clone()),
                        rule: rule.name.clone(),
                        message: format!(
                            "{}: {}",
                            rule.description,
                            format_args!(
                                "missing '{}' link to {:?}",
                                required_link, rule.target_types
                            )
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
                        severity: rule.severity.clone(),
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
