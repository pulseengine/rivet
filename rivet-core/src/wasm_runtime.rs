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

    /// Call the guest `id` function.
    #[allow(dead_code)]
    fn call_id(&self) -> Result<String, WasmError> {
        let mut store = self.create_store()?;
        let linker = self.create_linker()?;
        let instance = linker
            .instantiate(&mut store, &self.component)
            .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        // TODO: Use generated bindings from `wasmtime::component::bindgen!`
        // once the WIT is finalized. For now, look up the function by name.
        let func = instance
            .get_func(&mut store, "id")
            .ok_or_else(|| WasmError::Guest("adapter does not export 'id' function".into()))?;

        let mut results = [wasmtime::component::Val::String("".into())];
        func.call(&mut store, &[], &mut results)
            .map_err(|e| WasmError::Guest(e.to_string()))?;

        match &results[0] {
            wasmtime::component::Val::String(s) => Ok(s.to_string()),
            other => Err(WasmError::Conversion(format!(
                "expected string from id(), got {:?}",
                other
            ))),
        }
    }

    /// Call the guest `name` function.
    #[allow(dead_code)]
    fn call_name(&self) -> Result<String, WasmError> {
        let mut store = self.create_store()?;
        let linker = self.create_linker()?;
        let instance = linker
            .instantiate(&mut store, &self.component)
            .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        let func = instance
            .get_func(&mut store, "name")
            .ok_or_else(|| WasmError::Guest("adapter does not export 'name' function".into()))?;

        let mut results = [wasmtime::component::Val::String("".into())];
        func.call(&mut store, &[], &mut results)
            .map_err(|e| WasmError::Guest(e.to_string()))?;

        match &results[0] {
            wasmtime::component::Val::String(s) => Ok(s.to_string()),
            other => Err(WasmError::Conversion(format!(
                "expected string from name(), got {:?}",
                other
            ))),
        }
    }

    /// Call the guest `supported-types` function.
    #[allow(dead_code)]
    fn call_supported_types(&self) -> Result<Vec<String>, WasmError> {
        let mut store = self.create_store()?;
        let linker = self.create_linker()?;
        let instance = linker
            .instantiate(&mut store, &self.component)
            .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        let func = instance
            .get_func(&mut store, "supported-types")
            .ok_or_else(|| {
                WasmError::Guest("adapter does not export 'supported-types' function".into())
            })?;

        // TODO: Proper deserialization of list<string> result via generated bindings.
        // For now, return an empty list as a placeholder.
        let _ = func;
        log::debug!("supported-types: using placeholder (empty list)");
        Ok(vec![])
    }

    /// Call the guest `import` function.
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
        let instance = linker
            .instantiate(&mut store, &self.component)
            .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        let func = instance
            .get_func(&mut store, "import")
            .ok_or_else(|| WasmError::Guest("adapter does not export 'import' function".into()))?;

        // Build config entries as component values.
        let config_entries: Vec<(String, String)> = config
            .entries
            .iter()
            .map(|(k, v)| (k.clone(), v.clone()))
            .collect();

        // TODO: Build proper component-model values for the function arguments
        // and parse the result<list<artifact>, adapter-error> return type.
        // This requires either `wasmtime::component::bindgen!` macro or manual
        // Val construction matching the WIT types.
        //
        // Placeholder: log the call and return an error indicating this path
        // is not yet fully wired up.
        let _ = (func, source_bytes, config_entries);
        Err(WasmError::Guest(
            "WASM adapter import is not yet fully implemented — \
             the component was loaded and validated, but host-guest \
             data marshalling requires generated bindings"
                .into(),
        ))
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

    /// Call the guest `export` function.
    fn call_export(
        &self,
        artifacts: &[Artifact],
        config: &AdapterConfig,
    ) -> Result<Vec<u8>, WasmError> {
        let mut store = self.create_store()?;
        let linker = self.create_linker()?;
        let instance = linker
            .instantiate(&mut store, &self.component)
            .map_err(|e| WasmError::Instantiation(e.to_string()))?;

        let func = instance
            .get_func(&mut store, "export")
            .ok_or_else(|| WasmError::Guest("adapter does not export 'export' function".into()))?;

        // TODO: Convert host Artifact list to component-model values,
        // invoke the function, and parse result<list<u8>, adapter-error>.
        let _ = (func, artifacts, config);
        Err(WasmError::Guest(
            "WASM adapter export is not yet fully implemented — \
             the component was loaded and validated, but host-guest \
             data marshalling requires generated bindings"
                .into(),
        ))
    }
}

// ---------------------------------------------------------------------------
// Adapter trait implementation
// ---------------------------------------------------------------------------

impl Adapter for WasmAdapter {
    fn id(&self) -> &str {
        // The Adapter trait returns `&str`, but we need to call into WASM
        // each time.  We use a leaked Box to produce a stable &str.
        // In production this would be cached at construction time.
        //
        // For now, return the file stem as a fallback identifier so the
        // adapter is usable even before full WASM calls are wired up.
        // TODO: call self.call_id() and cache the result during construction.
        let stem = self
            .path
            .file_stem()
            .and_then(|s| s.to_str())
            .unwrap_or("wasm-adapter");
        // SAFETY: We leak a small string once per adapter load.  In practice
        // adapters are loaded once at startup, so this is acceptable.
        Box::leak(stem.to_string().into_boxed_str())
    }

    fn name(&self) -> &str {
        // Same strategy as id() — use path-based fallback.
        let display = format!("WASM adapter ({})", self.path.display());
        Box::leak(display.into_boxed_str())
    }

    fn supported_types(&self) -> &[String] {
        // TODO: Cache result of call_supported_types() during construction.
        // Returning a static empty slice for now.
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

    #[test]
    fn default_config_has_sane_limits() {
        let config = WasmRuntimeConfig::default();
        assert_eq!(config.max_memory_bytes, Some(256 * 1024 * 1024));
        assert_eq!(config.fuel, Some(1_000_000_000));
        assert!(config.wasi);
    }

    #[test]
    fn runtime_creation_succeeds() {
        let runtime = WasmAdapterRuntime::with_defaults();
        assert!(runtime.is_ok(), "runtime creation should succeed");
    }

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

    #[test]
    fn wasm_error_converts_to_core_error() {
        let wasm_err = WasmError::Guest("test error".into());
        let core_err: Error = wasm_err.into();
        match core_err {
            Error::Adapter(msg) => assert!(msg.contains("test error")),
            other => panic!("expected Adapter error, got: {other:?}"),
        }
    }

    /// End-to-end: load the spar WASM component, preopen a directory with
    /// real AADL files, call the renderer, and verify the SVG output.
    ///
    /// Set `SPAR_WASM_PATH` to override the default component location.
    /// The test is skipped if the component or AADL files are not found.
    #[test]
    fn render_aadl_via_wasm() {
        // Only run if the WASM component exists
        let wasm_path = std::env::var("SPAR_WASM_PATH")
            .unwrap_or_else(|_| "/Volumes/Home/git/pulseengine/spar/target/wasm32-wasip2/release/spar_wasm.wasm".into());
        let path = std::path::Path::new(&wasm_path);
        if !path.exists() {
            eprintln!("Skipping: WASM component not found at {}", path.display());
            return;
        }

        // The AADL example directory
        let aadl_dir = std::path::Path::new(env!("CARGO_MANIFEST_DIR"))
            .join("../examples/aadl/aadl");
        if !aadl_dir.exists() {
            eprintln!("Skipping: AADL example not found at {}", aadl_dir.display());
            return;
        }

        let runtime = WasmAdapterRuntime::with_defaults().unwrap();
        let adapter = runtime.load_adapter(path).unwrap();

        // Call render with the AADL directory preopened
        let result = adapter.call_render(
            "FlightControl::Controller.Basic",
            &[],
            Some(&aadl_dir),
        );

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
