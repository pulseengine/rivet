//! Test-to-requirement source scanner.
//!
//! Scans source files for marker comments/attributes that link tests to
//! requirements, then computes test coverage against the artifact store.

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

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use regex::Regex;
use serde::Serialize;

use crate::schema::Schema;
use crate::store::Store;

// ---------------------------------------------------------------------------
// Data types
// ---------------------------------------------------------------------------

/// A single test marker found in source code.
#[derive(Debug, Clone, Serialize)]
pub struct TestMarker {
    /// Function/method name if detectable, otherwise "file:line".
    pub test_name: String,
    /// Source file containing the marker.
    pub file: PathBuf,
    /// Line number (1-based) where the marker was found.
    pub line: usize,
    /// Link type: "verifies" or "partially-verifies".
    pub link_type: String,
    /// Target artifact ID (e.g., "REQ-001").
    pub target_id: String,
}

/// A compiled regex pattern for detecting test markers in a specific language.
#[derive(Debug, Clone)]
pub struct MarkerPattern {
    /// Language this pattern applies to (e.g., "rust", "python", "generic").
    pub language: String,
    /// Compiled regex with capture groups.
    pub pattern: Regex,
    /// Capture group index for the link type.
    pub link_type_group: usize,
    /// Capture group index for the artifact ID.
    pub id_group: usize,
}

/// Test coverage report computed from markers and the artifact store.
#[derive(Debug, Clone, Serialize)]
pub struct TestCoverage {
    /// Artifact IDs that have at least one test marker, with their markers.
    pub covered: Vec<(String, Vec<TestMarker>)>,
    /// Artifact IDs with no test markers.
    pub uncovered: Vec<String>,
    /// Total number of markers found.
    pub total_markers: usize,
    /// Markers referencing artifact IDs that do not exist in the store.
    pub broken_refs: Vec<TestMarker>,
}

// ---------------------------------------------------------------------------
// Default patterns
// ---------------------------------------------------------------------------

/// Build the set of default marker patterns for supported languages.
pub fn default_patterns() -> Vec<MarkerPattern> {
    vec![
        // Rust comment: // rivet: verifies REQ-001
        MarkerPattern {
            language: "rust".into(),
            pattern: Regex::new(r"//\s*rivet:\s*(verifies|partially-verifies)\s+([\w-]+)")
                .expect("valid regex"),
            link_type_group: 1,
            id_group: 2,
        },
        // Rust attribute: #[rivet::verifies("REQ-001")]
        MarkerPattern {
            language: "rust".into(),
            pattern: Regex::new(r#"#\[rivet::(verifies|partially_verifies)\("([\w-]+)"\)\]"#)
                .expect("valid regex"),
            link_type_group: 1,
            id_group: 2,
        },
        // Python comment: # rivet: verifies REQ-001
        MarkerPattern {
            language: "python".into(),
            pattern: Regex::new(r"#\s*rivet:\s*(verifies|partially-verifies)\s+([\w-]+)")
                .expect("valid regex"),
            link_type_group: 1,
            id_group: 2,
        },
        // Python decorator: @rivet_verifies("REQ-001")
        MarkerPattern {
            language: "python".into(),
            pattern: Regex::new(r#"@rivet_(verifies|partially_verifies)\("([\w-]+)"\)"#)
                .expect("valid regex"),
            link_type_group: 1,
            id_group: 2,
        },
        // Generic comment (C, C++, Java, etc.): // rivet: verifies REQ-001
        MarkerPattern {
            language: "generic".into(),
            pattern: Regex::new(r"//\s*rivet:\s*(verifies|partially-verifies)\s+([\w-]+)")
                .expect("valid regex"),
            link_type_group: 1,
            id_group: 2,
        },
    ]
}

/// Detect the language category from a file extension.
fn detect_language(path: &Path) -> Option<&'static str> {
    let ext = path.extension()?.to_str()?;
    match ext {
        "rs" => Some("rust"),
        "py" | "pyi" => Some("python"),
        "c" | "h" | "cpp" | "cxx" | "cc" | "hpp" | "hxx" => Some("generic"),
        "java" => Some("generic"),
        "js" | "ts" | "jsx" | "tsx" => Some("generic"),
        "go" => Some("generic"),
        "swift" => Some("generic"),
        "kt" | "kts" => Some("generic"),
        _ => None,
    }
}

/// Try to find the enclosing function/method name by scanning backwards
/// from the marker line.
fn find_enclosing_function(lines: &[&str], marker_line: usize, language: &str) -> Option<String> {
    let fn_pattern = match language {
        "rust" => Regex::new(r"(?:pub\s+)?(?:async\s+)?fn\s+(\w+)").ok()?,
        "python" => Regex::new(r"def\s+(\w+)").ok()?,
        // Generic: covers C/C++/Java/Go-style function declarations
        _ => Regex::new(r"(?:pub\s+)?(?:fn|func|function|def|void|int|bool|auto)\s+(\w+)\s*\(")
            .ok()?,
    };

    // Scan backwards from the marker line to find the nearest function declaration.
    for i in (0..marker_line).rev() {
        if let Some(caps) = fn_pattern.captures(lines[i]) {
            if let Some(name) = caps.get(1) {
                return Some(name.as_str().to_string());
            }
        }
    }
    None
}

/// Normalise link types: convert underscores to hyphens.
fn normalise_link_type(raw: &str) -> String {
    raw.replace('_', "-")
}

// ---------------------------------------------------------------------------
// Scanning
// ---------------------------------------------------------------------------

/// Scan a list of paths (files or directories) for test markers.
///
/// Recursively walks directories.  For each file, detects the language from
/// its extension and applies the matching patterns.
pub fn scan_source_files(paths: &[PathBuf], patterns: &[MarkerPattern]) -> Vec<TestMarker> {
    let mut markers = Vec::new();

    for path in paths {
        if path.is_dir() {
            scan_directory(path, patterns, &mut markers);
        } else if path.is_file() {
            scan_file(path, patterns, &mut markers);
        }
    }

    markers
}

/// Recursively walk a directory and scan each source file.
fn scan_directory(dir: &Path, patterns: &[MarkerPattern], markers: &mut Vec<TestMarker>) {
    let entries = match std::fs::read_dir(dir) {
        Ok(e) => e,
        Err(_) => return,
    };

    for entry in entries.flatten() {
        let path = entry.path();
        if path.is_dir() {
            // Skip hidden directories and common non-source dirs.
            if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                if name.starts_with('.') || name == "target" || name == "node_modules" {
                    continue;
                }
            }
            scan_directory(&path, patterns, markers);
        } else if path.is_file() {
            scan_file(&path, patterns, markers);
        }
    }
}

/// Scan a single file for test markers.
fn scan_file(path: &Path, patterns: &[MarkerPattern], markers: &mut Vec<TestMarker>) {
    let language = match detect_language(path) {
        Some(l) => l,
        None => return,
    };

    let content = match std::fs::read_to_string(path) {
        Ok(c) => c,
        Err(_) => return,
    };

    let lines: Vec<&str> = content.lines().collect();

    // Select patterns that match this language.
    let applicable: Vec<&MarkerPattern> = patterns
        .iter()
        .filter(|p| p.language == language || p.language == "generic")
        .collect();

    for (line_idx, line) in lines.iter().enumerate() {
        for pattern in &applicable {
            if let Some(caps) = pattern.pattern.captures(line) {
                let raw_link_type = caps
                    .get(pattern.link_type_group)
                    .map(|m| m.as_str())
                    .unwrap_or("verifies");
                let target_id = caps
                    .get(pattern.id_group)
                    .map(|m| m.as_str().to_string())
                    .unwrap_or_default();

                if target_id.is_empty() {
                    continue;
                }

                let link_type = normalise_link_type(raw_link_type);

                let test_name =
                    find_enclosing_function(&lines, line_idx, language).unwrap_or_else(|| {
                        format!(
                            "{}:{}",
                            path.file_name()
                                .and_then(|n| n.to_str())
                                .unwrap_or("unknown"),
                            line_idx + 1,
                        )
                    });

                markers.push(TestMarker {
                    test_name,
                    file: path.to_path_buf(),
                    line: line_idx + 1,
                    link_type,
                    target_id,
                });

                // Don't double-match the same line with another pattern for the same language.
                break;
            }
        }
    }
}

// ---------------------------------------------------------------------------
// Coverage computation
// ---------------------------------------------------------------------------

/// Compute test coverage by cross-referencing markers against the store.
///
/// An artifact type is "coverable" (i.e. should be verified by tests) if the
/// schema defines a traceability rule with a `required-backlink` that contains
/// "verifies" for that type. This is derived from the schema rather than
/// hardcoded prefixes.
///
/// If `schema` is `None`, all artifacts in the store are considered coverable.
/// Markers referencing IDs that do not exist in the store land in `broken_refs`.
pub fn compute_test_coverage(
    markers: &[TestMarker],
    store: &Store,
    schema: Option<&Schema>,
) -> TestCoverage {
    // Group markers by target artifact ID.
    let mut by_id: BTreeMap<String, Vec<TestMarker>> = BTreeMap::new();
    let mut broken_refs = Vec::new();

    for marker in markers {
        if store.contains(&marker.target_id) {
            by_id
                .entry(marker.target_id.clone())
                .or_default()
                .push(marker.clone());
        } else {
            broken_refs.push(marker.clone());
        }
    }

    // Determine which artifact types are "coverable" from the schema.
    // A type is coverable if any traceability rule has a `required-backlink`
    // containing "verifies" (or similar) for that source-type.
    let coverable_types: std::collections::HashSet<&str> = match schema {
        Some(s) => s
            .traceability_rules
            .iter()
            .filter(|rule| {
                rule.required_backlink
                    .as_deref()
                    .is_some_and(|bl| bl.contains("verifies"))
            })
            .map(|rule| rule.source_type.as_str())
            .collect(),
        None => {
            // No schema: treat all artifact types as coverable.
            store.types().collect()
        }
    };

    let mut coverable_ids: Vec<String> = store
        .iter()
        .filter(|a| coverable_types.contains(a.artifact_type.as_str()))
        .map(|a| a.id.clone())
        .collect();
    coverable_ids.sort();

    let mut covered = Vec::new();
    let mut uncovered = Vec::new();

    for id in &coverable_ids {
        if let Some(markers) = by_id.remove(id) {
            covered.push((id.clone(), markers));
        } else {
            uncovered.push(id.clone());
        }
    }

    // Also include non-coverable artifacts that happen to have markers.
    for (id, markers) in by_id {
        covered.push((id, markers));
    }

    // Sort covered by ID for stable output.
    covered.sort_by(|a, b| a.0.cmp(&b.0));

    let total_markers = markers.len() - broken_refs.len();

    TestCoverage {
        covered,
        uncovered,
        total_markers,
        broken_refs,
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Artifact;
    use std::io::Write;
    use tempfile::TempDir;

    /// Helper to create an artifact for the store.
    fn make_artifact(id: &str) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: "requirement".into(),
            title: id.into(),
            description: None,
            status: None,
            tags: vec![],
            links: vec![],
            fields: Default::default(),
            provenance: None,
            source_file: None,
        }
    }

    /// Helper to write a file in a temp directory.
    fn write_file(dir: &Path, name: &str, content: &str) -> PathBuf {
        let path = dir.join(name);
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent).unwrap();
        }
        let mut f = std::fs::File::create(&path).unwrap();
        f.write_all(content.as_bytes()).unwrap();
        path
    }

    // ── Test: Rust comment marker ────────────────────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn rust_comment_marker_detected() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/foo.rs",
            "\
fn test_something() {
    // rivet: verifies REQ-001
    assert!(true);
}
",
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 1);
        assert_eq!(markers[0].target_id, "REQ-001");
        assert_eq!(markers[0].link_type, "verifies");
        assert_eq!(markers[0].test_name, "test_something");
        assert_eq!(markers[0].line, 2);
    }

    // ── Test: Rust attribute marker ──────────────────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn rust_attribute_marker_detected() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/bar.rs",
            r#"
#[rivet::verifies("REQ-002")]
fn test_bar() {
    assert!(true);
}
"#,
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 1);
        assert_eq!(markers[0].target_id, "REQ-002");
        assert_eq!(markers[0].link_type, "verifies");
    }

    // ── Test: Python comment marker ──────────────────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn python_comment_marker_detected() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/test_foo.py",
            "\
def test_foo():
    # rivet: verifies REQ-003
    assert True
",
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 1);
        assert_eq!(markers[0].target_id, "REQ-003");
        assert_eq!(markers[0].link_type, "verifies");
        assert_eq!(markers[0].test_name, "test_foo");
    }

    // ── Test: Python decorator marker ────────────────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn python_decorator_marker_detected() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/test_dec.py",
            r#"
@rivet_verifies("REQ-004")
def test_decorated():
    assert True
"#,
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 1);
        assert_eq!(markers[0].target_id, "REQ-004");
        assert_eq!(markers[0].link_type, "verifies");
    }

    // ── Test: Multiple markers in one file ───────────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn multiple_markers_in_one_file() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/multi.rs",
            "\
fn test_a() {
    // rivet: verifies REQ-001
    assert!(true);
}

fn test_b() {
    // rivet: partially-verifies REQ-002
    assert!(true);
}

fn test_c() {
    // rivet: verifies REQ-001
    assert!(true);
}
",
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 3);
        assert_eq!(markers[0].target_id, "REQ-001");
        assert_eq!(markers[0].test_name, "test_a");
        assert_eq!(markers[1].target_id, "REQ-002");
        assert_eq!(markers[1].link_type, "partially-verifies");
        assert_eq!(markers[1].test_name, "test_b");
        assert_eq!(markers[2].target_id, "REQ-001");
        assert_eq!(markers[2].test_name, "test_c");
    }

    // ── Test: Non-matching lines are ignored ─────────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn non_matching_lines_ignored() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "src/lib.rs",
            "\
// This is a normal comment
fn main() {
    println!(\"hello\");
    // another comment, not a rivet marker
    let x = 42;
}
",
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert!(markers.is_empty());
    }

    // ── Test: Marker with non-existent artifact -> broken_refs ───────────

    // rivet: verifies REQ-026
    #[test]
    fn broken_ref_detection() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/broken.rs",
            "\
fn test_broken() {
    // rivet: verifies REQ-999
    assert!(true);
}
",
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 1);

        let mut store = Store::new();
        store.insert(make_artifact("REQ-001")).unwrap();

        let coverage = compute_test_coverage(&markers, &store, None);
        assert_eq!(coverage.broken_refs.len(), 1);
        assert_eq!(coverage.broken_refs[0].target_id, "REQ-999");
        assert!(coverage.covered.is_empty());
    }

    // ── Test: compute_test_coverage partitions correctly ─────────────────

    // rivet: verifies REQ-026
    #[test]
    fn coverage_partitions_correctly() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/coverage.rs",
            "\
fn test_first() {
    // rivet: verifies REQ-001
    assert!(true);
}

fn test_second() {
    // rivet: verifies REQ-001
    assert!(true);
}

fn test_third() {
    // rivet: verifies REQ-003
    assert!(true);
}
",
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 3);

        let mut store = Store::new();
        store.insert(make_artifact("REQ-001")).unwrap();
        store.insert(make_artifact("REQ-002")).unwrap();
        store.insert(make_artifact("REQ-003")).unwrap();

        let coverage = compute_test_coverage(&markers, &store, None);

        // REQ-001 has 2 markers, REQ-003 has 1
        assert_eq!(coverage.covered.len(), 2);
        let req001 = coverage.covered.iter().find(|(id, _)| id == "REQ-001");
        assert!(req001.is_some());
        assert_eq!(req001.unwrap().1.len(), 2);

        let req003 = coverage.covered.iter().find(|(id, _)| id == "REQ-003");
        assert!(req003.is_some());
        assert_eq!(req003.unwrap().1.len(), 1);

        // REQ-002 is uncovered
        assert_eq!(coverage.uncovered, vec!["REQ-002"]);

        // No broken refs
        assert!(coverage.broken_refs.is_empty());

        // Total markers = 3 (all valid)
        assert_eq!(coverage.total_markers, 3);
    }

    // ── Test: Empty directory returns empty vec ──────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn empty_directory_returns_empty() {
        let tmp = TempDir::new().unwrap();
        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert!(markers.is_empty());
    }

    // ── Test: Partially-verifies normalised from underscore ──────────────

    // rivet: verifies REQ-026
    #[test]
    fn partially_verifies_underscore_normalised() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/partial.rs",
            r#"
#[rivet::partially_verifies("REQ-010")]
fn test_partial() {
    assert!(true);
}
"#,
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 1);
        assert_eq!(markers[0].link_type, "partially-verifies");
        assert_eq!(markers[0].target_id, "REQ-010");
    }

    // ── Test: Generic comment (C/Java) ───────────────────────────────────

    // rivet: verifies REQ-026
    #[test]
    fn generic_comment_c_file() {
        let tmp = TempDir::new().unwrap();
        write_file(
            tmp.path(),
            "tests/test.c",
            "\
void test_safety() {
    // rivet: verifies SYSREQ-005
    assert(1);
}
",
        );

        let markers = scan_source_files(&[tmp.path().to_path_buf()], &default_patterns());
        assert_eq!(markers.len(), 1);
        assert_eq!(markers[0].target_id, "SYSREQ-005");
        assert_eq!(markers[0].link_type, "verifies");
    }
}
