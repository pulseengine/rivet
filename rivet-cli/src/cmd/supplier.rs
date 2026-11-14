//! `rivet supplier list`, `check` and `pull` — cross-organizational
//! supplier-boundary traceability and the federation handshake.

use anyhow::{Context, Result};
use rivet_core::coverage;

use crate::{Cli, ProjectContext, check, marker_verified_ids, validate_format};

/// `rivet supplier list` — enumerate every `external-anchor` artifact
/// in the project, with its expected derivatives and received status.
/// Read-only.
///
/// Issue #253 MVP: this is the minimum-viable surface so an auditor can
/// answer "what supplier boundaries does this project declare?" before
/// running coverage.
pub(crate) fn cmd_supplier_list(cli: &Cli, format: &str) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    let anchors: Vec<_> = ctx
        .store
        .iter()
        .filter(|a| a.artifact_type == "external-anchor")
        .collect();

    if format == "json" {
        let entries: Vec<serde_json::Value> = anchors
            .iter()
            .map(|a| {
                let expected = a
                    .fields
                    .get("expected-derived-types")
                    .cloned()
                    .unwrap_or(rivet_yaml::Value::Null);
                let received = a
                    .fields
                    .get("received-status")
                    .and_then(|v| v.as_str())
                    .unwrap_or("not-set");
                let contract = a
                    .fields
                    .get("contract-reference")
                    .and_then(|v| v.as_str());
                serde_json::json!({
                    "id": a.id,
                    "title": a.title,
                    "expected_derived_types": serde_json::to_value(&expected).unwrap_or(serde_json::Value::Null),
                    "received_status": received,
                    "contract_reference": contract,
                })
            })
            .collect();
        let output = serde_json::json!({
            "command": "supplier list",
            "count": anchors.len(),
            "anchors": entries,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
        return Ok(true);
    }

    if anchors.is_empty() {
        println!("No `external-anchor` artifacts declared.");
        println!(
            "See docs/design/cross-org-supplier-traceability.md for how \
             to mark a supplier boundary."
        );
        return Ok(true);
    }

    println!("External anchors ({} declared):\n", anchors.len());
    println!(
        "  {:<28} {:<10} {:<20} Expected derivatives",
        "ID", "Status", "Contract"
    );
    println!("  {}", "-".repeat(80));
    for a in &anchors {
        let received = a
            .fields
            .get("received-status")
            .and_then(|v| v.as_str())
            .unwrap_or("?");
        let contract = a
            .fields
            .get("contract-reference")
            .and_then(|v| v.as_str())
            .unwrap_or("-");
        let expected = a
            .fields
            .get("expected-derived-types")
            .and_then(|v| match v {
                rivet_yaml::Value::Sequence(items) => Some(
                    items
                        .iter()
                        .filter_map(|i| i.as_str())
                        .collect::<Vec<_>>()
                        .join(", "),
                ),
                _ => None,
            })
            .unwrap_or_else(|| "-".to_string());
        println!(
            "  {:<28} {:<10} {:<20} {}",
            a.id, received, contract, expected
        );
    }
    Ok(true)
}

/// `rivet supplier check` — read-only coverage report with the 3-state
/// breakdown surfaced, filtered down to rules where at least one
/// boundary or uncovered exists.
pub(crate) fn cmd_supplier_check(cli: &Cli, format: &str) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    // REQ-389: `verifies` source markers are verification evidence.
    let graph = ctx
        .graph
        .clone()
        .with_marker_evidence(marker_verified_ids(&cli.project));
    let report = coverage::compute_coverage(&ctx.store, &ctx.schema, &graph);

    let interesting: Vec<_> = report
        .entries
        .iter()
        .filter(|e| e.external_boundary > 0 || !e.uncovered_ids.is_empty())
        .collect();

    if format == "json" {
        let rules: Vec<serde_json::Value> = interesting
            .iter()
            .map(|e| {
                serde_json::json!({
                    "name": e.rule_name,
                    "source_type": e.source_type,
                    "covered": e.covered,
                    "external_boundary": e.external_boundary,
                    "external_boundary_ids": e.external_boundary_ids,
                    "uncovered": e.uncovered_ids.len(),
                    "uncovered_ids": e.uncovered_ids,
                    "total": e.total,
                    "accounted_percentage": e.accounted_percentage_opt().map(|p| (p * 10.0).round() / 10.0),
                })
            })
            .collect();
        let total_boundary: usize = report.entries.iter().map(|e| e.external_boundary).sum();
        let total_uncovered: usize = report.entries.iter().map(|e| e.uncovered_ids.len()).sum();
        let output = serde_json::json!({
            "command": "supplier check",
            "summary": {
                "external_boundary": total_boundary,
                "uncovered": total_uncovered,
            },
            "rules": rules,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
        return Ok(true);
    }

    if interesting.is_empty() {
        println!("No supplier-boundary or uncovered findings. Every rule satisfied in-house.");
        return Ok(true);
    }

    println!("Supplier-boundary coverage:\n");
    for e in &interesting {
        println!(
            "  {} ({}): {} satisfied, {} external-boundary, {} uncovered (of {})",
            e.rule_name,
            e.source_type,
            e.covered,
            e.external_boundary,
            e.uncovered_ids.len(),
            e.total
        );
        if !e.external_boundary_ids.is_empty() {
            println!("    boundary: {}", e.external_boundary_ids.join(", "));
        }
        if !e.uncovered_ids.is_empty() {
            println!("    uncovered: {}", e.uncovered_ids.join(", "));
        }
    }
    Ok(true)
}

/// `rivet supplier pull <anchor>` — federation handshake (#288).
///
/// Reads the external-anchor's `cited-source`, fetches the source
/// payload locally (Phase 2: `kind: file` and `kind: reqif`),
/// verifies the sha256 if stamped, and stages the result under
/// `.rivet/supplier-cache/<org>/<contract>/`. A manifest carrying
/// the [`FederationProvenance`] block is written alongside so the
/// auditor can reconstruct the source. Read-only on the supplier
/// side; idempotent on the cache side.
///
/// REQ-068: `pull` is the *authorisation* point for supplier bytes.
/// When the new payload's sha256 contradicts a previously recorded
/// hash — either the anchor's stamped `cited-source.sha256` or the
/// `source-hash` from a prior cache manifest — the pull refuses
/// (exit non-zero) and names both hashes plus the supplier identity.
/// The auditor authorises the new bytes with `--accept-drift`, which
/// overwrites the cache and refreshes the stamp + `last-synced`. A
/// first pull (no prior stamp, no prior manifest) is unaffected.
pub(crate) fn cmd_supplier_pull(
    cli: &Cli,
    anchor_id: &str,
    format: &str,
    accept_drift: bool,
) -> Result<bool> {
    use rivet_core::cited_source as cs;
    use rivet_core::model::FederationProvenance;

    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    let project_root = cli.project.clone();

    // Locate the anchor by ID.
    let anchor = ctx
        .store
        .iter()
        .find(|a| a.id == anchor_id)
        .ok_or_else(|| anyhow::anyhow!("no artifact with id '{anchor_id}' in project store"))?;
    if anchor.artifact_type != "external-anchor" {
        anyhow::bail!(
            "artifact '{anchor_id}' has type '{}', expected 'external-anchor'",
            anchor.artifact_type
        );
    }
    // The anchor's source YAML — needed to re-stamp `cited-source`
    // (sha256 + last-checked) when an auditor accepts a byte drift.
    let anchor_source_file = anchor.source_file.clone();

    // Read `cited-source` — required for a pull.
    let cited_raw = anchor.fields.get("cited-source").ok_or_else(|| {
        anyhow::anyhow!(
            "anchor '{anchor_id}' has no 'cited-source' field — \
             nothing to fetch. See docs/design/cross-org-supplier-traceability.md."
        )
    })?;
    let cited = cs::parse_cited_source(cited_raw)
        .map_err(|e| anyhow::anyhow!("anchor '{anchor_id}' cited-source: {e}"))?;

    // Phase 2 supports `kind: file` and `kind: reqif`.
    let kind_str = cited.kind.as_str();
    match cited.kind {
        cs::CitedSourceKind::File | cs::CitedSourceKind::Reqif => {}
        other => anyhow::bail!(
            "supplier pull does not yet implement `kind: {}` (Phase 2 supports file|reqif). \
             See issue #288.",
            other.as_str()
        ),
    }

    // Resolve to a local source path. Both supported kinds use the
    // file-URI resolver (reqif:// degrades to file://).
    let source_path = match cited.kind {
        cs::CitedSourceKind::Reqif => cs::resolve_reqif_uri(&cited.uri, &project_root),
        _ => cs::resolve_file_uri(&cited.uri, &project_root),
    };

    // Read the bytes once; compute the wire hash. Drift detection
    // (REQ-068) happens below, once the prior recorded hash and the
    // supplier identity are known so the error can name both.
    let bytes = std::fs::read(&source_path).with_context(|| {
        format!(
            "reading source for '{anchor_id}': {}",
            source_path.display()
        )
    })?;
    let source_hash = cs::sha256_hex(&bytes);
    // For ReqIF, also verify well-formedness — caches a bad payload otherwise.
    if matches!(cited.kind, cs::CitedSourceKind::Reqif) {
        rivet_core::reqif::parse_reqif(
            std::str::from_utf8(&bytes)
                .map_err(|e| anyhow::anyhow!("ReqIF must be UTF-8 XML: {e}"))?,
            &std::collections::HashMap::new(),
        )
        .map_err(|e| anyhow::anyhow!("ReqIF parse failed for {}: {e}", source_path.display()))?;
    }

    // Determine cache target. Path layout per #288 brief:
    //   .rivet/supplier-cache/<org>/<contract>/<anchor>.<ext>
    let source_of_truth = anchor.fields.get("source-of-truth");
    let org = source_of_truth
        .and_then(|v| v.as_mapping())
        .and_then(|m| m.get(rivet_yaml::Value::String("org".into())))
        .and_then(|v| v.as_str())
        .unwrap_or("unknown-org");
    let contract = source_of_truth
        .and_then(|v| v.as_mapping())
        .and_then(|m| m.get(rivet_yaml::Value::String("contract".into())))
        .and_then(|v| v.as_str())
        .or_else(|| {
            anchor
                .fields
                .get("contract-reference")
                .and_then(|v| v.as_str())
        })
        .unwrap_or("unknown-contract");

    let cache_root = project_root
        .join(".rivet")
        .join("supplier-cache")
        .join(sanitize_path_component(org))
        .join(sanitize_path_component(contract));
    std::fs::create_dir_all(&cache_root)
        .with_context(|| format!("creating supplier cache dir: {}", cache_root.display()))?;

    // Filename: <anchor>.<ext>; ext from kind. For ReqIF use `.reqif`,
    // for plain files inherit the source's extension when available.
    let payload_name = match cited.kind {
        cs::CitedSourceKind::Reqif => format!("{anchor_id}.reqif"),
        _ => {
            let ext = source_path
                .extension()
                .and_then(|s| s.to_str())
                .unwrap_or("bin");
            format!("{anchor_id}.{ext}")
        }
    };
    let payload_path = cache_root.join(&payload_name);
    let manifest_path = cache_root.join(format!("{anchor_id}.manifest.yaml"));

    // ── REQ-068: drift detection ─────────────────────────────────────
    // `pull` is the authorisation point for supplier bytes. Establish
    // the prior recorded hash from the strongest available record:
    //   1. The prior cache manifest's `federation.source-hash` — the
    //      authoritative record of what was last pulled into the cache.
    //   2. The anchor's stamped `cited-source.sha256` — the fallback
    //      when no manifest exists yet (e.g. a hand-stamped anchor).
    // If a prior hash exists and contradicts the new wire hash, the
    // supplier has changed bytes since the last pull. Refuse unless
    // `--accept-drift` explicitly authorises the new revision.
    let prior_manifest_hash: Option<String> = std::fs::read_to_string(&manifest_path)
        .ok()
        .and_then(|m| rivet_yaml::from_str::<rivet_yaml::Value>(&m).ok())
        .and_then(|v| {
            v.get("federation")
                .and_then(|f| f.get("source-hash"))
                .and_then(|h| h.as_str())
                .map(str::to_string)
        });
    let prior_recorded_hash: Option<(&str, String)> = prior_manifest_hash
        .as_deref()
        .map(|h| ("prior cache manifest", h.to_string()))
        .or_else(|| {
            cited
                .sha256
                .as_deref()
                .map(|h| ("anchor cited-source.sha256", h.to_string()))
        });
    let drift_detected = prior_recorded_hash
        .as_ref()
        .is_some_and(|(_, prior)| !prior.eq_ignore_ascii_case(&source_hash));
    if drift_detected && !accept_drift {
        let (prior_src, prior_hash) = prior_recorded_hash.as_ref().unwrap();
        anyhow::bail!(
            "DRIFT: supplier bytes for anchor '{anchor_id}' changed since the last pull.\n  \
             supplier:   {org} / {contract}\n  \
             prior sha256 ({prior_src}): {prior_hash}\n  \
             new sha256 (wire payload):   {source_hash}\n  \
             source: {source}\n\
             Refusing to overwrite the supplier cache. A `pull` that silently \
             accepted these bytes would grant the supplier authority to revise \
             the delivered artifact with no audit trail. If this revision is \
             intentional, an auditor must re-run with `--accept-drift` to \
             authorise it explicitly.",
            source = source_path.display(),
        );
    }
    // `accept_drift_applied` is true only when an auditor authorised an
    // actual byte change — used to refresh the anchor stamp + last-synced.
    let accept_drift_applied = drift_detected && accept_drift;

    // Idempotency: if the existing payload already has the same hash,
    // we still refresh the manifest's `fetched-at` so re-runs leave a
    // trail in the file mtime but don't churn the bytes.
    let mut bytes_unchanged = false;
    if payload_path.exists() {
        if let Ok(existing) = std::fs::read(&payload_path) {
            if cs::sha256_hex(&existing) == source_hash {
                bytes_unchanged = true;
            }
        }
    }
    if !bytes_unchanged {
        std::fs::write(&payload_path, &bytes)
            .with_context(|| format!("writing cache payload: {}", payload_path.display()))?;
    }

    let fetched_at = check::sources::current_iso8601_utc();
    let source_id = cited
        .uri
        .rsplit('/')
        .next()
        .map(|s| s.to_string())
        .unwrap_or_else(|| cited.uri.clone());
    let source_tool = match cited.kind {
        cs::CitedSourceKind::Reqif => "reqif-1.2".to_string(),
        _ => "file".to_string(),
    };
    let provenance = FederationProvenance {
        source_org: org.to_string(),
        source_tool,
        source_id: source_id.clone(),
        anchor: anchor_id.to_string(),
        fetched_at: fetched_at.clone(),
        source_hash: source_hash.clone(),
        mapping_recipe: None,
    };
    // The manifest YAML is hand-authored to be readable; we wrap
    // the provenance struct under a single top-level key so future
    // additions (cached-artifacts:, signatures:) compose cleanly.
    let manifest = rivet_yaml::to_string(&serde_json::json!({
        "federation": provenance,
        "cache": {
            "payload": payload_name,
            "kind": kind_str,
        },
    }))
    .map_err(|e| anyhow::anyhow!("serializing manifest: {e}"))?;
    std::fs::write(&manifest_path, manifest)
        .with_context(|| format!("writing manifest: {}", manifest_path.display()))?;

    // REQ-068: when an auditor accepted a byte drift, re-stamp the
    // anchor so the source-of-record reflects the authorised revision.
    // This refreshes `cited-source.sha256` to the new hash and
    // `cited-source.last-checked` (the anchor's `last-synced` mark) to
    // the fetch time — equivalent to a manual re-stamp.
    let mut anchor_restamped = false;
    if accept_drift_applied {
        let target = anchor_source_file.clone().ok_or_else(|| {
            anyhow::anyhow!(
                "anchor '{anchor_id}' has no known source file — cannot \
                 re-stamp after --accept-drift"
            )
        })?;
        anchor_restamped =
            cs::update_cited_source_in_file(&target, anchor_id, &source_hash, &fetched_at)
                .with_context(|| {
                    format!(
                        "re-stamping anchor '{anchor_id}' cited-source in {}",
                        target.display()
                    )
                })?;
    }

    if format == "json" {
        let output = serde_json::json!({
            "command": "supplier pull",
            "anchor": anchor_id,
            "org": org,
            "contract": contract,
            "kind": kind_str,
            "source_path": source_path.display().to_string(),
            "source_hash": source_hash,
            "fetched_at": fetched_at,
            "cache_payload": payload_path.display().to_string(),
            "cache_manifest": manifest_path.display().to_string(),
            "bytes_unchanged": bytes_unchanged,
            "drift_accepted": accept_drift_applied,
            "anchor_restamped": anchor_restamped,
        });
        println!("{}", serde_json::to_string_pretty(&output).unwrap());
    } else {
        println!("Pulled '{anchor_id}' from {kind_str} source:");
        println!("  org/contract:   {org} / {contract}");
        println!("  source:         {}", source_path.display());
        println!("  sha256:         {source_hash}");
        println!("  cache payload:  {}", payload_path.display());
        println!("  cache manifest: {}", manifest_path.display());
        println!("  fetched-at:     {fetched_at}");
        if bytes_unchanged {
            println!("  (payload bytes unchanged — manifest refreshed only)");
        }
        if accept_drift_applied {
            println!(
                "  DRIFT ACCEPTED: supplier bytes changed; cache overwritten \
                 and anchor cited-source re-stamped to {source_hash}."
            );
        }
    }
    Ok(true)
}

/// Sanitize a single path component for use under
/// `.rivet/supplier-cache/<org>/<contract>/`. Limits to ASCII
/// alphanum + `-_.` so a typo in `source-of-truth.contract` can't
/// escape the cache root. Empty after sanitization becomes
/// `unknown`.
fn sanitize_path_component(s: &str) -> String {
    let cleaned: String = s
        .chars()
        .map(|c| {
            if c.is_ascii_alphanumeric() || matches!(c, '-' | '_' | '.') {
                c
            } else {
                '_'
            }
        })
        .collect();
    if cleaned.is_empty() {
        "unknown".to_string()
    } else {
        cleaned
    }
}
