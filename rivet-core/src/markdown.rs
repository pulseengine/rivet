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
/// Fenced ` ```mermaid ` code blocks are emitted as `<pre class="mermaid">...</pre>`
/// (rather than pulldown-cmark's default `<pre><code class="language-mermaid">`)
/// so the dashboard's mermaid.js loader (which selects on `.mermaid`) renders
/// them as diagrams. Matches the behaviour of the document renderer in
/// `document.rs`.
///
/// Security: raw HTML events are filtered at the pulldown-cmark level (except
/// for the two synthetic `<pre class="mermaid">` wrappers, which are injected
/// by us and are safe), and a regex-based sanitization pass strips dangerous
/// tags (`<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`), `on*` event
/// handler attributes, and `javascript:` URLs as defense-in-depth.
pub fn render_markdown(input: &str) -> String {
    use pulldown_cmark::{CodeBlockKind, Event, Options, Parser, Tag, TagEnd, html};

    let mut options = Options::empty();
    options.insert(Options::ENABLE_TABLES);
    options.insert(Options::ENABLE_STRIKETHROUGH);
    options.insert(Options::ENABLE_TASKLISTS);

    // Two-stage event pipeline:
    //   1. Track whether we are inside a fenced ```mermaid block, and when we
    //      are, replace the Start/End CodeBlock events with synthetic Html
    //      events that wrap the body in `<pre class="mermaid">...</pre>`.
    //   2. Filter out any *other* raw HTML events to prevent XSS via markdown
    //      input. The synthetic mermaid wrappers are marked by a sentinel
    //      prefix we strip back out — see `MERMAID_OPEN` / `MERMAID_CLOSE`.
    const MERMAID_OPEN: &str = "\0rivet-mermaid-open\0";
    const MERMAID_CLOSE: &str = "\0rivet-mermaid-close\0";

    let mut in_mermaid = false;
    let parser = Parser::new_ext(input, options).filter_map(move |event| match event {
        Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(ref lang)))
            if lang.as_ref() == "mermaid" =>
        {
            in_mermaid = true;
            Some(Event::Html(MERMAID_OPEN.into()))
        }
        Event::End(TagEnd::CodeBlock) if in_mermaid => {
            in_mermaid = false;
            Some(Event::Html(MERMAID_CLOSE.into()))
        }
        // Inside a mermaid block, pass text through as-is (pulldown-cmark
        // emits the fenced body as Event::Text segments).
        Event::Text(_) if in_mermaid => Some(event),
        // Drop all other raw HTML events for XSS defence.
        Event::Html(_) | Event::InlineHtml(_) => None,
        other => Some(other),
    });

    let mut html_output = String::new();
    html::push_html(&mut html_output, parser);

    // Rewrite the mermaid sentinels into the real HTML tags.  Because the
    // sentinels contain NUL bytes they cannot appear in markdown input, so
    // replacement is safe from confusion attacks.
    let html_output = html_output
        .replace(MERMAID_OPEN, "<pre class=\"mermaid\">")
        .replace(MERMAID_CLOSE, "</pre>");

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

    // ── Mermaid rendering (REQ-032) ─────────────────────────────────────

    // Mermaid fenced blocks must emit <pre class="mermaid"> so the
    // dashboard's mermaid.js loader (selector: `.mermaid`) picks them up.
    // rivet: verifies REQ-032
    #[test]
    fn fenced_mermaid_becomes_pre_mermaid() {
        let input = "```mermaid\ngraph TD\nA-->B\n```";
        let html = render_markdown(input);
        assert!(
            html.contains("<pre class=\"mermaid\">"),
            "mermaid block must render as <pre class=\"mermaid\">, got: {html}"
        );
        assert!(
            html.contains("graph TD"),
            "mermaid body must be preserved, got: {html}"
        );
        assert!(
            !html.contains("language-mermaid"),
            "default pulldown-cmark language class must not leak, got: {html}"
        );
    }

    // rivet: verifies REQ-032
    #[test]
    fn fenced_mermaid_inside_artifact_description_renders() {
        // Shape mirrors a real artifact description with prose around a diagram.
        let input = "Overview:\n\n```mermaid\nflowchart LR\nA --> B\n```\n\nMore text.";
        let html = render_markdown(input);
        assert!(html.contains("<pre class=\"mermaid\">"), "got: {html}");
        assert!(html.contains("flowchart LR"), "got: {html}");
        assert!(html.contains("More text"), "got: {html}");
    }

    // Regression: non-mermaid fences still render as normal code blocks with
    // a language class (so existing syntax highlighting, etc. keeps working).
    // rivet: verifies REQ-032
    #[test]
    fn fenced_rust_still_renders_as_code() {
        let input = "```rust\nfn main() {}\n```";
        let html = render_markdown(input);
        assert!(
            html.contains("<pre><code class=\"language-rust\">"),
            "rust block must keep language-rust class, got: {html}"
        );
        assert!(
            !html.contains("<pre class=\"mermaid\""),
            "rust must not be treated as mermaid, got: {html}"
        );
    }

    // Sentinel strings used internally for the mermaid rewrite must never
    // leak into output even if a user tries to smuggle them via text.  NUL
    // bytes cannot appear in well-formed markdown input, so the sentinel is
    // distinguishable from user content; but we still test that normal
    // usage has no NUL bytes remaining.
    // rivet: verifies REQ-032
    #[test]
    fn mermaid_sentinels_do_not_leak() {
        let html = render_markdown("```mermaid\nA-->B\n```");
        assert!(!html.contains('\0'), "NUL sentinels must be rewritten");
        assert!(
            !html.contains("rivet-mermaid-open"),
            "sentinel label must not leak, got: {html}"
        );
    }
}
