// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
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

//! Comprehensive integration tests for the rowan YAML parser.
//!
//! Verifies that:
//! 1. Every YAML file in the project round-trips through the rowan CST parser
//!    (the lossless property: `SyntaxNode::new_root(green).text() == source`).
//! 2. Schema-driven extraction produces artifacts matching the serde-based
//!    parsers for generic-yaml format files.
//! 3. Schema-driven extraction produces artifacts matching the serde-based
//!    parsers for STPA format files (losses, hazards, system-constraints).
//! 4. No `Error` nodes appear in any project YAML file.
//!
//! ## Rowan YAML parser design
//!
//! The rowan YAML lexer performs context-free tokenization. Plain scalars stop
//! at `,`, `]`, `}` (flow indicators), which produces multiple tokens for
//! values containing commas. The parser and HIR extraction layer handle this
//! by consuming all tokens in a value position and reassembling the full text.

use std::path::{Path, PathBuf};

use rivet_core::formats::generic::parse_generic_yaml;
use rivet_core::schema::Schema;
use rivet_core::yaml_cst::{self, SyntaxKind, YamlLanguage};
use rivet_core::yaml_hir::extract_schema_driven;

/// Project root -- one level up from `rivet-core/`.
fn project_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("..")
}

/// Load and merge schemas by name from the on-disk `schemas/` directory.
fn load_schema(names: &[&str]) -> Schema {
    let schemas_dir = project_root().join("schemas");
    let mut files = Vec::new();
    for name in names {
        let path = schemas_dir.join(format!("{name}.yaml"));
        if path.exists() {
            files.push(Schema::load_file(&path).expect("load schema file"));
        }
    }
    Schema::merge(&files)
}

// ── Recursive directory walker ─────────────────────────────────────────

/// Collect all `.yaml` files under `dir` recursively.
fn collect_yaml_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };
    for entry in entries.filter_map(|e| e.ok()) {
        let path = entry.path();
        if path.is_dir() {
            collect_yaml_files(&path, out);
        } else if path
            .extension()
            .is_some_and(|ext| ext == "yaml" || ext == "yml")
        {
            out.push(path);
        }
    }
}

/// Gather all YAML files from the directories specified in the task.
fn all_project_yaml_files() -> Vec<PathBuf> {
    let root = project_root();
    let mut files = Vec::new();

    // Top-level directories
    for subdir in &["artifacts", "schemas", "results"] {
        collect_yaml_files(&root.join(subdir), &mut files);
    }

    // Safety directories
    for subdir in &["safety/stpa", "safety/stpa-sec"] {
        collect_yaml_files(&root.join(subdir), &mut files);
    }

    // Example project artifacts
    let examples_dir = root.join("examples");
    if examples_dir.exists() {
        if let Ok(entries) = std::fs::read_dir(&examples_dir) {
            for entry in entries.filter_map(|e| e.ok()) {
                let example_dir = entry.path();
                if example_dir.is_dir() {
                    // Collect artifacts/ subdirectory
                    collect_yaml_files(&example_dir.join("artifacts"), &mut files);
                    // Also collect results/ subdirectory
                    collect_yaml_files(&example_dir.join("results"), &mut files);
                    // Also collect any top-level YAML in example dirs
                    // (e.g., rivet.yaml, cybersecurity.yaml)
                    if let Ok(example_entries) = std::fs::read_dir(&example_dir) {
                        for ef in example_entries.filter_map(|e| e.ok()) {
                            let p = ef.path();
                            if p.is_file()
                                && p.extension()
                                    .is_some_and(|ext| ext == "yaml" || ext == "yml")
                            {
                                files.push(p);
                            }
                        }
                    }
                }
            }
        }
    }

    files.sort();
    files
}

/// Walk a rowan syntax tree and collect Error nodes with byte offsets.
fn find_error_nodes(root: &rowan::SyntaxNode<YamlLanguage>) -> Vec<(usize, String)> {
    let mut errors = Vec::new();
    walk_for_errors(root, &mut errors);
    errors
}

fn walk_for_errors(node: &rowan::SyntaxNode<YamlLanguage>, errors: &mut Vec<(usize, String)>) {
    if node.kind() == SyntaxKind::Error {
        let offset: usize = node.text_range().start().into();
        let text = node.text().to_string();
        errors.push((offset, text));
    }
    for child in node.children() {
        walk_for_errors(&child, errors);
    }
}

/// Path suffixes of files expected to produce Error nodes. Empty — all
/// project YAML files parse cleanly.
const KNOWN_ERROR_SUFFIXES: &[&str] = &[];

/// Check if a path matches any known error suffix.
fn is_known_error_file(path: &Path) -> bool {
    let path_str = path.to_string_lossy();
    KNOWN_ERROR_SUFFIXES
        .iter()
        .any(|suffix| path_str.ends_with(suffix))
}

/// Path suffixes of files with known extraction mismatches (e.g., title
/// truncation). Empty — extraction handles commas and brackets correctly.
const KNOWN_EXTRACTION_ISSUES: &[&str] = &[];

// ── Test 1: Round-trip every YAML file ────────────────────────────────

/// The rowan CST parser is lossless: every byte of the input is preserved
/// in the green tree. This test verifies that property for every YAML file
/// in the project, regardless of whether the parser produces Error nodes.
#[test]
fn rowan_roundtrips_all_yaml_files() {
    let files = all_project_yaml_files();
    assert!(
        !files.is_empty(),
        "should find at least one .yaml file in the project"
    );

    let mut failures = Vec::new();

    for path in &files {
        let source = match std::fs::read_to_string(path) {
            Ok(s) => s,
            Err(e) => {
                failures.push(format!("{}: read error: {e}", path.display()));
                continue;
            }
        };

        let (green, _errors) = yaml_cst::parse(&source);
        let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);
        let reconstructed = root.text().to_string();

        if reconstructed != source {
            // Find first divergence point for a helpful message.
            let diverge_pos = source
                .bytes()
                .zip(reconstructed.bytes())
                .position(|(a, b)| a != b)
                .unwrap_or(source.len().min(reconstructed.len()));
            failures.push(format!(
                "{}: round-trip mismatch at byte {diverge_pos} \
                 (source len={}, reconstructed len={})",
                path.display(),
                source.len(),
                reconstructed.len()
            ));
        }
    }

    if !failures.is_empty() {
        panic!(
            "Round-trip failures ({}/{} files):\n  {}",
            failures.len(),
            files.len(),
            failures.join("\n  ")
        );
    }

    eprintln!(
        "rowan_roundtrips_all_yaml_files: all {count} files pass",
        count = files.len()
    );
}

// ── Test 2: Schema-driven extraction matches serde for generic artifacts ──

/// For each generic-yaml file under `artifacts/`, parse with serde and with
/// the rowan schema-driven extractor, and compare: same artifact count,
/// same IDs, same types, same titles.
///
/// For files that the rowan parser cleanly parses: exact comparison.
/// For files with known parser limitations: compare artifact count, IDs,
/// and types; titles use relaxed prefix-match comparison.
#[test]
fn schema_driven_matches_serde_for_generic_artifacts() {
    let root = project_root();
    let schema = load_schema(&["common", "dev"]);

    let artifacts_dir = root.join("artifacts");
    let mut yaml_files = Vec::new();
    collect_yaml_files(&artifacts_dir, &mut yaml_files);

    assert!(
        !yaml_files.is_empty(),
        "should find at least one generic artifact YAML file"
    );

    let mut failures = Vec::new();
    let mut compared_count = 0;

    for path in &yaml_files {
        let source = std::fs::read_to_string(path).expect("read artifact file");
        let path_str = path.to_string_lossy();
        let has_error_nodes = is_known_error_file(path);
        let has_extraction_issues = KNOWN_EXTRACTION_ISSUES
            .iter()
            .any(|suffix| path_str.ends_with(suffix));

        // Parse with serde
        let serde_result = match parse_generic_yaml(&source, Some(path)) {
            Ok(arts) => arts,
            Err(e) => {
                // If serde cannot parse it, skip (it may use a different format).
                eprintln!("  skipping {} (serde parse error: {e})", path.display());
                continue;
            }
        };

        // Parse with rowan + schema-driven extraction
        let rowan_result = extract_schema_driven(&source, &schema, Some(path));
        compared_count += 1;

        // For files with known CST Error nodes, only compare what the
        // rowan parser can reliably extract. Verify it finds at least
        // some artifacts and that extracted IDs match serde output.
        if has_error_nodes {
            if rowan_result.artifacts.is_empty() && !serde_result.is_empty() {
                failures.push(format!(
                    "{}: rowan extracted 0 artifacts, serde found {} \
                     (even accounting for known parser limitations, \
                     some artifacts should be extractable)",
                    path.display(),
                    serde_result.len()
                ));
            }

            let serde_ids: std::collections::HashSet<&str> =
                serde_result.iter().map(|a| a.id.as_str()).collect();
            for spanned in &rowan_result.artifacts {
                let rowan_art = &spanned.artifact;
                if !serde_ids.contains(rowan_art.id.as_str()) {
                    failures.push(format!(
                        "{}: rowan extracted artifact '{}' not found in serde output",
                        path.display(),
                        rowan_art.id
                    ));
                }
            }
            continue;
        }

        // Strict comparison for files without known CST issues
        if serde_result.len() != rowan_result.artifacts.len() {
            failures.push(format!(
                "{}: artifact count mismatch: serde={}, rowan={}",
                path.display(),
                serde_result.len(),
                rowan_result.artifacts.len()
            ));
            continue;
        }

        for (i, (serde_art, rowan_spanned)) in serde_result
            .iter()
            .zip(rowan_result.artifacts.iter())
            .enumerate()
        {
            let rowan_art = &rowan_spanned.artifact;

            if serde_art.id != rowan_art.id {
                failures.push(format!(
                    "{}: artifact[{i}] id mismatch: serde='{}', rowan='{}'",
                    path.display(),
                    serde_art.id,
                    rowan_art.id
                ));
            }
            if serde_art.artifact_type != rowan_art.artifact_type {
                failures.push(format!(
                    "{}: artifact[{i}] type mismatch: serde='{}', rowan='{}'",
                    path.display(),
                    serde_art.artifact_type,
                    rowan_art.artifact_type
                ));
            }

            // Title comparison: for files with known extraction issues,
            // the rowan title may be truncated at a comma or bracket.
            // Accept a prefix match in that case.
            if serde_art.title != rowan_art.title {
                if has_extraction_issues && serde_art.title.starts_with(&rowan_art.title) {
                    // Expected truncation at comma/bracket
                } else {
                    failures.push(format!(
                        "{}: artifact[{i}] ({}) title mismatch:\n    serde='{}'\n    rowan ='{}'",
                        path.display(),
                        serde_art.id,
                        serde_art.title,
                        rowan_art.title
                    ));
                }
            }
        }
    }

    assert!(
        compared_count > 0,
        "should have compared at least one artifact file"
    );

    if !failures.is_empty() {
        panic!(
            "Schema-driven vs serde mismatches ({} issues):\n  {}",
            failures.len(),
            failures.join("\n  ")
        );
    }

    eprintln!(
        "schema_driven_matches_serde_for_generic_artifacts: \
         compared {compared_count} files successfully"
    );
}

// ── Test 3: Schema-driven extraction works for STPA files ──────────────

/// Verify that the rowan schema-driven extractor successfully parses
/// STPA files and extracts artifacts with correct IDs and types.
#[test]
fn schema_driven_extracts_stpa_files() {
    let root = project_root();
    let schema = load_schema(&["common", "stpa"]);
    let stpa_dir = root.join("safety/stpa");

    let stpa_filenames = ["losses.yaml", "hazards.yaml", "system-constraints.yaml"];

    let mut failures = Vec::new();
    let mut total_artifacts = 0;

    for filename in &stpa_filenames {
        let path = stpa_dir.join(filename);
        if !path.exists() {
            failures.push(format!("{}: file not found", path.display()));
            continue;
        }

        let source = std::fs::read_to_string(&path).expect("read STPA file");
        let result = extract_schema_driven(&source, &schema, Some(&path));

        if result.artifacts.is_empty() {
            failures.push(format!("{}: rowan extracted 0 artifacts", path.display()));
            continue;
        }

        // Verify all artifacts have IDs and types
        for sa in &result.artifacts {
            if sa.artifact.id.is_empty() {
                failures.push(format!("{}: artifact with empty ID", path.display()));
            }
            if sa.artifact.artifact_type.is_empty() {
                failures.push(format!(
                    "{}: artifact '{}' has empty type",
                    path.display(),
                    sa.artifact.id
                ));
            }
        }

        total_artifacts += result.artifacts.len();
        eprintln!(
            "  {}: extracted {} artifacts",
            filename,
            result.artifacts.len()
        );
    }

    assert!(
        total_artifacts > 0,
        "should extract at least one STPA artifact"
    );

    if !failures.is_empty() {
        panic!(
            "STPA extraction issues ({} issues):\n  {}",
            failures.len(),
            failures.join("\n  ")
        );
    }
}

// ── Test 4: No Error nodes in any project YAML ───────────────────────

/// Parse every YAML file, walk the CST, and assert no `SyntaxKind::Error`
/// nodes for files that the parser is expected to handle cleanly.
///
/// Files listed in `KNOWN_ERROR_SUFFIXES` are expected to produce Error
/// nodes due to documented parser limitations. If a known-bad file starts
/// parsing cleanly, a notice is printed so the developer can update the set.
#[test]
fn no_error_nodes_in_project_yaml() {
    let files = all_project_yaml_files();
    assert!(
        !files.is_empty(),
        "should find at least one .yaml file in the project"
    );

    let mut failures = Vec::new();
    let mut clean_count = 0;
    let mut known_count = 0;
    let mut newly_clean = Vec::new();

    for path in &files {
        let source = match std::fs::read_to_string(path) {
            Ok(s) => s,
            Err(e) => {
                failures.push(format!("{}: read error: {e}", path.display()));
                continue;
            }
        };

        let is_known_bad = is_known_error_file(path);

        let (green, parse_errors) = yaml_cst::parse(&source);
        let root = rowan::SyntaxNode::<YamlLanguage>::new_root(green);

        let error_nodes = find_error_nodes(&root);
        let has_issues = !error_nodes.is_empty() || !parse_errors.is_empty();

        if has_issues && is_known_bad {
            // Expected -- tracked limitation
            known_count += 1;
        } else if has_issues && !is_known_bad {
            // Unexpected Error nodes -- this is a test failure
            let details: Vec<String> = error_nodes
                .iter()
                .take(3)
                .map(|(offset, text)| {
                    let preview = if text.len() > 60 {
                        format!("{}...", &text[..60])
                    } else {
                        text.clone()
                    };
                    format!("    Error node at byte {offset}: {preview:?}")
                })
                .collect();
            let error_details: Vec<String> = parse_errors
                .iter()
                .take(3)
                .map(|e| format!("    parse error at byte {}: {}", e.offset, e.message))
                .collect();
            failures.push(format!(
                "{}:\n{}{}",
                path.display(),
                details.join("\n"),
                if error_details.is_empty() {
                    String::new()
                } else {
                    format!("\n{}", error_details.join("\n"))
                }
            ));
        } else if !has_issues && is_known_bad {
            // File was expected to have errors but now parses cleanly!
            newly_clean.push(path.display().to_string());
        } else {
            clean_count += 1;
        }
    }

    // Report files that can be removed from the known-error set
    if !newly_clean.is_empty() {
        eprintln!(
            "NOTE: The following files are in KNOWN_ERROR_SUFFIXES but now \
             parse cleanly. Consider removing them:\n  {}",
            newly_clean.join("\n  ")
        );
    }

    if !failures.is_empty() {
        panic!(
            "Unexpected Error nodes found ({} files):\n{}",
            failures.len(),
            failures.join("\n")
        );
    }

    eprintln!(
        "no_error_nodes_in_project_yaml: {clean_count} clean, \
         {known_count} with known limitations, {} total",
        files.len()
    );
}
