//! Per-pipeline-kind prompt templates.
//!
//! A "template kind" is a named directory of `discover.md` / `validate.md` /
//! `emit.md` (and optional `rank.md`) prompts. Each kind targets one shape
//! of pipeline:
//!
//! - **structural** — rivet-authored. Closes traceability gaps surfaced by
//!   `rivet validate`. Closure is a `rivet link …` command or a stub YAML.
//! - **discovery** — vendored from `pulseengine/sigil`. The Mythos-style
//!   bug-hunt pipeline: rank → parallel discover → fresh validator → emit.
//!
//! Templates ship embedded in the binary via `include_str!`. Projects can
//! override any file by dropping a same-named file under
//! `.rivet/templates/pipelines/<kind>/<file>.md`. `resolve()` is the one
//! entry point that picks the override when present and falls back to the
//! embedded copy otherwise.
//!
//! Substitution is intentionally trivial: literal `{{key}}` -> value from
//! the supplied `BTreeMap<String, String>`. No expression language, no
//! escaping, no conditionals — anything richer belongs in the orchestrator,
//! not the template engine.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use crate::error::Error;

/// One of the four files a kind may ship.
///
/// `Rank` is optional and only meaningful for parallel-discovery pipelines
/// (currently just the `discovery` kind).
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
pub enum TemplateFile {
    Discover,
    Validate,
    Emit,
    Rank,
}

impl TemplateFile {
    /// Filename used on disk (and inside the embedded layout).
    pub fn filename(self) -> &'static str {
        match self {
            TemplateFile::Discover => "discover.md",
            TemplateFile::Validate => "validate.md",
            TemplateFile::Emit => "emit.md",
            TemplateFile::Rank => "rank.md",
        }
    }

    /// Parse a filename back to a `TemplateFile`. Used by the CLI's
    /// `<kind>/<file>` argument parser.
    pub fn from_filename(name: &str) -> Option<Self> {
        match name {
            "discover.md" => Some(TemplateFile::Discover),
            "validate.md" => Some(TemplateFile::Validate),
            "emit.md" => Some(TemplateFile::Emit),
            "rank.md" => Some(TemplateFile::Rank),
            _ => None,
        }
    }

    /// All four files, in canonical order. Iteration order matters for
    /// `templates list` and `copy-to-project` reproducibility.
    pub fn all() -> &'static [TemplateFile] {
        &[
            TemplateFile::Rank,
            TemplateFile::Discover,
            TemplateFile::Validate,
            TemplateFile::Emit,
        ]
    }
}

// ── Embedded content ───────────────────────────────────────────────────

const STRUCTURAL_DISCOVER: &str = include_str!("templates/structural/discover.md");
const STRUCTURAL_VALIDATE: &str = include_str!("templates/structural/validate.md");
const STRUCTURAL_EMIT: &str = include_str!("templates/structural/emit.md");

const DISCOVERY_RANK: &str = include_str!("templates/discovery/rank.md");
const DISCOVERY_DISCOVER: &str = include_str!("templates/discovery/discover.md");
const DISCOVERY_VALIDATE: &str = include_str!("templates/discovery/validate.md");
const DISCOVERY_EMIT: &str = include_str!("templates/discovery/emit.md");

/// All built-in template kinds, in canonical iteration order.
pub fn list_kinds() -> Vec<&'static str> {
    vec!["structural", "discovery"]
}

/// Load an embedded template for `(kind, file)`. Returns `None` when the
/// kind is unknown or the file is not shipped for that kind (e.g. the
/// `structural` kind has no `rank.md`).
pub fn load(kind: &str, file: TemplateFile) -> Option<&'static str> {
    match (kind, file) {
        ("structural", TemplateFile::Discover) => Some(STRUCTURAL_DISCOVER),
        ("structural", TemplateFile::Validate) => Some(STRUCTURAL_VALIDATE),
        ("structural", TemplateFile::Emit) => Some(STRUCTURAL_EMIT),
        ("discovery", TemplateFile::Rank) => Some(DISCOVERY_RANK),
        ("discovery", TemplateFile::Discover) => Some(DISCOVERY_DISCOVER),
        ("discovery", TemplateFile::Validate) => Some(DISCOVERY_VALIDATE),
        ("discovery", TemplateFile::Emit) => Some(DISCOVERY_EMIT),
        _ => None,
    }
}

/// Project-relative path where an override of `(kind, file)` would live.
///
/// This is the path returned by `resolve()` when an override exists, and
/// the path the orchestrator should `Read` directly. The path is relative
/// to the project root.
pub fn override_path(kind: &str, file: TemplateFile) -> PathBuf {
    PathBuf::from(".rivet/templates/pipelines")
        .join(kind)
        .join(file.filename())
}

/// Marker string the orchestrator uses when no project override exists.
///
/// The orchestrator interprets `embedded:<kind>/<file>` as "fetch via
/// `rivet templates show <kind>/<file>`" (or an in-process call to
/// `templates::load`). Keeping the form trivial lets `template_pair`
/// fields in JSON output be shape-stable strings.
pub fn embedded_marker(kind: &str, file: TemplateFile) -> String {
    format!("embedded:{kind}/{}", file.filename())
}

/// Resolve a template body for `(kind, file)` against `project_root`.
///
/// Tries `<project_root>/.rivet/templates/pipelines/<kind>/<file>.md`
/// first; falls back to the embedded copy. Returns `Err` only when the
/// kind is unknown AND no override exists, or when the override is
/// present but unreadable.
pub fn resolve(project_root: &Path, kind: &str, file: TemplateFile) -> Result<String, Error> {
    let override_abs = project_root.join(override_path(kind, file));
    if override_abs.exists() {
        return std::fs::read_to_string(&override_abs).map_err(|e| {
            Error::Io(format!(
                "reading template override {}: {e}",
                override_abs.display()
            ))
        });
    }
    if let Some(body) = load(kind, file) {
        return Ok(body.to_string());
    }
    Err(Error::NotFound(format!(
        "no template `{kind}/{}` (no embedded copy and no override at {})",
        file.filename(),
        override_abs.display()
    )))
}

/// Trivial `{{key}}` substitution. No escaping, no conditionals, no
/// nesting. Unknown placeholders are left as-is so the orchestrator can
/// see what it forgot to bind.
pub fn substitute(body: &str, vars: &BTreeMap<String, String>) -> String {
    let mut out = body.to_string();
    for (k, v) in vars {
        out = out.replace(&format!("{{{{{k}}}}}"), v);
    }
    out
}

/// Inspect a project's `.rivet/templates/pipelines/` dir and report which
/// kinds/files have overrides on disk. Useful for `rivet templates list`.
pub fn list_project_overrides(project_root: &Path) -> Vec<(String, Vec<TemplateFile>)> {
    let dir = project_root.join(".rivet/templates/pipelines");
    let mut out: Vec<(String, Vec<TemplateFile>)> = Vec::new();
    let Ok(entries) = std::fs::read_dir(&dir) else {
        return out;
    };
    let mut kind_dirs: Vec<PathBuf> = entries
        .filter_map(|e| e.ok())
        .map(|e| e.path())
        .filter(|p| p.is_dir())
        .collect();
    kind_dirs.sort();
    for kdir in kind_dirs {
        let kind = match kdir.file_name().and_then(|s| s.to_str()) {
            Some(s) => s.to_string(),
            None => continue,
        };
        let mut files = Vec::new();
        for f in TemplateFile::all() {
            if kdir.join(f.filename()).exists() {
                files.push(*f);
            }
        }
        out.push((kind, files));
    }
    out
}

/// Is `kind` either built-in or present as a project override directory?
/// Used by `agent_pipelines::validate` to police `template-kind:` values.
pub fn kind_is_known(project_root: &Path, kind: &str) -> bool {
    if list_kinds().contains(&kind) {
        return true;
    }
    project_root
        .join(".rivet/templates/pipelines")
        .join(kind)
        .is_dir()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn list_kinds_returns_both_builtins() {
        let kinds = list_kinds();
        assert!(kinds.contains(&"structural"));
        assert!(kinds.contains(&"discovery"));
    }

    #[test]
    fn load_structural_files() {
        assert!(load("structural", TemplateFile::Discover).is_some());
        assert!(load("structural", TemplateFile::Validate).is_some());
        assert!(load("structural", TemplateFile::Emit).is_some());
        // structural has no rank.md
        assert!(load("structural", TemplateFile::Rank).is_none());
    }

    #[test]
    fn load_discovery_files() {
        for f in TemplateFile::all() {
            assert!(
                load("discovery", *f).is_some(),
                "discovery should ship {}",
                f.filename()
            );
        }
    }

    #[test]
    fn load_unknown_kind_is_none() {
        assert!(load("does-not-exist", TemplateFile::Discover).is_none());
    }

    #[test]
    fn vendored_files_carry_attribution() {
        for f in TemplateFile::all() {
            let body = load("discovery", *f).expect("discovery file");
            assert!(
                body.starts_with("<!-- Vendored from"),
                "discovery/{} missing attribution header: starts with {:?}",
                f.filename(),
                &body[..body.len().min(40)]
            );
        }
    }

    #[test]
    fn substitute_replaces_known_placeholders() {
        let body = "hello {{name}}, gap {{gap_id}} done";
        let vars = BTreeMap::from([
            ("name".to_string(), "world".to_string()),
            ("gap_id".to_string(), "gap-7".to_string()),
        ]);
        assert_eq!(substitute(body, &vars), "hello world, gap gap-7 done");
    }

    #[test]
    fn substitute_leaves_unknown_placeholders() {
        let body = "{{known}} but not {{unknown}}";
        let vars = BTreeMap::from([("known".to_string(), "yes".to_string())]);
        assert_eq!(substitute(body, &vars), "yes but not {{unknown}}");
    }

    #[test]
    fn resolve_uses_embedded_when_no_override() {
        let tmp = tempfile::tempdir().unwrap();
        let body =
            resolve(tmp.path(), "structural", TemplateFile::Discover).expect("resolve embedded");
        assert!(body.contains("structural traceability gap"));
    }

    #[test]
    fn resolve_uses_override_when_present() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path().join(".rivet/templates/pipelines/structural");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("discover.md"), "OVERRIDE BODY").unwrap();
        let body = resolve(tmp.path(), "structural", TemplateFile::Discover).unwrap();
        assert_eq!(body, "OVERRIDE BODY");
    }

    #[test]
    fn resolve_unknown_kind_without_override_errors() {
        let tmp = tempfile::tempdir().unwrap();
        let err = resolve(tmp.path(), "unknown-kind", TemplateFile::Discover).unwrap_err();
        let msg = format!("{err}");
        assert!(msg.contains("unknown-kind"), "msg: {msg}");
    }

    #[test]
    fn resolve_unknown_kind_with_override_succeeds() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path().join(".rivet/templates/pipelines/custom-kind");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("discover.md"), "CUSTOM").unwrap();
        let body = resolve(tmp.path(), "custom-kind", TemplateFile::Discover).unwrap();
        assert_eq!(body, "CUSTOM");
    }

    #[test]
    fn override_path_is_relative_with_known_layout() {
        let p = override_path("structural", TemplateFile::Discover);
        assert_eq!(
            p,
            PathBuf::from(".rivet/templates/pipelines/structural/discover.md")
        );
    }

    #[test]
    fn embedded_marker_format() {
        assert_eq!(
            embedded_marker("structural", TemplateFile::Discover),
            "embedded:structural/discover.md"
        );
    }

    #[test]
    fn list_project_overrides_empty_when_no_dir() {
        let tmp = tempfile::tempdir().unwrap();
        assert!(list_project_overrides(tmp.path()).is_empty());
    }

    #[test]
    fn list_project_overrides_finds_files() {
        let tmp = tempfile::tempdir().unwrap();
        let dir = tmp.path().join(".rivet/templates/pipelines/structural");
        std::fs::create_dir_all(&dir).unwrap();
        std::fs::write(dir.join("discover.md"), "x").unwrap();
        std::fs::write(dir.join("emit.md"), "y").unwrap();
        let overrides = list_project_overrides(tmp.path());
        assert_eq!(overrides.len(), 1);
        assert_eq!(overrides[0].0, "structural");
        assert!(overrides[0].1.contains(&TemplateFile::Discover));
        assert!(overrides[0].1.contains(&TemplateFile::Emit));
        assert!(!overrides[0].1.contains(&TemplateFile::Validate));
    }

    #[test]
    fn kind_is_known_for_builtins() {
        let tmp = tempfile::tempdir().unwrap();
        assert!(kind_is_known(tmp.path(), "structural"));
        assert!(kind_is_known(tmp.path(), "discovery"));
        assert!(!kind_is_known(tmp.path(), "nope"));
    }

    #[test]
    fn kind_is_known_picks_up_project_override_dir() {
        let tmp = tempfile::tempdir().unwrap();
        std::fs::create_dir_all(tmp.path().join(".rivet/templates/pipelines/exotic")).unwrap();
        assert!(kind_is_known(tmp.path(), "exotic"));
    }
}
