use std::collections::BTreeMap;
use std::path::PathBuf;

use crate::error::Error;
use crate::model::Artifact;

/// An adapter transforms between external representations and internal artifacts.
///
/// Adapters are the extension point for the trace tool.  Each adapter handles
/// a specific external format or protocol:
///
/// - `stpa-yaml`    — STPA analysis YAML files (meld's format)
/// - `generic-yaml` — Generic artifact YAML with explicit types
/// - `reqif`        — ReqIF 1.2 XML (future)
/// - `oslc`         — OSLC REST resources (future)
/// - `junit-xml`    — JUnit XML test results (future)
///
/// Adapters can be:
/// 1. Compiled-in Rust implementations (this trait)
/// 2. WebAssembly components loaded at runtime (via WIT interface in `wit/adapter.wit`)
///
/// The WASM adapter approach mirrors the component architecture pattern:
/// each adapter is an independently developed, pluggable unit with a
/// well-defined interface.  The adapter itself becomes an architectural
/// element describable within the system's own artifact model.
pub trait Adapter: Send + Sync {
    /// Unique identifier for this adapter (e.g., "stpa-yaml", "reqif").
    fn id(&self) -> &str;

    /// Human-readable name.
    fn name(&self) -> &str;

    /// Artifact types this adapter can produce or consume.
    fn supported_types(&self) -> &[String];

    /// Import artifacts from an external source.
    fn import(
        &self,
        source: &AdapterSource,
        config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error>;

    /// Export artifacts to an external format.
    fn export(&self, artifacts: &[Artifact], config: &AdapterConfig) -> Result<Vec<u8>, Error>;
}

/// Source data for an adapter import operation.
pub enum AdapterSource {
    /// Raw bytes (file contents, HTTP response body).
    Bytes(Vec<u8>),
    /// Single file to read.
    Path(PathBuf),
    /// Directory to scan for matching files.
    Directory(PathBuf),
}

/// Configuration passed to adapter operations.
#[derive(Debug, Clone, Default)]
pub struct AdapterConfig {
    pub entries: BTreeMap<String, String>,
}

impl AdapterConfig {
    pub fn get(&self, key: &str) -> Option<&str> {
        self.entries.get(key).map(|s| s.as_str())
    }
}
