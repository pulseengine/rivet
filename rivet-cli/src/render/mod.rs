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
pub(crate) mod coverage;
pub(crate) mod diff;
pub(crate) mod doc_linkage;
pub(crate) mod documents;
pub(crate) mod externals;
pub(crate) mod graph;
pub(crate) mod help;
pub(crate) mod helpers;
pub(crate) mod matrix;
pub(crate) mod results;
pub(crate) mod search;
pub(crate) mod source;
pub(crate) mod stats;
pub(crate) mod stpa;
pub(crate) mod styles;
pub(crate) mod traceability;
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

pub(crate) fn render_page(
    ctx: &RenderContext,
    page: &str,
    params: &crate::serve::components::ViewParams,
) -> RenderResult {
    // Strip query string if present (e.g., /artifacts?q=foo → /artifacts)
    let (path, _query) = page.split_once('?').unwrap_or((page, ""));

    match path {
        "/" | "/stats" => RenderResult {
            html: stats::render_stats(ctx),
            title: "Stats".to_string(),
            source_file: None,
            source_line: None,
        },
        "/artifacts" => RenderResult {
            html: artifacts::render_artifacts_list(ctx, params),
            title: "Artifacts".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/artifacts/") => {
            let rest = &p["/artifacts/".len()..];
            // Extract artifact ID (stop at next slash for sub-routes like /graph, /preview)
            let (id, sub) = rest.split_once('/').unwrap_or((rest, ""));
            match sub {
                "" => artifacts::render_artifact_detail(ctx, id),
                // Sub-routes like /artifacts/{id}/graph are not yet available
                _ => artifacts::render_artifact_detail(ctx, id),
            }
        }
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
        "/documents" => RenderResult {
            html: documents::render_documents_list(ctx),
            title: "Documents".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/documents/") => {
            let id = &p["/documents/".len()..];
            documents::render_document_detail(ctx, id)
        }
        "/help" => RenderResult {
            html: help::render_help(ctx),
            title: "Help".to_string(),
            source_file: None,
            source_line: None,
        },
        "/help/schema" => RenderResult {
            html: help::render_schema_list(ctx),
            title: "Schema Types".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/help/schema/") => {
            let name = &p["/help/schema/".len()..];
            help::render_schema_show(ctx, name)
        }
        "/help/links" => RenderResult {
            html: help::render_links(ctx),
            title: "Link Types".to_string(),
            source_file: None,
            source_line: None,
        },
        "/help/rules" => RenderResult {
            html: help::render_rules(ctx),
            title: "Traceability Rules".to_string(),
            source_file: None,
            source_line: None,
        },
        "/help/docs" => RenderResult {
            html: help::render_docs_list(),
            title: "Documentation".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/help/docs/") => {
            let slug = &p["/help/docs/".len()..];
            help::render_docs_topic(slug)
        }
        "/graph" => {
            let params = graph::GraphParams {
                types: None,
                link_types: None,
                depth: 0,
                focus: None,
            };
            RenderResult {
                html: graph::render_graph_view(ctx, &params),
                title: "Graph".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        p if p.starts_with("/graph") => {
            let params = graph::GraphParams {
                types: None,
                link_types: None,
                depth: 0,
                focus: None,
            };
            RenderResult {
                html: graph::render_graph_view(ctx, &params),
                title: "Graph".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        "/matrix" => {
            let params = matrix::MatrixParams {
                from: None,
                to: None,
                link: None,
                direction: None,
            };
            RenderResult {
                html: matrix::render_matrix_view(ctx, &params),
                title: "Matrix".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        "/coverage" => RenderResult {
            html: coverage::render_coverage_view(ctx),
            title: "Coverage".to_string(),
            source_file: None,
            source_line: None,
        },
        "/search" => RenderResult {
            html: search::render_search_view(ctx, None),
            title: "Search".to_string(),
            source_file: None,
            source_line: None,
        },
        "/verification" => RenderResult {
            html: results::render_verification_view(ctx),
            title: "Verification".to_string(),
            source_file: None,
            source_line: None,
        },
        "/results" => RenderResult {
            html: results::render_results_view(ctx),
            title: "Results".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/results/") => {
            let run_id = &p["/results/".len()..];
            RenderResult {
                html: results::render_result_detail(ctx, run_id),
                title: "Result".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        "/source" => RenderResult {
            html: source::render_source_tree_view(ctx),
            title: "Source".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/source/") => {
            let file_path = &p["/source/".len()..];
            RenderResult {
                html: source::render_source_file_view(ctx, file_path),
                title: "Source".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        "/diff" => {
            let params = diff::DiffParams {
                base: None,
                head: None,
            };
            RenderResult {
                html: diff::render_diff_view(ctx, &params),
                title: "Diff".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        "/traceability" => {
            let params = traceability::TraceParams {
                root_type: None,
                status: None,
                search: None,
            };
            RenderResult {
                html: traceability::render_traceability_view(ctx, &params),
                title: "Traceability".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        "/externals" => RenderResult {
            html: externals::render_externals_list(ctx),
            title: "Externals".to_string(),
            source_file: None,
            source_line: None,
        },
        p if p.starts_with("/externals/") => {
            let prefix = &p["/externals/".len()..];
            RenderResult {
                html: externals::render_external_detail(ctx, prefix),
                title: "External".to_string(),
                source_file: None,
                source_line: None,
            }
        }
        "/doc-linkage" => RenderResult {
            html: doc_linkage::render_doc_linkage_view(ctx),
            title: "Document Linkage".to_string(),
            source_file: None,
            source_line: None,
        },
        _ => RenderResult {
            html: format!(
                "<div class=\"card\" style=\"margin:2rem\"><h2>Not Available</h2>\
                 <p>The <code>{}</code> view is not yet available in VS Code.</p>\
                 <p style=\"color:var(--text-muted);margin-top:.5rem\">Use <code>rivet serve</code> to view it in your browser.</p></div>",
                rivet_core::document::html_escape(path)
            ),
            title: "Not Available".to_string(),
            source_file: None,
            source_line: None,
        },
    }
}
