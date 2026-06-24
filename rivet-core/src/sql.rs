//! SQL query facade over the artifact store (REQ-229 / DD-068).
//!
//! Read-only MVP. Each call builds an **ephemeral in-memory SQLite** from the
//! live store and runs the query against it. Because the CLI reloads the project
//! on every invocation, results are never stale — this gives DD-068's "no stale
//! snapshot" guarantee without a full `vtab` module. The `vtab` upgrade is only
//! needed for the *write* path (`xUpdate`), which is a separate slice; reads at
//! rivet's scale (hundreds of artifacts) don't need it.
//!
//! Tables projected from the [`Store`]:
//! - `artifacts(id, type, title, description, status, fields_json)`
//! - `links(source, link_type, target, external)`
//! - `fields(artifact_id, key, value)`   — EAV; one row per field, for JOINs
//! - `provenance(artifact_id, created_by, model, session_id, timestamp, reviewed_by)`
//!
//! Only read statements (`SELECT` / `WITH`) are accepted; writes are refused
//! with a pointer to the planned write slice.

#![cfg(feature = "sql")]

use crate::store::Store;
use rusqlite::Connection;

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
    let head = sql
        .split_whitespace()
        .next()
        .unwrap_or("")
        .to_ascii_uppercase();
    if head != "SELECT" && head != "WITH" {
        return Err(format!(
            "only read-only queries are supported (must start with SELECT or WITH; got `{head}`). \
             SQL writes (INSERT/UPDATE/DELETE -> mutate) are a planned follow-up slice of REQ-229."
        ));
    }

    let conn = Connection::open_in_memory().map_err(|e| e.to_string())?;
    build_schema(&conn).map_err(|e| e.to_string())?;
    populate(&conn, store).map_err(|e| e.to_string())?;
    run_query(&conn, sql)
}

fn build_schema(conn: &Connection) -> rusqlite::Result<()> {
    conn.execute_batch(
        "CREATE TABLE artifacts (
            id          TEXT PRIMARY KEY,
            type        TEXT NOT NULL,
            title       TEXT,
            description TEXT,
            status      TEXT,
            fields_json TEXT
         );
         CREATE TABLE links (
            source    TEXT NOT NULL,
            link_type TEXT NOT NULL,
            target    TEXT NOT NULL,
            external  TEXT
         );
         CREATE TABLE fields (
            artifact_id TEXT NOT NULL,
            key         TEXT NOT NULL,
            value       TEXT
         );
         CREATE TABLE provenance (
            artifact_id TEXT NOT NULL,
            created_by  TEXT,
            model       TEXT,
            session_id  TEXT,
            timestamp   TEXT,
            reviewed_by TEXT
         );",
    )
}

fn populate(conn: &Connection, store: &Store) -> rusqlite::Result<()> {
    for a in store.iter_sorted() {
        let fields_json = serde_json::to_string(&a.fields).ok();
        conn.execute(
            "INSERT INTO artifacts (id, type, title, description, status, fields_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            rusqlite::params![
                a.id,
                a.artifact_type,
                a.title,
                a.description,
                a.status,
                fields_json,
            ],
        )?;

        for l in &a.links {
            // `external` is non-null only for `*-external` link types; serialize
            // the structured payload to JSON so it stays queryable.
            let external = l
                .external
                .as_ref()
                .and_then(|e| serde_json::to_string(e).ok());
            conn.execute(
                "INSERT INTO links (source, link_type, target, external) VALUES (?1, ?2, ?3, ?4)",
                rusqlite::params![a.id, l.link_type, l.target, external],
            )?;
        }

        for (key, value) in &a.fields {
            conn.execute(
                "INSERT INTO fields (artifact_id, key, value) VALUES (?1, ?2, ?3)",
                rusqlite::params![a.id, key, yaml_value_to_sql(value)],
            )?;
        }

        if let Some(p) = &a.provenance {
            conn.execute(
                "INSERT INTO provenance
                   (artifact_id, created_by, model, session_id, timestamp, reviewed_by)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
                rusqlite::params![
                    a.id,
                    p.created_by,
                    p.model,
                    p.session_id,
                    p.timestamp,
                    p.reviewed_by,
                ],
            )?;
        }
    }
    Ok(())
}

/// Flatten a YAML field value to a SQL-friendly string: scalars become their
/// natural text, complex values (sequences/maps) become compact JSON so they
/// remain queryable with SQLite's `json_*` functions.
fn yaml_value_to_sql(value: &serde_yaml::Value) -> Option<String> {
    match value {
        serde_yaml::Value::Null => None,
        serde_yaml::Value::Bool(b) => Some(b.to_string()),
        serde_yaml::Value::Number(n) => Some(n.to_string()),
        serde_yaml::Value::String(s) => Some(s.clone()),
        other => serde_json::to_string(other).ok(),
    }
}

fn run_query(conn: &Connection, sql: &str) -> Result<SqlResult, String> {
    let mut stmt = conn.prepare(sql).map_err(|e| e.to_string())?;
    let columns: Vec<String> = stmt.column_names().iter().map(|s| s.to_string()).collect();
    let col_count = columns.len();

    let mut out_rows = Vec::new();
    let mut rows = stmt.query([]).map_err(|e| e.to_string())?;
    while let Some(row) = rows.next().map_err(|e| e.to_string())? {
        let mut cells = Vec::with_capacity(col_count);
        for i in 0..col_count {
            let cell = row.get_ref(i).map_err(|e| e.to_string())?;
            cells.push(value_ref_to_string(cell));
        }
        out_rows.push(cells);
    }

    Ok(SqlResult {
        columns,
        rows: out_rows,
    })
}

fn value_ref_to_string(v: rusqlite::types::ValueRef<'_>) -> String {
    use rusqlite::types::ValueRef;
    match v {
        ValueRef::Null => String::new(),
        ValueRef::Integer(i) => i.to_string(),
        ValueRef::Real(f) => f.to_string(),
        ValueRef::Text(t) => String::from_utf8_lossy(t).into_owned(),
        ValueRef::Blob(b) => format!("<blob {} bytes>", b.len()),
    }
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
}
