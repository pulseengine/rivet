//! Markdown rendering utilities.
//!
//! Provides a shared [`render_markdown`] function used by the dashboard,
//! static HTML export, and document embedding to render artifact descriptions,
//! field values, and document content from markdown to HTML.

/// Render a markdown string to HTML.
///
/// Enables tables, strikethrough, and task lists on top of the CommonMark base.
/// Used for artifact descriptions, field values, and document content.
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
    html_output
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
}
