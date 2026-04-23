//! `agent-pipelines:` schema-embedded block.
//!
//! Per-schema declaration of which oracles apply, how to rank gaps the
//! oracles surface, and what closure-routing rules govern the resulting
//! actions. Parsed from the schema YAML and used by `rivet close-gaps`
//! and `rivet pipelines {list,show,validate}`.
//!
//! Full shape (see docs/agent-pipelines.md once it exists):
//!
//! ```yaml
//! agent-pipelines:
//!   oracles:
//!     - id: structural-trace
//!       command: rivet validate
//!       applies-to: ["*"]
//!       fires-on: { exit-code: nonzero }
//!   pipelines:
//!     vmodel:
//!       uses-oracles: [structural-trace]
//!       rank-by:
//!         - when: { oracle: structural-trace, severity: error }
//!           weight: 50
//!       auto-close:
//!         - when: { oracle: structural-trace, closure-kind: link-existing }
//!           reviewers: [dev-team]
//!       human-review-required: []
//!       emit:
//!         trailer: "Implements: {target_id}"
//!         change-control: none
//! ```
//!
//! The parser is lenient on unknown fields (they parse as YAML values)
//! so a newer rivet can add fields without breaking an older consumer's
//! load of the schema. Semantic validation lives in the `validate()`
//! surface.

use std::collections::BTreeMap;
use std::path::Path;

use serde::{Deserialize, Serialize};

use crate::error::Error;

fn default_template_kind() -> String {
    "structural".to_string()
}

// ── Top-level block ────────────────────────────────────────────────────

/// The `agent-pipelines:` block as it appears inside a schema file.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct AgentPipelines {
    /// Oracle declarations. Each oracle is named and referenced by
    /// `uses-oracles:` in pipelines below.
    #[serde(default)]
    pub oracles: Vec<OracleDecl>,

    /// Named pipelines, each composing a subset of the oracles.
    #[serde(default)]
    pub pipelines: BTreeMap<String, PipelineDecl>,
}

// ── Oracle declaration ─────────────────────────────────────────────────

/// One oracle: a mechanical check with a command that fires or doesn't.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct OracleDecl {
    pub id: String,

    /// The command to execute. May contain placeholders like
    /// `{artifact_id}`, `{target_id}`, `{context.X.Y}`, `{project.X}`.
    pub command: String,

    /// Filter expression: which artifacts this oracle applies to.
    /// The wildcard form `["*"]` applies to every artifact; object form
    /// lets the oracle target by type, tag, status, etc.
    #[serde(default = "applies_to_all")]
    pub applies_to: AppliesTo,

    /// Short description for `rivet pipelines show`.
    #[serde(default)]
    pub description: String,

    /// Attributes required on the artifact for the oracle to run.
    #[serde(default)]
    pub required_attributes: Vec<String>,

    /// Oracle-specific firing condition override.
    #[serde(default)]
    pub fires_on: FiresOn,
}

fn applies_to_all() -> AppliesTo {
    AppliesTo::Wildcard
}

/// Filter expression for `applies-to:`.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum AppliesTo {
    /// The literal string `"*"` or the sequence `["*"]` — applies to every artifact.
    Wildcard,
    /// List of type names, e.g. `["requirement", "design-decision"]`.
    TypeList(Vec<String>),
    /// Map form with type / tag / status / conditions predicates.
    Map(BTreeMap<String, serde_yaml::Value>),
}

impl Default for AppliesTo {
    fn default() -> Self {
        AppliesTo::Wildcard
    }
}

/// Firing condition for the oracle's command.
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct FiresOn {
    /// Exit-code-based firing: `"zero"`, `"nonzero"`, or a specific integer.
    #[serde(default)]
    pub exit_code: Option<ExitCodeCondition>,

    /// Named firing reasons, propagated to `oracle-firings.json` when the
    /// oracle reports the matching reason in its JSON output.
    #[serde(default)]
    pub reasons: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(untagged)]
pub enum ExitCodeCondition {
    Named(String), // "zero" | "nonzero"
    Specific(i32),
}

// ── Pipeline declaration ───────────────────────────────────────────────

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct PipelineDecl {
    /// Human-readable description for `rivet pipelines show`.
    #[serde(default)]
    pub description: String,

    /// Which prompt-template kind drives this pipeline's discover/validate/
    /// emit sub-agents. Resolves against the embedded set
    /// (`rivet_core::templates::list_kinds`) and against project overrides
    /// under `.rivet/templates/pipelines/<kind>/`. Defaults to
    /// `"structural"` — the rivet-authored kind.
    #[serde(default = "default_template_kind")]
    pub template_kind: String,

    /// Which oracles this pipeline composes. Each entry must match an
    /// `oracles[].id`. Unknown oracle references are a validation error.
    #[serde(default)]
    pub uses_oracles: Vec<String>,

    /// Ranking rules. Ordered; first matching rule contributes a weight.
    #[serde(default)]
    pub rank_by: Vec<RankRule>,

    /// Auto-close rules: gaps matching these bypass human review.
    #[serde(default)]
    pub auto_close: Vec<RoutingRule>,

    /// Human-review-required rules: gaps matching these are drafted as
    /// PRs awaiting human approval; not auto-committed.
    #[serde(default)]
    pub human_review_required: Vec<RoutingRule>,

    /// Emission policy for closures from this pipeline.
    #[serde(default)]
    pub emit: EmitPolicy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct RankRule {
    /// Match clause — which oracle firing does this rule apply to.
    pub when: MatchClause,
    /// Weight contributed to the gap's overall ranking score.
    pub weight: i32,
    /// Human-readable label shown in `rivet pipelines show` and in runs.
    #[serde(default)]
    pub label: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct RoutingRule {
    pub when: MatchClause,
    /// Reviewer groups; placeholders like `{context.review-roles.X}`
    /// resolve against `.rivet/context/review-roles.yaml` at dispatch time.
    #[serde(default)]
    pub reviewers: Vec<String>,
    /// Template path (relative to `.rivet/templates/`) for a stub artifact
    /// to scaffold when the gap requires drafting.
    #[serde(default)]
    pub draft_template: Option<String>,
    /// Override the emit policy for gaps matched by this rule.
    #[serde(default)]
    pub change_control: Option<ChangeControl>,
}

/// The `when:` clause — a bag of keys the parser keeps tolerant.
/// Supported keys today: `oracle`, `rule`, `severity`, `fires-on`,
/// `closure-kind`, `artifact-type`, `variant`, `tag`, `field`.
pub type MatchClause = BTreeMap<String, serde_yaml::Value>;

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub struct EmitPolicy {
    /// Commit-message trailer format; placeholders resolve at emit time.
    #[serde(default)]
    pub trailer: Option<String>,
    /// Change-control requirement: `none`, `pr-review`, `change-request`.
    #[serde(default)]
    pub change_control: Option<ChangeControl>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "kebab-case")]
pub enum ChangeControl {
    None,
    PrReview,
    ChangeRequest,
}

// ── Parsing + validation ───────────────────────────────────────────────

impl AgentPipelines {
    /// Parse an `agent-pipelines:` block from YAML. Typically the caller
    /// has already extracted the block via serde's `#[serde(flatten)]`
    /// or by reading the schema top-level; this is the fallback when
    /// the block is standalone.
    pub fn from_yaml(yaml: &str) -> Result<Self, Error> {
        serde_yaml::from_str(yaml)
            .map_err(|e| Error::Schema(format!("agent-pipelines: {e}")))
    }

    /// Validate internal consistency: every oracle referenced by
    /// `uses-oracles:` must exist; every `when.oracle` must reference an
    /// oracle used by the pipeline.
    pub fn validate(&self) -> Result<(), Vec<String>> {
        let mut errors = Vec::new();
        let known_oracles: std::collections::HashSet<&str> =
            self.oracles.iter().map(|o| o.id.as_str()).collect();

        // Duplicate oracle ids
        let mut seen = std::collections::HashSet::new();
        for o in &self.oracles {
            if !seen.insert(o.id.as_str()) {
                errors.push(format!("duplicate oracle id: `{}`", o.id));
            }
            if o.command.trim().is_empty() {
                errors.push(format!(
                    "oracle `{}` has empty command — oracles must declare an executable command",
                    o.id
                ));
            }
        }

        // Pipeline references
        for (name, pipeline) in &self.pipelines {
            for oracle_ref in &pipeline.uses_oracles {
                if !known_oracles.contains(oracle_ref.as_str()) {
                    errors.push(format!(
                        "pipeline `{name}` references unknown oracle `{oracle_ref}`"
                    ));
                }
            }

            // when.oracle references
            let mut validate_when = |rule_kind: &str, idx: usize, when: &MatchClause| {
                if let Some(serde_yaml::Value::String(oracle_ref)) = when.get("oracle") {
                    if !known_oracles.contains(oracle_ref.as_str()) {
                        errors.push(format!(
                            "pipeline `{name}` {rule_kind}[{idx}] references unknown oracle `{oracle_ref}`"
                        ));
                    }
                    if !pipeline.uses_oracles.iter().any(|u| u == oracle_ref) {
                        errors.push(format!(
                            "pipeline `{name}` {rule_kind}[{idx}] references oracle `{oracle_ref}` not listed in uses-oracles"
                        ));
                    }
                }
            };
            for (i, r) in pipeline.rank_by.iter().enumerate() {
                validate_when("rank-by", i, &r.when);
            }
            for (i, r) in pipeline.auto_close.iter().enumerate() {
                validate_when("auto-close", i, &r.when);
            }
            for (i, r) in pipeline.human_review_required.iter().enumerate() {
                validate_when("human-review-required", i, &r.when);
            }
        }

        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Like `validate`, but additionally rejects any pipeline whose
    /// `template-kind:` is neither built-in
    /// (`rivet_core::templates::list_kinds`) nor present as a project
    /// override directory under `.rivet/templates/pipelines/<kind>/`.
    ///
    /// Use this from `rivet pipelines validate` and other CLI sites that
    /// have a project root in hand. The plain `validate()` is for unit
    /// tests and any caller that doesn't yet know its project root.
    pub fn validate_with_project(&self, project_root: &Path) -> Result<(), Vec<String>> {
        let mut errors = match self.validate() {
            Ok(()) => Vec::new(),
            Err(e) => e,
        };
        for (name, pipeline) in &self.pipelines {
            if !crate::templates::kind_is_known(project_root, &pipeline.template_kind) {
                let known = crate::templates::list_kinds().join(", ");
                errors.push(format!(
                    "pipeline `{name}` declares unknown template-kind `{}` — \
                     known built-ins: [{}]; project overrides live under \
                     .rivet/templates/pipelines/<kind>/",
                    pipeline.template_kind, known
                ));
            }
        }
        if errors.is_empty() {
            Ok(())
        } else {
            Err(errors)
        }
    }

    /// Enumerate (oracle_id, schema_name) for use in runs.
    pub fn oracle_ids(&self) -> impl Iterator<Item = &str> {
        self.oracles.iter().map(|o| o.id.as_str())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_minimal() {
        let yaml = r#"
oracles:
  - id: structural-trace
    command: rivet validate
    applies-to: ["*"]
pipelines:
  vmodel:
    uses-oracles: [structural-trace]
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        assert_eq!(p.oracles.len(), 1);
        assert_eq!(p.oracles[0].id, "structural-trace");
        assert_eq!(p.pipelines["vmodel"].uses_oracles, vec!["structural-trace"]);
    }

    #[test]
    fn parse_full_dev_schema_pipeline() {
        let yaml = r#"
oracles:
  - id: structural-trace
    command: rivet validate
    applies-to: ["*"]
    description: "rivet schema validator"
    fires-on: { exit-code: nonzero }
pipelines:
  vmodel:
    description: "Traceability and structural gaps"
    uses-oracles: [structural-trace]
    rank-by:
      - when: { oracle: structural-trace, severity: error }
        weight: 50
        label: "schema error"
      - when: { oracle: structural-trace, severity: warning }
        weight: 5
    auto-close:
      - when: { oracle: structural-trace, closure-kind: link-existing }
        reviewers: ["{context.review-roles.dev-team}"]
    human-review-required:
      - when: { oracle: structural-trace, closure-kind: draft-required }
        reviewers: ["{context.review-roles.dev-team}"]
        draft-template: templates/stubs/requirement.yaml.tmpl
    emit:
      trailer: "Implements: {target_id}"
      change-control: none
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        assert_eq!(p.oracles[0].description, "rivet schema validator");
        let pipeline = &p.pipelines["vmodel"];
        assert_eq!(pipeline.rank_by.len(), 2);
        assert_eq!(pipeline.rank_by[0].weight, 50);
        assert_eq!(pipeline.auto_close.len(), 1);
        assert_eq!(pipeline.human_review_required.len(), 1);
        assert_eq!(
            pipeline.human_review_required[0]
                .draft_template
                .as_deref()
                .unwrap(),
            "templates/stubs/requirement.yaml.tmpl"
        );
        assert_eq!(pipeline.emit.change_control, Some(ChangeControl::None));
    }

    #[test]
    fn validate_rejects_unknown_oracle_reference() {
        let yaml = r#"
oracles:
  - id: structural-trace
    command: rivet validate
pipelines:
  vmodel:
    uses-oracles: [structural-trace, does-not-exist]
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        let err = p.validate().unwrap_err();
        assert!(
            err.iter().any(|m| m.contains("does-not-exist")),
            "errors: {err:?}"
        );
    }

    #[test]
    fn validate_rejects_duplicate_oracle_id() {
        let yaml = r#"
oracles:
  - id: dup
    command: a
  - id: dup
    command: b
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        let err = p.validate().unwrap_err();
        assert!(err.iter().any(|m| m.contains("duplicate oracle id")));
    }

    #[test]
    fn validate_rejects_empty_command() {
        let yaml = r#"
oracles:
  - id: noop
    command: "   "
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        let err = p.validate().unwrap_err();
        assert!(err.iter().any(|m| m.contains("empty command")));
    }

    #[test]
    fn validate_rejects_when_oracle_not_in_uses() {
        let yaml = r#"
oracles:
  - id: a
    command: cmda
  - id: b
    command: cmdb
pipelines:
  vmodel:
    uses-oracles: [a]
    rank-by:
      - when: { oracle: b, severity: error }
        weight: 10
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        let err = p.validate().unwrap_err();
        assert!(
            err.iter().any(|m| m.contains("not listed in uses-oracles")),
            "errors: {err:?}"
        );
    }

    #[test]
    fn template_kind_defaults_to_structural() {
        let yaml = r#"
oracles:
  - id: o1
    command: cmd
pipelines:
  p:
    uses-oracles: [o1]
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        assert_eq!(p.pipelines["p"].template_kind, "structural");
    }

    #[test]
    fn template_kind_round_trips_explicit_value() {
        let yaml = r#"
oracles:
  - id: o1
    command: cmd
pipelines:
  p:
    uses-oracles: [o1]
    template-kind: discovery
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        assert_eq!(p.pipelines["p"].template_kind, "discovery");
    }

    #[test]
    fn validate_with_project_rejects_unknown_template_kind() {
        let yaml = r#"
oracles:
  - id: o1
    command: cmd
pipelines:
  p:
    uses-oracles: [o1]
    template-kind: not-a-real-kind
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        let tmp = tempfile::tempdir().unwrap();
        let err = p.validate_with_project(tmp.path()).unwrap_err();
        assert!(
            err.iter().any(|m| m.contains("not-a-real-kind")),
            "errors: {err:?}"
        );
    }

    #[test]
    fn validate_with_project_accepts_project_override_kind() {
        let yaml = r#"
oracles:
  - id: o1
    command: cmd
pipelines:
  p:
    uses-oracles: [o1]
    template-kind: custom-kind
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        let tmp = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(tmp.path().join(".rivet/templates/pipelines/custom-kind")).unwrap();
        assert!(p.validate_with_project(tmp.path()).is_ok());
    }

    #[test]
    fn unknown_field_is_tolerated() {
        // Forward-compat: a rivet 0.5 schema that adds a field must not
        // break a rivet 0.4 consumer's parse.
        let yaml = r#"
oracles:
  - id: o1
    command: cmd
    future-field-we-dont-know: 42
pipelines:
  p:
    uses-oracles: [o1]
    another-future-field: whatever
"#;
        let p = AgentPipelines::from_yaml(yaml).unwrap();
        assert_eq!(p.oracles.len(), 1);
    }
}
