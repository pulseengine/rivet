//! `rivet review export` — a commit-pinned JSON snapshot of a release's
//! artifacts for external review (issue #1227).
//!
//! The snapshot is only meaningful if it is exactly what the named commit
//! contains, so the command refuses a dirty working tree: every entry of
//! `git status --porcelain` counts, untracked files included, because an
//! untracked YAML file under an artifact source is loaded by rivet and would
//! end up in a snapshot that claims to be `HEAD`. Ignored files are not
//! reported by `git status` and do not count.
//!
//! "Scoped to vX" means exactly what `rivet list --release vX` means: the
//! artifact's `release` field equals `vX`.
//!
//! With `--since <ref>` the project is also loaded as it was at `<ref>`
//! (through the same `git archive` baseline loader `rivet impact --since`
//! uses), and only the artifacts whose vX-scoped export differs are emitted,
//! each marked `added`, `removed` or `changed`. An artifact that moved into
//! or out of vX's scope is `added` / `removed` for vX. Removed artifacts carry
//! their content as of `<ref>`.

use std::collections::BTreeMap;

use anyhow::{Context, Result};
use rivet_core::model::Artifact;
use rivet_core::store::Store;
use serde_json::{Map, Value, json};

use crate::{Cli, ProjectContext, git_in, load_baseline_from_git, validate_format};

/// The keys of one exported artifact, in output order. `changed_fields`
/// names keys from this list, in this order.
const ARTIFACT_KEYS: &[&str] = &[
    "id",
    "type",
    "title",
    "status",
    "release",
    "description",
    "tags",
    "fields",
    "fields_per_variant",
    "links",
    "provenance",
];

/// Serialize one artifact for the review export. Absent optional values are
/// `null` (never omitted, never a placeholder string), so a consumer can
/// tell "unset" from "this build does not report it".
fn artifact_json(a: &Artifact) -> Value {
    // EXHAUSTIVE DESTRUCTURE, as in `cmd_get`: a field added to `Artifact`
    // breaks this build until someone decides whether a review sees it.
    let Artifact {
        id,
        artifact_type,
        title,
        description,
        status,
        release,
        tags,
        links,
        fields,
        fields_per_variant,
        provenance,
        // A loader hint (the on-disk path), not artifact content.
        source_file: _,
    } = a;

    let to_json = |v: &rivet_yaml::Value| serde_json::to_value(v).unwrap_or(Value::Null);
    let fields_json: Map<String, Value> = fields
        .iter()
        .map(|(k, v)| (k.clone(), to_json(v)))
        .collect();
    let per_variant_json: Map<String, Value> = fields_per_variant
        .iter()
        .map(|(variant, overrides)| {
            let o: Map<String, Value> = overrides
                .iter()
                .map(|(k, v)| (k.clone(), to_json(v)))
                .collect();
            (variant.clone(), Value::Object(o))
        })
        .collect();
    let links_json: Vec<Value> = links
        .iter()
        .map(|l| json!({ "type": l.link_type, "target": l.target }))
        .collect();

    json!({
        "id": id,
        "type": artifact_type,
        "title": title,
        "status": status,
        "release": release,
        "description": description,
        "tags": tags,
        "fields": fields_json,
        "fields_per_variant": per_variant_json,
        "links": links_json,
        "provenance": serde_json::to_value(provenance).unwrap_or(Value::Null),
    })
}

/// Every artifact in `store` scoped to `release`, serialized, keyed by id
/// (so iteration is in id order). Same predicate as `rivet list --release`.
fn scoped(store: &Store, release: &str) -> BTreeMap<String, Value> {
    store
        .iter()
        .filter(|a| a.release.as_deref() == Some(release))
        .map(|a| (a.id.clone(), artifact_json(a)))
        .collect()
}

/// Names of the top-level artifact keys whose values differ, in
/// `ARTIFACT_KEYS` order.
fn changed_fields(old: &Value, new: &Value) -> Vec<&'static str> {
    ARTIFACT_KEYS
        .iter()
        .copied()
        .filter(|k| old.get(k) != new.get(k))
        .collect()
}

/// Insert `key: value` into a JSON object (no-op for non-objects).
fn with(mut v: Value, key: &str, value: Value) -> Value {
    if let Value::Object(ref mut m) = v {
        m.insert(key.to_string(), value);
    }
    v
}

/// The `--since` delta: added / removed / changed artifacts for one release,
/// in id order. Unchanged artifacts are absent.
fn delta(old: &BTreeMap<String, Value>, new: &BTreeMap<String, Value>) -> Vec<Value> {
    let mut ids: Vec<&String> = old.keys().chain(new.keys()).collect();
    ids.sort();
    ids.dedup();
    ids.into_iter()
        .filter_map(|id| match (old.get(id), new.get(id)) {
            (None, Some(n)) => Some(with(n.clone(), "change", json!("added"))),
            (Some(o), None) => Some(with(o.clone(), "change", json!("removed"))),
            (Some(o), Some(n)) => {
                let fields = changed_fields(o, n);
                if fields.is_empty() {
                    None
                } else {
                    let v = with(n.clone(), "change", json!("changed"));
                    Some(with(v, "changed_fields", json!(fields)))
                }
            }
            (None, None) => None,
        })
        .collect()
}

/// Run `git <args>` in the project and return trimmed stdout, or an error
/// naming the command and git's stderr.
fn git_stdout(cli: &Cli, args: &[&str]) -> Result<String> {
    let out = git_in(&cli.project, args)?;
    if !out.status.success() {
        anyhow::bail!(
            "`git {}` failed in {}: {}",
            args.join(" "),
            cli.project.display(),
            String::from_utf8_lossy(&out.stderr).trim()
        );
    }
    Ok(String::from_utf8_lossy(&out.stdout).trim_end().to_string())
}

/// Resolve `rev` to a full commit sha.
fn resolve_commit(cli: &Cli, rev: &str) -> Result<String> {
    git_stdout(
        cli,
        &[
            "rev-parse",
            "--verify",
            "--quiet",
            &format!("{rev}^{{commit}}"),
        ],
    )
    .with_context(|| format!("resolving git ref '{rev}' to a commit"))
}

/// `rivet review export --release <vX> [--since <ref>] [--format json]`.
pub(crate) fn cmd_review_export(
    cli: &Cli,
    release: &str,
    since: Option<&str>,
    format: &str,
) -> Result<bool> {
    validate_format(format, &["json"])?;

    // Pin to HEAD, and refuse anything that is not HEAD.
    let commit = resolve_commit(cli, "HEAD").context(
        "rivet review export needs a git repository with at least one commit to pin the snapshot to",
    )?;
    let porcelain = git_stdout(cli, &["status", "--porcelain", "--untracked-files=all"])?;
    let dirty: Vec<&str> = porcelain
        .lines()
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.get(3..).unwrap_or(l))
        .collect();
    if !dirty.is_empty() {
        eprintln!(
            "error: the working tree is dirty, so the export would not match commit {commit}.\n\
             Commit or stash these paths (untracked files count — rivet would load them):"
        );
        for p in &dirty {
            eprintln!("  {p}");
        }
        return Ok(false);
    }

    let ctx = ProjectContext::load(cli)?;
    ctx.warn_parse_error_skips(cli);
    let current = scoped(&ctx.store, release);

    let (since_sha, artifacts) = match since {
        None => (Value::Null, current.into_values().collect::<Vec<_>>()),
        Some(rev) => {
            let sha = resolve_commit(cli, rev)?;
            let baseline = load_baseline_from_git(cli, &sha)?;
            let old = scoped(&baseline, release);
            (Value::String(sha), delta(&old, &current))
        }
    };

    let output = json!({
        "command": "review-export",
        "commit": commit,
        "release": release,
        "since": since_sha,
        "count": artifacts.len(),
        "artifacts": artifacts,
    });
    println!("{}", serde_json::to_string_pretty(&output)?);
    Ok(true)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn art(id: &str, status: &str) -> Value {
        json!({ "id": id, "type": "requirement", "title": "t", "status": status,
                "release": "v1", "description": null, "tags": [], "fields": {},
                "fields_per_variant": {}, "links": [], "provenance": null })
    }

    // rivet: verifies REQ-416
    #[test]
    fn delta_marks_added_removed_changed_and_drops_unchanged() {
        let old: BTreeMap<String, Value> = [
            ("A".to_string(), art("A", "draft")),
            ("B".to_string(), art("B", "draft")),
            ("C".to_string(), art("C", "draft")),
        ]
        .into();
        let new: BTreeMap<String, Value> = [
            ("B".to_string(), art("B", "implemented")),
            ("C".to_string(), art("C", "draft")),
            ("D".to_string(), art("D", "draft")),
        ]
        .into();
        let d = delta(&old, &new);
        let got: Vec<(&str, &str)> = d
            .iter()
            .map(|v| (v["id"].as_str().unwrap(), v["change"].as_str().unwrap()))
            .collect();
        assert_eq!(got, [("A", "removed"), ("B", "changed"), ("D", "added")]);
        assert_eq!(d[1]["changed_fields"], json!(["status"]));
        assert!(d[0].get("changed_fields").is_none());
    }
}
