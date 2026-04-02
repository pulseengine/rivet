//! HIR (High-level Intermediate Representation) extraction from the rowan YAML CST.
//!
//! Walks the lossless CST produced by [`crate::yaml_cst::parse`] and extracts
//! [`SpannedArtifact`] values with byte-accurate spans.  This enables
//! diagnostic reporting, LSP go-to-definition, and incremental re-validation
//! without re-parsing.
//!
//! Entry point: [`extract_generic_artifacts`].

use std::collections::BTreeMap;

use crate::model::{Artifact, Link};
use crate::schema::Severity;
use crate::yaml_cst::{self, SyntaxKind, SyntaxNode};

// ── Public types ───────────────────────────────────────────────────────

/// A byte-offset span into the source text.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct Span {
    pub start: u32,
    pub end: u32,
}

impl Span {
    fn from_text_range(r: rowan::TextRange) -> Self {
        Self {
            start: u32::from(r.start()),
            end: u32::from(r.end()),
        }
    }
}

/// An artifact together with source-level span information.
#[derive(Debug, Clone)]
pub struct SpannedArtifact {
    pub artifact: Artifact,
    /// Span of the `id` value scalar.
    pub id_span: Span,
    /// Span of the entire SequenceItem that defines this artifact.
    pub block_span: Span,
    /// Spans of individual known fields (key text → span of the value node).
    pub field_spans: BTreeMap<String, Span>,
}

/// A diagnostic produced during HIR extraction.
#[derive(Debug, Clone)]
pub struct ParseDiagnostic {
    pub span: Span,
    pub message: String,
    pub severity: Severity,
}

/// Result of extracting artifacts from a YAML source string.
pub struct ParsedYamlFile {
    pub artifacts: Vec<SpannedArtifact>,
    pub diagnostics: Vec<ParseDiagnostic>,
}

// ── Entry point ────────────────────────────────────────────────────────

/// Parse `source` with the rowan-based YAML parser and extract generic
/// artifacts with spans.
pub fn extract_generic_artifacts(source: &str) -> ParsedYamlFile {
    let (green, _parse_errors) = yaml_cst::parse(source);
    let root = SyntaxNode::new_root(green);

    let mut result = ParsedYamlFile {
        artifacts: Vec::new(),
        diagnostics: Vec::new(),
    };

    // Walk root → Mapping → find "artifacts" key → Sequence
    let Some(root_mapping) = child_of_kind(&root, SyntaxKind::Mapping) else {
        return result;
    };

    let Some(artifacts_entry) = find_mapping_entry(&root_mapping, "artifacts") else {
        return result;
    };

    let Some(value_node) = child_of_kind(&artifacts_entry, SyntaxKind::Value) else {
        return result;
    };

    // Value may contain a Sequence (block) or FlowSequence (empty [])
    let sequence_node = child_of_kind(&value_node, SyntaxKind::Sequence)
        .or_else(|| child_of_kind(&value_node, SyntaxKind::FlowSequence));

    let Some(sequence_node) = sequence_node else {
        return result;
    };

    // If it's a FlowSequence (e.g. `artifacts: []`), no items to extract.
    if node_kind(&sequence_node) == SyntaxKind::FlowSequence {
        return result;
    }

    // Iterate SequenceItems
    for item in sequence_node.children() {
        if node_kind(&item) != SyntaxKind::SequenceItem {
            continue;
        }
        extract_artifact_from_item(&item, &mut result);
    }

    result
}

// ── Artifact extraction ────────────────────────────────────────────────

fn extract_artifact_from_item(item: &SyntaxNode, result: &mut ParsedYamlFile) {
    let block_span = Span::from_text_range(item.text_range());

    // The SequenceItem should contain a Mapping.
    let Some(mapping) = child_of_kind(item, SyntaxKind::Mapping) else {
        result.diagnostics.push(ParseDiagnostic {
            span: block_span,
            message: "expected mapping inside sequence item".into(),
            severity: Severity::Error,
        });
        return;
    };

    let mut id: Option<String> = None;
    let mut id_span = Span { start: 0, end: 0 };
    let mut artifact_type = String::new();
    let mut title = String::new();
    let mut description: Option<String> = None;
    let mut status: Option<String> = None;
    let mut tags: Vec<String> = Vec::new();
    let mut links: Vec<Link> = Vec::new();
    let mut fields: BTreeMap<String, serde_yaml::Value> = BTreeMap::new();
    let mut field_spans: BTreeMap<String, Span> = BTreeMap::new();

    // Walk all MappingEntry children
    for entry in mapping.children() {
        if node_kind(&entry) != SyntaxKind::MappingEntry {
            continue;
        }

        let Some(key_node) = child_of_kind(&entry, SyntaxKind::Key) else {
            continue;
        };
        let Some(key_text) = scalar_text(&key_node) else {
            continue;
        };
        let Some(value_node) = child_of_kind(&entry, SyntaxKind::Value) else {
            continue;
        };

        let value_span = Span::from_text_range(value_node.text_range());

        match key_text.as_str() {
            "id" => {
                if let Some(text) = scalar_text(&value_node) {
                    id = Some(text);
                    id_span = value_span;
                    field_spans.insert("id".into(), value_span);
                }
            }
            "type" => {
                if let Some(text) = scalar_text(&value_node) {
                    artifact_type = text;
                    field_spans.insert("type".into(), value_span);
                }
            }
            "title" => {
                if let Some(text) = scalar_text(&value_node) {
                    title = text;
                    field_spans.insert("title".into(), value_span);
                }
            }
            "description" => {
                let text = scalar_text(&value_node).or_else(|| block_scalar_text(&value_node));
                description = text;
                field_spans.insert("description".into(), value_span);
            }
            "status" => {
                if let Some(text) = scalar_text(&value_node) {
                    status = Some(text);
                    field_spans.insert("status".into(), value_span);
                }
            }
            "tags" => {
                tags = extract_string_list(&value_node);
                field_spans.insert("tags".into(), value_span);
            }
            "links" => {
                links = extract_links(&value_node);
                field_spans.insert("links".into(), value_span);
            }
            "fields" => {
                // Nested mapping of custom fields
                if let Some(nested_map) = child_of_kind(&value_node, SyntaxKind::Mapping) {
                    for fentry in nested_map.children() {
                        if node_kind(&fentry) != SyntaxKind::MappingEntry {
                            continue;
                        }
                        let Some(fk) = child_of_kind(&fentry, SyntaxKind::Key) else {
                            continue;
                        };
                        let Some(fk_text) = scalar_text(&fk) else {
                            continue;
                        };
                        let Some(fv) = child_of_kind(&fentry, SyntaxKind::Value) else {
                            continue;
                        };
                        let fv_span = Span::from_text_range(fv.text_range());
                        let value = node_to_yaml_value(&fv);
                        fields.insert(fk_text.clone(), value);
                        field_spans.insert(format!("fields.{}", fk_text), fv_span);
                    }
                }
            }
            other => {
                // Unknown top-level key → store in fields
                let value = node_to_yaml_value(&value_node);
                fields.insert(other.to_string(), value);
                field_spans.insert(other.to_string(), value_span);
            }
        }
    }

    // Validate: id is required
    let Some(id_val) = id else {
        result.diagnostics.push(ParseDiagnostic {
            span: block_span,
            message: "artifact is missing required 'id' field".into(),
            severity: Severity::Error,
        });
        return;
    };

    let artifact = Artifact {
        id: id_val,
        artifact_type,
        title,
        description,
        status,
        tags,
        links,
        fields,
        source_file: None,
    };

    result.artifacts.push(SpannedArtifact {
        artifact,
        id_span,
        block_span,
        field_spans,
    });
}

// ── Link extraction ────────────────────────────────────────────────────

fn extract_links(value_node: &SyntaxNode) -> Vec<Link> {
    let mut links = Vec::new();

    // Links is a Sequence of Mappings: each with "type" + "target".
    let Some(seq) = child_of_kind(value_node, SyntaxKind::Sequence) else {
        return links;
    };

    for item in seq.children() {
        if node_kind(&item) != SyntaxKind::SequenceItem {
            continue;
        }
        let Some(map) = child_of_kind(&item, SyntaxKind::Mapping) else {
            continue;
        };

        let mut link_type = String::new();
        let mut target = String::new();

        for entry in map.children() {
            if node_kind(&entry) != SyntaxKind::MappingEntry {
                continue;
            }
            let Some(k) = child_of_kind(&entry, SyntaxKind::Key) else {
                continue;
            };
            let Some(k_text) = scalar_text(&k) else {
                continue;
            };
            let Some(v) = child_of_kind(&entry, SyntaxKind::Value) else {
                continue;
            };
            match k_text.as_str() {
                "type" => {
                    if let Some(t) = scalar_text(&v) {
                        link_type = t;
                    }
                }
                "target" => {
                    if let Some(t) = scalar_text(&v) {
                        target = t;
                    }
                }
                _ => {}
            }
        }

        if !link_type.is_empty() && !target.is_empty() {
            links.push(Link { link_type, target });
        }
    }

    links
}

// ── String list extraction (tags, etc.) ────────────────────────────────

fn extract_string_list(value_node: &SyntaxNode) -> Vec<String> {
    let mut items = Vec::new();

    // Check for FlowSequence: [a, b, c]
    if let Some(flow) = child_of_kind(value_node, SyntaxKind::FlowSequence) {
        for token in flow.descendants_with_tokens() {
            if let rowan::NodeOrToken::Token(t) = token {
                let k = t.kind();
                match k {
                    SyntaxKind::PlainScalar
                    | SyntaxKind::SingleQuotedScalar
                    | SyntaxKind::DoubleQuotedScalar => {
                        items.push(unquote_scalar(k, &t.text().to_string()));
                    }
                    _ => {}
                }
            }
        }
        return items;
    }

    // Block sequence: - item
    if let Some(seq) = child_of_kind(value_node, SyntaxKind::Sequence) {
        for item in seq.children() {
            if node_kind(&item) != SyntaxKind::SequenceItem {
                continue;
            }
            if let Some(text) = scalar_text(&item) {
                items.push(text);
            }
        }
    }

    items
}

// ── Scalar → serde_yaml::Value conversion (YAML 1.2) ──────────────────

fn scalar_to_yaml_value(kind: SyntaxKind, raw: &str) -> serde_yaml::Value {
    match kind {
        SyntaxKind::SingleQuotedScalar => {
            let inner = &raw[1..raw.len() - 1];
            let unescaped = inner.replace("''", "'");
            serde_yaml::Value::String(unescaped)
        }
        SyntaxKind::DoubleQuotedScalar => {
            let inner = &raw[1..raw.len() - 1];
            serde_yaml::Value::String(inner.to_string())
        }
        SyntaxKind::PlainScalar => plain_scalar_to_value(raw),
        _ => serde_yaml::Value::String(raw.to_string()),
    }
}

fn plain_scalar_to_value(s: &str) -> serde_yaml::Value {
    // YAML 1.2 core schema rules
    match s {
        "null" | "~" => serde_yaml::Value::Null,
        "true" => serde_yaml::Value::Bool(true),
        "false" => serde_yaml::Value::Bool(false),
        _ => {
            // Integer?
            if s.bytes().all(|b| b.is_ascii_digit()) && !s.is_empty() {
                if let Ok(n) = s.parse::<u64>() {
                    return serde_yaml::Value::Number(n.into());
                }
            }
            // Float? pattern: digits.digits
            if let Some((int_part, frac_part)) = s.split_once('.') {
                if !int_part.is_empty()
                    && !frac_part.is_empty()
                    && int_part.bytes().all(|b| b.is_ascii_digit())
                    && frac_part.bytes().all(|b| b.is_ascii_digit())
                {
                    if let Ok(f) = s.parse::<f64>() {
                        return serde_yaml::Value::Number(serde_yaml::Number::from(f));
                    }
                }
            }
            serde_yaml::Value::String(s.to_string())
        }
    }
}

/// Convert a Value node to a serde_yaml::Value.
fn node_to_yaml_value(value_node: &SyntaxNode) -> serde_yaml::Value {
    // Check for nested mapping → convert to YAML mapping
    if let Some(map) = child_of_kind(value_node, SyntaxKind::Mapping) {
        let mut mapping = serde_yaml::Mapping::new();
        for entry in map.children() {
            if node_kind(&entry) != SyntaxKind::MappingEntry {
                continue;
            }
            let Some(k) = child_of_kind(&entry, SyntaxKind::Key) else {
                continue;
            };
            let Some(k_text) = scalar_text(&k) else {
                continue;
            };
            let Some(v) = child_of_kind(&entry, SyntaxKind::Value) else {
                continue;
            };
            mapping.insert(serde_yaml::Value::String(k_text), node_to_yaml_value(&v));
        }
        return serde_yaml::Value::Mapping(mapping);
    }

    // Check for sequence → convert to YAML sequence
    if let Some(seq) = child_of_kind(value_node, SyntaxKind::Sequence) {
        let mut arr = Vec::new();
        for item in seq.children() {
            if node_kind(&item) != SyntaxKind::SequenceItem {
                continue;
            }
            // SequenceItem might contain a mapping or scalar
            arr.push(node_to_yaml_value(&item));
        }
        return serde_yaml::Value::Sequence(arr);
    }

    // Check for flow sequence
    if let Some(flow) = child_of_kind(value_node, SyntaxKind::FlowSequence) {
        let mut arr = Vec::new();
        for token in flow.descendants_with_tokens() {
            if let rowan::NodeOrToken::Token(t) = token {
                let k = t.kind();
                match k {
                    SyntaxKind::PlainScalar
                    | SyntaxKind::SingleQuotedScalar
                    | SyntaxKind::DoubleQuotedScalar => {
                        let raw = t.text().to_string();
                        arr.push(scalar_to_yaml_value(k, &raw));
                    }
                    _ => {}
                }
            }
        }
        return serde_yaml::Value::Sequence(arr);
    }

    // Check for block scalar
    if let Some(text) = block_scalar_text(value_node) {
        return serde_yaml::Value::String(text);
    }

    // Try plain/quoted scalar
    for token in value_node.descendants_with_tokens() {
        if let rowan::NodeOrToken::Token(t) = token {
            let k = t.kind();
            match k {
                SyntaxKind::PlainScalar
                | SyntaxKind::SingleQuotedScalar
                | SyntaxKind::DoubleQuotedScalar => {
                    let raw = t.text().to_string();
                    return scalar_to_yaml_value(k, &raw);
                }
                _ => {}
            }
        }
    }

    serde_yaml::Value::Null
}

// ── Tree-walking helpers ───────────────────────────────────────────────

fn node_kind(node: &SyntaxNode) -> SyntaxKind {
    node.kind()
}

fn child_of_kind(node: &SyntaxNode, kind: SyntaxKind) -> Option<SyntaxNode> {
    node.children().find(|c| node_kind(c) == kind)
}

/// Get the text of the first scalar token descended from `node`.
fn scalar_text(node: &SyntaxNode) -> Option<String> {
    for token in node.descendants_with_tokens() {
        if let rowan::NodeOrToken::Token(t) = token {
            let k = t.kind();
            match k {
                SyntaxKind::PlainScalar
                | SyntaxKind::SingleQuotedScalar
                | SyntaxKind::DoubleQuotedScalar => {
                    return Some(unquote_scalar(k, &t.text().to_string()));
                }
                _ => {}
            }
        }
    }
    None
}

/// Strip quotes from a scalar token.
fn unquote_scalar(kind: SyntaxKind, raw: &str) -> String {
    match kind {
        SyntaxKind::SingleQuotedScalar => raw[1..raw.len() - 1].replace("''", "'"),
        SyntaxKind::DoubleQuotedScalar => raw[1..raw.len() - 1].to_string(),
        _ => raw.to_string(),
    }
}

/// Extract block-scalar text from a Value node.
///
/// Looks for a BlockScalar child and concatenates its BlockScalarLine tokens,
/// stripping the common indent prefix.
fn block_scalar_text(value_node: &SyntaxNode) -> Option<String> {
    let block = child_of_kind(value_node, SyntaxKind::BlockScalar)?;
    let mut lines: Vec<String> = Vec::new();

    for token in block.descendants_with_tokens() {
        if let rowan::NodeOrToken::Token(t) = token {
            let k = t.kind();
            if k == SyntaxKind::BlockScalarLine {
                lines.push(t.text().to_string());
            }
        }
    }

    if lines.is_empty() {
        return None;
    }

    // Find common indent prefix (minimum non-empty leading spaces)
    let min_indent = lines
        .iter()
        .filter(|l| !l.trim().is_empty())
        .map(|l| l.len() - l.trim_start().len())
        .min()
        .unwrap_or(0);

    let mut result = String::new();
    for line in &lines {
        if line.trim().is_empty() {
            result.push('\n');
        } else if line.len() > min_indent {
            result.push_str(&line[min_indent..]);
        } else {
            result.push_str(line);
        }
    }

    // Trim trailing newlines and add a single trailing newline
    let trimmed = result.trim_end_matches('\n');
    Some(trimmed.to_string() + "\n")
}

/// Find a MappingEntry whose key text matches `name`.
fn find_mapping_entry(mapping: &SyntaxNode, name: &str) -> Option<SyntaxNode> {
    for entry in mapping.children() {
        if node_kind(&entry) != SyntaxKind::MappingEntry {
            continue;
        }
        let Some(key_node) = child_of_kind(&entry, SyntaxKind::Key) else {
            continue;
        };
        if scalar_text(&key_node).as_deref() == Some(name) {
            return Some(entry);
        }
    }
    None
}

// ── Tests ──────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::formats::generic::parse_generic_yaml;

    /// 1. Parse simple artifacts, cross-validate with `parse_generic_yaml()`.
    #[test]
    fn cross_validate_with_generic_parser() {
        let source = "\
artifacts:
  - id: REQ-001
    type: requirement
    title: First requirement
    status: draft
    tags: [core, safety]
    links:
      - type: satisfies
        target: FEAT-001
  - id: REQ-002
    type: requirement
    title: Second requirement
";
        let hir = extract_generic_artifacts(source);
        let serde_arts = parse_generic_yaml(source, None).unwrap();

        assert_eq!(hir.artifacts.len(), serde_arts.len());
        for (h, s) in hir.artifacts.iter().zip(serde_arts.iter()) {
            assert_eq!(h.artifact.id, s.id);
            assert_eq!(h.artifact.artifact_type, s.artifact_type);
            assert_eq!(h.artifact.title, s.title);
            assert_eq!(h.artifact.status, s.status);
            assert_eq!(h.artifact.tags, s.tags);
            assert_eq!(h.artifact.links, s.links);
        }
        assert!(hir.diagnostics.is_empty(), "expected no diagnostics");
    }

    /// 2. `source[span.start..span.end]` contains artifact ID.
    #[test]
    fn id_span_points_to_id_text() {
        let source = "\
artifacts:
  - id: REQ-042
    type: req
    title: Span test
";
        let hir = extract_generic_artifacts(source);
        assert_eq!(hir.artifacts.len(), 1);
        let sa = &hir.artifacts[0];
        let slice = &source[sa.id_span.start as usize..sa.id_span.end as usize];
        assert!(slice.contains("REQ-042"), "id span slice was: {:?}", slice);
    }

    /// 3. Links with type + target extracted correctly.
    #[test]
    fn links_extraction() {
        let source = "\
artifacts:
  - id: A-1
    type: req
    title: Links test
    links:
      - type: satisfies
        target: B-1
      - type: derives-from
        target: B-2
";
        let hir = extract_generic_artifacts(source);
        assert_eq!(hir.artifacts.len(), 1);
        let links = &hir.artifacts[0].artifact.links;
        assert_eq!(links.len(), 2);
        assert_eq!(links[0].link_type, "satisfies");
        assert_eq!(links[0].target, "B-1");
        assert_eq!(links[1].link_type, "derives-from");
        assert_eq!(links[1].target, "B-2");
    }

    /// 4. Custom fields stored as serde_yaml::Value correctly.
    #[test]
    fn custom_fields_typed_correctly() {
        let source = "\
artifacts:
  - id: A-1
    type: req
    title: Fields test
    fields:
      priority: must
      count: 42
      enabled: true
      ratio: 3.14
";
        let hir = extract_generic_artifacts(source);
        assert_eq!(hir.artifacts.len(), 1);
        let fields = &hir.artifacts[0].artifact.fields;

        assert_eq!(
            fields.get("priority"),
            Some(&serde_yaml::Value::String("must".into()))
        );
        assert_eq!(
            fields.get("count"),
            Some(&serde_yaml::Value::Number(42.into()))
        );
        assert_eq!(fields.get("enabled"), Some(&serde_yaml::Value::Bool(true)));
        // Float comparison
        let ratio = fields.get("ratio").unwrap();
        match ratio {
            serde_yaml::Value::Number(n) => {
                let f = n.as_f64().unwrap();
                assert!((f - 3.14).abs() < 1e-10, "expected 3.14, got {}", f);
            }
            other => panic!("expected Number, got {:?}", other),
        }
    }

    /// 5. Tags flow sequence `[a, b, c]` parsed.
    #[test]
    fn tags_flow_sequence() {
        let source = "\
artifacts:
  - id: A-1
    type: req
    title: Tags test
    tags: [alpha, beta, gamma]
";
        let hir = extract_generic_artifacts(source);
        assert_eq!(hir.artifacts.len(), 1);
        assert_eq!(
            hir.artifacts[0].artifact.tags,
            vec!["alpha", "beta", "gamma"]
        );
    }

    /// 6. Empty `artifacts: []` → empty vec.
    #[test]
    fn empty_artifacts() {
        let source = "artifacts: []\n";
        let hir = extract_generic_artifacts(source);
        assert!(hir.artifacts.is_empty());
        assert!(hir.diagnostics.is_empty());
    }

    /// 7. Missing id → ParseDiagnostic error.
    #[test]
    fn missing_id_produces_diagnostic() {
        let source = "\
artifacts:
  - type: req
    title: No id here
";
        let hir = extract_generic_artifacts(source);
        assert!(hir.artifacts.is_empty());
        assert_eq!(hir.diagnostics.len(), 1);
        assert_eq!(hir.diagnostics[0].severity, Severity::Error);
        assert!(hir.diagnostics[0].message.contains("id"));
    }

    /// 8. Quoted `'42'`, `"true"`, `'null'` stay as String.
    #[test]
    fn quoted_scalars_stay_string() {
        let source = "\
artifacts:
  - id: A-1
    type: req
    title: Quoted test
    fields:
      num_str: '42'
      bool_str: \"true\"
      null_str: 'null'
";
        let hir = extract_generic_artifacts(source);
        assert_eq!(hir.artifacts.len(), 1);
        let fields = &hir.artifacts[0].artifact.fields;

        assert_eq!(
            fields.get("num_str"),
            Some(&serde_yaml::Value::String("42".into()))
        );
        assert_eq!(
            fields.get("bool_str"),
            Some(&serde_yaml::Value::String("true".into()))
        );
        assert_eq!(
            fields.get("null_str"),
            Some(&serde_yaml::Value::String("null".into()))
        );
    }

    /// 9. Block span covers full SequenceItem text.
    #[test]
    fn block_span_covers_sequence_item() {
        let source = "\
artifacts:
  - id: REQ-100
    type: req
    title: Block span test
";
        let hir = extract_generic_artifacts(source);
        assert_eq!(hir.artifacts.len(), 1);
        let sa = &hir.artifacts[0];
        let block = &source[sa.block_span.start as usize..sa.block_span.end as usize];
        assert!(block.contains("REQ-100"), "block span: {:?}", block);
        assert!(
            block.contains("title: Block span test"),
            "block span: {:?}",
            block
        );
    }

    /// 10. Null/tilde scalar conversion.
    #[test]
    fn null_tilde_conversion() {
        let source = "\
artifacts:
  - id: A-1
    type: req
    title: Null test
    fields:
      a: null
      b: ~
";
        let hir = extract_generic_artifacts(source);
        assert_eq!(hir.artifacts.len(), 1);
        let fields = &hir.artifacts[0].artifact.fields;
        assert_eq!(fields.get("a"), Some(&serde_yaml::Value::Null));
        assert_eq!(fields.get("b"), Some(&serde_yaml::Value::Null));
    }
}
