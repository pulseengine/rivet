// ── Page layout ──────────────────────────────────────────────────────────

use axum::response::Html;
use rivet_core::document::html_escape;
use rivet_core::schema::Severity;

use super::AppState;
use super::js;
use super::styles;

pub(crate) fn page_layout(content: &str, state: &AppState) -> Html<String> {
    let artifact_count = state.store.len();
    let error_count = state
        .cached_diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let error_badge = if error_count > 0 {
        format!("<span class=\"nav-badge nav-badge-error\">{error_count}</span>")
    } else {
        "<span class=\"nav-badge\">OK</span>".to_string()
    };
    let doc_badge = if !state.doc_store.is_empty() {
        format!("<span class=\"nav-badge\">{}</span>", state.doc_store.len())
    } else {
        String::new()
    };
    let result_badge = if !state.result_store.is_empty() {
        format!(
            "<span class=\"nav-badge\">{}</span>",
            state.result_store.len()
        )
    } else {
        String::new()
    };
    let stpa_types = [
        "loss",
        "hazard",
        "sub-hazard",
        "system-constraint",
        "controller",
        "controlled-process",
        "control-action",
        "uca",
        "controller-constraint",
        "loss-scenario",
    ];
    let stpa_count: usize = stpa_types
        .iter()
        .map(|t| state.store.count_by_type(t))
        .sum();
    let stpa_nav = if stpa_count > 0 {
        format!(
            "<li><a hx-get=\"/stpa\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/stpa\"><span class=\"nav-label\"><span class=\"nav-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M8 1.5l5.5 2.5v4c0 3.5-2.5 5.5-5.5 7-3-1.5-5.5-3.5-5.5-7V4z\"/><path d=\"M8 5v3M8 10.5h.01\"/></svg></span> STPA</span><span class=\"nav-badge\">{stpa_count}</span></a></li>"
        )
    } else {
        String::new()
    };
    let ext_total: usize = state.externals.iter().map(|e| e.store.len()).sum();
    let externals_nav = if !state.externals.is_empty() {
        let badge = if ext_total > 0 {
            format!("<span class=\"nav-badge\">{ext_total}</span>")
        } else {
            "<span class=\"nav-badge\">0</span>".to_string()
        };
        format!(
            "<li><a hx-get=\"/externals\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/externals\"><span class=\"nav-label\"><span class=\"nav-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M14 8H9l-2-2H2v8h12z\"/><path d=\"M2 4V2h5l2 2\"/><circle cx=\"11\" cy=\"9\" r=\"2\"/></svg></span> Externals</span>{badge}</a></li>"
        )
    } else {
        String::new()
    };
    let version = env!("CARGO_PKG_VERSION");

    // Context bar
    let ctx = &state.context;
    let git_html = if let Some(ref git) = ctx.git {
        let status = if git.is_dirty {
            format!(
                "<span class=\"ctx-dirty\">{} uncommitted</span>",
                git.dirty_count
            )
        } else {
            "<span class=\"ctx-clean\">clean</span>".to_string()
        };
        format!(
            "<span class=\"ctx-sep\">/</span>\
             <span class=\"ctx-git\">{branch}@{commit}</span>\
             {status}",
            branch = html_escape(&git.branch),
            commit = html_escape(&git.commit_short),
        )
    } else {
        String::new()
    };
    // Project switcher: show siblings as a dropdown if available
    let switcher_html = if ctx.siblings.is_empty() {
        String::new()
    } else {
        let mut s = String::from(
            "<span class=\"ctx-switcher\">\
             <details class=\"ctx-switcher-details\">\
             <summary title=\"Switch project\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" \
             stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M3 5l3 3 3-3\"/></svg></summary>\
             <div class=\"ctx-switcher-dropdown\">",
        );
        for sib in &ctx.siblings {
            s.push_str(&format!(
                "<div class=\"ctx-switcher-item\">\
                 <span class=\"ctx-switcher-name\">{}</span>\
                 <code class=\"ctx-switcher-cmd\">rivet -p {} serve -P {}</code>\
                 </div>",
                html_escape(&sib.name),
                html_escape(&sib.rel_path),
                ctx.port,
            ));
        }
        s.push_str("</div></details></span>");
        s
    };
    let context_bar = format!(
        "<div class=\"context-bar\">\
         <span class=\"ctx-project\">{project}</span>{switcher_html}\
         <span class=\"ctx-sep\">/</span>\
         <span>{path}</span>\
         {git_html}\
         <span class=\"ctx-time\">Loaded {loaded_at}</span>\
         <button hx-post=\"/reload\" style=\"margin-left:.5rem;padding:.15rem .5rem;font-size:.72rem;\
         font-family:var(--mono);background:rgba(58,134,255,.08);color:var(--accent);border:1px solid var(--accent);\
         border-radius:4px;cursor:pointer;font-weight:600;transition:all var(--transition)\"\
         title=\"Reload project from disk\"\
         onmouseover=\"this.style.background='rgba(58,134,255,.18)'\"\
         onmouseout=\"this.style.background='rgba(58,134,255,.08)'\"\
         >&#8635; Reload</button>\
         <button onclick=\"var h=window.location.href;var s=h.indexOf('?')>=0?'&amp;':'?';window.open(h+s+'print=1','_blank')\" \
         style=\"padding:.15rem .5rem;font-size:.72rem;\
         font-family:var(--mono);background:rgba(58,134,255,.08);color:var(--accent);border:1px solid var(--accent);\
         border-radius:4px;cursor:pointer;font-weight:600;transition:all var(--transition)\"\
         title=\"Open printable view in new tab\"\
         onmouseover=\"this.style.background='rgba(58,134,255,.18)'\"\
         onmouseout=\"this.style.background='rgba(58,134,255,.08)'\"\
         >&#128438; Print</button>\
         </div>",
        project = html_escape(&ctx.project_name),
        path = html_escape(&ctx.project_path),
        loaded_at = html_escape(&ctx.loaded_at),
    );
    Html(format!(
        r##"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rivet Dashboard</title>
<style>{fonts_css}{css}</style>
<script src="/assets/htmx.js"></script>
<script src="/assets/mermaid.js"></script>
<script>
mermaid.initialize({{startOnLoad:false,theme:'neutral',securityLevel:'strict'}});
function renderMermaid(){{mermaid.run({{querySelector:'.mermaid'}}).catch(function(){{}})}}
document.addEventListener('htmx:afterSwap',renderMermaid);
document.addEventListener('DOMContentLoaded',renderMermaid);
</script>
</head>
<body>
<a href="#content" class="skip-link">Skip to content</a>
<div id="loading-bar"></div>
<div class="shell">
<nav role="navigation" aria-label="Main navigation">
  <h1>Rivet</h1>
  <ul>
    <li><a hx-get="/stats" hx-target="#content" hx-push-url="true" href="/stats" class="active"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1.5" y="1.5" width="5" height="5" rx="1"/><rect x="9.5" y="1.5" width="5" height="5" rx="1"/><rect x="1.5" y="9.5" width="5" height="5" rx="1"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg></span> Overview</span></a></li>
    <li><a hx-get="/artifacts" hx-target="#content" hx-push-url="true" href="/artifacts"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="1.5" width="10" height="13" rx="1.5"/><path d="M6 5h4M6 8h4M6 11h2"/></svg></span> Artifacts</span><span class="nav-badge">{artifact_count}</span></a></li>
    <li><a hx-get="/validate" hx-target="#content" hx-push-url="true" href="/validate"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M5.5 8l2 2 3.5-3.5"/></svg></span> Validation</span>{error_badge}</a></li>
    <li class="nav-divider"></li>
    <li><a hx-get="/matrix" hx-target="#content" hx-push-url="true" href="/matrix"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M1.5 5.5h13M1.5 10.5h13M5.5 1.5v13M10.5 1.5v13"/><rect x="1.5" y="1.5" width="13" height="13" rx="1.5"/></svg></span> Matrix</span></a></li>
    <li><a hx-get="/coverage" hx-target="#content" hx-push-url="true" href="/coverage"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M8 1.5V8l4.6 4.6"/></svg></span> Coverage</span></a></li>
    <li><a hx-get="/traceability" hx-target="#content" hx-push-url="true" href="/traceability"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4h2v2H3zM7 4h2v2H7zM11 4h2v2H11zM3 10h2v2H3zM11 10h2v2H11z"/><path d="M5 5h2M9 5h2M4 6v4M12 6v4M5 11h6"/></svg></span> Traceability</span></a></li>
    <li><a hx-get="/graph" hx-target="#content" hx-push-url="true" href="/graph"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="4" cy="4" r="2"/><circle cx="12" cy="4" r="2"/><circle cx="4" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><path d="M6 4h4M4 6v4M12 6v4M6 12h4"/></svg></span> Graph</span></a></li>
    <li><a hx-get="/documents" hx-target="#content" hx-push-url="true" href="/documents"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 1.5H4.5A1.5 1.5 0 003 3v10a1.5 1.5 0 001.5 1.5h7A1.5 1.5 0 0013 13V5.5L9 1.5z"/><path d="M9 1.5V5.5h4"/><path d="M6 8.5h4M6 11h2"/></svg></span> Documents</span>{doc_badge}</a></li>
    <li><a hx-get="/doc-linkage" hx-target="#content" hx-push-url="true" href="/doc-linkage"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="1" width="5" height="6" rx="1"/><rect x="10" y="1" width="5" height="6" rx="1"/><rect x="5.5" y="9" width="5" height="6" rx="1"/><path d="M3.5 7v2.5h4.5M12.5 7v2.5h-4.5"/></svg></span> Doc Linkage</span></a></li>
    <li><a hx-get="/source" hx-target="#content" hx-push-url="true" href="/source"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 4.5 1.5 8 5 11.5"/><polyline points="11 4.5 14.5 8 11 11.5"/><line x1="9" y1="2" x2="7" y2="14"/></svg></span> Source</span></a></li>
    <li class="nav-divider"></li>
    <li><a hx-get="/verification" hx-target="#content" hx-push-url="true" href="/verification"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M8 1.5l5.5 2.5v4c0 3.5-2.5 5.5-5.5 7-3-1.5-5.5-3.5-5.5-7V4z"/><path d="M5.5 8l2 2 3.5-3.5"/></svg></span> Verification</span></a></li>
    {stpa_nav}
    <li><a hx-get="/results" hx-target="#content" hx-push-url="true" href="/results"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12.5h12M3 9.5h2v3H3zM7 6.5h2v6H7zM11 3.5h2v9h-2z"/></svg></span> Results</span>{result_badge}</a></li>
    <li class="nav-divider"></li>
    <li><a hx-get="/diff" hx-target="#content" hx-push-url="true" href="/diff"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v10M10 3v10"/><path d="M2 8h3M11 8h3"/><circle cx="6" cy="5" r="1.5"/><circle cx="10" cy="11" r="1.5"/></svg></span> Diff</span></a></li>
    {externals_nav}
    <li class="nav-divider"></li>
    <li><a hx-get="/help" hx-target="#content" hx-push-url="true" href="/help"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.5"/><path d="M6 6.5a2 2 0 013.5 1.5c0 1-1.5 1.5-1.5 2.5M8 12.5v.01"/></svg></span> Help &amp; Docs</span></a></li>
  </ul>
  <div id="nav-search-hint" class="nav-search-hint">
    <span><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4.5"/><path d="M10.5 10.5L14 14"/></svg></span> Search</span>
    <span class="cmd-k-kbd">&#8984;K</span>
  </div>
</nav>
<div class="content-area">
{context_bar}
<main id="content" role="main" hx-swap="innerHTML transition:true">
{content}
<div class="footer">Powered by Rivet v{version}</div>
</main>
</div>
</div>
<div id="cmd-k-overlay" class="cmd-k-overlay">
  <div class="cmd-k-modal">
    <div class="cmd-k-head">
      <span class="cmd-k-icon">&#128269;</span>
      <input id="cmd-k-input" class="cmd-k-input" type="text" placeholder="Search artifacts, documents..." autocomplete="off" spellcheck="false" aria-label="Search artifacts">
    </div>
    <div id="cmd-k-results" class="cmd-k-results">
      <div class="cmd-k-empty">Type to search artifacts and documents</div>
    </div>
  </div>
</div>
{graph_js}
{search_js}
{aadl_js}
</body>
</html>"##,
        fonts_css = styles::FONTS_CSS,
        css = styles::CSS,
        graph_js = js::GRAPH_JS,
        search_js = js::SEARCH_JS,
        aadl_js = js::AADL_JS,
    ))
}

// ── Print layout ──────────────────────────────────────────────────────────

/// Render content in a minimal printable layout (no nav, no HTMX, no JS).
pub(crate) fn print_layout(content: &str, _state: &AppState) -> Html<String> {
    let version = env!("CARGO_PKG_VERSION");
    Html(format!(
        r##"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rivet Dashboard (Print)</title>
<style>{FONTS_CSS}{CSS}</style>
<style>
  @media print {{ nav, .context-bar, .nav-search-hint, #cmd-k-overlay, #loading-bar, .graph-controls, .svg-viewer-toolbar {{ display: none !important; }} main {{ padding: 1rem; max-width: 100%; }} .shell {{ display: block; }} }}
  body {{ background: #fff; color: #1a1a2e; }}
  .shell {{ display: block; }}
  nav, .context-bar, #cmd-k-overlay, #loading-bar {{ display: none; }}
  main {{ padding: 1.5rem 2rem; max-width: 100%; }}
</style>
<script src="/assets/mermaid.js"></script>
<script>
mermaid.initialize({{startOnLoad:false,theme:'default',securityLevel:'strict'}});
document.addEventListener('DOMContentLoaded',function(){{mermaid.run({{querySelector:'.mermaid'}}).catch(function(){{}});}});
</script>
</head>
<body>
<main>
{content}
<div class="footer">Powered by Rivet v{version} &mdash; printed view</div>
</main>
</body>
</html>"##,
        FONTS_CSS = styles::FONTS_CSS,
        CSS = styles::CSS,
    ))
}

/// Embed layout — no sidebar, no context bar, just content with HTMX.
/// Used when the dashboard is embedded in VS Code WebView.
pub(crate) fn embed_layout(content: &str, _state: &AppState) -> Html<String> {
    let version = env!("CARGO_PKG_VERSION");
    Html(format!(
        r##"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Rivet</title>
<style>{FONTS_CSS}{CSS}</style>
<style>
  body {{ background: var(--bg); color: var(--text); margin: 0; }}
  main {{ padding: 1rem 1.5rem; max-width: 100%; }}
</style>
<script src="/assets/htmx.js"></script>
<script src="/assets/mermaid.js"></script>
<script>
mermaid.initialize({{startOnLoad:false,theme:'neutral',securityLevel:'strict'}});
function renderMermaid(){{mermaid.run({{querySelector:'.mermaid'}}).catch(function(){{}})}}
document.addEventListener('htmx:afterSwap',renderMermaid);
document.addEventListener('DOMContentLoaded',renderMermaid);
</script>
</head>
<body>
<main id="content">
{content}
</main>
<div style="padding:.5rem 1.5rem;font-size:.75rem;color:var(--text-secondary)">Rivet v{version}</div>
</body>
</html>"##,
        FONTS_CSS = styles::FONTS_CSS,
        CSS = styles::CSS,
    ))
}
