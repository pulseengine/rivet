//! SQL query + write facade over the artifact store (REQ-229 / REQ-230 / DD-068).
//!
//! Engine: **gluesql-core** (pure Rust — no bundled SQLite C; REQ-231/DD-069).
//! Each call builds an **ephemeral in-memory gluesql db** from the live store and
//! runs against it. Because the CLI reloads the project on every invocation,
//! results are never stale — DD-068's "no stale snapshot" guarantee.
//!
//! Tables projected from the [`Store`]:
//! - `artifacts(id, type, title, description, status, fields_json)`
//! - `links(source, link_type, target, external)`
//! - `fields(artifact_id, key, value)`   — EAV; one row per field, for JOINs
//! - `provenance(artifact_id, created_by, model, session_id, timestamp, reviewed_by)`
//!
//! [`query`] runs read-only `SELECT`/`WITH`. [`plan_write`] (REQ-230) handles
//! `UPDATE artifacts SET {status|title|description}`: it diffs the staging table
//! against the store and returns `ModifyParams` for the caller to validate and
//! apply via the indentation-safe `modify_artifact_in_file` editor (no allowlist
//! drop). Writes to `fields`/`links` and `INSERT`/`DELETE` are refused.
//!
//! gluesql's `execute` is async; it is bridged into these sync functions with
//! `futures::executor::block_on` (no async runtime required).

#![cfg(feature = "sql")]

use crate::mutate::ModifyParams;
use crate::store::Store;
use futures::executor::block_on;
use gluesql_core::prelude::{Glue, Payload, Value};
use gluesql_memory_storage::MemoryStorage;

/// Tabular result of a SQL query: column names plus stringified rows.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SqlResult {
    pub columns: Vec<String>,
    pub rows: Vec<Vec<String>>,
}

/// Run a read-only SQL query against the artifact store.
///
/// Returns an error string for write statements (anything not starting with
/// `SELECT` or `WITH`) or on SQL errors.
pub fn query(store: &Store, sql: &str) -> Result<SqlResult, String> {
    let head = first_word_upper(sql);
    if head != "SELECT" && head != "WITH" {
        return Err(format!(
            "only read-only queries are supported (must start with SELECT or WITH; got `{head}`). \
             SQL writes (INSERT/UPDATE/DELETE -> mutate) are a planned follow-up slice of REQ-229."
        ));
    }

    let mut glue = staging(store)?;
    let (labels, rows) = select(&mut glue, sql)?;
    Ok(SqlResult {
        columns: labels,
        rows: rows
            .into_iter()
            .map(|r| r.iter().map(value_to_string).collect())
            .collect(),
    })
}

/// A modification planned by a write query: the artifact id and the
/// `ModifyParams` to apply. Pure data — the caller validates and applies each
/// via `validate_modify` + `modify_artifact_in_file` (the indentation-safe
/// path that does NOT drop sibling fields, REQ-230 / DD-068).
#[derive(Debug)]
pub struct PlannedWrite {
    pub id: String,
    pub params: ModifyParams,
}

/// Plan the artifact modifications implied by a write SQL statement WITHOUT
/// touching any file.
///
/// The statement runs against the ephemeral staging db; the `artifacts` table is
/// then diffed against the live store. Only `UPDATE artifacts SET
/// {status|title|description}` is supported in this slice — writes that change
/// the `fields`/`links` staging tables, or that `INSERT`/`DELETE` rows, are
/// refused (clear error, never a silent partial write).
pub fn plan_write(store: &Store, sql: &str) -> Result<Vec<PlannedWrite>, String> {
    let head = first_word_upper(sql);
    if head == "SELECT" || head == "WITH" {
        return Err(
            "not a write statement — use `rivet sql` without a write verb for reads".into(),
        );
    }

    let mut glue = staging(store)?;

    // Snapshot the tables this slice does NOT support, so a write that changes
    // them is refused rather than silently dropped.
    let fields_before = snapshot(&mut glue, "SELECT artifact_id, key, value FROM fields")?;
    let links_before = snapshot(&mut glue, "SELECT source, link_type, target FROM links")?;

    block_on(glue.execute(sql)).map_err(|e| format!("SQL write failed: {e}"))?;

    if snapshot(&mut glue, "SELECT artifact_id, key, value FROM fields")? != fields_before {
        return Err("writes to `fields` are not supported in this slice (UPDATE artifacts SET status/title/description only); mapping SQL field writes to set-field is a follow-up".into());
    }
    if snapshot(&mut glue, "SELECT source, link_type, target FROM links")? != links_before {
        return Err("writes to `links` are not supported in this slice".into());
    }

    // Diff the artifacts table against the store.
    let mut planned = Vec::new();
    let mut seen = std::collections::HashSet::new();
    let (_, rows) = select(
        &mut glue,
        "SELECT id, title, description, status FROM artifacts",
    )?;
    for row in &rows {
        let id = value_opt(&row[0]).unwrap_or_default();
        let title = value_opt(&row[1]).unwrap_or_default();
        let description = value_opt(&row[2]);
        let status = value_opt(&row[3]);
        seen.insert(id.clone());

        let orig = store.get(&id).ok_or_else(|| {
            format!("INSERT is not supported in this slice (new id `{id}`); create artifacts with `rivet add`")
        })?;

        let mut params = ModifyParams {
            set_status: None,
            set_release: None,
            set_title: None,
            set_description: None,
            add_tags: Vec::new(),
            remove_tags: Vec::new(),
            set_fields: Vec::new(),
        };
        let mut changed = false;

        if status != orig.status {
            match &status {
                Some(s) => {
                    params.set_status = Some(s.clone());
                    changed = true;
                }
                None => {
                    return Err(format!(
                        "clearing `status` via SQL (SET status=NULL) is not supported for `{id}`"
                    ));
                }
            }
        }
        if title != orig.title {
            params.set_title = Some(title.clone());
            changed = true;
        }
        if description != orig.description {
            match &description {
                Some(d) => {
                    params.set_description = Some(d.clone());
                    changed = true;
                }
                None => {
                    return Err(format!(
                        "clearing `description` via SQL is not supported for `{id}`"
                    ));
                }
            }
        }

        if changed {
            planned.push(PlannedWrite { id, params });
        }
    }

    // A row present in the store but gone from staging means a DELETE.
    if let Some(missing) = store.iter().map(|a| &a.id).find(|id| !seen.contains(*id)) {
        return Err(format!(
            "DELETE is not supported in this slice (row `{missing}` removed); use `rivet modify`/remove"
        ));
    }

    Ok(planned)
}

// ── engine internals ────────────────────────────────────────────────────────

fn first_word_upper(sql: &str) -> String {
    sql.split_whitespace()
        .next()
        .unwrap_or("")
        .to_ascii_uppercase()
}

/// Build a fresh in-memory gluesql db and populate it from the store.
fn staging(store: &Store) -> Result<Glue<MemoryStorage>, String> {
    let mut glue = Glue::new(MemoryStorage::default());
    block_on(glue.execute(&build_setup_sql(store)))
        .map_err(|e| format!("building SQL staging tables failed: {e}"))?;
    Ok(glue)
}

/// The CREATE TABLE + batched INSERT SQL that projects the store into staging.
fn build_setup_sql(store: &Store) -> String {
    let mut s = String::new();
    s.push_str(
        "CREATE TABLE artifacts (id TEXT, type TEXT, title TEXT, description TEXT, status TEXT, fields_json TEXT);\n\
         CREATE TABLE links (source TEXT, link_type TEXT, target TEXT, external TEXT);\n\
         CREATE TABLE fields (artifact_id TEXT, key TEXT, value TEXT);\n\
         CREATE TABLE provenance (artifact_id TEXT, created_by TEXT, model TEXT, session_id TEXT, timestamp TEXT, reviewed_by TEXT);\n",
    );

    let mut artifacts = Vec::new();
    let mut links = Vec::new();
    let mut fields = Vec::new();
    let mut provenance = Vec::new();

    for a in store.iter_sorted() {
        let fields_json = serde_json::to_string(&a.fields).ok();
        artifacts.push(format!(
            "({}, {}, {}, {}, {}, {})",
            lit(Some(&a.id)),
            lit(Some(&a.artifact_type)),
            lit(Some(&a.title)),
            lit(a.description.as_deref()),
            lit(a.status.as_deref()),
            lit(fields_json.as_deref()),
        ));
        for l in &a.links {
            // `external` is non-null only for `*-external` link types; serialize
            // the structured payload to JSON so it stays queryable.
            let external = l
                .external
                .as_ref()
                .and_then(|e| serde_json::to_string(e).ok());
            links.push(format!(
                "({}, {}, {}, {})",
                lit(Some(&a.id)),
                lit(Some(&l.link_type)),
                lit(Some(&l.target)),
                lit(external.as_deref()),
            ));
        }
        for (key, value) in &a.fields {
            fields.push(format!(
                "({}, {}, {})",
                lit(Some(&a.id)),
                lit(Some(key)),
                lit(yaml_value_to_sql(value).as_deref()),
            ));
        }
        if let Some(p) = &a.provenance {
            provenance.push(format!(
                "({}, {}, {}, {}, {}, {})",
                lit(Some(&a.id)),
                lit(Some(&p.created_by)),
                lit(p.model.as_deref()),
                lit(p.session_id.as_deref()),
                lit(p.timestamp.as_deref()),
                lit(p.reviewed_by.as_deref()),
            ));
        }
    }

    for (table, rows) in [
        ("artifacts", artifacts),
        ("links", links),
        ("fields", fields),
        ("provenance", provenance),
    ] {
        if !rows.is_empty() {
            s.push_str(&format!(
                "INSERT INTO {table} VALUES {};\n",
                rows.join(", ")
            ));
        }
    }
    s
}

/// Escape an optional string into a SQL literal: `NULL`, or `'…'` with embedded
/// single-quotes doubled. The staging db is ephemeral, but values still must
/// parse cleanly.
fn lit(v: Option<&str>) -> String {
    match v {
        None => "NULL".to_string(),
        Some(s) => format!("'{}'", s.replace('\'', "''")),
    }
}

/// Flatten a YAML field value to a SQL-friendly string: scalars become their
/// natural text, complex values (sequences/maps) become compact JSON.
fn yaml_value_to_sql(value: &serde_yaml::Value) -> Option<String> {
    match value {
        serde_yaml::Value::Null => None,
        serde_yaml::Value::Bool(b) => Some(b.to_string()),
        serde_yaml::Value::Number(n) => Some(n.to_string()),
        serde_yaml::Value::String(s) => Some(s.clone()),
        other => serde_json::to_string(other).ok(),
    }
}

/// Execute a `SELECT` and return its labels + rows of gluesql `Value`s.
fn select(
    glue: &mut Glue<MemoryStorage>,
    sql: &str,
) -> Result<(Vec<String>, Vec<Vec<Value>>), String> {
    let payload = block_on(glue.execute(sql))
        .map_err(|e| e.to_string())?
        .into_iter()
        .next()
        .ok_or_else(|| "query produced no payload".to_string())?;
    match payload {
        Payload::Select { labels, rows } => Ok((labels, rows)),
        // SELECT of a single value (e.g. count) or an empty table still yields
        // a Select payload; anything else means the caller passed a non-query.
        #[allow(clippy::wildcard_enum_match_arm)]
        other => Err(format!("expected a SELECT result, got {other:?}")),
    }
}

/// Stringify a gluesql `Value` for the tabular `SqlResult` (NULL -> empty).
#[allow(clippy::wildcard_enum_match_arm)]
fn value_to_string(v: &Value) -> String {
    match v {
        Value::Null => String::new(),
        Value::Str(s) => s.clone(),
        Value::Bool(b) => b.to_string(),
        Value::I64(n) => n.to_string(),
        Value::F64(f) => f.to_string(),
        other => format!("{other:?}"),
    }
}

/// Convert a gluesql `Value` to `Option<String>`, preserving the NULL/empty
/// distinction the write-diff relies on (NULL -> None, '' -> Some("")).
#[allow(clippy::wildcard_enum_match_arm)]
fn value_opt(v: &Value) -> Option<String> {
    match v {
        Value::Null => None,
        Value::Str(s) => Some(s.clone()),
        other => Some(value_to_string(other)),
    }
}

/// Snapshot a query's rows as a single comparable string (for change detection).
fn snapshot(glue: &mut Glue<MemoryStorage>, sql: &str) -> Result<String, String> {
    let (_, rows) = select(glue, sql)?;
    let mut lines: Vec<String> = rows
        .iter()
        .map(|row| {
            row.iter()
                .map(value_to_string)
                .collect::<Vec<_>>()
                .join("\u{1f}")
        })
        .collect();
    // gluesql does not guarantee row order without ORDER BY; sort for a stable
    // comparison key.
    lines.sort();
    Ok(lines.join("\n"))
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::test_helpers::{artifact_with_links, minimal_artifact};

    fn store_with_v_model() -> Store {
        let mut store = Store::new();
        // REQ-1: implemented + verified (closed). REQ-2: implemented, no verify.
        store
            .insert(minimal_artifact("REQ-1", "requirement"))
            .unwrap();
        store
            .insert(minimal_artifact("REQ-2", "requirement"))
            .unwrap();
        store
            .insert(artifact_with_links(
                "TEST-1",
                "test",
                &[("verifies", "REQ-1")],
            ))
            .unwrap();
        store
    }

    // rivet: verifies REQ-229
    #[test]
    fn select_projects_artifacts_table() {
        let store = store_with_v_model();
        let r = query(
            &store,
            "SELECT id FROM artifacts WHERE type='requirement' ORDER BY id",
        )
        .unwrap();
        assert_eq!(r.columns, vec!["id"]);
        assert_eq!(
            r.rows,
            vec![vec!["REQ-1".to_string()], vec!["REQ-2".to_string()]]
        );
    }

    // rivet: verifies REQ-229
    #[test]
    fn join_reproduces_v_closure_set() {
        // The V-closure query: implemented requirements with no incoming verify.
        // (minimal_artifact has no status, so emulate via the links join only.)
        let store = store_with_v_model();
        let r = query(
            &store,
            "SELECT id FROM artifacts
             WHERE type='requirement'
               AND id NOT IN (SELECT target FROM links WHERE link_type='verifies')
             ORDER BY id",
        )
        .unwrap();
        assert_eq!(
            r.rows,
            vec![vec!["REQ-2".to_string()]],
            "only REQ-2 lacks a verify"
        );
    }

    #[test]
    fn writes_are_refused() {
        let store = Store::new();
        let err = query(&store, "UPDATE artifacts SET status='x'").unwrap_err();
        assert!(err.contains("read-only"), "got: {err}");
    }

    // rivet: verifies REQ-230
    #[test]
    fn plan_write_status_update_targets_one_artifact() {
        use crate::test_helpers::artifact_with_status;
        let mut store = Store::new();
        store
            .insert(artifact_with_status("REQ-1", "requirement", "implemented"))
            .unwrap();
        store
            .insert(artifact_with_status("REQ-2", "requirement", "implemented"))
            .unwrap();

        let planned = plan_write(
            &store,
            "UPDATE artifacts SET status='verified' WHERE id='REQ-1'",
        )
        .unwrap();
        assert_eq!(planned.len(), 1);
        assert_eq!(planned[0].id, "REQ-1");
        assert_eq!(planned[0].params.set_status.as_deref(), Some("verified"));
        // Untouched fields stay None — the apply path edits only what changed.
        assert!(planned[0].params.set_title.is_none());
    }

    // rivet: verifies REQ-230
    #[test]
    fn plan_write_refuses_insert_and_delete() {
        use crate::test_helpers::artifact_with_status;
        let mut store = Store::new();
        store
            .insert(artifact_with_status("REQ-1", "requirement", "implemented"))
            .unwrap();

        let ins = plan_write(
            &store,
            "INSERT INTO artifacts (id, type, title) VALUES ('REQ-9', 'requirement', 't')",
        )
        .unwrap_err();
        assert!(ins.contains("INSERT is not supported"), "got: {ins}");

        let del = plan_write(&store, "DELETE FROM artifacts WHERE id='REQ-1'").unwrap_err();
        assert!(del.contains("DELETE is not supported"), "got: {del}");
    }

    // rivet: verifies REQ-230
    #[test]
    fn plan_write_refuses_field_writes() {
        use crate::test_helpers::artifact_with_status;
        let mut store = Store::new();
        store
            .insert(artifact_with_status("REQ-1", "requirement", "implemented"))
            .unwrap();
        let err = plan_write(
            &store,
            "INSERT INTO fields (artifact_id, key, value) VALUES ('REQ-1', 'priority', 'high')",
        )
        .unwrap_err();
        assert!(err.contains("`fields`"), "got: {err}");
    }

    // rivet: verifies REQ-230
    #[test]
    fn plan_write_noop_when_value_unchanged() {
        use crate::test_helpers::artifact_with_status;
        let mut store = Store::new();
        store
            .insert(artifact_with_status("REQ-1", "requirement", "implemented"))
            .unwrap();
        let planned = plan_write(
            &store,
            "UPDATE artifacts SET status='implemented' WHERE id='REQ-1'",
        )
        .unwrap();
        assert!(planned.is_empty(), "no-op write plans nothing");
    }
}
