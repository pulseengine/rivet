use std::collections::BTreeMap;
use std::path::Path;

use axum::Json;
use axum::extract::{Query, State};
use axum::response::IntoResponse;
use serde::{Deserialize, Serialize};

use rivet_core::coverage::compute_coverage;
use rivet_core::schema::Severity;

use super::SharedState;

// ── Health ──────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct HealthResponse {
    status: &'static str,
    project: String,
    version: &'static str,
    artifacts: usize,
    uptime_seconds: u64,
}

pub(crate) async fn health(State(state): State<SharedState>) -> impl IntoResponse {
    let guard = state.read().await;
    Json(HealthResponse {
        status: "ok",
        project: guard.context.project_name.clone(),
        version: env!("CARGO_PKG_VERSION"),
        artifacts: guard.store.len(),
        uptime_seconds: guard.started_at.elapsed().as_secs(),
    })
}

// ── oEmbed ──────────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub(crate) struct OembedParams {
    url: String,
    #[serde(default)]
    format: Option<String>,
    #[serde(default)]
    maxwidth: Option<u32>,
    #[serde(default)]
    maxheight: Option<u32>,
}

#[derive(Serialize)]
struct OembedResponse {
    version: &'static str,
    r#type: &'static str,
    title: String,
    provider_name: &'static str,
    provider_url: String,
    width: u32,
    height: u32,
    html: String,
}

pub(crate) async fn oembed(
    State(state): State<SharedState>,
    Query(params): Query<OembedParams>,
) -> impl IntoResponse {
    // Reject XML format
    if params.format.as_deref() == Some("xml") {
        return (
            axum::http::StatusCode::NOT_IMPLEMENTED,
            Json(serde_json::json!({"error": "XML format not supported"})),
        )
            .into_response();
    }

    // Extract artifact ID from URL path: find "/artifacts/" and take the rest
    let artifact_id = params
        .url
        .find("/artifacts/")
        .map(|i| &params.url[i + "/artifacts/".len()..])
        .map(|s| s.split('/').next().unwrap_or(s))
        .map(|s| s.split('?').next().unwrap_or(s));

    let artifact_id = match artifact_id {
        Some(id) if !id.is_empty() => id,
        _ => {
            return (
                axum::http::StatusCode::NOT_FOUND,
                Json(serde_json::json!({"error": "URL must match /artifacts/{id}"})),
            )
                .into_response();
        }
    };

    // Look up artifact in local store and external stores
    let guard = state.read().await;
    let artifact = guard.store.get(artifact_id).or_else(|| {
        guard
            .externals
            .iter()
            .find_map(|ext| ext.store.get(artifact_id))
    });

    let artifact = match artifact {
        Some(a) => a,
        None => {
            return (
                axum::http::StatusCode::NOT_FOUND,
                Json(serde_json::json!({"error": "artifact not found"})),
            )
                .into_response();
        }
    };

    // Derive provider URL from the incoming url param (scheme + host + port)
    let provider_url = extract_base_url(&params.url)
        .unwrap_or_else(|| format!("http://localhost:{}", guard.context.port));

    // Dimension clamping (oEmbed spec: maxwidth/maxheight are upper bounds)
    let width = params.maxwidth.map_or(600, |mw| mw.min(600));
    let height = params.maxheight.map_or(400, |mh| mh.min(400));

    let title = format!("{}: {}", artifact.id, artifact.title);
    let iframe_src = format!("{provider_url}/embed/artifacts/{}", artifact.id);
    let html = format!(
        "<iframe src=\"{iframe_src}\" width=\"{width}\" height=\"{height}\" \
         frameborder=\"0\" allowtransparency=\"true\"></iframe>"
    );

    Json(OembedResponse {
        version: "1.0",
        r#type: "rich",
        title,
        provider_name: "Rivet",
        provider_url,
        width,
        height,
        html,
    })
    .into_response()
}

/// Extract "http://host:port" from a full URL string.
fn extract_base_url(url: &str) -> Option<String> {
    let after_scheme = url.find("://").map(|i| i + 3)?;
    let host_end = url[after_scheme..].find('/').map(|i| after_scheme + i)?;
    Some(url[..host_end].to_string())
}

// ── Stats ───────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct StatsResponse {
    total_artifacts: usize,
    by_type: BTreeMap<String, usize>,
    by_status: BTreeMap<String, usize>,
    validation: ValidationStats,
    coverage: Vec<CoverageStats>,
    by_origin: BTreeMap<String, usize>,
}

#[derive(Serialize)]
struct ValidationStats {
    error: usize,
    warning: usize,
    info: usize,
    clean: usize,
}

#[derive(Serialize)]
struct CoverageStats {
    rule: String,
    description: String,
    source_type: String,
    link_type: String,
    covered: usize,
    total: usize,
    percentage: f64,
}

pub(crate) async fn stats(State(state): State<SharedState>) -> impl IntoResponse {
    let guard = state.read().await;

    // by_type: include all schema types (even zero-count) + any types in store
    let mut by_type = BTreeMap::new();
    for type_name in guard.schema.artifact_types.keys() {
        by_type.insert(type_name.clone(), 0usize);
    }
    for artifact in guard.store.iter() {
        *by_type.entry(artifact.artifact_type.clone()).or_default() += 1;
    }
    let local_count: usize = by_type.values().sum();

    // external artifact counts
    let mut by_origin = BTreeMap::new();
    by_origin.insert("local".to_string(), local_count);
    for ext in &guard.externals {
        let ext_count = ext.store.len();
        by_origin.insert(format!("external:{}", ext.prefix), ext_count);
        for artifact in ext.store.iter() {
            *by_type.entry(artifact.artifact_type.clone()).or_default() += 1;
        }
    }

    let total_artifacts: usize = by_type.values().sum();

    // by_status
    let mut by_status = BTreeMap::new();
    for artifact in guard.store.iter() {
        let key = artifact.status.as_deref().unwrap_or("unset").to_string();
        *by_status.entry(key).or_default() += 1;
    }
    for ext in &guard.externals {
        for artifact in ext.store.iter() {
            let key = artifact.status.as_deref().unwrap_or("unset").to_string();
            *by_status.entry(key).or_default() += 1;
        }
    }

    // validation: count artifacts by worst diagnostic severity
    let mut worst: BTreeMap<String, Severity> = BTreeMap::new();
    for diag in &guard.cached_diagnostics {
        if let Some(ref id) = diag.artifact_id {
            let entry = worst.entry(id.clone()).or_insert(Severity::Info);
            if severity_rank(diag.severity) > severity_rank(*entry) {
                *entry = diag.severity;
            }
        }
    }
    let mut validation = ValidationStats {
        error: 0,
        warning: 0,
        info: 0,
        clean: 0,
    };
    let all_ids: Vec<String> = guard.store.iter().map(|a| a.id.clone()).collect();
    for id in &all_ids {
        match worst.get(id) {
            Some(Severity::Error) => validation.error += 1,
            Some(Severity::Warning) => validation.warning += 1,
            Some(Severity::Info) => validation.info += 1,
            None => validation.clean += 1,
        }
    }
    // External artifacts have no local diagnostics — count as clean
    let ext_count: usize = guard.externals.iter().map(|e| e.store.len()).sum();
    validation.clean += ext_count;

    // coverage
    let report = compute_coverage(&guard.store, &guard.schema, &guard.graph);
    let coverage: Vec<CoverageStats> = report
        .entries
        .iter()
        .map(|e| CoverageStats {
            rule: e.rule_name.clone(),
            description: e.description.clone(),
            source_type: e.source_type.clone(),
            link_type: e.link_type.clone(),
            covered: e.covered,
            total: e.total,
            percentage: e.percentage(),
        })
        .collect();

    Json(StatsResponse {
        total_artifacts,
        by_type,
        by_status,
        validation,
        coverage,
        by_origin,
    })
}

fn severity_rank(s: Severity) -> u8 {
    match s {
        Severity::Info => 1,
        Severity::Warning => 2,
        Severity::Error => 3,
    }
}

// ── Shared helpers ──────────────────────────────────────────────────────

#[derive(Serialize)]
struct ApiArtifact {
    id: String,
    title: String,
    r#type: String,
    status: Option<String>,
    origin: String,
    links_out: usize,
    links_in: usize,
    source_file: Option<String>,
}

fn resolve_source_file(
    artifact: &rivet_core::model::Artifact,
    project_path: &Path,
) -> Option<String> {
    artifact.source_file.as_ref().and_then(|p| {
        p.strip_prefix(project_path)
            .ok()
            .or(Some(p.as_path()))
            .map(|rel| rel.display().to_string())
    })
}

fn to_api_artifact(
    artifact: &rivet_core::model::Artifact,
    origin: &str,
    state: &super::AppState,
) -> ApiArtifact {
    ApiArtifact {
        id: artifact.id.clone(),
        title: artifact.title.clone(),
        r#type: artifact.artifact_type.clone(),
        status: artifact.status.clone(),
        origin: origin.to_string(),
        links_out: state.graph.links_from(&artifact.id).len(),
        links_in: state.graph.backlinks_to(&artifact.id).len(),
        source_file: resolve_source_file(artifact, &state.project_path_buf),
    }
}

// ── Artifacts ───────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub(crate) struct ArtifactsParams {
    #[serde(rename = "type")]
    artifact_type: Option<String>,
    status: Option<String>,
    origin: Option<String>,
    q: Option<String>,
    /// S-expression filter, e.g. `(and (= type "requirement") (has-tag "stpa"))`
    filter: Option<String>,
    #[serde(default = "default_limit")]
    limit: u32,
    #[serde(default)]
    offset: u32,
}

fn default_limit() -> u32 {
    100
}

#[derive(Serialize)]
struct ArtifactsResponse {
    total: usize,
    artifacts: Vec<ApiArtifact>,
}

pub(crate) async fn artifacts(
    State(state): State<SharedState>,
    Query(params): Query<ArtifactsParams>,
) -> impl IntoResponse {
    let guard = state.read().await;
    let limit = params.limit.min(1000) as usize;
    let offset = params.offset as usize;

    // Parse s-expression filter once before iterating.
    let sexpr_filter = params.filter.as_deref().and_then(|f| {
        rivet_core::sexpr_eval::parse_filter(f).ok()
    });

    let include_externals = params
        .origin
        .as_deref()
        .is_some_and(|o| o == "all" || o.starts_with("external:"));

    let mut results: Vec<ApiArtifact> = Vec::new();

    // Local artifacts (default scope)
    let include_local = params
        .origin
        .as_deref()
        .is_none_or(|o| o == "all" || o == "local");
    if include_local {
        for artifact in guard.store.iter() {
            if !matches_filters(artifact, &params) {
                continue;
            }
            if let Some(ref expr) = sexpr_filter {
                if !rivet_core::sexpr_eval::matches_filter(expr, artifact, &guard.graph) {
                    continue;
                }
            }
            results.push(to_api_artifact(artifact, "local", &guard));
        }
    }

    // External artifacts (only when explicitly requested)
    if include_externals {
        for ext in &guard.externals {
            let ext_origin = format!("external:{}", ext.prefix);
            let origin_matches = params
                .origin
                .as_deref()
                .is_some_and(|o| o == "all" || o == ext_origin);
            if origin_matches {
                for artifact in ext.store.iter() {
                    if matches_filters(artifact, &params) {
                        results.push(ApiArtifact {
                            id: artifact.id.clone(),
                            title: artifact.title.clone(),
                            r#type: artifact.artifact_type.clone(),
                            status: artifact.status.clone(),
                            origin: ext_origin.clone(),
                            links_out: 0,
                            links_in: 0,
                            source_file: resolve_source_file(artifact, &guard.project_path_buf),
                        });
                    }
                }
            }
        }
    }

    let total = results.len();
    let page: Vec<ApiArtifact> = results.into_iter().skip(offset).take(limit).collect();

    Json(ArtifactsResponse {
        total,
        artifacts: page,
    })
}

// ── Diagnostics ─────────────────────────────────────────────────────────

#[derive(Deserialize)]
pub(crate) struct DiagnosticsParams {
    severity: Option<String>,
    rule: Option<String>,
    artifact_id: Option<String>,
    origin: Option<String>,
    #[serde(default = "default_limit")]
    limit: u32,
    #[serde(default)]
    offset: u32,
}

#[derive(Serialize)]
struct ApiDiagnostic {
    artifact_id: Option<String>,
    severity: String,
    rule: String,
    message: String,
    origin: String,
    source_file: Option<String>,
}

#[derive(Serialize)]
struct DiagnosticsResponse {
    total: usize,
    diagnostics: Vec<ApiDiagnostic>,
}

pub(crate) async fn diagnostics(
    State(state): State<SharedState>,
    Query(params): Query<DiagnosticsParams>,
) -> impl IntoResponse {
    let guard = state.read().await;
    let limit = params.limit.min(1000) as usize;
    let offset = params.offset as usize;

    let mut results: Vec<ApiDiagnostic> = Vec::new();

    for diag in &guard.cached_diagnostics {
        let severity_str = match diag.severity {
            Severity::Error => "error",
            Severity::Warning => "warning",
            Severity::Info => "info",
        };

        if let Some(ref s) = params.severity {
            if severity_str != s.as_str() {
                continue;
            }
        }
        if let Some(ref r) = params.rule {
            if diag.rule != *r {
                continue;
            }
        }
        if let Some(ref id) = params.artifact_id {
            if diag.artifact_id.as_deref() != Some(id.as_str()) {
                continue;
            }
        }

        // Derive origin and source_file from artifact lookup
        let (origin, source_file) = if let Some(ref art_id) = diag.artifact_id {
            let origin = resolve_origin(art_id, &guard);
            let sf = guard
                .store
                .get(art_id)
                .or_else(|| guard.externals.iter().find_map(|ext| ext.store.get(art_id)))
                .and_then(|a| resolve_source_file(a, &guard.project_path_buf));
            (origin, sf)
        } else {
            ("local".to_string(), None)
        };

        if let Some(ref o) = params.origin {
            if origin != *o && o != "all" {
                continue;
            }
        }

        results.push(ApiDiagnostic {
            artifact_id: diag.artifact_id.clone(),
            severity: severity_str.to_string(),
            rule: diag.rule.clone(),
            message: diag.message.clone(),
            origin,
            source_file,
        });
    }

    let total = results.len();
    let page: Vec<ApiDiagnostic> = results.into_iter().skip(offset).take(limit).collect();

    Json(DiagnosticsResponse {
        total,
        diagnostics: page,
    })
}

fn resolve_origin(id: &str, state: &super::AppState) -> String {
    if state.store.contains(id) {
        return "local".to_string();
    }
    for ext in &state.externals {
        if ext.store.contains(id) {
            return format!("external:{}", ext.prefix);
        }
    }
    "local".to_string()
}

// ── Coverage ────────────────────────────────────────────────────────────

#[derive(Serialize)]
struct ApiCoverageRule {
    rule: String,
    description: String,
    source_type: String,
    link_type: String,
    direction: String,
    target_types: Vec<String>,
    covered: usize,
    total: usize,
    percentage: f64,
    uncovered: Vec<String>,
}

#[derive(Serialize)]
struct CoverageResponse {
    rules: Vec<ApiCoverageRule>,
}

pub(crate) async fn coverage(State(state): State<SharedState>) -> impl IntoResponse {
    let guard = state.read().await;
    let report = compute_coverage(&guard.store, &guard.schema, &guard.graph);

    let rules: Vec<ApiCoverageRule> = report
        .entries
        .iter()
        .map(|e| ApiCoverageRule {
            rule: e.rule_name.clone(),
            description: e.description.clone(),
            source_type: e.source_type.clone(),
            link_type: e.link_type.clone(),
            direction: match e.direction {
                rivet_core::coverage::CoverageDirection::Forward => "forward".to_string(),
                rivet_core::coverage::CoverageDirection::Backward => "backward".to_string(),
            },
            target_types: e.target_types.clone(),
            covered: e.covered,
            total: e.total,
            percentage: e.percentage(),
            uncovered: e.uncovered_ids.clone(),
        })
        .collect();

    Json(CoverageResponse { rules })
}

fn matches_filters(artifact: &rivet_core::model::Artifact, params: &ArtifactsParams) -> bool {
    if let Some(ref t) = params.artifact_type {
        if artifact.artifact_type != *t {
            return false;
        }
    }
    if let Some(ref s) = params.status {
        let actual = artifact.status.as_deref().unwrap_or("unset");
        if actual != s.as_str() {
            return false;
        }
    }
    if let Some(ref q) = params.q {
        let q_lower = q.to_lowercase();
        if !artifact.title.to_lowercase().contains(&q_lower) {
            return false;
        }
    }
    true
}
