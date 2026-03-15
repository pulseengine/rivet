//! Document model — markdown files with YAML frontmatter and `[[ID]]` artifact references.
//!
//! Documents represent prose content that surrounds and contextualizes artifacts:
//! specifications, design documents, test plans, glossaries.  They complement
//! the structured YAML artifacts with narrative text and hierarchical ordering.
//!
//! ## File format
//!
//! ```markdown
//! ---
//! id: SRS-001
//! type: specification
//! title: System Requirements Specification
//! status: draft
//! glossary:
//!   STPA: Systems-Theoretic Process Analysis
//! ---
//!
//! # System Requirements Specification
//!
//! ## 1. Introduction
//!
//! [[REQ-001]] — Text-file-first artifact management.
//! ```
//!
//! ## Tool mapping
//!
//! | Concept       | ReqIF            | OSLC                    | Polarion  |
//! |---------------|------------------|-------------------------|-----------|
//! | Document      | SPECIFICATION    | RequirementCollection   | LiveDoc   |
//! | Section       | SPEC-HIERARCHY   | nested Collection       | Heading   |
//! | `[[REQ-001]]` | SPEC-OBJECT ref  | member link             | embedded  |

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};

use crate::error::Error;

// ---------------------------------------------------------------------------
// Artifact embedding info
// ---------------------------------------------------------------------------

/// Link metadata for embedding in documents.
#[derive(Debug, Clone)]
pub struct LinkInfo {
    pub link_type: String,
    pub target_id: String,
    pub target_title: String,
    pub target_type: String,
}

/// Artifact info for embedding in documents.
#[derive(Debug, Clone)]
pub struct ArtifactInfo {
    pub id: String,
    pub title: String,
    pub art_type: String,
    pub status: String,
    pub description: String,
    /// Arbitrary tags for categorization.
    pub tags: Vec<String>,
    /// Domain-specific fields as `(key, display_value)` pairs.
    pub fields: Vec<(String, String)>,
    /// Forward links from this artifact.
    pub links: Vec<LinkInfo>,
    /// Backward links (incoming) to this artifact.
    pub backlinks: Vec<LinkInfo>,
}

// ---------------------------------------------------------------------------
// Data model
// ---------------------------------------------------------------------------

/// A document loaded from a markdown file with YAML frontmatter.
#[derive(Debug, Clone)]
pub struct Document {
    /// Unique document identifier (from frontmatter).
    pub id: String,
    /// Document type (e.g. "specification", "design", "test-plan").
    pub doc_type: String,
    /// Human-readable title.
    pub title: String,
    /// Lifecycle status.
    pub status: Option<String>,
    /// Term definitions scoped to this document.
    pub glossary: BTreeMap<String, String>,
    /// Raw markdown body (after frontmatter).
    pub body: String,
    /// Heading-based section hierarchy extracted from the body.
    pub sections: Vec<Section>,
    /// All `[[ID]]` references found in the body.
    pub references: Vec<DocReference>,
    /// Source file path.
    pub source_file: Option<PathBuf>,
}

/// A section extracted from markdown headings.
#[derive(Debug, Clone)]
pub struct Section {
    /// Heading level (1–6).
    pub level: u8,
    /// Heading text (without `#` prefix).
    pub title: String,
    /// Artifact IDs referenced within this section (until the next heading).
    pub artifact_ids: Vec<String>,
}

/// A single `[[ID]]` reference found in the document body.
#[derive(Debug, Clone)]
pub struct DocReference {
    /// The artifact ID referenced.
    pub artifact_id: String,
    /// Line number (1-based) where the reference appears.
    pub line: usize,
}

// ---------------------------------------------------------------------------
// YAML frontmatter model (for serde deserialization)
// ---------------------------------------------------------------------------

#[derive(Debug, serde::Deserialize)]
struct Frontmatter {
    id: String,
    #[serde(rename = "type", default = "default_doc_type")]
    doc_type: String,
    title: String,
    #[serde(default)]
    status: Option<String>,
    #[serde(default)]
    glossary: BTreeMap<String, String>,
}

fn default_doc_type() -> String {
    "document".into()
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/// Parse a markdown file with YAML frontmatter into a [`Document`].
pub fn parse_document(content: &str, source: Option<&Path>) -> Result<Document, Error> {
    let (frontmatter, body) = split_frontmatter(content)?;

    let fm: Frontmatter = serde_yaml::from_str(&frontmatter)
        .map_err(|e| Error::Schema(format!("document frontmatter: {e}")))?;

    let references = extract_references(&body);
    let sections = extract_sections(&body);

    Ok(Document {
        id: fm.id,
        doc_type: fm.doc_type,
        title: fm.title,
        status: fm.status,
        glossary: fm.glossary,
        body,
        sections,
        references,
        source_file: source.map(|p| p.to_path_buf()),
    })
}

/// Load all `.md` files from a directory as documents.
pub fn load_documents(dir: &Path) -> Result<Vec<Document>, Error> {
    if !dir.is_dir() {
        return Ok(Vec::new());
    }

    let mut docs = Vec::new();
    let mut entries: Vec<_> = std::fs::read_dir(dir)
        .map_err(|e| Error::Io(format!("{}: {e}", dir.display())))?
        .filter_map(|e| e.ok())
        .filter(|e| {
            e.path()
                .extension()
                .is_some_and(|ext| ext == "md" || ext == "markdown")
        })
        .collect();

    // Sort for deterministic ordering.
    entries.sort_by_key(|e| e.file_name());

    for entry in entries {
        let path = entry.path();
        let content = std::fs::read_to_string(&path)
            .map_err(|e| Error::Io(format!("{}: {e}", path.display())))?;

        // Skip files without frontmatter (e.g. plain README.md).
        if !content.starts_with("---") {
            continue;
        }

        match parse_document(&content, Some(&path)) {
            Ok(doc) => docs.push(doc),
            Err(e) => {
                log::warn!("skipping {}: {e}", path.display());
            }
        }
    }

    Ok(docs)
}

// ---------------------------------------------------------------------------
// Internals
// ---------------------------------------------------------------------------

/// Split `---\nfrontmatter\n---\nbody` into (frontmatter, body).
fn split_frontmatter(content: &str) -> Result<(String, String), Error> {
    let trimmed = content.trim_start();
    if !trimmed.starts_with("---") {
        return Err(Error::Schema(
            "document must start with YAML frontmatter (---)".into(),
        ));
    }

    // Find the closing `---`.
    let after_first = &trimmed[3..];
    let close_pos = after_first
        .find("\n---")
        .ok_or_else(|| Error::Schema("unterminated frontmatter (missing closing ---)".into()))?;

    let frontmatter = after_first[..close_pos].trim().to_string();
    let body = after_first[close_pos + 4..]
        .trim_start_matches('\n')
        .to_string();

    Ok((frontmatter, body))
}

/// Extract all `[[ID]]` references from the markdown body.
fn extract_references(body: &str) -> Vec<DocReference> {
    let mut refs = Vec::new();

    for (line_idx, line) in body.lines().enumerate() {
        let mut rest = line;
        while let Some(start) = rest.find("[[") {
            let after = &rest[start + 2..];
            if let Some(end) = after.find("]]") {
                let id = after[..end].trim();
                if !id.is_empty() {
                    refs.push(DocReference {
                        artifact_id: id.to_string(),
                        line: line_idx + 1,
                    });
                }
                rest = &after[end + 2..];
            } else {
                break;
            }
        }
    }

    refs
}

/// Extract section hierarchy from markdown headings.
fn extract_sections(body: &str) -> Vec<Section> {
    let mut sections = Vec::new();
    let mut current_refs: Vec<String> = Vec::new();

    for line in body.lines() {
        let trimmed = line.trim_start();

        if let Some(level) = heading_level(trimmed) {
            // If we have a previous section, finalize its references.
            if let Some(last) = sections.last_mut() {
                let sec: &mut Section = last;
                sec.artifact_ids = std::mem::take(&mut current_refs);
            }

            let title = trimmed[level as usize..]
                .trim_start_matches(' ')
                .trim()
                .to_string();

            sections.push(Section {
                level,
                title,
                artifact_ids: Vec::new(),
            });
            current_refs.clear();
        } else {
            // Collect [[ID]] refs for the current section.
            let mut rest = trimmed;
            while let Some(start) = rest.find("[[") {
                let after = &rest[start + 2..];
                if let Some(end) = after.find("]]") {
                    let id = after[..end].trim();
                    if !id.is_empty() {
                        current_refs.push(id.to_string());
                    }
                    rest = &after[end + 2..];
                } else {
                    break;
                }
            }
        }
    }

    // Finalize last section.
    if let Some(last) = sections.last_mut() {
        last.artifact_ids = current_refs;
    }

    sections
}

/// Return the heading level (1–6) if the line starts with `# `.
fn heading_level(line: &str) -> Option<u8> {
    let hashes = line.bytes().take_while(|&b| b == b'#').count();
    if (1..=6).contains(&hashes) && line.as_bytes().get(hashes) == Some(&b' ') {
        Some(hashes as u8)
    } else {
        None
    }
}

/// Render markdown body to simple HTML, resolving `[[ID]]` into links.
///
/// This is a lightweight renderer — not a full CommonMark implementation.
/// It handles headings, paragraphs, bold/italic, lists, and `[[ID]]` links.
pub fn render_to_html(
    doc: &Document,
    artifact_exists: impl Fn(&str) -> bool,
    artifact_info: impl Fn(&str) -> Option<ArtifactInfo>,
) -> String {
    let mut html = String::with_capacity(doc.body.len() * 2);
    let mut in_list = false;
    let mut in_ordered_list = false;
    let mut in_paragraph = false;
    let mut in_table = false;
    let mut table_header_done = false;
    let mut in_code_block = false;
    let mut code_block_lines: Vec<String> = Vec::new();
    let mut code_block_lang: Option<String> = None;
    let mut in_blockquote = false;

    for line in doc.body.lines() {
        let trimmed = line.trim();

        // Code blocks must be handled first — content inside is literal.
        if trimmed.starts_with("```") {
            if in_code_block {
                // Closing fence: check if this is an AADL diagram block.
                if code_block_lang.as_deref() == Some("aadl") {
                    // Parse `root:` from accumulated lines.
                    let root = code_block_lines
                        .iter()
                        .find_map(|l| l.strip_prefix("root:").or_else(|| l.strip_prefix("root: ")))
                        .unwrap_or("")
                        .trim();
                    html.push_str(&format!(
                        "<div class=\"aadl-diagram\" data-root=\"{root}\"><p class=\"aadl-loading\">Loading AADL diagram...</p></div>\n"
                    ));
                } else if code_block_lang.as_deref() == Some("mermaid") {
                    // Mermaid diagrams: emit a <pre class="mermaid"> block
                    // that the mermaid.js library will render client-side.
                    html.push_str("<pre class=\"mermaid\">");
                    html.push_str(&code_block_lines.join("\n"));
                    html.push_str("</pre>\n");
                } else {
                    html.push_str("<pre><code>");
                    html.push_str(&code_block_lines.join("\n"));
                    html.push_str("</code></pre>\n");
                }
                code_block_lines.clear();
                code_block_lang = None;
                in_code_block = false;
            } else {
                // Opening fence: close any open block-level element first.
                if in_paragraph {
                    html.push_str("</p>\n");
                    in_paragraph = false;
                }
                if in_list {
                    html.push_str("</ul>\n");
                    in_list = false;
                }
                if in_ordered_list {
                    html.push_str("</ol>\n");
                    in_ordered_list = false;
                }
                if in_table {
                    html.push_str("</tbody></table>\n");
                    in_table = false;
                    table_header_done = false;
                }
                if in_blockquote {
                    html.push_str("</blockquote>\n");
                    in_blockquote = false;
                }
                // Capture language tag from the opening fence.
                let lang = trimmed.trim_start_matches('`').trim();
                code_block_lang = if lang.is_empty() {
                    None
                } else {
                    Some(lang.to_string())
                };
                in_code_block = true;
            }
            continue;
        }

        if in_code_block {
            code_block_lines.push(html_escape(line));
            continue;
        }

        if trimmed.is_empty() {
            if in_paragraph {
                html.push_str("</p>\n");
                in_paragraph = false;
            }
            if in_list {
                html.push_str("</ul>\n");
                in_list = false;
            }
            if in_ordered_list {
                html.push_str("</ol>\n");
                in_ordered_list = false;
            }
            if in_table {
                html.push_str("</tbody></table>\n");
                in_table = false;
                table_header_done = false;
            }
            if in_blockquote {
                html.push_str("</blockquote>\n");
                in_blockquote = false;
            }
            continue;
        }

        // Headings
        if let Some(level) = heading_level(trimmed) {
            if in_paragraph {
                html.push_str("</p>\n");
                in_paragraph = false;
            }
            if in_list {
                html.push_str("</ul>\n");
                in_list = false;
            }
            if in_ordered_list {
                html.push_str("</ol>\n");
                in_ordered_list = false;
            }
            if in_table {
                html.push_str("</tbody></table>\n");
                in_table = false;
                table_header_done = false;
            }
            if in_blockquote {
                html.push_str("</blockquote>\n");
                in_blockquote = false;
            }
            let text = &trimmed[level as usize + 1..];
            let text = resolve_inline(text, &artifact_exists, &artifact_info);
            html.push_str(&format!("<h{level}>{text}</h{level}>\n"));
            continue;
        }

        // Table rows (lines starting and ending with |)
        if trimmed.starts_with('|') && trimmed.ends_with('|') {
            if in_paragraph {
                html.push_str("</p>\n");
                in_paragraph = false;
            }
            if in_list {
                html.push_str("</ul>\n");
                in_list = false;
            }
            if in_ordered_list {
                html.push_str("</ol>\n");
                in_ordered_list = false;
            }
            if in_blockquote {
                html.push_str("</blockquote>\n");
                in_blockquote = false;
            }

            // Skip separator rows like |---|---|
            if is_table_separator(trimmed) {
                continue;
            }

            let cells: Vec<&str> = trimmed
                .trim_matches('|')
                .split('|')
                .map(|c| c.trim())
                .collect();

            if !in_table {
                // First row is the header
                html.push_str("<table><thead><tr>");
                for cell in &cells {
                    let text = resolve_inline(cell, &artifact_exists, &artifact_info);
                    html.push_str(&format!("<th>{text}</th>"));
                }
                html.push_str("</tr></thead><tbody>\n");
                in_table = true;
                table_header_done = true;
            } else if table_header_done {
                html.push_str("<tr>");
                for cell in &cells {
                    let text = resolve_inline(cell, &artifact_exists, &artifact_info);
                    html.push_str(&format!("<td>{text}</td>"));
                }
                html.push_str("</tr>\n");
            }
            continue;
        }

        // Blockquotes
        if let Some(bq_text) = trimmed.strip_prefix("> ") {
            if in_paragraph {
                html.push_str("</p>\n");
                in_paragraph = false;
            }
            if in_list {
                html.push_str("</ul>\n");
                in_list = false;
            }
            if in_ordered_list {
                html.push_str("</ol>\n");
                in_ordered_list = false;
            }
            if in_table {
                html.push_str("</tbody></table>\n");
                in_table = false;
                table_header_done = false;
            }
            if !in_blockquote {
                html.push_str("<blockquote>");
                in_blockquote = true;
            }
            let text = resolve_inline(bq_text, &artifact_exists, &artifact_info);
            html.push_str(&format!("<p>{text}</p>"));
            continue;
        }

        // Unordered list items
        if trimmed.starts_with("- ") || trimmed.starts_with("* ") {
            if in_paragraph {
                html.push_str("</p>\n");
                in_paragraph = false;
            }
            if in_ordered_list {
                html.push_str("</ol>\n");
                in_ordered_list = false;
            }
            if in_table {
                html.push_str("</tbody></table>\n");
                in_table = false;
                table_header_done = false;
            }
            if in_blockquote {
                html.push_str("</blockquote>\n");
                in_blockquote = false;
            }
            if !in_list {
                html.push_str("<ul>\n");
                in_list = true;
            }
            let text = resolve_inline(&trimmed[2..], &artifact_exists, &artifact_info);
            html.push_str(&format!("<li>{text}</li>\n"));
            continue;
        }

        // Ordered list items (e.g. "1. item")
        if let Some(rest) = ordered_list_text(trimmed) {
            if in_paragraph {
                html.push_str("</p>\n");
                in_paragraph = false;
            }
            if in_list {
                html.push_str("</ul>\n");
                in_list = false;
            }
            if in_table {
                html.push_str("</tbody></table>\n");
                in_table = false;
                table_header_done = false;
            }
            if in_blockquote {
                html.push_str("</blockquote>\n");
                in_blockquote = false;
            }
            if !in_ordered_list {
                html.push_str("<ol>\n");
                in_ordered_list = true;
            }
            let text = resolve_inline(rest, &artifact_exists, &artifact_info);
            html.push_str(&format!("<li>{text}</li>\n"));
            continue;
        }

        // Regular text → paragraph
        if in_list {
            html.push_str("</ul>\n");
            in_list = false;
        }
        if in_ordered_list {
            html.push_str("</ol>\n");
            in_ordered_list = false;
        }
        if in_table {
            html.push_str("</tbody></table>\n");
            in_table = false;
            table_header_done = false;
        }
        if in_blockquote {
            html.push_str("</blockquote>\n");
            in_blockquote = false;
        }
        if !in_paragraph {
            html.push_str("<p>");
            in_paragraph = true;
        } else {
            html.push('\n');
        }
        html.push_str(&resolve_inline(trimmed, &artifact_exists, &artifact_info));
    }

    if in_paragraph {
        html.push_str("</p>\n");
    }
    if in_list {
        html.push_str("</ul>\n");
    }
    if in_ordered_list {
        html.push_str("</ol>\n");
    }
    if in_table {
        html.push_str("</tbody></table>\n");
    }
    if in_blockquote {
        html.push_str("</blockquote>\n");
    }

    html
}

/// Check if a table row is a separator (e.g. `|---|---|`).
fn is_table_separator(line: &str) -> bool {
    line.trim_matches('|')
        .split('|')
        .all(|cell| cell.trim().chars().all(|c| c == '-' || c == ':'))
}

/// If the line is an ordered list item (e.g. `1. text`), return the text after the marker.
fn ordered_list_text(line: &str) -> Option<&str> {
    let digit_end = line.as_bytes().iter().position(|b| !b.is_ascii_digit())?;
    if digit_end == 0 {
        return None;
    }
    let rest = &line[digit_end..];
    rest.strip_prefix(". ")
}

/// Resolve inline formatting: `[[ID]]` links, **bold**, *italic*, `code`, [text](url), ![alt](url).
fn resolve_inline(
    text: &str,
    artifact_exists: &impl Fn(&str) -> bool,
    artifact_info: &impl Fn(&str) -> Option<ArtifactInfo>,
) -> String {
    let mut result = String::with_capacity(text.len() * 2);
    let mut chars = text.char_indices().peekable();

    while let Some((i, ch)) = chars.next() {
        // Images: ![alt](url)
        if ch == '!' && text[i..].starts_with("![") {
            if let Some(link) = parse_markdown_link(&text[i + 1..]) {
                let alt = html_escape(&link.text);
                let src = html_escape(&link.url);
                result.push_str(&format!(
                    "<img src=\"{src}\" alt=\"{alt}\" style=\"max-width:100%;height:auto\" />"
                ));
                let skip_to = i + 1 + link.total_len;
                while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                    chars.next();
                }
                continue;
            }
        }

        // Inline code (backticks) — must come before bold/italic since content is literal.
        if ch == '`' {
            if let Some(end) = text[i + 1..].find('`') {
                let inner = html_escape(&text[i + 1..i + 1 + end]);
                result.push_str(&format!("<code>{inner}</code>"));
                let skip_to = i + 1 + end + 1;
                while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                    chars.next();
                }
                continue;
            }
        }

        // Markdown links [text](url) — must come before [[id]] artifact refs.
        if ch == '[' && !text[i..].starts_with("[[") {
            if let Some(link) = parse_markdown_link(&text[i..]) {
                let text_part = html_escape(&link.text);
                result.push_str(&format!(
                    "<a href=\"{href}\">{text_part}</a>",
                    href = html_escape(&link.url),
                ));
                let skip_to = i + link.total_len;
                while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                    chars.next();
                }
                continue;
            }
        }

        // Rich embed: {{artifact:ID[:modifier[:depth]]}} or {{links:ID}} or {{table:TYPE:FIELDS}}
        if ch == '{' && text[i..].starts_with("{{") {
            if let Some(end) = text[i..].find("}}") {
                let inner = text[i + 2..i + end].trim();

                // {{links:ID}} — link tables only
                if let Some(link_id) = inner.strip_prefix("links:") {
                    let link_id = link_id.trim();
                    if let Some(info) = artifact_info(link_id) {
                        result.push_str(&render_links_only(&info));
                    } else {
                        result.push_str(&format!(
                            "<span class=\"artifact-ref broken\">{{{{links:{}}}}}</span>",
                            html_escape(link_id)
                        ));
                    }
                    let skip_to = i + end + 2;
                    while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                        chars.next();
                    }
                    continue;
                }

                // {{table:TYPE:FIELDS}} — table of all artifacts of a type
                if let Some(table_spec) = inner.strip_prefix("table:") {
                    let table_parts: Vec<&str> = table_spec.splitn(2, ':').collect();
                    if table_parts.len() == 2 {
                        let art_type = table_parts[0].trim();
                        let field_names: Vec<&str> =
                            table_parts[1].split(',').map(|f| f.trim()).collect();
                        result.push_str(&render_table(art_type, &field_names, &artifact_info));
                    }
                    let skip_to = i + end + 2;
                    while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                        chars.next();
                    }
                    continue;
                }

                // {{artifact:ID[:modifier[:depth]]}}
                if let Some(art_spec) = inner.strip_prefix("artifact:") {
                    let parts: Vec<&str> = art_spec.splitn(3, ':').collect();
                    let id = parts[0].trim();
                    let modifier = parts.get(1).map(|s| s.trim()).unwrap_or("default");
                    let depth: usize = parts
                        .get(2)
                        .and_then(|s| s.trim().parse().ok())
                        .unwrap_or(3);

                    if let Some(info) = artifact_info(id) {
                        let rendered = match modifier {
                            "full" => render_embed_full(&info),
                            "links" => render_embed_links(&info),
                            "upstream" => render_embed_trace(
                                &info,
                                TraceDirection::Upstream,
                                depth,
                                &artifact_info,
                            ),
                            "downstream" => render_embed_trace(
                                &info,
                                TraceDirection::Downstream,
                                depth,
                                &artifact_info,
                            ),
                            "chain" => render_embed_chain(&info, depth, &artifact_info),
                            _ => render_embed_default(&info),
                        };
                        result.push_str(&rendered);
                    } else {
                        result.push_str(&format!(
                            "<span class=\"artifact-ref broken\">{{{{artifact:{}}}}}</span>",
                            html_escape(id)
                        ));
                    }
                    let skip_to = i + end + 2;
                    while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                        chars.next();
                    }
                    continue;
                }
            }
        }

        if ch == '[' && text[i..].starts_with("[[") {
            // Find closing ]]
            if let Some(end) = text[i + 2..].find("]]") {
                let id = text[i + 2..i + 2 + end].trim();
                if artifact_exists(id) {
                    result.push_str(&format!(
                        "<a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" href=\"#\">{id}</a>"
                    ));
                } else {
                    result.push_str(&format!("<span class=\"artifact-ref broken\">{id}</span>"));
                }
                // Skip past ]]
                let skip_to = i + 2 + end + 2;
                while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                    chars.next();
                }
                continue;
            }
        }

        if ch == '*' && text[i..].starts_with("**") {
            // Bold
            if let Some(end) = text[i + 2..].find("**") {
                let inner = html_escape(&text[i + 2..i + 2 + end]);
                result.push_str(&format!("<strong>{inner}</strong>"));
                let skip_to = i + 2 + end + 2;
                while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                    chars.next();
                }
                continue;
            }
        }

        if ch == '*' {
            // Italic
            if let Some(end) = text[i + 1..].find('*') {
                let inner = html_escape(&text[i + 1..i + 1 + end]);
                result.push_str(&format!("<em>{inner}</em>"));
                let skip_to = i + 1 + end + 1;
                while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                    chars.next();
                }
                continue;
            }
        }

        // Default: escape HTML
        match ch {
            '&' => result.push_str("&amp;"),
            '<' => result.push_str("&lt;"),
            '>' => result.push_str("&gt;"),
            '"' => result.push_str("&quot;"),
            _ => result.push(ch),
        }
    }

    result
}

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

// ---------------------------------------------------------------------------
// Rich embed rendering helpers
// ---------------------------------------------------------------------------

/// Direction for trace walking.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum TraceDirection {
    Upstream,
    Downstream,
}

/// Render the default artifact embed card (type badge, status badge, title, truncated description).
fn render_embed_default(info: &ArtifactInfo) -> String {
    let desc_preview = if info.description.len() > 150 {
        format!("{}…", &info.description[..150])
    } else {
        info.description.clone()
    };
    format!(
        "<div class=\"artifact-embed\">\
         <div class=\"artifact-embed-header\">\
         <a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
         <span class=\"type-badge\">{type_}</span>\
         <span class=\"status-badge\">{status}</span>\
         </div>\
         <div class=\"artifact-embed-title\">{title}</div>\
         <div class=\"artifact-embed-desc\">{desc}</div>\
         </div>",
        id = html_escape(&info.id),
        type_ = html_escape(&info.art_type),
        status = html_escape(&info.status),
        title = html_escape(&info.title),
        desc = html_escape(&desc_preview),
    )
}

/// Render a full artifact embed: description, fields, tags, and all links.
fn render_embed_full(info: &ArtifactInfo) -> String {
    let mut html = String::new();
    html.push_str("<div class=\"artifact-embed artifact-embed-full\">");

    // Header
    html.push_str("<div class=\"artifact-embed-header\">");
    html.push_str(&format!(
        "<a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>",
        id = html_escape(&info.id),
    ));
    html.push_str(&format!(
        "<span class=\"type-badge\">{}</span>",
        html_escape(&info.art_type)
    ));
    html.push_str(&format!(
        "<span class=\"status-badge\">{}</span>",
        html_escape(&info.status)
    ));
    html.push_str("</div>");

    // Title
    html.push_str(&format!(
        "<div class=\"artifact-embed-title\">{}</div>",
        html_escape(&info.title)
    ));

    // Full description
    if !info.description.is_empty() {
        html.push_str(&format!(
            "<div class=\"artifact-embed-desc\">{}</div>",
            html_escape(&info.description)
        ));
    }

    // Tags
    if !info.tags.is_empty() {
        html.push_str("<div class=\"artifact-embed-tags\">");
        for tag in &info.tags {
            html.push_str(&format!(
                "<span class=\"badge badge-info\">{}</span>",
                html_escape(tag)
            ));
        }
        html.push_str("</div>");
    }

    // Fields
    if !info.fields.is_empty() {
        html.push_str("<dl class=\"artifact-embed-fields\">");
        for (key, value) in &info.fields {
            html.push_str(&format!(
                "<dt>{}</dt><dd>{}</dd>",
                html_escape(key),
                html_escape(value)
            ));
        }
        html.push_str("</dl>");
    }

    // Links
    render_link_tables_into(&mut html, info);

    html.push_str("</div>");
    html
}

/// Render artifact card header + forward/backward link tables.
fn render_embed_links(info: &ArtifactInfo) -> String {
    let mut html = String::new();
    html.push_str("<div class=\"artifact-embed artifact-embed-links\">");

    // Header
    html.push_str("<div class=\"artifact-embed-header\">");
    html.push_str(&format!(
        "<a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>",
        id = html_escape(&info.id),
    ));
    html.push_str(&format!(
        "<span class=\"type-badge\">{}</span>",
        html_escape(&info.art_type)
    ));
    html.push_str(&format!(
        "<span class=\"status-badge\">{}</span>",
        html_escape(&info.status)
    ));
    html.push_str("</div>");

    // Title
    html.push_str(&format!(
        "<div class=\"artifact-embed-title\">{}</div>",
        html_escape(&info.title)
    ));

    // Link tables
    render_link_tables_into(&mut html, info);

    html.push_str("</div>");
    html
}

/// Render only the link tables (no card header).
fn render_links_only(info: &ArtifactInfo) -> String {
    let mut html = String::new();
    html.push_str("<div class=\"artifact-embed artifact-embed-links-only\">");
    render_link_tables_into(&mut html, info);
    html.push_str("</div>");
    html
}

/// Append forward and backward link tables to `html`.
fn render_link_tables_into(html: &mut String, info: &ArtifactInfo) {
    if !info.links.is_empty() {
        html.push_str("<div class=\"artifact-embed-link-section\">");
        html.push_str("<strong>Outgoing Links</strong>");
        html.push_str("<table class=\"artifact-embed-link-table\"><thead><tr><th>Type</th><th>Target</th><th>Title</th></tr></thead><tbody>");
        for link in &info.links {
            let lt = html_escape(&link.link_type);
            let target = html_escape(&link.target_id);
            let title = html_escape(&link.target_title);
            html.push_str(&format!(
                "<tr><td><span class=\"badge badge-info\">{lt}</span></td>\
                 <td><a class=\"artifact-ref\" hx-get=\"/artifacts/{target}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{target}</a></td>\
                 <td>{title}</td></tr>",
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    if !info.backlinks.is_empty() {
        html.push_str("<div class=\"artifact-embed-link-section\">");
        html.push_str("<strong>Incoming Links</strong>");
        html.push_str("<table class=\"artifact-embed-link-table\"><thead><tr><th>Type</th><th>Source</th><th>Title</th></tr></thead><tbody>");
        for link in &info.backlinks {
            let lt = html_escape(&link.link_type);
            let source = html_escape(&link.target_id);
            let title = html_escape(&link.target_title);
            html.push_str(&format!(
                "<tr><td><span class=\"badge badge-info\">{lt}</span></td>\
                 <td><a class=\"artifact-ref\" hx-get=\"/artifacts/{source}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{source}</a></td>\
                 <td>{title}</td></tr>",
            ));
        }
        html.push_str("</tbody></table></div>");
    }
}

/// Render an upstream or downstream trace to a given depth.
fn render_embed_trace(
    info: &ArtifactInfo,
    direction: TraceDirection,
    depth: usize,
    artifact_info: &impl Fn(&str) -> Option<ArtifactInfo>,
) -> String {
    let mut html = String::new();
    let dir_label = match direction {
        TraceDirection::Upstream => "Upstream",
        TraceDirection::Downstream => "Downstream",
    };
    html.push_str(&format!(
        "<div class=\"artifact-embed artifact-embed-trace\">\
         <div class=\"artifact-embed-header\">\
         <a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
         <span class=\"type-badge\">{type_}</span>\
         <span class=\"badge badge-info\">{dir_label} trace ({depth} levels)</span>\
         </div>\
         <div class=\"artifact-embed-title\">{title}</div>",
        id = html_escape(&info.id),
        type_ = html_escape(&info.art_type),
        title = html_escape(&info.title),
    ));

    html.push_str("<ul class=\"artifact-trace-list\">");
    walk_trace(&mut html, info, direction, depth, 0, artifact_info);
    html.push_str("</ul>");

    html.push_str("</div>");
    html
}

/// Recursively walk the trace and render indented list items.
fn walk_trace(
    html: &mut String,
    info: &ArtifactInfo,
    direction: TraceDirection,
    max_depth: usize,
    current_depth: usize,
    artifact_info: &impl Fn(&str) -> Option<ArtifactInfo>,
) {
    if current_depth >= max_depth {
        return;
    }

    let neighbors: &[LinkInfo] = match direction {
        TraceDirection::Upstream => &info.links,
        TraceDirection::Downstream => &info.backlinks,
    };

    for link in neighbors {
        let arrow = match direction {
            TraceDirection::Upstream => "\u{2190}",   // ←
            TraceDirection::Downstream => "\u{2192}", // →
        };
        html.push_str(&format!(
            "<li>{arrow} <span class=\"badge badge-info\">{link_type}</span> \
             <a class=\"artifact-ref\" hx-get=\"/artifacts/{target}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{target}</a> \
             <span class=\"type-badge\">{target_type}</span> {target_title}",
            link_type = html_escape(&link.link_type),
            target = html_escape(&link.target_id),
            target_type = html_escape(&link.target_type),
            target_title = html_escape(&link.target_title),
        ));

        // Recurse into the next level
        if current_depth + 1 < max_depth {
            if let Some(next_info) = artifact_info(&link.target_id) {
                let next_neighbors: &[LinkInfo] = match direction {
                    TraceDirection::Upstream => &next_info.links,
                    TraceDirection::Downstream => &next_info.backlinks,
                };
                if !next_neighbors.is_empty() {
                    html.push_str("<ul class=\"artifact-trace-list\">");
                    walk_trace(
                        html,
                        &next_info,
                        direction,
                        max_depth,
                        current_depth + 1,
                        artifact_info,
                    );
                    html.push_str("</ul>");
                }
            }
        }

        html.push_str("</li>");
    }
}

/// Render a bidirectional trace chain (upstream + downstream).
fn render_embed_chain(
    info: &ArtifactInfo,
    depth: usize,
    artifact_info: &impl Fn(&str) -> Option<ArtifactInfo>,
) -> String {
    let mut html = String::new();
    html.push_str(&format!(
        "<div class=\"artifact-embed artifact-embed-chain\">\
         <div class=\"artifact-embed-header\">\
         <a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
         <span class=\"type-badge\">{type_}</span>\
         <span class=\"badge badge-info\">Trace chain ({depth} levels)</span>\
         </div>\
         <div class=\"artifact-embed-title\">{title}</div>",
        id = html_escape(&info.id),
        type_ = html_escape(&info.art_type),
        title = html_escape(&info.title),
    ));

    // Upstream
    if !info.links.is_empty() {
        html.push_str("<div class=\"trace-section\"><strong>Upstream</strong>");
        html.push_str("<ul class=\"artifact-trace-list\">");
        walk_trace(
            &mut html,
            info,
            TraceDirection::Upstream,
            depth,
            0,
            artifact_info,
        );
        html.push_str("</ul></div>");
    }

    // Downstream
    if !info.backlinks.is_empty() {
        html.push_str("<div class=\"trace-section\"><strong>Downstream</strong>");
        html.push_str("<ul class=\"artifact-trace-list\">");
        walk_trace(
            &mut html,
            info,
            TraceDirection::Downstream,
            depth,
            0,
            artifact_info,
        );
        html.push_str("</ul></div>");
    }

    html.push_str("</div>");
    html
}

/// Render a table of all artifacts of a given type showing specified columns.
fn render_table(
    art_type: &str,
    field_names: &[&str],
    artifact_info: &impl Fn(&str) -> Option<ArtifactInfo>,
) -> String {
    // We don't have direct access to the store here, so we iterate over
    // artifact_info calls. The caller provides this closure backed by a Store.
    // For the table embed we use a special convention: query info for
    // "__type:{art_type}" which returns a synthetic ArtifactInfo whose
    // `tags` field contains the list of IDs of that type.
    // If that convention isn't available, render a placeholder.
    let mut html = String::new();
    html.push_str(&format!(
        "<div class=\"artifact-embed artifact-embed-table\">\
         <strong>{}</strong>",
        html_escape(art_type)
    ));

    // Try the type-query convention
    let type_query = format!("__type:{art_type}");
    if let Some(type_info) = artifact_info(&type_query) {
        // type_info.tags contains the list of artifact IDs
        html.push_str("<table class=\"artifact-embed-link-table\"><thead><tr>");
        for col in field_names {
            html.push_str(&format!("<th>{}</th>", html_escape(col)));
        }
        html.push_str("</tr></thead><tbody>");

        for aid in &type_info.tags {
            if let Some(info) = artifact_info(aid) {
                html.push_str("<tr>");
                for col in field_names {
                    let val = match *col {
                        "id" => info.id.clone(),
                        "title" => info.title.clone(),
                        "status" => info.status.clone(),
                        "type" => info.art_type.clone(),
                        "description" => info.description.clone(),
                        other => info
                            .fields
                            .iter()
                            .find(|(k, _)| k == other)
                            .map(|(_, v)| v.clone())
                            .unwrap_or_default(),
                    };
                    html.push_str(&format!("<td>{}</td>", html_escape(&val)));
                }
                html.push_str("</tr>");
            }
        }

        html.push_str("</tbody></table>");
    } else {
        html.push_str("<p class=\"meta\">Table embed requires store access.</p>");
    }

    html.push_str("</div>");
    html
}

/// Result of parsing a `[text](url)` markdown link.
struct MarkdownLink {
    text: String,
    url: String,
    /// Total number of bytes consumed from the input (including `[`, `]`, `(`, `)`).
    total_len: usize,
}

/// Try to parse `[text](url)` at the start of `s`.
///
/// Only allows `http://`, `https://`, and `#` URLs for safety (no `javascript:` etc.).
fn parse_markdown_link(s: &str) -> Option<MarkdownLink> {
    if !s.starts_with('[') {
        return None;
    }
    let close_bracket = s[1..].find(']')?;
    let text = &s[1..1 + close_bracket];
    let after_bracket = &s[1 + close_bracket + 1..];
    if !after_bracket.starts_with('(') {
        return None;
    }
    let close_paren = after_bracket[1..].find(')')?;
    let url = &after_bracket[1..1 + close_paren];
    // Safety check: only allow http, https, and fragment (#) URLs.
    if !(url.starts_with("http://") || url.starts_with("https://") || url.starts_with('#')) {
        return None;
    }
    let total_len = 1 + close_bracket + 1 + 1 + close_paren + 1; // [text](url)
    Some(MarkdownLink {
        text: text.to_string(),
        url: url.to_string(),
        total_len,
    })
}

// ---------------------------------------------------------------------------
// Document store
// ---------------------------------------------------------------------------

/// In-memory collection of loaded documents.
#[derive(Debug, Default)]
pub struct DocumentStore {
    docs: Vec<Document>,
}

impl DocumentStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn insert(&mut self, doc: Document) {
        self.docs.push(doc);
    }

    pub fn get(&self, id: &str) -> Option<&Document> {
        self.docs.iter().find(|d| d.id == id)
    }

    pub fn iter(&self) -> impl Iterator<Item = &Document> {
        self.docs.iter()
    }

    pub fn len(&self) -> usize {
        self.docs.len()
    }

    pub fn is_empty(&self) -> bool {
        self.docs.is_empty()
    }

    /// All artifact IDs referenced across all documents.
    pub fn all_references(&self) -> Vec<&DocReference> {
        self.docs.iter().flat_map(|d| &d.references).collect()
    }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    const SAMPLE_DOC: &str = r#"---
id: SRS-001
type: specification
title: System Requirements Specification
status: draft
glossary:
  STPA: Systems-Theoretic Process Analysis
  UCA: Unsafe Control Action
---

# System Requirements Specification

## 1. Introduction

This document specifies the system-level requirements.

## 2. Functional Requirements

### 2.1 Artifact Management

[[REQ-001]] — Text-file-first artifact management.

[[REQ-002]] — STPA artifact support.

### 2.2 Traceability

[[REQ-003]] — Full ASPICE V-model traceability.

## 3. Glossary

See frontmatter.
"#;

    #[test]
    fn parse_frontmatter() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        assert_eq!(doc.id, "SRS-001");
        assert_eq!(doc.doc_type, "specification");
        assert_eq!(doc.title, "System Requirements Specification");
        assert_eq!(doc.status.as_deref(), Some("draft"));
        assert_eq!(doc.glossary.len(), 2);
        assert_eq!(
            doc.glossary.get("STPA").unwrap(),
            "Systems-Theoretic Process Analysis"
        );
    }

    #[test]
    fn extract_references_from_body() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        let ids: Vec<&str> = doc
            .references
            .iter()
            .map(|r| r.artifact_id.as_str())
            .collect();
        assert_eq!(ids, vec!["REQ-001", "REQ-002", "REQ-003"]);
    }

    #[test]
    fn extract_sections_hierarchy() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        assert_eq!(doc.sections.len(), 6);
        assert_eq!(doc.sections[0].level, 1);
        assert_eq!(doc.sections[0].title, "System Requirements Specification");
        assert_eq!(doc.sections[1].level, 2);
        assert_eq!(doc.sections[1].title, "1. Introduction");
        assert_eq!(doc.sections[2].level, 2);
        assert_eq!(doc.sections[2].title, "2. Functional Requirements");
        assert_eq!(doc.sections[3].level, 3);
        assert_eq!(doc.sections[3].title, "2.1 Artifact Management");
        assert_eq!(doc.sections[3].artifact_ids, vec!["REQ-001", "REQ-002"]);
        assert_eq!(doc.sections[4].level, 3);
        assert_eq!(doc.sections[4].title, "2.2 Traceability");
        assert_eq!(doc.sections[4].artifact_ids, vec!["REQ-003"]);
    }

    #[test]
    fn multiple_refs_on_one_line() {
        let content = "---\nid: D-1\ntitle: T\n---\n[[A-1]] and [[B-2]] here\n";
        let doc = parse_document(content, None).unwrap();
        assert_eq!(doc.references.len(), 2);
        assert_eq!(doc.references[0].artifact_id, "A-1");
        assert_eq!(doc.references[1].artifact_id, "B-2");
    }

    #[test]
    fn missing_frontmatter_is_error() {
        let result = parse_document("# Just markdown\n\nNo frontmatter.", None);
        assert!(result.is_err());
    }

    #[test]
    fn render_html_resolves_refs() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        let html = render_to_html(&doc, |id| id == "REQ-001" || id == "REQ-002", |_| None);
        assert!(html.contains("artifact-ref"));
        assert!(html.contains("hx-get=\"/artifacts/REQ-001\""));
        assert!(html.contains("class=\"artifact-ref broken\""));
    }

    #[test]
    fn render_html_headings() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        let html = render_to_html(&doc, |_| true, |_| None);
        assert!(html.contains("<h1>"));
        assert!(html.contains("<h2>"));
        assert!(html.contains("<h3>"));
    }

    #[test]
    fn document_store() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        let mut store = DocumentStore::new();
        store.insert(doc);
        assert_eq!(store.len(), 1);
        assert!(store.get("SRS-001").is_some());
        assert_eq!(store.all_references().len(), 3);
    }

    #[test]
    fn default_doc_type_when_omitted() {
        let content = "---\nid: D-1\ntitle: Test\n---\nBody.\n";
        let doc = parse_document(content, None).unwrap();
        assert_eq!(doc.doc_type, "document");
    }

    #[test]
    fn render_aadl_code_block_placeholder() {
        let content = "---\nid: DOC-001\ntitle: Architecture\n---\n\n## Overview\n\n```aadl\nroot: FlightControl::Controller.Basic\n```\n\nSome text after.\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, |_| None);
        assert!(html.contains("aadl-diagram"));
        assert!(html.contains("data-root=\"FlightControl::Controller.Basic\""));
        assert!(!html.contains("<pre><code>root: FlightControl"));
    }

    fn make_info(id: &str, title: &str, art_type: &str) -> ArtifactInfo {
        ArtifactInfo {
            id: id.into(),
            title: title.into(),
            art_type: art_type.into(),
            status: "approved".into(),
            description: format!("Description of {id}"),
            tags: Vec::new(),
            fields: Vec::new(),
            links: Vec::new(),
            backlinks: Vec::new(),
        }
    }

    fn make_info_rich() -> ArtifactInfo {
        ArtifactInfo {
            id: "REQ-001".into(),
            title: "Test requirement".into(),
            art_type: "requirement".into(),
            status: "approved".into(),
            description: "A test requirement description".into(),
            tags: vec!["safety".into(), "functional".into()],
            fields: vec![
                ("priority".into(), "high".into()),
                ("rationale".into(), "needed for safety".into()),
            ],
            links: vec![LinkInfo {
                link_type: "satisfies".into(),
                target_id: "SYS-001".into(),
                target_title: "System need".into(),
                target_type: "system-requirement".into(),
            }],
            backlinks: vec![LinkInfo {
                link_type: "satisfied-by".into(),
                target_id: "DD-003".into(),
                target_title: "Design element".into(),
                target_type: "design-decision".into(),
            }],
        }
    }

    #[test]
    fn artifact_embedding() {
        let info_fn = |id: &str| -> Option<ArtifactInfo> {
            if id == "REQ-001" {
                Some(make_info("REQ-001", "Test requirement", "requirement"))
            } else {
                None
            }
        };
        let content =
            "---\nid: DOC-E\ntitle: Embed Test\n---\nSee {{artifact:REQ-001}} for details.\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, info_fn);
        assert!(
            html.contains("artifact-embed"),
            "should contain embedded artifact card"
        );
        assert!(html.contains("REQ-001"), "should contain artifact ID");
        assert!(
            html.contains("Test requirement"),
            "should contain artifact title"
        );
        assert!(html.contains("type-badge"), "should contain type badge");
        assert!(html.contains("status-badge"), "should contain status badge");
    }

    #[test]
    fn artifact_embedding_broken_ref() {
        let content = "---\nid: DOC-B\ntitle: Broken\n---\nSee {{artifact:NOPE-999}} here.\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, |_| None);
        assert!(
            html.contains("artifact-ref broken"),
            "broken embed should have broken class"
        );
        assert!(html.contains("NOPE-999"), "should show the broken ID");
    }

    // -- Rich embed tests ------------------------------------------------

    fn rich_info_fn(id: &str) -> Option<ArtifactInfo> {
        match id {
            "REQ-001" => Some(make_info_rich()),
            "SYS-001" => {
                let mut info = make_info("SYS-001", "System need", "system-requirement");
                info.links = vec![LinkInfo {
                    link_type: "derives-from".into(),
                    target_id: "STAKE-001".into(),
                    target_title: "Stakeholder need".into(),
                    target_type: "stakeholder-requirement".into(),
                }];
                Some(info)
            }
            "DD-003" => {
                let mut info = make_info("DD-003", "Design element", "design-decision");
                info.backlinks = vec![LinkInfo {
                    link_type: "implemented-by".into(),
                    target_id: "FEAT-007".into(),
                    target_title: "Feature impl".into(),
                    target_type: "feature".into(),
                }];
                Some(info)
            }
            "STAKE-001" => Some(make_info(
                "STAKE-001",
                "Stakeholder need",
                "stakeholder-requirement",
            )),
            "FEAT-007" => Some(make_info("FEAT-007", "Feature impl", "feature")),
            _ => None,
        }
    }

    #[test]
    fn embed_links_renders_outgoing_table() {
        let content = "---\nid: DOC-L\ntitle: Links\n---\n{{artifact:REQ-001:links}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        assert!(
            html.contains("Outgoing Links"),
            "should contain outgoing links heading"
        );
        assert!(
            html.contains("SYS-001"),
            "should contain forward link target"
        );
        assert!(html.contains("satisfies"), "should show link type");
    }

    #[test]
    fn embed_links_renders_incoming_table() {
        let content = "---\nid: DOC-L\ntitle: Links\n---\n{{artifact:REQ-001:links}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        assert!(
            html.contains("Incoming Links"),
            "should contain incoming links heading"
        );
        assert!(html.contains("DD-003"), "should contain backlink source");
        assert!(html.contains("satisfied-by"), "should show backlink type");
    }

    #[test]
    fn embed_full_shows_description_tags_fields_links() {
        let content = "---\nid: DOC-F\ntitle: Full\n---\n{{artifact:REQ-001:full}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        assert!(
            html.contains("artifact-embed-full"),
            "should have full class"
        );
        assert!(
            html.contains("A test requirement description"),
            "should show full description"
        );
        assert!(html.contains("safety"), "should show tag 'safety'");
        assert!(html.contains("functional"), "should show tag 'functional'");
        assert!(html.contains("priority"), "should show field key");
        assert!(html.contains("high"), "should show field value");
        assert!(
            html.contains("Outgoing Links"),
            "should have outgoing links"
        );
        assert!(
            html.contains("Incoming Links"),
            "should have incoming links"
        );
    }

    #[test]
    fn embed_upstream_renders_trace() {
        let content = "---\nid: DOC-U\ntitle: Upstream\n---\n{{artifact:REQ-001:upstream:2}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        assert!(
            html.contains("artifact-embed-trace"),
            "should have trace class"
        );
        assert!(
            html.contains("Upstream trace (2 levels)"),
            "should show direction and depth"
        );
        assert!(html.contains("SYS-001"), "should trace to upstream target");
        // Second level: SYS-001 has a derives-from link to STAKE-001
        assert!(
            html.contains("STAKE-001"),
            "should trace 2nd level upstream"
        );
    }

    #[test]
    fn embed_downstream_renders_trace() {
        let content = "---\nid: DOC-D\ntitle: Down\n---\n{{artifact:REQ-001:downstream:1}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        assert!(
            html.contains("artifact-embed-trace"),
            "should have trace class"
        );
        assert!(
            html.contains("Downstream trace (1 levels)"),
            "should show direction and depth"
        );
        assert!(html.contains("DD-003"), "should trace to downstream source");
        // Only 1 level deep — should not recurse into DD-003's backlinks
        assert!(
            !html.contains("FEAT-007"),
            "should NOT trace beyond depth 1"
        );
    }

    #[test]
    fn embed_chain_renders_both_directions() {
        let content = "---\nid: DOC-C\ntitle: Chain\n---\n{{artifact:REQ-001:chain}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        assert!(
            html.contains("artifact-embed-chain"),
            "should have chain class"
        );
        assert!(html.contains("Upstream"), "should have upstream section");
        assert!(
            html.contains("Downstream"),
            "should have downstream section"
        );
        assert!(html.contains("SYS-001"), "upstream should contain SYS-001");
        assert!(html.contains("DD-003"), "downstream should contain DD-003");
    }

    #[test]
    fn links_only_renders_tables_without_card_header() {
        let content = "---\nid: DOC-LO\ntitle: LinksOnly\n---\n{{links:REQ-001}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        assert!(
            html.contains("artifact-embed-links-only"),
            "should have links-only class"
        );
        assert!(
            html.contains("Outgoing Links"),
            "should contain outgoing table"
        );
        assert!(
            html.contains("Incoming Links"),
            "should contain incoming table"
        );
        // Should NOT contain a card header with type/status badges
        assert!(
            !html.contains("artifact-embed-header"),
            "links-only should not have card header"
        );
    }

    #[test]
    fn unknown_modifier_falls_back_to_default() {
        let content = "---\nid: DOC-X\ntitle: Unknown\n---\n{{artifact:REQ-001:bogus}}\n";
        let doc = parse_document(content, None).unwrap();
        let html = render_to_html(&doc, |_| true, rich_info_fn);
        // Should fall back to the default card rendering
        assert!(
            html.contains("artifact-embed"),
            "should contain embedded card"
        );
        assert!(
            html.contains("artifact-embed-desc"),
            "should have truncated description"
        );
        // Should NOT have the full/links/trace class markers
        assert!(
            !html.contains("artifact-embed-full"),
            "should not use full rendering"
        );
        assert!(
            !html.contains("artifact-embed-trace"),
            "should not use trace rendering"
        );
    }
}
