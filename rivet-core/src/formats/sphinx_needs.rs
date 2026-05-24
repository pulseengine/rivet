//! Eclipse S-CORE sphinx-needs RST importer.
//!
//! Converts an upstream Eclipse S-CORE repo's RST tree (or a sphinx-needs
//! `needs.json` export) into rivet artifacts.  This is the Rust port of
//! `tools/score_import.py` from the `eclipse-score-fork` workspace
//! (validated against the full eclipse-score corpus: 2752 artifacts across
//! 4 repos, 0 errors against the `chore/score-schema-eclipse-comparison-update`
//! schema delta).
//!
//! ## Why a hand-rolled RST scanner instead of docutils
//!
//! Eclipse uses sphinx-needs' directive shape (`.. <type>:: <title>` with a
//! `:option:` block) and we only need *that* directive, not the full RST
//! grammar.  A regex pass over the file is small, dependency-free, and
//! matches sphinx-needs' own selection rules: the corpus oracle drove this
//! parser to GREEN against the full eclipse data, which is the only
//! correctness gate that matters here.
//!
//! ## What this module deliberately does NOT do
//!
//! - Test-spec/test-exec/test-verdict split for eclipse's `testcase`.
//!   `testcase` maps to a single `test-spec`; the verification triad is
//!   meant to be populated by `rivet import-results --format junit`
//!   separately.
//! - Bring in a full docutils-style RST parser.  The regex approach is the
//!   point — predictable, no surprise dependencies.
//!
//! ## Mappings
//!
//! See [`TYPE_MAP`], [`LINK_MAP`], [`STATUS_MAP`], [`FIELD_MAP`] below.
//! Each is a verbatim port of the Python reference.

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation.  See `formats/generic.rs`
// for the full rationale.
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

use std::collections::{BTreeMap, HashMap};
use std::path::{Path, PathBuf};

use regex::Regex;
use serde::Deserialize;

use crate::error::Error;
use crate::model::{Artifact, Link};

// ---------------------------------------------------------------------------
// Type / link / status / field mappings (verbatim port of score_import.py)
// ---------------------------------------------------------------------------

/// Eclipse need type → rivet artifact type.
///
/// Source of truth for eclipse types: `docs-as-code/src/extensions/
/// score_metamodel/metamodel.yaml` (~30 types).  Rivet equivalents land in
/// `schemas/score.yaml` (~28 types after the
/// `chore/score-schema-eclipse-comparison-update` deltas).
pub const TYPE_MAP: &[(&str, &str)] = &[
    // Requirements
    ("stkh_req", "stkh-req"),
    ("feat_req", "feat-req"),
    ("comp_req", "comp-req"),
    ("aou_req", "aou-req"),
    ("tool_req", "tool-req"),
    // Architecture
    ("feat", "feat"),
    ("feat_arc_sta", "feat-arc-sta"),
    ("feat_arc_dyn", "feat-arc-dyn"),
    ("logic_arc_int", "logic-arc-int"),
    ("logic_arc_int_op", "logic-arc-int"), // operations collapse onto interface
    ("comp", "comp"),
    ("comp_arc_sta", "comp-arc-sta"),
    ("comp_arc_dyn", "comp-arc-dyn"),
    ("real_arc_int", "real-arc-int"),
    ("real_arc_int_op", "real-arc-int"),
    ("mod", "mod"),
    ("mod_view_sta", "mod-view-sta"),
    ("mod_view_dyn", "mod-view-dyn"),
    // Detailed design / impl
    ("dd_sta", "dd-sta"),
    ("dd_dyn", "dd-dyn"),
    ("sw_unit", "sw-unit"),
    ("sw_unit_int", "sw-unit"), // interface variant collapses onto sw-unit
    // Safety analysis (eclipse splits by scope; rivet uses belongs-to instead)
    ("plat_saf_dfa", "dfa-entry"),
    ("feat_saf_dfa", "dfa-entry"),
    ("comp_saf_dfa", "dfa-entry"),
    ("feat_saf_fmea", "fmea-entry"),
    ("comp_saf_fmea", "fmea-entry"),
    // Verification — eclipse `testcase` is generated; we emit `test-spec`
    // (one per testcase) and let rivet's test-exec/test-verdict triad be
    // populated by `rivet import-results --format junit` separately.
    ("testcase", "test-spec"),
    // Process
    ("workflow", "workflow"),
    ("role", "role"),
    ("workproduct", "workproduct"),
    ("tsf", "tsf"),
    // Guidance family — eclipse splits 5 ways; rivet collapses to one,
    // disambiguated by tag (we add the eclipse type as a tag).
    ("gd_req", "guidance"),
    ("gd_temp", "guidance"),
    ("gd_chklst", "guidance"),
    ("gd_guidl", "guidance"),
    ("gd_method", "guidance"),
    // Documents — eclipse splits 3 ways; rivet collapses to one + doc-type.
    ("doc_concept", "doc"),
    ("doc_getstrt", "doc"),
    ("doc_tool", "doc"),
    ("document", "doc"),
    ("review_header", "doc"),
    // Standards register
    ("std_req", "std-req"),
    ("std_wp", "std-wp"),
    // Trustable framework
    ("tenet", "tenet"),
    ("assertion", "assertion"),
    // Other
    ("dec_rec", "decision-record"),
];

/// Eclipse option name → rivet link-type.
pub const LINK_MAP: &[(&str, &str)] = &[
    ("satisfies", "satisfies"),
    ("implements", "implements"),
    ("fulfils", "fulfils"),
    ("belongs_to", "belongs-to"),
    ("realizes", "realizes"),
    ("uses", "uses"),
    ("violates", "violates"),
    ("complies", "complies"),
    ("fully_verifies", "fully-verifies"),
    ("partially_verifies", "partially-verifies"),
    // Score-deltas added in rivet schemas/score.yaml:
    ("provides", "provides"),
    ("includes", "includes"),
    ("covers", "covers"),
    ("responsible", "responsible"),
    ("approved_by", "approved-by"),
    ("supported_by", "supported-by"),
    ("input", "input"),
    ("output", "output"),
    ("contains", "contains-guidance"), // avoids clash with aadl `contains`
    ("has", "has-document"),
    ("mitigated_by", "is-mitigated-by"),
    // Eclipse `included_by` is the back-direction — emit forward `includes`
    // from the other side; skip here to avoid double-encoding.
];

/// Eclipse status enum → rivet status enum.
pub const STATUS_MAP: &[(&str, &str)] = &[
    ("valid", "approved"),
    ("draft", "draft"),
    ("invalid", "obsolete"),
    ("in_progress", "in_progress"),
    ("obsolete", "obsolete"),
    // dec_rec-specific
    ("accepted", "approved"),
    ("proposed", "draft"),
    ("rejected", "obsolete"),
    ("superseded", "obsolete"),
    ("deprecated", "obsolete"),
    // doc_tool-specific
    ("evaluated", "draft"),
    ("qualified", "approved"),
    ("released", "approved"),
];

/// Fields that pass through into rivet `fields:` (rather than being
/// recognised as links).
pub const FIELD_MAP: &[(&str, &str)] = &[
    ("safety", "safety-level"), // QM|ASIL_A..D
    ("security", "security"),   // YES|NO
    ("reqtype", "req-type"),
    ("rationale", "rationale"),
    ("tcl", "tcl"),
    ("language", "language"),
    ("failure_id", "failure-id"),
    ("fault_id", "fault-id"),
    ("failure_effect", "effect"),
    ("sufficient", "sufficient"),
    ("mitigation_issue", "mitigation-issue"),
    ("context", "context"),
    ("decision", "decision"),
    ("consequences", "consequences"),
    ("reviewers", "reviewers"),
    ("approvers", "approvers"),
    ("template", "template"),
    ("implemented", "implemented"),
    ("name", "name"),
    ("file", "file"),
    ("line", "line"),
    ("test_type", "test-method"),
    ("derivation_technique", "derivation-technique"),
    ("result", "result"),
    ("result_text", "result-text"),
    ("version", "version"),
    ("valid_from", "valid-from"),
    ("valid_until", "valid-until"),
    ("author", "author"),
    ("approver", "approver"),
    ("reviewer", "reviewer"),
    ("safety_affected", "safety-affected"),
    ("security_affected", "security-affected"),
    ("codelink", "source-file"),
    ("source_code_link", "source-file"),
    ("hash", "hash"),
    ("parent_covered", "parent-covered"),
    ("parent_has_problem", "parent-has-problem"),
];

/// Options sphinx-needs handles natively and that we don't re-emit.
pub const NATIVE_OPTIONS: &[&str] = &["id", "status", "tags", "content", "title", "type"];

/// IDs that ship as placeholder needs in `eclipse-score/module_template`
/// and that downstream repos copy verbatim without renaming.  Globally
/// skipping them avoids "declared in N repos" errors at corpus scale.
/// This is an upstream-hygiene issue, not a converter limitation —
/// sphinx-needs IDs are supposed to be globally unique but eclipse has
/// `stkh_req__docgen_enabled__example` declared in 7+ sibling repos.
///
/// Compared lowercase since eclipse RST is lowercase by convention even
/// though the rivet artifact IDs are uppercased on emission.
pub const TEMPLATE_PLACEHOLDER_IDS: &[&str] = &["stkh_req__docgen_enabled__example"];

fn type_map() -> HashMap<&'static str, &'static str> {
    TYPE_MAP.iter().copied().collect()
}
fn link_map() -> HashMap<&'static str, &'static str> {
    LINK_MAP.iter().copied().collect()
}
fn status_map() -> HashMap<&'static str, &'static str> {
    STATUS_MAP.iter().copied().collect()
}
fn field_map() -> HashMap<&'static str, &'static str> {
    FIELD_MAP.iter().copied().collect()
}

// ---------------------------------------------------------------------------
// Parsed RST need
// ---------------------------------------------------------------------------

/// A single sphinx-needs directive pulled out of an RST file.
///
/// `options` preserves insertion order in the file (BTreeMap is keyed
/// alphabetically; we use a Vec to keep source order for repeatability).
#[derive(Debug, Clone, Default)]
pub struct ParsedNeed {
    pub eclipse_type: String,
    pub title: String,
    /// Ordered option list — sphinx-needs allows duplicate keys in theory
    /// but eclipse RST never does so a HashMap-keyed BTreeMap would be
    /// safe; we keep a Vec for deterministic insertion-order rendering.
    pub options: Vec<(String, String)>,
    pub body_lines: Vec<String>,
    pub source: Option<PathBuf>,
    pub source_line: usize,
}

impl ParsedNeed {
    fn option(&self, key: &str) -> Option<&str> {
        self.options
            .iter()
            .find(|(k, _)| k == key)
            .map(|(_, v)| v.as_str())
    }
    fn id(&self) -> &str {
        self.option("id").unwrap_or("")
    }
}

// ---------------------------------------------------------------------------
// Coverage stats (for the markdown report)
// ---------------------------------------------------------------------------

/// Cumulative stats across one or more files of conversion attempts.
///
/// The "falsification surface" is the data Ralf wants in the coverage
/// report — every unknown type, unknown option, no-id need that the
/// converter could not place in the rivet graph.
#[derive(Debug, Default, Clone)]
pub struct CoverageStats {
    pub converted: usize,
    pub skipped_unknown_type: BTreeMap<String, usize>,
    pub skipped_no_id: usize,
    pub unknown_links: BTreeMap<String, usize>,
    pub unknown_options: BTreeMap<String, usize>,
    pub by_type: BTreeMap<String, usize>,
    pub files_scanned: usize,
}

impl CoverageStats {
    fn bump(map: &mut BTreeMap<String, usize>, key: &str) {
        *map.entry(key.to_owned()).or_insert(0) += 1;
    }
}

// ---------------------------------------------------------------------------
// RST parsing
// ---------------------------------------------------------------------------

/// Pull every `.. <type>::` need directive out of an RST file.
///
/// Sphinx-needs directives use an `:option:` block with continuation-line
/// indentation; the free-text body follows after a blank line.  We do not
/// need full RST grammar — just the directive shape eclipse uses.
///
/// ### Corpus-oracle-driven bug fixes
///
/// All of these failure modes were surfaced by validating the converter
/// output against the full eclipse-score corpus.  Removing any of them
/// regresses the round-trip:
///
/// 1. **Allow indented directives.**  Eclipse occasionally puts need
///    directives inside RST bulleted lists (`.. std_req:: ID` at column
///    4 in the ISO 26262 / ASPICE clause registers).  Capture the
///    leading whitespace so option / body indentation can be measured
///    *relative to the directive column*, not column 0.
/// 2. **Filter `.. code-block:: rst` regions.**  Eclipse's docs include
///    literal `.. feat_saf_fmea:: <Title>` template snippets inside
///    `.. code-block:: rst` for documentation purposes; sphinx-needs
///    ignores them and so must we.
/// 3. **Skip template-placeholder IDs.**  Belt-and-suspenders for the
///    code-block filter: any need whose id (or link target) contains
///    `<` / `>` is an unfilled template slot like `<Title>`.
/// 4. **Split link option values on `[\s,;]+`.**  Eclipse uses `;` in
///    one place; the default `,` would silently lose those targets.
pub fn parse_rst(content: &str, source: Option<&Path>) -> Vec<ParsedNeed> {
    let lines: Vec<&str> = content.split('\n').collect();
    let directive_re = Regex::new(
        // Capture the leading whitespace — eclipse puts needs inside
        // bulleted lists, so the directive column is *not* always 0.
        r"^(?P<indent>[ \t]*)\.\. (?P<type>[a-z_]+):: (?P<title>.*?)\s*$",
    )
    .expect("directive_re compiles");
    let code_block_re = Regex::new(
        r"^(?P<indent>[ \t]*)\.\. (?:code-block|code|literalinclude|parsed-literal)::",
    )
    .expect("code_block_re compiles");
    let option_re = Regex::new(r"^[ \t]+:(?P<key>[a-zA-Z_][a-zA-Z_0-9]*):\s*(?P<value>.*?)\s*$")
        .expect("option_re compiles");

    let types: HashMap<&str, &str> = type_map();
    let links: HashMap<&str, &str> = link_map();
    let mut needs: Vec<ParsedNeed> = Vec::new();

    // Track when we're inside a code/literal block — sphinx-needs ignores
    // directives written inside `.. code-block:: rst`, so must we.
    let mut code_block_indent: Option<usize> = None;
    let mut i: usize = 0;
    while i < lines.len() {
        let line = lines[i];
        if let Some(cb) = code_block_re.captures(line) {
            code_block_indent = Some(cb.name("indent").map(|m| m.as_str().len()).unwrap_or(0));
            i += 1;
            continue;
        }
        if let Some(cb_indent) = code_block_indent {
            if line.trim().is_empty() {
                i += 1;
                continue;
            }
            let leading = leading_ws(line);
            if leading <= cb_indent {
                code_block_indent = None;
                // fall through to re-evaluate this line as a directive
            } else {
                i += 1;
                continue;
            }
        }
        let Some(m) = directive_re.captures(line) else {
            i += 1;
            continue;
        };
        let etype = m.name("type").expect("type group").as_str().to_owned();
        if !types.contains_key(etype.as_str()) {
            i += 1;
            continue;
        }
        let directive_indent = m.name("indent").map(|m| m.as_str().len()).unwrap_or(0);
        let title = m.name("title").expect("title group").as_str().trim().to_owned();

        let mut need = ParsedNeed {
            eclipse_type: etype,
            title,
            source: source.map(|p| p.to_path_buf()),
            source_line: i + 1,
            ..Default::default()
        };
        i += 1;

        // Options block — lines with `:key: value` indented MORE than the
        // directive itself.
        while i < lines.len() {
            let l = lines[i];
            if l.trim().is_empty() {
                i += 1;
                break;
            }
            let leading = leading_ws(l);
            if leading <= directive_indent {
                break;
            }
            if let Some(opt_m) = option_re.captures(l) {
                let key = opt_m.name("key").expect("key group").as_str().to_owned();
                let mut value = opt_m
                    .name("value")
                    .expect("value group")
                    .as_str()
                    .to_owned();
                // Continuation lines (rare — eclipse rarely wraps options).
                while i + 1 < lines.len()
                    && !lines[i + 1].trim().is_empty()
                    && leading_ws(lines[i + 1]) > directive_indent + 3
                    && !lines[i + 1].trim_start().starts_with(':')
                {
                    value.push(' ');
                    value.push_str(lines[i + 1].trim());
                    i += 1;
                }
                need.options.push((key, value));
                i += 1;
            } else {
                break;
            }
        }

        // Body lines (free text under the directive — must be indented
        // more than the directive itself).
        while i < lines.len() {
            let l = lines[i];
            if l.trim().is_empty() {
                need.body_lines.push(String::new());
                i += 1;
                continue;
            }
            let leading = leading_ws(l);
            if leading > directive_indent {
                need.body_lines.push(l.trim().to_owned());
                i += 1;
            } else {
                break;
            }
        }

        // Belt-and-suspenders: skip RST template placeholders that escaped
        // the code-block filter. Template IDs and link targets use angle-
        // bracketed slots like `<Title>`, `<ID from feature>`. Also drop
        // cross-repo template-placeholder IDs that downstream eclipse
        // repos copied verbatim from module_template.
        let id = need.id().to_owned();
        let id_lower = id.to_lowercase();
        if id.is_empty()
            || id.contains('<')
            || id.contains('>')
            || TEMPLATE_PLACEHOLDER_IDS.contains(&id_lower.as_str())
        {
            continue;
        }
        // Drop link targets that are template placeholders so they don't
        // create spurious "target does not exist" diagnostics. Covers
        // both `<...>`-bracketed values AND link options whose targets
        // are (or include) a known `TEMPLATE_PLACEHOLDER_IDS` member —
        // those targets have been globally filtered out of the artifact
        // set, so any link to them would dangle.
        let link_target_split = Regex::new(r"[\s,;]+").expect("valid split regex");
        need.options.retain(|(k, v)| {
            if !links.contains_key(k.as_str()) {
                return true;
            }
            if v.contains('<') || v.contains('>') {
                return false;
            }
            // Drop the option entirely iff every target in it is a
            // template placeholder; partial drops would silently lose
            // valid targets, so we keep the option if any survive.
            let any_real = link_target_split.split(v).any(|t| {
                let t = t.trim();
                !t.is_empty() && !TEMPLATE_PLACEHOLDER_IDS.contains(&t.to_lowercase().as_str())
            });
            any_real
        });

        needs.push(need);
    }
    needs
}

fn leading_ws(s: &str) -> usize {
    s.bytes().take_while(|b| matches!(b, b' ' | b'\t')).count()
}

// ---------------------------------------------------------------------------
// Conversion: ParsedNeed → rivet Artifact
// ---------------------------------------------------------------------------

/// Eclipse IDs use `prefix__group__short`.  We keep the structure verbatim
/// (preserving cross-reference fidelity — rivet doesn't enforce a global
/// ID regex, only per-schema prefixes) and uppercase as a cosmetic
/// rivet-house-style nudge.
fn normalise_id(raw: &str) -> String {
    raw.trim().replace(' ', "").to_uppercase()
}

/// Convert one parsed need into a rivet Artifact.
///
/// Returns `None` (and bumps the appropriate stats counter) when:
/// - the eclipse type is not in [`TYPE_MAP`]
/// - the need has no `:id:` option
pub fn convert_need(need: &ParsedNeed, stats: &mut CoverageStats) -> Option<Artifact> {
    let types = type_map();
    let links_map = link_map();
    let statuses = status_map();
    let fields_map = field_map();
    let native: std::collections::HashSet<&str> = NATIVE_OPTIONS.iter().copied().collect();

    let rivet_type = match types.get(need.eclipse_type.as_str()) {
        Some(t) => (*t).to_owned(),
        None => {
            CoverageStats::bump(&mut stats.skipped_unknown_type, &need.eclipse_type);
            return None;
        }
    };
    let raw_id = need.id();
    if raw_id.is_empty() {
        stats.skipped_no_id += 1;
        return None;
    }

    let id = normalise_id(raw_id);
    let title = if need.title.is_empty() {
        id.clone()
    } else {
        need.title.clone()
    };

    // Status mapping (eclipse `valid` → rivet `approved` etc.).
    let raw_status = need.option("status").unwrap_or("").trim();
    let status = if raw_status.is_empty() {
        None
    } else {
        Some(
            statuses
                .get(raw_status)
                .copied()
                .unwrap_or("draft")
                .to_owned(),
        )
    };

    // Tags — eclipse stores comma-separated; preserve eclipse type as a
    // tag when rivet collapses it (e.g. gd_* → guidance).
    let mut tags: Vec<String> = match need.option("tags") {
        Some(raw) => raw
            .split(',')
            .map(|t| t.trim().to_owned())
            .filter(|t| !t.is_empty())
            .collect(),
        None => Vec::new(),
    };
    if need.eclipse_type != rivet_type.replace('-', "_") {
        tags.push(format!("eclipse:{}", need.eclipse_type));
    }

    // Description = body text (rejoin paragraphs).
    let description = {
        let joined = need.body_lines.join("\n");
        let trimmed = joined.trim();
        if trimmed.is_empty() {
            None
        } else {
            // Collapse 3+ blank lines down to one paragraph break.
            let re = Regex::new(r"\n{3,}").expect("collapse re compiles");
            Some(re.replace_all(trimmed, "\n\n").into_owned())
        }
    };

    let mut fields: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
    let mut out_links: Vec<Link> = Vec::new();
    let target_split = Regex::new(r"[\s,;]+").expect("target_split compiles");

    for (key, raw_value) in &need.options {
        if native.contains(&key.as_str()) {
            continue;
        }
        if let Some(rivet_link) = links_map.get(key.as_str()) {
            // Source-specific link routing: gd_* with `:satisfies:` in
            // eclipse maps to `fulfils-process-req` in rivet's score
            // schema so the type-target restriction passes cleanly.
            let link_type = if key == "satisfies" && need.eclipse_type.starts_with("gd_") {
                "fulfils-process-req".to_owned()
            } else {
                (*rivet_link).to_owned()
            };
            for target in target_split.split(raw_value) {
                let target = target.trim();
                if target.is_empty() {
                    continue;
                }
                out_links.push(Link {
                    link_type: link_type.clone(),
                    target: normalise_id(target),
                    external: None,
                });
            }
            continue;
        }
        if let Some(rivet_field) = fields_map.get(key.as_str()) {
            fields.insert(
                (*rivet_field).to_owned(),
                serde_yaml::Value::String(raw_value.clone()),
            );
            continue;
        }
        // Unmapped option — log it (so it shows up in the coverage report)
        // and stash as a raw field so no data is lost.
        CoverageStats::bump(
            &mut stats.unknown_options,
            &format!("{}:{}", need.eclipse_type, key),
        );
        fields.insert(key.clone(), serde_yaml::Value::String(raw_value.clone()));
    }

    stats.converted += 1;
    CoverageStats::bump(&mut stats.by_type, &rivet_type);

    Some(Artifact {
        id,
        artifact_type: rivet_type,
        title,
        description,
        status,
        tags,
        links: out_links,
        fields,
        fields_per_variant: Default::default(),
        provenance: None,
        source_file: need.source.clone(),
    })
}

// ---------------------------------------------------------------------------
// Directory walk + de-dup
// ---------------------------------------------------------------------------

/// Walk `root` recursively, scan every `.rst` file, return the converted
/// artifacts plus the coverage stats.
///
/// Skips:
/// - anything under `/_build/` or `/.git/`
/// - `score_metamodel/tests/` — that's eclipse-score's own intentionally-
///   broken metamodel-test corpus (per the falsification-journey step 9)
///
/// De-duplication: eclipse occasionally re-declares the same need in
/// multiple files for inclusion machinery; we keep the first occurrence.
pub fn convert_directory(
    root: &Path,
    stats: &mut CoverageStats,
) -> Result<Vec<Artifact>, Error> {
    let mut artifacts: Vec<Artifact> = Vec::new();
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut rst_files: Vec<PathBuf> = Vec::new();
    collect_rst_files(root, &mut rst_files)?;
    rst_files.sort();

    for path in &rst_files {
        let spath = path.to_string_lossy();
        if spath.contains("/_build/")
            || spath.contains("/.git/")
            || spath.contains("/score_metamodel/tests/")
        {
            continue;
        }
        stats.files_scanned += 1;
        let content = match std::fs::read_to_string(path) {
            Ok(c) => c,
            Err(e) => {
                log::warn!("failed to read {}: {e}", path.display());
                continue;
            }
        };
        for need in parse_rst(&content, Some(path)) {
            if let Some(art) = convert_need(&need, stats) {
                if seen.insert(art.id.clone()) {
                    artifacts.push(art);
                }
            }
        }
    }
    Ok(artifacts)
}

fn collect_rst_files(dir: &Path, out: &mut Vec<PathBuf>) -> Result<(), Error> {
    let entries = std::fs::read_dir(dir)
        .map_err(|e| Error::Io(format!("reading {}: {e}", dir.display())))?;
    for entry in entries {
        let entry = entry.map_err(|e| Error::Io(e.to_string()))?;
        let path = entry.path();
        if path.is_dir() {
            // Cheap skip — avoid recursing into the corpora we're going
            // to filter out anyway.
            let name = path.file_name().and_then(|s| s.to_str()).unwrap_or("");
            if name == "_build" || name == ".git" {
                continue;
            }
            collect_rst_files(&path, out)?;
        } else if path.extension().is_some_and(|e| e == "rst") {
            out.push(path);
        }
    }
    Ok(())
}

// ---------------------------------------------------------------------------
// needs.json input mode
// ---------------------------------------------------------------------------

#[derive(Debug, Deserialize)]
struct NeedsJsonFile {
    current_version: Option<String>,
    #[serde(default)]
    versions: HashMap<String, NeedsVersion>,
}

#[derive(Debug, Deserialize)]
struct NeedsVersion {
    #[serde(default)]
    needs: HashMap<String, NeedsItem>,
}

#[derive(Debug, Deserialize)]
struct NeedsItem {
    #[serde(default)]
    id: Option<String>,
    #[serde(default, rename = "type")]
    need_type: Option<String>,
    #[serde(default)]
    title: Option<String>,
    #[serde(default)]
    description: Option<String>,
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    tags: Vec<String>,
    /// All remaining keys.  sphinx-needs' JSON serialises option values as
    /// strings or arrays depending on the option's declared type, so we
    /// keep them as `serde_json::Value` and stringify per option.
    #[serde(flatten)]
    extra: HashMap<String, serde_json::Value>,
}

/// Convert a sphinx-needs `needs.json` export into rivet artifacts using
/// the same eclipse-score mappings as the RST path.
///
/// This is the simpler input mode: sphinx-needs has already done the RST
/// parsing for us, so we just apply [`TYPE_MAP`], [`LINK_MAP`], etc.
pub fn convert_needs_json(
    content: &str,
    stats: &mut CoverageStats,
) -> Result<Vec<Artifact>, Error> {
    let file: NeedsJsonFile = serde_json::from_str(content)
        .map_err(|e| Error::Adapter(format!("needs.json parse error: {e}")))?;
    let version = match &file.current_version {
        Some(cv) => file.versions.get(cv).or_else(|| file.versions.get("")),
        None => file.versions.values().next(),
    }
    .ok_or_else(|| Error::Adapter("needs.json: no versions found".into()))?;

    // Convert each entry by faking it back into a ParsedNeed and reusing
    // `convert_need`.  Keeps the corpus-oracle-validated mappings as the
    // single source of truth.
    let mut artifacts: Vec<Artifact> = Vec::new();
    let mut seen: std::collections::HashSet<String> = std::collections::HashSet::new();
    let mut ordered_keys: Vec<&String> = version.needs.keys().collect();
    ordered_keys.sort();
    for key in ordered_keys {
        let item = &version.needs[key];
        let Some(etype) = item.need_type.as_deref() else {
            continue;
        };
        let Some(id) = item.id.as_deref() else {
            stats.skipped_no_id += 1;
            continue;
        };
        if id.contains('<') || id.contains('>') {
            continue;
        }
        let mut need = ParsedNeed {
            eclipse_type: etype.to_owned(),
            title: item.title.clone().unwrap_or_default(),
            source: None,
            source_line: 0,
            body_lines: item
                .description
                .as_deref()
                .map(|d| d.split('\n').map(str::to_owned).collect())
                .unwrap_or_default(),
            ..Default::default()
        };
        need.options.push(("id".into(), id.to_owned()));
        if let Some(s) = item.status.as_deref() {
            need.options.push(("status".into(), s.to_owned()));
        }
        if !item.tags.is_empty() {
            need.options.push(("tags".into(), item.tags.join(",")));
        }
        for (k, v) in &item.extra {
            let raw = json_value_to_option_string(v);
            need.options.push((k.clone(), raw));
        }
        if let Some(art) = convert_need(&need, stats) {
            if seen.insert(art.id.clone()) {
                artifacts.push(art);
            }
        }
    }
    Ok(artifacts)
}

fn json_value_to_option_string(v: &serde_json::Value) -> String {
    match v {
        serde_json::Value::Null => String::new(),
        serde_json::Value::Bool(b) => b.to_string(),
        serde_json::Value::Number(n) => n.to_string(),
        serde_json::Value::String(s) => s.clone(),
        serde_json::Value::Array(arr) => arr
            .iter()
            .map(json_value_to_option_string)
            .collect::<Vec<_>>()
            .join(", "),
        serde_json::Value::Object(_) => v.to_string(),
    }
}

// ---------------------------------------------------------------------------
// Coverage report rendering (markdown)
// ---------------------------------------------------------------------------

/// Render the coverage report — verbatim shape of the Python tool's
/// `--report` output so existing tooling that reads it keeps working.
pub fn render_report(label: &str, stats: &CoverageStats, total_emitted: usize) -> String {
    use std::fmt::Write as _;
    let mut s = String::new();
    let _ = writeln!(s, "# Coverage report — {label}");
    let _ = writeln!(s);
    let _ = writeln!(
        s,
        "Generated by `rivet import-results --format sphinx-needs` from `{label}`."
    );
    let _ = writeln!(s);
    let _ = writeln!(s, "## Headline");
    let _ = writeln!(s);
    let _ = writeln!(s, "- RST files scanned: **{}**", stats.files_scanned);
    let _ = writeln!(s, "- Needs converted: **{}**", stats.converted);
    let _ = writeln!(s, "- Artifacts emitted (after de-dup): **{total_emitted}**");
    let skipped_unknown: usize = stats.skipped_unknown_type.values().sum();
    let _ = writeln!(
        s,
        "- Needs skipped (unknown eclipse type): **{skipped_unknown}**"
    );
    let _ = writeln!(s, "- Needs skipped (no `:id:`): **{}**", stats.skipped_no_id);
    let _ = writeln!(s);
    let _ = writeln!(s, "## Falsification surface");
    let _ = writeln!(s);
    let _ = writeln!(
        s,
        "Anything below means rivet's schema, or this converter, does not yet"
    );
    let _ = writeln!(
        s,
        "round-trip the upstream model losslessly. Each line is a discrete"
    );
    let _ = writeln!(
        s,
        "gap that can be closed by a schema delta or a converter mapping."
    );
    let _ = writeln!(s);

    if !stats.skipped_unknown_type.is_empty() {
        let _ = writeln!(s, "### Unknown eclipse need types");
        let _ = writeln!(s);
        let _ = writeln!(
            s,
            "These directives appeared in upstream RST but are not in `TYPE_MAP`."
        );
        let _ = writeln!(s);
        let _ = writeln!(s, "| Eclipse type | Count |");
        let _ = writeln!(s, "| --- | ---: |");
        let mut sorted: Vec<(&String, &usize)> = stats.skipped_unknown_type.iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(a.1).then(a.0.cmp(b.0)));
        for (k, v) in sorted {
            let _ = writeln!(s, "| `{k}` | {v} |");
        }
        let _ = writeln!(s);
    }
    if !stats.unknown_options.is_empty() {
        let _ = writeln!(s, "### Unknown option keys");
        let _ = writeln!(s);
        let _ = writeln!(
            s,
            "Option keys on a known need type that the converter did not"
        );
        let _ = writeln!(
            s,
            "recognise. They were stashed in `fields:` verbatim so no data"
        );
        let _ = writeln!(s, "is lost, but `rivet validate` will flag them as undeclared.");
        let _ = writeln!(s);
        let _ = writeln!(s, "| Where | Count |");
        let _ = writeln!(s, "| --- | ---: |");
        let mut sorted: Vec<(&String, &usize)> = stats.unknown_options.iter().collect();
        sorted.sort_by(|a, b| b.1.cmp(a.1).then(a.0.cmp(b.0)));
        for (k, v) in sorted.into_iter().take(40) {
            let _ = writeln!(s, "| `{k}` | {v} |");
        }
        let _ = writeln!(s);
    }

    let _ = writeln!(s, "## Per-type counts (converted)");
    let _ = writeln!(s);
    let _ = writeln!(s, "| Rivet type | Count |");
    let _ = writeln!(s, "| --- | ---: |");
    let mut by_type: Vec<(&String, &usize)> = stats.by_type.iter().collect();
    by_type.sort_by(|a, b| b.1.cmp(a.1).then(a.0.cmp(b.0)));
    for (k, v) in by_type {
        let _ = writeln!(s, "| `{k}` | {v} |");
    }
    s
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    /// rivet: verifies REQ-025
    ///
    /// Bulleted-list need directives at column 4 must parse — eclipse's
    /// ISO 26262 std_req tree puts them under list items.
    #[test]
    fn parses_indented_directive() {
        let rst = "
* Requirements

    .. std_req:: management_5421
       :id: std_req__iso26262__rq__management_5421
       :status: valid

       The body of the requirement.
";
        let needs = parse_rst(rst, None);
        assert_eq!(needs.len(), 1, "expected one need parsed: {needs:?}");
        let n = &needs[0];
        assert_eq!(n.eclipse_type, "std_req");
        assert_eq!(n.id(), "std_req__iso26262__rq__management_5421");
        assert_eq!(n.option("status"), Some("valid"));
    }

    /// rivet: verifies REQ-025
    ///
    /// Need directives inside `.. code-block:: rst` are documentation
    /// templates and must be ignored — sphinx-needs ignores them.
    #[test]
    fn skips_directives_inside_code_block() {
        let rst = "
.. code-block:: rst

   .. feat_saf_fmea:: <Title>
      :id: feat_saf_fmea__<feature>__<short>
      :status: valid

.. feat_saf_fmea:: Real one
   :id: feat_saf_fmea__real__one
   :status: valid
";
        let needs = parse_rst(rst, None);
        // Only the real one should land — the templated one has `<` in id.
        assert_eq!(needs.len(), 1, "code-block need leaked: {needs:?}");
        assert_eq!(needs[0].id(), "feat_saf_fmea__real__one");
    }

    /// rivet: verifies REQ-025
    ///
    /// Template-placeholder IDs (with `<...>` slots) must be dropped even
    /// when the code-block filter doesn't catch them.
    #[test]
    fn skips_template_placeholder_id() {
        let rst = "
.. feat_req:: <Title>
   :id: feat_req__<feature>__<short>
   :status: valid
";
        let needs = parse_rst(rst, None);
        assert!(
            needs.is_empty(),
            "template-placeholder id should drop: {needs:?}"
        );
    }

    /// rivet: verifies REQ-025
    ///
    /// Known cross-repo placeholder IDs (eclipse `module_template` ships
    /// `stkh_req__docgen_enabled__example`, which 7+ downstream repos
    /// copy verbatim) must be dropped at parse time so the corpus oracle
    /// doesn't see N duplicate declarations across N source paths.
    /// Links pointing *at* such a placeholder ID are also dropped, so
    /// no spurious "target does not exist" errors fire after the source
    /// disappears.
    #[test]
    fn skips_known_cross_repo_template_id_and_dangling_link() {
        let rst = "
.. stkh_req:: Documentation Builds Are Possible Example
   :id: stkh_req__docgen_enabled__example
   :status: valid

.. feat_req:: Something That Satisfies The Placeholder
   :id: feat_req__downstream__one
   :status: valid
   :satisfies: stkh_req__docgen_enabled__example

.. feat_req:: Mixed Satisfies (Placeholder + Real Target)
   :id: feat_req__downstream__two
   :status: valid
   :satisfies: stkh_req__docgen_enabled__example, stkh_req__real__alpha
";
        let needs = parse_rst(rst, None);
        assert_eq!(
            needs.len(),
            2,
            "placeholder source need should be dropped, real reqs retained: {needs:?}"
        );
        let link_map_owned = link_map();

        // First feat-req: its only satisfies target is the placeholder.
        // The whole option must be dropped, so the need carries no links.
        let downstream_one = &needs[0];
        assert_eq!(downstream_one.id(), "feat_req__downstream__one");
        assert!(
            !downstream_one
                .options
                .iter()
                .any(|(k, _)| link_map_owned.contains_key(k.as_str())),
            "feat_req__downstream__one should have no link options after filtering: {:?}",
            downstream_one.options
        );

        // Second feat-req: satisfies a placeholder AND a real target.
        // The option must survive so the real target is not lost.
        let downstream_two = &needs[1];
        assert_eq!(downstream_two.id(), "feat_req__downstream__two");
        assert!(
            downstream_two
                .options
                .iter()
                .any(|(k, v)| k == "satisfies" && v.contains("stkh_req__real__alpha")),
            "feat_req__downstream__two must keep its real satisfies target: {:?}",
            downstream_two.options
        );
    }

    /// rivet: verifies REQ-025
    ///
    /// `gd_*` types with `:satisfies:` route to `fulfils-process-req`
    /// rather than `satisfies` — the eclipse predicate maps to a rivet
    /// link type whose source/target restriction differs.
    #[test]
    fn gd_satisfies_routes_to_fulfils_process_req() {
        let rst = "
.. gd_req:: Guidance one
   :id: gd_req__example__one
   :status: valid
   :satisfies: wf__feat_request, wf__feat_review
";
        let needs = parse_rst(rst, None);
        assert_eq!(needs.len(), 1);
        let mut stats = CoverageStats::default();
        let art = convert_need(&needs[0], &mut stats).expect("conversion");
        assert_eq!(art.artifact_type, "guidance");
        assert_eq!(art.links.len(), 2);
        for l in &art.links {
            assert_eq!(l.link_type, "fulfils-process-req", "wrong route: {:?}", l);
        }
    }

    /// rivet: verifies REQ-025
    ///
    /// Non-`gd_*` types keep `satisfies` as `satisfies` — the routing is
    /// source-type-specific.
    #[test]
    fn non_gd_satisfies_stays_as_satisfies() {
        let rst = "
.. feat_req:: Feature one
   :id: feat_req__example__one
   :status: valid
   :satisfies: stkh_req__safety
";
        let needs = parse_rst(rst, None);
        let mut stats = CoverageStats::default();
        let art = convert_need(&needs[0], &mut stats).expect("conversion");
        assert_eq!(art.links.len(), 1);
        assert_eq!(art.links[0].link_type, "satisfies");
        assert_eq!(art.links[0].target, "STKH_REQ__SAFETY");
    }

    /// rivet: verifies REQ-025
    ///
    /// Link option values must split on `[\s,;]+` — eclipse uses `;` in
    /// at least one RST.  Splitting only on `,` would lose targets.
    #[test]
    fn link_value_splits_on_semicolon_and_whitespace() {
        let rst = "
.. comp_req:: Component
   :id: comp_req__example__one
   :status: valid
   :satisfies: feat_req__a;feat_req__b, feat_req__c feat_req__d
";
        let needs = parse_rst(rst, None);
        let mut stats = CoverageStats::default();
        let art = convert_need(&needs[0], &mut stats).expect("conversion");
        let targets: Vec<&str> = art.links.iter().map(|l| l.target.as_str()).collect();
        assert_eq!(
            targets,
            vec![
                "FEAT_REQ__A",
                "FEAT_REQ__B",
                "FEAT_REQ__C",
                "FEAT_REQ__D"
            ]
        );
    }

    /// rivet: verifies REQ-025
    ///
    /// Eclipse `:safety:` maps to rivet `safety-level`; status maps from
    /// eclipse-vocabulary; collapsed types tag with the eclipse type.
    #[test]
    fn mappings_applied_endtoend() {
        let rst = "
.. doc_concept:: My doc
   :id: doc__example__one
   :status: valid
   :safety: ASIL_B
   :tags: x, y
   :realizes: wp__something

   Body text.
";
        let needs = parse_rst(rst, None);
        let mut stats = CoverageStats::default();
        let art = convert_need(&needs[0], &mut stats).expect("conversion");
        assert_eq!(art.artifact_type, "doc");
        assert_eq!(art.status.as_deref(), Some("approved"));
        // Tags include both authored ones AND the eclipse-type tag because
        // `doc_concept` collapses onto `doc`.
        assert!(art.tags.iter().any(|t| t == "x"));
        assert!(art.tags.iter().any(|t| t == "y"));
        assert!(art.tags.iter().any(|t| t == "eclipse:doc_concept"));
        assert_eq!(
            art.fields.get("safety-level"),
            Some(&serde_yaml::Value::String("ASIL_B".into()))
        );
        assert_eq!(art.links.len(), 1);
        assert_eq!(art.links[0].link_type, "realizes");
        assert_eq!(art.links[0].target, "WP__SOMETHING");
        assert_eq!(art.description.as_deref(), Some("Body text."));
    }

    /// rivet: verifies REQ-025
    ///
    /// Unknown option keys land in `fields:` verbatim AND surface in the
    /// `unknown_options` counter for the coverage report.
    #[test]
    fn unknown_option_logged_and_kept() {
        let rst = "
.. feat_req:: One
   :id: feat_req__example__one
   :status: valid
   :weird_eclipse_extension: payload-value
";
        let needs = parse_rst(rst, None);
        let mut stats = CoverageStats::default();
        let art = convert_need(&needs[0], &mut stats).expect("conversion");
        assert_eq!(
            art.fields.get("weird_eclipse_extension"),
            Some(&serde_yaml::Value::String("payload-value".into()))
        );
        let key = "feat_req:weird_eclipse_extension";
        assert_eq!(stats.unknown_options.get(key), Some(&1));
    }

    /// rivet: verifies REQ-025
    ///
    /// `convert_directory` over a small fixture writes the expected
    /// counts and de-dupes IDs.
    #[test]
    fn directory_walk_with_dedup() {
        let tmp = tempfile::tempdir().unwrap();
        std::fs::write(
            tmp.path().join("a.rst"),
            "
.. feat_req:: One
   :id: feat_req__shared
   :status: valid
",
        )
        .unwrap();
        std::fs::write(
            tmp.path().join("b.rst"),
            "
.. feat_req:: Two
   :id: feat_req__shared
   :status: valid

.. feat_req:: Three
   :id: feat_req__other
   :status: valid
",
        )
        .unwrap();
        let mut stats = CoverageStats::default();
        let arts = convert_directory(tmp.path(), &mut stats).unwrap();
        // 3 needs parsed but de-dupe to 2 artifacts.
        assert_eq!(stats.files_scanned, 2);
        assert_eq!(stats.converted, 3);
        assert_eq!(arts.len(), 2);
        let ids: Vec<&str> = arts.iter().map(|a| a.id.as_str()).collect();
        assert!(ids.contains(&"FEAT_REQ__SHARED"));
        assert!(ids.contains(&"FEAT_REQ__OTHER"));
    }

    /// rivet: verifies REQ-025
    ///
    /// `score_metamodel/tests/` is eclipse-score-docs-as-code's own
    /// metamodel test corpus — deliberately broken examples.  Must be
    /// skipped to keep the corpus oracle GREEN.
    #[test]
    fn score_metamodel_tests_directory_skipped() {
        let tmp = tempfile::tempdir().unwrap();
        let nested = tmp.path().join("score_metamodel/tests");
        std::fs::create_dir_all(&nested).unwrap();
        std::fs::write(
            nested.join("broken.rst"),
            "
.. feat_req:: Intentionally broken
   :id: feat_req__broken
   :status: valid
",
        )
        .unwrap();
        // Plus one valid file at the root level.
        std::fs::write(
            tmp.path().join("valid.rst"),
            "
.. feat_req:: Valid
   :id: feat_req__valid
   :status: valid
",
        )
        .unwrap();
        let mut stats = CoverageStats::default();
        let arts = convert_directory(tmp.path(), &mut stats).unwrap();
        let ids: Vec<&str> = arts.iter().map(|a| a.id.as_str()).collect();
        assert!(ids.contains(&"FEAT_REQ__VALID"));
        assert!(
            !ids.contains(&"FEAT_REQ__BROKEN"),
            "metamodel/tests need leaked through"
        );
    }

    /// rivet: verifies REQ-025
    ///
    /// needs.json input mode applies the same mappings as the RST path.
    #[test]
    fn needs_json_mode() {
        let json = r#"{
            "current_version": "1.0",
            "versions": {
                "1.0": {
                    "needs": {
                        "feat_req__one": {
                            "id": "feat_req__one",
                            "type": "feat_req",
                            "title": "F1",
                            "status": "valid",
                            "tags": ["x"],
                            "satisfies": "stkh_req__a, stkh_req__b"
                        }
                    }
                }
            }
        }"#;
        let mut stats = CoverageStats::default();
        let arts = convert_needs_json(json, &mut stats).unwrap();
        assert_eq!(arts.len(), 1);
        let a = &arts[0];
        assert_eq!(a.id, "FEAT_REQ__ONE");
        assert_eq!(a.artifact_type, "feat-req");
        assert_eq!(a.status.as_deref(), Some("approved"));
        assert_eq!(a.links.len(), 2);
        assert_eq!(a.links[0].link_type, "satisfies");
    }

    /// rivet: verifies REQ-025
    ///
    /// Coverage report contains the headline section, the per-type table,
    /// and any unknown-types / unknown-options block when populated.
    #[test]
    fn report_renders_sections() {
        let mut stats = CoverageStats::default();
        stats.files_scanned = 30;
        stats.converted = 61;
        CoverageStats::bump(&mut stats.by_type, "doc");
        CoverageStats::bump(&mut stats.by_type, "doc");
        CoverageStats::bump(&mut stats.by_type, "comp-req");
        CoverageStats::bump(&mut stats.skipped_unknown_type, "weird_eclipse_type");
        CoverageStats::bump(&mut stats.unknown_options, "feat_req:custom");
        let out = render_report("test", &stats, 61);
        assert!(out.contains("RST files scanned: **30**"));
        assert!(out.contains("Needs converted: **61**"));
        assert!(out.contains("`doc` | 2"));
        assert!(out.contains("`comp-req` | 1"));
        assert!(out.contains("weird_eclipse_type"));
        assert!(out.contains("feat_req:custom"));
    }
}
