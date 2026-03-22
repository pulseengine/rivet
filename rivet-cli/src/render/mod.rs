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
