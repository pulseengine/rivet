//! Variant discovery and scoping for the `rivet serve` dashboard.
//!
//! This module auto-discovers a project's feature model, binding, and
//! variant configurations from disk, then provides a read-only scoping
//! API that filters an in-memory `Store` + `LinkGraph` down to the
//! artifacts bound to the features effective in a given variant.
//!
//! Discovery is intentionally thin and convention-based:
//!
//! * Feature model — first file matched by any of
//!   `artifacts/feature-model.yaml`, `artifacts/feature_model.yaml`,
//!   `<source>/feature-model.yaml` (for every `source.path` in
//!   `rivet.yaml`).
//! * Binding — first file matched by any of `artifacts/bindings.yaml`,
//!   `artifacts/feature-bindings.yaml`, `<source>/bindings.yaml`.
//! * Variants — every YAML file under `artifacts/variants/` (or
//!   `<source>/variants/`) whose content parses as a `VariantConfig`.
//!
//! Missing feature model → `ProjectVariants::None`. Every view still
//! renders; the dropdown and `/variants` page emit a friendly hint.

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

use std::collections::BTreeSet;
use std::path::{Path, PathBuf};

use rivet_core::feature_model::{
    FeatureBinding, FeatureModel, ResolvedVariant, VariantConfig, solve,
};
use rivet_core::model::ProjectConfig;

/// Project-level variant configuration loaded from disk.
#[derive(Debug, Clone, Default)]
#[allow(dead_code)]
pub(crate) struct ProjectVariants {
    /// Path to the feature model (for display only).
    pub(crate) model_path: Option<PathBuf>,
    /// Parsed feature model, if one was found.
    pub(crate) model: Option<FeatureModel>,
    /// Path to the binding file (for display only).
    pub(crate) binding_path: Option<PathBuf>,
    /// Parsed feature-binding, if present.
    pub(crate) binding: Option<FeatureBinding>,
    /// All discovered variants, sorted by name.
    pub(crate) variants: Vec<VariantConfig>,
}

impl ProjectVariants {
    /// Load the feature model + binding + variant configs using the
    /// discovery conventions described in the module docstring.
    ///
    /// Always returns a `ProjectVariants` — missing files simply produce
    /// `None` fields, so callers can render "no variants configured"
    /// without additional branching.
    pub(crate) fn discover(project_path: &Path, config: &ProjectConfig) -> Self {
        let mut roots: Vec<PathBuf> = Vec::new();
        roots.push(project_path.join("artifacts"));
        for s in &config.sources {
            let p = project_path.join(&s.path);
            if !roots.contains(&p) {
                roots.push(p);
            }
        }
        // Always check the project root itself too, so a bare
        // `feature-model.yaml` alongside `rivet.yaml` is discovered.
        let proj_buf = project_path.to_path_buf();
        if !roots.contains(&proj_buf) {
            roots.push(proj_buf);
        }

        let model_candidates = ["feature-model.yaml", "feature_model.yaml"];
        let (model_path, model) = roots
            .iter()
            .flat_map(|r| model_candidates.iter().map(move |n| r.join(n)))
            .find(|p| p.is_file())
            .and_then(|p| {
                std::fs::read_to_string(&p).ok().and_then(|y| {
                    FeatureModel::from_yaml(&y)
                        .ok()
                        .map(|m| (Some(p.clone()), Some(m)))
                })
            })
            .unwrap_or((None, None));

        let binding_candidates = ["bindings.yaml", "feature-bindings.yaml"];
        let (binding_path, binding) = roots
            .iter()
            .flat_map(|r| binding_candidates.iter().map(move |n| r.join(n)))
            .find(|p| p.is_file())
            .and_then(|p| {
                std::fs::read_to_string(&p)
                    .ok()
                    .and_then(|y| serde_yaml::from_str::<FeatureBinding>(&y).ok())
                    .map(|b| (Some(p), Some(b)))
            })
            .unwrap_or((None, None));

        let mut variants: Vec<VariantConfig> = Vec::new();
        for root in &roots {
            let vdir = root.join("variants");
            if !vdir.is_dir() {
                continue;
            }
            let entries = match std::fs::read_dir(&vdir) {
                Ok(e) => e,
                Err(_) => continue,
            };
            for entry in entries.flatten() {
                let path = entry.path();
                let is_yaml = path
                    .extension()
                    .and_then(|e| e.to_str())
                    .is_some_and(|e| e == "yaml" || e == "yml");
                if !is_yaml || !path.is_file() {
                    continue;
                }
                if let Ok(yaml) = std::fs::read_to_string(&path) {
                    if let Ok(vc) = serde_yaml::from_str::<VariantConfig>(&yaml) {
                        // dedup by name — first hit wins
                        if !variants.iter().any(|v| v.name == vc.name) {
                            variants.push(vc);
                        }
                    }
                }
            }
        }
        variants.sort_by(|a, b| a.name.cmp(&b.name));

        Self {
            model_path,
            model,
            binding_path,
            binding,
            variants,
        }
    }

    /// Whether a feature model was discovered (dashboard dropdown is
    /// hidden when this is false).
    pub(crate) fn has_model(&self) -> bool {
        self.model.is_some()
    }

    /// Total declared variants.
    #[allow(dead_code)]
    pub(crate) fn variant_count(&self) -> usize {
        self.variants.len()
    }

    /// Lookup a variant by name.
    pub(crate) fn get(&self, name: &str) -> Option<&VariantConfig> {
        self.variants.iter().find(|v| v.name == name)
    }

    /// Resolve a variant against the feature model, returning the
    /// effective feature set plus bound artifact IDs.
    ///
    /// Returns `Err(message)` when:
    /// * no feature model is configured, or
    /// * the requested variant doesn't exist, or
    /// * the variant fails solver checks.
    pub(crate) fn resolve(&self, name: &str) -> Result<ResolvedScope, String> {
        let model = self
            .model
            .as_ref()
            .ok_or_else(|| "no feature model configured for this project".to_string())?;
        let vc = self
            .get(name)
            .ok_or_else(|| format!("variant '{name}' not found"))?;
        let resolved = solve(model, vc).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| format!("{e:?}")).collect();
            format!("variant '{}': {}", name, msgs.join("; "))
        })?;
        let artifact_ids = collect_bound_ids(&resolved, self.binding.as_ref());
        Ok(ResolvedScope {
            resolved,
            artifact_ids,
        })
    }

    /// Attempt to resolve a variant purely for diagnostic purposes,
    /// returning whether the solver passed (used by the `/variants`
    /// overview page).
    pub(crate) fn validation_status(&self, name: &str) -> VariantStatus {
        let Some(ref model) = self.model else {
            return VariantStatus::NoModel;
        };
        let Some(vc) = self.get(name) else {
            return VariantStatus::Missing;
        };
        match solve(model, vc) {
            Ok(r) => {
                let ids = collect_bound_ids(&r, self.binding.as_ref());
                VariantStatus::Pass {
                    feature_count: r.effective_features.len(),
                    artifact_count: ids.len(),
                }
            }
            Err(errs) => VariantStatus::Fail(errs.iter().map(|e| format!("{e:?}")).collect()),
        }
    }
}

/// Result of resolving a variant against a feature model + binding.
#[derive(Debug, Clone)]
pub(crate) struct ResolvedScope {
    pub(crate) resolved: ResolvedVariant,
    /// Artifact IDs in scope for this variant (from binding).
    pub(crate) artifact_ids: BTreeSet<String>,
}

/// Coarse validation outcome displayed on the `/variants` overview.
#[derive(Debug, Clone)]
pub(crate) enum VariantStatus {
    Pass {
        feature_count: usize,
        artifact_count: usize,
    },
    Fail(Vec<String>),
    /// Variant name couldn't be resolved back to a loaded config.
    Missing,
    /// No feature model was discovered — nothing to check against.
    NoModel,
}

fn collect_bound_ids(
    resolved: &ResolvedVariant,
    binding: Option<&FeatureBinding>,
) -> BTreeSet<String> {
    let Some(b) = binding else {
        return BTreeSet::new();
    };
    resolved
        .effective_features
        .iter()
        .flat_map(|f| {
            b.bindings
                .get(f)
                .map(|bind| bind.artifacts.clone())
                .unwrap_or_default()
        })
        .collect()
}

#[cfg(test)]
mod tests {
    use super::*;
    use rivet_core::model::{ProjectMetadata, SourceConfig};
    use std::fs;
    use std::io::Write;

    fn tmpdir() -> tempfile::TempDir {
        tempfile::tempdir().expect("tempdir")
    }

    fn write(path: &Path, body: &str) {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent).expect("mkdir");
        }
        let mut f = fs::File::create(path).expect("create");
        f.write_all(body.as_bytes()).expect("write");
    }

    fn empty_cfg() -> ProjectConfig {
        ProjectConfig {
            project: ProjectMetadata {
                name: "t".into(),
                version: None,
                schemas: vec![],
            },
            sources: vec![SourceConfig {
                path: "artifacts".into(),
                format: "generic-yaml".into(),
                adapter: None,
                config: Default::default(),
            }],
            docs: vec![],
            results: None,
            commits: None,
            externals: None,
            baselines: None,
            docs_check: None,
        }
    }

    const FM: &str = "kind: feature-model\nroot: r\nfeatures:\n  r:\n    group: or\n    children: [a, b]\n  a:\n    group: leaf\n  b:\n    group: leaf\n";
    const BIND: &str = "bindings:\n  a:\n    artifacts: [A-1]\n  b:\n    artifacts: [B-1, B-2]\n";
    const VAR_A: &str = "name: only-a\nselects: [a]\n";
    const VAR_B: &str = "name: only-b\nselects: [b]\n";

    #[test]
    fn discover_missing_files_returns_empty() {
        let dir = tmpdir();
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        assert!(!pv.has_model());
        assert_eq!(pv.variant_count(), 0);
    }

    #[test]
    fn discover_loads_all_three() {
        let dir = tmpdir();
        write(&dir.path().join("artifacts/feature-model.yaml"), FM);
        write(&dir.path().join("artifacts/bindings.yaml"), BIND);
        write(&dir.path().join("artifacts/variants/only-a.yaml"), VAR_A);
        write(&dir.path().join("artifacts/variants/only-b.yaml"), VAR_B);
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        assert!(pv.has_model());
        assert_eq!(pv.variant_count(), 2);
        let names: Vec<&str> = pv.variants.iter().map(|v| v.name.as_str()).collect();
        assert_eq!(names, vec!["only-a", "only-b"]);
    }

    #[test]
    fn resolve_returns_bound_ids() {
        let dir = tmpdir();
        write(&dir.path().join("artifacts/feature-model.yaml"), FM);
        write(&dir.path().join("artifacts/bindings.yaml"), BIND);
        write(&dir.path().join("artifacts/variants/only-b.yaml"), VAR_B);
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        let scope = pv.resolve("only-b").expect("solve");
        assert_eq!(scope.artifact_ids.len(), 2);
        assert!(scope.artifact_ids.contains("B-1"));
        assert!(scope.artifact_ids.contains("B-2"));
        assert!(!scope.artifact_ids.contains("A-1"));
    }

    #[test]
    fn resolve_unknown_name_errors() {
        let dir = tmpdir();
        write(&dir.path().join("artifacts/feature-model.yaml"), FM);
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        assert!(pv.resolve("nope").is_err());
    }

    #[test]
    fn resolve_without_model_errors() {
        let dir = tmpdir();
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        assert!(pv.resolve("anything").is_err());
    }
}
