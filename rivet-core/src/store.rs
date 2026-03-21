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
                if let Some(ids) = self.by_type.get_mut(&old.artifact_type) {
                    ids.retain(|i| i != &id);
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
