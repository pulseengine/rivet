// ── View handlers ────────────────────────────────────────────────────────
//
// All route handler functions and their associated param structs.

use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::response::{Html, IntoResponse, Response};

use super::components::ViewParams;
use super::layout;
use super::{AppState, SharedState, VariantScope};

/// Small helper that returns a 400 page when the variant name is
/// invalid. Preserves HTMX semantics by returning HTML the target can
/// swap in.
fn variant_error_response(msg: &str) -> Response {
    let body = format!(
        "<div class=\"card\" style=\"margin:2rem\">\
         <h2 style=\"margin-top:0;color:#b91c1c\">Invalid variant scope</h2>\
         <p>{}</p>\
         <p><a href=\"/variants\" hx-get=\"/variants\" hx-target=\"#content\" \
         hx-push-url=\"true\">See all declared variants</a> \
         or <a href=\"?\">clear the filter</a>.</p>\
         </div>",
        rivet_core::document::html_escape(msg),
    );
    (StatusCode::BAD_REQUEST, Html(body)).into_response()
}

/// Try to build a variant scope from the request param.
///
/// Returns:
/// * `Ok(None)` — no `variant` param, render unscoped.
/// * `Ok(Some(scope))` — scope built, render against its store/graph.
/// * `Err(resp)` — render the error response directly.
#[allow(clippy::result_large_err)]
fn try_build_scope(
    state: &AppState,
    variant: &Option<String>,
) -> Result<Option<VariantScope>, Response> {
    let name = match variant.as_deref() {
        Some(n) if !n.is_empty() => n,
        _ => return Ok(None),
    };
    match state.build_variant_scope(name) {
        Ok(Some(scope)) => Ok(Some(scope)),
        // Project has no feature model — silently ignore rather than error,
        // so bookmarked URLs degrade gracefully. The layout banner will
        // flag that the filter is ignored.
        Ok(None) => Ok(None),
        Err(msg) => Err(variant_error_response(&msg)),
    }
}

// ── Routes ───────────────────────────────────────────────────────────────

pub(crate) async fn index(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Response {
    let state = state.read().await;
    let scope = match try_build_scope(&state, &params.variant) {
        Ok(s) => s,
        Err(resp) => return resp,
    };
    let inner = match scope.as_ref() {
        Some(s) => crate::render::stats::render_stats(&s.render_context(&state)),
        None => crate::render::stats::render_stats(&state.as_render_context()),
    };
    layout::page_layout_with_variant(&inner, &state, params.variant.as_deref()).into_response()
}

pub(crate) async fn stats_view(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Response {
    let state = state.read().await;
    let scope = match try_build_scope(&state, &params.variant) {
        Ok(s) => s,
        Err(resp) => return resp,
    };
    let html = match scope.as_ref() {
        Some(s) => crate::render::stats::render_stats(&s.render_context(&state)),
        None => crate::render::stats::render_stats(&state.as_render_context()),
    };
    Html(html).into_response()
}

// ── Externals ────────────────────────────────────────────────────────────

/// GET /externals — list all configured external projects.
pub(crate) async fn externals_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::externals::render_externals_list(&ctx))
}

/// GET /externals/{prefix} — show artifacts from a specific external project.
pub(crate) async fn external_detail(
    State(state): State<SharedState>,
    Path(prefix): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::externals::render_external_detail(
        &ctx, &prefix,
    ))
}

// ── Artifacts ────────────────────────────────────────────────────────────

pub(crate) async fn artifacts_list(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Response {
    let state = state.read().await;
    let scope = match try_build_scope(&state, &params.variant) {
        Ok(s) => s,
        Err(resp) => return resp,
    };
    let html = match scope.as_ref() {
        Some(s) => {
            let ctx = s.render_context(&state);
            crate::render::artifacts::render_artifacts_list(&ctx, &params)
        }
        None => {
            let ctx = state.as_render_context();
            crate::render::artifacts::render_artifacts_list(&ctx, &params)
        }
    };
    Html(html).into_response()
}

/// Compact preview tooltip for an artifact — loaded on hover.
pub(crate) async fn artifact_preview(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::artifacts::render_artifact_preview(&ctx, &id))
}

pub(crate) async fn artifact_detail(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::artifacts::render_artifact_detail(&ctx, &id).html)
}

// ── Graph visualization ──────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct GraphParams {
    types: Option<String>,
    link_types: Option<String>,
    #[serde(default = "default_depth")]
    depth: usize,
    focus: Option<String>,
    /// Optional override of the node render budget. Capped in the renderer.
    limit: Option<usize>,
}

fn default_depth() -> usize {
    0
}

/// Build a filtered subgraph based on query params and return SVG.
pub(crate) async fn graph_view(
    State(state): State<SharedState>,
    Query(params): Query<GraphParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let rparams = crate::render::graph::GraphParams {
        types: params.types,
        link_types: params.link_types,
        depth: params.depth,
        focus: params.focus,
        limit: params.limit,
    };
    Html(crate::render::graph::render_graph_view(&ctx, &rparams))
}

// ── Ego graph for a single artifact ──────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct EgoParams {
    #[serde(default = "default_ego_hops")]
    hops: usize,
}

fn default_ego_hops() -> usize {
    2
}

pub(crate) async fn artifact_graph(
    State(state): State<SharedState>,
    Path(id): Path<String>,
    Query(params): Query<EgoParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let rparams = crate::render::graph::EgoParams { hops: params.hops };
    Html(crate::render::graph::render_artifact_graph(
        &ctx, &id, &rparams,
    ))
}

// ── Validation ───────────────────────────────────────────────────────────

pub(crate) async fn validate_view(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Response {
    let state = state.read().await;
    let scope = match try_build_scope(&state, &params.variant) {
        Ok(s) => s,
        Err(resp) => return resp,
    };
    let html = match scope.as_ref() {
        Some(s) => crate::render::validate::render_validate(&s.render_context(&state), &params),
        None => crate::render::validate::render_validate(&state.as_render_context(), &params),
    };
    Html(html).into_response()
}

// ── Traceability Matrix ──────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct MatrixParams {
    from: Option<String>,
    to: Option<String>,
    link: Option<String>,
    direction: Option<String>,
    variant: Option<String>,
}

pub(crate) async fn matrix_view(
    State(state): State<SharedState>,
    Query(params): Query<MatrixParams>,
) -> Response {
    let state = state.read().await;
    let scope = match try_build_scope(&state, &params.variant) {
        Ok(s) => s,
        Err(resp) => return resp,
    };
    let rparams = crate::render::matrix::MatrixParams {
        from: params.from,
        to: params.to,
        link: params.link,
        direction: params.direction,
    };
    let html = match scope.as_ref() {
        Some(s) => crate::render::matrix::render_matrix_view(&s.render_context(&state), &rparams),
        None => crate::render::matrix::render_matrix_view(&state.as_render_context(), &rparams),
    };
    Html(html).into_response()
}

// ── Matrix cell drill-down ────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct MatrixCellParams {
    source_type: String,
    target_type: String,
    link_type: String,
    direction: Option<String>,
}

/// GET /matrix/cell — return a list of links for a source_type -> target_type pair.
pub(crate) async fn matrix_cell_detail(
    State(state): State<SharedState>,
    Query(params): Query<MatrixCellParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let rparams = crate::render::matrix::MatrixCellParams {
        source_type: params.source_type,
        target_type: params.target_type,
        link_type: params.link_type,
        direction: params.direction,
    };
    Html(crate::render::matrix::render_matrix_cell_detail(
        &ctx, &rparams,
    ))
}

// ── Coverage ─────────────────────────────────────────────────────────────

pub(crate) async fn coverage_view(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Response {
    let state = state.read().await;
    let scope = match try_build_scope(&state, &params.variant) {
        Ok(s) => s,
        Err(resp) => return resp,
    };
    let html = match scope.as_ref() {
        Some(s) => crate::render::coverage::render_coverage_view(&s.render_context(&state)),
        None => crate::render::coverage::render_coverage_view(&state.as_render_context()),
    };
    Html(html).into_response()
}

// ── Documents ────────────────────────────────────────────────────────────

pub(crate) async fn documents_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::documents::render_documents_list(&ctx))
}

pub(crate) async fn document_detail(
    State(state): State<SharedState>,
    Path(id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let result = crate::render::documents::render_document_detail(&ctx, &id);
    Html(result.html)
}

// ── Search ───────────────────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct SearchParams {
    q: Option<String>,
}

pub(crate) async fn search_view(
    State(state): State<SharedState>,
    Query(params): Query<SearchParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::search::render_search_view(
        &ctx,
        params.q.as_deref(),
    ))
}

// ── Verification ─────────────────────────────────────────────────────────

pub(crate) async fn verification_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::results::render_verification_view(&ctx))
}

// ── STPA ─────────────────────────────────────────────────────────────────

pub(crate) async fn stpa_view(
    State(state): State<SharedState>,
    Query(params): Query<ViewParams>,
) -> Response {
    let state = state.read().await;
    let scope = match try_build_scope(&state, &params.variant) {
        Ok(s) => s,
        Err(resp) => return resp,
    };
    let html = match scope.as_ref() {
        Some(s) => crate::render::stpa::render_stpa(&s.render_context(&state), &params),
        None => crate::render::stpa::render_stpa(&state.as_render_context(), &params),
    };
    Html(html).into_response()
}

// ── EU AI Act ────────────────────────────────────────────────────────────

/// GET /eu-ai-act — EU AI Act Annex IV compliance dashboard.
pub(crate) async fn eu_ai_act_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::eu_ai_act::render_eu_ai_act(&ctx))
}

// ── Results ──────────────────────────────────────────────────────────────

pub(crate) async fn results_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::results::render_results_view(&ctx))
}

pub(crate) async fn result_detail(
    State(state): State<SharedState>,
    Path(run_id): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::results::render_result_detail(&ctx, &run_id))
}

// ── Source viewer ──────────────────────────────────────────────────────────────

pub(crate) async fn source_tree_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::source::render_source_tree_view(&ctx))
}

pub(crate) async fn source_file_view(
    State(state): State<SharedState>,
    Path(raw_path): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::source::render_source_file_view(
        &ctx, &raw_path,
    ))
}

// ── Diff ─────────────────────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct DiffParams {
    base: Option<String>,
    head: Option<String>,
}

pub(crate) async fn diff_view(
    State(state): State<SharedState>,
    Query(params): Query<DiffParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let rparams = crate::render::diff::DiffParams {
        base: params.base,
        head: params.head,
    };
    Html(crate::render::diff::render_diff_view(&ctx, &rparams))
}

// ── Document linkage view ────────────────────────────────────────────────

pub(crate) async fn doc_linkage_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::doc_linkage::render_doc_linkage_view(&ctx))
}

// ── Traceability explorer ────────────────────────────────────────────────

#[derive(Debug, serde::Deserialize)]
pub(crate) struct TraceParams {
    root_type: Option<String>,
    status: Option<String>,
    search: Option<String>,
}

#[derive(Debug, serde::Deserialize)]
pub(crate) struct TraceHistoryParams {
    file: Option<String>,
}

pub(crate) async fn traceability_view(
    State(state): State<SharedState>,
    Query(params): Query<TraceParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let rparams = crate::render::traceability::TraceParams {
        root_type: params.root_type,
        status: params.status,
        search: params.search,
    };
    Html(crate::render::traceability::render_traceability_view(
        &ctx, &rparams,
    ))
}

pub(crate) async fn traceability_history(
    State(state): State<SharedState>,
    Query(params): Query<TraceHistoryParams>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let rparams = crate::render::traceability::TraceHistoryParams { file: params.file };
    Html(crate::render::traceability::render_traceability_history(
        &ctx, &rparams,
    ))
}

// ── Help / Docs / Schema dashboard views ───────────────────────────────

pub(crate) async fn help_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::help::render_help(&ctx))
}

pub(crate) async fn help_docs_list(State(_state): State<SharedState>) -> Html<String> {
    Html(crate::render::help::render_docs_list())
}

pub(crate) async fn help_docs_topic(
    State(_state): State<SharedState>,
    Path(slug): Path<String>,
) -> Html<String> {
    let result = crate::render::help::render_docs_topic(&slug);
    Html(result.html)
}

pub(crate) async fn help_schema_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::help::render_schema_list(&ctx))
}

pub(crate) async fn help_schema_show(
    State(state): State<SharedState>,
    Path(name): Path<String>,
) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    let result = crate::render::help::render_schema_show(&ctx, &name);
    Html(result.html)
}

pub(crate) async fn help_links_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::help::render_links(&ctx))
}

pub(crate) async fn help_rules_view(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    let ctx = state.as_render_context();
    Html(crate::render::help::render_rules(&ctx))
}

// ── Variants overview ─────────────────────────────────────────────────────

/// GET /variants — list every declared variant with validation status
/// and quick-picks into the scoped views.
pub(crate) async fn variants_list(State(state): State<SharedState>) -> Html<String> {
    let state = state.read().await;
    Html(layout::render_variants_overview(&state))
}
