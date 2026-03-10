# Commit-to-Artifact Traceability Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add git commit traceability to Rivet — parse commit trailers, validate commit messages, inject commit nodes into the link graph, and report on commit-artifact coverage.

**Architecture:** New `commits` module in rivet-core for trailer parsing, commit classification, and graph injection. Two new CLI subcommands (`commit-msg-check`, `commits`). Config extension in `ProjectConfig`. Pre-commit hook entry in `.pre-commit-config.yaml`.

**Tech Stack:** Rust, clap (CLI), petgraph (graph), `std::process::Command` (git log), serde (config parsing)

---

### Task 1: Config — Add `CommitsConfig` to the data model

**Files:**
- Modify: `rivet-core/src/model.rs`
- Test: `rivet-core/tests/commits_config.rs` (create)

**Step 1: Write the failing test**

Create `rivet-core/tests/commits_config.rs`:

```rust
use rivet_core::model::ProjectConfig;

#[test]
fn parse_commits_config_from_yaml() {
    let yaml = r#"
project:
  name: test
  schemas: [common, dev]
sources: []
commits:
  format: trailers
  trailers:
    Implements: implements
    Fixes: fixes
    Verifies: verifies
  exempt-types: [chore, style, ci, docs, build]
  skip-trailer: "Trace: skip"
  traced-paths:
    - src/
    - lib/
  trace-exempt-artifacts:
    - FEAT-099
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    let commits = config.commits.expect("commits block should parse");
    assert_eq!(commits.format, "trailers");
    assert_eq!(commits.trailers.len(), 3);
    assert_eq!(commits.trailers.get("Implements").unwrap(), "implements");
    assert_eq!(commits.exempt_types, vec!["chore", "style", "ci", "docs", "build"]);
    assert_eq!(commits.skip_trailer, "Trace: skip");
    assert_eq!(commits.traced_paths, vec!["src/", "lib/"]);
    assert_eq!(commits.trace_exempt_artifacts, vec!["FEAT-099"]);
}

#[test]
fn commits_config_optional() {
    let yaml = r#"
project:
  name: test
  schemas: [common]
sources: []
"#;
    let config: ProjectConfig = serde_yaml::from_str(yaml).unwrap();
    assert!(config.commits.is_none());
}
```

**Step 2: Run test to verify it fails**

Run: `cargo test --lib -p rivet-core --test commits_config`
Expected: FAIL — `CommitsConfig` type does not exist

**Step 3: Write minimal implementation**

Add to `rivet-core/src/model.rs` after `ProjectConfig`:

```rust
/// Configuration for commit-to-artifact traceability.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CommitsConfig {
    /// Parser format (only "trailers" supported initially).
    #[serde(default = "default_format")]
    pub format: String,

    /// Map of git trailer keys to Rivet link types.
    #[serde(default)]
    pub trailers: std::collections::BTreeMap<String, String>,

    /// Conventional-commit types exempt from requiring trailers.
    #[serde(default, rename = "exempt-types")]
    pub exempt_types: Vec<String>,

    /// Explicit skip trailer token (e.g., "Trace: skip").
    #[serde(default = "default_skip_trailer", rename = "skip-trailer")]
    pub skip_trailer: String,

    /// Paths where commits MUST reference artifacts.
    #[serde(default, rename = "traced-paths")]
    pub traced_paths: Vec<String>,

    /// Artifact IDs exempt from "unimplemented" checks.
    #[serde(default, rename = "trace-exempt-artifacts")]
    pub trace_exempt_artifacts: Vec<String>,
}

fn default_format() -> String { "trailers".into() }
fn default_skip_trailer() -> String { "Trace: skip".into() }
```

Add the `commits` field to `ProjectConfig`:

```rust
pub struct ProjectConfig {
    pub project: ProjectMetadata,
    #[serde(default)]
    pub sources: Vec<SourceConfig>,
    #[serde(default)]
    pub docs: Vec<String>,
    #[serde(default)]
    pub results: Option<String>,
    #[serde(default)]              // <-- ADD THIS
    pub commits: Option<CommitsConfig>,  // <-- ADD THIS
}
```

**Step 4: Run test to verify it passes**

Run: `cargo test --lib -p rivet-core --test commits_config`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-core/src/model.rs rivet-core/tests/commits_config.rs
git commit -m "feat: add CommitsConfig to project data model

Implements: FEAT-031
Trace: skip"
```

Note: Use `Trace: skip` on this first commit since `commit-msg-check` isn't implemented yet.

---

### Task 2: Core — Commit trailer parser

**Files:**
- Create: `rivet-core/src/commits.rs`
- Modify: `rivet-core/src/lib.rs` (add `pub mod commits;`)
- Test: inline `#[cfg(test)]` in `commits.rs`

**Step 1: Write the failing test**

Create `rivet-core/src/commits.rs` with tests first:

```rust
//! Git commit trailer parsing and commit-artifact traceability.

use std::collections::BTreeMap;

/// A parsed git commit with extracted trailer information.
#[derive(Debug, Clone)]
pub struct ParsedCommit {
    pub hash: String,
    pub subject: String,
    pub body: String,
    pub author: String,
    pub date: String,
    /// Conventional-commit type (e.g., "feat", "fix", "chore").
    pub commit_type: Option<String>,
    /// Extracted artifact references: link_type -> vec of artifact IDs.
    pub artifact_refs: BTreeMap<String, Vec<String>>,
    /// Files changed by this commit.
    pub changed_files: Vec<String>,
    /// Whether this commit has the skip trailer.
    pub has_skip_trailer: bool,
}

/// Classification of a commit's traceability status.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum CommitClass {
    /// Has valid artifact trailers.
    Linked,
    /// Has trailers referencing non-existent artifact IDs.
    BrokenRef,
    /// Non-exempt commit touching traced paths without trailers.
    Orphan,
    /// Exempt by commit type or skip trailer.
    Exempt,
}

/// Parse the conventional-commit type from a subject line.
///
/// Returns `Some("feat")` for "feat(scope): subject" or "feat: subject".
pub fn parse_commit_type(subject: &str) -> Option<String> {
    let before_colon = subject.split(':').next()?;
    // Strip optional scope: "feat(oslc)" -> "feat"
    let type_str = before_colon.split('(').next()?;
    let trimmed = type_str.trim();
    if trimmed.is_empty() || trimmed.contains(' ') {
        return None;
    }
    Some(trimmed.to_lowercase())
}

/// Parse git trailers from a commit message body.
///
/// Trailers are `Key: value` lines in the last paragraph of the message.
/// Returns a map of trailer key -> list of values.
pub fn parse_trailers(message: &str) -> BTreeMap<String, Vec<String>> {
    let mut trailers = BTreeMap::new();

    // Trailers are in the last paragraph (after the last blank line)
    let paragraphs: Vec<&str> = message.split("\n\n").collect();
    let last_para = match paragraphs.last() {
        Some(p) => p.trim(),
        None => return trailers,
    };

    for line in last_para.lines() {
        let line = line.trim();
        if let Some((key, value)) = line.split_once(':') {
            let key = key.trim();
            let value = value.trim();
            if !key.is_empty() && !key.contains(' ') && !value.is_empty() {
                trailers
                    .entry(key.to_string())
                    .or_insert_with(Vec::new)
                    .push(value.to_string());
            }
        }
    }
    trailers
}

/// Extract artifact IDs from a trailer value.
///
/// Supports comma-separated IDs: "FEAT-012, FEAT-013" -> ["FEAT-012", "FEAT-013"]
pub fn extract_artifact_ids(value: &str) -> Vec<String> {
    value
        .split(',')
        .map(|s| s.trim().to_string())
        .filter(|s| !s.is_empty())
        .collect()
}

/// Parse a commit message and extract artifact references using the configured trailers map.
pub fn parse_commit_message(
    message: &str,
    trailer_map: &BTreeMap<String, String>,
    skip_trailer: &str,
) -> (BTreeMap<String, Vec<String>>, bool) {
    let trailers = parse_trailers(message);
    let mut artifact_refs: BTreeMap<String, Vec<String>> = BTreeMap::new();

    // Check for skip trailer (e.g., "Trace: skip")
    let has_skip = if let Some((skip_key, skip_val)) = skip_trailer.split_once(':') {
        trailers.get(skip_key.trim()).map_or(false, |vals| {
            vals.iter().any(|v| v.trim().eq_ignore_ascii_case(skip_val.trim()))
        })
    } else {
        false
    };

    // Extract artifact IDs from configured trailers
    for (trailer_key, link_type) in trailer_map {
        if let Some(values) = trailers.get(trailer_key) {
            for value in values {
                let ids = extract_artifact_ids(value);
                artifact_refs
                    .entry(link_type.clone())
                    .or_default()
                    .extend(ids);
            }
        }
    }

    (artifact_refs, has_skip)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_commit_type_feat() {
        assert_eq!(parse_commit_type("feat: add thing"), Some("feat".into()));
    }

    #[test]
    fn parse_commit_type_with_scope() {
        assert_eq!(parse_commit_type("feat(oslc): add sync"), Some("feat".into()));
    }

    #[test]
    fn parse_commit_type_fix() {
        assert_eq!(parse_commit_type("fix: broken link"), Some("fix".into()));
    }

    #[test]
    fn parse_commit_type_none_for_plain() {
        assert_eq!(parse_commit_type("Initial commit"), None);
    }

    #[test]
    fn parse_commit_type_none_for_merge() {
        assert_eq!(parse_commit_type("Merge branch 'main'"), None);
    }

    #[test]
    fn parse_trailers_basic() {
        let msg = "feat: add thing\n\nSome body text.\n\nImplements: FEAT-007\nFixes: UCA-O-4";
        let trailers = parse_trailers(msg);
        assert_eq!(trailers.get("Implements").unwrap(), &vec!["FEAT-007".to_string()]);
        assert_eq!(trailers.get("Fixes").unwrap(), &vec!["UCA-O-4".to_string()]);
    }

    #[test]
    fn parse_trailers_comma_separated() {
        let msg = "feat: thing\n\nImplements: FEAT-012, FEAT-013";
        let trailers = parse_trailers(msg);
        assert_eq!(trailers.get("Implements").unwrap(), &vec!["FEAT-012, FEAT-013".to_string()]);
    }

    #[test]
    fn extract_ids_comma_separated() {
        let ids = extract_artifact_ids("FEAT-012, FEAT-013");
        assert_eq!(ids, vec!["FEAT-012", "FEAT-013"]);
    }

    #[test]
    fn extract_ids_single() {
        let ids = extract_artifact_ids("REQ-001");
        assert_eq!(ids, vec!["REQ-001"]);
    }

    #[test]
    fn parse_commit_message_full() {
        let msg = "feat(oslc): add conflict detection\n\n\
                   Body paragraph.\n\n\
                   Implements: FEAT-012, FEAT-013\n\
                   Fixes: UCA-O-4";
        let mut trailer_map = BTreeMap::new();
        trailer_map.insert("Implements".into(), "implements".into());
        trailer_map.insert("Fixes".into(), "fixes".into());

        let (refs, skip) = parse_commit_message(msg, &trailer_map, "Trace: skip");
        assert!(!skip);
        assert_eq!(refs.get("implements").unwrap(), &vec!["FEAT-012", "FEAT-013"]);
        assert_eq!(refs.get("fixes").unwrap(), &vec!["UCA-O-4"]);
    }

    #[test]
    fn parse_commit_message_skip_trailer() {
        let msg = "chore: bump deps\n\nTrace: skip";
        let trailer_map = BTreeMap::new();
        let (refs, skip) = parse_commit_message(msg, &trailer_map, "Trace: skip");
        assert!(skip);
        assert!(refs.is_empty());
    }

    #[test]
    fn parse_commit_message_no_trailers() {
        let msg = "feat: quick fix";
        let trailer_map = BTreeMap::new();
        let (refs, skip) = parse_commit_message(msg, &trailer_map, "Trace: skip");
        assert!(!skip);
        assert!(refs.is_empty());
    }
}
```

**Step 2: Register the module**

Add to `rivet-core/src/lib.rs`:

```rust
pub mod commits;
```

**Step 3: Run tests to verify they pass**

Run: `cargo test -p rivet-core commits`
Expected: all 9 tests PASS

**Step 4: Commit**

```bash
git add rivet-core/src/commits.rs rivet-core/src/lib.rs
git commit -m "feat: add commit trailer parser module

Implements: FEAT-031
Trace: skip"
```

---

### Task 3: Core — Git log integration

**Files:**
- Modify: `rivet-core/src/commits.rs` (add git log functions)

**Step 1: Write the failing test**

Add to `rivet-core/src/commits.rs` tests module:

```rust
#[test]
fn parse_git_log_entry() {
    let raw = "abc1234\n\
               John Doe\n\
               2026-03-10\n\
               feat: add conflict detection\n\
               \n\
               Body text here.\n\
               \n\
               Implements: FEAT-012\n\
               ---FILES---\n\
               rivet-core/src/links.rs\n\
               rivet-core/src/validate.rs";

    let mut trailer_map = BTreeMap::new();
    trailer_map.insert("Implements".into(), "implements".into());

    let commit = parse_git_log_entry(raw, &trailer_map, "Trace: skip").unwrap();
    assert_eq!(commit.hash, "abc1234");
    assert_eq!(commit.author, "John Doe");
    assert_eq!(commit.commit_type, Some("feat".into()));
    assert_eq!(commit.artifact_refs.get("implements").unwrap(), &vec!["FEAT-012"]);
    assert_eq!(commit.changed_files, vec!["rivet-core/src/links.rs", "rivet-core/src/validate.rs"]);
}
```

**Step 2: Implement git log entry parser**

Add to `rivet-core/src/commits.rs`:

```rust
/// Separator between commit message and file list in our git log format.
const FILES_SEPARATOR: &str = "---FILES---";

/// Parse a single git log entry in our custom format.
///
/// Format (produced by git log --format):
/// ```text
/// <hash>
/// <author>
/// <date>
/// <subject>
/// <BLANK>
/// <body + trailers>
/// ---FILES---
/// <file1>
/// <file2>
/// ```
pub fn parse_git_log_entry(
    raw: &str,
    trailer_map: &BTreeMap<String, String>,
    skip_trailer: &str,
) -> Option<ParsedCommit> {
    let (message_part, files_part) = raw.split_once(FILES_SEPARATOR)?;

    let mut lines = message_part.lines();
    let hash = lines.next()?.trim().to_string();
    let author = lines.next()?.trim().to_string();
    let date = lines.next()?.trim().to_string();
    let subject = lines.next()?.trim().to_string();

    // Rest is the body (skip the blank line after subject)
    let body: String = lines
        .skip_while(|l| l.trim().is_empty())
        .collect::<Vec<_>>()
        .join("\n");

    let commit_type = parse_commit_type(&subject);

    // Build full message for trailer parsing (subject + body)
    let full_message = if body.is_empty() {
        subject.clone()
    } else {
        format!("{subject}\n\n{body}")
    };

    let (artifact_refs, has_skip_trailer) =
        parse_commit_message(&full_message, trailer_map, skip_trailer);

    let changed_files: Vec<String> = files_part
        .lines()
        .map(|l| l.trim().to_string())
        .filter(|l| !l.is_empty())
        .collect();

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

/// Shell out to git and retrieve parsed commits.
///
/// `range` can be "main..HEAD", "--all", or a since date.
pub fn git_log_commits(
    repo_path: &std::path::Path,
    range: &str,
    trailer_map: &BTreeMap<String, String>,
    skip_trailer: &str,
) -> Result<Vec<ParsedCommit>, crate::error::Error> {
    use std::process::Command as ProcessCommand;

    let entry_separator = "---ENTRY---";
    let format = format!(
        "{}%n%H%n%an%n%ai%n%s%n%n%b{}",
        entry_separator, FILES_SEPARATOR
    );

    let mut cmd = ProcessCommand::new("git");
    cmd.current_dir(repo_path)
        .arg("log")
        .arg(format!("--format={format}"))
        .arg("--name-only")
        .arg(range);

    let output = cmd
        .output()
        .map_err(|e| crate::error::Error::Io(format!("git log: {e}")))?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(crate::error::Error::Io(format!("git log failed: {stderr}")));
    }

    let stdout = String::from_utf8_lossy(&output.stdout);
    let commits: Vec<ParsedCommit> = stdout
        .split(entry_separator)
        .filter(|s| !s.trim().is_empty())
        .filter_map(|entry| parse_git_log_entry(entry.trim(), trailer_map, skip_trailer))
        .collect();

    Ok(commits)
}
```

**Step 3: Run tests**

Run: `cargo test -p rivet-core commits`
Expected: all tests PASS (new test included)

**Step 4: Commit**

```bash
git add rivet-core/src/commits.rs
git commit -m "feat: add git log parsing for commit traceability

Implements: FEAT-032
Trace: skip"
```

---

### Task 4: Core — Commit classification and analysis

**Files:**
- Modify: `rivet-core/src/commits.rs` (add classify + analyze functions)

**Step 1: Write the failing test**

Add to the tests module:

```rust
#[test]
fn classify_linked_commit() {
    let mut refs = BTreeMap::new();
    refs.insert("implements".into(), vec!["FEAT-007".into()]);
    let known_ids: std::collections::HashSet<String> =
        ["FEAT-007".into()].into_iter().collect();

    let class = classify_commit_refs(&refs, &known_ids);
    assert_eq!(class, CommitClass::Linked);
}

#[test]
fn classify_broken_ref() {
    let mut refs = BTreeMap::new();
    refs.insert("implements".into(), vec!["FEAT-999".into()]);
    let known_ids: std::collections::HashSet<String> =
        ["FEAT-007".into()].into_iter().collect();

    let class = classify_commit_refs(&refs, &known_ids);
    assert_eq!(class, CommitClass::BrokenRef);
}

#[test]
fn classify_no_refs_returns_none() {
    let refs = BTreeMap::new();
    let known_ids: std::collections::HashSet<String> = Default::default();
    // classify_commit_refs only checks ref validity; orphan detection is separate
    let class = classify_commit_refs(&refs, &known_ids);
    assert_eq!(class, CommitClass::Orphan);
}
```

**Step 2: Implement classification**

Add to `rivet-core/src/commits.rs`:

```rust
use std::collections::HashSet;

/// Classify a commit based on its artifact references.
///
/// - If refs is empty → Orphan (caller must check exempt status separately)
/// - If all referenced IDs exist → Linked
/// - If any referenced ID is missing → BrokenRef
pub fn classify_commit_refs(
    artifact_refs: &BTreeMap<String, Vec<String>>,
    known_ids: &HashSet<String>,
) -> CommitClass {
    let all_ids: Vec<&String> = artifact_refs.values().flatten().collect();

    if all_ids.is_empty() {
        return CommitClass::Orphan;
    }

    let has_broken = all_ids.iter().any(|id| !known_ids.contains(id.as_str()));
    if has_broken {
        CommitClass::BrokenRef
    } else {
        CommitClass::Linked
    }
}

/// Check whether a commit is exempt from trailer requirements.
pub fn is_exempt(commit: &ParsedCommit, exempt_types: &[String]) -> bool {
    if commit.has_skip_trailer {
        return true;
    }
    if let Some(ref ct) = commit.commit_type {
        return exempt_types.iter().any(|e| e == ct);
    }
    false
}

/// Check whether a commit touches any traced path.
pub fn touches_traced_path(changed_files: &[String], traced_paths: &[String]) -> bool {
    changed_files
        .iter()
        .any(|f| traced_paths.iter().any(|p| f.starts_with(p)))
}

/// A broken reference found in a commit trailer.
#[derive(Debug, Clone)]
pub struct BrokenRef {
    pub commit_hash: String,
    pub commit_subject: String,
    pub trailer_key: String,
    pub artifact_id: String,
}

/// Result of analyzing git commit history against the artifact store.
#[derive(Debug, Default)]
pub struct CommitAnalysis {
    pub linked: Vec<ParsedCommit>,
    pub broken_refs: Vec<BrokenRef>,
    pub orphans: Vec<ParsedCommit>,
    pub exempt: Vec<ParsedCommit>,
    /// Artifact ID -> list of (commit_hash, link_type).
    pub artifact_coverage: BTreeMap<String, Vec<(String, String)>>,
    /// Artifact IDs with zero commit references (minus exempted ones).
    pub unimplemented: Vec<String>,
}

/// Analyze a set of parsed commits against the artifact store.
pub fn analyze_commits(
    commits: Vec<ParsedCommit>,
    known_ids: &HashSet<String>,
    exempt_types: &[String],
    traced_paths: &[String],
    trace_exempt_artifacts: &[String],
    trailer_map: &BTreeMap<String, String>,
) -> CommitAnalysis {
    let mut analysis = CommitAnalysis::default();

    for commit in commits {
        // Check exemption first
        if is_exempt(&commit, exempt_types) {
            analysis.exempt.push(commit);
            continue;
        }

        let class = classify_commit_refs(&commit.artifact_refs, known_ids);

        match class {
            CommitClass::Linked => {
                // Record artifact coverage
                for (link_type, ids) in &commit.artifact_refs {
                    for id in ids {
                        analysis
                            .artifact_coverage
                            .entry(id.clone())
                            .or_default()
                            .push((commit.hash.clone(), link_type.clone()));
                    }
                }
                analysis.linked.push(commit);
            }
            CommitClass::BrokenRef => {
                // Find which specific IDs are broken
                for (link_type, ids) in &commit.artifact_refs {
                    // Reverse-lookup the trailer key from link type
                    let trailer_key = trailer_map
                        .iter()
                        .find(|(_, v)| *v == link_type)
                        .map(|(k, _)| k.clone())
                        .unwrap_or_else(|| link_type.clone());

                    for id in ids {
                        if !known_ids.contains(id.as_str()) {
                            analysis.broken_refs.push(BrokenRef {
                                commit_hash: commit.hash.clone(),
                                commit_subject: commit.subject.clone(),
                                trailer_key: trailer_key.clone(),
                                artifact_id: id.clone(),
                            });
                        } else {
                            // Still record coverage for valid refs in the same commit
                            analysis
                                .artifact_coverage
                                .entry(id.clone())
                                .or_default()
                                .push((commit.hash.clone(), link_type.clone()));
                        }
                    }
                }
                analysis.linked.push(commit); // still partially linked
            }
            CommitClass::Orphan => {
                if touches_traced_path(&commit.changed_files, traced_paths) {
                    analysis.orphans.push(commit);
                } else {
                    // Touches only non-traced paths — treat as exempt
                    analysis.exempt.push(commit);
                }
            }
            CommitClass::Exempt => unreachable!("exempt handled above"),
        }
    }

    // Compute unimplemented artifacts
    let exempt_set: HashSet<&str> = trace_exempt_artifacts.iter().map(|s| s.as_str()).collect();
    for id in known_ids {
        if !analysis.artifact_coverage.contains_key(id) && !exempt_set.contains(id.as_str()) {
            analysis.unimplemented.push(id.clone());
        }
    }
    analysis.unimplemented.sort();

    analysis
}
```

**Step 3: Run tests**

Run: `cargo test -p rivet-core commits`
Expected: all tests PASS

**Step 4: Commit**

```bash
git add rivet-core/src/commits.rs
git commit -m "feat: add commit classification and analysis engine

Implements: FEAT-030, FEAT-032
Trace: skip"
```

---

### Task 5: CLI — `commit-msg-check` subcommand

**Files:**
- Modify: `rivet-cli/src/main.rs` (add Command variant + handler)

**Step 1: Add the Command variant**

In the `Command` enum, add before the closing brace:

```rust
    /// Validate a commit message for artifact trailers (pre-commit hook)
    CommitMsgCheck {
        /// Path to the commit message file
        file: PathBuf,
    },
```

**Step 2: Add the handler in `run()`**

In the early-return section of `run()` (before the `match`), add:

```rust
    if let Command::CommitMsgCheck { file } = &cli.command {
        return cmd_commit_msg_check(&cli, file);
    }
```

Add the `Command::CommitMsgCheck { .. }` to the unreachable match arm.

**Step 3: Implement `cmd_commit_msg_check`**

```rust
fn cmd_commit_msg_check(cli: &Cli, msg_file: &Path) -> Result<bool> {
    use rivet_core::commits;

    let msg = std::fs::read_to_string(msg_file)
        .context("failed to read commit message file")?;

    // Strip comment lines (git includes them in commit-msg hook)
    let msg: String = msg
        .lines()
        .filter(|l| !l.starts_with('#'))
        .collect::<Vec<_>>()
        .join("\n");

    let subject = msg.lines().next().unwrap_or("").trim();
    if subject.is_empty() {
        // Empty commit message — let git handle it
        return Ok(true);
    }

    // Try to load project config for commits settings
    let config_path = cli.project.join("rivet.yaml");
    let commits_cfg = if config_path.exists() {
        let config = rivet_core::load_project_config(&config_path)
            .context("failed to load rivet.yaml")?;
        config.commits
    } else {
        None
    };

    let commits_cfg = match commits_cfg {
        Some(cfg) => cfg,
        None => {
            // No commits config — nothing to enforce
            return Ok(true);
        }
    };

    // Check exempt type
    let commit_type = commits::parse_commit_type(subject);
    if let Some(ref ct) = commit_type {
        if commits_cfg.exempt_types.iter().any(|e| e == ct) {
            return Ok(true);
        }
    }

    // Parse trailers
    let (artifact_refs, has_skip) =
        commits::parse_commit_message(&msg, &commits_cfg.trailers, &commits_cfg.skip_trailer);

    if has_skip {
        eprintln!("info: commit marked as Trace: skip");
        return Ok(true);
    }

    // Check for artifact references
    let all_ids: Vec<&String> = artifact_refs.values().flatten().collect();
    if all_ids.is_empty() {
        eprintln!(
            "error: non-exempt commit must reference at least one artifact.\n\
             Add a trailer (e.g., 'Implements: FEAT-007') or '{}' to bypass.",
            commits_cfg.skip_trailer
        );
        return Ok(false);
    }

    // Validate artifact IDs exist
    let project_dir = &cli.project;
    let schemas_dir = cli.schemas.clone().unwrap_or_else(|| project_dir.join("schemas"));
    let config = rivet_core::load_project_config(&config_path)?;
    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)?;
    let mut store = rivet_core::store::Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, project_dir)?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }

    let mut has_error = false;
    for id in &all_ids {
        if !store.contains(id) {
            // Find closest match for suggestion
            let suggestion = store
                .iter()
                .map(|a| &a.id)
                .filter(|aid| {
                    aid.starts_with(&id[..id.len().min(3).max(1)])
                })
                .min_by_key(|aid| levenshtein(aid, id))
                .map(|s| format!(" Did you mean '{s}'?"))
                .unwrap_or_default();

            eprintln!("error: unknown artifact ID '{id}' in commit trailer.{suggestion}");
            has_error = true;
        }
    }

    Ok(!has_error)
}

/// Simple Levenshtein distance for fuzzy matching.
fn levenshtein(a: &str, b: &str) -> usize {
    let a: Vec<char> = a.chars().collect();
    let b: Vec<char> = b.chars().collect();
    let mut matrix = vec![vec![0usize; b.len() + 1]; a.len() + 1];

    for i in 0..=a.len() { matrix[i][0] = i; }
    for j in 0..=b.len() { matrix[0][j] = j; }

    for i in 1..=a.len() {
        for j in 1..=b.len() {
            let cost = if a[i - 1] == b[j - 1] { 0 } else { 1 };
            matrix[i][j] = (matrix[i - 1][j] + 1)
                .min(matrix[i][j - 1] + 1)
                .min(matrix[i - 1][j - 1] + cost);
        }
    }
    matrix[a.len()][b.len()]
}
```

**Step 4: Run full build and test**

Run: `cargo build && cargo test`
Expected: PASS

**Step 5: Commit**

```bash
git add rivet-cli/src/main.rs
git commit -m "feat: add rivet commit-msg-check subcommand

Implements: FEAT-029
Trace: skip"
```

---

### Task 6: CLI — `commits` subcommand

**Files:**
- Modify: `rivet-cli/src/main.rs` (add Command variant + handler)

**Step 1: Add the Command variant**

```rust
    /// Analyze git commit history for artifact traceability
    Commits {
        /// Only analyze commits after this date (YYYY-MM-DD)
        #[arg(long)]
        since: Option<String>,

        /// Git revision range (e.g., "main..HEAD")
        #[arg(long)]
        range: Option<String>,

        /// Output format: "text" (default) or "json"
        #[arg(short, long, default_value = "text")]
        format: String,

        /// Promote warnings to errors
        #[arg(long)]
        strict: bool,
    },
```

**Step 2: Add dispatch in `run()`**

```rust
Command::Commits { since, range, format, strict } => {
    cmd_commits(&cli, since.as_deref(), range.as_deref(), format, *strict)
}
```

**Step 3: Implement `cmd_commits`**

```rust
fn cmd_commits(
    cli: &Cli,
    since: Option<&str>,
    range: Option<&str>,
    format: &str,
    strict: bool,
) -> Result<bool> {
    use rivet_core::commits;

    let project_dir = &cli.project;
    let config_path = project_dir.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)?;

    let commits_cfg = config.commits.as_ref()
        .context("no 'commits' block in rivet.yaml — configure commit traceability first")?;

    // Load artifacts
    let schemas_dir = cli.schemas.clone().unwrap_or_else(|| project_dir.join("schemas"));
    let schema = rivet_core::load_schemas(&config.project.schemas, &schemas_dir)?;
    let mut store = rivet_core::store::Store::new();
    for source in &config.sources {
        let artifacts = rivet_core::load_artifacts(source, project_dir)?;
        for artifact in artifacts {
            store.upsert(artifact);
        }
    }

    // Build known IDs set
    let known_ids: std::collections::HashSet<String> =
        store.iter().map(|a| a.id.clone()).collect();

    // Determine git range
    let git_range = if let Some(r) = range {
        r.to_string()
    } else if let Some(s) = since {
        format!("--since={s}")
    } else {
        "HEAD".to_string()
    };

    // Parse git log
    let parsed = commits::git_log_commits(
        project_dir,
        &git_range,
        &commits_cfg.trailers,
        &commits_cfg.skip_trailer,
    )?;

    let total = parsed.len();

    // Analyze
    let analysis = commits::analyze_commits(
        parsed,
        &known_ids,
        &commits_cfg.exempt_types,
        &commits_cfg.traced_paths,
        &commits_cfg.trace_exempt_artifacts,
        &commits_cfg.trailers,
    );

    if format == "json" {
        // JSON output (structure matches the 5 report types)
        let json = serde_json::json!({
            "total_commits": total,
            "linked": analysis.linked.len(),
            "exempt": analysis.exempt.len(),
            "orphans": analysis.orphans.iter().map(|c| {
                serde_json::json!({"hash": c.hash, "subject": c.subject})
            }).collect::<Vec<_>>(),
            "broken_refs": analysis.broken_refs.iter().map(|b| {
                serde_json::json!({
                    "hash": b.commit_hash,
                    "subject": b.commit_subject,
                    "trailer": b.trailer_key,
                    "artifact_id": b.artifact_id
                })
            }).collect::<Vec<_>>(),
            "artifact_coverage": &analysis.artifact_coverage,
            "unimplemented": &analysis.unimplemented,
        });
        println!("{}", serde_json::to_string_pretty(&json)?);
    } else {
        // Text output
        println!("Commit traceability ({total} commits analyzed):\n");
        println!("  Linked:    {:>4} commits referencing {} artifacts",
            analysis.linked.len(),
            analysis.artifact_coverage.len());
        println!("  Exempt:    {:>4} commits (type-exempt or skip trailer)",
            analysis.exempt.len());
        println!("  Orphan:    {:>4} commits touching traced paths without trailers",
            analysis.orphans.len());
        println!("  Broken:    {:>4} references to non-existent artifacts",
            analysis.broken_refs.len());

        if !analysis.orphans.is_empty() {
            println!("\n  WARNING: {} orphan commits:", analysis.orphans.len());
            for c in &analysis.orphans {
                println!("    {} {} — no artifact trailer", &c.hash[..8.min(c.hash.len())], c.subject);
            }
        }

        if !analysis.broken_refs.is_empty() {
            println!("\n  ERROR: {} broken references:", analysis.broken_refs.len());
            for b in &analysis.broken_refs {
                println!("    {} {} — {}: {} (not found)",
                    &b.commit_hash[..8.min(b.commit_hash.len())],
                    b.commit_subject, b.trailer_key, b.artifact_id);
            }
        }

        if !analysis.unimplemented.is_empty() {
            println!("\n  WARNING: {} artifacts with no commit evidence:", analysis.unimplemented.len());
            for id in &analysis.unimplemented {
                println!("    {id}");
            }
        }

        // Summary coverage table
        if !analysis.artifact_coverage.is_empty() {
            println!("\n  Artifact coverage:");
            let mut sorted: Vec<_> = analysis.artifact_coverage.iter().collect();
            sorted.sort_by_key(|(id, _)| id.clone());
            for (id, refs) in sorted {
                let summary: Vec<String> = {
                    let mut counts: BTreeMap<&str, usize> = BTreeMap::new();
                    for (_, lt) in refs {
                        *counts.entry(lt.as_str()).or_default() += 1;
                    }
                    counts.iter().map(|(k, v)| format!("{k}: {v}")).collect()
                };
                println!("    {id:<20} {} commits ({})", refs.len(), summary.join(", "));
            }
        }
    }

    // Determine exit code
    let has_errors = !analysis.broken_refs.is_empty();
    let has_warnings = !analysis.orphans.is_empty() || !analysis.unimplemented.is_empty();

    if has_errors || (strict && has_warnings) {
        println!("\nResult: FAIL");
        Ok(false)
    } else {
        println!("\nResult: PASS");
        Ok(true)
    }
}
```

**Step 4: Add `use std::collections::BTreeMap;` at top of main.rs if not already present**

**Step 5: Run full build and test**

Run: `cargo build && cargo test`
Expected: PASS

**Step 6: Commit**

```bash
git add rivet-cli/src/main.rs
git commit -m "feat: add rivet commits subcommand with 5 report types

Implements: FEAT-030
Trace: skip"
```

---

### Task 7: Pre-commit hook config entry

**Files:**
- Modify: `.pre-commit-config.yaml`

**Step 1: Add the hook entry**

Add to the `local` repo hooks section:

```yaml
    - id: rivet-commit-msg
      name: rivet commit-msg check
      entry: rivet commit-msg-check
      language: system
      stages: [commit-msg]
      always_run: true
```

**Step 2: Add commits config to rivet.yaml**

```yaml
commits:
  format: trailers
  trailers:
    Implements: implements
    Fixes: fixes
    Verifies: verifies
    Satisfies: satisfies
    Refs: traces-to
  exempt-types:
    - chore
    - style
    - ci
    - docs
    - build
  skip-trailer: "Trace: skip"
  traced-paths:
    - rivet-core/src/
    - rivet-cli/src/
  trace-exempt-artifacts: []
```

**Step 3: Commit**

```bash
git add .pre-commit-config.yaml rivet.yaml
git commit -m "chore: add commit-msg hook and commits config to rivet.yaml"
```

Note: This commit is type `chore` so it's exempt from needing trailers.

---

### Task 8: Integration test — end-to-end commit analysis

**Files:**
- Create: `rivet-core/tests/commits_integration.rs`

**Step 1: Write integration test**

```rust
use std::collections::{BTreeMap, HashSet};
use rivet_core::commits::{
    ParsedCommit, CommitClass, analyze_commits,
    classify_commit_refs, is_exempt, touches_traced_path,
};

fn make_commit(hash: &str, subject: &str, refs: BTreeMap<String, Vec<String>>, files: Vec<String>) -> ParsedCommit {
    ParsedCommit {
        hash: hash.into(),
        subject: subject.into(),
        body: String::new(),
        author: "Test".into(),
        date: "2026-03-10".into(),
        commit_type: rivet_core::commits::parse_commit_type(subject),
        artifact_refs: refs,
        changed_files: files,
        has_skip_trailer: false,
    }
}

#[test]
fn full_analysis_reports() {
    let known_ids: HashSet<String> = ["FEAT-001", "FEAT-002", "REQ-001"]
        .iter().map(|s| s.to_string()).collect();

    let trailer_map: BTreeMap<String, String> =
        [("Implements".into(), "implements".into())].into_iter().collect();

    let mut linked_refs = BTreeMap::new();
    linked_refs.insert("implements".into(), vec!["FEAT-001".into()]);

    let mut broken_refs = BTreeMap::new();
    broken_refs.insert("implements".into(), vec!["FEAT-999".into()]);

    let commits = vec![
        make_commit("aaa", "feat: linked commit", linked_refs, vec!["rivet-core/src/foo.rs".into()]),
        make_commit("bbb", "feat: broken ref", broken_refs, vec!["rivet-core/src/bar.rs".into()]),
        make_commit("ccc", "feat: orphan commit", BTreeMap::new(), vec!["rivet-core/src/baz.rs".into()]),
        make_commit("ddd", "chore: exempt commit", BTreeMap::new(), vec!["Cargo.toml".into()]),
    ];

    let analysis = analyze_commits(
        commits,
        &known_ids,
        &["chore".into()],
        &["rivet-core/src/".into()],
        &[],
        &trailer_map,
    );

    assert_eq!(analysis.linked.len(), 2); // aaa + bbb (bbb has both broken and valid-path refs)
    assert_eq!(analysis.broken_refs.len(), 1);
    assert_eq!(analysis.broken_refs[0].artifact_id, "FEAT-999");
    assert_eq!(analysis.orphans.len(), 1);
    assert_eq!(analysis.orphans[0].hash, "ccc");
    assert_eq!(analysis.exempt.len(), 1);
    assert_eq!(analysis.exempt[0].hash, "ddd");
    // FEAT-002 and REQ-001 have no commits
    assert!(analysis.unimplemented.contains(&"FEAT-002".to_string()));
    assert!(analysis.unimplemented.contains(&"REQ-001".to_string()));
}

#[test]
fn trace_exempt_artifacts_excluded_from_unimplemented() {
    let known_ids: HashSet<String> = ["FEAT-001", "FEAT-002"]
        .iter().map(|s| s.to_string()).collect();

    let analysis = analyze_commits(
        vec![],
        &known_ids,
        &[],
        &[],
        &["FEAT-002".into()],
        &BTreeMap::new(),
    );

    assert!(analysis.unimplemented.contains(&"FEAT-001".to_string()));
    assert!(!analysis.unimplemented.contains(&"FEAT-002".to_string()));
}
```

**Step 2: Run tests**

Run: `cargo test -p rivet-core --test commits_integration`
Expected: PASS

**Step 3: Run full test suite**

Run: `cargo test`
Expected: all tests PASS

**Step 4: Run clippy**

Run: `cargo clippy -- -D warnings`
Expected: no warnings

**Step 5: Commit**

```bash
git add rivet-core/tests/commits_integration.rs rivet-core/tests/commits_config.rs
git commit -m "test: add commit traceability integration tests

Verifies: FEAT-029, FEAT-030, FEAT-031, FEAT-032
Trace: skip"
```

---

### Task 9: Verify dogfooding — run `rivet commits` on self

**Step 1: Build and run**

```bash
cargo build --release
./target/release/rivet validate
./target/release/rivet commits
```

**Step 2: Verify output**

Expected: the report should show:
- Implementation commits with `Implements:` trailers as linked
- `chore:`/`docs:` commits as exempt
- Possibly orphan commits from before the feature was added
- Unimplemented artifacts list (since most pre-existing commits lack trailers)

**Step 3: Adjust `trace-exempt-artifacts` in rivet.yaml**

Add pre-existing artifact IDs that don't have commit evidence to the whitelist, since they were implemented before this feature existed.

**Step 4: Final validate**

```bash
./target/release/rivet validate
./target/release/rivet commits --strict
```

Expected: PASS on both

**Step 5: Commit**

```bash
git add rivet.yaml
git commit -m "chore: add trace-exempt-artifacts for pre-existing implementations"
```

---

### Task 10: Documentation — update rivet docs

**Step 1: Add commit-traceability topic to built-in docs**

Check `rivet-cli/src/docs.rs` or the embedded docs directory for the pattern, then add a `commit-traceability` topic covering:
- Configuration reference
- Commit message format
- Pre-commit hook setup
- `rivet commits` usage and report types
- Exemption mechanisms

**Step 2: Commit**

```bash
git add rivet-cli/src/docs.rs  # or wherever docs live
git commit -m "docs: add commit traceability documentation topic

Implements: FEAT-031
Trace: skip"
```

---

Plan complete and saved to `docs/plans/2026-03-10-commit-traceability-plan.md`. Two execution options:

**1. Subagent-Driven (this session)** — I dispatch fresh subagent per task, review between tasks, fast iteration

**2. Parallel Session (separate)** — Open new session with executing-plans, batch execution with checkpoints

Which approach?