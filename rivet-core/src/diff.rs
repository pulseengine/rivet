//! Diff engine — compare two artifact stores and produce a structured delta.
//!
//! [`ArtifactDiff`] captures added, removed, modified, and unchanged artifacts
//! between a *base* and a *head* [`Store`].  [`DiagnosticDiff`] does the same
//! for validation diagnostics.

use std::collections::BTreeSet;

use crate::model::Link;
use crate::schema::Severity;
use crate::store::Store;
use crate::validate::Diagnostic;

// ── Artifact-level diff ──────────────────────────────────────────────────

/// Difference between two artifact sets.
#[derive(Debug)]
pub struct ArtifactDiff {
    /// Artifact IDs only present in head.
    pub added: Vec<String>,
    /// Artifact IDs only present in base.
    pub removed: Vec<String>,
    /// Artifacts present in both but structurally different.
    pub modified: Vec<ArtifactChange>,
    /// Count of artifacts that are identical in both stores.
    pub unchanged: usize,
}

/// Per-artifact change record.
#[derive(Debug)]
pub struct ArtifactChange {
    pub id: String,
    pub title_changed: Option<(String, String)>,
    pub description_changed: bool,
    pub status_changed: Option<(Option<String>, Option<String>)>,
    pub type_changed: Option<(String, String)>,
    pub tags_added: Vec<String>,
    pub tags_removed: Vec<String>,
    pub links_added: Vec<Link>,
    pub links_removed: Vec<Link>,
    pub fields_changed: Vec<String>,
}

impl ArtifactChange {
    /// Returns `true` if this change record carries no actual differences.
    pub fn is_empty(&self) -> bool {
        self.title_changed.is_none()
            && !self.description_changed
            && self.status_changed.is_none()
            && self.type_changed.is_none()
            && self.tags_added.is_empty()
            && self.tags_removed.is_empty()
            && self.links_added.is_empty()
            && self.links_removed.is_empty()
            && self.fields_changed.is_empty()
    }
}

impl ArtifactDiff {
    /// Compare two stores and produce a diff.
    pub fn compute(base: &Store, head: &Store) -> Self {
        let base_ids: BTreeSet<String> = base.iter().map(|a| a.id.clone()).collect();
        let head_ids: BTreeSet<String> = head.iter().map(|a| a.id.clone()).collect();

        let added: Vec<String> = head_ids.difference(&base_ids).cloned().collect();
        let removed: Vec<String> = base_ids.difference(&head_ids).cloned().collect();

        let common: BTreeSet<&String> = base_ids.intersection(&head_ids).collect();

        let mut modified = Vec::new();
        let mut unchanged: usize = 0;

        for id in &common {
            let b = base.get(id).unwrap();
            let h = head.get(id).unwrap();

            let title_changed = if b.title != h.title {
                Some((b.title.clone(), h.title.clone()))
            } else {
                None
            };

            let description_changed = b.description != h.description;

            let status_changed = if b.status != h.status {
                Some((b.status.clone(), h.status.clone()))
            } else {
                None
            };

            let type_changed = if b.artifact_type != h.artifact_type {
                Some((b.artifact_type.clone(), h.artifact_type.clone()))
            } else {
                None
            };

            // Tags diff (order-insensitive)
            let base_tags: BTreeSet<&String> = b.tags.iter().collect();
            let head_tags: BTreeSet<&String> = h.tags.iter().collect();
            let tags_added: Vec<String> = head_tags
                .difference(&base_tags)
                .map(|s| (*s).clone())
                .collect();
            let tags_removed: Vec<String> = base_tags
                .difference(&head_tags)
                .map(|s| (*s).clone())
                .collect();

            // Links diff (order-insensitive)
            let base_links: BTreeSet<(&String, &String)> =
                b.links.iter().map(|l| (&l.link_type, &l.target)).collect();
            let head_links: BTreeSet<(&String, &String)> =
                h.links.iter().map(|l| (&l.link_type, &l.target)).collect();
            let links_added: Vec<Link> = head_links
                .difference(&base_links)
                .map(|(lt, tgt)| Link {
                    link_type: (*lt).clone(),
                    target: (*tgt).clone(),
                })
                .collect();
            let links_removed: Vec<Link> = base_links
                .difference(&head_links)
                .map(|(lt, tgt)| Link {
                    link_type: (*lt).clone(),
                    target: (*tgt).clone(),
                })
                .collect();

            // Fields diff — compare serialised YAML values for equality
            let mut fields_changed = Vec::new();
            let all_field_keys: BTreeSet<&String> =
                b.fields.keys().chain(h.fields.keys()).collect();
            for key in all_field_keys {
                let bv = b.fields.get(key);
                let hv = h.fields.get(key);
                if bv != hv {
                    fields_changed.push(key.clone());
                }
            }

            let change = ArtifactChange {
                id: (*id).clone(),
                title_changed,
                description_changed,
                status_changed,
                type_changed,
                tags_added,
                tags_removed,
                links_added,
                links_removed,
                fields_changed,
            };

            if change.is_empty() {
                unchanged += 1;
            } else {
                modified.push(change);
            }
        }

        Self {
            added,
            removed,
            modified,
            unchanged,
        }
    }

    /// Returns `true` when there are no differences at all.
    pub fn is_empty(&self) -> bool {
        self.added.is_empty() && self.removed.is_empty() && self.modified.is_empty()
    }

    /// Human-readable one-line summary.
    pub fn summary(&self) -> String {
        format!(
            "{} added, {} removed, {} modified, {} unchanged",
            self.added.len(),
            self.removed.len(),
            self.modified.len(),
            self.unchanged,
        )
    }
}

// ── Diagnostic-level diff ────────────────────────────────────────────────

/// Difference in validation diagnostics between two versions.
#[derive(Debug)]
pub struct DiagnosticDiff {
    pub new_errors: Vec<Diagnostic>,
    pub resolved_errors: Vec<Diagnostic>,
    pub new_warnings: Vec<Diagnostic>,
    pub resolved_warnings: Vec<Diagnostic>,
}

impl DiagnosticDiff {
    /// Compare two diagnostic sets.
    pub fn compute(base: &[Diagnostic], head: &[Diagnostic]) -> Self {
        let base_errors: Vec<&Diagnostic> = base
            .iter()
            .filter(|d| d.severity == Severity::Error)
            .collect();
        let head_errors: Vec<&Diagnostic> = head
            .iter()
            .filter(|d| d.severity == Severity::Error)
            .collect();
        let base_warnings: Vec<&Diagnostic> = base
            .iter()
            .filter(|d| d.severity == Severity::Warning)
            .collect();
        let head_warnings: Vec<&Diagnostic> = head
            .iter()
            .filter(|d| d.severity == Severity::Warning)
            .collect();

        let new_errors = head_errors
            .iter()
            .filter(|d| !base_errors.contains(d))
            .cloned()
            .cloned()
            .collect();
        let resolved_errors = base_errors
            .iter()
            .filter(|d| !head_errors.contains(d))
            .cloned()
            .cloned()
            .collect();
        let new_warnings = head_warnings
            .iter()
            .filter(|d| !base_warnings.contains(d))
            .cloned()
            .cloned()
            .collect();
        let resolved_warnings = base_warnings
            .iter()
            .filter(|d| !head_warnings.contains(d))
            .cloned()
            .cloned()
            .collect();

        Self {
            new_errors,
            resolved_errors,
            new_warnings,
            resolved_warnings,
        }
    }

    /// Returns `true` when there is no diagnostic change.
    pub fn is_empty(&self) -> bool {
        self.new_errors.is_empty()
            && self.resolved_errors.is_empty()
            && self.new_warnings.is_empty()
            && self.resolved_warnings.is_empty()
    }

    /// Human-readable one-line summary.
    pub fn summary(&self) -> String {
        format!(
            "{} new errors, {} resolved errors, {} new warnings, {} resolved warnings",
            self.new_errors.len(),
            self.resolved_errors.len(),
            self.new_warnings.len(),
            self.resolved_warnings.len(),
        )
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Artifact;
    use std::collections::BTreeMap;

    fn make_artifact(id: &str, art_type: &str, title: &str) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: art_type.into(),
            title: title.into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }
    }

    // rivet: verifies REQ-001
    #[test]
    fn empty_diff() {
        let a = Store::new();
        let b = Store::new();
        let diff = ArtifactDiff::compute(&a, &b);
        assert!(diff.is_empty());
        assert_eq!(diff.unchanged, 0);
    }

    // rivet: verifies REQ-001
    #[test]
    fn identical_stores() {
        let mut a = Store::new();
        a.insert(make_artifact("X-1", "loss", "Loss one")).unwrap();
        let mut b = Store::new();
        b.insert(make_artifact("X-1", "loss", "Loss one")).unwrap();
        let diff = ArtifactDiff::compute(&a, &b);
        assert!(diff.is_empty());
        assert_eq!(diff.unchanged, 1);
    }

    // rivet: verifies REQ-001
    #[test]
    fn added_artifact() {
        let base = Store::new();
        let mut head = Store::new();
        head.insert(make_artifact("N-1", "loss", "New loss"))
            .unwrap();
        let diff = ArtifactDiff::compute(&base, &head);
        assert_eq!(diff.added, vec!["N-1".to_string()]);
        assert!(diff.removed.is_empty());
        assert!(diff.modified.is_empty());
    }

    // rivet: verifies REQ-001
    #[test]
    fn removed_artifact() {
        let mut base = Store::new();
        base.insert(make_artifact("R-1", "loss", "Old loss"))
            .unwrap();
        let head = Store::new();
        let diff = ArtifactDiff::compute(&base, &head);
        assert!(diff.added.is_empty());
        assert_eq!(diff.removed, vec!["R-1".to_string()]);
    }

    // rivet: verifies REQ-001
    #[test]
    fn modified_title() {
        let mut base = Store::new();
        base.insert(make_artifact("M-1", "loss", "Old title"))
            .unwrap();
        let mut head = Store::new();
        head.insert(make_artifact("M-1", "loss", "New title"))
            .unwrap();
        let diff = ArtifactDiff::compute(&base, &head);
        assert!(!diff.is_empty());
        assert_eq!(diff.modified.len(), 1);
        let change = &diff.modified[0];
        assert_eq!(
            change.title_changed,
            Some(("Old title".into(), "New title".into()))
        );
    }
}
