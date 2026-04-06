use std::collections::{HashMap, HashSet, VecDeque};

use petgraph::graph::{DiGraph, NodeIndex};

use crate::model::ArtifactId;
use crate::schema::Schema;
use crate::store::Store;

/// A resolved link with source, target, and type information.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct ResolvedLink {
    pub source: ArtifactId,
    pub target: ArtifactId,
    pub link_type: String,
}

/// Backlink: an incoming link seen from the target's perspective.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Backlink {
    pub source: ArtifactId,
    pub link_type: String,
    /// The inverse link type name (e.g., "verified-by" for a "verifies" link).
    pub inverse_type: Option<String>,
}

/// Link graph built from a store's artifacts.
///
/// Provides:
/// - Forward link traversal
/// - Backlink (inverse) lookup
/// - petgraph-based graph operations (cycle detection, topological sort)
/// - Broken link detection
///
/// `Clone` is derived so the graph can be returned from salsa tracked
/// functions. `PartialEq`/`Eq` are implemented manually — they compare
/// the semantic content (forward, backward, broken) and skip the derived
/// `petgraph::DiGraph` and `node_map` fields which are reconstructed from
/// the same data.
#[derive(Clone)]
pub struct LinkGraph {
    /// All forward links.
    forward: HashMap<ArtifactId, Vec<ResolvedLink>>,
    /// All backward links (auto-computed inverses).
    backward: HashMap<ArtifactId, Vec<Backlink>>,
    /// Broken links: target ID does not exist in the store.
    pub broken: Vec<ResolvedLink>,
    /// petgraph directed graph for structural analysis.
    graph: DiGraph<ArtifactId, String>,
    /// Map from artifact ID to petgraph node index (used for graph lookups).
    node_map: HashMap<ArtifactId, NodeIndex>,
}

impl std::fmt::Debug for LinkGraph {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("LinkGraph")
            .field("forward_count", &self.forward.len())
            .field("backward_count", &self.backward.len())
            .field("broken_count", &self.broken.len())
            .finish()
    }
}

impl PartialEq for LinkGraph {
    fn eq(&self, other: &Self) -> bool {
        self.forward == other.forward
            && self.backward == other.backward
            && self.broken == other.broken
    }
}

impl Eq for LinkGraph {}

impl LinkGraph {
    /// Build the link graph from a store and schema.
    pub fn build(store: &Store, schema: &Schema) -> Self {
        let n = store.len();
        let mut forward: HashMap<ArtifactId, Vec<ResolvedLink>> = HashMap::with_capacity(n);
        let mut backward: HashMap<ArtifactId, Vec<Backlink>> = HashMap::with_capacity(n);
        let mut broken = Vec::new();
        let mut graph = DiGraph::with_capacity(n, n * 2);
        let mut node_map: HashMap<ArtifactId, NodeIndex> = HashMap::with_capacity(n);

        // Create nodes for all artifacts
        for artifact in store.iter() {
            let idx = graph.add_node(artifact.id.clone());
            node_map.insert(artifact.id.clone(), idx);
        }

        // Create edges for all links.
        // Hoist the forward-map entry outside the inner link loop so we only
        // hash the source key once per artifact (not once per link).
        for artifact in store.iter() {
            let src_id = &artifact.id;
            if artifact.links.is_empty() {
                continue;
            }

            // Pre-fetch forward vec for this artifact (one hash lookup, not N)
            let fwd_vec = forward.entry(src_id.clone()).or_default();

            for link in &artifact.links {
                let lt = &link.link_type;
                let tgt = &link.target;
                if store.contains(tgt) {
                    // Valid link — add forward, backward, and graph edge
                    fwd_vec.push(ResolvedLink {
                        source: src_id.clone(),
                        target: tgt.clone(),
                        link_type: lt.clone(),
                    });

                    let inverse_type = schema.inverse_of(lt).map(|s| s.to_string());
                    backward.entry(tgt.clone()).or_default().push(Backlink {
                        source: src_id.clone(),
                        link_type: lt.clone(),
                        inverse_type,
                    });

                    if let (Some(&src), Some(&dst)) = (node_map.get(src_id), node_map.get(tgt)) {
                        graph.add_edge(src, dst, lt.clone());
                    }
                } else {
                    broken.push(ResolvedLink {
                        source: src_id.clone(),
                        target: tgt.clone(),
                        link_type: lt.clone(),
                    });
                }
            }
        }

        LinkGraph {
            forward,
            backward,
            broken,
            graph,
            node_map,
        }
    }

    /// Access the underlying petgraph directed graph.
    #[inline]
    pub fn graph(&self) -> &DiGraph<ArtifactId, String> {
        &self.graph
    }

    /// Access the mapping from artifact ID to petgraph node index.
    #[inline]
    pub fn node_map(&self) -> &HashMap<ArtifactId, NodeIndex> {
        &self.node_map
    }

    /// Get forward links from an artifact.
    #[inline]
    pub fn links_from(&self, id: &str) -> &[ResolvedLink] {
        self.forward.get(id).map(|v| v.as_slice()).unwrap_or(&[])
    }

    /// Get backlinks (incoming links) to an artifact.
    #[inline]
    pub fn backlinks_to(&self, id: &str) -> &[Backlink] {
        self.backward.get(id).map(|v| v.as_slice()).unwrap_or(&[])
    }

    /// Get backlinks of a specific (forward) link type.
    pub fn backlinks_of_type(&self, id: &str, link_type: &str) -> Vec<&Backlink> {
        self.backlinks_to(id)
            .iter()
            .filter(|bl| bl.link_type == link_type)
            .collect()
    }

    /// Check for cycles in the graph.
    pub fn has_cycles(&self) -> bool {
        petgraph::algo::is_cyclic_directed(&self.graph)
    }

    /// Detect orphan artifacts (no incoming or outgoing links).
    pub fn orphans<'a>(&self, store: &'a Store) -> Vec<&'a ArtifactId> {
        store
            .iter()
            .filter(|a| !self.forward.contains_key(&a.id) && !self.backward.contains_key(&a.id))
            .map(|a| &a.id)
            .collect()
    }

    /// Compute all artifact IDs reachable from a given starting artifact
    /// following a specific link type.
    pub fn reachable(&self, start: &str, link_type: &str) -> Vec<ArtifactId> {
        let mut visited = HashSet::new();
        let mut queue = VecDeque::new();
        queue.push_back(start.to_string());

        while let Some(current) = queue.pop_front() {
            if !visited.insert(current.clone()) {
                continue;
            }
            for link in self.links_from(&current) {
                if link.link_type == link_type && !visited.contains(&link.target) {
                    queue.push_back(link.target.clone());
                }
            }
        }

        // Remove the start node from results
        visited.remove(start);
        visited.into_iter().collect()
    }
}
