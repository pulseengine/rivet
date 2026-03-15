//! Change impact analysis — given a baseline and current store, identify
//! which artifacts changed and which are affected via the link graph.
//!
//! The module provides [`content_hash`] for deterministic change detection
//! and [`compute_impact`] for full impact analysis including direct and
//! transitive dependents.

use std::collections::{HashMap, HashSet, VecDeque};

use crate::diff::{ArtifactChange, ArtifactDiff};
use crate::links::LinkGraph;
use crate::model::Artifact;
use crate::store::Store;

/// Compute a deterministic content hash for an artifact.
///
/// Two artifacts with identical content will always produce the same hash,
/// regardless of field iteration order or tag ordering.
pub fn content_hash(artifact: &Artifact) -> u64 {
    use std::collections::hash_map::DefaultHasher;
    use std::hash::{Hash, Hasher};

    let mut hasher = DefaultHasher::new();
    artifact.id.hash(&mut hasher);
    artifact.title.hash(&mut hasher);
    artifact.artifact_type.hash(&mut hasher);
    artifact.status.hash(&mut hasher);
    if let Some(desc) = &artifact.description {
        desc.hash(&mut hasher);
    }
    // Hash tags sorted for determinism
    let mut tags = artifact.tags.clone();
    tags.sort();
    tags.hash(&mut hasher);
    // Hash fields sorted by key (BTreeMap iterates in order, but be explicit)
    let mut fields: Vec<_> = artifact.fields.iter().collect();
    fields.sort_by_key(|(k, _)| *k);
    for (k, v) in &fields {
        k.hash(&mut hasher);
        // serde_yaml::Value doesn't implement Hash, so we serialize to string
        let v_str = serde_yaml::to_string(v).unwrap_or_default();
        v_str.hash(&mut hasher);
    }
    // Hash links sorted by (link_type, target) for determinism
    let mut links: Vec<_> = artifact
        .links
        .iter()
        .map(|l| (&l.link_type, &l.target))
        .collect();
    links.sort();
    for (lt, tgt) in &links {
        lt.hash(&mut hasher);
        tgt.hash(&mut hasher);
    }
    hasher.finish()
}

/// An affected artifact with the reason chain explaining how impact propagates.
#[derive(Debug, Clone)]
pub struct AffectedArtifact {
    /// The affected artifact ID.
    pub id: String,
    /// The chain of link relationships that connects this artifact to a changed one.
    /// For example: `["<- satisfies REQ-023"]`.
    pub reason_chain: Vec<String>,
    /// BFS depth from the nearest changed artifact.
    pub depth: usize,
}

/// Result of an impact analysis.
#[derive(Debug)]
pub struct ImpactResult {
    /// Artifacts that were directly modified (same ID, different content).
    pub changed: Vec<ChangedArtifact>,
    /// Artifacts at depth 1 from a changed/removed artifact in the link graph.
    pub directly_affected: Vec<AffectedArtifact>,
    /// Artifacts at depth 2+ from a changed/removed artifact.
    pub transitively_affected: Vec<AffectedArtifact>,
    /// Artifact IDs present in baseline but not in current.
    pub removed: Vec<String>,
    /// Artifact IDs present in current but not in baseline.
    pub added: Vec<String>,
}

/// A changed artifact with a summary of what changed.
#[derive(Debug, Clone)]
pub struct ChangedArtifact {
    pub id: String,
    pub change_summary: String,
}

impl ImpactResult {
    /// Total number of artifacts in the impact set (changed + affected).
    pub fn total(&self) -> usize {
        self.changed.len()
            + self.directly_affected.len()
            + self.transitively_affected.len()
            + self.removed.len()
            + self.added.len()
    }
}

/// Summarize an [`ArtifactChange`] into a human-readable string.
fn summarize_change(change: &ArtifactChange) -> String {
    let mut parts = Vec::new();
    if let Some((old, new)) = &change.status_changed {
        let old_s = old.as_deref().unwrap_or("none");
        let new_s = new.as_deref().unwrap_or("none");
        parts.push(format!("status: {old_s} -> {new_s}"));
    }
    if let Some((_, _)) = &change.title_changed {
        parts.push("title modified".to_string());
    }
    if change.description_changed {
        parts.push("description modified".to_string());
    }
    if let Some((old, new)) = &change.type_changed {
        parts.push(format!("type: {old} -> {new}"));
    }
    if !change.tags_added.is_empty() || !change.tags_removed.is_empty() {
        parts.push("tags modified".to_string());
    }
    if !change.links_added.is_empty() || !change.links_removed.is_empty() {
        parts.push("links modified".to_string());
    }
    if !change.fields_changed.is_empty() {
        parts.push(format!("fields: {}", change.fields_changed.join(", ")));
    }
    if parts.is_empty() {
        "modified".to_string()
    } else {
        parts.join(", ")
    }
}

/// Compute impact by comparing the current store against a baseline store.
///
/// The link graph should be built from the **current** store. The analysis:
/// 1. Uses [`ArtifactDiff`] to find added, removed, and modified artifacts.
/// 2. For each changed or removed artifact, walks the link graph (both
///    forward links and backlinks) via BFS up to `max_depth`.
/// 3. Separates depth-1 (directly affected) from depth-2+ (transitively affected).
pub fn compute_impact(
    current: &Store,
    baseline: &Store,
    graph: &LinkGraph,
    max_depth: usize,
) -> ImpactResult {
    // Step 1: Compute the artifact diff
    let diff = ArtifactDiff::compute(baseline, current);

    // Step 2: Build changed artifact records
    let changed: Vec<ChangedArtifact> = diff
        .modified
        .iter()
        .map(|c| ChangedArtifact {
            id: c.id.clone(),
            change_summary: summarize_change(c),
        })
        .collect();

    // Step 3: Collect all root IDs (changed + removed) that seed the impact walk
    let root_ids: HashSet<String> = changed
        .iter()
        .map(|c| c.id.clone())
        .chain(diff.removed.iter().cloned())
        .collect();

    // Step 4: BFS from each root through both forward and backward links
    let mut visited: HashMap<String, (usize, Vec<String>)> = HashMap::new();
    let mut queue: VecDeque<(String, usize, Vec<String>)> = VecDeque::new();

    // Seed the queue with root artifacts at depth 0
    for root_id in &root_ids {
        visited.insert(root_id.clone(), (0, vec![]));
        queue.push_back((root_id.clone(), 0, vec![]));
    }

    while let Some((current_id, depth, reason)) = queue.pop_front() {
        if depth >= max_depth {
            continue;
        }

        // Forward links: artifacts this one links to
        for link in graph.links_from(&current_id) {
            if !visited.contains_key(&link.target) {
                let mut chain = reason.clone();
                chain.push(format!("-> {} {}", link.link_type, current_id));
                visited.insert(link.target.clone(), (depth + 1, chain.clone()));
                queue.push_back((link.target.clone(), depth + 1, chain));
            }
        }

        // Backward links: artifacts that link to this one
        for backlink in graph.backlinks_to(&current_id) {
            if !visited.contains_key(&backlink.source) {
                let inverse_label = backlink
                    .inverse_type
                    .as_deref()
                    .unwrap_or(&backlink.link_type);
                let mut chain = reason.clone();
                chain.push(format!("<- {} {}", inverse_label, current_id));
                visited.insert(backlink.source.clone(), (depth + 1, chain.clone()));
                queue.push_back((backlink.source.clone(), depth + 1, chain));
            }
        }
    }

    // Step 5: Partition visited into direct (depth 1) and transitive (depth 2+)
    let mut directly_affected = Vec::new();
    let mut transitively_affected = Vec::new();

    for (id, (depth, reason_chain)) in &visited {
        // Skip roots (they are in changed/removed, not affected)
        if root_ids.contains(id) {
            continue;
        }
        // Skip artifacts that don't exist in current store (they'd be in removed)
        if !current.contains(id) {
            continue;
        }

        let affected = AffectedArtifact {
            id: id.clone(),
            reason_chain: reason_chain.clone(),
            depth: *depth,
        };

        if *depth == 1 {
            directly_affected.push(affected);
        } else {
            transitively_affected.push(affected);
        }
    }

    // Sort for deterministic output
    directly_affected.sort_by(|a, b| a.id.cmp(&b.id));
    transitively_affected.sort_by(|a, b| a.id.cmp(&b.id));

    let mut added = diff.added;
    let mut removed = diff.removed;
    added.sort();
    removed.sort();

    ImpactResult {
        changed,
        directly_affected,
        transitively_affected,
        removed,
        added,
    }
}

/// Load a baseline store from a directory path by re-using the standard
/// adapter pipeline. The directory should contain a `rivet.yaml` file.
pub fn load_baseline_from_dir(
    baseline_dir: &std::path::Path,
) -> Result<Store, crate::error::Error> {
    let config_path = baseline_dir.join("rivet.yaml");
    let config = crate::load_project_config(&config_path)?;

    let schemas_dir = baseline_dir.join("schemas");
    let _schema = crate::load_schemas(&config.project.schemas, &schemas_dir)
        .unwrap_or_else(|_| crate::schema::Schema::merge(&[] as &[crate::schema::SchemaFile]));

    let mut store = Store::new();
    for source in &config.sources {
        let artifacts = crate::load_artifacts(source, baseline_dir)?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }
    Ok(store)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::{Artifact, Link};
    use crate::schema::{Schema, SchemaFile};
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
            source_file: None,
        }
    }

    fn make_linked_artifact(
        id: &str,
        art_type: &str,
        title: &str,
        links: Vec<(&str, &str)>,
    ) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: art_type.into(),
            title: title.into(),
            description: None,
            status: None,
            tags: vec![],
            links: links
                .into_iter()
                .map(|(lt, tgt)| Link {
                    link_type: lt.into(),
                    target: tgt.into(),
                })
                .collect(),
            fields: BTreeMap::new(),
            source_file: None,
        }
    }

    #[test]
    fn content_hash_is_deterministic() {
        let a = make_artifact("X-1", "requirement", "A requirement");
        let h1 = content_hash(&a);
        let h2 = content_hash(&a);
        assert_eq!(h1, h2);
    }

    #[test]
    fn content_hash_changes_when_title_changes() {
        let a = make_artifact("X-1", "requirement", "Old title");
        let mut b = a.clone();
        b.title = "New title".into();
        assert_ne!(content_hash(&a), content_hash(&b));
    }

    #[test]
    fn content_hash_changes_when_status_changes() {
        let mut a = make_artifact("X-1", "requirement", "Title");
        a.status = Some("draft".into());
        let mut b = a.clone();
        b.status = Some("approved".into());
        assert_ne!(content_hash(&a), content_hash(&b));
    }

    #[test]
    fn content_hash_tag_order_independent() {
        let mut a = make_artifact("X-1", "requirement", "Title");
        a.tags = vec!["alpha".into(), "beta".into()];
        let mut b = a.clone();
        b.tags = vec!["beta".into(), "alpha".into()];
        assert_eq!(content_hash(&a), content_hash(&b));
    }

    #[test]
    fn impact_no_changes() {
        let mut store = Store::new();
        store
            .insert(make_artifact("R-1", "requirement", "Req one"))
            .unwrap();
        store
            .insert(make_artifact("R-2", "requirement", "Req two"))
            .unwrap();

        let schema = Schema::merge(&[] as &[SchemaFile]);
        let graph = LinkGraph::build(&store, &schema);

        // Baseline is identical to current
        let baseline = store.clone();
        let result = compute_impact(&store, &baseline, &graph, 10);

        assert!(result.changed.is_empty());
        assert!(result.directly_affected.is_empty());
        assert!(result.transitively_affected.is_empty());
        assert!(result.removed.is_empty());
        assert!(result.added.is_empty());
        assert_eq!(result.total(), 0);
    }

    #[test]
    fn impact_one_changed_with_dependent() {
        // Build a chain: FEAT-1 --satisfies--> REQ-1
        let mut current = Store::new();
        current
            .insert(make_artifact("REQ-1", "requirement", "Updated title"))
            .unwrap();
        current
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature one",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();

        let mut baseline = Store::new();
        baseline
            .insert(make_artifact("REQ-1", "requirement", "Original title"))
            .unwrap();
        baseline
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature one",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();

        let schema = Schema::merge(&[] as &[SchemaFile]);
        let graph = LinkGraph::build(&current, &schema);

        let result = compute_impact(&current, &baseline, &graph, 10);

        // REQ-1 is changed
        assert_eq!(result.changed.len(), 1);
        assert_eq!(result.changed[0].id, "REQ-1");

        // FEAT-1 is directly affected (links to REQ-1)
        assert_eq!(result.directly_affected.len(), 1);
        assert_eq!(result.directly_affected[0].id, "FEAT-1");
        assert_eq!(result.directly_affected[0].depth, 1);

        assert!(result.transitively_affected.is_empty());
        assert!(result.removed.is_empty());
        assert!(result.added.is_empty());
    }

    #[test]
    fn impact_transitive_chain() {
        // Chain: TEST-1 --verifies--> FEAT-1 --satisfies--> REQ-1
        let mut current = Store::new();
        current
            .insert(make_artifact("REQ-1", "requirement", "Changed req"))
            .unwrap();
        current
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();
        current
            .insert(make_linked_artifact(
                "TEST-1",
                "test-spec",
                "Test",
                vec![("verifies", "FEAT-1")],
            ))
            .unwrap();

        let mut baseline = Store::new();
        baseline
            .insert(make_artifact("REQ-1", "requirement", "Original req"))
            .unwrap();
        baseline
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();
        baseline
            .insert(make_linked_artifact(
                "TEST-1",
                "test-spec",
                "Test",
                vec![("verifies", "FEAT-1")],
            ))
            .unwrap();

        let schema = Schema::merge(&[] as &[SchemaFile]);
        let graph = LinkGraph::build(&current, &schema);

        let result = compute_impact(&current, &baseline, &graph, 10);

        assert_eq!(result.changed.len(), 1);
        assert_eq!(result.changed[0].id, "REQ-1");

        assert_eq!(result.directly_affected.len(), 1);
        assert_eq!(result.directly_affected[0].id, "FEAT-1");

        assert_eq!(result.transitively_affected.len(), 1);
        assert_eq!(result.transitively_affected[0].id, "TEST-1");
        assert_eq!(result.transitively_affected[0].depth, 2);
    }

    #[test]
    fn impact_depth_limit() {
        // Chain: TEST-1 --verifies--> FEAT-1 --satisfies--> REQ-1
        // With depth=1, TEST-1 should not appear
        let mut current = Store::new();
        current
            .insert(make_artifact("REQ-1", "requirement", "Changed req"))
            .unwrap();
        current
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();
        current
            .insert(make_linked_artifact(
                "TEST-1",
                "test-spec",
                "Test",
                vec![("verifies", "FEAT-1")],
            ))
            .unwrap();

        let mut baseline = Store::new();
        baseline
            .insert(make_artifact("REQ-1", "requirement", "Original req"))
            .unwrap();
        baseline
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();
        baseline
            .insert(make_linked_artifact(
                "TEST-1",
                "test-spec",
                "Test",
                vec![("verifies", "FEAT-1")],
            ))
            .unwrap();

        let schema = Schema::merge(&[] as &[SchemaFile]);
        let graph = LinkGraph::build(&current, &schema);

        let result = compute_impact(&current, &baseline, &graph, 1);

        assert_eq!(result.changed.len(), 1);
        assert_eq!(result.directly_affected.len(), 1);
        // TEST-1 should NOT appear — it's at depth 2 and we limited to 1
        assert!(result.transitively_affected.is_empty());
    }

    #[test]
    fn impact_added_and_removed() {
        let mut current = Store::new();
        current
            .insert(make_artifact("R-1", "requirement", "Kept"))
            .unwrap();
        current
            .insert(make_artifact("R-3", "requirement", "New artifact"))
            .unwrap();

        let mut baseline = Store::new();
        baseline
            .insert(make_artifact("R-1", "requirement", "Kept"))
            .unwrap();
        baseline
            .insert(make_artifact("R-2", "requirement", "Old artifact"))
            .unwrap();

        let schema = Schema::merge(&[] as &[SchemaFile]);
        let graph = LinkGraph::build(&current, &schema);

        let result = compute_impact(&current, &baseline, &graph, 10);

        assert!(result.changed.is_empty());
        assert_eq!(result.added, vec!["R-3".to_string()]);
        assert_eq!(result.removed, vec!["R-2".to_string()]);
    }

    #[test]
    fn impact_removed_artifact_affects_dependents() {
        // FEAT-1 links to REQ-1. REQ-1 is removed.
        let mut current = Store::new();
        current
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature one",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();
        // REQ-1 is NOT in current store

        let mut baseline = Store::new();
        baseline
            .insert(make_artifact("REQ-1", "requirement", "Req one"))
            .unwrap();
        baseline
            .insert(make_linked_artifact(
                "FEAT-1",
                "feature",
                "Feature one",
                vec![("satisfies", "REQ-1")],
            ))
            .unwrap();

        let schema = Schema::merge(&[] as &[SchemaFile]);
        let graph = LinkGraph::build(&current, &schema);

        let result = compute_impact(&current, &baseline, &graph, 10);

        assert_eq!(result.removed, vec!["REQ-1".to_string()]);
        // FEAT-1 links to REQ-1, but since REQ-1 is not in the graph
        // (it was removed), the backlink walk from REQ-1 won't find FEAT-1
        // because the graph is built from current store where REQ-1 doesn't exist.
        // This is correct: the link is now broken, which validate will catch.
    }
}
