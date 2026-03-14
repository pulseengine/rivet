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
use crate::markdown::render_markdown;

// ---------------------------------------------------------------------------
// Artifact embedding info
// ---------------------------------------------------------------------------

/// Minimal artifact info for embedding in documents.
#[derive(Debug, Clone)]
pub struct ArtifactInfo {
    pub id: String,
    pub title: String,
    pub art_type: String,
    pub status: String,
    pub description: String,
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

        // Artifact embedding: {{artifact:ID}}
        if ch == '{' && text[i..].starts_with("{{artifact:") {
            if let Some(end) = text[i..].find("}}") {
                let id = text[i + 11..i + end].trim();
                if let Some(info) = artifact_info(id) {
                    let desc_preview = if info.description.len() > 150 {
                        format!("{}…", &info.description[..150])
                    } else {
                        info.description.clone()
                    };
                    let desc_html = render_markdown(&desc_preview);
                    result.push_str(&format!(
                        "<div class=\"artifact-embed\">\
                         <div class=\"artifact-embed-header\">\
                         <a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"#\">{id}</a>\
                         <span class=\"type-badge\">{type_}</span>\
                         <span class=\"status-badge\">{status}</span>\
                         </div>\
                         <div class=\"artifact-embed-title\">{title}</div>\
                         <div class=\"artifact-embed-desc\">{desc}</div>\
                         </div>",
                        id = html_escape(id),
                        type_ = html_escape(&info.art_type),
                        status = html_escape(&info.status),
                        title = html_escape(&info.title),
                        desc = desc_html,
                    ));
                    let skip_to = i + end + 2;
                    while chars.peek().is_some_and(|&(j, _)| j < skip_to) {
                        chars.next();
                    }
                    continue;
                } else {
                    // Broken reference
                    result.push_str(&format!(
                        "<span class=\"artifact-ref broken\">{{{{artifact:{}}}}}</span>",
                        html_escape(id)
                    ));
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

    // rivet: verifies REQ-007
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

    // rivet: verifies REQ-007
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

    // rivet: verifies REQ-007
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

    // rivet: verifies REQ-007
    #[test]
    fn multiple_refs_on_one_line() {
        let content = "---\nid: D-1\ntitle: T\n---\n[[A-1]] and [[B-2]] here\n";
        let doc = parse_document(content, None).unwrap();
        assert_eq!(doc.references.len(), 2);
        assert_eq!(doc.references[0].artifact_id, "A-1");
        assert_eq!(doc.references[1].artifact_id, "B-2");
    }

    // rivet: verifies REQ-007
    #[test]
    fn missing_frontmatter_is_error() {
        let result = parse_document("# Just markdown\n\nNo frontmatter.", None);
        assert!(result.is_err());
    }

    // rivet: verifies REQ-007
    #[test]
    fn render_html_resolves_refs() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        let html = render_to_html(&doc, |id| id == "REQ-001" || id == "REQ-002", |_| None);
        assert!(html.contains("artifact-ref"));
        assert!(html.contains("hx-get=\"/artifacts/REQ-001\""));
        assert!(html.contains("class=\"artifact-ref broken\""));
    }

    // rivet: verifies REQ-007
    #[test]
    fn render_html_headings() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        let html = render_to_html(&doc, |_| true, |_| None);
        assert!(html.contains("<h1>"));
        assert!(html.contains("<h2>"));
        assert!(html.contains("<h3>"));
    }

    // rivet: verifies REQ-001
    #[test]
    fn document_store() {
        let doc = parse_document(SAMPLE_DOC, None).unwrap();
        let mut store = DocumentStore::new();
        store.insert(doc);
        assert_eq!(store.len(), 1);
        assert!(store.get("SRS-001").is_some());
        assert_eq!(store.all_references().len(), 3);
    }

    // rivet: verifies REQ-007
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

    // rivet: verifies REQ-007
    #[test]
    fn artifact_embedding() {
        let info_fn = |id: &str| -> Option<ArtifactInfo> {
            if id == "REQ-001" {
                Some(ArtifactInfo {
                    id: "REQ-001".into(),
                    title: "Test requirement".into(),
                    art_type: "requirement".into(),
                    status: "approved".into(),
                    description: "A test requirement description".into(),
                })
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

    // rivet: verifies REQ-007
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
}
