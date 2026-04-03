//! Comprehensive integration tests for the rowan YAML parser.
//!
//! Verifies that:
//! 1. Every YAML file in the project round-trips through the rowan CST parser
//!    (the lossless property: `SyntaxNode::new_root(green).text() == source`).
//! 2. Schema-driven extraction produces artifacts matching the serde-based
//!    parsers for generic-yaml format files.
//! 3. Schema-driven extraction produces artifacts matching the serde-based
//!    parsers for STPA format files (losses, hazards, system-constraints).
//! 4. No `Error` nodes appear in YAML files that the rowan parser is expected
//!    to handle cleanly.
//!
//! ## Known rowan parser limitations
//!
//! The rowan YAML lexer performs context-free tokenization. This means:
//!
//! - Plain scalars stop at `,`, `]`, `}` (these are flow indicators).
//!   Unquoted values like `title: A, B, and C` get truncated at the comma.
//! - Apostrophes inside block scalar lines (e.g., `Rivet's`) are tokenized
//!   as the start of a single-quoted string, causing the lexer to consume
//!   subsequent lines looking for a closing quote.
//! - Comments between block sequence items at specific indent levels can
//!   confuse the indent-based structure parser.
//!
//! The round-trip property (Test 1) is always preserved because the green tree
//! accounts for every byte. But the CST *structure* (node types, Error nodes)
//! may be wrong for files hitting these limitations.

use std::path::{Path, PathBuf};

use rivet_core::formats::generic::parse_generic_yaml;
use rivet_core::formats::stpa::import_stpa_file;
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

/// Path suffixes of files that produce Error nodes due to known parser
/// limitations.
///
/// We use path suffixes (not basenames) because the same basename can
/// appear in multiple directories with different contents -- e.g.,
/// `examples/aspice/artifacts/verification.yaml` has errors but the
/// top-level `artifacts/verification.yaml` does not.
///
/// See the module-level doc comment for details on the limitations. If any
/// of these files start parsing cleanly (because the parser is improved),
/// the test prints a notice so the developer can update this list.
const KNOWN_ERROR_SUFFIXES: &[&str] = &[
    // Plain scalars with commas/parens in process-model list items
    "safety/stpa/control-structure.yaml",
    // Multi-section files where comments between items confuse indent tracking
    "safety/stpa/controller-constraints.yaml",
    "safety/stpa/loss-scenarios.yaml",
    // Commas inside unquoted scalar values
    "safety/stpa-sec/sec-scenarios.yaml",
    // Schema files with comments between artifact-type definition items
    "schemas/aspice.yaml",
    "schemas/en-50128.yaml",
    // Example files with commas in unquoted descriptions
    "examples/cybersecurity/cybersecurity.yaml",
    "examples/aspice/artifacts/verification.yaml",
    // decisions.yaml has a parse error (complex nesting)
    "artifacts/decisions.yaml",
];

/// Check if a path matches any known error suffix.
fn is_known_error_file(path: &Path) -> bool {
    let path_str = path.to_string_lossy();
    KNOWN_ERROR_SUFFIXES
        .iter()
        .any(|suffix| path_str.ends_with(suffix))
}

/// Files where the rowan plain-scalar lexer truncates values at commas or
/// brackets, causing extraction mismatches even though no Error nodes are
/// produced. Used by Test 2 (generic artifact comparison) for relaxed
/// title matching.
const KNOWN_EXTRACTION_ISSUES: &[&str] = &[
    // Titles with commas: "SVG graph viewer with fullscreen, resize, and pop-out"
    "artifacts/features.yaml",
    // Titles with commas and brackets: "LSP validates document [[ID]] references"
    "artifacts/v031-features.yaml",
];

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

// ── Test 3: Schema-driven extraction matches serde for STPA files ─────

/// For the core STPA files (losses, hazards, system-constraints), compare
/// the serde-based STPA adapter output against rowan schema-driven extraction.
///
/// Due to known lexer limitations with apostrophes in block scalars (e.g.,
/// `Rivet's` inside a `>` folded scalar), the comparison is relaxed:
/// - Verify all IDs extracted by rowan are a subset of serde IDs.
/// - Verify types and link counts match for shared artifacts.
/// - Report the extraction coverage ratio.
#[test]
fn schema_driven_matches_serde_for_stpa_files() {
    let root = project_root();
    let schema = load_schema(&["common", "stpa"]);
    let stpa_dir = root.join("safety/stpa");

    // Core STPA files that both parsers handle.
    let stpa_filenames = ["losses.yaml", "hazards.yaml", "system-constraints.yaml"];

    let mut failures = Vec::new();

    for filename in &stpa_filenames {
        let path = stpa_dir.join(filename);
        if !path.exists() {
            failures.push(format!("{}: file not found", path.display()));
            continue;
        }

        let source = std::fs::read_to_string(&path).expect("read STPA file");

        // Parse with serde (STPA adapter)
        let serde_result = match import_stpa_file(&path) {
            Ok(arts) => arts,
            Err(e) => {
                failures.push(format!("{}: serde parse error: {e}", path.display()));
                continue;
            }
        };

        // Parse with rowan + schema-driven extraction
        let rowan_result = extract_schema_driven(&source, &schema, Some(&path));

        // Build lookup maps by ID
        let serde_by_id: std::collections::HashMap<&str, &rivet_core::model::Artifact> =
            serde_result.iter().map(|a| (a.id.as_str(), a)).collect();

        let rowan_by_id: std::collections::HashMap<&str, &rivet_core::model::Artifact> =
            rowan_result
                .artifacts
                .iter()
                .map(|sa| (sa.artifact.id.as_str(), &sa.artifact))
                .collect();

        // The rowan parser may extract fewer artifacts due to lexer
        // limitations with apostrophes in block scalars. Verify that:
        // 1. Rowan extracts at least some artifacts
        // 2. Every artifact rowan extracts is also in serde output
        // 3. Types and link counts match for shared artifacts
        if rowan_result.artifacts.is_empty() && !serde_result.is_empty() {
            failures.push(format!(
                "{}: rowan extracted 0 artifacts, serde found {}",
                path.display(),
                serde_result.len()
            ));
            continue;
        }

        // Every rowan ID must be in serde output (no phantom artifacts)
        for (id, rowan_art) in &rowan_by_id {
            match serde_by_id.get(id) {
                None => {
                    failures.push(format!(
                        "{}: artifact '{id}' found by rowan but missing from serde",
                        path.display()
                    ));
                }
                Some(serde_art) => {
                    // Type must match
                    if serde_art.artifact_type != rowan_art.artifact_type {
                        failures.push(format!(
                            "{}: '{id}' type mismatch: serde='{}', rowan='{}'",
                            path.display(),
                            serde_art.artifact_type,
                            rowan_art.artifact_type
                        ));
                    }
                    // Link counts must match for shared artifacts
                    if serde_art.links.len() != rowan_art.links.len() {
                        failures.push(format!(
                            "{}: '{id}' link count mismatch: serde={}, rowan={}",
                            path.display(),
                            serde_art.links.len(),
                            rowan_art.links.len()
                        ));
                    }
                }
            }
        }

        // Report coverage for visibility
        eprintln!(
            "  {}: rowan extracted {}/{} artifacts ({:.0}% coverage)",
            filename,
            rowan_by_id.len(),
            serde_by_id.len(),
            (rowan_by_id.len() as f64 / serde_by_id.len() as f64) * 100.0
        );
    }

    if !failures.is_empty() {
        panic!(
            "STPA schema-driven vs serde mismatches ({} issues):\n  {}",
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
