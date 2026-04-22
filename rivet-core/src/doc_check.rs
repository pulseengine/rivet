//! Documentation invariant engine.
//!
//! `rivet docs check` runs a set of invariants over `docs/**`, `README.md`,
//! and `CHANGELOG.md` to catch drift between documentation claims and the
//! state of the code/artifacts.  The goal is to make documentation a first-
//! class CI gate: stale claims fail the build the same way lint errors do.
//!
//! ## Invariants (MVP, see docs/design for rationale)
//!
//! 1. **SubcommandReferences** — every `rivet <word>` in prose refers to a
//!    real subcommand (unless the doc is an acknowledged design doc).
//! 2. **EmbedTokenReferences** — every `{{name:...}}` embed token refers to
//!    a registered embed kind.
//! 3. **VersionConsistency** — workspace version matches all ancillary
//!    package manifests (vscode, npm) and every `v0.X.Y` / `version 0.X.Y`
//!    that appears in prose.
//! 4. **ArtifactCounts** — "N <noun>" claims require either an `{{stats:}}`
//!    embed or an `<!-- AUDIT: verified YYYY-MM-DD -->` marker on the line.
//! 5. **SchemaReferences** — `schemas/foo.yaml` references must resolve to
//!    a real file.
//! 6. **SoftGateHonesty** — "runs in CI" / "enforced" claims must not point
//!    to a job with `continue-on-error: true`.
//! 7. **ConfigExampleFreshness** — ```yaml / ```toml fenced blocks must
//!    parse with the corresponding parser.
//! 8. **ArtifactIdValidity** — `REQ-NNN`, `FEAT-NNN`, etc. in prose must
//!    resolve to artifacts in the store (unless the doc is a design doc).
//!
//! A doc may opt out of subcommand/embed/artifact-ID existence checks with
//! an HTML comment near the top:
//!   <!-- rivet-docs-check: design-doc-aspirational-ok -->
//! Such docs are still subject to version consistency, schema refs,
//! soft-gate honesty, and config example freshness.

use std::collections::{BTreeMap, BTreeSet};
use std::path::{Path, PathBuf};

use crate::store::Store;

// ────────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────────

/// A single violation reported by one invariant against one file/line.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord)]
pub struct Violation {
    /// Path relative to the project root.
    pub file: PathBuf,
    /// 1-based line number where the violation occurs.
    pub line: usize,
    /// Short name of the invariant that fired.
    pub invariant: String,
    /// What the doc claims.
    pub claim: String,
    /// Reality (what the code/artifacts say).
    pub reality: String,
    /// Whether `--fix` can auto-correct this violation.
    pub auto_fixable: bool,
}

/// Result of running all invariants.
#[derive(Debug, Clone, Default)]
pub struct CheckReport {
    pub violations: Vec<Violation>,
    /// Files that were scanned (for diagnostics / --verbose).
    pub scanned_files: Vec<PathBuf>,
}

impl CheckReport {
    pub fn has_violations(&self) -> bool {
        !self.violations.is_empty()
    }

    pub fn by_invariant(&self) -> BTreeMap<String, usize> {
        let mut map: BTreeMap<String, usize> = BTreeMap::new();
        for v in &self.violations {
            *map.entry(v.invariant.clone()).or_insert(0) += 1;
        }
        map
    }
}

/// A single scanned doc file together with pre-parsed metadata.
#[derive(Debug, Clone)]
pub struct DocFile {
    /// Path relative to the project root.
    pub rel_path: PathBuf,
    /// Full raw file content.
    pub content: String,
    /// True when the file opts out of existence-based invariants via the
    /// `design-doc-aspirational-ok` marker.
    pub is_design_doc: bool,
}

impl DocFile {
    pub fn new(rel_path: PathBuf, content: String) -> Self {
        let is_design_doc = content.contains("rivet-docs-check: design-doc-aspirational-ok")
            || rel_path
                .components()
                .any(|c| c.as_os_str() == "plans" || c.as_os_str() == "design");
        Self {
            rel_path,
            content,
            is_design_doc,
        }
    }
}

/// Context passed to every invariant.
pub struct DocCheckContext<'a> {
    /// Project root (absolute).
    pub project_root: &'a Path,
    /// All doc files under consideration.
    pub docs: &'a [DocFile],
    /// Known subcommands (from the CLI).  Including top-level names only.
    pub known_subcommands: &'a BTreeSet<String>,
    /// Known embed kinds (e.g., "stats", "coverage", "artifact", "links",
    /// "table", "matrix", "diagnostics").
    pub known_embeds: &'a BTreeSet<String>,
    /// Workspace version string (e.g., "0.4.0").
    pub workspace_version: &'a str,
    /// Store of artifacts, if loaded.  Invariants that need it will skip
    /// themselves when this is `None`.
    pub store: Option<&'a Store>,
    /// Contents of `.github/workflows/ci.yml` if present.
    pub ci_yaml: Option<&'a str>,
    /// External-namespace prefixes (e.g. "GNV", "JIRA") that exempt
    /// matching IDs from the ArtifactIdValidity invariant. Sourced from
    /// `rivet.yaml: docs-check.external-namespaces`.
    pub external_namespaces: &'a [String],
    /// Pre-compiled regex patterns from `docs-check.ignore-patterns`.
    /// Any ID match that satisfies one of these is skipped.
    pub ignore_patterns: &'a [regex::Regex],
}

/// One invariant.
pub trait DocInvariant {
    fn name(&self) -> &'static str;
    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation>;
}

// ────────────────────────────────────────────────────────────────────────
// Scanning
// ────────────────────────────────────────────────────────────────────────

/// Collect candidate doc files: `README.md`, `CHANGELOG.md`, `AGENTS.md`,
/// `CLAUDE.md` at the project root, every `*.md` under `docs/`, and every
/// `*.md` under the `extra_dirs` passed by the caller (typically the
/// project's `rivet.yaml` `docs:` list — e.g. `rivet/docs`, `crates/*/docs`).
/// Paths in `extra_dirs` may be absolute or relative to `project_root`.
///
/// De-dupes by relative path so overlapping roots don't add a doc twice.
pub fn collect_docs(
    project_root: &Path,
    extra_dirs: &[PathBuf],
) -> std::io::Result<Vec<DocFile>> {
    let mut out = Vec::new();

    for top in ["README.md", "CHANGELOG.md", "AGENTS.md", "CLAUDE.md"] {
        let p = project_root.join(top);
        if p.is_file() {
            let content = std::fs::read_to_string(&p)?;
            out.push(DocFile::new(PathBuf::from(top), content));
        }
    }

    let mut walked: std::collections::BTreeSet<PathBuf> =
        std::collections::BTreeSet::new();
    let mut walk_once = |dir: PathBuf, out: &mut Vec<DocFile>| -> std::io::Result<()> {
        if !dir.is_dir() {
            return Ok(());
        }
        let canonical = dir.canonicalize().unwrap_or_else(|_| dir.clone());
        if !walked.insert(canonical) {
            return Ok(());
        }
        walk_md(&dir, project_root, out)
    };

    walk_once(project_root.join("docs"), &mut out)?;
    for extra in extra_dirs {
        let resolved = if extra.is_absolute() {
            extra.clone()
        } else {
            project_root.join(extra)
        };
        walk_once(resolved, &mut out)?;
    }

    // Final de-dupe by rel_path in case a doc was reachable via both the
    // default `docs/` and a configured extra that points at the same tree.
    out.sort_by(|a, b| a.rel_path.cmp(&b.rel_path));
    out.dedup_by(|a, b| a.rel_path == b.rel_path);

    Ok(out)
}

fn walk_md(dir: &Path, project_root: &Path, out: &mut Vec<DocFile>) -> std::io::Result<()> {
    for entry in std::fs::read_dir(dir)? {
        let entry = entry?;
        let path = entry.path();
        if path.is_dir() {
            walk_md(&path, project_root, out)?;
        } else if path.extension().is_some_and(|e| e == "md") {
            let content = std::fs::read_to_string(&path)?;
            let rel = path
                .strip_prefix(project_root)
                .unwrap_or(&path)
                .to_path_buf();
            out.push(DocFile::new(rel, content));
        }
    }
    Ok(())
}

// ────────────────────────────────────────────────────────────────────────
// Engine
// ────────────────────────────────────────────────────────────────────────

/// Run every provided invariant against `ctx` and return the merged report.
pub fn run_all(
    ctx: &DocCheckContext<'_>,
    invariants: &[Box<dyn DocInvariant>],
) -> CheckReport {
    let mut violations = Vec::new();
    for inv in invariants {
        let mut v = inv.check(ctx);
        violations.append(&mut v);
    }
    violations.sort();
    CheckReport {
        violations,
        scanned_files: ctx.docs.iter().map(|d| d.rel_path.clone()).collect(),
    }
}

/// The default invariant set.
pub fn default_invariants() -> Vec<Box<dyn DocInvariant>> {
    vec![
        Box::new(SubcommandReferences),
        Box::new(EmbedTokenReferences),
        Box::new(VersionConsistency),
        Box::new(ArtifactCounts),
        Box::new(SchemaReferences),
        Box::new(SoftGateHonesty),
        Box::new(ConfigExampleFreshness),
        Box::new(ArtifactIdValidity),
    ]
}

// ────────────────────────────────────────────────────────────────────────
// Line helpers
// ────────────────────────────────────────────────────────────────────────

/// Compute the 1-based line number for a byte offset in `content`.
fn line_for_offset(content: &str, offset: usize) -> usize {
    let mut line = 1usize;
    for (i, ch) in content.char_indices() {
        if i >= offset {
            break;
        }
        if ch == '\n' {
            line += 1;
        }
    }
    line
}

/// Return the line (without newline) that contains `offset`.
fn line_text(content: &str, offset: usize) -> String {
    let start = content[..offset.min(content.len())]
        .rfind('\n')
        .map(|i| i + 1)
        .unwrap_or(0);
    let end = content[offset.min(content.len())..]
        .find('\n')
        .map(|i| offset + i)
        .unwrap_or(content.len());
    content[start..end].to_string()
}

/// Iterate code-fenced regions `(start, end)` in a markdown document,
/// where `start..end` covers only the *content* between the fences
/// (exclusive of the fence lines themselves).  Returns the info string
/// (e.g., "yaml", "toml", "rust") for each block.
fn iter_code_blocks(content: &str) -> Vec<(String, usize, usize)> {
    let mut out = Vec::new();
    let mut in_block = false;
    let mut fence: Option<(String, usize)> = None; // (info, start_offset)
    let mut offset = 0usize;
    for line in content.split_inclusive('\n') {
        let trimmed = line.trim_start();
        if trimmed.starts_with("```") {
            if !in_block {
                let info = trimmed
                    .trim_start_matches('`')
                    .trim_end_matches('\n')
                    .trim()
                    .to_string();
                // content of the block begins after this line
                fence = Some((info, offset + line.len()));
                in_block = true;
            } else {
                if let Some((info, start)) = fence.take() {
                    out.push((info, start, offset));
                }
                in_block = false;
            }
        }
        offset += line.len();
    }
    out
}

/// True if `offset` lies inside any code-fenced block.
fn inside_code_block(blocks: &[(String, usize, usize)], offset: usize) -> bool {
    blocks.iter().any(|(_, s, e)| offset >= *s && offset < *e)
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: SubcommandReferences
// ────────────────────────────────────────────────────────────────────────

pub struct SubcommandReferences;

impl DocInvariant for SubcommandReferences {
    fn name(&self) -> &'static str {
        "SubcommandReferences"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        // Match literal `rivet <word>` where <word> is lowercase letters/dashes.
        // Require the match to be in a "code" context (inline backticks OR
        // leading `$` shell prompt OR preceded by `|` in a table) — plain
        // prose like "rivet never touches …" is a false positive otherwise.
        let re = regex::Regex::new(r"\brivet[ \t]+([a-z][a-z0-9\-]*)").unwrap();

        for doc in ctx.docs {
            if doc.is_design_doc {
                continue;
            }
            let blocks = iter_code_blocks(&doc.content);
            for cap in re.captures_iter(&doc.content) {
                let m = cap.get(0).unwrap();
                let offset = m.start();
                // Skip matches inside fenced code blocks — those are literal
                // examples, we verify them via ConfigExampleFreshness and
                // through the code blocks themselves (tests).
                if inside_code_block(&blocks, offset) {
                    continue;
                }
                // Require "code-flavored" context to avoid matching English
                // prose ("rivet models itself", "rivet never touches X").
                if !is_code_context(&doc.content, offset) {
                    continue;
                }
                let word = cap.get(1).unwrap().as_str();
                if ctx.known_subcommands.contains(word) {
                    continue;
                }
                let line = line_for_offset(&doc.content, offset);
                out.push(Violation {
                    file: doc.rel_path.clone(),
                    line,
                    invariant: self.name().to_string(),
                    claim: format!("rivet {word}"),
                    reality: format!(
                        "no such subcommand; known: {}",
                        ctx.known_subcommands
                            .iter()
                            .cloned()
                            .collect::<Vec<_>>()
                            .join(", ")
                    ),
                    auto_fixable: false,
                });
            }
        }
        out
    }
}

/// Heuristic: consider the match "code-flavored" if it is preceded, on the
/// same line, by an unclosed backtick OR a `$ ` shell prompt.
fn is_code_context(content: &str, offset: usize) -> bool {
    let line_start = content[..offset.min(content.len())]
        .rfind('\n')
        .map(|i| i + 1)
        .unwrap_or(0);
    let prefix = &content[line_start..offset];
    // Count unescaped backticks before the match on this line.  Odd count
    // means we're inside an inline-code span.
    let tick_count = prefix.chars().filter(|c| *c == '`').count();
    if tick_count % 2 == 1 {
        return true;
    }
    // Shell prompt at line start.
    if prefix.trim_start().starts_with("$ ") {
        return true;
    }
    false
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: EmbedTokenReferences
// ────────────────────────────────────────────────────────────────────────

pub struct EmbedTokenReferences;

impl DocInvariant for EmbedTokenReferences {
    fn name(&self) -> &'static str {
        "EmbedTokenReferences"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        // Match `{{name:...}}` or `{{name}}` — require a leading non-alnum
        // so we don't match tera-style `{{ foo }}` with whitespace.
        // We allow both forms but require the name portion to have no space.
        let re = regex::Regex::new(r"\{\{\s*([A-Za-z][A-Za-z0-9_]*)\s*[:}\s]").unwrap();

        for doc in ctx.docs {
            if doc.is_design_doc {
                continue;
            }
            let blocks = iter_code_blocks(&doc.content);
            for cap in re.captures_iter(&doc.content) {
                let m = cap.get(0).unwrap();
                let offset = m.start();
                if inside_code_block(&blocks, offset) {
                    continue;
                }
                let name = cap.get(1).unwrap().as_str();
                // Tera-style shortcode calls (e.g. `rivet_artifact(...)`)
                // are not rivet embeds — skip anything with snake_case.
                if name.contains('_') {
                    continue;
                }
                if ctx.known_embeds.contains(name) {
                    continue;
                }
                let line = line_for_offset(&doc.content, offset);
                out.push(Violation {
                    file: doc.rel_path.clone(),
                    line,
                    invariant: self.name().to_string(),
                    claim: format!("{{{{{name}:…}}}}"),
                    reality: format!(
                        "unknown embed; known: {}",
                        ctx.known_embeds
                            .iter()
                            .cloned()
                            .collect::<Vec<_>>()
                            .join(", ")
                    ),
                    auto_fixable: false,
                });
            }
        }
        out
    }
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: VersionConsistency
// ────────────────────────────────────────────────────────────────────────

pub struct VersionConsistency;

impl DocInvariant for VersionConsistency {
    fn name(&self) -> &'static str {
        "VersionConsistency"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        let expected = ctx.workspace_version;

        // (a) Check ancillary package manifests.
        for (rel, pattern, label) in [
            (
                "vscode-rivet/package.json",
                r#""version"\s*:\s*"([0-9]+\.[0-9]+\.[0-9]+)""#,
                "vscode-rivet package.json",
            ),
            (
                "package.json",
                r#""version"\s*:\s*"([0-9]+\.[0-9]+\.[0-9]+)""#,
                "npm package.json",
            ),
        ] {
            let path = ctx.project_root.join(rel);
            if !path.is_file() {
                continue;
            }
            let Ok(content) = std::fs::read_to_string(&path) else {
                continue;
            };
            let re = regex::Regex::new(pattern).unwrap();
            if let Some(cap) = re.captures(&content) {
                let found = cap.get(1).unwrap().as_str();
                if found != expected {
                    let offset = cap.get(0).unwrap().start();
                    let line = line_for_offset(&content, offset);
                    out.push(Violation {
                        file: PathBuf::from(rel),
                        line,
                        invariant: self.name().to_string(),
                        claim: format!("{label} version {found}"),
                        reality: format!("workspace version is {expected}"),
                        auto_fixable: true,
                    });
                }
            }
        }

        // (b) Check prose `v0.X.Y` and `version 0.X.Y` mentions.
        // Only flag mentions that deviate from workspace by minor/patch —
        // historical mentions (e.g. older CHANGELOG sections) are OK
        // provided they are older than the current workspace version.
        //
        // Heuristic: if a doc mentions a version strictly *greater* than
        // the workspace version, that's drift worth flagging.
        let re = regex::Regex::new(r"\bv?(\d+)\.(\d+)\.(\d+)\b").unwrap();
        let expected_parts: Vec<u32> = expected
            .split('.')
            .filter_map(|s| s.parse().ok())
            .collect();
        if expected_parts.len() == 3 {
            for doc in ctx.docs {
                // Design / roadmap docs legitimately reference planned
                // future versions ("v0.5.0 will add X").
                if doc.is_design_doc {
                    continue;
                }
                let blocks = iter_code_blocks(&doc.content);
                for cap in re.captures_iter(&doc.content) {
                    let m = cap.get(0).unwrap();
                    if inside_code_block(&blocks, m.start()) {
                        continue;
                    }
                    // Skip mentions inside inline `backticks` (often version
                    // pins for third-party deps, not the rivet release).
                    if is_code_context(&doc.content, m.start()) {
                        continue;
                    }
                    let maj: u32 = cap.get(1).unwrap().as_str().parse().unwrap_or(0);
                    let min: u32 = cap.get(2).unwrap().as_str().parse().unwrap_or(0);
                    let pat: u32 = cap.get(3).unwrap().as_str().parse().unwrap_or(0);
                    // Only treat as a rivet-version reference when preceded
                    // by 'v' OR when the surrounding text mentions "version"
                    // within 32 chars.  This filters out things like dates
                    // and unrelated semver (e.g. dependency numbers).
                    let raw = m.as_str();
                    let is_v_prefixed = raw.starts_with('v');
                    let ctx_start = m.start().saturating_sub(32);
                    let window = &doc.content[ctx_start..m.end()];
                    let is_version_context = window.to_ascii_lowercase().contains("version");
                    if !(is_v_prefixed || is_version_context) {
                        continue;
                    }
                    let cmp = (maj, min, pat).cmp(&(
                        expected_parts[0],
                        expected_parts[1],
                        expected_parts[2],
                    ));
                    if cmp == std::cmp::Ordering::Greater {
                        let line = line_for_offset(&doc.content, m.start());
                        out.push(Violation {
                            file: doc.rel_path.clone(),
                            line,
                            invariant: self.name().to_string(),
                            claim: format!("mentions {raw}"),
                            reality: format!("workspace version is {expected}"),
                            auto_fixable: false,
                        });
                    }
                }
            }
        }

        out
    }
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: ArtifactCounts
// ────────────────────────────────────────────────────────────────────────

pub struct ArtifactCounts;

impl DocInvariant for ArtifactCounts {
    fn name(&self) -> &'static str {
        "ArtifactCounts"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        // Match "N <noun>" where N is 2+ digits and the noun is something
        // countable tied to rivet state.  We only flag a closed-set list of
        // nouns so we don't falsely trigger on benign numbers.
        //
        // The claim must be accompanied either by an `{{stats…}}` embed
        // somewhere on the same line, or by an `<!-- AUDIT: verified ... -->`
        // marker somewhere in the same paragraph.
        let labels = [
            "requirements",
            "features",
            "artifacts",
            "UCAs",
            "hazards",
            "losses",
            "constraints",
            "scenarios",
            "tests",
            "Kani harnesses",
            "design decisions",
        ];
        let alternation = labels
            .iter()
            .map(|l| regex::escape(l))
            .collect::<Vec<_>>()
            .join("|");
        let re =
            regex::Regex::new(&format!(r"\b(\d{{2,}})\s+({alternation})\b")).unwrap();

        for doc in ctx.docs {
            if doc.is_design_doc {
                continue;
            }
            // File-level AUDIT marker: if the doc declares itself audited
            // as a whole via `<!-- AUDIT-FILE: verified YYYY-MM-DD -->`,
            // skip count checks entirely.  This is the right knob for
            // CHANGELOGs and retroactive tables where every number is a
            // historical snapshot.
            if doc.content.contains("AUDIT-FILE:") {
                continue;
            }
            let blocks = iter_code_blocks(&doc.content);
            for cap in re.captures_iter(&doc.content) {
                let m = cap.get(0).unwrap();
                if inside_code_block(&blocks, m.start()) {
                    continue;
                }
                let line_str = line_text(&doc.content, m.start());
                if line_str.contains("{{stats") || line_str.contains("{{coverage") {
                    continue;
                }
                // Look for an AUDIT marker within 3 lines before or after.
                let lineno = line_for_offset(&doc.content, m.start());
                let lines: Vec<&str> = doc.content.lines().collect();
                let lo = lineno.saturating_sub(3);
                let hi = (lineno + 3).min(lines.len());
                let window = lines.get(lo..hi).map(|s| s.join("\n")).unwrap_or_default();
                if window.contains("AUDIT:") {
                    continue;
                }
                out.push(Violation {
                    file: doc.rel_path.clone(),
                    line: lineno,
                    invariant: self.name().to_string(),
                    claim: m.as_str().to_string(),
                    reality: "numeric claim has no {{stats}} embed or AUDIT marker"
                        .to_string(),
                    auto_fixable: false,
                });
            }
        }
        out
    }
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: SchemaReferences
// ────────────────────────────────────────────────────────────────────────

pub struct SchemaReferences;

impl DocInvariant for SchemaReferences {
    fn name(&self) -> &'static str {
        "SchemaReferences"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        let re = regex::Regex::new(r"\bschemas/([A-Za-z0-9_\-]+\.yaml)\b").unwrap();
        for doc in ctx.docs {
            for cap in re.captures_iter(&doc.content) {
                let rel = format!("schemas/{}", cap.get(1).unwrap().as_str());
                let abs = ctx.project_root.join(&rel);
                if abs.is_file() {
                    continue;
                }
                let line = line_for_offset(&doc.content, cap.get(0).unwrap().start());
                out.push(Violation {
                    file: doc.rel_path.clone(),
                    line,
                    invariant: self.name().to_string(),
                    claim: rel.clone(),
                    reality: "file not found".to_string(),
                    auto_fixable: false,
                });
            }
        }
        out
    }
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: SoftGateHonesty
// ────────────────────────────────────────────────────────────────────────

pub struct SoftGateHonesty;

impl DocInvariant for SoftGateHonesty {
    fn name(&self) -> &'static str {
        "SoftGateHonesty"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        let Some(ci) = ctx.ci_yaml else {
            return out;
        };
        // Identify jobs that are marked continue-on-error.
        // Very light YAML reading — just find `^  <name>:` followed within
        // the next ~15 lines by `continue-on-error: true`.
        let soft_jobs = parse_soft_jobs(ci);
        if soft_jobs.is_empty() {
            return out;
        }

        // For each doc, look for claims "<name> <verb> in CI" or
        // "<name> enforced" where <name> matches a soft-gated job.
        for doc in ctx.docs {
            if doc.is_design_doc {
                continue;
            }
            let content = &doc.content;
            let lowered = content.to_ascii_lowercase();
            for job in &soft_jobs {
                let job_l = job.to_ascii_lowercase();
                // Patterns: "<job> wired into CI", "<job> enforced",
                // "<job> runs in CI", "<job> job enabled", "<job> gate",
                // "<job> required".
                let patterns = [
                    format!("{job_l} wired into ci"),
                    format!("{job_l} enforced"),
                    format!("{job_l} runs in ci"),
                    format!("{job_l} required"),
                ];
                for pat in &patterns {
                    let mut start = 0usize;
                    while let Some(rel) = lowered[start..].find(pat) {
                        let abs = start + rel;
                        let line = line_for_offset(content, abs);
                        out.push(Violation {
                            file: doc.rel_path.clone(),
                            line,
                            invariant: self.name().to_string(),
                            claim: format!("{pat} (prose claim)"),
                            reality: format!(
                                "{job} job has continue-on-error: true in .github/workflows/ci.yml"
                            ),
                            auto_fixable: false,
                        });
                        start = abs + pat.len();
                    }
                }
            }
        }
        out
    }
}

/// Parse `.github/workflows/ci.yml` and return the set of job names that
/// carry `continue-on-error: true` at the job level.
fn parse_soft_jobs(ci: &str) -> BTreeSet<String> {
    let mut out = BTreeSet::new();
    let lines: Vec<&str> = ci.lines().collect();
    let mut current_job: Option<(String, usize)> = None; // (name, indent)
    for (i, line) in lines.iter().enumerate() {
        // Top-level jobs are indented exactly two spaces, followed by the
        // job name and a colon with no value.
        let trimmed = line.trim_end();
        if let Some(rest) = trimmed.strip_prefix("  ") {
            if !rest.starts_with(' ') && rest.ends_with(':') {
                let name = rest.trim_end_matches(':').trim().to_string();
                if !name.is_empty() && !name.starts_with('#') {
                    current_job = Some((name, i));
                    continue;
                }
            }
        }
        if let Some((ref name, start_line)) = current_job {
            if trimmed.contains("continue-on-error: true")
                // The `continue-on-error` must be at step-level (6 spaces)
                // or job-level (4 spaces).  We only care about the job-level
                // one; step-level is OK.
                && line.starts_with("    ") && !line.starts_with("      ")
                && i.saturating_sub(start_line) < 40
            {
                out.insert(name.clone());
            }
        }
    }
    out
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: ConfigExampleFreshness
// ────────────────────────────────────────────────────────────────────────

pub struct ConfigExampleFreshness;

impl DocInvariant for ConfigExampleFreshness {
    fn name(&self) -> &'static str {
        "ConfigExampleFreshness"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        for doc in ctx.docs {
            let blocks = iter_code_blocks(&doc.content);
            for (info, start, end) in &blocks {
                let body = &doc.content[*start..*end];
                let kind = info.split_whitespace().next().unwrap_or("").to_ascii_lowercase();
                match kind.as_str() {
                    "yaml" | "yml" => {
                        if let Err(e) = serde_yaml::from_str::<serde_yaml::Value>(body) {
                            let line = line_for_offset(&doc.content, *start);
                            out.push(Violation {
                                file: doc.rel_path.clone(),
                                line,
                                invariant: self.name().to_string(),
                                claim: format!("```yaml block ({} bytes)", body.len()),
                                reality: format!("YAML parse error: {e}"),
                                auto_fixable: false,
                            });
                        }
                    }
                    // TOML block parsing would need the toml crate; we
                    // currently don't depend on it.  Skip.
                    _ => {}
                }
            }
        }
        out
    }
}

// ────────────────────────────────────────────────────────────────────────
// Invariant: ArtifactIdValidity
// ────────────────────────────────────────────────────────────────────────

pub struct ArtifactIdValidity;

impl DocInvariant for ArtifactIdValidity {
    fn name(&self) -> &'static str {
        "ArtifactIdValidity"
    }

    fn check(&self, ctx: &DocCheckContext<'_>) -> Vec<Violation> {
        let mut out = Vec::new();
        let Some(store) = ctx.store else {
            return out; // no store loaded — skip
        };
        // Match canonical IDs: 2+ uppercase letters, dash, 1+ digits, with
        // optional suffix letters (e.g. REQ-001, SC-AI-001, UCA-C-25).
        let re = regex::Regex::new(r"\b([A-Z]{2,}(?:-[A-Z0-9]+)*-\d+[A-Z0-9\-]*)\b").unwrap();
        for doc in ctx.docs {
            if doc.is_design_doc {
                continue;
            }
            let blocks = iter_code_blocks(&doc.content);
            // Collect IDs that live in the YAML front-matter block at the
            // top of the file — those are *document* IDs, not artifact IDs.
            let frontmatter_ids = collect_frontmatter_ids(&doc.content);
            // Per-line skip set sourced from HTML-comment directives:
            //   <!-- rivet-docs-check: ignore GNV-396 -->
            //   <!-- rivet-docs-check: ignore-line -->
            // The first form skips the named ID anywhere in the doc; the
            // second skips every ID on the same line as the directive.
            let (ignored_ids, ignored_lines) = collect_skip_directives(&doc.content);
            let mut seen: BTreeMap<String, usize> = BTreeMap::new();
            for cap in re.captures_iter(&doc.content) {
                let m = cap.get(0).unwrap();
                if inside_code_block(&blocks, m.start()) {
                    continue;
                }
                let id = m.as_str().to_string();
                if is_non_artifact_id(&id) {
                    continue;
                }
                if frontmatter_ids.contains(&id) {
                    continue;
                }
                if store.contains(&id) {
                    continue;
                }
                // External-namespace exemption (rivet.yaml docs-check.external-namespaces).
                let prefix = id.split('-').next().unwrap_or("");
                if ctx
                    .external_namespaces
                    .iter()
                    .any(|n| n.eq_ignore_ascii_case(prefix))
                {
                    continue;
                }
                // Free-form regex exemption.
                if ctx.ignore_patterns.iter().any(|re| re.is_match(&id)) {
                    continue;
                }
                // HTML-comment directives.
                if ignored_ids.contains(&id) {
                    continue;
                }
                let line = line_for_offset(&doc.content, m.start());
                if ignored_lines.contains(&line) {
                    continue;
                }
                // De-dupe per-file to avoid noisy output.
                if seen.insert(id.clone(), line).is_some() {
                    continue;
                }
                out.push(Violation {
                    file: doc.rel_path.clone(),
                    line,
                    invariant: self.name().to_string(),
                    claim: id,
                    reality: "artifact not found in store".to_string(),
                    auto_fixable: false,
                });
            }
        }
        out
    }
}

/// Parse `<!-- rivet-docs-check: ... -->` directives in a doc body.
/// Returns (set-of-ignored-IDs, set-of-ignored-line-numbers).
fn collect_skip_directives(content: &str) -> (BTreeSet<String>, BTreeSet<usize>) {
    let mut ids = BTreeSet::new();
    let mut lines = BTreeSet::new();
    let re = regex::Regex::new(
        r"<!--\s*rivet-docs-check:\s*([^>]+?)\s*-->",
    )
    .unwrap();
    for cap in re.captures_iter(content) {
        let m = cap.get(0).unwrap();
        let line = line_for_offset(content, m.start());
        let directive = cap.get(1).map(|x| x.as_str().trim()).unwrap_or("");
        if let Some(rest) = directive.strip_prefix("ignore-line") {
            // Optional `ignore-line N` to skip a specific other line; default = same line.
            let target = rest.trim().parse::<usize>().ok().unwrap_or(line);
            lines.insert(target);
        } else if let Some(rest) = directive.strip_prefix("ignore ") {
            for token in rest.split([' ', ',']).filter(|s| !s.is_empty()) {
                ids.insert(token.to_string());
            }
        }
    }
    (ids, lines)
}

/// True for IDs that look like artifact IDs but refer to external
/// standards, encodings, or advisories.
fn is_non_artifact_id(id: &str) -> bool {
    // External standards, encodings, character sets, licenses, advisories.
    const PREFIXES: &[&str] = &[
        "MIT-", "ISO-", "IEC-", "EN-", "CVE-", "RUSTSEC-", "REL-",
        "RFC-", "ASIL-", "SIL-", "POI-", "PROJ-", "DO-", "UTF-", "UCS-",
        "ASCII-", "PR-", "RT-", "LGTM-", "TLS-", "SHA-", "SHA1-", "SHA256-",
    ];
    if PREFIXES.iter().any(|p| id.starts_with(p)) {
        return true;
    }
    // Anchor-style hex hashes (e.g. "YAML-654FF0", "STPA-654FF0") — the
    // trailing hex segment makes these look like IDs but they aren't.
    // Heuristic: trailing segment is 4+ hex chars and starts with a digit
    // that is actually part of a longer hex run.
    if let Some((head, tail)) = id.rsplit_once('-') {
        if tail.len() >= 4
            && tail.chars().all(|c| c.is_ascii_hexdigit())
            && tail.chars().any(|c| c.is_ascii_alphabetic())
            // at least one letter ==> not a pure decimal id
            && head.chars().all(|c| c.is_ascii_uppercase() || c == '-')
        {
            return true;
        }
    }
    // "NOPE-999" — explicit in-prose placeholder in our audit docs.
    if id == "NOPE-999" {
        return true;
    }
    false
}

/// Collect artifact-ID-looking tokens that appear inside the YAML front-
/// matter block at the top of a markdown document.
fn collect_frontmatter_ids(content: &str) -> BTreeSet<String> {
    let mut out = BTreeSet::new();
    let bytes = content.as_bytes();
    if !content.starts_with("---") {
        return out;
    }
    // Find the closing `---` delimiter.
    let Some(rel) = content[3..].find("\n---") else {
        return out;
    };
    let end = 3 + rel;
    let fm = &content[..end];
    let re = regex::Regex::new(r"\b([A-Z]{2,}(?:-[A-Z0-9]+)*-\d+[A-Z0-9\-]*)\b").unwrap();
    for cap in re.captures_iter(fm) {
        out.insert(cap.get(0).unwrap().as_str().to_string());
    }
    // Shut up unused-var linter.
    let _ = bytes;
    out
}

// ────────────────────────────────────────────────────────────────────────
// Auto-fix
// ────────────────────────────────────────────────────────────────────────

/// Apply auto-fixes to the working tree for the subset of violations that
/// are auto-fixable.  Returns the number of fixes applied.
pub fn apply_fixes(ctx: &DocCheckContext<'_>, report: &CheckReport) -> std::io::Result<usize> {
    let mut fixed = 0usize;
    // Group by file.
    let mut per_file: BTreeMap<PathBuf, Vec<&Violation>> = BTreeMap::new();
    for v in &report.violations {
        if v.auto_fixable {
            per_file.entry(v.file.clone()).or_default().push(v);
        }
    }

    for (file, _vs) in per_file {
        let abs = ctx.project_root.join(&file);
        let Ok(content) = std::fs::read_to_string(&abs) else {
            continue;
        };
        // Currently only the VersionConsistency invariant is auto-fixable,
        // and only for ancillary package.json manifests.  Rewrite the
        // "version" field in place.
        if file.ends_with("package.json") {
            let re = regex::Regex::new(r#"("version"\s*:\s*")[0-9]+\.[0-9]+\.[0-9]+(")"#).unwrap();
            let new = re
                .replace(&content, |caps: &regex::Captures<'_>| {
                    format!("{}{}{}", &caps[1], ctx.workspace_version, &caps[2])
                })
                .into_owned();
            if new != content {
                std::fs::write(&abs, new)?;
                fixed += 1;
            }
        }
    }
    Ok(fixed)
}

// ────────────────────────────────────────────────────────────────────────
// Tests
// ────────────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    fn doc(rel: &str, content: &str) -> DocFile {
        DocFile::new(PathBuf::from(rel), content.to_string())
    }

    fn ctx_with<'a>(
        root: &'a Path,
        docs: &'a [DocFile],
        known_subcommands: &'a BTreeSet<String>,
        known_embeds: &'a BTreeSet<String>,
        version: &'a str,
    ) -> DocCheckContext<'a> {
        DocCheckContext {
            project_root: root,
            docs,
            known_subcommands,
            known_embeds,
            workspace_version: version,
            store: None,
            ci_yaml: None,
            external_namespaces: &[],
            ignore_patterns: &[],
        }
    }

    fn known_cmds(names: &[&str]) -> BTreeSet<String> {
        names.iter().map(|s| s.to_string()).collect()
    }

    // ── SubcommandReferences ────────────────────────────────────────────

    #[test]
    fn subcommand_references_flag_unknown() {
        let docs = vec![doc(
            "README.md",
            "Run `rivet discover` to list features and `rivet list` to ...",
        )];
        let subs = known_cmds(&["list", "validate"]);
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = SubcommandReferences.check(&ctx);
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].claim, "rivet discover");
        assert_eq!(v[0].file, PathBuf::from("README.md"));
    }

    #[test]
    fn subcommand_references_skip_design_doc() {
        let content = "<!-- rivet-docs-check: design-doc-aspirational-ok -->\n\
                       Run `rivet discover` here.";
        let docs = vec![doc("docs/foo.md", content)];
        let subs = known_cmds(&["list"]);
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = SubcommandReferences.check(&ctx);
        assert!(v.is_empty());
    }

    #[test]
    fn subcommand_references_ignore_code_blocks() {
        let content = "Use list:\n\n```bash\nrivet unknown-cmd\n```\n";
        let docs = vec![doc("README.md", content)];
        let subs = known_cmds(&["list"]);
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = SubcommandReferences.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    #[test]
    fn subcommand_references_clean_pass() {
        let docs = vec![doc("README.md", "`rivet list` and `rivet validate` are core.")];
        let subs = known_cmds(&["list", "validate"]);
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = SubcommandReferences.check(&ctx);
        assert!(v.is_empty());
    }

    #[test]
    fn subcommand_references_skip_plain_prose() {
        // "rivet never touches" and "rivet models itself" are English,
        // not command invocations — no backticks around them.
        let docs = vec![doc(
            "README.md",
            "The section that rivet never touches is manual.\n\
             rivet models itself in arch/.",
        )];
        let subs = known_cmds(&["list"]);
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = SubcommandReferences.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    // ── EmbedTokenReferences ────────────────────────────────────────────

    #[test]
    fn embed_token_flags_unknown_embed() {
        let docs = vec![doc("docs/srs.md", "Inline: {{query:foo}} now.")];
        let subs = BTreeSet::new();
        let mut embeds = BTreeSet::new();
        embeds.insert("artifact".to_string());
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = EmbedTokenReferences.check(&ctx);
        assert_eq!(v.len(), 1);
        assert!(v[0].claim.starts_with("{{query"));
    }

    #[test]
    fn embed_token_accepts_known_embed() {
        let docs = vec![doc("docs/srs.md", "Inline: {{artifact:REQ-001}}.")];
        let subs = BTreeSet::new();
        let mut embeds = BTreeSet::new();
        embeds.insert("artifact".to_string());
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = EmbedTokenReferences.check(&ctx);
        assert!(v.is_empty());
    }

    #[test]
    fn embed_token_skips_tera_shortcodes() {
        let docs = vec![doc(
            "docs/a.md",
            "{{ rivet_artifact(id=\"REQ-001\", prefix=\"rivet\") }}",
        )];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = EmbedTokenReferences.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    // ── VersionConsistency ──────────────────────────────────────────────

    #[test]
    fn version_consistency_flags_future_version_in_docs() {
        let docs = vec![doc("docs/foo.md", "upcoming v0.5.0 release")];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("/tmp"), &docs, &subs, &embeds, "0.4.0");
        let v = VersionConsistency.check(&ctx);
        assert_eq!(v.len(), 1);
        assert!(v[0].claim.contains("0.5.0"));
    }

    #[test]
    fn version_consistency_allows_older_versions() {
        let docs = vec![doc("CHANGELOG.md", "## [0.2.0]\n Historical.")];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("/tmp"), &docs, &subs, &embeds, "0.4.0");
        let v = VersionConsistency.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    // ── ArtifactCounts ──────────────────────────────────────────────────

    #[test]
    fn artifact_counts_flag_unverified_claim() {
        let docs = vec![doc(
            "docs/verification.md",
            "We have 27 Kani harnesses covering everything.",
        )];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = ArtifactCounts.check(&ctx);
        assert_eq!(v.len(), 1);
        assert!(v[0].claim.contains("27"));
    }

    #[test]
    fn artifact_counts_accept_embed_or_audit() {
        let docs = vec![
            doc("docs/a.md", "31 UCAs. {{stats:types}}"),
            doc(
                "docs/b.md",
                "<!-- AUDIT: verified 2026-04-19 -->\n31 UCAs documented.",
            ),
        ];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = ArtifactCounts.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    // ── SchemaReferences ────────────────────────────────────────────────

    #[test]
    fn schema_references_flag_missing_file() {
        let tmp = tempfile::tempdir().unwrap();
        std::fs::create_dir(tmp.path().join("schemas")).unwrap();
        std::fs::write(tmp.path().join("schemas/real.yaml"), "---\n").unwrap();

        let docs = vec![
            doc("docs/a.md", "See schemas/real.yaml"),
            doc("docs/b.md", "See schemas/fake.yaml"),
        ];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(tmp.path(), &docs, &subs, &embeds, "0.4.0");
        let v = SchemaReferences.check(&ctx);
        assert_eq!(v.len(), 1);
        assert!(v[0].claim.contains("fake.yaml"));
    }

    // ── SoftGateHonesty ─────────────────────────────────────────────────

    #[test]
    fn soft_gate_honesty_flags_false_enforcement_claim() {
        let ci = r#"
jobs:
  fmt:
    runs-on: ubuntu-latest
  verus:
    runs-on: ubuntu-latest
    continue-on-error: true
    steps:
      - run: echo
"#;
        let docs = vec![doc(
            "CHANGELOG.md",
            "Verus wired into CI for SMT proofs.",
        )];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: None,
            ci_yaml: Some(ci),
            external_namespaces: &[],
            ignore_patterns: &[],
        };
        let v = SoftGateHonesty.check(&ctx);
        assert_eq!(v.len(), 1);
        assert!(v[0].claim.contains("verus wired into ci"));
    }

    #[test]
    fn soft_gate_honesty_ok_when_not_soft_gated() {
        let ci = r#"
jobs:
  fmt:
    runs-on: ubuntu-latest
  verus:
    runs-on: ubuntu-latest
    steps:
      - run: echo
"#;
        let docs = vec![doc("CHANGELOG.md", "Verus wired into CI.")];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: None,
            ci_yaml: Some(ci),
            external_namespaces: &[],
            ignore_patterns: &[],
        };
        let v = SoftGateHonesty.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    // ── ConfigExampleFreshness ──────────────────────────────────────────

    #[test]
    fn config_example_freshness_flags_broken_yaml() {
        let content = "Example:\n\n```yaml\nfoo: [unbalanced\n```\n";
        let docs = vec![doc("docs/a.md", content)];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = ConfigExampleFreshness.check(&ctx);
        assert_eq!(v.len(), 1);
    }

    #[test]
    fn config_example_freshness_passes_valid_yaml() {
        let content = "```yaml\nfoo: bar\nbaz: [1, 2]\n```\n";
        let docs = vec![doc("docs/a.md", content)];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = ctx_with(Path::new("."), &docs, &subs, &embeds, "0.4.0");
        let v = ConfigExampleFreshness.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    // ── ArtifactIdValidity ──────────────────────────────────────────────

    #[test]
    fn artifact_id_validity_flags_missing_id() {
        use crate::test_helpers::minimal_artifact;

        let mut store = Store::new();
        store.upsert(minimal_artifact("REQ-001", "requirement"));

        let docs = vec![doc("docs/a.md", "See REQ-001 and REQ-999.")];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: Some(&store),
            ci_yaml: None,
            external_namespaces: &[],
            ignore_patterns: &[],
        };
        let v = ArtifactIdValidity.check(&ctx);
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].claim, "REQ-999");
    }

    #[test]
    fn artifact_id_validity_honors_external_namespaces_config() {
        // rivet.yaml docs-check.external-namespaces: [GNV, GNR, HZO, UC]
        // exempts those Jira/Polarion/hazard IDs from "artifact not found".
        let store = Store::new();
        let docs = vec![doc(
            "docs/stakereqs.md",
            "Traces to GNV-396, GNR-968, HZO-189, and UC-1.",
        )];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let exempted = vec![
            "GNV".to_string(),
            "GNR".to_string(),
            "HZO".to_string(),
            "UC".to_string(),
        ];
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: Some(&store),
            ci_yaml: None,
            external_namespaces: &exempted,
            ignore_patterns: &[],
        };
        let v = ArtifactIdValidity.check(&ctx);
        assert!(v.is_empty(), "external IDs should be exempted: {v:?}");
    }

    #[test]
    fn artifact_id_validity_honors_html_comment_skip_directive() {
        // <!-- rivet-docs-check: ignore GNV-396 --> exempts a specific ID.
        // <!-- rivet-docs-check: ignore-line --> exempts every ID on the
        // same line as the directive.
        let store = Store::new();
        let docs = vec![doc(
            "docs/x.md",
            "Mention REQ-WAT-1. <!-- rivet-docs-check: ignore REQ-WAT-1 -->\n\
             Other line: REQ-WAT-2 <!-- rivet-docs-check: ignore-line -->\n\
             Still flagged: REQ-WAT-3.",
        )];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: Some(&store),
            ci_yaml: None,
            external_namespaces: &[],
            ignore_patterns: &[],
        };
        let v = ArtifactIdValidity.check(&ctx);
        let claims: Vec<&str> = v.iter().map(|x| x.claim.as_str()).collect();
        assert_eq!(
            claims,
            vec!["REQ-WAT-3"],
            "only the un-skipped ID should be flagged: {v:?}",
        );
    }

    #[test]
    fn artifact_id_validity_ignores_external_id_schemes() {
        let store = Store::new();
        let docs = vec![doc(
            "docs/a.md",
            "Covers MIT-0, ISO-26262, IEC-61508, CVE-2024-0001, RUSTSEC-2026-0098, DO-178C, UTF-8.",
        )];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: Some(&store),
            ci_yaml: None,
            external_namespaces: &[],
            ignore_patterns: &[],
        };
        let v = ArtifactIdValidity.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    #[test]
    fn artifact_id_validity_ignores_frontmatter_ids() {
        let store = Store::new();
        let content = "---\n\
                       id: AUDIT-001\n\
                       type: report\n\
                       ---\n\
                       \n\
                       Body references AUDIT-001 and REQ-999.";
        let docs = vec![doc("docs/audit.md", content)];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: Some(&store),
            ci_yaml: None,
            external_namespaces: &[],
            ignore_patterns: &[],
        };
        let v = ArtifactIdValidity.check(&ctx);
        assert_eq!(v.len(), 1);
        assert_eq!(v[0].claim, "REQ-999");
    }

    #[test]
    fn artifact_id_validity_skips_hex_anchor_hashes() {
        let store = Store::new();
        let docs = vec![doc(
            "docs/a.md",
            "See YAML-654FF0 and STPA-654FF0 in the anchor index.",
        )];
        let subs = BTreeSet::new();
        let embeds = BTreeSet::new();
        let ctx = DocCheckContext {
            project_root: Path::new("."),
            docs: &docs,
            known_subcommands: &subs,
            known_embeds: &embeds,
            workspace_version: "0.4.0",
            store: Some(&store),
            ci_yaml: None,
            external_namespaces: &[],
            ignore_patterns: &[],
        };
        let v = ArtifactIdValidity.check(&ctx);
        assert!(v.is_empty(), "got: {v:?}");
    }

    // ── Engine smoke ────────────────────────────────────────────────────

    #[test]
    fn run_all_merges_and_sorts() {
        let docs = vec![doc(
            "docs/foo.md",
            "rivet nonsense and schemas/missing.yaml",
        )];
        let subs = known_cmds(&["list"]);
        let embeds = BTreeSet::new();
        let tmp = tempfile::tempdir().unwrap();
        let ctx = ctx_with(tmp.path(), &docs, &subs, &embeds, "0.4.0");
        let invs = default_invariants();
        let rep = run_all(&ctx, &invs);
        assert!(rep.has_violations());
        // Sorted by (file, line, invariant).
        for w in rep.violations.windows(2) {
            assert!(w[0] <= w[1]);
        }
    }

    #[test]
    fn line_for_offset_correct() {
        let s = "a\nbb\nccc";
        assert_eq!(line_for_offset(s, 0), 1);
        assert_eq!(line_for_offset(s, 1), 1);
        assert_eq!(line_for_offset(s, 2), 2);
        assert_eq!(line_for_offset(s, 5), 3);
    }

    #[test]
    fn iter_code_blocks_finds_fences() {
        let s = "text\n```yaml\nfoo: 1\n```\nmore\n```rust\nfn x() {}\n```\n";
        let blocks = iter_code_blocks(s);
        assert_eq!(blocks.len(), 2);
        assert_eq!(blocks[0].0, "yaml");
        assert_eq!(blocks[1].0, "rust");
    }
}
