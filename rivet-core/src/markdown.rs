//! Markdown rendering utilities.
//!
//! Provides a shared [`render_markdown`] function used by the dashboard,
//! static HTML export, and document embedding to render artifact descriptions,
//! field values, and document content from markdown to HTML.

use regex::Regex;
use std::sync::LazyLock;

/// Pre-compiled regexes for HTML sanitization (defense-in-depth).
static SANITIZE_SCRIPT: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?is)<script[\s>].*?</script\s*>").unwrap());
static SANITIZE_SCRIPT_SELF: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?is)<script\s*/>").unwrap());
static SANITIZE_IFRAME: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?is)<iframe[\s>].*?</iframe\s*>").unwrap());
static SANITIZE_OBJECT: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?is)<object[\s>].*?</object\s*>").unwrap());
static SANITIZE_EMBED: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?is)<embed\b[^>]*>").unwrap());
static SANITIZE_FORM: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"(?is)<form[\s>].*?</form\s*>").unwrap());
static SANITIZE_EVENT_HANDLER: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r#"(?i)\s+on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]*)"#).unwrap());
static SANITIZE_JS_URL: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r#"(?i)(href|src|action)\s*=\s*["']?\s*javascript\s*:[^"'>]*["']?"#).unwrap()
});

/// Post-process rendered HTML to strip dangerous tags and attributes.
///
/// This is defense-in-depth: pulldown-cmark's raw-HTML event filtering is the
/// primary barrier, but this regex pass catches edge cases like `javascript:`
/// URLs in link `href` attributes and `on*` event handler attributes that
/// pulldown-cmark may generate from valid markdown constructs.
fn sanitize_html(html: &str) -> String {
    let html = SANITIZE_SCRIPT.replace_all(html, "");
    let html = SANITIZE_SCRIPT_SELF.replace_all(&html, "");
    let html = SANITIZE_IFRAME.replace_all(&html, "");
    let html = SANITIZE_OBJECT.replace_all(&html, "");
    let html = SANITIZE_EMBED.replace_all(&html, "");
    let html = SANITIZE_FORM.replace_all(&html, "");
    let html = SANITIZE_EVENT_HANDLER.replace_all(&html, "");
    let html = SANITIZE_JS_URL.replace_all(&html, "");
    html.into_owned()
}

/// Render a markdown string to HTML.
///
/// Enables tables, strikethrough, and task lists on top of the CommonMark base.
/// Used for artifact descriptions, field values, and document content.
///
/// Security: raw HTML events are filtered at the pulldown-cmark level, and a
/// regex-based sanitization pass strips dangerous tags (`<script>`, `<iframe>`,
/// `<object>`, `<embed>`, `<form>`), `on*` event handler attributes, and
/// `javascript:` URLs as defense-in-depth.
pub fn render_markdown(input: &str) -> String {
    use pulldown_cmark::{Event, Options, Parser, html};

    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);

    // Filter out raw HTML events to prevent XSS via markdown input.
    // This strips <script>, <iframe>, and any other raw HTML while
    // keeping the rendered markdown HTML produced by pulldown-cmark.
    let parser = Parser::new_ext(input, options)
        .filter(|event| !matches!(event, Event::Html(_) | Event::InlineHtml(_)));

    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);

    // Defense-in-depth: strip dangerous tags/attributes that may survive
    // the pulldown-cmark event filter (e.g. javascript: URLs in links).
    sanitize_html(&html_output)
}

/// Strip HTML tags from rendered markdown to produce a plain-text preview.
///
/// This is intentionally simple — it removes `<tag>` sequences and collapses
/// whitespace.  Used for truncated description previews in tooltips.
pub fn strip_html_tags(html: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut in_tag = false;
    for ch in html.chars() {
        match ch {
            '<' => in_tag = true,
            '>' => in_tag = false,
            _ if !in_tag => result.push(ch),
            _ => {}
        }
    }
    // Collapse runs of whitespace (newlines from block elements, etc.)
    let collapsed: String = result.split_whitespace().collect::<Vec<_>>().join(" ");
    collapsed
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // rivet: verifies REQ-032
    #[test]
    fn basic_markdown() {
        let html = render_markdown("Hello **world**");
        assert!(html.contains("<strong>world</strong>"), "got: {html}");
        assert!(html.contains("<p>"), "should wrap in paragraph");
    }

    // rivet: verifies REQ-032
    #[test]
    fn tables() {
        let input = "| A | B |\n|---|---|\n| 1 | 2 |";
        let html = render_markdown(input);
        assert!(html.contains("<table>"), "got: {html}");
        assert!(html.contains("<th>A</th>"), "got: {html}");
        assert!(html.contains("<td>1</td>"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn code_blocks() {
        let input = "```rust\nfn main() {}\n```";
        let html = render_markdown(input);
        assert!(html.contains("<pre><code"), "got: {html}");
        assert!(html.contains("fn main()"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn inline_code() {
        let html = render_markdown("Use `foo()` here");
        assert!(html.contains("<code>foo()</code>"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn empty_string() {
        let html = render_markdown("");
        assert!(
            html.is_empty(),
            "empty input should produce empty output, got: {html}"
        );
    }

    // rivet: verifies REQ-032
    #[test]
    fn plain_text_passthrough() {
        let html = render_markdown("Just plain text");
        assert!(html.contains("Just plain text"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn strikethrough() {
        let html = render_markdown("~~deleted~~");
        assert!(html.contains("<del>deleted</del>"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn task_list() {
        let input = "- [x] Done\n- [ ] Todo";
        let html = render_markdown(input);
        assert!(html.contains("type=\"checkbox\""), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn raw_html_script_is_stripped() {
        let html = render_markdown("<script>alert(1)</script>");
        assert!(
            !html.contains("<script>"),
            "raw <script> must be stripped from markdown output, got: {html}"
        );
        assert!(
            !html.contains("</script>"),
            "closing </script> must be stripped, got: {html}"
        );
    }

    // rivet: verifies REQ-032
    #[test]
    fn inline_html_is_stripped() {
        let html = render_markdown("Hello <b>bold</b> world");
        assert!(
            !html.contains("<b>"),
            "inline HTML tags must be stripped, got: {html}"
        );
    }

    // rivet: verifies REQ-032
    #[test]
    fn raw_iframe_is_stripped() {
        let html = render_markdown("<iframe src=\"https://evil.example.com\"></iframe>");
        assert!(
            !html.contains("<iframe"),
            "raw <iframe> must be stripped from markdown output, got: {html}"
        );
    }

    // rivet: verifies REQ-032
    #[test]
    fn strip_tags_basic() {
        let plain = strip_html_tags("<p>Hello <strong>world</strong></p>");
        assert_eq!(plain, "Hello world");
    }

    // rivet: verifies REQ-032
    #[test]
    fn strip_tags_multiline() {
        let plain = strip_html_tags("<p>Line one</p>\n<p>Line two</p>");
        assert_eq!(plain, "Line one Line two");
    }

    // ── Sanitization tests (defense-in-depth) ──────────────────────────

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_strips_script_tags() {
        let html = render_markdown("Hello <script>alert(1)</script> world");
        assert!(!html.contains("<script>"), "got: {html}");
        assert!(html.contains("Hello"), "got: {html}");
        assert!(html.contains("world"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_strips_event_handlers() {
        let html = render_markdown("Hello <img src=x onerror='alert(1)'> world");
        assert!(!html.contains("onerror"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_strips_javascript_urls() {
        let html = render_markdown("[click](javascript:alert(1))");
        assert!(!html.contains("javascript:"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_preserves_safe_html() {
        let html = render_markdown("**bold** and `code`");
        assert!(html.contains("<strong>bold</strong>"), "got: {html}");
        assert!(html.contains("<code>code</code>"), "got: {html}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_fn_strips_script() {
        let out = sanitize_html("<p>hi</p><script>evil()</script><p>bye</p>");
        assert!(!out.contains("<script>"), "got: {out}");
        assert!(out.contains("<p>hi</p>"), "got: {out}");
        assert!(out.contains("<p>bye</p>"), "got: {out}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_fn_strips_iframe() {
        let out = sanitize_html(r#"<iframe src="https://evil.example.com"></iframe>"#);
        assert!(!out.contains("<iframe"), "got: {out}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_fn_strips_object() {
        let out = sanitize_html(r#"<object data="x"></object>"#);
        assert!(!out.contains("<object"), "got: {out}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_fn_strips_embed() {
        let out = sanitize_html(r#"<embed src="x">"#);
        assert!(!out.contains("<embed"), "got: {out}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_fn_strips_form() {
        let out = sanitize_html(r#"<form action="/x"><input></form>"#);
        assert!(!out.contains("<form"), "got: {out}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_fn_strips_event_handler_attr() {
        let out = sanitize_html(r#"<img src="x" onclick="alert(1)">"#);
        assert!(!out.contains("onclick"), "got: {out}");
        assert!(out.contains("<img"), "tag should remain, got: {out}");
    }

    // rivet: verifies REQ-032
    #[test]
    fn sanitize_fn_strips_javascript_href() {
        let out = sanitize_html(r#"<a href="javascript:alert(1)">click</a>"#);
        assert!(!out.contains("javascript:"), "got: {out}");
    }
}
