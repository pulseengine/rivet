// ── Page layout ──────────────────────────────────────────────────────────

use axum::response::Html;
use rivet_core::document::html_escape;
use rivet_core::schema::Severity;

use super::AppState;
use super::js;
use super::styles;

/// Full-page layout with no active variant scope.
#[allow(dead_code)]
pub(crate) fn page_layout(content: &str, state: &AppState) -> Html<String> {
    page_layout_with_variant(content, state, None)
}

/// Render the full page layout, optionally displaying the variant
/// selector + filter banner for the named variant.
///
/// When `active_variant` is `Some`, a banner is injected above the main
/// content showing the scope and a "Clear filter" link. The variant
/// dropdown itself is rendered regardless of whether one is currently
/// active (or hidden entirely if the project has no feature model).
pub(crate) fn page_layout_with_variant(
    content: &str,
    state: &AppState,
    active_variant: Option<&str>,
) -> Html<String> {
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
    let eu_ai_act_loaded = rivet_core::compliance::is_eu_ai_act_loaded(&state.schema);
    let eu_ai_act_count: usize = rivet_core::compliance::EU_AI_ACT_TYPES
        .iter()
        .map(|t| state.store.count_by_type(t))
        .sum();
    let eu_ai_act_nav = if eu_ai_act_loaded {
        let badge = if eu_ai_act_count > 0 {
            format!("<span class=\"nav-badge\">{eu_ai_act_count}</span>")
        } else {
            "<span class=\"nav-badge\">0</span>".to_string()
        };
        format!(
            "<li><a hx-get=\"/eu-ai-act\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/eu-ai-act\"><span class=\"nav-label\"><span class=\"nav-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><circle cx=\"8\" cy=\"8\" r=\"6.5\"/><path d=\"M3.5 6h9M3.5 10h9\"/><ellipse cx=\"8\" cy=\"8\" rx=\"3\" ry=\"6.5\"/></svg></span> EU AI Act</span>{badge}</a></li>"
        )
    } else {
        String::new()
    };
    // Variants nav entry: only rendered when a feature model is configured.
    let variants_nav = if state.variants.has_model() {
        let count = state.variants.variants.len();
        format!(
            "<li><a hx-get=\"/variants\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/variants\"><span class=\"nav-label\"><span class=\"nav-icon\"><svg width=\"16\" height=\"16\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2 4h12l-4.5 5v4l-3 1.5V9z\"/></svg></span> Variants</span><span class=\"nav-badge\">{count}</span></a></li>"
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
    // Variant selector: only rendered when the project has a feature model.
    let variant_selector_html = if state.variants.has_model() {
        let mut s = String::from(
            "<span class=\"ctx-sep\">/</span>\
             <select id=\"variant-selector\" name=\"variant\" \
             onchange=\"(function(sel){var u=new URL(window.location.href);\
             if(sel.value){u.searchParams.set('variant',sel.value)}else{u.searchParams.delete('variant')}\
             window.location.href=u.toString()})(this)\" \
             style=\"padding:.2rem .5rem;font-size:.72rem;font-family:var(--mono);\
             background:var(--surface);color:var(--text);border:1px solid var(--border);\
             border-radius:4px;max-width:220px\" \
             title=\"Filter the dashboard to a variant scope\">",
        );
        let none_sel = if active_variant.is_none() {
            " selected"
        } else {
            ""
        };
        s.push_str(&format!(
            "<option value=\"\"{none_sel}>Unscoped (all artifacts)</option>"
        ));
        for v in &state.variants.variants {
            let sel = if active_variant == Some(v.name.as_str()) {
                " selected"
            } else {
                ""
            };
            s.push_str(&format!(
                "<option value=\"{val}\"{sel}>variant: {name}</option>",
                val = html_escape(&v.name),
                name = html_escape(&v.name),
            ));
        }
        s.push_str("</select>");
        // Link to the /variants overview page — lets the user discover and
        // jump into any variant without hunting the dropdown.
        s.push_str(
            "<a hx-get=\"/variants\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/variants\" \
             style=\"margin-left:.25rem;padding:.15rem .5rem;font-size:.72rem;\
             font-family:var(--mono);background:transparent;color:var(--text-secondary);\
             border:1px solid var(--border);border-radius:4px;text-decoration:none\" \
             title=\"See all declared variants\">variants</a>",
        );
        s
    } else {
        String::new()
    };

    let context_bar = format!(
        "<div class=\"context-bar\">\
         <span class=\"ctx-project\">{project}</span>{switcher_html}\
         <span class=\"ctx-sep\">/</span>\
         <span>{path}</span>\
         {git_html}\
         {variant_selector_html}\
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
    // Variant banner: rendered above the content when a variant filter is
    // active. Combines the scope summary with a "Clear filter" link that
    // removes the `?variant` query param from the current URL.
    //
    // NOTE: JS below (variant-sync script) keeps the dropdown in sync with
    // the URL after HTMX navigations, and reloads the page when the URL's
    // variant param no longer matches the banner content — so the banner
    // reflects the currently active scope even after in-place swaps.
    let variant_banner = render_variant_banner(state, active_variant);

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

// Variant selector sync: after HTMX pushes a new URL, re-check `?variant=`
// and either update the dropdown selection or reload the page so the
// banner is recomputed server-side.
(function(){{
  function getUrlVariant(){{return new URL(window.location.href).searchParams.get('variant')||''}}
  function getDropdownVariant(){{var s=document.getElementById('variant-selector');return s?s.value:''}}
  function sync(){{
    var url=getUrlVariant(), drop=getDropdownVariant();
    if(url===drop) return;
    // Mismatch: if there's a banner rendered server-side, the truth
    // lives in the URL, so reload to refresh the banner.  Otherwise
    // we can safely just update the dropdown client-side.
    var banner=document.querySelector('.variant-banner');
    if(banner){{
      window.location.reload();
    }} else {{
      var s=document.getElementById('variant-selector');
      if(s){{s.value=url}}
    }}
  }}
  document.addEventListener('htmx:afterSettle',sync);
  document.addEventListener('htmx:pushedIntoHistory',sync);
}})();
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
    {eu_ai_act_nav}
    <li><a hx-get="/results" hx-target="#content" hx-push-url="true" href="/results"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12.5h12M3 9.5h2v3H3zM7 6.5h2v6H7zM11 3.5h2v9h-2z"/></svg></span> Results</span>{result_badge}</a></li>
    <li class="nav-divider"></li>
    <li><a hx-get="/diff" hx-target="#content" hx-push-url="true" href="/diff"><span class="nav-label"><span class="nav-icon"><svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3v10M10 3v10"/><path d="M2 8h3M11 8h3"/><circle cx="6" cy="5" r="1.5"/><circle cx="10" cy="11" r="1.5"/></svg></span> Diff</span></a></li>
    {externals_nav}
    {variants_nav}
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
{variant_banner}
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

// ── Variant banner + overview ─────────────────────────────────────────────

/// Render the "Filtered to variant: X (N of M artifacts shown)" banner
/// injected above the main content when a variant filter is active.
///
/// Returns an empty string when no variant is selected or when the
/// selected variant is unknown/unresolvable (so the user gets a clean
/// page; the `/variants` page surfaces the error explicitly).
fn render_variant_banner(state: &AppState, active_variant: Option<&str>) -> String {
    let Some(name) = active_variant else {
        return String::new();
    };
    if !state.variants.has_model() {
        return format!(
            "<div class=\"variant-banner variant-banner-err\" role=\"alert\" \
             style=\"margin:.75rem 2rem 0 2rem;padding:.6rem .9rem;font-size:.82rem;\
             background:#fef3c7;color:#78350f;border:1px solid #f59e0b;border-radius:6px\">\
             <strong>Variant filter ignored:</strong> this project has no feature model. \
             <a href=\"?\" style=\"color:inherit;text-decoration:underline\">Clear filter</a>\
             </div>",
        );
    }
    let total = state.store.len();
    match state.build_variant_scope(name) {
        Ok(Some(scope)) => format!(
            "<div class=\"variant-banner\" role=\"status\" \
             style=\"margin:.75rem 2rem 0 2rem;padding:.6rem .9rem;font-size:.82rem;\
             background:rgba(58,134,255,.08);color:var(--accent);\
             border:1px solid var(--accent);border-radius:6px;\
             display:flex;align-items:center;gap:.75rem;flex-wrap:wrap\">\
             <span><svg width=\"14\" height=\"14\" viewBox=\"0 0 16 16\" fill=\"none\" \
             stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\" \
             stroke-linejoin=\"round\" style=\"vertical-align:middle;margin-right:.35rem\">\
             <path d=\"M2 4h12l-4.5 5v4l-3 1.5V9z\"/></svg>\
             Filtered to variant: <strong>{name}</strong> \
             ({count} of {total} artifacts shown, {feats} features effective)</span>\
             <a id=\"variant-clear\" href=\"{clear_href}\" \
             style=\"margin-left:auto;color:inherit;text-decoration:underline;font-weight:600\" \
             title=\"Remove the variant filter\">Clear filter</a>\
             </div>",
            name = html_escape(&scope.name),
            count = scope.artifact_count,
            total = total,
            feats = scope.feature_count,
            clear_href = "?",
        ),
        Ok(None) => String::new(),
        Err(msg) => format!(
            "<div class=\"variant-banner variant-banner-err\" role=\"alert\" \
             style=\"margin:.75rem 2rem 0 2rem;padding:.6rem .9rem;font-size:.82rem;\
             background:#fee2e2;color:#7f1d1d;border:1px solid #ef4444;border-radius:6px\">\
             <strong>Variant error:</strong> {msg} \
             <a href=\"?\" style=\"color:inherit;text-decoration:underline\">Clear filter</a>\
             </div>",
            msg = html_escape(&msg),
        ),
    }
}

/// Render the `/variants` overview page: a table of every declared
/// variant with its validation status, feature count, and artifact
/// count. Each row links to the scoped view for that variant.
pub(crate) fn render_variants_overview(state: &AppState) -> String {
    use super::variant::VariantStatus;

    if !state.variants.has_model() {
        return String::from(
            "<div class=\"card\" style=\"margin:2rem\">\
             <h2 style=\"margin-top:0\">Variants</h2>\
             <p>This project has no feature model. Run \
             <code>rivet variant init</code> to scaffold one, or place a \
             <code>feature-model.yaml</code> under <code>artifacts/</code>.</p>\
             <p style=\"color:var(--text-muted)\">See the \
             <a href=\"/help/docs/variants\" hx-get=\"/help/docs/variants\" \
             hx-target=\"#content\" hx-push-url=\"true\">variant documentation</a> \
             for details.</p>\
             </div>",
        );
    }

    let total = state.store.len();
    let mut html = String::from(
        "<div style=\"padding:1.5rem 2rem;max-width:1100px\">\
         <h2 style=\"margin-top:0\">Variants</h2>\
         <p style=\"color:var(--text-secondary);margin-bottom:1rem\">\
         Declared variants for this project's feature model. \
         Select one to scope the dashboard to just the artifacts bound to \
         its effective features.</p>",
    );
    if let Some(ref p) = state.variants.model_path {
        html.push_str(&format!(
            "<div style=\"font-size:.78rem;color:var(--text-muted);margin-bottom:.5rem\">\
             Feature model: <code>{}</code></div>",
            html_escape(&p.display().to_string()),
        ));
    }

    if state.variants.variants.is_empty() {
        html.push_str(
            "<div class=\"card\"><p>No variant configurations discovered. \
             Add YAML files to <code>artifacts/variants/</code>.</p></div>",
        );
        html.push_str("</div>");
        return html;
    }

    html.push_str(
        "<table class=\"data-table\" style=\"width:100%;margin-top:.5rem\">\
         <thead><tr>\
         <th>Name</th><th>Status</th><th style=\"text-align:right\">Features</th>\
         <th style=\"text-align:right\">Artifacts</th>\
         <th style=\"text-align:right\">% of total</th><th>Actions</th>\
         </tr></thead><tbody>",
    );

    for v in &state.variants.variants {
        let status = state.variants.validation_status(&v.name);
        let (status_label, status_style, feature_count, artifact_count) = match &status {
            VariantStatus::Pass {
                feature_count,
                artifact_count,
            } => (
                "PASS".to_string(),
                "color:#065f46;background:#d1fae5;padding:.15rem .5rem;border-radius:4px;font-weight:700",
                *feature_count as i64,
                *artifact_count as i64,
            ),
            VariantStatus::Fail(_) => (
                "FAIL".to_string(),
                "color:#7f1d1d;background:#fee2e2;padding:.15rem .5rem;border-radius:4px;font-weight:700",
                -1,
                -1,
            ),
            VariantStatus::Missing => (
                "missing".to_string(),
                "color:#78350f;background:#fef3c7;padding:.15rem .5rem;border-radius:4px",
                -1,
                -1,
            ),
            VariantStatus::NoModel => (
                "no model".to_string(),
                "color:var(--text-muted)",
                -1,
                -1,
            ),
        };
        let pct = if total > 0 && artifact_count > 0 {
            format!("{:.1}%", (artifact_count as f64) * 100.0 / (total as f64))
        } else if artifact_count == 0 {
            "0.0%".to_string()
        } else {
            "—".to_string()
        };
        let feat_disp = if feature_count >= 0 {
            feature_count.to_string()
        } else {
            "—".to_string()
        };
        let art_disp = if artifact_count >= 0 {
            artifact_count.to_string()
        } else {
            "—".to_string()
        };

        html.push_str(&format!(
            "<tr>\
             <td><strong>{name}</strong></td>\
             <td><span style=\"{status_style}\">{status_label}</span></td>\
             <td style=\"text-align:right;font-variant-numeric:tabular-nums\">{feat_disp}</td>\
             <td style=\"text-align:right;font-variant-numeric:tabular-nums\">{art_disp}</td>\
             <td style=\"text-align:right;font-variant-numeric:tabular-nums\">{pct}</td>\
             <td>\
               <a href=\"/stats?variant={v_enc}\" \
                  hx-get=\"/stats?variant={v_enc}\" hx-target=\"#content\" hx-push-url=\"true\" \
                  style=\"font-size:.78rem;margin-right:.5rem\">scope dashboard</a>\
               <a href=\"/coverage?variant={v_enc}\" \
                  hx-get=\"/coverage?variant={v_enc}\" hx-target=\"#content\" hx-push-url=\"true\" \
                  style=\"font-size:.78rem;margin-right:.5rem\">coverage</a>\
               <a href=\"/artifacts?variant={v_enc}\" \
                  hx-get=\"/artifacts?variant={v_enc}\" hx-target=\"#content\" hx-push-url=\"true\" \
                  style=\"font-size:.78rem\">artifacts</a>\
             </td>\
             </tr>",
            name = html_escape(&v.name),
            v_enc = urlencoding::encode(&v.name),
        ));

        if let VariantStatus::Fail(errs) = status {
            let msg = errs.join("; ");
            html.push_str(&format!(
                "<tr><td colspan=\"6\" style=\"font-size:.78rem;color:#7f1d1d;\
                 background:#fef2f2;padding:.4rem .75rem\">{}</td></tr>",
                html_escape(&msg),
            ));
        }
    }
    html.push_str("</tbody></table>");
    html.push_str("</div>");
    html
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
