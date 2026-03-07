//! Query engine for filtering artifacts.

use crate::model::Artifact;
use crate::store::Store;

/// Filter criteria for querying artifacts.
#[derive(Debug, Default)]
pub struct Query {
    pub artifact_type: Option<String>,
    pub status: Option<String>,
    pub tag: Option<String>,
    pub has_link_type: Option<String>,
    pub missing_link_type: Option<String>,
}

impl Query {
    pub fn matches(&self, artifact: &Artifact) -> bool {
        if let Some(t) = &self.artifact_type {
            if artifact.artifact_type != *t {
                return false;
            }
        }
        if let Some(s) = &self.status {
            if artifact.status.as_deref() != Some(s.as_str()) {
                return false;
            }
        }
        if let Some(tag) = &self.tag {
            if !artifact.tags.contains(tag) {
                return false;
            }
        }
        if let Some(lt) = &self.has_link_type {
            if !artifact.has_link_type(lt) {
                return false;
            }
        }
        if let Some(lt) = &self.missing_link_type {
            if artifact.has_link_type(lt) {
                return false;
            }
        }
        true
    }
}

/// Execute a query against the store.
pub fn execute<'a>(store: &'a Store, query: &Query) -> Vec<&'a Artifact> {
    store.iter().filter(|a| query.matches(a)).collect()
}
