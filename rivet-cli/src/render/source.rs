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

use rivet_core::document::{self, html_escape};

use super::RenderContext;
use super::helpers::badge_for_type;

// ── Constants ─────────────────────────────────────────────────────────────

const SOURCE_MAX_SIZE: u64 = 100 * 1024;
const SOURCE_MAX_DEPTH: usize = 3;
const SOURCE_SKIP_DIRS: &[&str] = &["target", ".git", "node_modules", ".DS_Store"];

// ── Tree ──────────────────────────────────────────────────────────────────

struct TreeEntry {
    name: String,
    rel_path: String,
    is_dir: bool,
    children: Vec<TreeEntry>,
}

fn build_tree(base: &std::path::Path, rel: &str, depth: usize) -> Vec<TreeEntry> {
    if depth > SOURCE_MAX_DEPTH {
        return Vec::new();
    }
    let Ok(entries) = std::fs::read_dir(base) else {
        return Vec::new();
    };
    let mut items: Vec<TreeEntry> = Vec::new();
    for entry in entries.flatten() {
        let ft = match entry.file_type() {
            Ok(ft) => ft,
            Err(_) => continue,
        };
        if ft.is_symlink() {
            continue;
        }
        let name = entry.file_name().to_string_lossy().to_string();
        if SOURCE_SKIP_DIRS.contains(&name.as_str()) || name.starts_with('.') {
            continue;
        }
        let child_rel = if rel.is_empty() {
            name.clone()
        } else {
            format!("{rel}/{name}")
        };
        if ft.is_dir() {
            let children = build_tree(&entry.path(), &child_rel, depth + 1);
            items.push(TreeEntry {
                name,
                rel_path: child_rel,
                is_dir: true,
                children,
            });
        } else {
            items.push(TreeEntry {
                name,
                rel_path: child_rel,
                is_dir: false,
                children: Vec::new(),
            });
        }
    }
    items.sort_by(|a, b| {
        b.is_dir
            .cmp(&a.is_dir)
            .then_with(|| a.name.to_lowercase().cmp(&b.name.to_lowercase()))
    });
    items
}

fn render_tree(entries: &[TreeEntry], html: &mut String, depth: usize) {
    html.push_str("<ul>");
    for entry in entries {
        html.push_str("<li>");
        let indent: String = (0..depth)
            .map(|_| "<span class=\"indent\"></span>")
            .collect();
        if entry.is_dir {
            html.push_str(&format!(
                "<span class=\"tree-item\">{indent}<span class=\"tree-icon\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 4.5h4l2 2h6v7H2z\"/></svg></span> {name}</span>",
                name = html_escape(&entry.name),
            ));
            if !entry.children.is_empty() {
                render_tree(&entry.children, html, depth + 1);
            }
        } else {
            let encoded = urlencoding::encode(&entry.rel_path);
            let icon = if entry.name.ends_with(".yaml") || entry.name.ends_with(".yml") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#b8860b\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/><path d=\"M6 5h4M6 8h4M6 11h2\"/></svg>"
            } else if entry.name.ends_with(".rs") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#e67e22\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><polyline points=\"5 4.5 1.5 8 5 11.5\"/><polyline points=\"11 4.5 14.5 8 11 11.5\"/></svg>"
            } else if entry.name.ends_with(".md") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#3a86ff\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M9 1.5H4.5A1.5 1.5 0 003 3v10a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0013 13V5.5L9 1.5z\"/><path d=\"M9 1.5V5.5h4\"/></svg>"
            } else if entry.name.ends_with(".toml") {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"#6f42c1\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/><path d=\"M6 5h4M6 8h2\"/></svg>"
            } else {
                "<svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/></svg>"
            };
            html.push_str(&format!(
                "<a class=\"tree-item\" hx-get=\"/source/{encoded}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source/{encoded}\">{indent}<span class=\"tree-icon\">{icon}</span> {name}</a>",
                name = html_escape(&entry.name),
            ));
        }
        html.push_str("</li>");
    }
    html.push_str("</ul>");
}

pub(crate) fn render_source_tree_view(ctx: &RenderContext) -> String {
    let project_path = ctx.project_path;
    let tree = build_tree(project_path, "", 0);
    let mut html = String::from("<h2>Source Files</h2>");
    html.push_str(&format!(
        "<p class=\"meta\" style=\"margin-bottom:1rem\">Project directory: <code>{}</code></p>",
        html_escape(&project_path.display().to_string())
    ));
    html.push_str("<div class=\"card source-tree\">");
    render_tree(&tree, &mut html, 0);
    html.push_str("</div>");
    html
}

// ── File helpers ──────────────────────────────────────────────────────────

fn format_size(bytes: u64) -> String {
    if bytes < 1024 {
        format!("{bytes} B")
    } else if bytes < 1024 * 1024 {
        format!("{:.1} KB", bytes as f64 / 1024.0)
    } else {
        format!("{:.1} MB", bytes as f64 / (1024.0 * 1024.0))
    }
}

fn format_mtime(time: std::time::SystemTime) -> String {
    let secs = time
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_secs())
        .unwrap_or(0);
    std::process::Command::new("date")
        .args(["-r", &secs.to_string(), "+%Y-%m-%d %H:%M:%S"])
        .output()
        .ok()
        .filter(|o| o.status.success())
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_else(|| format!("epoch+{secs}s"))
}

fn collect_artifact_ids(store: &rivet_core::store::Store) -> std::collections::HashSet<String> {
    store.iter().map(|a| a.id.clone()).collect()
}

struct FileRef {
    id: String,
    artifact_type: String,
    title: String,
    line: Option<u32>,
    end_line: Option<u32>,
}

fn artifacts_referencing_file(store: &rivet_core::store::Store, file_rel: &str) -> Vec<FileRef> {
    let rel = std::path::Path::new(file_rel);
    let mut refs = Vec::new();

    for a in store.iter() {
        if let Some(sf) = &a.source_file {
            if sf == rel || sf.ends_with(file_rel) {
                refs.push(FileRef {
                    id: a.id.clone(),
                    artifact_type: a.artifact_type.clone(),
                    title: a.title.clone(),
                    line: None,
                    end_line: None,
                });
                continue;
            }
        }
        for value in a.fields.values() {
            if let serde_yaml::Value::String(s) = value {
                if let Some((_file, line, end_line)) = extract_file_ref(s, file_rel) {
                    refs.push(FileRef {
                        id: a.id.clone(),
                        artifact_type: a.artifact_type.clone(),
                        title: a.title.clone(),
                        line,
                        end_line,
                    });
                    break;
                }
            }
        }
    }
    refs
}

fn extract_file_ref(val: &str, target_file: &str) -> Option<(String, Option<u32>, Option<u32>)> {
    let idx = val.find(target_file)?;
    let after = &val[idx + target_file.len()..];
    if let Some(rest) = after.strip_prefix(':') {
        let digits_end = rest
            .find(|c: char| !c.is_ascii_digit())
            .unwrap_or(rest.len());
        if digits_end > 0 {
            let line: u32 = rest[..digits_end].parse().ok()?;
            let rest2 = &rest[digits_end..];
            if let Some(rest3) = rest2.strip_prefix('-') {
                let d2_end = rest3
                    .find(|c: char| !c.is_ascii_digit())
                    .unwrap_or(rest3.len());
                if d2_end > 0 {
                    let end_line: u32 = rest3[..d2_end].parse().ok()?;
                    return Some((target_file.to_string(), Some(line), Some(end_line)));
                }
            }
            return Some((target_file.to_string(), Some(line), None));
        }
    }
    Some((target_file.to_string(), None, None))
}

pub(crate) fn render_source_file_view(ctx: &RenderContext, raw_path: &str) -> String {
    let project_path = ctx.project_path;
    let store = ctx.store;
    let decoded = urlencoding::decode(raw_path).unwrap_or(std::borrow::Cow::Borrowed(raw_path));
    let rel_path = decoded.as_ref();

    let full_path = project_path.join(rel_path);
    let canonical = match full_path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return format!(
                "<h2>Not Found</h2><p>File <code>{}</code> does not exist.</p>",
                html_escape(rel_path)
            );
        }
    };
    let canonical_project = match project_path.canonicalize() {
        Ok(p) => p,
        Err(_) => {
            return "<h2>Error</h2><p>Cannot resolve project path.</p>".into();
        }
    };
    if !canonical.starts_with(&canonical_project) {
        return "<h2>Forbidden</h2><p>Path traversal is not allowed.</p>".into();
    }

    let metadata = match std::fs::symlink_metadata(&full_path) {
        Ok(m) => m,
        Err(_) => {
            return format!(
                "<h2>Not Found</h2><p>File <code>{}</code> does not exist.</p>",
                html_escape(rel_path)
            );
        }
    };
    if metadata.file_type().is_symlink() {
        return "<h2>Forbidden</h2><p>Symlinks are not followed.</p>".into();
    }
    if metadata.is_dir() {
        return format!(
            "<h2>Directory</h2><p><code>{}</code> is a directory. <a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source\">Back to tree</a></p>",
            html_escape(rel_path)
        );
    }

    let file_size = metadata.len();
    if file_size > SOURCE_MAX_SIZE {
        return format!(
            "<h2>File Too Large</h2><p><code>{}</code> is {} which exceeds the 100 KB limit.</p><p><a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source\" class=\"btn btn-secondary\">&larr; Back to files</a></p>",
            html_escape(rel_path),
            format_size(file_size)
        );
    }

    let content = match std::fs::read_to_string(&full_path) {
        Ok(c) => c,
        Err(e) => {
            return format!(
                "<h2>Error</h2><p>Cannot read <code>{}</code>: {}</p>",
                html_escape(rel_path),
                html_escape(&e.to_string())
            );
        }
    };

    let mut html = String::new();

    html.push_str("<div class=\"source-breadcrumb\">");
    html.push_str(
        "<a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source\">Source</a>",
    );
    let parts: Vec<&str> = rel_path.split('/').collect();
    for (i, part) in parts.iter().enumerate() {
        html.push_str("<span class=\"sep\">/</span>");
        if i == parts.len() - 1 {
            html.push_str(&format!("<strong>{}</strong>", html_escape(part)));
        } else {
            html.push_str(&format!("<span>{}</span>", html_escape(part)));
        }
    }
    html.push_str("</div>");

    let mtime_str = metadata
        .modified()
        .map(format_mtime)
        .unwrap_or_else(|_| "unknown".into());
    html.push_str("<div class=\"source-meta\">");
    html.push_str(&format!(
        "<span class=\"meta-item\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"3\" y=\"1.5\" width=\"10\" height=\"13\" rx=\"1.5\"/></svg> {}</span>",
        format_size(file_size)
    ));
    html.push_str(&format!(
        "<span class=\"meta-item\"><svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"8\" cy=\"8\" r=\"6.5\"/><path d=\"M8 4v4l3 2\"/></svg> {}</span>",
        html_escape(&mtime_str)
    ));
    html.push_str(&format!(
        "<span class=\"meta-item\">{} lines</span>",
        content.lines().count()
    ));
    html.push_str("</div>");

    let file_name = full_path.file_name().and_then(|n| n.to_str()).unwrap_or("");
    let is_yaml = file_name.ends_with(".yaml") || file_name.ends_with(".yml");
    let is_markdown = file_name.ends_with(".md");
    let is_rust = file_name.ends_with(".rs");
    let is_toml = file_name.ends_with(".toml");
    let is_shell = file_name.ends_with(".sh");
    let is_aadl = file_name.ends_with(".aadl");
    let artifact_ids = collect_artifact_ids(store);

    let file_lang = if is_yaml {
        "yaml"
    } else if is_rust {
        "rust"
    } else if is_toml {
        "toml"
    } else if is_shell {
        "bash"
    } else if is_aadl {
        "yaml"
    } else {
        ""
    };

    if is_markdown && content.starts_with("---") {
        if let Ok(doc) = rivet_core::document::parse_document(&content, Some(&full_path)) {
            html.push_str("<div class=\"card\"><div class=\"doc-body\">");
            let graph = ctx.graph;
            let body_html = document::render_to_html(
                &doc,
                |aid| store.contains(aid),
                |aid| build_artifact_info(aid, store, graph),
                |did| ctx.doc_store.get(did).is_some(),
                |_req| Ok(String::new()),
            );
            let body_html = rewrite_image_paths(&body_html);
            html.push_str(&body_html);
            html.push_str("</div></div>");
        } else {
            render_code_block(&content, &artifact_ids, file_lang, &mut html);
        }
    } else {
        render_code_block(&content, &artifact_ids, file_lang, &mut html);
    }

    let refs = artifacts_referencing_file(store, rel_path);
    if !refs.is_empty() {
        html.push_str("<div class=\"source-refs card\">");
        html.push_str(&format!(
            "<h3>Artifacts Referencing This File ({})</h3>",
            refs.len()
        ));
        html.push_str("<table><thead><tr><th>ID</th><th>Type</th><th>Title</th><th>Lines</th></tr></thead><tbody>");
        for fref in &refs {
            let line_info = match (fref.line, fref.end_line) {
                (Some(l), Some(e)) => format!(
                    "<a href=\"#L{l}\" onclick=\"var el=document.getElementById('L{l}');if(el)el.scrollIntoView({{behavior:'smooth',block:'center'}})\">{l}-{e}</a>"
                ),
                (Some(l), None) => format!(
                    "<a href=\"#L{l}\" onclick=\"var el=document.getElementById('L{l}');if(el)el.scrollIntoView({{behavior:'smooth',block:'center'}})\">{l}</a>"
                ),
                _ => "\u{2014}".into(),
            };
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a></td><td>{}</td><td>{}</td><td>{line_info}</td></tr>",
                badge_for_type(&fref.artifact_type),
                html_escape(&fref.title),
                id = html_escape(&fref.id),
            ));
        }
        html.push_str("</tbody></table></div>");
    }

    html.push_str("<p style=\"margin-top:1rem\"><a hx-get=\"/source\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/source\" class=\"btn btn-secondary\">&larr; Back to files</a></p>");
    html
}

// ── Syntax highlighting ───────────────────────────────────────────────────

fn highlight_yaml_line(line: &str) -> String {
    let escaped = html_escape(line);
    if line.trim().is_empty() {
        return escaped;
    }
    let trimmed = line.trim_start();
    if trimmed.starts_with('#') {
        let indent = &escaped[..escaped.len() - html_escape(trimmed).len()];
        return format!(
            "{indent}<span class=\"hl-comment\">{}</span>",
            html_escape(trimmed)
        );
    }
    let mut out = String::with_capacity(escaped.len() + 64);
    if let Some(colon_pos) = find_yaml_colon(trimmed) {
        let raw_indent = escaped.len() - html_escape(trimmed).len();
        let indent_str = &escaped[..raw_indent];
        out.push_str(indent_str);
        let key_part = &trimmed[..colon_pos];
        let rest = &trimmed[colon_pos..];
        if let Some(after_dash) = key_part.strip_prefix("- ") {
            out.push_str("<span class=\"hl-punct\">-</span> ");
            out.push_str(&format!(
                "<span class=\"hl-key\">{}</span>",
                html_escape(after_dash)
            ));
        } else {
            out.push_str(&format!(
                "<span class=\"hl-key\">{}</span>",
                html_escape(key_part)
            ));
        }
        out.push_str("<span class=\"hl-punct\">:</span>");
        let after_colon = &rest[1..];
        if !after_colon.is_empty() {
            out.push_str(&highlight_yaml_value(after_colon));
        }
    } else if trimmed.starts_with("- ") {
        let raw_indent = escaped.len() - html_escape(trimmed).len();
        out.push_str(&escaped[..raw_indent]);
        out.push_str("<span class=\"hl-punct\">-</span>");
        out.push_str(&highlight_yaml_value(&trimmed[1..]));
    } else {
        out.push_str(&escaped);
    }
    out
}

fn find_yaml_colon(s: &str) -> Option<usize> {
    let (search, offset) = if let Some(rest) = s.strip_prefix("- ") {
        (rest, 2)
    } else {
        (s, 0)
    };
    let mut in_quote = false;
    let mut quote_char = ' ';
    for (i, c) in search.char_indices() {
        if in_quote {
            if c == quote_char {
                in_quote = false;
            }
            continue;
        }
        if c == '\'' || c == '"' {
            in_quote = true;
            quote_char = c;
            continue;
        }
        if c == ':' && (i + 1 >= search.len() || search.as_bytes()[i + 1] == b' ') {
            return Some(i + offset);
        }
    }
    None
}

fn highlight_yaml_value(val: &str) -> String {
    let trimmed = val.trim();
    if trimmed.is_empty() {
        return html_escape(val);
    }
    let (value_part, comment) = split_inline_comment(trimmed);
    let leading_space = &val[..val.len() - val.trim_start().len()];
    let mut out = String::new();
    out.push_str(&html_escape(leading_space));
    let v = value_part.trim();
    if v.is_empty() {
    } else if v == "true" || v == "false" {
        out.push_str(&format!("<span class=\"hl-bool\">{v}</span>"));
    } else if v == "null" || v == "~" {
        out.push_str(&format!("<span class=\"hl-null\">{v}</span>"));
    } else if v.starts_with('"') || v.starts_with('\'') {
        out.push_str(&format!("<span class=\"hl-str\">{}</span>", html_escape(v)));
    } else if v.starts_with('[') || v.starts_with('{') {
        out.push_str(&highlight_yaml_inline_collection(v));
    } else if v.starts_with('*') || v.starts_with('&') {
        out.push_str(&format!(
            "<span class=\"hl-anchor\">{}</span>",
            html_escape(v)
        ));
    } else if v == ">" || v == "|" || v == ">-" || v == "|-" {
        out.push_str(&format!(
            "<span class=\"hl-punct\">{}</span>",
            html_escape(v)
        ));
    } else if v.parse::<f64>().is_ok() {
        out.push_str(&format!("<span class=\"hl-num\">{}</span>", html_escape(v)));
    } else {
        out.push_str(&format!("<span class=\"hl-str\">{}</span>", html_escape(v)));
    }
    if !comment.is_empty() {
        out.push_str(&format!(
            "  <span class=\"hl-comment\">{}</span>",
            html_escape(comment)
        ));
    }
    out
}

fn split_inline_comment(s: &str) -> (&str, &str) {
    let mut in_quote = false;
    let mut qc = ' ';
    let bytes = s.as_bytes();
    for i in 0..bytes.len() {
        let c = bytes[i] as char;
        if in_quote {
            if c == qc {
                in_quote = false;
            }
            continue;
        }
        if c == '\'' || c == '"' {
            in_quote = true;
            qc = c;
            continue;
        }
        if c == '#' && (i == 0 || bytes[i - 1] == b' ') {
            return (s[..i].trim_end(), &s[i..]);
        }
    }
    (s, "")
}

fn highlight_yaml_inline_collection(s: &str) -> String {
    let mut out = String::new();
    for c in s.chars() {
        match c {
            '[' | ']' | '{' | '}' | ',' => {
                out.push_str(&format!("<span class=\"hl-punct\">{c}</span>"));
            }
            _ => out.push(c),
        }
    }
    out
}

fn highlight_bash_line(line: &str) -> String {
    let escaped = html_escape(line);
    let trimmed = line.trim();
    if trimmed.is_empty() || trimmed.starts_with('#') {
        if trimmed.starts_with('#') {
            return format!("<span class=\"hl-comment\">{}</span>", escaped);
        }
        return escaped;
    }
    let mut out = String::new();
    let mut first_word = true;
    for token in trimmed.split_whitespace() {
        if !first_word || !out.is_empty() {
            out.push(' ');
        }
        if token == "|" || token == "&&" || token == "||" {
            out.push_str(&format!(
                "<span class=\"hl-sh-pipe\">{}</span>",
                html_escape(token)
            ));
            first_word = true;
            continue;
        }
        if first_word {
            out.push_str(&format!(
                "<span class=\"hl-sh-cmd\">{}</span>",
                html_escape(token)
            ));
            first_word = false;
        } else if token.starts_with('-') {
            out.push_str(&format!(
                "<span class=\"hl-sh-flag\">{}</span>",
                html_escape(token)
            ));
        } else if token.starts_with('"') || token.starts_with('\'') {
            out.push_str(&format!(
                "<span class=\"hl-str\">{}</span>",
                html_escape(token)
            ));
        } else {
            out.push_str(&html_escape(token));
        }
    }
    let indent = &escaped[..escaped.len() - html_escape(trimmed).len()];
    format!("{indent}{out}")
}

pub(crate) fn syntax_highlight_line(line: &str, lang: &str) -> String {
    match lang {
        "yaml" | "yml" => highlight_yaml_line(line),
        "bash" | "sh" | "shell" => highlight_bash_line(line),
        "rust" | "rs" => highlight_rust_line(line),
        "toml" => highlight_toml_line(line),
        _ => html_escape(line),
    }
}

fn highlight_rust_line(line: &str) -> String {
    let trimmed = line.trim_start();
    if trimmed.is_empty() {
        return html_escape(line);
    }
    if trimmed.starts_with("//") {
        let indent = &line[..line.len() - trimmed.len()];
        return format!(
            "{}<span class=\"hl-comment\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    if trimmed.starts_with("#[") || trimmed.starts_with("#![") {
        let indent = &line[..line.len() - trimmed.len()];
        return format!(
            "{}<span class=\"hl-attr\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    let mut out = String::with_capacity(html_escape(line).len() * 2);
    let chars: Vec<char> = line.chars().collect();
    let len = chars.len();
    let mut i = 0;
    while i < len {
        let ch = chars[i];
        if ch == '"' {
            let start = i;
            i += 1;
            while i < len && chars[i] != '"' {
                if chars[i] == '\\' {
                    i += 1;
                }
                i += 1;
            }
            if i < len {
                i += 1;
            }
            let s: String = chars[start..i].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-str\">{}</span>",
                html_escape(&s)
            ));
            continue;
        }
        if ch == '\'' && i + 2 < len && chars[i + 2] == '\'' {
            let s: String = chars[i..i + 3].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-str\">{}</span>",
                html_escape(&s)
            ));
            i += 3;
            continue;
        }
        if ch == '/' && i + 1 < len && chars[i + 1] == '/' {
            let s: String = chars[i..].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-comment\">{}</span>",
                html_escape(&s)
            ));
            break;
        }
        if ch.is_ascii_digit() && (i == 0 || !chars[i - 1].is_alphanumeric()) {
            let start = i;
            while i < len
                && (chars[i].is_ascii_alphanumeric() || chars[i] == '_' || chars[i] == '.')
            {
                i += 1;
            }
            let s: String = chars[start..i].iter().collect();
            out.push_str(&format!(
                "<span class=\"hl-num\">{}</span>",
                html_escape(&s)
            ));
            continue;
        }
        if ch.is_ascii_alphabetic() || ch == '_' {
            let start = i;
            while i < len && (chars[i].is_ascii_alphanumeric() || chars[i] == '_') {
                i += 1;
            }
            let word: String = chars[start..i].iter().collect();
            if i < len
                && chars[i] == '!'
                && !matches!(
                    word.as_str(),
                    "if" | "else" | "return" | "break" | "continue"
                )
            {
                out.push_str(&format!(
                    "<span class=\"hl-macro\">{}!</span>",
                    html_escape(&word)
                ));
                i += 1;
                continue;
            }
            match word.as_str() {
                "fn" | "let" | "mut" | "pub" | "use" | "mod" | "struct" | "enum" | "impl"
                | "trait" | "const" | "static" | "type" | "where" | "match" | "if" | "else"
                | "for" | "while" | "loop" | "return" | "break" | "continue" | "async"
                | "await" | "move" | "ref" | "self" | "super" | "crate" | "unsafe" | "extern"
                | "dyn" | "as" | "in" | "true" | "false" | "Self" | "None" | "Some" | "Ok"
                | "Err" => {
                    out.push_str(&format!(
                        "<span class=\"hl-kw\">{}</span>",
                        html_escape(&word)
                    ));
                }
                _ if word.chars().next().is_some_and(|c| c.is_ascii_uppercase()) => {
                    out.push_str(&format!(
                        "<span class=\"hl-type\">{}</span>",
                        html_escape(&word)
                    ));
                }
                _ => out.push_str(&html_escape(&word)),
            }
            continue;
        }
        out.push_str(&html_escape(&ch.to_string()));
        i += 1;
    }
    out
}

fn highlight_toml_line(line: &str) -> String {
    let trimmed = line.trim_start();
    if trimmed.is_empty() {
        return html_escape(line);
    }
    let indent = &line[..line.len() - trimmed.len()];
    if trimmed.starts_with('#') {
        return format!(
            "{}<span class=\"hl-comment\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    if trimmed.starts_with('[') {
        return format!(
            "{}<span class=\"hl-key\">{}</span>",
            html_escape(indent),
            html_escape(trimmed)
        );
    }
    if let Some(eq_pos) = trimmed.find('=') {
        let key = &trimmed[..eq_pos].trim_end();
        let rest = &trimmed[eq_pos..];
        return format!(
            "{}<span class=\"hl-key\">{}</span>{}",
            html_escape(indent),
            html_escape(key),
            highlight_toml_value(rest)
        );
    }
    html_escape(line)
}

fn highlight_toml_value(s: &str) -> String {
    let trimmed = s.strip_prefix('=').unwrap_or(s);
    let val = trimmed.trim();
    if val.starts_with('"') || val.starts_with('\'') {
        return format!(
            "<span class=\"hl-punct\">=</span> <span class=\"hl-str\">{}</span>",
            html_escape(val)
        );
    }
    if val == "true" || val == "false" {
        return format!(
            "<span class=\"hl-punct\">=</span> <span class=\"hl-bool\">{}</span>",
            val
        );
    }
    if val.chars().next().is_some_and(|c| c.is_ascii_digit()) {
        return format!(
            "<span class=\"hl-punct\">=</span> <span class=\"hl-num\">{}</span>",
            html_escape(val)
        );
    }
    format!("<span class=\"hl-punct\">=</span> {}", html_escape(trimmed))
}

pub(crate) fn render_code_block(
    content: &str,
    artifact_ids: &std::collections::HashSet<String>,
    lang: &str,
    html: &mut String,
) {
    html.push_str("<div class=\"card source-viewer\"><table>");
    for (i, line) in content.lines().enumerate() {
        let line_num = i + 1;
        let has_artifact = artifact_ids.iter().any(|id| line.contains(id.as_str()));
        let row_class = if has_artifact {
            "source-line source-line-highlight"
        } else {
            "source-line"
        };
        let highlighted = if !lang.is_empty() {
            syntax_highlight_line(line, lang)
        } else {
            html_escape(line)
        };
        let display_line = if !lang.is_empty() {
            let mut result = highlighted;
            let mut ids: Vec<&String> = artifact_ids
                .iter()
                .filter(|id| line.contains(id.as_str()))
                .collect();
            ids.sort_by_key(|b| std::cmp::Reverse(b.len()));
            for id in ids {
                let escaped_id = html_escape(id);
                if let Some(pos) = result.find(&escaped_id) {
                    let link = format!(
                        "<a class=\"artifact-ref\" hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{escaped_id}</a>"
                    );
                    let before = &result[..pos];
                    let after = &result[pos + escaped_id.len()..];
                    result = format!("{before}{link}{after}");
                }
            }
            result
        } else {
            highlighted
        };
        html.push_str(&format!(
            "<tr id=\"L{line_num}\" class=\"{row_class}\"><td class=\"line-no\"><a href=\"#L{line_num}\">{line_num}</a></td><td class=\"line-content\">{display_line}</td></tr>"
        ));
    }
    html.push_str("</table></div>");
}

// ── Helpers shared with other render modules ──────────────────────────────

/// Rewrite relative image `src` paths to serve through `/docs-asset/`.
pub(crate) fn rewrite_image_paths(html: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut rest = html;
    while let Some(pos) = rest.find("src=\"") {
        result.push_str(&rest[..pos]);
        let after_src = &rest[pos + 5..];
        if let Some(end) = after_src.find('"') {
            let path = &after_src[..end];
            result.push_str("src=\"");
            if path.starts_with("http://")
                || path.starts_with("https://")
                || path.starts_with("//")
                || path.starts_with('/')
            {
                result.push_str(path);
            } else {
                result.push_str("/docs-asset/");
                result.push_str(path);
            }
            result.push('"');
            rest = &after_src[end + 1..];
        } else {
            result.push_str("src=\"");
            rest = after_src;
        }
    }
    result.push_str(rest);
    result
}

/// Build an `ArtifactInfo` for embedding from the store and link graph.
pub(crate) fn build_artifact_info(
    id: &str,
    store: &rivet_core::store::Store,
    graph: &rivet_core::links::LinkGraph,
) -> Option<document::ArtifactInfo> {
    if let Some(art_type) = id.strip_prefix("__type:") {
        let ids: Vec<String> = store.by_type(art_type).to_vec();
        if ids.is_empty() {
            return None;
        }
        return Some(document::ArtifactInfo {
            id: format!("__type:{art_type}"),
            title: String::new(),
            art_type: art_type.to_string(),
            status: String::new(),
            description: String::new(),
            tags: ids,
            fields: Vec::new(),
            links: Vec::new(),
            backlinks: Vec::new(),
        });
    }

    let a = store.get(id)?;

    let links: Vec<document::LinkInfo> = a
        .links
        .iter()
        .map(|link| {
            let (target_title, target_type) = store
                .get(&link.target)
                .map(|t| (t.title.clone(), t.artifact_type.clone()))
                .unwrap_or_default();
            document::LinkInfo {
                link_type: link.link_type.clone(),
                target_id: link.target.clone(),
                target_title,
                target_type,
            }
        })
        .collect();

    let backlinks: Vec<document::LinkInfo> = graph
        .backlinks_to(id)
        .iter()
        .map(|bl| {
            let (source_title, source_type) = store
                .get(&bl.source)
                .map(|s| (s.title.clone(), s.artifact_type.clone()))
                .unwrap_or_default();
            let display_type = bl
                .inverse_type
                .as_deref()
                .unwrap_or(&bl.link_type)
                .to_string();
            document::LinkInfo {
                link_type: display_type,
                target_id: bl.source.clone(),
                target_title: source_title,
                target_type: source_type,
            }
        })
        .collect();

    let fields: Vec<(String, String)> = a
        .fields
        .iter()
        .map(|(k, v)| {
            let display = match v {
                serde_yaml::Value::String(s) => s.clone(),
                serde_yaml::Value::Bool(b) => b.to_string(),
                serde_yaml::Value::Number(n) => n.to_string(),
                serde_yaml::Value::Null => String::new(),
                other => format!("{other:?}"),
            };
            (k.clone(), display)
        })
        .collect();

    Some(document::ArtifactInfo {
        id: a.id.clone(),
        title: a.title.clone(),
        art_type: a.artifact_type.clone(),
        status: a.status.clone().unwrap_or_default(),
        description: a.description.clone().unwrap_or_default(),
        tags: a.tags.clone(),
        fields,
        links,
        backlinks,
    })
}
