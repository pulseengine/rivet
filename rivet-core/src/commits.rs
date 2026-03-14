//! Commit-to-artifact traceability.
//!
//! Parses git commit messages, extracts artifact references from trailers,
//! classifies commits, and produces a traceability analysis.

use std::collections::{BTreeMap, BTreeSet, HashSet};
use std::process::Command;

use crate::error::Error;

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// A parsed git commit with extracted metadata.
#[derive(Debug, Clone)]
pub struct ParsedCommit {
    /// Full commit hash.
    pub hash: String,
    /// First line of the commit message.
    pub subject: String,
    /// Full commit body (everything after the subject).
    pub body: String,
    /// Author name.
    pub author: String,
    /// Author date (ISO-8601).
    pub date: String,
    /// Conventional-commit type if present (e.g. "feat", "fix").
    pub commit_type: Option<String>,
    /// Artifact IDs extracted from trailers, keyed by link type.
    pub artifact_refs: BTreeMap<String, Vec<String>>,
    /// Files changed by this commit.
    pub changed_files: Vec<String>,
    /// Whether the skip trailer was present.
    pub has_skip_trailer: bool,
}

/// Classification of a commit based on its artifact references.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CommitClass {
    /// All referenced artifact IDs exist in the store.
    Linked,
    /// At least one referenced artifact ID does not exist.
    BrokenRef,
    /// No artifact references at all (and not exempt).
    Orphan,
    /// Exempt by commit type (e.g. chore, ci, docs).
    Exempt,
}

/// A broken reference found in a commit.
#[derive(Debug, Clone)]
pub struct BrokenRef {
    /// Commit hash.
    pub hash: String,
    /// Commit subject.
    pub subject: String,
    /// The artifact ID that was referenced but not found.
    pub missing_id: String,
    /// The link type / trailer key under which it was referenced.
    pub link_type: String,
}

/// Full analysis of a set of commits against a known artifact set.
#[derive(Debug, Clone)]
pub struct CommitAnalysis {
    /// Commits with all artifact refs resolved.
    pub linked: Vec<ParsedCommit>,
    /// Broken references.
    pub broken_refs: Vec<BrokenRef>,
    /// Commits with no artifact references (and not exempt).
    pub orphans: Vec<ParsedCommit>,
    /// Commits exempt by type.
    pub exempt: Vec<ParsedCommit>,
    /// Set of artifact IDs that are referenced by at least one commit.
    pub artifact_coverage: BTreeSet<String>,
    /// Artifact IDs that are in the known set but never referenced by any commit.
    pub unimplemented: BTreeSet<String>,
}

// ---------------------------------------------------------------------------
// Parsing helpers
// ---------------------------------------------------------------------------

/// Extract the conventional-commit type from a subject line.
///
/// Expects patterns like `feat: add thing` or `fix(scope): blah`.
/// Returns `None` if the subject doesn't match.
pub fn parse_commit_type(subject: &str) -> Option<String> {
    let subject = subject.trim();
    // Find the colon that separates type from description
    let colon_pos = subject.find(':')?;
    let prefix = &subject[..colon_pos];
    // Strip optional scope: "feat(scope)" -> "feat"
    let type_part = if let Some(paren) = prefix.find('(') {
        &prefix[..paren]
    } else {
        prefix
    };
    let type_part = type_part.trim();
    // Validate: must be non-empty, lowercase ascii
    if type_part.is_empty() || !type_part.chars().all(|c| c.is_ascii_lowercase()) {
        return None;
    }
    Some(type_part.to_string())
}

/// Parse git trailers from a commit message body.
///
/// Trailers are `Key: value` lines at the end of the commit message,
/// separated from the body by a blank line.  We look for trailer lines
/// anywhere in the body for robustness.
pub fn parse_trailers(message: &str) -> BTreeMap<String, Vec<String>> {
    let mut result: BTreeMap<String, Vec<String>> = BTreeMap::new();
    for line in message.lines() {
        let line = line.trim();
        if let Some((key, value)) = line.split_once(':') {
            let key = key.trim();
            let value = value.trim();
            // Trailer keys: non-empty, no spaces inside, start with uppercase
            if !key.is_empty()
                && !key.contains(' ')
                && key.starts_with(|c: char| c.is_ascii_uppercase())
                && !value.is_empty()
            {
                result
                    .entry(key.to_string())
                    .or_default()
                    .push(value.to_string());
            }
        }
    }
    result
}

/// Extract artifact IDs from a trailer value.
///
/// Artifact IDs are uppercase-letter prefix + hyphen + digits, e.g.
/// "REQ-001", "FEAT-42", "DD-007".  Multiple IDs can appear separated
/// by commas or whitespace.
pub fn extract_artifact_ids(value: &str) -> Vec<String> {
    let mut ids = Vec::new();
    // Split on commas and whitespace
    for token in value.split(|c: char| c == ',' || c.is_ascii_whitespace()) {
        let token = token.trim();
        if is_artifact_id(token) {
            ids.push(token.to_string());
        }
    }
    ids
}

/// Check whether a string looks like an artifact ID (PREFIX-DIGITS).
fn is_artifact_id(s: &str) -> bool {
    if let Some(pos) = s.find('-') {
        let prefix = &s[..pos];
        let suffix = &s[pos + 1..];
        !prefix.is_empty()
            && prefix.chars().all(|c| c.is_ascii_uppercase())
            && !suffix.is_empty()
            && suffix.chars().all(|c| c.is_ascii_digit())
    } else {
        false
    }
}

/// Parse a full commit message: extract trailer-based artifact references
/// and detect the skip trailer.
///
/// `trailer_map` maps trailer keys (e.g. "Implements") to link types
/// (e.g. "implements").  `skip_trailer` is the full "Key: value" string
/// that marks a commit as intentionally unlinked.
pub fn parse_commit_message(
    message: &str,
    trailer_map: &BTreeMap<String, String>,
    skip_trailer: &str,
) -> (BTreeMap<String, Vec<String>>, bool) {
    let raw_trailers = parse_trailers(message);
    let mut artifact_refs: BTreeMap<String, Vec<String>> = BTreeMap::new();

    for (trailer_key, link_type) in trailer_map {
        if let Some(values) = raw_trailers.get(trailer_key) {
            for value in values {
                let ids = extract_artifact_ids(value);
                if !ids.is_empty() {
                    artifact_refs
                        .entry(link_type.clone())
                        .or_default()
                        .extend(ids);
                }
            }
        }
    }

    // Check for skip trailer
    let has_skip = message.lines().any(|line| line.trim() == skip_trailer);

    (artifact_refs, has_skip)
}

// ---------------------------------------------------------------------------
// Git log integration (Task 3)
// ---------------------------------------------------------------------------

/// Record separator for structured git log output.
const RECORD_SEP: &str = "---RIVET-RECORD---";
/// Field separator within a record.
const FIELD_SEP: &str = "---RIVET-FIELD---";

/// Parse a single structured git log entry into a `ParsedCommit`.
///
/// Expected format (fields separated by `FIELD_SEP`):
///   hash FIELD_SEP subject FIELD_SEP body FIELD_SEP author FIELD_SEP date FIELD_SEP files
///
/// `files` is newline-separated list of changed file paths.
pub fn parse_git_log_entry(
    raw: &str,
    trailer_map: &BTreeMap<String, String>,
    skip_trailer: &str,
) -> Option<ParsedCommit> {
    let parts: Vec<&str> = raw.split(FIELD_SEP).collect();
    if parts.len() < 5 {
        return None;
    }

    let hash = parts[0].trim().to_string();
    let subject = parts[1].trim().to_string();
    let body = parts[2].trim().to_string();
    let author = parts[3].trim().to_string();
    let date = parts[4].trim().to_string();

    let changed_files: Vec<String> = if parts.len() > 5 {
        parts[5]
            .lines()
            .map(|l| l.trim().to_string())
            .filter(|l| !l.is_empty())
            .collect()
    } else {
        Vec::new()
    };

    let commit_type = parse_commit_type(&subject);

    // Build the full message for trailer parsing
    let full_message = if body.is_empty() {
        subject.clone()
    } else {
        format!("{}\n\n{}", subject, body)
    };

    let (artifact_refs, has_skip_trailer) =
        parse_commit_message(&full_message, trailer_map, skip_trailer);

    Some(ParsedCommit {
        hash,
        subject,
        body,
        author,
        date,
        commit_type,
        artifact_refs,
        changed_files,
        has_skip_trailer,
    })
}

/// Run `git log` and parse commits in the given range.
///
/// `repo_path` is the path to the git repository.
/// `range` is a git revision range (e.g. "main..HEAD", "HEAD~10..HEAD").
pub fn git_log_commits(
    repo_path: &std::path::Path,
    range: &str,
    trailer_map: &BTreeMap<String, String>,
    skip_trailer: &str,
) -> Result<Vec<ParsedCommit>, Error> {
    let format_str = format!(
        "{}%H{}%s{}%b{}%an{}%aI{}",
        RECORD_SEP, FIELD_SEP, FIELD_SEP, FIELD_SEP, FIELD_SEP, FIELD_SEP
    );

    let output = Command::new("git")
        .arg("-C")
        .arg(repo_path)
        .arg("log")
        .arg(format!("--pretty=format:{format_str}"))
        .arg("--name-only")
        .arg(range)
        .output()
        .map_err(|e| Error::Io(format!("failed to run git log: {}", e)))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(Error::Io(format!("git log failed: {}", stderr)));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let commits: Vec<ParsedCommit> = stdout
        .split(RECORD_SEP)
        .filter(|s| !s.trim().is_empty())
        .filter_map(|entry| parse_git_log_entry(entry, trailer_map, skip_trailer))
        .collect();

    Ok(commits)
}

// ---------------------------------------------------------------------------
// Classification and analysis (Task 4)
// ---------------------------------------------------------------------------

/// Classify a commit based on its artifact references against the set of known IDs.
pub fn classify_commit_refs(
    artifact_refs: &BTreeMap<String, Vec<String>>,
    known_ids: &HashSet<String>,
) -> CommitClass {
    let all_ids: Vec<&String> = artifact_refs.values().flatten().collect();
    if all_ids.is_empty() {
        return CommitClass::Orphan;
    }
    let all_known = all_ids.iter().all(|id| known_ids.contains(id.as_str()));
    if all_known {
        CommitClass::Linked
    } else {
        CommitClass::BrokenRef
    }
}

/// Check whether a commit is exempt based on its conventional-commit type.
pub fn is_exempt(commit: &ParsedCommit, exempt_types: &[String]) -> bool {
    if commit.has_skip_trailer {
        return true;
    }
    if let Some(ref ct) = commit.commit_type {
        exempt_types.iter().any(|et| et == ct)
    } else {
        false
    }
}

/// Check whether any of the changed files fall under a traced path.
pub fn touches_traced_path(changed_files: &[String], traced_paths: &[String]) -> bool {
    if traced_paths.is_empty() {
        // If no traced paths configured, all paths are traced.
        return true;
    }
    changed_files
        .iter()
        .any(|f| traced_paths.iter().any(|tp| f.starts_with(tp)))
}

/// Analyze a set of commits against known artifact IDs.
///
/// Produces a full `CommitAnalysis` with linked, broken, orphan, and exempt
/// classifications plus artifact coverage data.
pub fn analyze_commits(
    commits: Vec<ParsedCommit>,
    known_ids: &HashSet<String>,
    exempt_types: &[String],
    traced_paths: &[String],
    trace_exempt_artifacts: &[String],
    _trailer_map: &BTreeMap<String, String>,
) -> CommitAnalysis {
    let mut linked = Vec::new();
    let mut broken_refs_list = Vec::new();
    let mut orphans = Vec::new();
    let mut exempt = Vec::new();
    let mut artifact_coverage: BTreeSet<String> = BTreeSet::new();

    for commit in commits {
        // 1. Check exemption first
        if is_exempt(&commit, exempt_types) {
            exempt.push(commit);
            continue;
        }

        // 2. Check if it touches any traced path (if configured)
        if !touches_traced_path(&commit.changed_files, traced_paths) {
            exempt.push(commit);
            continue;
        }

        // 3. Classify by artifact references
        let class = classify_commit_refs(&commit.artifact_refs, known_ids);
        match class {
            CommitClass::Linked => {
                // Record coverage
                for ids in commit.artifact_refs.values() {
                    for id in ids {
                        artifact_coverage.insert(id.clone());
                    }
                }
                linked.push(commit);
            }
            CommitClass::BrokenRef => {
                // Collect broken refs
                for (link_type, ids) in &commit.artifact_refs {
                    for id in ids {
                        if !known_ids.contains(id) {
                            broken_refs_list.push(BrokenRef {
                                hash: commit.hash.clone(),
                                subject: commit.subject.clone(),
                                missing_id: id.clone(),
                                link_type: link_type.clone(),
                            });
                        } else {
                            artifact_coverage.insert(id.clone());
                        }
                    }
                }
                // Still count partially linked commits in the linked set
                linked.push(commit);
            }
            CommitClass::Orphan => {
                orphans.push(commit);
            }
            CommitClass::Exempt => {
                // classify_commit_refs doesn't return Exempt, but for completeness
                exempt.push(commit);
            }
        }
    }

    // Compute unimplemented: known IDs minus covered, minus trace-exempt artifacts
    let trace_exempt_set: HashSet<&str> =
        trace_exempt_artifacts.iter().map(|s| s.as_str()).collect();
    let unimplemented: BTreeSet<String> = known_ids
        .iter()
        .filter(|id| !artifact_coverage.contains(*id) && !trace_exempt_set.contains(id.as_str()))
        .cloned()
        .collect();

    CommitAnalysis {
        linked,
        broken_refs: broken_refs_list,
        orphans,
        exempt,
        artifact_coverage,
        unimplemented,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // -- parse_commit_type --

    // rivet: verifies REQ-017
    #[test]
    fn parse_type_feat() {
        assert_eq!(parse_commit_type("feat: add thing"), Some("feat".into()));
    }

    #[test]
    fn parse_type_with_scope() {
        assert_eq!(
            parse_commit_type("fix(parser): handle edge case"),
            Some("fix".into())
        );
    }

    #[test]
    fn parse_type_no_match() {
        assert_eq!(parse_commit_type("Update README"), None);
    }

    #[test]
    fn parse_type_uppercase_rejected() {
        assert_eq!(parse_commit_type("Feat: something"), None);
    }

    // -- parse_trailers --

    // rivet: verifies REQ-017
    #[test]
    fn parse_trailers_basic() {
        let msg = "subject\n\nSome body text.\n\nImplements: REQ-001\nFixes: REQ-002, REQ-003";
        let trailers = parse_trailers(msg);
        assert_eq!(trailers.get("Implements").unwrap(), &vec!["REQ-001"]);
        assert_eq!(trailers.get("Fixes").unwrap(), &vec!["REQ-002, REQ-003"]);
    }

    #[test]
    fn parse_trailers_multiple_same_key() {
        let msg = "subject\n\nImplements: REQ-001\nImplements: REQ-002";
        let trailers = parse_trailers(msg);
        assert_eq!(
            trailers.get("Implements").unwrap(),
            &vec!["REQ-001", "REQ-002"]
        );
    }

    #[test]
    fn parse_trailers_ignores_lowercase_keys() {
        let msg = "subject\n\nnot-a-trailer: value";
        let trailers = parse_trailers(msg);
        assert!(trailers.is_empty());
    }

    // -- extract_artifact_ids --

    // rivet: verifies REQ-017
    #[test]
    fn extract_single_id() {
        assert_eq!(extract_artifact_ids("REQ-001"), vec!["REQ-001"]);
    }

    #[test]
    fn extract_multiple_comma() {
        assert_eq!(
            extract_artifact_ids("REQ-001, FEAT-042"),
            vec!["REQ-001", "FEAT-042"]
        );
    }

    #[test]
    fn extract_multiple_space() {
        assert_eq!(
            extract_artifact_ids("REQ-001 FEAT-042"),
            vec!["REQ-001", "FEAT-042"]
        );
    }

    #[test]
    fn extract_no_ids() {
        assert!(extract_artifact_ids("no ids here").is_empty());
    }

    // -- parse_commit_message --

    // rivet: verifies REQ-017
    #[test]
    fn parse_message_with_trailers() {
        let msg = "feat: add parser\n\nDetailed description.\n\nImplements: REQ-001, REQ-002\nFixes: DD-003";
        let mut trailer_map = BTreeMap::new();
        trailer_map.insert("Implements".into(), "implements".into());
        trailer_map.insert("Fixes".into(), "fixes".into());

        let (refs, skip) = parse_commit_message(msg, &trailer_map, "Trace: skip");
        assert!(!skip);
        assert_eq!(refs.get("implements").unwrap(), &vec!["REQ-001", "REQ-002"]);
        assert_eq!(refs.get("fixes").unwrap(), &vec!["DD-003"]);
    }

    #[test]
    fn parse_message_with_skip() {
        let msg = "chore: update deps\n\nTrace: skip";
        let trailer_map = BTreeMap::new();
        let (refs, skip) = parse_commit_message(msg, &trailer_map, "Trace: skip");
        assert!(skip);
        assert!(refs.is_empty());
    }

    #[test]
    fn parse_message_no_trailers() {
        let msg = "fix: quick patch";
        let mut trailer_map = BTreeMap::new();
        trailer_map.insert("Implements".into(), "implements".into());
        let (refs, skip) = parse_commit_message(msg, &trailer_map, "Trace: skip");
        assert!(!skip);
        assert!(refs.is_empty());
    }

    // -- parse_git_log_entry --

    // rivet: verifies REQ-017
    #[test]
    fn parse_git_log_entry_basic() {
        let mut trailer_map = BTreeMap::new();
        trailer_map.insert("Implements".into(), "implements".into());

        let entry = format!(
            "abc123{}feat: add parser{}Implements: REQ-001{}Alice{}2025-01-15T10:00:00+00:00{}src/parser.rs\nsrc/lib.rs",
            FIELD_SEP, FIELD_SEP, FIELD_SEP, FIELD_SEP, FIELD_SEP
        );

        let commit = parse_git_log_entry(&entry, &trailer_map, "Trace: skip").unwrap();
        assert_eq!(commit.hash, "abc123");
        assert_eq!(commit.subject, "feat: add parser");
        assert_eq!(commit.author, "Alice");
        assert_eq!(commit.commit_type, Some("feat".into()));
        assert_eq!(
            commit.artifact_refs.get("implements").unwrap(),
            &vec!["REQ-001"]
        );
        assert_eq!(commit.changed_files, vec!["src/parser.rs", "src/lib.rs"]);
        assert!(!commit.has_skip_trailer);
    }

    #[test]
    fn parse_git_log_entry_too_few_fields() {
        assert!(parse_git_log_entry("only two fields", &BTreeMap::new(), "Trace: skip").is_none());
    }

    // -- classify_commit_refs --

    // rivet: verifies REQ-017
    #[test]
    fn classify_linked() {
        let mut refs = BTreeMap::new();
        refs.insert("implements".into(), vec!["REQ-001".into()]);
        let known: HashSet<String> = ["REQ-001".into()].into();
        assert_eq!(classify_commit_refs(&refs, &known), CommitClass::Linked);
    }

    #[test]
    fn classify_broken() {
        let mut refs = BTreeMap::new();
        refs.insert("implements".into(), vec!["REQ-999".into()]);
        let known: HashSet<String> = ["REQ-001".into()].into();
        assert_eq!(classify_commit_refs(&refs, &known), CommitClass::BrokenRef);
    }

    #[test]
    fn classify_orphan() {
        let refs = BTreeMap::new();
        let known: HashSet<String> = ["REQ-001".into()].into();
        assert_eq!(classify_commit_refs(&refs, &known), CommitClass::Orphan);
    }

    // -- is_exempt --

    #[test]
    fn exempt_by_type() {
        let commit = ParsedCommit {
            hash: "abc".into(),
            subject: "chore: update deps".into(),
            body: String::new(),
            author: "Alice".into(),
            date: "2025-01-01".into(),
            commit_type: Some("chore".into()),
            artifact_refs: BTreeMap::new(),
            changed_files: Vec::new(),
            has_skip_trailer: false,
        };
        let exempt_types = vec!["chore".into(), "ci".into()];
        assert!(is_exempt(&commit, &exempt_types));
    }

    #[test]
    fn exempt_by_skip_trailer() {
        let commit = ParsedCommit {
            hash: "abc".into(),
            subject: "feat: add thing".into(),
            body: String::new(),
            author: "Alice".into(),
            date: "2025-01-01".into(),
            commit_type: Some("feat".into()),
            artifact_refs: BTreeMap::new(),
            changed_files: Vec::new(),
            has_skip_trailer: true,
        };
        assert!(is_exempt(&commit, &[]));
    }

    #[test]
    fn not_exempt() {
        let commit = ParsedCommit {
            hash: "abc".into(),
            subject: "feat: add thing".into(),
            body: String::new(),
            author: "Alice".into(),
            date: "2025-01-01".into(),
            commit_type: Some("feat".into()),
            artifact_refs: BTreeMap::new(),
            changed_files: Vec::new(),
            has_skip_trailer: false,
        };
        let exempt_types = vec!["chore".into(), "ci".into()];
        assert!(!is_exempt(&commit, &exempt_types));
    }

    // -- touches_traced_path --

    #[test]
    fn touches_traced_path_match() {
        let files = vec!["src/main.rs".into(), "docs/readme.md".into()];
        let traced = vec!["src/".into()];
        assert!(touches_traced_path(&files, &traced));
    }

    #[test]
    fn touches_traced_path_no_match() {
        let files = vec!["docs/readme.md".into()];
        let traced = vec!["src/".into()];
        assert!(!touches_traced_path(&files, &traced));
    }

    #[test]
    fn touches_traced_path_empty_paths_means_all() {
        let files = vec!["anything.txt".into()];
        assert!(touches_traced_path(&files, &[]));
    }

    // -- analyze_commits --

    // rivet: verifies REQ-017
    #[test]
    fn analyze_full_scenario() {
        let known_ids: HashSet<String> = ["REQ-001", "REQ-002", "FEAT-010"]
            .iter()
            .map(|s| s.to_string())
            .collect();
        let exempt_types = vec!["chore".into(), "ci".into()];
        let traced_paths = vec!["src/".into()];
        let trace_exempt_artifacts = vec!["FEAT-010".into()];
        let trailer_map: BTreeMap<String, String> = BTreeMap::new();

        let mut linked_refs = BTreeMap::new();
        linked_refs.insert("implements".into(), vec!["REQ-001".into()]);

        let mut broken_refs = BTreeMap::new();
        broken_refs.insert("implements".into(), vec!["REQ-999".into()]);

        let commits = vec![
            // Linked commit
            ParsedCommit {
                hash: "aaa".into(),
                subject: "feat: implement parser".into(),
                body: String::new(),
                author: "Alice".into(),
                date: "2025-01-01".into(),
                commit_type: Some("feat".into()),
                artifact_refs: linked_refs,
                changed_files: vec!["src/parser.rs".into()],
                has_skip_trailer: false,
            },
            // Exempt commit (chore)
            ParsedCommit {
                hash: "bbb".into(),
                subject: "chore: update deps".into(),
                body: String::new(),
                author: "Bob".into(),
                date: "2025-01-02".into(),
                commit_type: Some("chore".into()),
                artifact_refs: BTreeMap::new(),
                changed_files: vec!["Cargo.toml".into()],
                has_skip_trailer: false,
            },
            // Orphan commit (feat but no refs)
            ParsedCommit {
                hash: "ccc".into(),
                subject: "feat: quick hack".into(),
                body: String::new(),
                author: "Charlie".into(),
                date: "2025-01-03".into(),
                commit_type: Some("feat".into()),
                artifact_refs: BTreeMap::new(),
                changed_files: vec!["src/hack.rs".into()],
                has_skip_trailer: false,
            },
            // Broken ref commit
            ParsedCommit {
                hash: "ddd".into(),
                subject: "feat: fix something".into(),
                body: String::new(),
                author: "Diana".into(),
                date: "2025-01-04".into(),
                commit_type: Some("feat".into()),
                artifact_refs: broken_refs,
                changed_files: vec!["src/fix.rs".into()],
                has_skip_trailer: false,
            },
            // Outside traced paths -> exempt
            ParsedCommit {
                hash: "eee".into(),
                subject: "feat: update docs".into(),
                body: String::new(),
                author: "Eve".into(),
                date: "2025-01-05".into(),
                commit_type: Some("feat".into()),
                artifact_refs: BTreeMap::new(),
                changed_files: vec!["docs/guide.md".into()],
                has_skip_trailer: false,
            },
        ];

        let analysis = analyze_commits(
            commits,
            &known_ids,
            &exempt_types,
            &traced_paths,
            &trace_exempt_artifacts,
            &trailer_map,
        );

        // "aaa" is linked, "ddd" is linked (with broken refs recorded separately)
        assert_eq!(analysis.linked.len(), 2);
        // "bbb" (chore) + "eee" (outside traced path) = 2 exempt
        assert_eq!(analysis.exempt.len(), 2);
        // "ccc" is orphan
        assert_eq!(analysis.orphans.len(), 1);
        assert_eq!(analysis.orphans[0].hash, "ccc");
        // "ddd" has broken ref REQ-999
        assert_eq!(analysis.broken_refs.len(), 1);
        assert_eq!(analysis.broken_refs[0].missing_id, "REQ-999");
        // Coverage: REQ-001 is covered
        assert!(analysis.artifact_coverage.contains("REQ-001"));
        // Unimplemented: REQ-002 is not covered, FEAT-010 is trace-exempt
        assert!(analysis.unimplemented.contains("REQ-002"));
        assert!(!analysis.unimplemented.contains("FEAT-010"));
    }
}
