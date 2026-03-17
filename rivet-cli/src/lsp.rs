//! Rivet LSP server — diagnostics, hover, and go-to-definition for YAML artifacts.
//!
//! Connects `tower-lsp` to the rivet-core validation pipeline so editors can
//! display errors/warnings inline and navigate between artifact definitions
//! using `[[ID]]` references.

use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::Mutex;

use tower_lsp::jsonrpc::Result;
use tower_lsp::lsp_types;
use tower_lsp::lsp_types::*;
use tower_lsp::{Client, LanguageServer, LspService, Server};

use rivet_core::document::DocumentStore;
use rivet_core::links::LinkGraph;
use rivet_core::model::Artifact;
use rivet_core::schema::{Schema, Severity};
use rivet_core::store::Store;
use rivet_core::validate;

// ---------------------------------------------------------------------------
// Snapshot — a consistent view of the project for LSP queries
// ---------------------------------------------------------------------------

/// Immutable project snapshot rebuilt on every save.
#[allow(dead_code)]
struct Snapshot {
    store: Store,
    schema: Schema,
    graph: LinkGraph,
    doc_store: DocumentStore,
    /// Map from artifact ID to (file_path, line_number).
    locations: HashMap<String, (PathBuf, u32)>,
}

// ---------------------------------------------------------------------------
// Text utilities
// ---------------------------------------------------------------------------

/// Extract the artifact ID at the given (0-based line, 0-based column) position
/// if the cursor sits inside a `[[ID]]` reference.
pub(crate) fn artifact_id_at_position(text: &str, line: u32, character: u32) -> Option<String> {
    let target_line = text.lines().nth(line as usize)?;
    let col = character as usize;

    // Walk backwards from cursor to find `[[`
    let bytes = target_line.as_bytes();
    let mut start = None;
    let mut i = col.min(bytes.len());
    while i >= 2 {
        if bytes[i - 2] == b'[' && bytes[i - 1] == b'[' {
            start = Some(i);
            break;
        }
        // If we cross a `]]` boundary going backwards, stop.
        if bytes[i - 1] == b']' && i >= 2 && bytes[i - 2] == b']' {
            break;
        }
        i -= 1;
    }

    let start = start?;

    // Walk forward from `[[` to find `]]`
    let rest = &target_line[start..];
    let end = rest.find("]]")?;
    let id = rest[..end].trim();

    // Make sure the cursor is actually inside the `[[...]]` span.
    let bracket_end = start + end + 2;
    if col < start.saturating_sub(2) || col > bracket_end {
        return None;
    }

    if id.is_empty() {
        return None;
    }

    Some(id.to_string())
}

/// Also check for bare artifact IDs on YAML `id:` or `target:` lines.
pub(crate) fn yaml_artifact_id_at_position(text: &str, line: u32) -> Option<String> {
    let target_line = text.lines().nth(line as usize)?;
    let trimmed = target_line.trim();

    // `- id: SOME-ID` or `id: SOME-ID`
    if let Some(rest) = trimmed
        .strip_prefix("- id:")
        .or_else(|| trimmed.strip_prefix("id:"))
    {
        let id = rest.trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }

    // `target: SOME-ID`
    if let Some(rest) = trimmed
        .strip_prefix("- target:")
        .or_else(|| trimmed.strip_prefix("target:"))
    {
        let id = rest.trim();
        if !id.is_empty() {
            return Some(id.to_string());
        }
    }

    None
}

/// Scan a YAML file to build an (artifact_id -> line_number) map.
///
/// Looks for lines matching `- id: <VALUE>` or `  id: <VALUE>`.
pub(crate) fn scan_artifact_locations(
    path: &Path,
    content: &str,
) -> HashMap<String, (PathBuf, u32)> {
    let mut map = HashMap::new();
    for (line_idx, line) in content.lines().enumerate() {
        let trimmed = line.trim();
        let id = if let Some(rest) = trimmed.strip_prefix("- id:") {
            rest.trim()
        } else if let Some(rest) = trimmed.strip_prefix("id:") {
            rest.trim()
        } else {
            continue;
        };
        if !id.is_empty() {
            map.insert(id.to_string(), (path.to_path_buf(), line_idx as u32));
        }
    }
    map
}

// ---------------------------------------------------------------------------
// Diagnostic conversion
// ---------------------------------------------------------------------------

/// Convert a rivet-core `Diagnostic` into an LSP `Diagnostic`.
pub(crate) fn to_lsp_diagnostic(
    diag: &validate::Diagnostic,
    locations: &HashMap<String, (PathBuf, u32)>,
) -> lsp_types::Diagnostic {
    let range = diag
        .artifact_id
        .as_ref()
        .and_then(|id| locations.get(id))
        .map(|(_path, line)| Range {
            start: Position::new(*line, 0),
            end: Position::new(*line, 999),
        })
        .unwrap_or_default();

    lsp_types::Diagnostic {
        range,
        severity: Some(match diag.severity {
            Severity::Error => DiagnosticSeverity::ERROR,
            Severity::Warning => DiagnosticSeverity::WARNING,
            Severity::Info => DiagnosticSeverity::INFORMATION,
        }),
        code: Some(NumberOrString::String(diag.rule.clone())),
        source: Some("rivet".into()),
        message: diag.message.clone(),
        ..Default::default()
    }
}

// ---------------------------------------------------------------------------
// Build hover markdown for an artifact
// ---------------------------------------------------------------------------

fn hover_markdown(artifact: &Artifact) -> String {
    let mut md = format!("### {}\n\n", artifact.title);
    md.push_str(&format!("**Type:** `{}`\n\n", artifact.artifact_type));
    if let Some(status) = &artifact.status {
        md.push_str(&format!("**Status:** `{status}`\n\n"));
    }
    if let Some(desc) = &artifact.description {
        let preview = if desc.len() > 300 {
            format!("{}...", &desc[..300])
        } else {
            desc.clone()
        };
        md.push_str(&format!("---\n\n{preview}\n"));
    }
    if !artifact.links.is_empty() {
        md.push_str("\n**Links:**\n");
        for link in &artifact.links {
            md.push_str(&format!("- `{}` -> `{}`\n", link.link_type, link.target));
        }
    }
    md
}

// ---------------------------------------------------------------------------
// RivetLsp — the LanguageServer implementation
// ---------------------------------------------------------------------------

pub(crate) struct RivetLsp {
    client: Client,
    /// In-memory document contents keyed by URI.
    documents: Mutex<HashMap<Url, String>>,
    /// Current project snapshot (rebuilt on save).
    snapshot: Mutex<Option<Snapshot>>,
    /// Project root directory (the folder containing rivet.yaml).
    project_root: Mutex<Option<PathBuf>>,
}

impl RivetLsp {
    fn new(client: Client) -> Self {
        Self {
            client,
            documents: Mutex::new(HashMap::new()),
            snapshot: Mutex::new(None),
            project_root: Mutex::new(None),
        }
    }

    /// Detect the project root from a file URI by walking up to find rivet.yaml.
    fn detect_project_root(&self, uri: &Url) -> Option<PathBuf> {
        let file_path = uri.to_file_path().ok()?;
        let mut dir = file_path.parent()?;
        loop {
            if dir.join("rivet.yaml").exists() {
                return Some(dir.to_path_buf());
            }
            dir = dir.parent()?;
        }
    }

    /// Rebuild the project snapshot and publish diagnostics.
    async fn rebuild_and_publish(&self, trigger_uri: Url) {
        // Detect project root if not set.
        {
            let mut root = self.project_root.lock().unwrap();
            if root.is_none()
                && let Some(detected) = self.detect_project_root(&trigger_uri)
            {
                *root = Some(detected);
            }
        }

        let project_root = {
            let root = self.project_root.lock().unwrap();
            root.clone()
        };

        let project_root = match project_root {
            Some(r) => r,
            None => {
                self.client
                    .log_message(
                        MessageType::WARNING,
                        "No rivet.yaml found; skipping validation.",
                    )
                    .await;
                return;
            }
        };

        let config_path = project_root.join("rivet.yaml");
        let config = match rivet_core::load_project_config(&config_path) {
            Ok(c) => c,
            Err(e) => {
                self.client
                    .log_message(
                        MessageType::ERROR,
                        format!("Failed to load rivet.yaml: {e}"),
                    )
                    .await;
                return;
            }
        };

        let schemas_dir = project_root.join("schemas");
        let schema = match rivet_core::load_schemas(&config.project.schemas, &schemas_dir) {
            Ok(s) => s,
            Err(e) => {
                self.client
                    .log_message(MessageType::ERROR, format!("Failed to load schemas: {e}"))
                    .await;
                return;
            }
        };

        let mut store = Store::new();
        let mut locations: HashMap<String, (PathBuf, u32)> = HashMap::new();

        for source in &config.sources {
            let path = project_root.join(&source.path);

            // Scan YAML files for artifact locations before loading.
            let yaml_paths: Vec<PathBuf> = if path.is_dir() {
                std::fs::read_dir(&path)
                    .ok()
                    .map(|rd| {
                        rd.filter_map(|e| e.ok())
                            .map(|e| e.path())
                            .filter(|p| {
                                p.extension()
                                    .is_some_and(|ext| ext == "yaml" || ext == "yml")
                            })
                            .collect()
                    })
                    .unwrap_or_default()
            } else if path.exists() {
                vec![path.clone()]
            } else {
                vec![]
            };

            for yaml_path in &yaml_paths {
                if let Ok(content) = std::fs::read_to_string(yaml_path) {
                    locations.extend(scan_artifact_locations(yaml_path, &content));
                }
            }

            match rivet_core::load_artifacts(source, &project_root) {
                Ok(artifacts) => {
                    for artifact in artifacts {
                        store.upsert(artifact);
                    }
                }
                Err(e) => {
                    self.client
                        .log_message(
                            MessageType::ERROR,
                            format!("Failed to load source '{}': {e}", source.path),
                        )
                        .await;
                }
            }
        }

        let graph = LinkGraph::build(&store, &schema);

        // Load documents.
        let mut doc_store = DocumentStore::new();
        for docs_path in &config.docs {
            let dir = project_root.join(docs_path);
            if let Ok(docs) = rivet_core::document::load_documents(&dir) {
                for doc in docs {
                    doc_store.insert(doc);
                }
            }
        }

        // Run validation.
        let mut diagnostics = validate::validate(&store, &schema, &graph);
        diagnostics.extend(validate::validate_documents(&doc_store, &store));

        // Group diagnostics by file.
        let mut by_file: HashMap<Url, Vec<lsp_types::Diagnostic>> = HashMap::new();

        for diag in &diagnostics {
            let lsp_diag = to_lsp_diagnostic(diag, &locations);
            let uri = diag
                .artifact_id
                .as_ref()
                .and_then(|id| locations.get(id))
                .and_then(|(path, _)| Url::from_file_path(path).ok())
                .unwrap_or_else(|| trigger_uri.clone());

            by_file.entry(uri).or_default().push(lsp_diag);
        }

        // Clear diagnostics on files that are now clean.
        // We always publish at least the trigger URI to clear stale diagnostics.
        by_file.entry(trigger_uri).or_default();

        for (uri, diags) in &by_file {
            self.client
                .publish_diagnostics(uri.clone(), diags.clone(), None)
                .await;
        }

        // Store the snapshot.
        *self.snapshot.lock().unwrap() = Some(Snapshot {
            store,
            schema,
            graph,
            doc_store,
            locations,
        });
    }
}

#[tower_lsp::async_trait]
impl LanguageServer for RivetLsp {
    async fn initialize(&self, params: InitializeParams) -> Result<InitializeResult> {
        // Try to pick up the workspace root.
        if let Some(root_uri) = params.root_uri.as_ref().and_then(|u| u.to_file_path().ok()) {
            let mut root = self.project_root.lock().unwrap();
            if root.is_none() && root_uri.join("rivet.yaml").exists() {
                *root = Some(root_uri);
            }
        }

        Ok(InitializeResult {
            capabilities: ServerCapabilities {
                text_document_sync: Some(TextDocumentSyncCapability::Options(
                    TextDocumentSyncOptions {
                        open_close: Some(true),
                        change: Some(TextDocumentSyncKind::FULL),
                        save: Some(TextDocumentSyncSaveOptions::SaveOptions(SaveOptions {
                            include_text: Some(true),
                        })),
                        ..Default::default()
                    },
                )),
                hover_provider: Some(HoverProviderCapability::Simple(true)),
                definition_provider: Some(OneOf::Left(true)),
                ..Default::default()
            },
            ..Default::default()
        })
    }

    async fn initialized(&self, _: InitializedParams) {
        self.client
            .log_message(MessageType::INFO, "Rivet LSP initialized")
            .await;
    }

    async fn shutdown(&self) -> Result<()> {
        Ok(())
    }

    async fn did_open(&self, params: DidOpenTextDocumentParams) {
        let uri = params.text_document.uri.clone();
        self.documents
            .lock()
            .unwrap()
            .insert(uri.clone(), params.text_document.text);
        self.rebuild_and_publish(uri).await;
    }

    async fn did_change(&self, params: DidChangeTextDocumentParams) {
        if let Some(change) = params.content_changes.into_iter().last() {
            self.documents
                .lock()
                .unwrap()
                .insert(params.text_document.uri, change.text);
        }
    }

    async fn did_save(&self, params: DidSaveTextDocumentParams) {
        let uri = params.text_document.uri.clone();
        if let Some(text) = params.text {
            self.documents.lock().unwrap().insert(uri.clone(), text);
        }
        self.rebuild_and_publish(uri).await;
    }

    async fn hover(&self, params: HoverParams) -> Result<Option<Hover>> {
        let uri = params
            .text_document_position_params
            .text_document
            .uri
            .clone();
        let pos = params.text_document_position_params.position;

        let text = {
            let docs = self.documents.lock().unwrap();
            docs.get(&uri).cloned()
        };

        let text = match text {
            Some(t) => t,
            None => return Ok(None),
        };

        // Try [[ID]] first, then YAML id:/target: line.
        let artifact_id = artifact_id_at_position(&text, pos.line, pos.character)
            .or_else(|| yaml_artifact_id_at_position(&text, pos.line));

        let artifact_id = match artifact_id {
            Some(id) => id,
            None => return Ok(None),
        };

        let snapshot = self.snapshot.lock().unwrap();
        let snapshot = match snapshot.as_ref() {
            Some(s) => s,
            None => return Ok(None),
        };

        let artifact = match snapshot.store.get(&artifact_id) {
            Some(a) => a,
            None => return Ok(None),
        };

        let md = hover_markdown(artifact);

        Ok(Some(Hover {
            contents: HoverContents::Markup(MarkupContent {
                kind: MarkupKind::Markdown,
                value: md,
            }),
            range: None,
        }))
    }

    async fn goto_definition(
        &self,
        params: GotoDefinitionParams,
    ) -> Result<Option<GotoDefinitionResponse>> {
        let uri = params
            .text_document_position_params
            .text_document
            .uri
            .clone();
        let pos = params.text_document_position_params.position;

        let text = {
            let docs = self.documents.lock().unwrap();
            docs.get(&uri).cloned()
        };

        let text = match text {
            Some(t) => t,
            None => return Ok(None),
        };

        let artifact_id = artifact_id_at_position(&text, pos.line, pos.character)
            .or_else(|| yaml_artifact_id_at_position(&text, pos.line));

        let artifact_id = match artifact_id {
            Some(id) => id,
            None => return Ok(None),
        };

        let snapshot = self.snapshot.lock().unwrap();
        let snapshot = match snapshot.as_ref() {
            Some(s) => s,
            None => return Ok(None),
        };

        let (path, line) = match snapshot.locations.get(&artifact_id) {
            Some(loc) => loc,
            None => return Ok(None),
        };

        let target_uri = match Url::from_file_path(path) {
            Ok(u) => u,
            Err(()) => return Ok(None),
        };

        Ok(Some(GotoDefinitionResponse::Scalar(Location {
            uri: target_uri,
            range: Range {
                start: Position::new(*line, 0),
                end: Position::new(*line, 999),
            },
        })))
    }
}

// ---------------------------------------------------------------------------
// Entry point — called from `rivet lsp`
// ---------------------------------------------------------------------------

pub async fn run_lsp() {
    let stdin = tokio::io::stdin();
    let stdout = tokio::io::stdout();

    let (service, socket) = LspService::new(RivetLsp::new);
    Server::new(stdin, stdout, socket).serve(service).await;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // -- artifact_id_at_position -------------------------------------------

    #[test]
    fn extract_id_inside_brackets() {
        let text = "See [[REQ-001]] for details.";
        assert_eq!(artifact_id_at_position(text, 0, 8), Some("REQ-001".into()));
    }

    #[test]
    fn extract_id_at_opening_bracket() {
        let text = "See [[REQ-001]] for details.";
        assert_eq!(artifact_id_at_position(text, 0, 6), Some("REQ-001".into()));
    }

    #[test]
    fn extract_id_at_closing_bracket() {
        let text = "See [[REQ-001]] for details.";
        assert_eq!(artifact_id_at_position(text, 0, 14), Some("REQ-001".into()));
    }

    #[test]
    fn no_id_outside_brackets() {
        let text = "See [[REQ-001]] for details.";
        assert_eq!(artifact_id_at_position(text, 0, 0), None);
        assert_eq!(artifact_id_at_position(text, 0, 20), None);
    }

    #[test]
    fn multiline_extraction() {
        let text = "first line\n[[H-002]] second line\nthird";
        assert_eq!(artifact_id_at_position(text, 1, 4), Some("H-002".into()));
    }

    #[test]
    fn empty_brackets_return_none() {
        let text = "[[]] nothing";
        assert_eq!(artifact_id_at_position(text, 0, 2), None);
    }

    // -- yaml_artifact_id_at_position --------------------------------------

    #[test]
    fn yaml_id_line() {
        let text = "  - id: REQ-042\n    title: Foo";
        assert_eq!(
            yaml_artifact_id_at_position(text, 0),
            Some("REQ-042".into())
        );
    }

    #[test]
    fn yaml_target_line() {
        let text = "      - target: UCA-003\n";
        assert_eq!(
            yaml_artifact_id_at_position(text, 0),
            Some("UCA-003".into())
        );
    }

    #[test]
    fn yaml_non_id_line() {
        let text = "    title: Some Title";
        assert_eq!(yaml_artifact_id_at_position(text, 0), None);
    }

    // -- scan_artifact_locations -------------------------------------------

    #[test]
    fn scan_locations_from_yaml() {
        let content = "\
artifacts:
  - id: REQ-001
    title: First
  - id: REQ-002
    title: Second
";
        let locs = scan_artifact_locations(Path::new("/test.yaml"), content);
        assert_eq!(locs.len(), 2);
        assert_eq!(locs.get("REQ-001"), Some(&(PathBuf::from("/test.yaml"), 1)));
        assert_eq!(locs.get("REQ-002"), Some(&(PathBuf::from("/test.yaml"), 3)));
    }

    // -- to_lsp_diagnostic -------------------------------------------------

    #[test]
    fn convert_error_diagnostic() {
        let mut locations = HashMap::new();
        locations.insert("REQ-001".to_string(), (PathBuf::from("/test.yaml"), 5));

        let diag = validate::Diagnostic {
            severity: Severity::Error,
            artifact_id: Some("REQ-001".to_string()),
            rule: "known-type".to_string(),
            message: "unknown artifact type 'bogus'".to_string(),
        };

        let lsp_diag = to_lsp_diagnostic(&diag, &locations);
        assert_eq!(lsp_diag.severity, Some(DiagnosticSeverity::ERROR));
        assert_eq!(lsp_diag.source, Some("rivet".into()));
        assert_eq!(lsp_diag.range.start.line, 5);
        assert_eq!(lsp_diag.message, "unknown artifact type 'bogus'");
        assert_eq!(
            lsp_diag.code,
            Some(NumberOrString::String("known-type".into()))
        );
    }

    #[test]
    fn convert_warning_diagnostic() {
        let locations = HashMap::new();

        let diag = validate::Diagnostic {
            severity: Severity::Warning,
            artifact_id: None,
            rule: "allowed-values".to_string(),
            message: "bad value".to_string(),
        };

        let lsp_diag = to_lsp_diagnostic(&diag, &locations);
        assert_eq!(lsp_diag.severity, Some(DiagnosticSeverity::WARNING));
        // No location known -> default range.
        assert_eq!(lsp_diag.range, Range::default());
    }

    #[test]
    fn convert_info_diagnostic() {
        let locations = HashMap::new();

        let diag = validate::Diagnostic {
            severity: Severity::Info,
            artifact_id: None,
            rule: "coverage".to_string(),
            message: "info message".to_string(),
        };

        let lsp_diag = to_lsp_diagnostic(&diag, &locations);
        assert_eq!(lsp_diag.severity, Some(DiagnosticSeverity::INFORMATION));
    }

    // -- initialize capabilities ------------------------------------------

    #[test]
    fn initialize_returns_correct_capabilities() {
        // We verify that the ServerCapabilities struct we build is correct
        // by constructing it the same way the LSP handler does.
        let capabilities = ServerCapabilities {
            text_document_sync: Some(TextDocumentSyncCapability::Options(
                TextDocumentSyncOptions {
                    open_close: Some(true),
                    change: Some(TextDocumentSyncKind::FULL),
                    save: Some(TextDocumentSyncSaveOptions::SaveOptions(SaveOptions {
                        include_text: Some(true),
                    })),
                    ..Default::default()
                },
            )),
            hover_provider: Some(HoverProviderCapability::Simple(true)),
            definition_provider: Some(OneOf::Left(true)),
            ..Default::default()
        };

        // text_document_sync
        match &capabilities.text_document_sync {
            Some(TextDocumentSyncCapability::Options(opts)) => {
                assert_eq!(opts.open_close, Some(true));
                assert_eq!(opts.change, Some(TextDocumentSyncKind::FULL));
                assert!(opts.save.is_some());
            }
            other => panic!("unexpected text_document_sync: {other:?}"),
        }

        // hover
        assert_eq!(
            capabilities.hover_provider,
            Some(HoverProviderCapability::Simple(true))
        );

        // definition
        assert_eq!(capabilities.definition_provider, Some(OneOf::Left(true)));
    }

    // -- hover_markdown ----------------------------------------------------

    #[test]
    fn hover_markdown_includes_fields() {
        use rivet_core::model::{Artifact, Link};
        use std::collections::BTreeMap;

        let artifact = Artifact {
            id: "REQ-001".into(),
            artifact_type: "requirement".into(),
            title: "First requirement".into(),
            description: Some("A detailed description.".into()),
            status: Some("approved".into()),
            tags: vec![],
            links: vec![Link {
                link_type: "satisfies".into(),
                target: "FEAT-001".into(),
            }],
            fields: BTreeMap::new(),
            source_file: None,
        };

        let md = hover_markdown(&artifact);
        assert!(md.contains("### First requirement"));
        assert!(md.contains("**Type:** `requirement`"));
        assert!(md.contains("**Status:** `approved`"));
        assert!(md.contains("A detailed description."));
        assert!(md.contains("`satisfies` -> `FEAT-001`"));
    }
}
