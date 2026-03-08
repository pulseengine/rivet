//! AADL adapter — parses spar's JSON output into rivet Artifacts.
//!
//! This is the Layer 1 integration path: rivet calls the spar CLI and
//! parses its JSON output.  The adapter converts spar's component and
//! diagnostic data into rivet artifacts that can be validated against the
//! AADL schema and traced to requirements.
//!
//! Import modes:
//! - `Bytes`     — parse JSON directly (main path for tests)
//! - `Path`      — read a file as JSON
//! - `Directory` — find `.aadl` files, invoke `spar analyze --format json`,
//!                 parse its stdout

use std::collections::BTreeMap;
use std::path::Path;

use serde::Deserialize;

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::Artifact;

// ── Public adapter ───────────────────────────────────────────────────────

pub struct AadlAdapter {
    supported: Vec<String>,
}

impl AadlAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec![
                "aadl-component".into(),
                "aadl-analysis-result".into(),
                "aadl-flow".into(),
            ],
        }
    }
}

impl Default for AadlAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for AadlAdapter {
    fn id(&self) -> &str {
        "aadl"
    }

    fn name(&self) -> &str {
        "AADL (spar)"
    }

    fn supported_types(&self) -> &[String] {
        &self.supported
    }

    fn import(
        &self,
        source: &AdapterSource,
        config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        match source {
            AdapterSource::Bytes(bytes) => {
                let content = std::str::from_utf8(bytes)
                    .map_err(|e| Error::Adapter(format!("invalid UTF-8: {}", e)))?;
                parse_spar_json(content)
            }
            AdapterSource::Path(path) => import_json_file(path),
            AdapterSource::Directory(dir) => import_aadl_directory(dir, config),
        }
    }

    fn export(&self, _artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        Err(Error::Adapter(
            "AADL export is not supported".into(),
        ))
    }
}

// ── Spar JSON schema ─────────────────────────────────────────────────────

#[derive(Debug, Deserialize)]
struct SparOutput {
    #[allow(dead_code)]
    root: String,
    #[serde(default)]
    packages: Vec<SparPackage>,
    #[allow(dead_code)]
    #[serde(default)]
    instance: Option<serde_json::Value>,
    #[serde(default)]
    diagnostics: Vec<SparDiagnostic>,
}

#[derive(Debug, Deserialize)]
struct SparPackage {
    name: String,
    #[serde(default)]
    component_types: Vec<SparComponentType>,
    #[serde(default)]
    component_impls: Vec<SparComponentImpl>,
}

#[derive(Debug, Deserialize)]
struct SparComponentType {
    name: String,
    category: String,
}

#[derive(Debug, Deserialize)]
struct SparComponentImpl {
    name: String,
    category: String,
}

#[derive(Debug, Deserialize)]
struct SparDiagnostic {
    severity: String,
    message: String,
    #[serde(default)]
    path: Vec<String>,
    #[serde(default)]
    analysis: String,
}

// ── Parsing & conversion ─────────────────────────────────────────────────

fn parse_spar_json(content: &str) -> Result<Vec<Artifact>, Error> {
    let output: SparOutput = serde_json::from_str(content)
        .map_err(|e| Error::Adapter(format!("failed to parse spar JSON: {}", e)))?;

    let mut artifacts = Vec::new();

    // Convert component types and implementations.
    for pkg in &output.packages {
        for ct in &pkg.component_types {
            artifacts.push(component_to_artifact(
                &pkg.name,
                &ct.name,
                &ct.category,
                "type",
            ));
        }
        for ci in &pkg.component_impls {
            artifacts.push(component_to_artifact(
                &pkg.name,
                &ci.name,
                &ci.category,
                "implementation",
            ));
        }
    }

    // Convert diagnostics.
    for (index, diag) in output.diagnostics.iter().enumerate() {
        artifacts.push(diagnostic_to_artifact(index, diag));
    }

    Ok(artifacts)
}

fn component_to_artifact(
    pkg_name: &str,
    comp_name: &str,
    category: &str,
    classifier_kind: &str,
) -> Artifact {
    let id = format!("AADL-{}-{}", pkg_name, comp_name);

    let mut fields = BTreeMap::new();
    fields.insert(
        "category".into(),
        serde_yaml::Value::String(category.into()),
    );
    fields.insert(
        "aadl-package".into(),
        serde_yaml::Value::String(pkg_name.into()),
    );
    fields.insert(
        "classifier-kind".into(),
        serde_yaml::Value::String(classifier_kind.into()),
    );

    Artifact {
        id,
        artifact_type: "aadl-component".into(),
        title: format!("{} {} ({})", category, comp_name, classifier_kind),
        description: None,
        status: None,
        tags: vec![],
        links: vec![],
        fields,
        source_file: None,
    }
}

fn diagnostic_to_artifact(index: usize, diag: &SparDiagnostic) -> Artifact {
    let id = format!("AADL-DIAG-{:04}", index);

    let mut fields = BTreeMap::new();
    fields.insert(
        "analysis-name".into(),
        serde_yaml::Value::String(diag.analysis.clone()),
    );
    fields.insert(
        "severity".into(),
        serde_yaml::Value::String(diag.severity.clone()),
    );
    fields.insert(
        "component-path".into(),
        serde_yaml::Value::String(diag.path.join(".")),
    );
    fields.insert(
        "details".into(),
        serde_yaml::Value::String(diag.message.clone()),
    );

    Artifact {
        id,
        artifact_type: "aadl-analysis-result".into(),
        title: format!("[{}] {}", diag.analysis, diag.message),
        description: Some(diag.message.clone()),
        status: None,
        tags: vec![],
        links: vec![],
        fields,
        source_file: None,
    }
}

// ── File / directory import ──────────────────────────────────────────────

fn import_json_file(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
    let mut artifacts = parse_spar_json(&content)?;
    for a in &mut artifacts {
        a.source_file = Some(path.to_path_buf());
    }
    Ok(artifacts)
}

fn import_aadl_directory(dir: &Path, config: &AdapterConfig) -> Result<Vec<Artifact>, Error> {
    // Collect .aadl files.
    let aadl_files = collect_aadl_files(dir)?;
    if aadl_files.is_empty() {
        return Ok(Vec::new());
    }

    // Build the spar command.
    let root = config.get("root").unwrap_or(".");

    let mut cmd = std::process::Command::new("spar");
    cmd.arg("analyze")
        .arg("--root")
        .arg(root)
        .arg("--format")
        .arg("json");

    for file in &aadl_files {
        cmd.arg(file);
    }

    let output = cmd.output().map_err(|e| {
        Error::Adapter(format!(
            "failed to run spar: {} (is spar installed and on PATH?)",
            e
        ))
    })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(Error::Adapter(format!(
            "spar exited with {}: {}",
            output.status, stderr
        )));
    }

    let stdout = std::str::from_utf8(&output.stdout)
        .map_err(|e| Error::Adapter(format!("spar output is not valid UTF-8: {}", e)))?;

    parse_spar_json(stdout)
}

fn collect_aadl_files(dir: &Path) -> Result<Vec<std::path::PathBuf>, Error> {
    let mut files = Vec::new();
    let entries =
        std::fs::read_dir(dir).map_err(|e| Error::Io(format!("{}: {}", dir.display(), e)))?;

    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path.extension().is_some_and(|ext| ext == "aadl") {
            files.push(path);
        } else if path.is_dir() {
            files.extend(collect_aadl_files(&path)?);
        }
    }

    Ok(files)
}
