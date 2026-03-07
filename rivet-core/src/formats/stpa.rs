//! STPA-specific YAML format adapter.
//!
//! Parses the STPA YAML format used by meld's `safety/stpa/` directory.
//! Each file type (losses, hazards, ucas, etc.) has its own structure;
//! this adapter transforms them all into the generic `Artifact` model.

use std::collections::BTreeMap;
use std::path::Path;

use serde::Deserialize;

use crate::adapter::{Adapter, AdapterConfig, AdapterSource};
use crate::error::Error;
use crate::model::{Artifact, Link};

pub struct StpaYamlAdapter {
    supported: Vec<String>,
}

impl StpaYamlAdapter {
    pub fn new() -> Self {
        Self {
            supported: vec![
                "loss".into(),
                "hazard".into(),
                "sub-hazard".into(),
                "system-constraint".into(),
                "controller".into(),
                "controlled-process".into(),
                "control-action".into(),
                "uca".into(),
                "controller-constraint".into(),
            ],
        }
    }
}

impl Default for StpaYamlAdapter {
    fn default() -> Self {
        Self::new()
    }
}

impl Adapter for StpaYamlAdapter {
    fn id(&self) -> &str {
        "stpa-yaml"
    }
    fn name(&self) -> &str {
        "STPA YAML Format"
    }
    fn supported_types(&self) -> &[String] {
        &self.supported
    }
    fn import(
        &self,
        source: &AdapterSource,
        _config: &AdapterConfig,
    ) -> Result<Vec<Artifact>, Error> {
        match source {
            AdapterSource::Directory(dir) => import_stpa_directory(dir),
            AdapterSource::Path(path) => import_stpa_file(path),
            AdapterSource::Bytes(_) => Err(Error::Adapter(
                "stpa-yaml adapter requires a file or directory path".into(),
            )),
        }
    }
    fn export(&self, _artifacts: &[Artifact], _config: &AdapterConfig) -> Result<Vec<u8>, Error> {
        Err(Error::Adapter(
            "stpa-yaml export not yet implemented".into(),
        ))
    }
}

/// Import all STPA files from a directory.
pub fn import_stpa_directory(dir: &Path) -> Result<Vec<Artifact>, Error> {
    let mut artifacts = Vec::new();

    type Parser = fn(&Path) -> Result<Vec<Artifact>, Error>;
    let file_parsers: &[(&str, Parser)] = &[
        ("losses.yaml", parse_losses),
        ("hazards.yaml", parse_hazards),
        ("system-constraints.yaml", parse_system_constraints),
        ("control-structure.yaml", parse_control_structure),
        ("ucas.yaml", parse_ucas),
        ("controller-constraints.yaml", parse_controller_constraints),
    ];

    for (filename, parser) in file_parsers {
        let path = dir.join(filename);
        if path.exists() {
            log::info!("loading {}", path.display());
            match parser(&path) {
                Ok(mut arts) => {
                    for a in &mut arts {
                        a.source_file = Some(path.clone());
                    }
                    artifacts.extend(arts);
                }
                Err(e) => {
                    log::warn!("failed to parse {}: {}", path.display(), e);
                    return Err(e);
                }
            }
        }
    }

    Ok(artifacts)
}

/// Import a single STPA file (auto-detects type from filename).
pub fn import_stpa_file(path: &Path) -> Result<Vec<Artifact>, Error> {
    let filename = path.file_name().and_then(|f| f.to_str()).unwrap_or("");

    let parser: fn(&Path) -> Result<Vec<Artifact>, Error> = match filename {
        "losses.yaml" => parse_losses,
        "hazards.yaml" => parse_hazards,
        "system-constraints.yaml" => parse_system_constraints,
        "control-structure.yaml" => parse_control_structure,
        "ucas.yaml" => parse_ucas,
        "controller-constraints.yaml" => parse_controller_constraints,
        _ => {
            return Err(Error::Adapter(format!(
                "unknown STPA file type: {}",
                filename
            )));
        }
    };

    let mut arts = parser(path)?;
    for a in &mut arts {
        a.source_file = Some(path.to_path_buf());
    }
    Ok(arts)
}

// ── Losses ───────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct LossesFile {
    losses: Vec<StpaLoss>,
}

#[derive(Deserialize)]
struct StpaLoss {
    id: String,
    title: String,
    description: String,
    #[serde(default)]
    stakeholders: Vec<String>,
}

fn parse_losses(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = read_file(path)?;
    let file: LossesFile = serde_yaml::from_str(&content)?;

    Ok(file
        .losses
        .into_iter()
        .map(|l| {
            let mut fields = BTreeMap::new();
            if !l.stakeholders.is_empty() {
                fields.insert(
                    "stakeholders".into(),
                    serde_yaml::to_value(&l.stakeholders).unwrap(),
                );
            }
            Artifact {
                id: l.id,
                artifact_type: "loss".into(),
                title: l.title,
                description: Some(l.description),
                status: None,
                tags: vec![],
                links: vec![],
                fields,
                source_file: None,
            }
        })
        .collect())
}

// ── Hazards ──────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct HazardsFile {
    hazards: Vec<StpaHazard>,
    #[serde(default, rename = "sub-hazards")]
    sub_hazards: Vec<StpaSubHazard>,
}

#[derive(Deserialize)]
struct StpaHazard {
    id: String,
    title: String,
    description: String,
    losses: Vec<String>,
}

#[derive(Deserialize)]
struct StpaSubHazard {
    id: String,
    parent: String,
    title: String,
    description: String,
}

fn parse_hazards(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = read_file(path)?;
    let file: HazardsFile = serde_yaml::from_str(&content)?;

    let mut artifacts: Vec<Artifact> = file
        .hazards
        .into_iter()
        .map(|h| Artifact {
            id: h.id,
            artifact_type: "hazard".into(),
            title: h.title,
            description: Some(h.description),
            status: None,
            tags: vec![],
            links: h
                .losses
                .into_iter()
                .map(|target| Link {
                    link_type: "leads-to-loss".into(),
                    target,
                })
                .collect(),
            fields: BTreeMap::new(),
            source_file: None,
        })
        .collect();

    for sh in file.sub_hazards {
        artifacts.push(Artifact {
            id: sh.id,
            artifact_type: "sub-hazard".into(),
            title: sh.title,
            description: Some(sh.description),
            status: None,
            tags: vec![],
            links: vec![Link {
                link_type: "refines".into(),
                target: sh.parent,
            }],
            fields: BTreeMap::new(),
            source_file: None,
        });
    }

    Ok(artifacts)
}

// ── System constraints ───────────────────────────────────────────────────

#[derive(Deserialize)]
struct SystemConstraintsFile {
    #[serde(rename = "system-constraints")]
    system_constraints: Vec<StpaSystemConstraint>,
}

#[derive(Deserialize)]
struct StpaSystemConstraint {
    id: String,
    title: String,
    description: String,
    hazards: Vec<String>,
    #[serde(default, rename = "spec-baseline")]
    spec_baseline: Option<String>,
}

fn parse_system_constraints(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = read_file(path)?;
    let file: SystemConstraintsFile = serde_yaml::from_str(&content)?;

    Ok(file
        .system_constraints
        .into_iter()
        .map(|sc| {
            let mut fields = BTreeMap::new();
            if let Some(baseline) = sc.spec_baseline {
                fields.insert("spec-baseline".into(), serde_yaml::Value::String(baseline));
            }
            Artifact {
                id: sc.id,
                artifact_type: "system-constraint".into(),
                title: sc.title,
                description: Some(sc.description),
                status: None,
                tags: vec![],
                links: sc
                    .hazards
                    .into_iter()
                    .map(|target| Link {
                        link_type: "prevents".into(),
                        target,
                    })
                    .collect(),
                fields,
                source_file: None,
            }
        })
        .collect())
}

// ── Control structure ────────────────────────────────────────────────────

#[derive(Deserialize)]
struct ControlStructureFile {
    controllers: Vec<StpaController>,
    #[serde(default, rename = "controlled-processes")]
    controlled_processes: Vec<StpaControlledProcess>,
}

#[derive(Deserialize)]
struct StpaController {
    id: String,
    name: String,
    #[serde(default, rename = "type")]
    controller_type: Option<String>,
    description: String,
    #[serde(default, rename = "source-file")]
    source_file: Option<String>,
    #[serde(default, rename = "control-actions")]
    control_actions: Vec<StpaControlAction>,
    #[serde(default)]
    feedback: Vec<StpaFeedback>,
    #[serde(default, rename = "process-model")]
    process_model: Vec<String>,
}

#[derive(Deserialize)]
struct StpaControlAction {
    ca: String,
    target: String,
    action: String,
}

#[derive(Deserialize)]
struct StpaFeedback {
    from: String,
    info: String,
}

#[derive(Deserialize)]
struct StpaControlledProcess {
    id: String,
    name: String,
    description: String,
}

fn parse_control_structure(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = read_file(path)?;
    let file: ControlStructureFile = serde_yaml::from_str(&content)?;

    let mut artifacts = Vec::new();

    for ctrl in file.controllers {
        let mut fields = BTreeMap::new();
        if let Some(ct) = &ctrl.controller_type {
            fields.insert(
                "controller-type".into(),
                serde_yaml::Value::String(ct.clone()),
            );
        }
        if let Some(sf) = &ctrl.source_file {
            fields.insert("source-file".into(), serde_yaml::Value::String(sf.clone()));
        }
        if !ctrl.process_model.is_empty() {
            fields.insert(
                "process-model".into(),
                serde_yaml::to_value(&ctrl.process_model).unwrap(),
            );
        }
        if !ctrl.feedback.is_empty() {
            let feedback_val: Vec<BTreeMap<String, String>> = ctrl
                .feedback
                .iter()
                .map(|f| {
                    let mut m = BTreeMap::new();
                    m.insert("from".into(), f.from.clone());
                    m.insert("info".into(), f.info.clone());
                    m
                })
                .collect();
            fields.insert(
                "feedback".into(),
                serde_yaml::to_value(&feedback_val).unwrap(),
            );
        }

        // Create control-action artifacts from embedded CAs
        for ca in &ctrl.control_actions {
            let mut ca_fields = BTreeMap::new();
            ca_fields.insert(
                "action".into(),
                serde_yaml::Value::String(ca.action.clone()),
            );
            artifacts.push(Artifact {
                id: ca.ca.clone(),
                artifact_type: "control-action".into(),
                title: ca.action.clone(),
                description: None,
                status: None,
                tags: vec![],
                links: vec![
                    Link {
                        link_type: "issued-by".into(),
                        target: ctrl.id.clone(),
                    },
                    Link {
                        link_type: "acts-on".into(),
                        target: ca.target.clone(),
                    },
                ],
                fields: ca_fields,
                source_file: None,
            });
        }

        artifacts.push(Artifact {
            id: ctrl.id,
            artifact_type: "controller".into(),
            title: ctrl.name,
            description: Some(ctrl.description),
            status: None,
            tags: vec![],
            links: vec![],
            fields,
            source_file: None,
        });
    }

    for proc in file.controlled_processes {
        artifacts.push(Artifact {
            id: proc.id,
            artifact_type: "controlled-process".into(),
            title: proc.name,
            description: Some(proc.description),
            status: None,
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            source_file: None,
        });
    }

    Ok(artifacts)
}

// ── UCAs ─────────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct UcaGroup {
    #[serde(rename = "control-action")]
    _control_action: String,
    controller: String,
    #[serde(default, rename = "not-providing")]
    not_providing: Vec<StpaUca>,
    #[serde(default)]
    providing: Vec<StpaUca>,
    #[serde(default, rename = "too-early-too-late")]
    too_early_too_late: Vec<StpaUca>,
    #[serde(default, rename = "stopped-too-soon")]
    stopped_too_soon: Vec<StpaUca>,
}

#[derive(Deserialize)]
struct StpaUca {
    id: String,
    description: String,
    #[serde(default)]
    context: Option<String>,
    #[serde(default)]
    hazards: Vec<String>,
    #[serde(default)]
    rationale: Option<String>,
}

fn parse_ucas(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = read_file(path)?;

    // Parse as a map to handle arbitrary "*-ucas" keys
    let map: BTreeMap<String, serde_yaml::Value> = serde_yaml::from_str(&content)?;

    let mut artifacts = Vec::new();

    for (key, value) in &map {
        if !key.ends_with("-ucas") {
            continue;
        }
        let group: UcaGroup = serde_yaml::from_value(value.clone())
            .map_err(|e| Error::Adapter(format!("parsing {}: {}", key, e)))?;

        let categories = [
            ("not-providing", &group.not_providing),
            ("providing", &group.providing),
            ("too-early-too-late", &group.too_early_too_late),
            ("stopped-too-soon", &group.stopped_too_soon),
        ];

        for (uca_type, ucas) in categories {
            for uca in ucas {
                let mut fields = BTreeMap::new();
                fields.insert(
                    "uca-type".into(),
                    serde_yaml::Value::String(uca_type.into()),
                );
                if let Some(ctx) = &uca.context {
                    fields.insert("context".into(), serde_yaml::Value::String(ctx.clone()));
                }
                if let Some(rat) = &uca.rationale {
                    fields.insert("rationale".into(), serde_yaml::Value::String(rat.clone()));
                }

                let mut links: Vec<Link> = uca
                    .hazards
                    .iter()
                    .map(|target| Link {
                        link_type: "leads-to-hazard".into(),
                        target: target.clone(),
                    })
                    .collect();

                links.push(Link {
                    link_type: "issued-by".into(),
                    target: group.controller.clone(),
                });

                artifacts.push(Artifact {
                    id: uca.id.clone(),
                    artifact_type: "uca".into(),
                    title: uca.description.clone(),
                    description: Some(uca.description.clone()),
                    status: None,
                    tags: vec![],
                    links,
                    fields,
                    source_file: None,
                });
            }
        }
    }

    Ok(artifacts)
}

// ── Controller constraints ───────────────────────────────────────────────

#[derive(Deserialize)]
struct ControllerConstraintsFile {
    #[serde(rename = "controller-constraints")]
    controller_constraints: Vec<StpaControllerConstraint>,
}

#[derive(Deserialize)]
struct StpaControllerConstraint {
    id: String,
    controller: String,
    constraint: String,
    ucas: Vec<String>,
    hazards: Vec<String>,
}

fn parse_controller_constraints(path: &Path) -> Result<Vec<Artifact>, Error> {
    let content = read_file(path)?;
    let file: ControllerConstraintsFile = serde_yaml::from_str(&content)?;

    Ok(file
        .controller_constraints
        .into_iter()
        .map(|cc| {
            let mut fields = BTreeMap::new();
            fields.insert(
                "constraint".into(),
                serde_yaml::Value::String(cc.constraint.clone()),
            );

            let mut links = Vec::new();
            links.push(Link {
                link_type: "constrains-controller".into(),
                target: cc.controller,
            });
            for uca in cc.ucas {
                links.push(Link {
                    link_type: "inverts-uca".into(),
                    target: uca,
                });
            }
            for hazard in cc.hazards {
                links.push(Link {
                    link_type: "prevents".into(),
                    target: hazard,
                });
            }

            Artifact {
                id: cc.id,
                artifact_type: "controller-constraint".into(),
                title: cc.constraint,
                description: None,
                status: None,
                tags: vec![],
                links,
                fields,
                source_file: None,
            }
        })
        .collect())
}

// ── Helpers ──────────────────────────────────────────────────────────────

fn read_file(path: &Path) -> Result<String, Error> {
    std::fs::read_to_string(path).map_err(|e| Error::Io(format!("{}: {}", path.display(), e)))
}
