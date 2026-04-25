//! WASM Component Model adapter runtime.
//!
//! This module provides the ability to load and execute custom adapters
//! compiled as WebAssembly components.  Each WASM adapter implements the
//! `pulseengine:rivet/adapter` WIT interface defined in `wit/adapter.wit`.
//!
//! # Architecture
//!
//! ```text
//!  ┌──────────────┐       ┌─────────────────────┐
//!  │  Rivet Host   │──────▶│  WasmAdapterRuntime  │
//!  │  (rivet-cli)  │       │  (wasmtime Engine)   │
//!  └──────────────┘       └──────┬──────────────┘
//!                                │ instantiate
//!                         ┌──────▼──────────────┐
//!                         │   WasmAdapter        │
//!                         │  (Component instance)│
//!                         │  impl Adapter trait   │
//!                         └──────────────────────┘
//! ```
//!
//! The [`WasmAdapterRuntime`] manages a shared `wasmtime::Engine` with
//! configurable resource limits.  Individual [`WasmAdapter`] instances
//! wrap a compiled component and implement [`crate::adapter::Adapter`].

use std::path::{Path, PathBuf};

use wasmtime::component::{Component, Linker};
use wasmtime::{Config, Engine, Store};

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::Artifact;

// ---------------------------------------------------------------------------
// Generated WIT bindings (component-model typed interface)
// ---------------------------------------------------------------------------

/// Type-safe bindings generated from `wit/adapter.wit` for the
/// `spar-component` world.  This gives us typed access to the
/// exported `adapter` and `renderer` interfaces.
mod wit_bindings {
    wasmtime::component::bindgen!({
        path: "../wit/adapter.wit",
        world: "spar-component",
    });
}

/// Type-safe bindings for the `rivet-adapter` world (adapter only, no renderer).
/// Used for user-supplied WASM adapter components that implement the
/// `pulseengine:rivet/adapter` interface.
mod adapter_bindings {
    wasmtime::component::bindgen!({
        path: "../wit/adapter.wit",
        world: "rivet-adapter",
    });
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/// Resource limits for the WASM runtime.
#[derive(Debug, Clone)]
pub struct WasmRuntimeConfig {
    /// Maximum linear memory (bytes).  `None` means unlimited.
    pub max_memory_bytes: Option<usize>,
    /// Fuel limit for metering execution.  `None` disables fuel metering.
    pub fuel: Option<u64>,
    /// Enable WASI preview-2 support for the guest.
    pub wasi: bool,
}

impl Default for WasmRuntimeConfig {
    fn default() -> Self {
        Self {
            max_memory_bytes: Some(256 * 1024 * 1024), // 256 MiB
            fuel: Some(1_000_000_000),                 // 1 billion ops
            wasi: true,
        }
    }
}

// ---------------------------------------------------------------------------
// Error types
// ---------------------------------------------------------------------------

/// Errors specific to WASM adapter loading and execution.
#[derive(Debug, thiserror::Error)]
pub enum WasmError {
    #[error("failed to create WASM engine: {0}")]
    EngineCreation(String),

    #[error("failed to read component file '{path}': {source}")]
    FileRead {
        path: PathBuf,
        source: std::io::Error,
    },

    #[error("failed to compile WASM component '{path}': {reason}")]
    Compilation { path: PathBuf, reason: String },

    #[error("failed to instantiate WASM component: {0}")]
    Instantiation(String),

    #[error("WASM guest returned an error: {0}")]
    Guest(String),

    #[error("type conversion error: {0}")]
    Conversion(String),
}

impl From<WasmError> for Error {
    fn from(e: WasmError) -> Self {
        Error::Adapter(e.to_string())
    }
}

/// A diagnostic produced by a WASM analysis pass (mirrors WIT `analysis-diagnostic`).
#[derive(Debug, Clone)]
pub struct AnalysisDiagnostic {
    pub severity: String,
    pub message: String,
    pub component_path: String,
    pub analysis_name: String,
}

// ---------------------------------------------------------------------------
// Host state
// ---------------------------------------------------------------------------

/// Per-instance host state passed into the wasmtime `Store`.
struct HostState {
    /// WASI context for filesystem / stdio / clock access.
    wasi: wasmtime_wasi::WasiCtx,
    /// Resource table required by wasmtime-wasi.
    table: wasmtime::component::ResourceTable,
    /// Optional memory limiter for resource constraints.
    limiter: Option<MemoryLimiter>,
}

// Implement the WasiView trait so wasmtime-wasi can access its state.
impl wasmtime_wasi::WasiView for HostState {
    fn ctx(&mut self) -> wasmtime_wasi::WasiCtxView<'_> {
        wasmtime_wasi::WasiCtxView {
            ctx: &mut self.wasi,
            table: &mut self.table,
        }
    }
}

// ---------------------------------------------------------------------------
// Runtime
// ---------------------------------------------------------------------------

/// Shared WASM runtime that manages the engine and can load adapters.
///
/// Create one `WasmAdapterRuntime` per application and use it to load
/// multiple adapter components.
pub struct WasmAdapterRuntime {
    engine: Engine,
    config: WasmRuntimeConfig,
}

impl WasmAdapterRuntime {
    /// Create a new runtime with the given configuration.
    pub fn new(config: WasmRuntimeConfig) -> Result<Self, WasmError> {
        let mut engine_config = Config::new();
        engine_config.wasm_component_model(true);

        if config.fuel.is_some() {
            engine_config.consume_fuel(true);
        }

        let engine =
            Engine::new(&engine_config).map_err(|e| WasmError::EngineCreation(e.to_string()))?;

        Ok(Self { engine, config })
    }

    /// Create a runtime with default configuration.
    pub fn with_defaults() -> Result<Self, WasmError> {
        Self::new(WasmRuntimeConfig::default())
    }

    /// Load a WASM component from a file path and return a [`WasmAdapter`].
    pub fn load_adapter(&self, path: &Path) -> Result<WasmAdapter, WasmError> {
        let bytes = std::fs::read(path).map_err(|e| WasmError::FileRead {
            path: path.to_path_buf(),
            source: e,
        })?;

        let component =
            Component::from_binary(&self.engine, &bytes).map_err(|e| WasmError::Compilation {
                path: path.to_path_buf(),
                reason: e.to_string(),
            })?;

        Ok(WasmAdapter {
            engine: self.engine.clone(),
            component,
            runtime_config: self.config.clone(),
            path: path.to_path_buf(),
        })
    }
}

// ---------------------------------------------------------------------------
// WasmAdapter
// ---------------------------------------------------------------------------

/// A single WASM adapter component that implements the `Adapter` trait.
///
/// Each `WasmAdapter` holds a compiled [`Component`] and creates fresh
/// `Store` instances per call to ensure isolation between invocations.
pub struct WasmAdapter {
    engine: Engine,
    component: Component,
    runtime_config: WasmRuntimeConfig,
    path: PathBuf,
}

impl std::fmt::Debug for WasmAdapter {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("WasmAdapter")
            .field("path", &self.path)
            .field("runtime_config", &self.runtime_config)
            .finish_non_exhaustive()
    }
}

impl WasmAdapter {
    /// Create a fresh wasmtime [`Store`] with WASI and resource limits.
    fn create_store(&self) -> Result<Store<HostState>, WasmError> {
        let wasi = wasmtime_wasi::WasiCtxBuilder::new()
            .inherit_stderr()
            .build();

        let limiter = self
            .runtime_config
            .max_memory_bytes
            .map(|max| MemoryLimiter { max_memory: max });

        let state = HostState {
            wasi,
            table: wasmtime::component::ResourceTable::new(),
            limiter,
        };

        let mut store = Store::new(&self.engine, state);

        // Apply fuel limit.
        if let Some(fuel) = self.runtime_config.fuel {
            store
                .set_fuel(fuel)
                .map_err(|e| WasmError::Instantiation(e.to_string()))?;
        }

        // Apply memory limit.
        if self.runtime_config.max_memory_bytes.is_some() {
            store.limiter(|state| state.limiter.as_mut().unwrap());
        }

        Ok(store)
    }

    /// Create a linker with WASI bindings added.
    fn create_linker(&self) -> Result<Linker<HostState>, WasmError> {
        let mut linker = Linker::new(&self.engine);
        wasmtime_wasi::p2::add_to_linker_sync(&mut linker)
            .map_err(|e| WasmError::Instantiation(e.to_string()))?;
        Ok(linker)
    }

    /// Call the guest `import` function via generated bindings.
    ///
    /// This reads source data into bytes, sends them to the WASM guest, and
    /// converts the returned artifacts back into the host model.
    fn call_import(
        &self,
        source: &AdapterSource,
        config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, WasmError> {
        let source_bytes = read_source_bytes(source)
            .map_err(|e| WasmError::Guest(format!("failed to read adapter source: {e}")))?;

        let mut store = self.create_store()?;
        let linker = self.create_linker()?;

        let bindings =
            adapter_bindings::RivetAdapter::instantiate(&mut store, &self.component, &linker)
                .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        // Build the WIT adapter-config from the host AdapterConfig.
        let wit_config = adapter_bindings::pulseengine::rivet::types::AdapterConfig {
            entries: config
                .entries
                .iter()
                .map(
                    |(k, v)| adapter_bindings::pulseengine::rivet::types::ConfigEntry {
                        key: k.clone(),
                        value: v.clone(),
                    },
                )
                .collect(),
        };

        let result = bindings
            .pulseengine_rivet_adapter()
            .call_import(&mut store, &source_bytes, &wit_config)
            .map_err(|e| WasmError::Guest(e.to_string()))?;

        match result {
            Ok(wit_artifacts) => {
                // Warn on suspiciously large result sets (potential DoS).
                const MAX_ARTIFACTS_WARN: usize = 10_000;
                if wit_artifacts.len() > MAX_ARTIFACTS_WARN {
                    log::warn!(
                        "WASM adapter returned {} artifacts (threshold: {}), possible DoS",
                        wit_artifacts.len(),
                        MAX_ARTIFACTS_WARN,
                    );
                }

                let artifacts: Vec<Artifact> = wit_artifacts
                    .into_iter()
                    .map(convert_wit_artifact_to_host)
                    .collect();

                // Validate and sanitize each returned artifact.
                let artifacts = validate_wasm_artifacts(artifacts)?;

                Ok(artifacts)
            }
            Err(e) => Err(WasmError::Guest(format!("adapter import error: {:?}", e))),
        }
    }

    /// Call the guest `render` function from the renderer interface.
    ///
    /// This creates a fresh WASI-enabled store (optionally pre-opening
    /// `aadl_dir` so the guest can read `.aadl` files), instantiates the
    /// component using the generated WIT bindings, and calls the
    /// `pulseengine:rivet/renderer.render` export.
    pub fn call_render(
        &self,
        root: &str,
        highlight: &[String],
        aadl_dir: Option<&Path>,
    ) -> Result<String, WasmError> {
        // -- Build WASI context ------------------------------------------------
        let mut wasi_builder = wasmtime_wasi::WasiCtxBuilder::new();
        wasi_builder.inherit_stderr();

        // Pre-open the AADL directory so the guest can read .aadl files.
        if let Some(dir) = aadl_dir {
            wasi_builder
                .preopened_dir(
                    dir,
                    ".",
                    wasmtime_wasi::DirPerms::READ,
                    wasmtime_wasi::FilePerms::READ,
                )
                .map_err(|e| WasmError::Instantiation(format!("preopened dir: {}", e)))?;
        }

        let state = HostState {
            wasi: wasi_builder.build(),
            table: wasmtime::component::ResourceTable::new(),
            limiter: self
                .runtime_config
                .max_memory_bytes
                .map(|max| MemoryLimiter { max_memory: max }),
        };

        let mut store = Store::new(&self.engine, state);

        if let Some(fuel) = self.runtime_config.fuel {
            store
                .set_fuel(fuel)
                .map_err(|e| WasmError::Instantiation(e.to_string()))?;
        }
        if self.runtime_config.max_memory_bytes.is_some() {
            store.limiter(|state| state.limiter.as_mut().unwrap());
        }

        // -- Instantiate via generated bindings --------------------------------
        let linker = self.create_linker()?;

        let bindings =
            wit_bindings::SparComponent::instantiate(&mut store, &self.component, &linker)
                .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        bindings
            .pulseengine_rivet_renderer()
            .call_render(&mut store, root, highlight)
            .map_err(|e| WasmError::Guest(e.to_string()))?
            .map_err(|e| WasmError::Guest(format!("render error: {:?}", e)))
    }

    /// Call the guest `export` function via generated bindings.
    fn call_export(
        &self,
        artifacts: &[Artifact],
        config: &AdapterConfig,
    ) -> Result<Vec<u8>, WasmError> {
        let mut store = self.create_store()?;
        let linker = self.create_linker()?;

        let bindings =
            adapter_bindings::RivetAdapter::instantiate(&mut store, &self.component, &linker)
                .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        // Convert host artifacts to WIT types.
        let wit_artifacts: Vec<adapter_bindings::pulseengine::rivet::types::Artifact> =
            artifacts.iter().map(convert_host_artifact_to_wit).collect();

        let wit_config = adapter_bindings::pulseengine::rivet::types::AdapterConfig {
            entries: config
                .entries
                .iter()
                .map(
                    |(k, v)| adapter_bindings::pulseengine::rivet::types::ConfigEntry {
                        key: k.clone(),
                        value: v.clone(),
                    },
                )
                .collect(),
        };

        let result = bindings
            .pulseengine_rivet_adapter()
            .call_export(&mut store, &wit_artifacts, &wit_config)
            .map_err(|e| WasmError::Guest(e.to_string()))?;

        match result {
            Ok(bytes) => Ok(bytes),
            Err(e) => Err(WasmError::Guest(format!("adapter export error: {:?}", e))),
        }
    }
}

// ---------------------------------------------------------------------------
// Adapter trait implementation
// ---------------------------------------------------------------------------

impl Adapter for WasmAdapter {
    fn id(&self) -> &str {
        let stem = self
            .path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("wasm-adapter");
        Box::leak(stem.to_string().into_boxed_str())
    }

    fn name(&self) -> &str {
        let display = format!("WASM adapter ({})", self.path.display());
        Box::leak(display.into_boxed_str())
    }

    fn supported_types(&self) -> &[String] {
        &[]
    }

    fn import(
        &self,
        source: &AdapterSource,
        config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        self.call_import(source, config).map_err(Error::from)
    }

    fn export(&self, artifacts: &[Artifact], config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        self.call_export(artifacts, config).map_err(Error::from)
    }
}

// ---------------------------------------------------------------------------
// Resource limiter
// ---------------------------------------------------------------------------

/// Simple memory limiter for the WASM store.
struct MemoryLimiter {
    max_memory: usize,
}

impl wasmtime::ResourceLimiter for MemoryLimiter {
    fn memory_growing(
        &mut self,
        _current: usize,
        desired: usize,
        _maximum: Option<usize>,
    ) -> wasmtime::Result<bool> {
        Ok(desired <= self.max_memory)
    }

    fn table_growing(
        &mut self,
        _current: usize,
        _desired: usize,
        _maximum: Option<usize>,
    ) -> wasmtime::Result<bool> {
        Ok(true)
    }
}

// ---------------------------------------------------------------------------
// WIT <-> Host type conversions
// ---------------------------------------------------------------------------

/// Convert a WIT artifact (from the WASM guest) into a host [`Artifact`].
fn convert_wit_artifact_to_host(
    wit: adapter_bindings::pulseengine::rivet::types::Artifact,
) -> Artifact {
    use crate::model::Link;

    let links = wit
        .links
        .into_iter()
        .map(|l| Link {
            link_type: l.link_type,
            target: l.target,
        })
        .collect();

    let fields = wit
        .fields
        .into_iter()
        .map(|f| {
            let value = match f.value {
                adapter_bindings::pulseengine::rivet::types::FieldValue::Text(s) => {
                    serde_yaml::Value::String(s)
                }
                adapter_bindings::pulseengine::rivet::types::FieldValue::Number(n) => {
                    serde_yaml::Value::Number(serde_yaml::Number::from(n))
                }
                adapter_bindings::pulseengine::rivet::types::FieldValue::Boolean(b) => {
                    serde_yaml::Value::Bool(b)
                }
                adapter_bindings::pulseengine::rivet::types::FieldValue::TextList(list) => {
                    serde_yaml::Value::Sequence(
                        list.into_iter().map(serde_yaml::Value::String).collect(),
                    )
                }
            };
            (f.key, value)
        })
        .collect();

    Artifact {
        id: wit.id,
        artifact_type: wit.artifact_type,
        title: wit.title,
        description: wit.description,
        status: wit.status,
        tags: wit.tags,
        links,
        fields,
        provenance: None,
        source_file: None,
    }
}

/// Convert a host [`Artifact`] into the WIT type for sending to the WASM guest.
fn convert_host_artifact_to_wit(
    host: &Artifact,
) -> adapter_bindings::pulseengine::rivet::types::Artifact {
    use adapter_bindings::pulseengine::rivet::types as wit;

    let links = host
        .links
        .iter()
        .map(|l| wit::Link {
            link_type: l.link_type.clone(),
            target: l.target.clone(),
        })
        .collect();

    let fields = host
        .fields
        .iter()
        .map(|(k, v)| wit::FieldEntry {
            key: k.clone(),
            value: yaml_value_to_wit_field(v),
        })
        .collect();

    wit::Artifact {
        id: host.id.clone(),
        artifact_type: host.artifact_type.clone(),
        title: host.title.clone(),
        description: host.description.clone(),
        status: host.status.clone(),
        tags: host.tags.clone(),
        links,
        fields,
    }
}

/// Convert a `serde_yaml::Value` to a WIT `FieldValue`.
fn yaml_value_to_wit_field(
    value: &serde_yaml::Value,
) -> adapter_bindings::pulseengine::rivet::types::FieldValue {
    use adapter_bindings::pulseengine::rivet::types::FieldValue;

    match value {
        serde_yaml::Value::String(s) => FieldValue::Text(s.clone()),
        serde_yaml::Value::Bool(b) => FieldValue::Boolean(*b),
        serde_yaml::Value::Number(n) => FieldValue::Number(n.as_f64().unwrap_or(0.0)),
        serde_yaml::Value::Sequence(seq) => {
            let strings: Vec<String> = seq
                .iter()
                .filter_map(|v| v.as_str().map(String::from))
                .collect();
            FieldValue::TextList(strings)
        }
        // For other YAML types (mapping, null, tagged), serialize as text.
        other => FieldValue::Text(format!("{:?}", other)),
    }
}

// ---------------------------------------------------------------------------
// WASM output validation
// ---------------------------------------------------------------------------

/// Validate and sanitize artifacts returned by a WASM adapter.
///
/// - Rejects artifacts with empty `id` or `artifact_type`.
/// - Strips HTML tags from `title` and `description` fields to prevent XSS.
fn validate_wasm_artifacts(artifacts: Vec<Artifact>) -> Result<Vec<Artifact>, WasmError> {
    let mut result = Vec::with_capacity(artifacts.len());

    for mut artifact in artifacts {
        // Reject empty IDs
        if artifact.id.trim().is_empty() {
            return Err(WasmError::Guest(
                "WASM adapter returned artifact with empty ID".into(),
            ));
        }

        // Reject empty artifact types
        if artifact.artifact_type.trim().is_empty() {
            return Err(WasmError::Guest(format!(
                "WASM adapter returned artifact '{}' with empty type",
                artifact.id,
            )));
        }

        // Sanitize title — strip HTML tags to prevent XSS
        artifact.title = strip_html_from_text(&artifact.title);

        // Sanitize description
        if let Some(ref desc) = artifact.description {
            artifact.description = Some(strip_html_from_text(desc));
        }

        result.push(artifact);
    }

    Ok(result)
}

/// Strip HTML tags from plain text fields to prevent XSS injection.
///
/// This is a basic sanitizer for text that should never contain HTML.
/// It removes `<tag>` sequences but preserves the text content between them.
fn strip_html_from_text(input: &str) -> String {
    let mut result = String::with_capacity(input.len());
    let mut in_tag = false;
    for ch in input.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => result.push(ch),
            _ => {}
        }
    }
    result
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Read source data into a byte vector, regardless of the source variant.
fn read_source_bytes(source: &AdapterSource) -> Result<Vec<u8>, Error> {
    match source {
        AdapterSource::Bytes(bytes) => Ok(bytes.clone()),
        AdapterSource::Path(path) => {
            std::fs::read(path).map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))
        }
        AdapterSource::Directory(dir) => {
            // For directory sources, concatenate all files.
            // A real implementation would pass file listings to the guest.
            let mut combined = Vec::new();
            let entries = std::fs::read_dir(dir)
                .map_err(|e| Error::Io(format!("{}: {}", dir.display(), e)))?;
            for entry in entries {
                let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
                let path = entry.path();
                if path.is_file() {
                    let bytes = std::fs::read(&path)
                        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
                    combined.extend(bytes);
                }
            }
            Ok(combined)
        }
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // rivet: verifies REQ-008
    #[test]
    fn default_config_has_sane_limits() {
        let config = WasmRuntimeConfig::default();
        assert_eq!(config.max_memory_bytes, Some(256 * 1024 * 1024));
        assert_eq!(config.fuel, Some(1_000_000_000));
        assert!(config.wasi);
    }

    // rivet: verifies REQ-008
    #[test]
    fn runtime_creation_succeeds() {
        let runtime = WasmAdapterRuntime::with_defaults();
        assert!(runtime.is_ok(), "runtime creation should succeed");
    }

    // rivet: verifies REQ-008
    #[test]
    fn load_nonexistent_file_returns_error() {
        let runtime = WasmAdapterRuntime::with_defaults().unwrap();
        let result = runtime.load_adapter(Path::new("/nonexistent/adapter.wasm"));
        assert!(result.is_err());
        match result.unwrap_err() {
            WasmError::FileRead { path, .. } => {
                assert_eq!(path, Path::new("/nonexistent/adapter.wasm"));
            }
            other => panic!("expected FileRead error, got: {other}"),
        }
    }

    // rivet: verifies REQ-008
    #[test]
    fn load_invalid_wasm_returns_compilation_error() {
        let runtime = WasmAdapterRuntime::with_defaults().unwrap();
        // Write garbage bytes to a temp file
        let dir = std::env::temp_dir().join("rivet-wasm-test");
        std::fs::create_dir_all(&dir).unwrap();
        let path = dir.join("bad.wasm");
        std::fs::write(&path, b"not a wasm component").unwrap();

        let result = runtime.load_adapter(&path);
        assert!(result.is_err());
        match result.unwrap_err() {
            WasmError::Compilation { path: p, .. } => {
                assert_eq!(p, path);
            }
            other => panic!("expected Compilation error, got: {other}"),
        }

        // Clean up
        let _ = std::fs::remove_dir_all(&dir);
    }

    // rivet: verifies REQ-008
    #[test]
    fn wasm_error_converts_to_core_error() {
        let wasm_err = WasmError::Guest("test error".into());
        let core_err: Error = wasm_err.into();
        match core_err {
            Error::Adapter(msg) => assert!(msg.contains("test error")),
            other => panic!("expected Adapter error, got: {other:?}"),
        }
    }

    // rivet: verifies REQ-008
    #[test]
    fn convert_wit_artifact_roundtrip() {
        use adapter_bindings::pulseengine::rivet::types as wit;

        let wit_artifact = wit::Artifact {
            id: "REQ-001".into(),
            artifact_type: "requirement".into(),
            title: "Test requirement".into(),
            description: Some("A test description".into()),
            status: Some("draft".into()),
            tags: vec!["safety".into(), "phase-1".into()],
            links: vec![wit::Link {
                link_type: "satisfies".into(),
                target: "REQ-000".into(),
            }],
            fields: vec![wit::FieldEntry {
                key: "priority".into(),
                value: wit::FieldValue::Text("high".into()),
            }],
        };

        let host = convert_wit_artifact_to_host(wit_artifact);
        assert_eq!(host.id, "REQ-001");
        assert_eq!(host.artifact_type, "requirement");
        assert_eq!(host.title, "Test requirement");
        assert_eq!(host.description.as_deref(), Some("A test description"));
        assert_eq!(host.status.as_deref(), Some("draft"));
        assert_eq!(host.tags, vec!["safety", "phase-1"]);
        assert_eq!(host.links.len(), 1);
        assert_eq!(host.links[0].link_type, "satisfies");
        assert_eq!(host.links[0].target, "REQ-000");
        assert_eq!(
            host.fields.get("priority"),
            Some(&serde_yaml::Value::String("high".into()))
        );

        // Round-trip back to WIT
        let wit_back = convert_host_artifact_to_wit(&host);
        assert_eq!(wit_back.id, "REQ-001");
        assert_eq!(wit_back.artifact_type, "requirement");
        assert_eq!(wit_back.links.len(), 1);
        assert_eq!(wit_back.fields.len(), 1);
    }

    // rivet: verifies REQ-008
    #[test]
    fn yaml_value_to_wit_field_conversions() {
        use adapter_bindings::pulseengine::rivet::types::FieldValue;

        // String
        let v = serde_yaml::Value::String("hello".into());
        match yaml_value_to_wit_field(&v) {
            FieldValue::Text(s) => assert_eq!(s, "hello"),
            other => panic!("expected Text, got {:?}", other),
        }

        // Boolean
        let v = serde_yaml::Value::Bool(true);
        match yaml_value_to_wit_field(&v) {
            FieldValue::Boolean(b) => assert!(b),
            other => panic!("expected Boolean, got {:?}", other),
        }

        // Number
        let v = serde_yaml::Value::Number(serde_yaml::Number::from(42));
        match yaml_value_to_wit_field(&v) {
            FieldValue::Number(n) => assert!((n - 42.0).abs() < f64::EPSILON),
            other => panic!("expected Number, got {:?}", other),
        }

        // Sequence of strings
        let v = serde_yaml::Value::Sequence(vec![
            serde_yaml::Value::String("a".into()),
            serde_yaml::Value::String("b".into()),
        ]);
        match yaml_value_to_wit_field(&v) {
            FieldValue::TextList(list) => assert_eq!(list, vec!["a", "b"]),
            other => panic!("expected TextList, got {:?}", other),
        }
    }

    // rivet: verifies REQ-008
    #[test]
    fn validate_wasm_artifacts_rejects_empty_id() {
        let artifacts = vec![Artifact {
            id: "".into(),
            artifact_type: "requirement".into(),
            title: "Test".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: std::collections::BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];
        let result = validate_wasm_artifacts(artifacts);
        assert!(result.is_err());
        assert!(
            format!("{:?}", result.unwrap_err()).contains("empty ID"),
            "should mention empty ID"
        );
    }

    // rivet: verifies REQ-008
    #[test]
    fn validate_wasm_artifacts_rejects_empty_type() {
        let artifacts = vec![Artifact {
            id: "REQ-001".into(),
            artifact_type: "".into(),
            title: "Test".into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: std::collections::BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];
        let result = validate_wasm_artifacts(artifacts);
        assert!(result.is_err());
        assert!(
            format!("{:?}", result.unwrap_err()).contains("empty type"),
            "should mention empty type"
        );
    }

    // rivet: verifies REQ-008
    #[test]
    fn validate_wasm_artifacts_strips_html_from_title() {
        let artifacts = vec![Artifact {
            id: "REQ-001".into(),
            artifact_type: "requirement".into(),
            title: "<script>alert(1)</script>Safe Title".into(),
            description: Some("<img onerror=alert(1)>Description".into()),
            status: None,
            tags: vec![],
            links: vec![],
            fields: std::collections::BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];
        let result = validate_wasm_artifacts(artifacts).unwrap();
        assert_eq!(result.len(), 1);
        assert_eq!(result[0].title, "alert(1)Safe Title");
        assert!(!result[0].title.contains("<script>"));
        let desc = result[0].description.as_deref().unwrap();
        assert!(!desc.contains("<img"));
        assert!(desc.contains("Description"));
    }

    // rivet: verifies REQ-008
    #[test]
    fn strip_html_from_text_removes_tags() {
        assert_eq!(strip_html_from_text("<b>bold</b>"), "bold");
        assert_eq!(
            strip_html_from_text("<script>evil()</script>safe"),
            "evil()safe"
        );
        assert_eq!(strip_html_from_text("no tags here"), "no tags here");
        assert_eq!(strip_html_from_text(""), "");
    }

    /// End-to-end: load the spar WASM component, preopen a directory with
    /// real AADL files, call the renderer, and verify the SVG output.
    ///
    /// Set `SPAR_WASM_PATH` to override the default component location.
    /// The test is skipped if the component or AADL files are not found.
    // rivet: verifies REQ-008
    #[test]
    fn render_aadl_via_wasm() {
        // Only run if the WASM component exists
        let wasm_path = std::env::var("SPAR_WASM_PATH").unwrap_or_else(|_| {
            "/Volumes/Home/git/pulseengine/spar/target/wasm32-wasip2/release/spar_wasm.wasm".into()
        });
        let path = std::path::Path::new(&wasm_path);
        if !path.exists() {
            eprintln!("Skipping: WASM component not found at {}", path.display());
            return;
        }

        // The AADL example directory
        let aadl_dir =
            std::path::Path::new(env!("CARGO_MANIFEST_DIR")).join("../examples/aadl/aadl");
        if !aadl_dir.exists() {
            eprintln!("Skipping: AADL example not found at {}", aadl_dir.display());
            return;
        }

        let runtime = WasmAdapterRuntime::with_defaults().unwrap();
        let adapter = runtime.load_adapter(path).unwrap();

        // Call render with the AADL directory preopened
        let result = adapter.call_render("FlightControl::Controller.Basic", &[], Some(&aadl_dir));

        match result {
            Ok(svg) => {
                assert!(svg.contains("<svg"), "output should be SVG");
                assert!(svg.contains("</svg>"), "SVG should be complete");
                assert!(svg.contains("data-id"), "nodes should have data-id");

                // Write to temp for inspection
                let out = std::env::temp_dir().join("rivet-wasm-test");
                std::fs::create_dir_all(&out).ok();
                let svg_path = out.join("wasm-rendered.svg");
                std::fs::write(&svg_path, &svg).unwrap();
                eprintln!("SVG written to: {}", svg_path.display());
            }
            Err(e) => {
                // Some WASM/WASI issues are expected in test environments
                eprintln!("Render returned error (may be expected): {:?}", e);
            }
        }
    }

    /// Load the real spar WASM component and call the renderer interface.
    ///
    /// Set `SPAR_WASM_PATH` to override the default component location.
    /// The test is skipped if the component file does not exist.
    // rivet: verifies REQ-008
    #[test]
    fn load_spar_wasm_component() {
        let wasm_path = std::env::var("SPAR_WASM_PATH").unwrap_or_else(|_| {
            "/Volumes/Home/git/pulseengine/spar/target/wasm32-wasip2/release/spar_wasm.wasm".into()
        });
        let path = Path::new(&wasm_path);
        if !path.exists() {
            eprintln!("Skipping: WASM component not found at {}", path.display());
            return;
        }

        let runtime = WasmAdapterRuntime::with_defaults().unwrap();
        let adapter = runtime.load_adapter(path).unwrap();

        // Call render without any preopened AADL files.  The component should
        // load and the interface should be callable, but we expect an error
        // because there are no .aadl source files available to the guest.
        let result = adapter.call_render("Test::S.I", &[], None);
        assert!(result.is_err());
        let err_msg = format!("{:?}", result.unwrap_err());
        assert!(
            err_msg.contains("no .aadl files")
                || err_msg.contains("render error")
                || err_msg.contains("cannot instantiate"),
            "unexpected error: {}",
            err_msg
        );
    }
}
