//! Bundle: emit the typed link-graph closure of an artifact as a single,
//! pasteable document for LLM context windows.
//!
//! Backs the `rivet bundle <ID> --depth N --as {yaml,jsonl}` CLI command and
//! the `rivet_bundle` MCP tool. See issue #206 for the motivation: the
//! natural reasoning workflow is `get root -> get neighbour -> get
//! neighbour-of-neighbour` which is N round-trips for what should be one.
//!
//! Traversal is breadth-first and visit-once, so cycles are inherently safe.
//! [`bundle`] follows outgoing links only; [`bundle_with_graph`] additionally
//! follows incoming links (backlinks) when asked, so bundling a graph sink
//! like a requirement still pulls in what realizes it (`--incoming`, #428).
//! Targets that don't exist in the store are emitted as references inside the
//! parent's `links:` list but are not expanded (they have no record of their own).

use std::collections::{BTreeSet, VecDeque};

use serde::Serialize;

use crate::model::{Artifact, ArtifactId, Link};
use crate::store::Store;

/// Failure modes for `bundle`. Today there's exactly one — root not in
/// the store. Kept as an enum so adding e.g. depth-bound errors later is
/// non-breaking.
#[derive(Debug, thiserror::Error)]
pub enum BundleError {
    #[error("artifact '{0}' not found in store")]
    NotFound(String),
}

/// One artifact record in a bundle. Carries the artifact's typed payload
/// plus the depth at which it was reached from the root, so a downstream
/// reader (or LLM) can see how far each entry sits from the entry point.
#[derive(Debug, Clone, Serialize, PartialEq)]
pub struct BundleEntry {
    pub id: ArtifactId,
    #[serde(rename = "type")]
    pub artifact_type: String,
    pub title: String,
    /// 0 = root, 1 = direct neighbour, etc.
    pub depth: usize,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub description: Option<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub tags: Vec<String>,
    #[serde(skip_serializing_if = "Vec::is_empty")]
    pub links: Vec<Link>,
}

impl BundleEntry {
    fn from_artifact(a: &Artifact, depth: usize) -> Self {
        Self {
            id: a.id.clone(),
            artifact_type: a.artifact_type.clone(),
            title: a.title.clone(),
            depth,
            status: a.status.clone(),
            description: a.description.clone(),
            tags: a.tags.clone(),
            links: a.links.clone(),
        }
    }
}

/// Output formats for a bundle.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BundleFormat {
    /// Inline YAML with link-type annotations as comments.
    Yaml,
    /// One JSON object per line — for tool consumers.
    Jsonl,
}

impl BundleFormat {
    pub fn parse(s: &str) -> Option<Self> {
        match s {
            "yaml" => Some(Self::Yaml),
            "jsonl" => Some(Self::Jsonl),
            _ => None,
        }
    }
}

/// Build the link-graph closure of `root` to `depth` hops, breadth-first.
///
/// Returned in BFS order: root first, then depth-1 neighbours, then
/// depth-2, and so on. Visit-once means the same artifact never appears
/// twice; cycles terminate naturally. `depth = 0` returns just the root.
pub fn bundle(store: &Store, root: &str, depth: usize) -> Result<Vec<BundleEntry>, BundleError> {
    let root_artifact = store
        .get(root)
        .ok_or_else(|| BundleError::NotFound(root.to_string()))?;

    let mut visited: BTreeSet<ArtifactId> = BTreeSet::new();
    let mut queue: VecDeque<(ArtifactId, usize)> = VecDeque::new();
    let mut out: Vec<BundleEntry> = Vec::new();

    visited.insert(root_artifact.id.clone());
    queue.push_back((root_artifact.id.clone(), 0));

    while let Some((id, d)) = queue.pop_front() {
        let Some(art) = store.get(&id) else {
            // The root is guaranteed present (checked above); a missing
            // mid-traversal id can only happen if a link points outside
            // the store. Skip silently — the dangling target still shows
            // up as a `target:` reference inside the parent's `links:`.
            continue;
        };
        out.push(BundleEntry::from_artifact(art, d));
        if d >= depth {
            continue;
        }
        for link in &art.links {
            if visited.insert(link.target.clone()) {
                queue.push_back((link.target.clone(), d + 1));
            }
        }
    }

    Ok(out)
}

/// Like [`bundle`], but also follows **incoming** links (backlinks) when
/// `include_incoming` is set.
///
/// REQ-168 / #428: [`bundle`] traverses only outgoing links, so bundling a
/// graph *sink* — a requirement, which everything links TO (`satisfies` /
/// `verifies` / `allocated-to`) but which links OUT to nothing — yields just
/// the bare artifact, dropping exactly the realizing design-decisions /
/// features / tests you want for context. With `include_incoming`, each node's
/// backlink sources are enqueued too (depth +1), so `rivet bundle <req>
/// --incoming` returns the requirement *and what realizes it*.
///
/// Backlink sources are visited in sorted (`source`) order so the bundle is
/// deterministic across runs (the graph's backlink store is HashMap-backed;
/// cf. #415). Outgoing links keep their authored order; within a node,
/// outgoing neighbours are enqueued before incoming.
pub fn bundle_with_graph(
    store: &Store,
    graph: &crate::links::LinkGraph,
    root: &str,
    depth: usize,
    include_incoming: bool,
) -> Result<Vec<BundleEntry>, BundleError> {
    if !include_incoming {
        return bundle(store, root, depth);
    }
    let root_artifact = store
        .get(root)
        .ok_or_else(|| BundleError::NotFound(root.to_string()))?;

    let mut visited: BTreeSet<ArtifactId> = BTreeSet::new();
    let mut queue: VecDeque<(ArtifactId, usize)> = VecDeque::new();
    let mut out: Vec<BundleEntry> = Vec::new();

    visited.insert(root_artifact.id.clone());
    queue.push_back((root_artifact.id.clone(), 0));

    while let Some((id, d)) = queue.pop_front() {
        let Some(art) = store.get(&id) else {
            continue;
        };
        out.push(BundleEntry::from_artifact(art, d));
        if d >= depth {
            continue;
        }
        // Outgoing neighbours (authored order, like `bundle`).
        for link in &art.links {
            if visited.insert(link.target.clone()) {
                queue.push_back((link.target.clone(), d + 1));
            }
        }
        // Incoming neighbours (backlink sources), sorted + de-duped for a
        // reproducible bundle regardless of graph (HashMap) iteration order.
        let mut sources: Vec<&str> = graph
            .backlinks_to(&id)
            .iter()
            .map(|bl| bl.source.as_str())
            .collect();
        sources.sort_unstable();
        sources.dedup();
        for src in sources {
            if visited.insert(src.to_string()) {
                queue.push_back((src.to_string(), d + 1));
            }
        }
    }

    Ok(out)
}

/// Render a bundle to the requested format.
pub fn render(entries: &[BundleEntry], format: BundleFormat) -> String {
    match format {
        BundleFormat::Yaml => render_yaml(entries),
        BundleFormat::Jsonl => render_jsonl(entries),
    }
}

/// YAML rendering with inline `# <link-type> -> <target>` annotations on
/// each link. We render by hand rather than using `serde_yaml::to_string`
/// because comments can't round-trip through serde and the annotations
/// are the whole point of the format ("an LLM reading top-to-bottom
/// resolves references without a second lookup").
fn render_yaml(entries: &[BundleEntry]) -> String {
    let mut out = String::new();
    out.push_str(&format!(
        "# rivet bundle (count={}, depth-max={})\n",
        entries.len(),
        entries.iter().map(|e| e.depth).max().unwrap_or(0),
    ));
    for entry in entries {
        out.push_str(&format!("- id: {}\n", entry.id));
        out.push_str(&format!("  type: {}\n", entry.artifact_type));
        out.push_str(&format!("  depth: {}\n", entry.depth));
        out.push_str(&format!("  title: {}\n", yaml_scalar(&entry.title)));
        if let Some(status) = &entry.status {
            out.push_str(&format!("  status: {}\n", yaml_scalar(status)));
        }
        if let Some(desc) = &entry.description {
            out.push_str(&format!("  description: {}\n", yaml_scalar(desc)));
        }
        if !entry.tags.is_empty() {
            out.push_str("  tags:\n");
            for tag in &entry.tags {
                out.push_str(&format!("    - {}\n", yaml_scalar(tag)));
            }
        }
        if !entry.links.is_empty() {
            out.push_str("  links:\n");
            for link in &entry.links {
                out.push_str(&format!("    # {} -> {}\n", link.link_type, link.target));
                out.push_str(&format!("    - type: {}\n", link.link_type));
                out.push_str(&format!("      target: {}\n", link.target));
            }
        }
    }
    out
}

/// JSONL rendering: one entry per line, no inline comments (JSON has
/// none). Suitable for tool consumers / streaming readers.
fn render_jsonl(entries: &[BundleEntry]) -> String {
    let mut out = String::new();
    for entry in entries {
        let line = serde_json::to_string(entry)
            .unwrap_or_else(|e| format!("{{\"error\":\"serialize: {e}\"}}"));
        out.push_str(&line);
        out.push('\n');
    }
    out
}

/// Quote a YAML scalar if it contains characters that would otherwise
/// trigger flow-style ambiguity. Conservative — over-quoting is fine
/// for a paste-into-LLM document; under-quoting breaks YAML parsers.
fn yaml_scalar(s: &str) -> String {
    let needs_quote = s.is_empty()
        || s.contains(':')
        || s.contains('#')
        || s.contains('\n')
        || s.contains('"')
        || s.contains('\'')
        || s.starts_with('-')
        || s.starts_with('?')
        || s.starts_with('!')
        || s.starts_with('&')
        || s.starts_with('*')
        || s.starts_with('[')
        || s.starts_with('{')
        || s.trim() != s;
    if needs_quote {
        let escaped = s
            .replace('\\', "\\\\")
            .replace('"', "\\\"")
            .replace('\n', "\\n");
        format!("\"{escaped}\"")
    } else {
        s.to_string()
    }
}

#[cfg(test)]
mod tests {
    use std::collections::BTreeMap;

    use super::*;

    fn make(id: &str, art_type: &str, title: &str, links: Vec<(&str, &str)>) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: art_type.into(),
            title: title.into(),
            description: None,
            status: None,
            tags: vec![],
            links: links
                .into_iter()
                .map(|(t, target)| Link {
                    link_type: t.into(),
                    target: target.into(),
                    external: None,
                })
                .collect(),
            fields: BTreeMap::new(),
            fields_per_variant: Default::default(),
            provenance: None,
            source_file: None,
        }
    }

    fn store_with(artifacts: Vec<Artifact>) -> Store {
        let mut s = Store::new();
        for a in artifacts {
            s.upsert(a);
        }
        s
    }

    #[test]
    fn depth_zero_returns_root_only() {
        let store = store_with(vec![
            make(
                "REQ-001",
                "requirement",
                "root",
                vec![("satisfies", "REQ-002")],
            ),
            make("REQ-002", "requirement", "leaf", vec![]),
        ]);
        let b = bundle(&store, "REQ-001", 0).unwrap();
        assert_eq!(b.len(), 1);
        assert_eq!(b[0].id, "REQ-001");
        assert_eq!(b[0].depth, 0);
    }

    #[test]
    fn depth_one_returns_root_plus_neighbours() {
        let store = store_with(vec![
            make(
                "REQ-001",
                "requirement",
                "root",
                vec![("satisfies", "REQ-002"), ("blocks", "REQ-003")],
            ),
            make("REQ-002", "requirement", "n1", vec![("derives", "REQ-004")]),
            make("REQ-003", "requirement", "n2", vec![]),
            make("REQ-004", "requirement", "deep", vec![]),
        ]);
        let b = bundle(&store, "REQ-001", 1).unwrap();
        assert_eq!(b.len(), 3);
        assert_eq!(b[0].id, "REQ-001");
        assert_eq!(b[0].depth, 0);
        let neighbours: BTreeSet<_> = b[1..].iter().map(|e| e.id.as_str()).collect();
        assert!(neighbours.contains("REQ-002"));
        assert!(neighbours.contains("REQ-003"));
        assert!(!neighbours.contains("REQ-004"));
    }

    #[test]
    fn depth_two_includes_two_hop_closure() {
        let store = store_with(vec![
            make(
                "REQ-001",
                "requirement",
                "root",
                vec![("satisfies", "REQ-002")],
            ),
            make(
                "REQ-002",
                "requirement",
                "mid",
                vec![("derives", "REQ-003")],
            ),
            make("REQ-003", "requirement", "leaf", vec![]),
        ]);
        let b = bundle(&store, "REQ-001", 2).unwrap();
        assert_eq!(b.len(), 3);
        assert_eq!(b[2].id, "REQ-003");
        assert_eq!(b[2].depth, 2);
    }

    #[test]
    fn cycle_terminates() {
        // A -> B -> A
        let store = store_with(vec![
            make("A", "requirement", "a", vec![("links-to", "B")]),
            make("B", "requirement", "b", vec![("links-to", "A")]),
        ]);
        let b = bundle(&store, "A", 5).unwrap();
        // Each artifact must appear exactly once.
        assert_eq!(b.len(), 2);
        let ids: Vec<_> = b.iter().map(|e| e.id.as_str()).collect();
        assert_eq!(ids, vec!["A", "B"]);
    }

    #[test]
    fn dangling_target_not_emitted() {
        let store = store_with(vec![make(
            "REQ-001",
            "requirement",
            "root",
            vec![("satisfies", "REQ-MISSING")],
        )]);
        let b = bundle(&store, "REQ-001", 5).unwrap();
        // Only the root expands; REQ-MISSING is referenced in its links
        // but has no record of its own.
        assert_eq!(b.len(), 1);
        assert_eq!(b[0].links.len(), 1);
        assert_eq!(b[0].links[0].target, "REQ-MISSING");
    }

    #[test]
    fn missing_root_errors() {
        let store = store_with(vec![]);
        let err = bundle(&store, "REQ-001", 1).unwrap_err();
        assert!(matches!(err, BundleError::NotFound(_)));
    }

    #[test]
    fn yaml_renders_inline_link_annotations() {
        let store = store_with(vec![
            make(
                "REQ-001",
                "requirement",
                "root",
                vec![("satisfies", "REQ-002")],
            ),
            make("REQ-002", "requirement", "leaf", vec![]),
        ]);
        let b = bundle(&store, "REQ-001", 1).unwrap();
        let out = render(&b, BundleFormat::Yaml);
        // The `# satisfies -> REQ-002` comment is the whole point.
        assert!(
            out.contains("# satisfies -> REQ-002"),
            "missing inline annotation: {out}"
        );
        // The structured form is still emitted alongside.
        assert!(out.contains("- type: satisfies"));
        assert!(out.contains("target: REQ-002"));
    }

    #[test]
    fn yaml_header_reports_count_and_max_depth() {
        let store = store_with(vec![
            make("R", "requirement", "root", vec![("links-to", "L")]),
            make("L", "requirement", "leaf", vec![]),
        ]);
        let b = bundle(&store, "R", 3).unwrap();
        let out = render(&b, BundleFormat::Yaml);
        assert!(out.starts_with("# rivet bundle (count=2, depth-max=1)\n"));
    }

    #[test]
    fn jsonl_one_record_per_line() {
        let store = store_with(vec![
            make("R", "requirement", "root", vec![("links-to", "L")]),
            make("L", "requirement", "leaf", vec![]),
        ]);
        let b = bundle(&store, "R", 1).unwrap();
        let out = render(&b, BundleFormat::Jsonl);
        let lines: Vec<_> = out.lines().collect();
        assert_eq!(lines.len(), 2);
        // Each line is independently parseable as JSON.
        for line in &lines {
            let _: serde_json::Value = serde_json::from_str(line).unwrap();
        }
    }

    #[test]
    fn yaml_scalar_quotes_when_needed() {
        assert_eq!(yaml_scalar("plain"), "plain");
        assert_eq!(yaml_scalar("has: colon"), "\"has: colon\"");
        assert_eq!(yaml_scalar(""), "\"\"");
        assert_eq!(yaml_scalar("# starts hash"), "\"# starts hash\"");
        assert_eq!(yaml_scalar("- starts dash"), "\"- starts dash\"");
    }

    #[test]
    fn format_parse_accepts_known_values() {
        assert_eq!(BundleFormat::parse("yaml"), Some(BundleFormat::Yaml));
        assert_eq!(BundleFormat::parse("jsonl"), Some(BundleFormat::Jsonl));
        assert_eq!(BundleFormat::parse("xml"), None);
    }

    // REQ-168 / #428: bundling a graph sink (a requirement that everything
    // links TO but which links OUT to nothing) must include its realizers
    // when --incoming is set, and the order must be deterministic.
    #[test]
    fn incoming_includes_backlink_sources_deterministically() {
        use crate::links::LinkGraph;
        use crate::schema::Schema;

        let store = store_with(vec![
            make("REQ-SINK", "requirement", "sink", vec![]),
            make(
                "DD-1",
                "design-decision",
                "dd",
                vec![("satisfies", "REQ-SINK")],
            ),
            make("FEAT-1", "feature", "feat", vec![("satisfies", "REQ-SINK")]),
        ]);
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);

        // Outgoing-only (default / include_incoming=false): just the sink.
        let out = bundle_with_graph(&store, &graph, "REQ-SINK", 1, false).unwrap();
        assert_eq!(out.len(), 1, "outgoing-only sink bundle is just the root");
        assert_eq!(out[0].id, "REQ-SINK");

        // With incoming: root + both realizers, root first, sources sorted.
        let inc = bundle_with_graph(&store, &graph, "REQ-SINK", 1, true).unwrap();
        let ids: Vec<&str> = inc.iter().map(|e| e.id.as_str()).collect();
        assert_eq!(ids, vec!["REQ-SINK", "DD-1", "FEAT-1"], "got {ids:?}");
    }
}
