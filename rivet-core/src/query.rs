//! Query engine for filtering artifacts.

use crate::links::LinkGraph;
use crate::model::Artifact;
use crate::sexpr_eval;
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

// ── S-expression query execution ────────────────────────────────────────

/// Result of a single s-expression query — shared shape across MCP, CLI,
/// and the `{{query:...}}` embed so callers see one canonical output.
#[derive(Debug, Clone)]
pub struct SexprQueryResult<'a> {
    pub filter: String,
    pub matches: Vec<&'a Artifact>,
    /// Total number of artifacts that match the filter, ignoring `limit`.
    pub total: usize,
    /// True if the limit truncated the result set.
    pub truncated: bool,
}

/// Error from parsing a filter passed to [`execute_sexpr`].
///
/// This is a plain string so callers (MCP, CLI, embed) can format it into
/// their own error channel without pulling in the rivet-core dependency
/// tree for `FilterError`.
#[derive(Debug, Clone)]
pub struct SexprQueryError(pub String);

impl std::fmt::Display for SexprQueryError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "invalid filter: {}", self.0)
    }
}

impl std::error::Error for SexprQueryError {}

/// Execute an s-expression filter against `store`, returning the matches.
///
/// Wraps `sexpr_eval::parse_filter` + `matches_filter_with_store` so MCP
/// (`rivet_query` tool), the CLI (`rivet query`), and the `{{query:...}}`
/// embed all converge on a single code path.  `limit` caps the returned
/// `matches` slice; `total` reports the untruncated count so callers can
/// show "Showing N of M" style footers without re-running the filter.
pub fn execute_sexpr<'a>(
    store: &'a Store,
    graph: &LinkGraph,
    filter: &str,
    limit: Option<usize>,
) -> Result<SexprQueryResult<'a>, SexprQueryError> {
    let expr = sexpr_eval::parse_filter(filter).map_err(|errs| {
        let msg = errs
            .iter()
            .map(|e| e.to_string())
            .collect::<Vec<_>>()
            .join("; ");
        SexprQueryError(msg)
    })?;

    let cap = limit.unwrap_or(usize::MAX);
    let mut matches: Vec<&Artifact> = Vec::new();
    let mut total = 0usize;
    for a in store.iter() {
        if !sexpr_eval::matches_filter_with_store(&expr, a, graph, store) {
            continue;
        }
        total += 1;
        if matches.len() < cap {
            matches.push(a);
        }
    }

    Ok(SexprQueryResult {
        filter: filter.to_string(),
        truncated: matches.len() < total,
        matches,
        total,
    })
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Artifact;
    use crate::schema::Schema;
    use std::collections::BTreeMap;

    fn plain(id: &str, typ: &str, status: Option<&str>, tags: &[&str]) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: typ.into(),
            title: format!("Title of {id}"),
            description: None,
            status: status.map(|s| s.into()),
            tags: tags.iter().map(|t| t.to_string()).collect(),
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }
    }

    fn build(artifacts: Vec<Artifact>) -> (Store, Schema, LinkGraph) {
        let mut store = Store::new();
        for a in artifacts {
            store.upsert(a);
        }
        let schema = Schema::merge(&[]);
        let graph = LinkGraph::build(&store, &schema);
        (store, schema, graph)
    }

    #[test]
    fn execute_sexpr_filters_by_type() {
        let (store, _schema, graph) = build(vec![
            plain("REQ-1", "requirement", Some("approved"), &[]),
            plain("REQ-2", "requirement", Some("draft"), &[]),
            plain("FEAT-1", "feature", Some("approved"), &[]),
        ]);

        let r = execute_sexpr(&store, &graph, r#"(= type "requirement")"#, None).unwrap();
        let mut ids: Vec<&str> = r.matches.iter().map(|a| a.id.as_str()).collect();
        ids.sort();
        assert_eq!(ids, vec!["REQ-1", "REQ-2"]);
        assert_eq!(r.total, 2);
        assert!(!r.truncated);
    }

    #[test]
    fn execute_sexpr_with_limit_reports_truncation() {
        let artifacts: Vec<Artifact> = (0..10)
            .map(|i| plain(&format!("REQ-{i:02}"), "requirement", None, &[]))
            .collect();
        let (store, _schema, graph) = build(artifacts);

        let r = execute_sexpr(&store, &graph, r#"(= type "requirement")"#, Some(3)).unwrap();
        assert_eq!(r.matches.len(), 3);
        assert_eq!(r.total, 10);
        assert!(r.truncated);
    }

    #[test]
    fn execute_sexpr_empty_filter_matches_all() {
        let (store, _schema, graph) = build(vec![
            plain("A", "requirement", None, &[]),
            plain("B", "feature", None, &[]),
        ]);
        let r = execute_sexpr(&store, &graph, "", None).unwrap();
        assert_eq!(r.matches.len(), 2);
        assert_eq!(r.total, 2);
    }

    #[test]
    fn execute_sexpr_reports_parse_errors() {
        let (store, _schema, graph) = build(vec![]);
        let err = execute_sexpr(&store, &graph, "(and", None).unwrap_err();
        assert!(err.to_string().contains("invalid filter"));
    }

    #[test]
    fn execute_sexpr_tag_filter_matches_list_command_output() {
        // Same filter that `rivet list --filter` would use — results must agree.
        let (store, _schema, graph) = build(vec![
            plain("REQ-1", "requirement", None, &["stpa", "safety"]),
            plain("REQ-2", "requirement", None, &["other"]),
        ]);
        let r = execute_sexpr(&store, &graph, r#"(has-tag "stpa")"#, None).unwrap();
        assert_eq!(r.matches.len(), 1);
        assert_eq!(r.matches[0].id, "REQ-1");
    }
}
