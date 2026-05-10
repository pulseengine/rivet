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

// ── Tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    //! Mutation-pinning tests for `LinkGraph` getters and graph algorithms.
    //!
    //! Each `#[test]` annotated `Kills:` references a specific surviving
    //! mutant from `cargo mutants -p rivet-core --file rivet-core/src/links.rs`.

    use super::*;
    use crate::test_helpers::{artifact_with_links, minimal_artifact, minimal_schema, store_from};

    fn schema() -> Schema {
        Schema::merge(&[minimal_schema("test")])
    }

    /// Two-artifact store: REQ-001 satisfied-by DD-001.
    fn linked_pair() -> (Store, Schema) {
        let s = schema();
        let store = store_from(vec![
            minimal_artifact("REQ-001", "requirement"),
            artifact_with_links("DD-001", "design-decision", &[("satisfies", "REQ-001")]),
        ]);
        (store, s)
    }

    /// Three-artifact reachability chain: A -depends-on-> B -depends-on-> C.
    fn chain() -> (Store, Schema) {
        let s = schema();
        let store = store_from(vec![
            artifact_with_links("A", "node", &[("depends-on", "B")]),
            artifact_with_links("B", "node", &[("depends-on", "C")]),
            minimal_artifact("C", "node"),
        ]);
        (store, s)
    }

    // Verifies: REQ-002
    // Kills: links.rs:93:9 replace LinkGraph::fmt -> Ok(Default::default())
    #[test]
    fn debug_fmt_writes_struct_name() {
        let (store, schema) = linked_pair();
        let g = LinkGraph::build(&store, &schema);
        let dbg = format!("{g:?}");
        // The mutant returns Ok(()) and writes nothing — assert on the
        // struct name and at least one of the field labels emitted by
        // `f.debug_struct(...)`.
        assert!(
            dbg.contains("LinkGraph"),
            "Debug output missing struct name: {dbg}",
        );
        assert!(
            dbg.contains("forward_count"),
            "Debug output missing forward_count: {dbg}",
        );
    }

    // Verifies: REQ-002
    // Kills:
    //   links.rs:103:9 replace LinkGraph::eq -> bool with true
    //   links.rs:104:13 replace && with || in LinkGraph::eq
    //   links.rs:105:13 replace && with || in LinkGraph::eq
    #[test]
    fn partial_eq_distinguishes_distinct_graphs() {
        let (store_a, schema) = linked_pair();
        let g_a = LinkGraph::build(&store_a, &schema);
        // Same store → must be equal.
        let g_a2 = LinkGraph::build(&store_a, &schema);
        assert_eq!(g_a, g_a2);

        // Different store (different forward links) → must NOT be equal.
        // The constant `true` mutant would say they are equal; the && →
        // || mutants would also produce wrong equality on disjoint sets.
        let store_b = store_from(vec![
            minimal_artifact("REQ-001", "requirement"),
            // No DD-001 with satisfies link → forward map is empty.
            minimal_artifact("DD-001", "design-decision"),
        ]);
        let g_b = LinkGraph::build(&store_b, &schema);
        assert_ne!(
            g_a, g_b,
            "graphs with different forward maps must not compare equal",
        );

        // Build a graph that has the same forward map but a different
        // broken-links list so the third clause (broken == broken) is
        // exercised. Add an unresolved link target.
        let store_c = store_from(vec![
            minimal_artifact("REQ-001", "requirement"),
            artifact_with_links("DD-001", "design-decision", &[("satisfies", "REQ-001")]),
            artifact_with_links("DD-002", "design-decision", &[("satisfies", "MISSING")]),
        ]);
        let g_c = LinkGraph::build(&store_c, &schema);
        assert_ne!(
            g_a, g_c,
            "broken-links difference must propagate into PartialEq",
        );
    }

    // Verifies: REQ-002
    // Kills:
    //   links.rs:188:9 replace LinkGraph::node_map -> &HashMap::new()
    //   links.rs:188:9 replace LinkGraph::node_map -> &HashMap::from_iter([(Default, Default)])
    #[test]
    fn node_map_returns_artifact_indices() {
        let (store, schema) = linked_pair();
        let g = LinkGraph::build(&store, &schema);
        let m = g.node_map();
        // Mutant `&HashMap::new()` would return zero entries.
        assert_eq!(m.len(), 2, "node_map must contain one entry per artifact");
        // Mutant `from_iter([(Default, Default)])` would have a single
        // empty-string key.
        assert!(m.contains_key("REQ-001"));
        assert!(m.contains_key("DD-001"));
        assert!(!m.contains_key(""));
    }

    // Verifies: REQ-002
    // Kills:
    //   links.rs:205:9 replace LinkGraph::backlinks_of_type -> vec![]
    //   links.rs:207:39 replace == with != in LinkGraph::backlinks_of_type
    #[test]
    fn backlinks_of_type_filters_by_type() {
        let (store, schema) = linked_pair();
        let g = LinkGraph::build(&store, &schema);
        // REQ-001 has one incoming `satisfies` backlink from DD-001.
        let satisfies = g.backlinks_of_type("REQ-001", "satisfies");
        // Mutant `vec![]` → would return zero entries.
        assert_eq!(satisfies.len(), 1);
        assert_eq!(satisfies[0].source, "DD-001");
        assert_eq!(satisfies[0].link_type, "satisfies");

        // No incoming `verifies` backlink → must return empty.
        // Mutant `==` flipped to `!=` → would return the satisfies entry
        // here when asked for "verifies".
        let verifies = g.backlinks_of_type("REQ-001", "verifies");
        assert!(
            verifies.is_empty(),
            "asking for a different link type must not return any backlinks",
        );
    }

    // Verifies: REQ-002
    // Kills:
    //   links.rs:213:9 replace LinkGraph::has_cycles -> bool with true
    //   links.rs:213:9 replace LinkGraph::has_cycles -> bool with false
    #[test]
    fn has_cycles_distinguishes_acyclic_and_cyclic() {
        // Acyclic chain A → B → C : has_cycles must be false.
        let (acyclic, schema) = chain();
        let g_a = LinkGraph::build(&acyclic, &schema);
        assert!(
            !g_a.has_cycles(),
            "acyclic chain must not be reported as cyclic"
        );

        // Build an explicit 2-cycle: X depends-on Y, Y depends-on X.
        let cyclic = store_from(vec![
            artifact_with_links("X", "node", &[("depends-on", "Y")]),
            artifact_with_links("Y", "node", &[("depends-on", "X")]),
        ]);
        let g_c = LinkGraph::build(&cyclic, &schema);
        assert!(
            g_c.has_cycles(),
            "self-referential pair must report a cycle"
        );
    }

    // Verifies: REQ-002
    // Kills:
    //   links.rs:218:9 replace LinkGraph::orphans -> vec![]
    //   links.rs:218:9 replace LinkGraph::orphans -> vec![Box::leak(Default)]
    //   links.rs:220:59 replace && with || in LinkGraph::orphans
    //   links.rs:220:25 delete ! in LinkGraph::orphans
    //   links.rs:220:62 delete ! in LinkGraph::orphans
    #[test]
    fn orphans_lists_only_artifacts_with_no_links() {
        // CHAINED has zero orphans (all nodes participate in some link),
        // PAIRED has zero orphans, MIXED has exactly one orphan.
        let (chained, schema) = chain();
        let g_chain = LinkGraph::build(&chained, &schema);
        assert!(
            g_chain.orphans(&chained).is_empty(),
            "chain A→B→C has no orphans",
        );

        // Mixed: one connected pair + one isolated artifact.
        let mixed = store_from(vec![
            artifact_with_links("A", "node", &[("depends-on", "B")]),
            minimal_artifact("B", "node"),
            minimal_artifact("LONE", "node"),
        ]);
        let g_mix = LinkGraph::build(&mixed, &schema);
        let orphans = g_mix.orphans(&mixed);
        // Mutant `vec![]` → zero orphans returned.
        // Mutant `vec![Default]` → wrong content (default-empty id).
        // Mutant `&& → ||` → would include B (has incoming link, but |
        //                    operator would still admit it because we
        //                    test against forward map first).
        // Mutant deleted `!` on either side → connected nodes admitted.
        assert_eq!(
            orphans.len(),
            1,
            "expected exactly one orphan, got {}: {orphans:?}",
            orphans.len(),
        );
        assert_eq!(orphans[0], "LONE");
    }

    // Verifies: REQ-002
    // Kills:
    //   links.rs:228:9 replace LinkGraph::reachable -> vec![]
    //   links.rs:228:9 replace LinkGraph::reachable -> vec![Default::default()]
    //   links.rs:233:16 delete ! in LinkGraph::reachable
    //   links.rs:237:48 replace && with || in LinkGraph::reachable
    //   links.rs:237:35 replace == with != in LinkGraph::reachable
    //   links.rs:237:51 delete ! in LinkGraph::reachable
    #[test]
    fn reachable_traverses_only_matching_link_type() {
        let (chain_store, schema) = chain();
        let g = LinkGraph::build(&chain_store, &schema);

        let mut from_a = g.reachable("A", "depends-on");
        from_a.sort();
        // Mutant `vec![]` → zero reachable.
        // Mutant `vec![Default]` → returns a single empty-string entry.
        // start is removed → A must NOT be in the result.
        assert_eq!(
            from_a,
            vec!["B".to_string(), "C".to_string()],
            "A reaches B and C via depends-on; start node A excluded",
        );

        // Different link type — chain has no `verifies` edges, so
        // reachable must be empty (other than start, which is removed).
        // Mutant `== → !=` would return everything except matching edges.
        let none = g.reachable("A", "verifies");
        assert!(
            none.is_empty(),
            "reachable via non-existent link type must be empty, got {none:?}",
        );

        // From a leaf node (C) there are no outgoing edges of any type.
        // The `!visited.contains(...)` guard mutants are exercised when
        // walking the chain — combined with the from_a test, deleting
        // either ! or replacing == would change the visited set.
        let from_c = g.reachable("C", "depends-on");
        assert!(from_c.is_empty(), "leaf has no reachables, got {from_c:?}");
    }
}
