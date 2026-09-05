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

use std::collections::{BTreeMap, BTreeSet};
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
    /// Parsed project-level feature-binding (`bindings.yaml`), if present.
    pub(crate) binding: Option<FeatureBinding>,
    /// Per-variant bindings embedded in the variant file itself
    /// (`bindings:` section alongside the variant's `name:`/`selects:`),
    /// keyed by variant name. Preferred over the project-level binding
    /// when resolving scope, so a self-contained variant file resolves
    /// without a separate `bindings.yaml`. REQ-106.
    pub(crate) variant_bindings: BTreeMap<String, FeatureBinding>,
    /// All discovered variants, sorted by name.
    pub(crate) variants: Vec<VariantConfig>,
    /// Parse error captured when a feature-model file EXISTS on disk but
    /// fails to parse/compose. When this is `Some`, `model` is `None` but
    /// the project is NOT model-less: the model is present but broken, and
    /// `resolve()` returns this message instead of the misleading
    /// "no feature model configured" (REQ-260).
    pub(crate) model_error: Option<String>,
    /// Human-readable diagnostics for config files that were present on
    /// disk but failed to parse (feature model, binding, or a variant
    /// file). Surfaced to the dashboard and logged on load so a broken
    /// config never silently degrades to `None` (REQ-260).
    pub(crate) diagnostics: Vec<String>,
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

        let mut diagnostics: Vec<String> = Vec::new();

        // Feature model. Use `FeatureModel::load`, not `from_yaml`, so a
        // composed `kind: feature-model-binding` file named
        // feature-model.yaml is composed rather than rejected (REQ-262).
        // If the file EXISTS but fails to parse/compose, capture the error
        // in `model_error` (and `diagnostics`) instead of silently dropping
        // to `None` — a broken model must not masquerade as an absent one
        // (REQ-260).
        let model_candidates = ["feature-model.yaml", "feature_model.yaml"];
        let (model_path, model, model_error) = match roots
            .iter()
            .flat_map(|r| model_candidates.iter().map(move |n| r.join(n)))
            .find(|p| p.is_file())
        {
            Some(p) => match FeatureModel::load(&p) {
                Ok(m) => (Some(p), Some(m), None),
                Err(e) => {
                    let msg = format!("feature model {} failed to parse: {e}", p.display());
                    diagnostics.push(msg.clone());
                    (Some(p), None, Some(msg))
                }
            },
            None => (None, None, None),
        };

        // Project-level binding. A present-but-malformed binding is captured
        // as a diagnostic rather than silently becoming `None` (which would
        // render variants with `artifact_count: 0` and no explanation) —
        // REQ-260.
        let binding_candidates = ["bindings.yaml", "feature-bindings.yaml"];
        let (binding_path, binding) = match roots
            .iter()
            .flat_map(|r| binding_candidates.iter().map(move |n| r.join(n)))
            .find(|p| p.is_file())
        {
            Some(p) => match std::fs::read_to_string(&p) {
                Ok(y) => match serde_yaml::from_str::<FeatureBinding>(&y) {
                    Ok(b) => (Some(p), Some(b)),
                    Err(e) => {
                        diagnostics.push(format!("binding {} failed to parse: {e}", p.display()));
                        (Some(p), None)
                    }
                },
                Err(e) => {
                    diagnostics.push(format!("binding {} could not be read: {e}", p.display()));
                    (Some(p), None)
                }
            },
            None => (None, None),
        };

        let mut variants: Vec<VariantConfig> = Vec::new();
        let mut variant_bindings: BTreeMap<String, FeatureBinding> = BTreeMap::new();
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
                    // REQ-262: accept BOTH the flat shape and the
                    // `variant:`-wrapped shape that `rivet variant init`
                    // scaffolds (feature-model-bindings form). Raw
                    // `serde_yaml::from_str::<VariantConfig>` only accepted
                    // the flat shape, so init-scaffolded variant files were
                    // silently invisible on the serve dashboard (#514
                    // regression on the serve path).
                    match VariantConfig::from_yaml_str(&yaml) {
                        Ok(vc) => {
                            // dedup by name — first hit wins
                            if !variants.iter().any(|v| v.name == vc.name) {
                                // REQ-106: a variant file may embed its own
                                // `bindings:` section (it IS its own binding
                                // model). Capture it so scope resolves without
                                // a separate bindings.yaml — mirrors the CLI's
                                // `variant solve --binding <variant-file>`.
                                if let Ok(fb) = serde_yaml::from_str::<FeatureBinding>(&yaml) {
                                    if !fb.bindings.is_empty() {
                                        variant_bindings.insert(vc.name.clone(), fb);
                                    }
                                }
                                variants.push(vc);
                            }
                        }
                        Err(e) => {
                            // REQ-260: a variant file present on disk that
                            // fails to parse is captured, not dropped — it
                            // would otherwise silently vanish from the
                            // dashboard.
                            diagnostics
                                .push(format!("variant {} failed to parse: {e}", path.display()));
                        }
                    }
                }
            }
        }
        variants.sort_by(|a, b| a.name.cmp(&b.name));

        // Surface every captured diagnostic to the server log so a broken
        // config is visible even to an operator who never opens the
        // dashboard (REQ-260).
        for d in &diagnostics {
            log::warn!("variant discovery: {d}");
        }

        Self {
            model_path,
            model,
            binding_path,
            binding,
            variant_bindings,
            variants,
            model_error,
            diagnostics,
        }
    }

    /// The binding to use when resolving `name`: the variant's own
    /// embedded `bindings:` if present (REQ-106), else the project-level
    /// `bindings.yaml`.
    fn binding_for(&self, name: &str) -> Option<&FeatureBinding> {
        self.variant_bindings.get(name).or(self.binding.as_ref())
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
        // REQ-260: distinguish "model file present but broken" (return the
        // parse error) from "no model file at all" (the friendly hint). A
        // broken config must NOT masquerade as an absent one.
        let model = match self.model.as_ref() {
            Some(m) => m,
            None => {
                return Err(self.model_error.clone().unwrap_or_else(|| {
                    "no feature model configured for this project".to_string()
                }));
            }
        };
        let vc = self
            .get(name)
            .ok_or_else(|| format!("variant '{name}' not found"))?;
        let resolved = solve(model, vc).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| format!("{e:?}")).collect();
            format!("variant '{}': {}", name, msgs.join("; "))
        })?;
        let artifact_ids = collect_bound_ids(&resolved, self.binding_for(name));
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
                let ids = collect_bound_ids(&r, self.binding_for(name));
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
            coverage: None,
            project: ProjectMetadata {
                name: "t".into(),
                version: None,
                schemas: vec![],
                schema_pins: std::collections::BTreeMap::new(),
            },
            sources: vec![SourceConfig {
                path: "artifacts".into(),
                format: "generic-yaml".into(),
                adapter: None,
                layout: Default::default(),
                config: Default::default(),
            }],
            docs: vec![],
            results: None,
            commits: None,
            release: None,
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

    /// REQ-106: a variant file that embeds its own `bindings:` section
    /// resolves to the correct bound artifacts even with NO separate
    /// `bindings.yaml`. Before the fix the dashboard reported
    /// `bound_artifact_count: 0` for such self-contained variant files
    /// (it only consulted a project-level binding).
    #[test]
    fn resolve_uses_binding_embedded_in_variant_file() {
        let dir = tmpdir();
        write(&dir.path().join("artifacts/feature-model.yaml"), FM);
        // NO artifacts/bindings.yaml — the binding is embedded in the
        // variant file itself, alongside name/selects.
        let embedded = "name: only-b\nselects: [b]\nbindings:\n  b:\n    artifacts: [B-1, B-2]\n";
        write(&dir.path().join("artifacts/variants/only-b.yaml"), embedded);
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        assert!(
            pv.binding.is_none(),
            "no project-level bindings.yaml exists"
        );

        let scope = pv.resolve("only-b").expect("solve");
        assert_eq!(
            scope.artifact_ids.len(),
            2,
            "embedded binding must resolve bound artifacts (REQ-106)"
        );
        assert!(scope.artifact_ids.contains("B-1"));
        assert!(scope.artifact_ids.contains("B-2"));

        // validation_status (the /variants overview path) must agree.
        match pv.validation_status("only-b") {
            VariantStatus::Pass { artifact_count, .. } => {
                assert_eq!(artifact_count, 2, "overview count must match resolve()");
            }
            other => panic!("expected Pass, got {other:?}"),
        }
    }

    /// REQ-260: a feature-model.yaml that EXISTS but is malformed must be
    /// captured as a diagnostic + `model_error`, and `resolve()` must
    /// return that parse error — NOT the misleading "no feature model
    /// configured" message (a broken config is not an absent one).
    #[test]
    fn discover_broken_model_records_diagnostic_and_resolve_reports_parse_error() {
        let dir = tmpdir();
        // Malformed YAML (unterminated flow sequence) — file present, unparseable.
        write(
            &dir.path().join("artifacts/feature-model.yaml"),
            "kind: feature-model\nroot: r\nfeatures: [: : :\n",
        );
        write(&dir.path().join("artifacts/variants/only-a.yaml"), VAR_A);
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());

        // Model file was present but broken.
        assert!(!pv.has_model(), "broken model must not count as loaded");
        assert!(
            pv.model_path.is_some(),
            "the broken file's path is still recorded"
        );
        assert!(pv.model_error.is_some(), "parse error captured");
        assert!(
            pv.diagnostics.iter().any(|d| d.contains("failed to parse")),
            "diagnostic recorded, got {:?}",
            pv.diagnostics
        );

        // resolve() must surface the parse error, NOT the absent-model hint.
        let err = pv.resolve("only-a").expect_err("broken model → Err");
        assert!(
            err.contains("failed to parse"),
            "resolve must report the parse error, got: {err}"
        );
        assert!(
            !err.contains("no feature model configured"),
            "a broken model must NOT masquerade as an absent one, got: {err}"
        );
    }

    /// REQ-260 companion: a genuinely ABSENT model still yields the friendly
    /// "no feature model configured" message (broken vs absent stay
    /// distinct).
    #[test]
    fn discover_absent_model_still_reports_absent_message() {
        let dir = tmpdir();
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        assert!(pv.model_error.is_none());
        let err = pv.resolve("anything").expect_err("no model → Err");
        assert!(
            err.contains("no feature model configured"),
            "absent model keeps the friendly hint, got: {err}"
        );
    }

    /// REQ-262: a `variant:`-WRAPPED variant file — the shape `rivet variant
    /// init` scaffolds — must be discovered. Raw
    /// `serde_yaml::from_str::<VariantConfig>` only accepted the flat shape,
    /// so init-scaffolded files were silently invisible on the dashboard
    /// (#514 regression on the serve path).
    #[test]
    fn discover_accepts_wrapped_variant_shape() {
        let dir = tmpdir();
        write(&dir.path().join("artifacts/feature-model.yaml"), FM);
        // The wrapped shape: name/selects live under `variant:`, alongside a
        // top-level `bindings:` — exactly what `rivet variant init` writes.
        let wrapped = "variant:\n  name: wrapped-b\n  selects: [b]\nbindings:\n  b:\n    artifacts: [B-1, B-2]\n";
        write(
            &dir.path().join("artifacts/variants/wrapped-b.yaml"),
            wrapped,
        );
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());

        let names: Vec<&str> = pv.variants.iter().map(|v| v.name.as_str()).collect();
        assert_eq!(
            names,
            vec!["wrapped-b"],
            "wrapped variant file must be discovered (REQ-262)"
        );

        // The embedded binding still resolves (REQ-106 path unaffected).
        let scope = pv.resolve("wrapped-b").expect("solve");
        assert_eq!(scope.artifact_ids.len(), 2);
        assert!(scope.artifact_ids.contains("B-1"));
        assert!(scope.artifact_ids.contains("B-2"));
    }

    /// REQ-262 regression guard: the FLAT shape still discovers and resolves
    /// (from_yaml_str must not break the pre-existing path).
    #[test]
    fn discover_flat_variant_still_works() {
        let dir = tmpdir();
        write(&dir.path().join("artifacts/feature-model.yaml"), FM);
        write(&dir.path().join("artifacts/bindings.yaml"), BIND);
        write(&dir.path().join("artifacts/variants/only-a.yaml"), VAR_A);
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        assert_eq!(pv.variant_count(), 1);
        assert!(pv.diagnostics.is_empty(), "clean config → no diagnostics");
        let scope = pv.resolve("only-a").expect("solve");
        assert_eq!(scope.artifact_ids.len(), 1);
        assert!(scope.artifact_ids.contains("A-1"));
    }

    /// REQ-106: a project-level `bindings.yaml` still works (and an
    /// embedded binding takes precedence when both exist).
    #[test]
    fn project_binding_still_used_when_no_embedded() {
        let dir = tmpdir();
        write(&dir.path().join("artifacts/feature-model.yaml"), FM);
        write(&dir.path().join("artifacts/bindings.yaml"), BIND);
        write(&dir.path().join("artifacts/variants/only-a.yaml"), VAR_A);
        let pv = ProjectVariants::discover(dir.path(), &empty_cfg());
        let scope = pv.resolve("only-a").expect("solve");
        assert_eq!(scope.artifact_ids.len(), 1);
        assert!(scope.artifact_ids.contains("A-1"));
    }
}
