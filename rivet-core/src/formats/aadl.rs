//! AADL adapter — uses spar crates to parse `.aadl` files directly.
//!
//! Integration via `spar-hir` (parsing + HIR) and `spar-analysis`
//! (connectivity, scheduling, latency, etc.). No CLI invocation needed.
//!
//! Import modes:
//! - `Bytes` — parse JSON (legacy/test compatibility)
//! - `Path` — single `.aadl` file or JSON file
//! - `Directory` — find `.aadl` files, parse with spar-hir, run analyses

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
                // Try JSON first (legacy), then AADL source.
                if content.trim_start().starts_with('{') {
                    parse_spar_json(content)
                } else {
                    import_aadl_sources(&[("input.aadl".into(), content.to_string())], config)
                }
            }
            AdapterSource::Path(path) => import_single_file(path, config),
            AdapterSource::Directory(dir) => import_aadl_directory(dir, config),
        }
    }

    fn export(&self, _artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        Err(Error::Adapter("AADL export is not supported".into()))
    }
}

// ── Direct spar-hir integration ─────────────────────────────────────────

#[cfg(feature = "aadl")]
fn import_aadl_sources(
    sources: &[(String, String)],
    config: &AdapterConfig,
) -> Result<Vec<Artifact>, Error> {
    use spar_hir::Database;

    let db = Database::from_aadl(sources);
    let packages = db.packages();

    let mut artifacts = Vec::new();

    // Convert component types and implementations from HIR.
    for pkg in &packages {
        for ct in &pkg.component_types {
            let category = ct.category.to_string();
            // Map spaces to dashes for schema compatibility (e.g. "thread group" → "thread-group")
            let category_id = category.replace(' ', "-");
            artifacts.push(component_to_artifact(
                &pkg.name,
                &ct.name,
                &category_id,
                "type",
            ));
        }
        for ci in &pkg.component_impls {
            let category = ci.category.to_string();
            let category_id = category.replace(' ', "-");
            artifacts.push(component_to_artifact(
                &pkg.name,
                &ci.name,
                &category_id,
                "implementation",
            ));
        }
    }

    // Run tree-level analyses (category rules, naming) on all files.
    let tree_diags = run_tree_analyses(&db);
    let mut diag_index = 0;
    for diag in &tree_diags {
        artifacts.push(analysis_diagnostic_to_artifact(diag_index, diag));
        diag_index += 1;
    }

    // Run instance-level analyses if a root classifier is configured.
    let root_classifier = config.get("root-classifier");
    if let Some(root_name) = root_classifier
        && let Some(instance) = db.instantiate(root_name)
    {
        let instance_diags = run_instance_analyses(&instance);
        for diag in &instance_diags {
            artifacts.push(analysis_diagnostic_to_artifact(diag_index, diag));
            diag_index += 1;
        }
    }

    Ok(artifacts)
}

#[cfg(feature = "aadl")]
fn run_instance_analyses(instance: &spar_hir::Instance) -> Vec<spar_analysis::AnalysisDiagnostic> {
    use spar_analysis::AnalysisRunner;

    let mut runner = AnalysisRunner::new();
    // Instance-level analyses (operate on SystemInstance).
    runner.register(Box::new(spar_analysis::connectivity::ConnectivityAnalysis));
    runner.register(Box::new(spar_analysis::hierarchy::HierarchyAnalysis));
    runner.register(Box::new(spar_analysis::completeness::CompletenessAnalysis));
    runner.register(Box::new(
        spar_analysis::direction_rules::DirectionRuleAnalysis,
    ));
    runner.register(Box::new(spar_analysis::flow_check::FlowCheckAnalysis));
    runner.register(Box::new(spar_analysis::flow_rules::FlowRuleAnalysis));
    runner.register(Box::new(spar_analysis::mode_check::ModeCheckAnalysis));
    runner.register(Box::new(spar_analysis::mode_rules::ModeRuleAnalysis));
    runner.register(Box::new(spar_analysis::modal_rules::ModalRuleAnalysis));
    runner.register(Box::new(spar_analysis::binding_check::BindingCheckAnalysis));
    runner.register(Box::new(spar_analysis::binding_rules::BindingRuleAnalysis));
    runner.register(Box::new(spar_analysis::latency::LatencyAnalysis));
    runner.register(Box::new(spar_analysis::scheduling::SchedulingAnalysis));
    runner.register(Box::new(
        spar_analysis::resource_budget::ResourceBudgetAnalysis,
    ));
    runner.register(Box::new(
        spar_analysis::property_rules::PropertyRuleAnalysis,
    ));
    runner.register(Box::new(
        spar_analysis::connection_rules::ConnectionRuleAnalysis,
    ));
    runner.register(Box::new(
        spar_analysis::classifier_match::ClassifierMatchAnalysis,
    ));
    runner.register(Box::new(
        spar_analysis::subcomponent_rules::SubcomponentRuleAnalysis,
    ));
    runner.register(Box::new(spar_analysis::emv2_analysis::Emv2Analysis));
    runner.register(Box::new(spar_analysis::arinc653::Arinc653Analysis));
    runner.register(Box::new(spar_analysis::wrpc_binding::WrpcBindingAnalysis));

    runner.run_all(instance.inner())
}

/// Run tree-level checks (category rules, naming, legality) on all item trees.
#[cfg(feature = "aadl")]
fn run_tree_analyses(db: &spar_hir::Database) -> Vec<spar_analysis::AnalysisDiagnostic> {
    let mut diags = Vec::new();
    for tree in db.item_trees() {
        diags.extend(spar_analysis::category_check::check_category_rules(tree));
        diags.extend(spar_analysis::naming_rules::check_naming_rules(tree));
        diags.extend(spar_analysis::extends_rules::check_extends_rules(tree));
    }
    diags
}

#[cfg(feature = "aadl")]
fn analysis_diagnostic_to_artifact(
    index: usize,
    diag: &spar_analysis::AnalysisDiagnostic,
) -> Artifact {
    let id = format!("AADL-DIAG-{:04}", index + 1);
    let severity = match diag.severity {
        spar_analysis::Severity::Error => "error",
        spar_analysis::Severity::Warning => "warning",
        spar_analysis::Severity::Info => "info",
    };

    let mut fields = BTreeMap::new();
    fields.insert(
        "analysis-name".into(),
        serde_yaml::Value::String(diag.analysis.clone()),
    );
    fields.insert(
        "severity".into(),
        serde_yaml::Value::String(severity.into()),
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
        tags: vec!["aadl".into(), diag.analysis.clone()],
        links: vec![],
        fields,
        source_file: None,
    }
}

// Fallback when the aadl feature is disabled.
#[cfg(not(feature = "aadl"))]
fn import_aadl_sources(
    _sources: &[(String, String)],
    _config: &AdapterConfig,
) -> Result<Vec<Artifact>, Error> {
    Err(Error::Adapter(
        "AADL support requires the 'aadl' feature (spar crates)".into(),
    ))
}

// ── Legacy JSON parsing (test compatibility) ────────────────────────────

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

fn parse_spar_json(content: &str) -> Result<Vec<Artifact>, Error> {
    let output: SparOutput = serde_json::from_str(content)
        .map_err(|e| Error::Adapter(format!("failed to parse spar JSON: {}", e)))?;

    let mut artifacts = Vec::new();

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

    for (index, diag) in output.diagnostics.iter().enumerate() {
        artifacts.push(diagnostic_to_artifact(index, diag));
    }

    Ok(artifacts)
}

// ── Shared artifact builders ────────────────────────────────────────────

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
        status: Some("imported".into()),
        tags: vec!["aadl".into()],
        links: vec![],
        fields,
        source_file: None,
    }
}

fn diagnostic_to_artifact(index: usize, diag: &SparDiagnostic) -> Artifact {
    let id = format!("AADL-DIAG-{:04}", index + 1);

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
        tags: vec!["aadl".into(), diag.analysis.clone()],
        links: vec![],
        fields,
        source_file: None,
    }
}

// ── File / directory import ─────────────────────────────────────────────

fn import_single_file(path: &Path, config: &AdapterConfig) -> Result<Vec<Artifact>, Error> {
    let content = std::fs::read_to_string(path)
        .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;

    let is_json =
        path.extension().is_some_and(|ext| ext == "json") || content.trim_start().starts_with('{');

    let mut artifacts = if is_json {
        parse_spar_json(&content)?
    } else {
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();
        import_aadl_sources(&[(name, content)], config)?
    };

    for a in &mut artifacts {
        a.source_file = Some(path.to_path_buf());
    }
    Ok(artifacts)
}

fn import_aadl_directory(dir: &Path, config: &AdapterConfig) -> Result<Vec<Artifact>, Error> {
    let aadl_files = collect_aadl_files(dir)?;
    if aadl_files.is_empty() {
        return Ok(Vec::new());
    }

    // Read all .aadl files into (name, content) pairs for spar-hir.
    let mut sources = Vec::new();
    for path in &aadl_files {
        let content = std::fs::read_to_string(path)
            .map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))?;
        let name = path
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .into_owned();
        sources.push((name, content));
    }

    let mut artifacts = import_aadl_sources(&sources, config)?;

    // Tag artifacts with source file info.
    for a in &mut artifacts {
        if a.source_file.is_none() {
            a.source_file = Some(dir.to_path_buf());
        }
    }

    Ok(artifacts)
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
