use std::collections::{HashMap, HashSet, VecDeque};

use petgraph::graph::{DiGraph, NodeIndex};

use crate::model::ArtifactId;
use crate::schema::Schema;
use crate::store::Store;

/// A resolved link with source, target, and type information.
#[derive(Debug, Clone)]
pub struct ResolvedLink {
    pub source: ArtifactId,
    pub target: ArtifactId,
    pub link_type: String,
}

/// Backlink: an incoming link seen from the target's perspective.
#[derive(Debug, Clone)]
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

impl LinkGraph {
    /// Build the link graph from a store and schema.
    pub fn build(store: &Store, schema: &Schema) -> Self {
        let mut forward: HashMap<ArtifactId, Vec<ResolvedLink>> = HashMap::new();
        let mut backward: HashMap<ArtifactId, Vec<Backlink>> = HashMap::new();
        let mut broken = Vec::new();
        let mut graph = DiGraph::new();
        let mut node_map: HashMap<ArtifactId, NodeIndex> = HashMap::new();

        // Create nodes for all artifacts
        for artifact in store.iter() {
            let idx = graph.add_node(artifact.id.clone());
            node_map.insert(artifact.id.clone(), idx);
        }

        // Create edges for all links
        for artifact in store.iter() {
            for link in &artifact.links {
                let resolved = ResolvedLink {
                    source: artifact.id.clone(),
                    target: link.target.clone(),
                    link_type: link.link_type.clone(),
                };

                if store.contains(&link.target) {
                    // Valid link — add forward, backward, and graph edge
                    forward
                        .entry(artifact.id.clone())
                        .or_default()
                        .push(resolved);

                    let inverse_type = schema.inverse_of(&link.link_type).map(|s| s.to_string());
                    backward
                        .entry(link.target.clone())
                        .or_default()
                        .push(Backlink {
                            source: artifact.id.clone(),
                            link_type: link.link_type.clone(),
                            inverse_type,
                        });

                    if let (Some(&src), Some(&dst)) =
                        (node_map.get(&artifact.id), node_map.get(&link.target))
                    {
                        graph.add_edge(src, dst, link.link_type.clone());
                    }
                } else {
                    broken.push(resolved);
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
    pub fn graph(&self) -> &DiGraph<ArtifactId, String> {
        &self.graph
    }

    /// Access the mapping from artifact ID to petgraph node index.
    pub fn node_map(&self) -> &HashMap<ArtifactId, NodeIndex> {
        &self.node_map
    }

    /// Get forward links from an artifact.
    pub fn links_from(&self, id: &str) -> &[ResolvedLink] {
        self.forward.get(id).map(|v| v.as_slice()).unwrap_or(&[])
    }

    /// Get backlinks (incoming links) to an artifact.
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
