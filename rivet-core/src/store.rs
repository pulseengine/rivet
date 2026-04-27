// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
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

use std::collections::HashMap;

use crate::error::Error;
use crate::model::{Artifact, ArtifactId, BaselineConfig};

/// In-memory artifact store.
///
/// Holds all loaded artifacts and provides lookup by ID and by type.
/// The store is the central data structure consumed by the link graph,
/// validator, query engine, and matrix generator.
#[derive(Debug, Default, Clone)]
pub struct Store {
    artifacts: HashMap<ArtifactId, Artifact>,
    by_type: HashMap<String, Vec<ArtifactId>>,
}

impl Store {
    pub fn new() -> Self {
        Self::default()
    }

    /// Insert an artifact.  Returns error if the ID already exists.
    pub fn insert(&mut self, artifact: Artifact) -> Result<(), Error> {
        if self.artifacts.contains_key(&artifact.id) {
            return Err(Error::Validation(format!(
                "duplicate artifact ID: {}",
                artifact.id
            )));
        }
        let id = artifact.id.clone();
        let artifact_type = artifact.artifact_type.clone();
        self.artifacts.insert(id.clone(), artifact);
        self.by_type.entry(artifact_type).or_default().push(id);
        Ok(())
    }

    /// Insert an artifact, overwriting any existing artifact with the same ID.
    pub fn upsert(&mut self, artifact: Artifact) {
        let id = artifact.id.clone();
        let artifact_type = artifact.artifact_type.clone();

        // Remove from old type index if updating
        let is_update = if let Some(old) = self.artifacts.get(&id) {
            if old.artifact_type != artifact_type {
                let old_type = old.artifact_type.clone();
                if let Some(ids) = self.by_type.get_mut(&old_type) {
                    ids.retain(|i| i != &id);
                    // Remove the type key entirely if no artifacts remain,
                    // so types() never reports a phantom zero-count type.
                    if ids.is_empty() {
                        self.by_type.remove(&old_type);
                    }
                }
                // Type changed: not yet in the new type's list
                false
            } else {
                // Same type: already in the type index, skip re-adding
                true
            }
        } else {
            false
        };

        self.artifacts.insert(id.clone(), artifact);
        if !is_update {
            self.by_type.entry(artifact_type).or_default().push(id);
        }
    }

    /// Look up an artifact by ID.
    #[inline]
    pub fn get(&self, id: &str) -> Option<&Artifact> {
        self.artifacts.get(id)
    }

    /// Get all artifact IDs of a given type.
    #[inline]
    pub fn by_type(&self, artifact_type: &str) -> &[ArtifactId] {
        self.by_type
            .get(artifact_type)
            .map(|v| v.as_slice())
            .unwrap_or(&[])
    }

    /// Iterate over all artifacts.
    #[inline]
    pub fn iter(&self) -> impl Iterator<Item = &Artifact> {
        self.artifacts.values()
    }

    /// Total number of artifacts.
    #[inline]
    pub fn len(&self) -> usize {
        self.artifacts.len()
    }

    #[inline]
    pub fn is_empty(&self) -> bool {
        self.artifacts.is_empty()
    }

    /// All artifact type names that have at least one artifact.
    pub fn types(&self) -> impl Iterator<Item = &str> {
        self.by_type.keys().map(|s| s.as_str())
    }

    /// Number of artifacts of a given type.
    pub fn count_by_type(&self, artifact_type: &str) -> usize {
        self.by_type
            .get(artifact_type)
            .map(|v| v.len())
            .unwrap_or(0)
    }

    /// Sum of per-type counts.  Should always equal `len()`.
    pub fn types_total(&self) -> usize {
        self.by_type.values().map(|v| v.len()).sum()
    }

    /// Check whether an artifact ID exists in the store.
    #[inline]
    pub fn contains(&self, id: &str) -> bool {
        self.artifacts.contains_key(id)
    }

    /// Create a scoped store containing only artifacts in the given baseline
    /// and all prior baselines (cumulative).
    ///
    /// Artifacts whose `baseline` field matches the target or any earlier
    /// baseline (by declaration order) are included. Artifacts with no
    /// baseline field are excluded from scoped stores.
    pub fn scoped(&self, baseline: &str, baselines: &[BaselineConfig]) -> Store {
        // Find the index of the target baseline in the ordered list
        let target_idx = baselines.iter().position(|b| b.name == baseline);
        let target_idx = match target_idx {
            Some(idx) => idx,
            None => return self.clone(), // Unknown baseline, return full store
        };

        // Collect baseline names up to and including target
        let included: Vec<&str> = baselines[..=target_idx]
            .iter()
            .map(|b| b.name.as_str())
            .collect();

        // Filter artifacts: include only those whose baseline is in the included set
        let mut scoped = Store::new();
        for artifact in self.artifacts.values() {
            if let Some(art_baseline) = artifact.baseline() {
                if included.contains(&art_baseline) {
                    scoped.upsert(artifact.clone());
                }
            }
        }
        scoped
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::minimal_artifact;

    fn artifact_with_baseline(id: &str, art_type: &str, baseline: &str) -> Artifact {
        let mut a = minimal_artifact(id, art_type);
        a.fields.insert(
            "baseline".into(),
            serde_yaml::Value::String(baseline.into()),
        );
        a
    }

    fn baselines(names: &[&str]) -> Vec<BaselineConfig> {
        names
            .iter()
            .map(|n| BaselineConfig {
                name: n.to_string(),
                description: None,
            })
            .collect()
    }

    #[test]
    fn scoped_store_filters_by_baseline() {
        let mut store = Store::new();
        store
            .insert(artifact_with_baseline("A-1", "req", "v0.1.0"))
            .unwrap();
        store
            .insert(artifact_with_baseline("A-2", "req", "v0.2.0"))
            .unwrap();
        store
            .insert(artifact_with_baseline("A-3", "req", "v0.3.0"))
            .unwrap();

        let bl = baselines(&["v0.1.0", "v0.2.0", "v0.3.0"]);

        // Scope to v0.1.0 — only A-1
        let s1 = store.scoped("v0.1.0", &bl);
        assert_eq!(s1.len(), 1);
        assert!(s1.contains("A-1"));

        // Scope to v0.2.0 — cumulative: A-1 and A-2
        let s2 = store.scoped("v0.2.0", &bl);
        assert_eq!(s2.len(), 2);
        assert!(s2.contains("A-1"));
        assert!(s2.contains("A-2"));

        // Scope to v0.3.0 — all three
        let s3 = store.scoped("v0.3.0", &bl);
        assert_eq!(s3.len(), 3);
    }

    #[test]
    fn scoped_store_unknown_baseline_returns_full() {
        let mut store = Store::new();
        store
            .insert(artifact_with_baseline("A-1", "req", "v0.1.0"))
            .unwrap();
        store.insert(minimal_artifact("A-2", "req")).unwrap();

        let bl = baselines(&["v0.1.0"]);
        let scoped = store.scoped("unknown", &bl);
        // Unknown baseline returns a clone of the full store
        assert_eq!(scoped.len(), store.len());
    }

    #[test]
    fn scoped_store_excludes_untagged_artifacts() {
        let mut store = Store::new();
        store
            .insert(artifact_with_baseline("A-1", "req", "v0.1.0"))
            .unwrap();
        // A-2 has no baseline field
        store.insert(minimal_artifact("A-2", "req")).unwrap();

        let bl = baselines(&["v0.1.0"]);
        let scoped = store.scoped("v0.1.0", &bl);
        // Only A-1 is included; A-2 has no baseline and is excluded
        assert_eq!(scoped.len(), 1);
        assert!(scoped.contains("A-1"));
        assert!(!scoped.contains("A-2"));
    }

    #[test]
    fn upsert_new_artifact() {
        let mut store = Store::new();
        let a = minimal_artifact("A-1", "req");
        store.upsert(a);
        assert_eq!(store.len(), 1);
        assert!(store.contains("A-1"));
        assert_eq!(store.by_type("req"), &["A-1"]);
    }

    #[test]
    fn upsert_replaces_existing_same_type() {
        let mut store = Store::new();
        let mut a1 = minimal_artifact("A-1", "req");
        a1.title = "Original".into();
        store.upsert(a1);

        let mut a2 = minimal_artifact("A-1", "req");
        a2.title = "Updated".into();
        store.upsert(a2);

        assert_eq!(store.len(), 1);
        assert_eq!(store.get("A-1").unwrap().title, "Updated");
        // Type index should still have exactly one entry
        assert_eq!(store.by_type("req").len(), 1);
    }

    #[test]
    fn upsert_replaces_existing_different_type() {
        let mut store = Store::new();
        store.upsert(minimal_artifact("A-1", "req"));
        assert_eq!(store.by_type("req").len(), 1);

        // Upsert with a different type
        store.upsert(minimal_artifact("A-1", "feat"));
        assert_eq!(store.len(), 1);
        assert_eq!(store.get("A-1").unwrap().artifact_type, "feat");
        // Old type index should be cleared, new one populated
        assert_eq!(store.by_type("req").len(), 0);
        assert_eq!(store.by_type("feat").len(), 1);
    }

    #[test]
    fn types_total_equals_len() {
        let mut store = Store::new();
        store.upsert(minimal_artifact("A-1", "req"));
        store.upsert(minimal_artifact("A-2", "feat"));
        store.upsert(minimal_artifact("A-3", "req"));
        assert_eq!(store.types_total(), store.len());
    }

    #[test]
    fn types_total_after_type_change() {
        let mut store = Store::new();
        store.upsert(minimal_artifact("A-1", "req"));
        store.upsert(minimal_artifact("A-2", "req"));
        // Change A-1's type from req to feat
        store.upsert(minimal_artifact("A-1", "feat"));

        assert_eq!(store.len(), 2);
        assert_eq!(store.types_total(), 2);
        // The old "req" type should not appear as a phantom with 0 count
        let type_names: Vec<&str> = store.types().collect();
        for t in &type_names {
            assert!(
                store.count_by_type(t) > 0,
                "type '{t}' has 0 count but still listed in types()"
            );
        }
    }

    // ── Mutation-pinning tests ─────────────────────────────────────────

    // Verifies: REQ-010
    // Kills:
    //   store.rs:137:9 replace Store::is_empty -> bool with true
    //   store.rs:137:9 replace Store::is_empty -> bool with false
    #[test]
    fn store_is_empty_distinguishes_empty_and_populated() {
        // Mutant `false` for the empty case → would say populated.
        let empty = Store::new();
        assert!(empty.is_empty(), "fresh Store must report empty");

        // Mutant `true` for the populated case → would say empty.
        let mut populated = Store::new();
        populated
            .insert(minimal_artifact("REQ-001", "requirement"))
            .unwrap();
        assert!(
            !populated.is_empty(),
            "Store with one inserted artifact must report non-empty",
        );
    }
}
