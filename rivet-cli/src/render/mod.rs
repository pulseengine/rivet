use std::path::Path;

use rivet_core::document::DocumentStore;
use rivet_core::links::LinkGraph;
use rivet_core::results::ResultStore;
use rivet_core::schema::Schema;
use rivet_core::store::Store;
use rivet_core::validate::Diagnostic;

use crate::serve::{ExternalInfo, RepoContext};

pub(crate) mod artifacts;
pub(crate) mod components;
pub(crate) mod helpers;
pub(crate) mod stats;
pub(crate) mod stpa;
pub(crate) mod styles;
pub(crate) mod validate;

/// Shared context for all render functions.
#[allow(dead_code)]
pub(crate) struct RenderContext<'a> {
    pub(crate) store: &'a Store,
    pub(crate) schema: &'a Schema,
    pub(crate) graph: &'a LinkGraph,
    pub(crate) doc_store: &'a DocumentStore,
    pub(crate) result_store: &'a ResultStore,
    pub(crate) diagnostics: &'a [Diagnostic],
    pub(crate) context: &'a RepoContext,
    pub(crate) externals: &'a [ExternalInfo],
    pub(crate) project_path: &'a Path,
    pub(crate) schemas_dir: &'a Path,
}

#[allow(dead_code)]
pub(crate) struct RenderResult {
    pub(crate) html: String,
    pub(crate) title: String,
    pub(crate) source_file: Option<String>,
    pub(crate) source_line: Option<u32>,
}

pub(crate) fn render_page(ctx: &RenderContext, page: &str, params: &crate::serve::components::ViewParams) -> RenderResult {
    match page {
        "/" | "/stats" => RenderResult {
            html: stats::render_stats(ctx),
            title: "Stats".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/artifacts/") => {
            let id = &p["/artifacts/".len()..];
            artifacts::render_artifact_detail(ctx, id)
        }
        "/artifacts" => RenderResult {
            html: artifacts::render_artifacts_list(ctx, params),
            title: "Artifacts".to_string(),
            source_file: None,
            source_line: None,
        },
        "/validate" => RenderResult {
            html: validate::render_validate(ctx, params),
            title: "Validation".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/stpa") => RenderResult {
            html: stpa::render_stpa(ctx, params),
            title: "STPA".to_string(),
            source_file: None,
            source_line: None,
        },
        _ => RenderResult {
            html: format!(
                "<div class=\"error\"><h2>Not Found</h2><p>Page <code>{}</code> is not available.</p></div>",
                rivet_core::document::html_escape(page)
            ),
            title: "Not Found".to_string(),
            source_file: None,
            source_line: None,
        },
    }
}
