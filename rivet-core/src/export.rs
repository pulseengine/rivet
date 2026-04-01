//! Static HTML report generation for audit evidence and publishing.
//!
//! Renders self-contained HTML pages (index, requirements, documents,
//! matrix, coverage, validation) plus individual document pages and a
//! single-page combined variant.  Each page embeds its own CSS and
//! requires no external resources.
//!
//! Features:
//! - Documents page: renders markdown docs with resolved `[[ID]]` links
//!   and `{{artifact:ID}}` embeds as static HTML
//! - Version switcher: dropdown for switching between deployed versions
//! - Homepage link: back-navigation to a project portal
//!
//! Supports PulseEngine dark theme (default) and a light theme for printing.
//! All inter-page links are relative, suitable for static hosting.

use std::collections::{BTreeMap, HashMap};
use std::fmt::Write as _;

use crate::coverage;
use crate::document::{self, ArtifactInfo, DocumentStore};
use crate::links::LinkGraph;
use crate::results::ResultStore;
use crate::schema::{Schema, Severity};
use crate::store::Store;
use crate::validate::Diagnostic;

// ── Configuration ────────────────────────────────────────────────────────

/// Theme selector for exported reports.
#[derive(Debug, Clone, Copy, PartialEq, Eq, Default)]
pub enum ExportTheme {
    /// PulseEngine dark theme (default).
    #[default]
    Dark,
    /// Clean light theme for printing and PDF generation.
    Light,
}

/// A version entry for the version switcher dropdown (used in config.js).
#[derive(Debug, Clone)]
pub struct VersionEntry {
    /// Label shown in the dropdown (e.g. "v0.1.0").
    pub label: String,
    /// Relative path to the version root (e.g. "../v0.1.0/").
    pub path: String,
}

/// Configuration for HTML export rendering.
///
/// Deployment-specific settings (homepage, version label, version switcher
/// entries) are written to a separate `config.js` file so that the HTML
/// can be generated once and deployed anywhere without rebuilding.
#[derive(Debug, Clone, Default)]
pub struct ExportConfig {
    /// Visual theme.
    pub theme: ExportTheme,
    /// When true, skip Google Fonts import and use system fonts only.
    pub offline: bool,
}

// ── Runtime config.js generation ────────────────────────────────────────

/// Generate the contents of `config.js` for deployment-time configuration.
///
/// This file is loaded by each HTML page and populates the homepage link
/// and version switcher at DOMContentLoaded.  Deployers can edit it
/// without rebuilding the HTML.
pub fn generate_config_js(
    homepage: Option<&str>,
    version_label: &str,
    versions: &[VersionEntry],
    project_name: &str,
) -> String {
    let mut out = String::from(
        "// Rivet Export Configuration\n\
         // Edit this file to customize the deployment. No rebuild needed.\n\
         var RIVET_EXPORT = {\n",
    );

    // homepage
    writeln!(
        out,
        "  // Link back to the project portal (set to \"\" to hide)\n  homepage: \"{}\",",
        js_escape(homepage.unwrap_or("")),
    )
    .unwrap();

    // versionLabel
    writeln!(
        out,
        "\n  // Label shown in the version switcher\n  versionLabel: \"{}\",",
        js_escape(version_label),
    )
    .unwrap();

    // versions array
    out.push_str(
        "\n  // Other versions for the switcher dropdown\n  // Paths are relative to this directory\n  versions: [\n",
    );
    if versions.is_empty() {
        out.push_str("    // { \"label\": \"v0.1.0\", \"path\": \"../v0.1.0/\" },\n");
    } else {
        for v in versions {
            writeln!(
                out,
                "    {{ \"label\": \"{}\", \"path\": \"{}\" }},",
                js_escape(&v.label),
                js_escape(&v.path),
            )
            .unwrap();
        }
    }
    out.push_str("  ],\n");

    // projectName
    writeln!(
        out,
        "\n  // Project display name (shown in homepage back-link)\n  projectName: \"{}\",",
        js_escape(project_name),
    )
    .unwrap();

    // externalCss (commented out by default)
    out.push_str(
        "\n  // Optional: external CSS URL to replace embedded styles\n  // externalCss: \"/main.css\",\n",
    );

    out.push_str("};\n");
    out
}

/// Escape a string for embedding inside a JavaScript string literal.
fn js_escape(s: &str) -> String {
    s.replace('\\', "\\\\")
        .replace('"', "\\\"")
        .replace('\n', "\\n")
        .replace('\r', "\\r")
}

// ── Shared CSS ──────────────────────────────────────────────────────────

/// PulseEngine dark-theme CSS (design tokens from pulseengine.eu).
const DARK_CSS: &str = r#"
:root {
    --bg: #0f1117;
    --bg-card: rgba(26, 29, 39, 0.72);
    --bg-card-solid: #1a1d27;
    --border: #252836;
    --border-hover: #2e3345;
    --text: #e1e4ed;
    --text-muted: #8b90a0;
    --text-dim: #5c6070;
    --accent: #6c8cff;
    --accent-hover: #a9bcff;
    --green: #4ade80;
    --amber: #fbbf24;
    --cyan: #22d3ee;
    --purple: #c084fc;
    --red: #f87171;
    --font: "Atkinson Hyperlegible Next", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --font-mono: "Atkinson Hyperlegible Mono", "Fira Code", monospace;
    --radius: 12px;
    --radius-sm: 6px;
}
"#;

/// Light theme CSS for clean printing and PDF generation.
const LIGHT_CSS: &str = r#"
:root {
    --bg: #ffffff;
    --bg-card: rgba(245, 245, 250, 0.72);
    --bg-card-solid: #f5f5fa;
    --border: #d4d4e0;
    --border-hover: #b4b4c0;
    --text: #1a1a2e;
    --text-muted: #6c6c8a;
    --text-dim: #9c9cb0;
    --accent: #2563eb;
    --accent-hover: #1d4ed8;
    --green: #16a34a;
    --amber: #ca8a04;
    --cyan: #0891b2;
    --purple: #9333ea;
    --red: #dc2626;
    --font: "Atkinson Hyperlegible Next", -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
    --font-mono: "Atkinson Hyperlegible Mono", "Fira Code", monospace;
    --radius: 12px;
    --radius-sm: 6px;
}
"#;

/// Offline font-stack override — no Google Fonts, system-only.
const OFFLINE_FONT_OVERRIDE: &str = r#"
:root {
    --font: -apple-system, BlinkMacSystemFont, system-ui, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}
"#;

/// Google Fonts import for Atkinson Hyperlegible.
const GOOGLE_FONTS_IMPORT: &str = r#"@import url('https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:ital,wght@0,400;0,600;0,700;1,400&family=Atkinson+Hyperlegible+Mono:wght@400;700&display=swap');"#;

/// Structural CSS shared by all themes.
const STRUCTURAL_CSS: &str = r#"
* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 15px; }
body {
    font-family: var(--font);
    color: var(--text);
    background: var(--bg);
    line-height: 1.6;
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem 1.5rem;
}
h1 { font-size: 1.8rem; margin-bottom: 0.5rem; }
h2 { font-size: 1.4rem; margin-top: 2rem; margin-bottom: 0.75rem; border-bottom: 2px solid var(--border); padding-bottom: 0.3rem; }
h3 { font-size: 1.15rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
a { color: var(--accent); text-decoration: none; }
a:hover { color: var(--accent-hover); text-decoration: underline; }
p { margin-bottom: 0.75rem; }
nav {
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 0.75rem 1rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
}
nav .nav-title { font-weight: 600; color: var(--text); margin-right: 0.5rem; }
nav a { font-weight: 500; }
main { min-height: 60vh; }
footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: 0.85rem;
    color: var(--text-muted);
}
table {
    width: 100%;
    border-collapse: collapse;
    margin: 1rem 0;
    font-size: 0.9rem;
}
th, td {
    padding: 0.5rem 0.75rem;
    border: 1px solid var(--border);
    text-align: left;
}
th { background: var(--bg-card-solid); font-weight: 600; }
tr:nth-child(even) td { background: var(--bg-card); }
.badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.badge-ok, .badge-approved, .badge-green { background: rgba(74, 222, 128, 0.12); color: var(--green); }
.badge-warn, .badge-draft, .badge-yellow { background: rgba(251, 191, 36, 0.12); color: var(--amber); }
.badge-error, .badge-obsolete, .badge-red { background: rgba(248, 113, 113, 0.12); color: var(--red); }
.badge-info { background: rgba(108, 140, 255, 0.12); color: var(--accent); }
.badge-default { background: var(--bg-card-solid); color: var(--text-muted); }
.severity-error { color: var(--red); font-weight: 600; }
.severity-warning { color: var(--amber); font-weight: 600; }
.severity-info { color: var(--accent); font-weight: 600; }
.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
}
.summary-card {
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
}
.summary-card .label { font-size: 0.85rem; color: var(--text-muted); }
.summary-card .value { font-size: 1.6rem; font-weight: 700; }
.artifact-section {
    margin-bottom: 1.5rem;
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.5rem;
}
.artifact-section .artifact-id { font-family: var(--font-mono); font-weight: 600; }
.artifact-section .artifact-meta { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.5rem; }
.tag { display: inline-block; background: rgba(108, 140, 255, 0.12); color: var(--accent); padding: 0.1rem 0.4rem; border-radius: var(--radius-sm); font-size: 0.8rem; margin-right: 0.25rem; }
.cell-green { background: rgba(74, 222, 128, 0.12) !important; }
.cell-yellow { background: rgba(251, 191, 36, 0.12) !important; }
.cell-red { background: rgba(248, 113, 113, 0.12) !important; }
.toc { column-count: 2; column-gap: 2rem; margin: 1rem 0; }
.toc-item { break-inside: avoid; margin-bottom: 0.25rem; }
.toc-item a { font-family: var(--font-mono); font-size: 0.9rem; }
ul.diag-list { list-style: none; padding: 0; }
ul.diag-list li { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); }
ul.diag-list li:last-child { border-bottom: none; }
.diag-rule { font-family: var(--font-mono); font-size: 0.8rem; color: var(--text-muted); }
.export-header { margin-bottom: 2rem; }
.export-header nav { display: flex; align-items: center; gap: 1rem; flex-wrap: wrap; }
.home-link { font-weight: 600; white-space: nowrap; }
.version-switcher select {
    font-family: var(--font);
    font-size: 0.85rem;
    background: var(--bg-card-solid);
    color: var(--text);
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 0.25rem 0.5rem;
    cursor: pointer;
}
.nav-links { display: flex; gap: 1rem; flex-wrap: wrap; align-items: center; }
.nav-links a { font-weight: 500; }
.doc-card {
    margin-bottom: 1rem;
    background: var(--bg-card);
    backdrop-filter: blur(12px);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 1.25rem;
}
.doc-card .doc-meta { font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.25rem; }
.doc-card h3 a { color: var(--text); }
.doc-card h3 a:hover { color: var(--accent); }
.doc-body h1 { font-size: 1.6rem; margin-top: 1.5rem; margin-bottom: 0.5rem; }
.doc-body h2 { font-size: 1.3rem; }
.doc-body h3 { font-size: 1.1rem; }
.doc-body blockquote { border-left: 3px solid var(--accent); padding-left: 1rem; margin: 0.75rem 0; color: var(--text-muted); }
.doc-body pre { background: var(--bg-card-solid); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem; overflow-x: auto; margin: 0.75rem 0; }
.doc-body code { font-family: var(--font-mono); font-size: 0.9em; }
.doc-body .artifact-ref { color: var(--accent); font-family: var(--font-mono); font-weight: 600; }
.doc-body .artifact-ref.broken { color: var(--red); text-decoration: line-through; }
.doc-body .artifact-embed { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--radius-sm); padding: 1rem; margin: 0.75rem 0; }

@media print {
    :root {
        --bg: #ffffff;
        --bg-card: #ffffff;
        --bg-card-solid: #f5f5fa;
        --border: #d4d4e0;
        --text: #1a1a2e;
        --text-muted: #6c6c8a;
        --accent: #2563eb;
        --green: #16a34a;
        --amber: #ca8a04;
        --red: #dc2626;
    }
    nav, .export-header { display: none; }
    body { max-width: none; padding: 0.5cm; font-size: 10pt; }
    .artifact-section { break-inside: avoid; backdrop-filter: none; background: #ffffff; }
    .summary-card { backdrop-filter: none; background: #f5f5fa; }
    table { font-size: 9pt; }
    h2 { break-after: avoid; }
    footer { font-size: 8pt; }
    a { color: inherit; text-decoration: none; }
    tr:nth-child(even) td { background: none !important; }
    .cell-green, .cell-yellow, .cell-red { background: none !important; }
}
"#;

fn build_css(config: &ExportConfig) -> String {
    let mut css = String::new();

    // Google Fonts import (only when online)
    if !config.offline {
        css.push_str(GOOGLE_FONTS_IMPORT);
        css.push('\n');
    }

    // Theme variables
    match config.theme {
        ExportTheme::Dark => css.push_str(DARK_CSS),
        ExportTheme::Light => css.push_str(LIGHT_CSS),
    }

    // Offline font override
    if config.offline {
        css.push_str(OFFLINE_FONT_OVERRIDE);
    }

    // Structural styles
    css.push_str(STRUCTURAL_CSS);

    css
}

// ── Page structure helpers ──────────────────────────────────────────────

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

/// Inline script that reads `window.RIVET_EXPORT` (from config.js) and
/// populates the nav bar placeholders at DOMContentLoaded.
const CONFIG_RUNTIME_SCRIPT: &str = r#"
<script>
document.addEventListener('DOMContentLoaded', function() {
  var cfg = window.RIVET_EXPORT || {};
  if (cfg.externalCss) {
    var styles = document.querySelectorAll('style');
    styles.forEach(function(s) { s.remove(); });
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = cfg.externalCss;
    document.head.appendChild(link);
  }
  var homeEl = document.getElementById('home-link');
  if (homeEl && cfg.homepage) {
    homeEl.href = cfg.homepage;
    homeEl.textContent = '\u{2190} ' + (cfg.projectName || 'Home');
    homeEl.style.display = '';
  }
  var sel = document.getElementById('version-select');
  if (sel && cfg.versionLabel) {
    sel.options[0].textContent = cfg.versionLabel;
  }
  if (sel && cfg.versions && cfg.versions.length > 0) {
    cfg.versions.forEach(function(v) {
      var opt = document.createElement('option');
      opt.value = v.path;
      opt.textContent = v.label;
      sel.appendChild(opt);
    });
    sel.parentElement.style.display = '';
  }
});
</script>
"#;

fn page_header(title: &str, config: &ExportConfig, is_single_page: bool) -> String {
    if is_single_page {
        return String::new();
    }
    let css = build_css(config);
    format!(
        "<!DOCTYPE html>\n\
         <html lang=\"en\">\n\
         <head>\n\
         <meta charset=\"utf-8\">\n\
         <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\
         <title>{title} — Rivet Export</title>\n\
         <style>{css}</style>\n\
         <script src=\"./config.js\"></script>\n\
         {runtime}\
         {mermaid}\
         </head>\n\
         <body>\n",
        title = html_escape(title),
        runtime = CONFIG_RUNTIME_SCRIPT,
        mermaid = if config.offline {
            ""
        } else {
            "<script type=\"module\">\
             import mermaid from 'https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs';\
             mermaid.initialize({startOnLoad:true,theme:'dark',securityLevel:'strict'});\
             </script>"
        },
    )
}

fn nav_bar(active: &str, _config: &ExportConfig, is_single_page: bool) -> String {
    let pages = [
        ("index", "Overview", "index.html"),
        ("requirements", "Requirements", "requirements.html"),
        ("documents", "Documents", "documents.html"),
        ("stpa", "STPA", "stpa.html"),
        ("matrix", "Matrix", "matrix.html"),
        ("coverage", "Coverage", "coverage.html"),
        ("validation", "Validation", "validation.html"),
        ("graph", "Graph", "graph.html"),
        ("source", "Source", "source.html"),
        ("results", "Results", "results.html"),
    ];

    let mut out = String::from("<header class=\"export-header\">\n<nav>\n");

    // Homepage back-link — hidden placeholder, populated by config.js at runtime
    out.push_str(
        "  <a id=\"home-link\" href=\"\" class=\"home-link\" style=\"display:none\"></a>\n",
    );

    // Version switcher — hidden placeholder, populated by config.js at runtime
    out.push_str("  <div class=\"version-switcher\" style=\"display:none\">\n");
    out.push_str(
        "    <select id=\"version-select\" onchange=\"if(this.value)location.href=this.value\">\n",
    );
    out.push_str("      <option value=\"\" selected>dev</option>\n");
    out.push_str("    </select>\n");
    out.push_str("  </div>\n");

    // Navigation links — all relative
    out.push_str("  <div class=\"nav-links\">\n");
    for (id, label, filename) in &pages {
        if *id == active {
            writeln!(out, "    <strong>{label}</strong>").unwrap();
        } else if is_single_page {
            writeln!(out, "    <a href=\"#{id}\">{label}</a>").unwrap();
        } else {
            writeln!(out, "    <a href=\"./{filename}\">{label}</a>").unwrap();
        }
    }
    out.push_str("  </div>\n");

    out.push_str("</nav>\n</header>\n");
    out
}

fn page_footer(version: &str, timestamp: &str, is_single_page: bool) -> String {
    let footer = format!(
        "<footer>Generated by Rivet {version} at {timestamp}</footer>\n",
        version = html_escape(version),
        timestamp = html_escape(timestamp),
    );
    if is_single_page {
        footer
    } else {
        format!("{footer}</body>\n</html>\n")
    }
}

fn status_badge(status: Option<&str>) -> String {
    match status {
        Some(s) => {
            let class = match s {
                "approved" => "badge-approved",
                "draft" => "badge-draft",
                "obsolete" => "badge-obsolete",
                _ => "badge-default",
            };
            format!("<span class=\"badge {class}\">{}</span>", html_escape(s))
        }
        None => String::new(),
    }
}

fn severity_icon(sev: &Severity) -> &'static str {
    match sev {
        Severity::Error => "&#x2718;",   // heavy ballot X
        Severity::Warning => "&#x26A0;", // warning sign
        Severity::Info => "&#x2139;",    // info
    }
}

fn severity_class(sev: &Severity) -> &'static str {
    match sev {
        Severity::Error => "severity-error",
        Severity::Warning => "severity-warning",
        Severity::Info => "severity-info",
    }
}

fn timestamp_now() -> String {
    // Simple UTC timestamp without pulling in chrono.
    let now = std::time::SystemTime::now();
    let duration = now
        .duration_since(std::time::UNIX_EPOCH)
        .unwrap_or_default();
    let secs = duration.as_secs();
    // Rough UTC breakdown (no leap-second handling, fine for reports).
    let days = secs / 86400;
    let time_secs = secs % 86400;
    let hours = time_secs / 3600;
    let minutes = (time_secs % 3600) / 60;
    let seconds = time_secs % 60;

    // Compute year/month/day from days since epoch.
    let (year, month, day) = epoch_days_to_ymd(days);
    format!("{year:04}-{month:02}-{day:02}T{hours:02}:{minutes:02}:{seconds:02}Z")
}

fn epoch_days_to_ymd(mut days: u64) -> (u64, u64, u64) {
    // Algorithm from Howard Hinnant's civil_from_days.
    days += 719_468;
    let era = days / 146_097;
    let doe = days - era * 146_097;
    let yoe = (doe - doe / 1460 + doe / 36524 - doe / 146_096) / 365;
    let y = yoe + era * 400;
    let doy = doe - (365 * yoe + yoe / 4 - yoe / 100);
    let mp = (5 * doy + 2) / 153;
    let d = doy - (153 * mp + 2) / 5 + 1;
    let m = if mp < 10 { mp + 3 } else { mp - 9 };
    let y = if m <= 2 { y + 1 } else { y };
    (y, m, d)
}

// ── Renderers ───────────────────────────────────────────────────────────

/// Render the index / dashboard page.
pub fn render_index(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    diagnostics: &[Diagnostic],
    project_name: &str,
    version: &str,
    config: &ExportConfig,
) -> String {
    let timestamp = timestamp_now();
    let is_single_page = false;

    let mut out = page_header(&format!("{project_name} — Index"), config, is_single_page);
    out.push_str(&nav_bar("index", config, is_single_page));

    writeln!(out, "<main>").unwrap();
    writeln!(out, "<h1>{}</h1>", html_escape(project_name)).unwrap();
    writeln!(out, "<p>Generated at {timestamp} by Rivet {version}</p>").unwrap();

    // Summary cards
    let total = store.len();
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();

    let coverage_report = coverage::compute_coverage(store, schema, graph);
    let overall_cov = coverage_report.overall_coverage();

    out.push_str("<div class=\"summary-grid\">\n");
    writeln!(
        out,
        "<div class=\"summary-card\"><div class=\"label\">Artifacts</div>\
         <div class=\"value\">{total}</div></div>"
    )
    .unwrap();

    // Validation status
    let (val_label, val_class) = if errors > 0 {
        (format!("{errors} errors"), "severity-error")
    } else if warnings > 0 {
        (format!("{warnings} warnings"), "severity-warning")
    } else {
        ("PASS".to_string(), "")
    };
    writeln!(
        out,
        "<div class=\"summary-card\"><div class=\"label\">Validation</div>\
         <div class=\"value {val_class}\">{val_label}</div></div>"
    )
    .unwrap();

    // Coverage
    let cov_class = if overall_cov >= 100.0 - f64::EPSILON {
        "badge-green"
    } else if overall_cov > 0.0 {
        "badge-yellow"
    } else {
        "badge-red"
    };
    writeln!(
        out,
        "<div class=\"summary-card\"><div class=\"label\">Coverage</div>\
         <div class=\"value\"><span class=\"badge {cov_class}\">{overall_cov:.1}%</span>\
         </div></div>"
    )
    .unwrap();
    out.push_str("</div>\n");

    // Type breakdown table
    out.push_str(
        "<h2>Artifacts by Type</h2>\n\
         <table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>\n",
    );
    let mut types: Vec<&str> = store.types().collect();
    types.sort();
    for t in &types {
        writeln!(
            out,
            "<tr><td>{}</td><td>{}</td></tr>",
            html_escape(t),
            store.count_by_type(t)
        )
        .unwrap();
    }
    writeln!(out, "<tr><th>Total</th><th>{total}</th></tr>").unwrap();
    out.push_str("</tbody></table>\n");

    // Navigation links
    let req_href = "./requirements.html";
    let docs_href = "./documents.html";
    let stpa_href = "./stpa.html";
    let matrix_href = "./matrix.html";
    let cov_href = "./coverage.html";
    let val_href = "./validation.html";
    let graph_href = "./graph.html";
    let source_href = "./source.html";
    let results_href = "./results.html";

    out.push_str("<h2>Report Pages</h2>\n<ul>\n");
    writeln!(
        out,
        "<li><a href=\"{req_href}\">Requirements Specification</a> \
         &mdash; all artifacts grouped by type</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{docs_href}\">Documents</a> \
         &mdash; specifications, design docs, and plans</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{stpa_href}\">STPA Analysis</a> \
         &mdash; safety and security analysis hierarchy</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{matrix_href}\">Traceability Matrix</a> \
         &mdash; link coverage between types</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{cov_href}\">Coverage Report</a> \
         &mdash; per-rule traceability coverage</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{val_href}\">Validation Report</a> \
         &mdash; diagnostics and rule checks</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{graph_href}\">Traceability Graph</a> \
         &mdash; artifact dependency visualization</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{source_href}\">Source Browser</a> \
         &mdash; artifacts listed by source file</li>"
    )
    .unwrap();
    writeln!(
        out,
        "<li><a href=\"{results_href}\">Test Results</a> \
         &mdash; test run results and pass rates</li>"
    )
    .unwrap();
    out.push_str("</ul>\n");

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render the requirements specification page.
pub fn render_requirements(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    config: &ExportConfig,
) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Requirements Specification", config, is_single_page);
    out.push_str(&nav_bar("requirements", config, is_single_page));

    out.push_str("<main>\n<h1>Requirements Specification</h1>\n");

    // Collect types, sorting so that "requirement" comes first.
    let mut types: Vec<&str> = store.types().collect();
    types.sort_by(|a, b| {
        let pri = |t: &str| -> u8 {
            if t.contains("req") {
                0
            } else if t.contains("design") {
                1
            } else if t.contains("feat") {
                2
            } else {
                3
            }
        };
        pri(a).cmp(&pri(b)).then(a.cmp(b))
    });

    // Table of contents
    out.push_str("<h2>Table of Contents</h2>\n<div class=\"toc\">\n");
    for t in &types {
        let ids = store.by_type(t);
        for id in ids {
            if let Some(art) = store.get(id) {
                writeln!(
                    out,
                    "<div class=\"toc-item\"><a href=\"#art-{id}\">{id}</a> \
                     &mdash; {}</div>",
                    html_escape(&art.title),
                    id = html_escape(id),
                )
                .unwrap();
            }
        }
    }
    out.push_str("</div>\n");

    // Artifacts grouped by type
    for t in &types {
        let type_label = schema
            .artifact_type(t)
            .map(|td| td.description.as_str())
            .unwrap_or(*t);
        writeln!(
            out,
            "<h2>{} <small>({} artifacts)</small></h2>",
            html_escape(t),
            store.count_by_type(t),
        )
        .unwrap();
        if type_label != *t {
            writeln!(out, "<p>{}</p>", html_escape(type_label)).unwrap();
        }

        let ids = store.by_type(t);
        for id in ids {
            let Some(art) = store.get(id) else { continue };
            writeln!(
                out,
                "<div class=\"artifact-section\" id=\"art-{id}\">",
                id = html_escape(id),
            )
            .unwrap();
            writeln!(
                out,
                "<h3><span class=\"artifact-id\">{id}</span> &mdash; {title} {badge}</h3>",
                id = html_escape(id),
                title = html_escape(&art.title),
                badge = status_badge(art.status.as_deref()),
            )
            .unwrap();

            writeln!(
                out,
                "<div class=\"artifact-meta\">Type: {}</div>",
                html_escape(&art.artifact_type)
            )
            .unwrap();

            if let Some(desc) = &art.description {
                writeln!(out, "<p>{}</p>", html_escape(desc)).unwrap();
            }

            // Tags
            if !art.tags.is_empty() {
                out.push_str("<div>");
                for tag in &art.tags {
                    write!(out, "<span class=\"tag\">{}</span> ", html_escape(tag)).unwrap();
                }
                out.push_str("</div>\n");
            }

            // Custom fields
            if !art.fields.is_empty() {
                out.push_str(
                    "<table><thead><tr><th>Field</th><th>Value</th></tr></thead><tbody>\n",
                );
                for (k, v) in &art.fields {
                    let val_str = match v {
                        serde_yaml::Value::String(s) => html_escape(s),
                        other => html_escape(&format!("{other:?}")),
                    };
                    writeln!(
                        out,
                        "<tr><td>{}</td><td>{}</td></tr>",
                        html_escape(k),
                        val_str,
                    )
                    .unwrap();
                }
                out.push_str("</tbody></table>\n");
            }

            // Links
            if !art.links.is_empty() {
                out.push_str("<p><strong>Links:</strong></p><ul>\n");
                for link in &art.links {
                    writeln!(
                        out,
                        "<li>{ltype} &rarr; <a href=\"#art-{target}\">{target}</a></li>",
                        ltype = html_escape(&link.link_type),
                        target = html_escape(&link.target),
                    )
                    .unwrap();
                }
                out.push_str("</ul>\n");
            }

            // Backlinks
            let backlinks = graph.backlinks_to(id);
            if !backlinks.is_empty() {
                out.push_str("<p><strong>Backlinks:</strong></p><ul>\n");
                for bl in backlinks {
                    let inv_label = bl.inverse_type.as_deref().unwrap_or(&bl.link_type);
                    writeln!(
                        out,
                        "<li>{inv} &larr; <a href=\"#art-{src}\">{src}</a></li>",
                        inv = html_escape(inv_label),
                        src = html_escape(&bl.source),
                    )
                    .unwrap();
                }
                out.push_str("</ul>\n");
            }

            out.push_str("</div>\n");
        }
    }

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render the traceability matrix page.
pub fn render_traceability_matrix(
    store: &Store,
    _schema: &Schema,
    graph: &LinkGraph,
    config: &ExportConfig,
) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Traceability Matrix", config, is_single_page);
    out.push_str(&nav_bar("matrix", config, is_single_page));

    out.push_str("<main>\n<h1>Traceability Matrix</h1>\n");
    out.push_str(
        "<p>Cross-type link counts.  Each cell shows how many artifacts of the row type \
         link to at least one artifact of the column type.</p>\n",
    );

    let mut types: Vec<&str> = store.types().collect();
    types.sort();

    if types.is_empty() {
        out.push_str("<p>No artifacts loaded.</p>\n");
    } else {
        // Build a matrix: for each (source_type, target_type), count how many
        // source artifacts have at least one forward link to the target type.
        let mut matrix: BTreeMap<(&str, &str), usize> = BTreeMap::new();
        let mut row_totals: BTreeMap<&str, usize> = BTreeMap::new();
        let mut row_covered: BTreeMap<&str, usize> = BTreeMap::new();

        for src_type in &types {
            let ids = store.by_type(src_type);
            let total = ids.len();
            *row_totals.entry(src_type).or_default() = total;
            let mut any_link_count = 0usize;

            for id in ids {
                let fwd = graph.links_from(id);
                let mut has_any = false;
                for tgt_type in &types {
                    let linked = fwd.iter().any(|l| {
                        store
                            .get(&l.target)
                            .is_some_and(|a| a.artifact_type == *tgt_type)
                    });
                    if linked {
                        *matrix.entry((src_type, tgt_type)).or_default() += 1;
                        has_any = true;
                    }
                }
                if has_any {
                    any_link_count += 1;
                }
            }
            *row_covered.entry(src_type).or_default() = any_link_count;
        }

        // Render table
        out.push_str("<table><thead><tr><th>Source \\ Target</th>");
        for t in &types {
            write!(out, "<th>{}</th>", html_escape(t)).unwrap();
        }
        out.push_str("<th>Coverage</th></tr></thead><tbody>\n");

        for src in &types {
            out.push_str("<tr>");
            write!(out, "<th>{}</th>", html_escape(src)).unwrap();
            for tgt in &types {
                let count = matrix.get(&(src, tgt)).copied().unwrap_or(0);
                if count > 0 {
                    write!(out, "<td class=\"cell-green\">{count}</td>").unwrap();
                } else {
                    out.push_str("<td>0</td>");
                }
            }
            // Row coverage
            let total = row_totals.get(src).copied().unwrap_or(0);
            let covered = row_covered.get(src).copied().unwrap_or(0);
            let pct = if total == 0 {
                100.0
            } else {
                (covered as f64 / total as f64) * 100.0
            };
            let cell_class = if pct >= 100.0 - f64::EPSILON {
                "cell-green"
            } else if pct > 0.0 {
                "cell-yellow"
            } else {
                "cell-red"
            };
            write!(out, "<td class=\"{cell_class}\">{pct:.1}%</td>").unwrap();
            out.push_str("</tr>\n");
        }
        out.push_str("</tbody></table>\n");
    }

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render the coverage report page.
pub fn render_coverage(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    config: &ExportConfig,
) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let report = coverage::compute_coverage(store, schema, graph);

    let mut out = page_header("Coverage Report", config, is_single_page);
    out.push_str(&nav_bar("coverage", config, is_single_page));

    out.push_str("<main>\n<h1>Coverage Report</h1>\n");

    // Overall summary
    let overall = report.overall_coverage();
    let cov_class = if overall >= 100.0 - f64::EPSILON {
        "badge-green"
    } else if overall > 0.0 {
        "badge-yellow"
    } else {
        "badge-red"
    };
    writeln!(
        out,
        "<p>Overall coverage: <span class=\"badge {cov_class}\">{overall:.1}%</span></p>"
    )
    .unwrap();

    if report.entries.is_empty() {
        out.push_str("<p>No traceability rules defined in the schema.</p>\n");
    } else {
        // Per-rule table
        out.push_str(
            "<table><thead><tr>\
             <th>Rule</th><th>Description</th><th>Source Type</th>\
             <th>Link</th><th>Covered</th><th>Total</th><th>%</th>\
             </tr></thead><tbody>\n",
        );
        for entry in &report.entries {
            let pct = entry.percentage();
            let cell_class = if pct >= 100.0 - f64::EPSILON {
                "cell-green"
            } else if pct > 0.0 {
                "cell-yellow"
            } else {
                "cell-red"
            };
            writeln!(
                out,
                "<tr><td>{name}</td><td>{desc}</td><td>{src}</td><td>{link}</td>\
                 <td>{covered}</td><td>{total}</td><td class=\"{cell_class}\">{pct:.1}%</td></tr>",
                name = html_escape(&entry.rule_name),
                desc = html_escape(&entry.description),
                src = html_escape(&entry.source_type),
                link = html_escape(&entry.link_type),
                covered = entry.covered,
                total = entry.total,
            )
            .unwrap();
        }
        out.push_str("</tbody></table>\n");

        // Uncovered artifacts
        let has_uncovered = report.entries.iter().any(|e| !e.uncovered_ids.is_empty());
        if has_uncovered {
            let req_href = "./requirements.html";
            out.push_str("<h2>Uncovered Artifacts</h2>\n");
            for entry in &report.entries {
                if entry.uncovered_ids.is_empty() {
                    continue;
                }
                writeln!(
                    out,
                    "<h3>{} <small>({} uncovered)</small></h3>\n<ul>",
                    html_escape(&entry.rule_name),
                    entry.uncovered_ids.len(),
                )
                .unwrap();
                for id in &entry.uncovered_ids {
                    writeln!(
                        out,
                        "<li><a href=\"{req_href}#art-{id}\">{id}</a></li>",
                        id = html_escape(id),
                    )
                    .unwrap();
                }
                out.push_str("</ul>\n");
            }
        }
    }

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render the validation report page.
pub fn render_validation(diagnostics: &[Diagnostic], config: &ExportConfig) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Validation Report", config, is_single_page);
    out.push_str(&nav_bar("validation", config, is_single_page));

    out.push_str("<main>\n<h1>Validation Report</h1>\n");

    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    let infos = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Info)
        .count();

    // Summary
    if errors == 0 && warnings == 0 && infos == 0 {
        out.push_str("<p><span class=\"badge badge-green\">PASS</span> No diagnostics.</p>\n");
    } else {
        out.push_str("<div class=\"summary-grid\">\n");
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Errors</div>\
             <div class=\"value severity-error\">{errors}</div></div>"
        )
        .unwrap();
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Warnings</div>\
             <div class=\"value severity-warning\">{warnings}</div></div>"
        )
        .unwrap();
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Info</div>\
             <div class=\"value severity-info\">{infos}</div></div>"
        )
        .unwrap();
        out.push_str("</div>\n");
    }

    writeln!(out, "<p>Validated at {timestamp}</p>").unwrap();

    // Diagnostics grouped by severity
    let req_href = "./requirements.html";
    let severity_order = [Severity::Error, Severity::Warning, Severity::Info];
    let severity_labels = ["Errors", "Warnings", "Info"];

    for (sev, label) in severity_order.iter().zip(severity_labels.iter()) {
        let diags: Vec<&Diagnostic> = diagnostics.iter().filter(|d| d.severity == *sev).collect();
        if diags.is_empty() {
            continue;
        }

        writeln!(
            out,
            "<h2 class=\"{cls}\">{icon} {label} ({count})</h2>",
            cls = severity_class(sev),
            icon = severity_icon(sev),
            count = diags.len(),
        )
        .unwrap();

        out.push_str("<ul class=\"diag-list\">\n");
        for d in &diags {
            out.push_str("<li>");
            write!(
                out,
                "<span class=\"{cls}\">{icon}</span> ",
                cls = severity_class(&d.severity),
                icon = severity_icon(&d.severity),
            )
            .unwrap();
            if let Some(ref id) = d.artifact_id {
                write!(
                    out,
                    "<a href=\"{req_href}#art-{id}\"><strong>{id}</strong></a> ",
                    id = html_escape(id),
                )
                .unwrap();
            }
            write!(
                out,
                "<span class=\"diag-rule\">[{}]</span> {}",
                html_escape(&d.rule),
                html_escape(&d.message),
            )
            .unwrap();
            out.push_str("</li>\n");
        }
        out.push_str("</ul>\n");
    }

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

// ── STPA / STPA-Sec page ─────────────────────────────────────────────────

/// STPA artifact types in analysis order.
const STPA_TYPES: &[&str] = &[
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

/// STPA-Sec artifact types.
const STPA_SEC_TYPES: &[&str] = &[
    "sec-loss",
    "sec-hazard",
    "sec-constraint",
    "sec-uca",
    "sec-scenario",
];

/// Render the STPA analysis page with both STPA and STPA-Sec sections.
pub fn render_stpa(store: &Store, graph: &LinkGraph, config: &ExportConfig) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("STPA Analysis", config, is_single_page);
    out.push_str(&nav_bar("stpa", config, is_single_page));

    out.push_str("<main>\n");
    out.push_str(&render_section_stpa(store, graph));
    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render the STPA section content (no HTML wrapper).
fn render_section_stpa(store: &Store, graph: &LinkGraph) -> String {
    let mut out = String::from("<h1>STPA Analysis</h1>\n");

    // ── STPA type counts ────────────────────────────────────────────────
    let stpa_counts: Vec<(&str, usize)> = STPA_TYPES
        .iter()
        .map(|t| (*t, store.count_by_type(t)))
        .filter(|(_, c)| *c > 0)
        .collect();
    let stpa_total: usize = stpa_counts.iter().map(|(_, c)| c).sum();

    if stpa_total == 0 {
        out.push_str("<p>No STPA artifacts found.</p>\n");
    } else {
        writeln!(
            out,
            "<p>{stpa_total} STPA artifact(s) across {} type(s).</p>",
            stpa_counts.len(),
        )
        .unwrap();

        out.push_str("<table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>\n");
        for (t, c) in &stpa_counts {
            writeln!(out, "<tr><td>{}</td><td>{c}</td></tr>", html_escape(t),).unwrap();
        }
        writeln!(out, "<tr><th>Total</th><th>{stpa_total}</th></tr>").unwrap();
        out.push_str("</tbody></table>\n");

        // ── Hierarchy view ──────────────────────────────────────────────
        out.push_str("<h2>STPA Hierarchy</h2>\n");
        render_stpa_hierarchy(&mut out, store, graph);
    }

    // ── STPA-Sec section ────────────────────────────────────────────────
    let sec_counts: Vec<(&str, usize)> = STPA_SEC_TYPES
        .iter()
        .map(|t| (*t, store.count_by_type(t)))
        .filter(|(_, c)| *c > 0)
        .collect();
    let sec_total: usize = sec_counts.iter().map(|(_, c)| c).sum();

    if sec_total > 0 {
        out.push_str("<h2>STPA-Sec (Security)</h2>\n");
        writeln!(
            out,
            "<p>{sec_total} STPA-Sec artifact(s) across {} type(s).</p>",
            sec_counts.len(),
        )
        .unwrap();

        out.push_str("<table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>\n");
        for (t, c) in &sec_counts {
            writeln!(out, "<tr><td>{}</td><td>{c}</td></tr>", html_escape(t),).unwrap();
        }
        writeln!(out, "<tr><th>Total</th><th>{sec_total}</th></tr>").unwrap();
        out.push_str("</tbody></table>\n");

        // STPA-Sec hierarchy
        out.push_str("<h3>Security Hierarchy</h3>\n");
        render_stpa_sec_hierarchy(&mut out, store, graph);
    }

    out
}

/// Render the STPA hierarchy as nested HTML lists.
///
/// Structure: losses -> hazards -> system-constraints -> UCAs
fn render_stpa_hierarchy(out: &mut String, store: &Store, graph: &LinkGraph) {
    let losses = store.by_type("loss");
    if losses.is_empty() {
        out.push_str("<p>No losses defined.</p>\n");
        return;
    }

    let req_href = "./requirements.html";
    out.push_str("<ul>\n");
    for loss_id in losses {
        let Some(loss) = store.get(loss_id) else {
            continue;
        };
        writeln!(
            out,
            "  <li><a href=\"{req_href}#art-{id}\">{id}</a> &mdash; {title}",
            id = html_escape(loss_id),
            title = html_escape(&loss.title),
        )
        .unwrap();

        // Find hazards that link to this loss (via leads-to-loss)
        let hazard_backlinks = graph.backlinks_to(loss_id);
        let hazard_ids: Vec<&str> = hazard_backlinks
            .iter()
            .filter(|bl| bl.link_type == "leads-to-loss")
            .filter_map(|bl| {
                store
                    .get(&bl.source)
                    .filter(|a| a.artifact_type == "hazard" || a.artifact_type == "sub-hazard")
                    .map(|_| bl.source.as_str())
            })
            .collect();

        if !hazard_ids.is_empty() {
            out.push_str("\n    <ul>\n");
            for haz_id in &hazard_ids {
                let Some(haz) = store.get(haz_id) else {
                    continue;
                };
                writeln!(
                    out,
                    "      <li><a href=\"{req_href}#art-{id}\">{id}</a> &mdash; {title}",
                    id = html_escape(haz_id),
                    title = html_escape(&haz.title),
                )
                .unwrap();

                // Find system-constraints that prevent this hazard
                let constraint_backlinks = graph.backlinks_to(haz_id);
                let constraint_ids: Vec<&str> = constraint_backlinks
                    .iter()
                    .filter(|bl| bl.link_type == "prevents")
                    .filter_map(|bl| {
                        store
                            .get(&bl.source)
                            .filter(|a| {
                                a.artifact_type == "system-constraint"
                                    || a.artifact_type == "controller-constraint"
                            })
                            .map(|_| bl.source.as_str())
                    })
                    .collect();

                if !constraint_ids.is_empty() {
                    out.push_str("\n        <ul>\n");
                    for cst_id in &constraint_ids {
                        let Some(cst) = store.get(cst_id) else {
                            continue;
                        };
                        writeln!(
                            out,
                            "          <li><a href=\"{req_href}#art-{id}\">{id}</a> &mdash; {title}</li>",
                            id = html_escape(cst_id),
                            title = html_escape(&cst.title),
                        )
                        .unwrap();
                    }
                    out.push_str("        </ul>\n");
                }

                // Find UCAs that lead to this hazard
                let uca_backlinks = graph.backlinks_to(haz_id);
                let uca_ids: Vec<&str> = uca_backlinks
                    .iter()
                    .filter(|bl| bl.link_type == "leads-to-hazard")
                    .filter_map(|bl| {
                        store
                            .get(&bl.source)
                            .filter(|a| a.artifact_type == "uca")
                            .map(|_| bl.source.as_str())
                    })
                    .collect();

                if !uca_ids.is_empty() {
                    out.push_str("\n        <ul>\n");
                    for uca_id in &uca_ids {
                        let Some(uca) = store.get(uca_id) else {
                            continue;
                        };
                        writeln!(
                            out,
                            "          <li><a href=\"{req_href}#art-{id}\">{id}</a> &mdash; {title}</li>",
                            id = html_escape(uca_id),
                            title = html_escape(&uca.title),
                        )
                        .unwrap();
                    }
                    out.push_str("        </ul>\n");
                }

                out.push_str("      </li>\n");
            }
            out.push_str("    </ul>\n");
        }

        out.push_str("  </li>\n");
    }
    out.push_str("</ul>\n");
}

/// Render the STPA-Sec hierarchy as nested HTML lists with CIA badges.
///
/// Structure: sec-losses -> sec-hazards -> sec-constraints -> sec-UCAs -> sec-scenarios
fn render_stpa_sec_hierarchy(out: &mut String, store: &Store, _graph: &LinkGraph) {
    let sec_losses = store.by_type("sec-loss");
    if sec_losses.is_empty() {
        // Fall back to a flat listing of all sec types
        let req_href = "./requirements.html";
        for sec_type in STPA_SEC_TYPES {
            let ids = store.by_type(sec_type);
            if ids.is_empty() {
                continue;
            }
            writeln!(
                out,
                "<h4>{} <small>({} artifacts)</small></h4>",
                html_escape(sec_type),
                ids.len(),
            )
            .unwrap();
            out.push_str("<ul>\n");
            for id in ids {
                let Some(art) = store.get(id) else { continue };
                write!(
                    out,
                    "  <li><a href=\"{req_href}#art-{id}\">{id}</a> &mdash; {title}",
                    id = html_escape(id),
                    title = html_escape(&art.title),
                )
                .unwrap();
                // CIA badge from fields
                render_cia_badges(out, &art.fields);
                out.push_str("</li>\n");
            }
            out.push_str("</ul>\n");
        }
        return;
    }

    let req_href = "./requirements.html";
    out.push_str("<ul>\n");
    for loss_id in sec_losses {
        let Some(loss) = store.get(loss_id) else {
            continue;
        };
        write!(
            out,
            "  <li><a href=\"{req_href}#art-{id}\">{id}</a> &mdash; {title}",
            id = html_escape(loss_id),
            title = html_escape(&loss.title),
        )
        .unwrap();
        render_cia_badges(out, &loss.fields);
        out.push_str("</li>\n");
    }
    out.push_str("</ul>\n");
}

/// Append CIA impact badges if the artifact has a `cia-impact` or
/// `cybersecurity-properties` field.
fn render_cia_badges(out: &mut String, fields: &BTreeMap<String, serde_yaml::Value>) {
    // Check for cia-impact or cybersecurity-properties field
    let cia_field = fields
        .get("cia-impact")
        .or_else(|| fields.get("cybersecurity-properties"));

    if let Some(val) = cia_field {
        match val {
            serde_yaml::Value::Sequence(items) => {
                for item in items {
                    if let serde_yaml::Value::String(s) = item {
                        write!(
                            out,
                            " <span class=\"badge badge-info\">{}</span>",
                            html_escape(s),
                        )
                        .unwrap();
                    }
                }
            }
            serde_yaml::Value::String(s) => {
                write!(
                    out,
                    " <span class=\"badge badge-info\">{}</span>",
                    html_escape(s),
                )
                .unwrap();
            }
            _ => {}
        }
    }
}

// ── Graph page ──────────────────────────────────────────────────────────

/// Default type-color mapping for graph node rendering.
///
/// This mirrors the mapping used in the serve dashboard so that the
/// static export graph matches the interactive one.
fn export_type_color_map() -> HashMap<String, String> {
    let pairs: &[(&str, &str)] = &[
        // STPA
        ("loss", "#dc3545"),
        ("hazard", "#fd7e14"),
        ("system-constraint", "#20c997"),
        ("controller", "#6f42c1"),
        ("uca", "#e83e8c"),
        ("control-action", "#17a2b8"),
        ("feedback", "#6610f2"),
        ("causal-factor", "#d63384"),
        ("safety-constraint", "#20c997"),
        ("loss-scenario", "#e83e8c"),
        ("controller-constraint", "#20c997"),
        ("controlled-process", "#6610f2"),
        ("sub-hazard", "#fd7e14"),
        // ASPICE
        ("stakeholder-req", "#0d6efd"),
        ("system-req", "#0dcaf0"),
        ("system-architecture", "#198754"),
        ("sw-req", "#198754"),
        ("sw-architecture", "#0d6efd"),
        ("sw-detailed-design", "#6610f2"),
        ("sw-unit", "#6f42c1"),
        ("system-verification", "#6610f2"),
        ("sw-verification", "#6610f2"),
        ("system-integration-verification", "#6610f2"),
        ("sw-integration-verification", "#6610f2"),
        ("sw-unit-verification", "#6610f2"),
        ("qualification-verification", "#6610f2"),
        // Dev
        ("requirement", "#0d6efd"),
        ("design-decision", "#198754"),
        ("feature", "#6f42c1"),
        // Cybersecurity
        ("asset", "#ffc107"),
        ("threat", "#dc3545"),
        ("cybersecurity-req", "#fd7e14"),
        ("vulnerability", "#e83e8c"),
        ("attack-path", "#dc3545"),
        ("cybersecurity-goal", "#0d6efd"),
        ("cybersecurity-control", "#198754"),
        ("security-verification", "#6610f2"),
        ("risk-assessment", "#fd7e14"),
        ("security-event", "#e83e8c"),
    ];
    pairs
        .iter()
        .map(|(k, v)| (k.to_string(), v.to_string()))
        .collect()
}

/// Render the graph visualization page with an inline SVG.
pub fn render_graph(store: &Store, graph: &LinkGraph, config: &ExportConfig) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Traceability Graph", config, is_single_page);
    out.push_str(&nav_bar("graph", config, is_single_page));

    out.push_str("<main>\n");
    out.push_str(&render_section_graph(store, graph));
    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render the graph section content (no HTML wrapper).
fn render_section_graph(store: &Store, link_graph: &LinkGraph) -> String {
    use etch::layout::{EdgeInfo, LayoutOptions, NodeInfo};
    use etch::svg::{SvgOptions, render_svg};
    use petgraph::graph::{EdgeIndex, NodeIndex};

    let mut out = String::from("<h1>Traceability Graph</h1>\n");

    let pg = link_graph.graph();

    if pg.node_count() == 0 {
        out.push_str("<p>No artifacts to display.</p>\n");
        return out;
    }

    writeln!(
        out,
        "<p>{} nodes, {} edges</p>",
        pg.node_count(),
        pg.edge_count(),
    )
    .unwrap();

    let colors = export_type_color_map();
    let svg_opts = SvgOptions {
        type_colors: colors.clone(),
        interactive: false,
        background: Some("#fafbfc".into()),
        font_size: 12.0,
        edge_color: "#888".into(),
        ..SvgOptions::default()
    };

    let layout_opts = LayoutOptions {
        node_width: 200.0,
        node_height: 56.0,
        rank_separation: 90.0,
        node_separation: 30.0,
        ..Default::default()
    };

    let gl = etch::layout::layout(
        pg,
        &|_idx: NodeIndex, n: &String| {
            let atype = store
                .get(n.as_str())
                .map(|a| a.artifact_type.clone())
                .unwrap_or_default();
            let title = store
                .get(n.as_str())
                .map(|a| a.title.clone())
                .unwrap_or_default();
            let sublabel = if title.len() > 28 {
                Some(format!("{}...", &title[..26]))
            } else if title.is_empty() {
                None
            } else {
                Some(title)
            };
            NodeInfo {
                id: n.clone(),
                label: n.clone(),
                node_type: atype,
                sublabel,
                parent: None,
                ports: vec![],
            }
        },
        &|_idx: EdgeIndex, e: &String| EdgeInfo {
            label: e.clone(),
            source_port: None,
            target_port: None,
        },
        &layout_opts,
    );

    let svg = render_svg(&gl, &svg_opts);

    // Wrap in a scrollable container
    out.push_str(
        "<div style=\"overflow:auto;border:1px solid var(--border);\
         border-radius:var(--radius);padding:1rem;margin:1rem 0\">\n",
    );
    out.push_str(&svg);
    out.push_str("</div>\n");

    // Legend
    let mut present_types: Vec<String> = store
        .iter()
        .map(|a| a.artifact_type.clone())
        .collect::<std::collections::BTreeSet<_>>()
        .into_iter()
        .collect();
    present_types.sort();

    if !present_types.is_empty() {
        out.push_str("<h2>Legend</h2>\n<div style=\"display:flex;flex-wrap:wrap;gap:0.75rem\">\n");
        for t in &present_types {
            let color = colors
                .get(t.as_str())
                .map(|s| s.as_str())
                .unwrap_or("#e8e8e8");
            writeln!(
                out,
                "<span style=\"display:inline-flex;align-items:center;gap:0.3rem\">\
                 <span style=\"display:inline-block;width:14px;height:14px;\
                 background:{color};border-radius:3px\"></span> {}</span>",
                html_escape(t),
            )
            .unwrap();
        }
        out.push_str("</div>\n");
    }

    out
}

// ── Source browser page ──────────────────────────────────────────────────

/// Render the source browser page listing all artifact source files.
pub fn render_source(store: &Store, config: &ExportConfig) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Source Browser", config, is_single_page);
    out.push_str(&nav_bar("source", config, is_single_page));

    out.push_str("<main>\n<h1>Source Browser</h1>\n");

    // Group artifacts by source file.
    let mut by_file: BTreeMap<String, Vec<&crate::model::Artifact>> = BTreeMap::new();
    for art in store.iter() {
        let file_key = art
            .source_file
            .as_ref()
            .map(|p| p.display().to_string())
            .unwrap_or_else(|| "(unknown)".to_string());
        by_file.entry(file_key).or_default().push(art);
    }

    if by_file.is_empty() {
        out.push_str("<p>No source files found.</p>\n");
    } else {
        writeln!(
            out,
            "<p>{} source file(s) containing {} artifact(s).</p>",
            by_file.len(),
            store.len(),
        )
        .unwrap();

        // Summary table
        out.push_str(
            "<table><thead><tr>\
             <th>File</th><th>Artifact Count</th><th>Types</th>\
             </tr></thead><tbody>\n",
        );
        for (file, arts) in &by_file {
            let encoded = html_escape(file).replace(['/', '\\'], "_");
            let mut types: Vec<&str> = arts.iter().map(|a| a.artifact_type.as_str()).collect();
            types.sort();
            types.dedup();
            writeln!(
                out,
                "<tr><td><a href=\"#file-{encoded}\">{file_disp}</a></td>\
                 <td>{count}</td><td>{types}</td></tr>",
                file_disp = html_escape(file),
                count = arts.len(),
                types = types
                    .iter()
                    .map(|t| html_escape(t))
                    .collect::<Vec<_>>()
                    .join(", "),
            )
            .unwrap();
        }
        out.push_str("</tbody></table>\n");

        // Per-file artifact sections
        for (file, arts) in &by_file {
            let encoded = html_escape(file).replace(['/', '\\'], "_");
            writeln!(
                out,
                "<h2 id=\"file-{encoded}\">{file_disp} <small>({count} artifacts)</small></h2>",
                file_disp = html_escape(file),
                count = arts.len(),
            )
            .unwrap();

            out.push_str(
                "<table><thead><tr>\
                 <th>ID</th><th>Type</th><th>Title</th><th>Status</th>\
                 </tr></thead><tbody>\n",
            );
            for art in arts {
                writeln!(
                    out,
                    "<tr><td><a href=\"./requirements.html#art-{id}\">{id}</a></td>\
                     <td>{atype}</td><td>{title}</td><td>{status}</td></tr>",
                    id = html_escape(&art.id),
                    atype = html_escape(&art.artifact_type),
                    title = html_escape(&art.title),
                    status = art
                        .status
                        .as_deref()
                        .map(|s| status_badge(Some(s)))
                        .unwrap_or_default(),
                )
                .unwrap();
            }
            out.push_str("</tbody></table>\n");
        }
    }

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

// ── Results page ────────────────────────────────────────────────────────

/// Render the test results page.
pub fn render_results(result_store: &ResultStore, config: &ExportConfig) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Test Results", config, is_single_page);
    out.push_str(&nav_bar("results", config, is_single_page));

    out.push_str("<main>\n<h1>Test Results</h1>\n");

    if result_store.is_empty() {
        out.push_str(
            "<div class=\"artifact-section\">\n\
             <h3>No Test Results</h3>\n\
             <p>No test result files were found. To add results, create YAML files \
             in a <code>results/</code> directory with the following structure:</p>\n\
             <pre><code>run:\n\
             \x20 id: run-001\n\
             \x20 timestamp: 2026-03-22T10:00:00Z\n\
             \x20 source: CI\n\
             results:\n\
             \x20 - artifact: REQ-001\n\
             \x20   status: pass\n\
             \x20 - artifact: REQ-002\n\
             \x20   status: fail\n\
             \x20   message: Threshold exceeded\n\
             </code></pre>\n\
             </div>\n",
        );
    } else {
        let summary = result_store.summary();

        // Summary cards
        out.push_str("<div class=\"summary-grid\">\n");
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Test Runs</div>\
             <div class=\"value\">{}</div></div>",
            summary.total_runs,
        )
        .unwrap();
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Total Results</div>\
             <div class=\"value\">{}</div></div>",
            summary.total_results,
        )
        .unwrap();

        let rate = summary.pass_rate();
        let rate_class = if rate >= 100.0 - f64::EPSILON {
            "badge-green"
        } else if rate >= 80.0 {
            "badge-yellow"
        } else {
            "badge-red"
        };
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Pass Rate</div>\
             <div class=\"value\"><span class=\"badge {rate_class}\">{rate:.1}%</span></div></div>",
        )
        .unwrap();

        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Passed</div>\
             <div class=\"value\" style=\"color:var(--green)\">{}</div></div>",
            summary.pass_count,
        )
        .unwrap();
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Failed</div>\
             <div class=\"value\" style=\"color:var(--red)\">{}</div></div>",
            summary.fail_count + summary.error_count,
        )
        .unwrap();
        out.push_str("</div>\n");

        // Per-run results
        for run in result_store.runs() {
            writeln!(
                out,
                "<h2>Run: {} <small>({})</small></h2>",
                html_escape(&run.run.id),
                html_escape(&run.run.timestamp),
            )
            .unwrap();

            if let Some(ref src) = run.run.source {
                writeln!(out, "<p>Source: {}</p>", html_escape(src)).unwrap();
            }
            if let Some(ref env) = run.run.environment {
                writeln!(out, "<p>Environment: {}</p>", html_escape(env)).unwrap();
            }
            if let Some(ref commit) = run.run.commit {
                writeln!(out, "<p>Commit: <code>{}</code></p>", html_escape(commit)).unwrap();
            }

            out.push_str(
                "<table><thead><tr>\
                 <th>Artifact</th><th>Status</th><th>Duration</th><th>Message</th>\
                 </tr></thead><tbody>\n",
            );
            for result in &run.results {
                let status_class = match result.status {
                    crate::results::TestStatus::Pass => "badge-green",
                    crate::results::TestStatus::Fail | crate::results::TestStatus::Error => {
                        "badge-red"
                    }
                    crate::results::TestStatus::Skip => "badge-default",
                    crate::results::TestStatus::Blocked => "badge-yellow",
                };
                writeln!(
                    out,
                    "<tr><td><a href=\"./requirements.html#art-{id}\">{id}</a></td>\
                     <td><span class=\"badge {cls}\">{status}</span></td>\
                     <td>{dur}</td><td>{msg}</td></tr>",
                    id = html_escape(&result.artifact),
                    cls = status_class,
                    status = result.status,
                    dur = result.duration.as_deref().unwrap_or(""),
                    msg = html_escape(result.message.as_deref().unwrap_or("")),
                )
                .unwrap();
            }
            out.push_str("</tbody></table>\n");
        }
    }

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

// ── Document renderers ──────────────────────────────────────────────────

/// Render the documents index page listing all documents with links.
pub fn render_documents_index(doc_store: &DocumentStore, config: &ExportConfig) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Documents", config, is_single_page);
    out.push_str(&nav_bar("documents", config, is_single_page));

    out.push_str("<main>\n<h1>Documents</h1>\n");

    if doc_store.is_empty() {
        out.push_str("<p>No documents found.</p>\n");
    } else {
        writeln!(
            out,
            "<p>{} document(s) in this project.</p>",
            doc_store.len(),
        )
        .unwrap();

        for doc in doc_store.iter() {
            let doc_href = format!("./doc-{}.html", doc.id);
            out.push_str("<div class=\"doc-card\">\n");
            writeln!(
                out,
                "<div class=\"doc-meta\">{type_} {status}</div>",
                type_ = html_escape(&doc.doc_type),
                status = status_badge(doc.status.as_deref()),
            )
            .unwrap();
            writeln!(
                out,
                "<h3><a href=\"{href}\">{id} &mdash; {title}</a></h3>",
                href = html_escape(&doc_href),
                id = html_escape(&doc.id),
                title = html_escape(&doc.title),
            )
            .unwrap();
            if !doc.references.is_empty() {
                writeln!(
                    out,
                    "<div class=\"doc-meta\">{} artifact reference(s)</div>",
                    doc.references.len(),
                )
                .unwrap();
            }
            out.push_str("</div>\n");
        }
    }

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render a single document page with resolved wiki-links and artifact embeds.
///
/// Wiki-links `[[REQ-001]]` resolve to `./requirements.html#art-REQ-001`.
/// Artifact embeds `{{artifact:ID}}` render the full card via `ArtifactInfo`.
pub fn render_document_page(
    doc: &document::Document,
    store: &Store,
    graph: &LinkGraph,
    schema: &Schema,
    diagnostics: &[Diagnostic],
    commit_short: &str,
    is_dirty: bool,
    config: &ExportConfig,
) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let page_title = format!("{} — {}", doc.id, doc.title);
    let mut out = page_header(&page_title, config, is_single_page);
    out.push_str(&nav_bar("documents", config, is_single_page));

    out.push_str("<main>\n");
    writeln!(
        out,
        "<h1>{id} &mdash; {title} {badge}</h1>",
        id = html_escape(&doc.id),
        title = html_escape(&doc.title),
        badge = status_badge(doc.status.as_deref()),
    )
    .unwrap();
    writeln!(
        out,
        "<p class=\"doc-meta\">Type: {} | {} artifact reference(s)</p>",
        html_escape(&doc.doc_type),
        doc.references.len(),
    )
    .unwrap();

    // Render the document body with resolved links for static export.
    let req_href = "./requirements.html";
    let body_html = render_document_body_for_export(
        doc, store, graph, schema, diagnostics, commit_short, is_dirty, req_href,
    );
    out.push_str("<div class=\"doc-body\">\n");
    out.push_str(&body_html);
    out.push_str("</div>\n");

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render a document body for static HTML export.
///
/// This wraps `document::render_to_html` but overrides the `[[ID]]` link
/// resolution to point at `./requirements.html#art-ID` instead of HTMX
/// endpoints, making it suitable for static sites.
fn render_document_body_for_export(
    doc: &document::Document,
    store: &Store,
    graph: &LinkGraph,
    schema: &Schema,
    diagnostics: &[Diagnostic],
    commit_short: &str,
    is_dirty: bool,
    req_href: &str,
) -> String {
    // Use the document module's render_to_html with custom callbacks.
    let artifact_exists = |id: &str| -> bool { store.get(id).is_some() };
    let artifact_info = |id: &str| -> Option<ArtifactInfo> {
        let art = store.get(id)?;
        let fwd_links = graph
            .links_from(id)
            .iter()
            .map(|l| document::LinkInfo {
                link_type: l.link_type.clone(),
                target_id: l.target.clone(),
                target_title: store
                    .get(&l.target)
                    .map(|a| a.title.clone())
                    .unwrap_or_default(),
                target_type: store
                    .get(&l.target)
                    .map(|a| a.artifact_type.clone())
                    .unwrap_or_default(),
            })
            .collect();
        let back_links = graph
            .backlinks_to(id)
            .iter()
            .map(|l| document::LinkInfo {
                link_type: l
                    .inverse_type
                    .as_deref()
                    .unwrap_or(&l.link_type)
                    .to_string(),
                target_id: l.source.clone(),
                target_title: store
                    .get(&l.source)
                    .map(|a| a.title.clone())
                    .unwrap_or_default(),
                target_type: store
                    .get(&l.source)
                    .map(|a| a.artifact_type.clone())
                    .unwrap_or_default(),
            })
            .collect();
        Some(ArtifactInfo {
            id: art.id.clone(),
            title: art.title.clone(),
            art_type: art.artifact_type.clone(),
            status: art.status.clone().unwrap_or_default(),
            description: art.description.clone().unwrap_or_default(),
            tags: art.tags.clone(),
            fields: art
                .fields
                .iter()
                .map(|(k, v)| {
                    let val = match v {
                        serde_yaml::Value::String(s) => s.clone(),
                        other => format!("{other:?}"),
                    };
                    (k.clone(), val)
                })
                .collect(),
            links: fwd_links,
            backlinks: back_links,
        })
    };

    // Get the rendered HTML from the document module.
    // Computed embeds are resolved with provenance stamps (SC-EMBED-4).
    let raw_html = document::render_to_html(doc, artifact_exists, artifact_info, |_| false, |req| {
        let embed_ctx = crate::embed::EmbedContext {
            store,
            schema,
            graph,
            diagnostics,
        };
        match crate::embed::resolve_embed(req, &embed_ctx) {
            Ok(html) => {
                let stamp = crate::embed::render_provenance_stamp(commit_short, is_dirty);
                Ok(format!("{html}{stamp}"))
            }
            Err(e) => Err(e.to_string()),
        }
    });

    // Post-process: rewrite the HTMX-style artifact links to static links.
    // The document renderer produces:
    //   <a class="artifact-ref" hx-get="/artifacts/ID" hx-target="#content" href="#">ID</a>
    // We rewrite these to:
    //   <a class="artifact-ref" href="./requirements.html#art-ID">ID</a>
    rewrite_artifact_links(&raw_html, req_href)
}

/// Rewrite HTMX artifact links to static relative links for export.
fn rewrite_artifact_links(html: &str, req_href: &str) -> String {
    let mut result = String::with_capacity(html.len());
    let mut rest = html;

    // Match the opening of any artifact-ref <a> tag regardless of href value.
    // The renderer emits: class="artifact-ref" hx-get="/artifacts/{id}" ... >
    let pattern = "class=\"artifact-ref\" hx-get=\"/artifacts/";
    while let Some(start) = rest.find(pattern) {
        result.push_str(&rest[..start]);

        let after_pattern = &rest[start + pattern.len()..];
        if let Some(quote_end) = after_pattern.find('"') {
            let artifact_id = &after_pattern[..quote_end];
            // Skip the rest of the <a ...> opening tag (up to and including '>').
            let remaining = &after_pattern[quote_end..];
            if let Some(tag_close) = remaining.find('>') {
                write!(
                    result,
                    "class=\"artifact-ref\" href=\"{req_href}#art-{id}\">",
                    id = html_escape(artifact_id),
                )
                .unwrap();
                rest = &remaining[tag_close + 1..];
            } else {
                result.push_str(pattern);
                rest = after_pattern;
            }
        } else {
            result.push_str(pattern);
            rest = after_pattern;
        }
    }
    result.push_str(rest);
    result
}

/// Combine all reports into a single HTML page with internal anchors.
#[allow(clippy::too_many_arguments)]
pub fn render_single_page(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    diagnostics: &[Diagnostic],
    project_name: &str,
    version: &str,
    config: &ExportConfig,
    doc_store: &DocumentStore,
) -> String {
    let timestamp = timestamp_now();
    let css = build_css(config);

    let mut out = format!(
        "<!DOCTYPE html>\n\
         <html lang=\"en\">\n\
         <head>\n\
         <meta charset=\"utf-8\">\n\
         <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\
         <title>{name} — Rivet Export</title>\n\
         <style>{css}</style>\n\
         </head>\n\
         <body>\n",
        name = html_escape(project_name),
    );

    out.push_str(&nav_bar("__single__", config, true));

    // Index section
    out.push_str("<section id=\"index\">\n");
    out.push_str(&render_section_index(
        store,
        schema,
        graph,
        diagnostics,
        project_name,
        version,
        &timestamp,
    ));
    out.push_str("</section>\n<hr>\n");

    // Requirements section
    out.push_str("<section id=\"requirements\">\n");
    out.push_str(&render_section_requirements(store, schema, graph));
    out.push_str("</section>\n<hr>\n");

    // Documents section
    out.push_str("<section id=\"documents\">\n");
    out.push_str("<h1>Documents</h1>\n");
    if doc_store.is_empty() {
        out.push_str("<p>No documents found.</p>\n");
    } else {
        writeln!(
            out,
            "<p>{} document(s) in this project.</p>",
            doc_store.len(),
        )
        .unwrap();
        for doc in doc_store.iter() {
            writeln!(
                out,
                "<div class=\"artifact-section\">\
                 <h3>{id} &mdash; {title}</h3>\
                 <div class=\"artifact-meta\">Type: {type_}</div>\
                 </div>",
                id = html_escape(&doc.id),
                title = html_escape(&doc.title),
                type_ = html_escape(&doc.doc_type),
            )
            .unwrap();
        }
    }
    out.push_str("</section>\n<hr>\n");

    // STPA section
    out.push_str("<section id=\"stpa\">\n");
    out.push_str(&render_section_stpa(store, graph));
    out.push_str("</section>\n<hr>\n");

    // Matrix section
    out.push_str("<section id=\"matrix\">\n");
    out.push_str(&render_section_matrix(store, graph));
    out.push_str("</section>\n<hr>\n");

    // Coverage section
    out.push_str("<section id=\"coverage\">\n");
    out.push_str(&render_section_coverage(store, schema, graph));
    out.push_str("</section>\n<hr>\n");

    // Validation section
    out.push_str("<section id=\"validation\">\n");
    out.push_str(&render_section_validation(diagnostics, &timestamp));
    out.push_str("</section>\n<hr>\n");

    // Graph section
    out.push_str("<section id=\"graph\">\n");
    out.push_str(&render_section_graph(store, graph));
    out.push_str("</section>\n");

    out.push_str(&page_footer(version, &timestamp, false));
    out
}

// ── Single-page section renderers (no <html> wrappers) ──────────────────

fn render_section_index(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    diagnostics: &[Diagnostic],
    project_name: &str,
    version: &str,
    timestamp: &str,
) -> String {
    let mut out = String::new();
    writeln!(out, "<h1>{}</h1>", html_escape(project_name)).unwrap();
    writeln!(out, "<p>Generated at {timestamp} by Rivet {version}</p>").unwrap();

    let total = store.len();
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    let coverage_report = coverage::compute_coverage(store, schema, graph);
    let overall_cov = coverage_report.overall_coverage();

    out.push_str("<div class=\"summary-grid\">\n");
    writeln!(
        out,
        "<div class=\"summary-card\"><div class=\"label\">Artifacts</div>\
         <div class=\"value\">{total}</div></div>"
    )
    .unwrap();
    let (val_label, val_class) = if errors > 0 {
        (format!("{errors} errors"), "severity-error")
    } else if warnings > 0 {
        (format!("{warnings} warnings"), "severity-warning")
    } else {
        ("PASS".to_string(), "")
    };
    writeln!(
        out,
        "<div class=\"summary-card\"><div class=\"label\">Validation</div>\
         <div class=\"value {val_class}\">{val_label}</div></div>"
    )
    .unwrap();
    let cov_class = if overall_cov >= 100.0 - f64::EPSILON {
        "badge-green"
    } else if overall_cov > 0.0 {
        "badge-yellow"
    } else {
        "badge-red"
    };
    writeln!(
        out,
        "<div class=\"summary-card\"><div class=\"label\">Coverage</div>\
         <div class=\"value\"><span class=\"badge {cov_class}\">{overall_cov:.1}%</span>\
         </div></div>"
    )
    .unwrap();
    out.push_str("</div>\n");

    // Type table
    out.push_str(
        "<h2>Artifacts by Type</h2>\n\
         <table><thead><tr><th>Type</th><th>Count</th></tr></thead><tbody>\n",
    );
    let mut types: Vec<&str> = store.types().collect();
    types.sort();
    for t in &types {
        writeln!(
            out,
            "<tr><td>{}</td><td>{}</td></tr>",
            html_escape(t),
            store.count_by_type(t)
        )
        .unwrap();
    }
    writeln!(out, "<tr><th>Total</th><th>{total}</th></tr>").unwrap();
    out.push_str("</tbody></table>\n");
    out
}

fn render_section_requirements(store: &Store, _schema: &Schema, graph: &LinkGraph) -> String {
    let mut out = String::from("<h1>Requirements Specification</h1>\n");

    let mut types: Vec<&str> = store.types().collect();
    types.sort_by(|a, b| {
        let pri = |t: &str| -> u8 {
            if t.contains("req") {
                0
            } else if t.contains("design") {
                1
            } else if t.contains("feat") {
                2
            } else {
                3
            }
        };
        pri(a).cmp(&pri(b)).then(a.cmp(b))
    });

    for t in &types {
        writeln!(
            out,
            "<h2>{} <small>({} artifacts)</small></h2>",
            html_escape(t),
            store.count_by_type(t),
        )
        .unwrap();

        let ids = store.by_type(t);
        for id in ids {
            let Some(art) = store.get(id) else { continue };
            writeln!(
                out,
                "<div class=\"artifact-section\" id=\"art-{id}\">",
                id = html_escape(id),
            )
            .unwrap();
            writeln!(
                out,
                "<h3><span class=\"artifact-id\">{id}</span> &mdash; {title} {badge}</h3>",
                id = html_escape(id),
                title = html_escape(&art.title),
                badge = status_badge(art.status.as_deref()),
            )
            .unwrap();
            if let Some(desc) = &art.description {
                writeln!(out, "<p>{}</p>", html_escape(desc)).unwrap();
            }
            if !art.links.is_empty() {
                out.push_str("<p><strong>Links:</strong></p><ul>\n");
                for link in &art.links {
                    writeln!(
                        out,
                        "<li>{ltype} &rarr; <a href=\"#art-{target}\">{target}</a></li>",
                        ltype = html_escape(&link.link_type),
                        target = html_escape(&link.target),
                    )
                    .unwrap();
                }
                out.push_str("</ul>\n");
            }
            let backlinks = graph.backlinks_to(id);
            if !backlinks.is_empty() {
                out.push_str("<p><strong>Backlinks:</strong></p><ul>\n");
                for bl in backlinks {
                    let inv_label = bl.inverse_type.as_deref().unwrap_or(&bl.link_type);
                    writeln!(
                        out,
                        "<li>{inv} &larr; <a href=\"#art-{src}\">{src}</a></li>",
                        inv = html_escape(inv_label),
                        src = html_escape(&bl.source),
                    )
                    .unwrap();
                }
                out.push_str("</ul>\n");
            }
            out.push_str("</div>\n");
        }
    }
    out
}

fn render_section_matrix(store: &Store, graph: &LinkGraph) -> String {
    let mut out = String::from("<h1>Traceability Matrix</h1>\n");

    let mut types: Vec<&str> = store.types().collect();
    types.sort();

    if types.is_empty() {
        out.push_str("<p>No artifacts loaded.</p>\n");
        return out;
    }

    let mut matrix: BTreeMap<(&str, &str), usize> = BTreeMap::new();
    for src_type in &types {
        let ids = store.by_type(src_type);
        for id in ids {
            let fwd = graph.links_from(id);
            for tgt_type in &types {
                let linked = fwd.iter().any(|l| {
                    store
                        .get(&l.target)
                        .is_some_and(|a| a.artifact_type == *tgt_type)
                });
                if linked {
                    *matrix.entry((src_type, tgt_type)).or_default() += 1;
                }
            }
        }
    }

    out.push_str("<table><thead><tr><th>Source \\ Target</th>");
    for t in &types {
        write!(out, "<th>{}</th>", html_escape(t)).unwrap();
    }
    out.push_str("</tr></thead><tbody>\n");
    for src in &types {
        out.push_str("<tr>");
        write!(out, "<th>{}</th>", html_escape(src)).unwrap();
        for tgt in &types {
            let count = matrix.get(&(src, tgt)).copied().unwrap_or(0);
            if count > 0 {
                write!(out, "<td class=\"cell-green\">{count}</td>").unwrap();
            } else {
                out.push_str("<td>0</td>");
            }
        }
        out.push_str("</tr>\n");
    }
    out.push_str("</tbody></table>\n");
    out
}

fn render_section_coverage(store: &Store, schema: &Schema, graph: &LinkGraph) -> String {
    let mut out = String::from("<h1>Coverage Report</h1>\n");
    let report = coverage::compute_coverage(store, schema, graph);
    let overall = report.overall_coverage();

    let cov_class = if overall >= 100.0 - f64::EPSILON {
        "badge-green"
    } else if overall > 0.0 {
        "badge-yellow"
    } else {
        "badge-red"
    };
    writeln!(
        out,
        "<p>Overall coverage: <span class=\"badge {cov_class}\">{overall:.1}%</span></p>"
    )
    .unwrap();

    if !report.entries.is_empty() {
        out.push_str(
            "<table><thead><tr>\
             <th>Rule</th><th>Source Type</th><th>Covered</th><th>Total</th><th>%</th>\
             </tr></thead><tbody>\n",
        );
        for entry in &report.entries {
            let pct = entry.percentage();
            let cell_class = if pct >= 100.0 - f64::EPSILON {
                "cell-green"
            } else if pct > 0.0 {
                "cell-yellow"
            } else {
                "cell-red"
            };
            writeln!(
                out,
                "<tr><td>{}</td><td>{}</td><td>{}</td><td>{}</td>\
                 <td class=\"{cell_class}\">{pct:.1}%</td></tr>",
                html_escape(&entry.rule_name),
                html_escape(&entry.source_type),
                entry.covered,
                entry.total,
            )
            .unwrap();
        }
        out.push_str("</tbody></table>\n");
    }
    out
}

fn render_section_validation(diagnostics: &[Diagnostic], timestamp: &str) -> String {
    let mut out = String::from("<h1>Validation Report</h1>\n");

    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Warning)
        .count();
    let infos = diagnostics
        .iter()
        .filter(|d| d.severity == Severity::Info)
        .count();

    if errors == 0 && warnings == 0 && infos == 0 {
        out.push_str("<p><span class=\"badge badge-green\">PASS</span> No diagnostics.</p>\n");
    } else {
        out.push_str("<div class=\"summary-grid\">\n");
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Errors</div>\
             <div class=\"value severity-error\">{errors}</div></div>"
        )
        .unwrap();
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Warnings</div>\
             <div class=\"value severity-warning\">{warnings}</div></div>"
        )
        .unwrap();
        writeln!(
            out,
            "<div class=\"summary-card\"><div class=\"label\">Info</div>\
             <div class=\"value severity-info\">{infos}</div></div>"
        )
        .unwrap();
        out.push_str("</div>\n");
    }

    writeln!(out, "<p>Validated at {timestamp}</p>").unwrap();

    let severity_order = [Severity::Error, Severity::Warning, Severity::Info];
    let severity_labels = ["Errors", "Warnings", "Info"];
    for (sev, label) in severity_order.iter().zip(severity_labels.iter()) {
        let diags: Vec<&Diagnostic> = diagnostics.iter().filter(|d| d.severity == *sev).collect();
        if diags.is_empty() {
            continue;
        }
        writeln!(
            out,
            "<h2 class=\"{cls}\">{icon} {label} ({count})</h2>",
            cls = severity_class(sev),
            icon = severity_icon(sev),
            count = diags.len(),
        )
        .unwrap();
        out.push_str("<ul class=\"diag-list\">\n");
        for d in &diags {
            out.push_str("<li>");
            write!(
                out,
                "<span class=\"{cls}\">{icon}</span> ",
                cls = severity_class(&d.severity),
                icon = severity_icon(&d.severity),
            )
            .unwrap();
            if let Some(ref id) = d.artifact_id {
                write!(
                    out,
                    "<a href=\"#art-{id}\"><strong>{id}</strong></a> ",
                    id = html_escape(id),
                )
                .unwrap();
            }
            write!(
                out,
                "<span class=\"diag-rule\">[{}]</span> {}",
                html_escape(&d.rule),
                html_escape(&d.message),
            )
            .unwrap();
            out.push_str("</li>\n");
        }
        out.push_str("</ul>\n");
    }
    out
}

// ── README page ─────────────────────────────────────────────────────────

/// Render a short `README.html` page that explains what this export is
/// and how to customize `config.js`.
pub fn render_readme(config: &ExportConfig) -> String {
    let css = build_css(config);
    let mut out = format!(
        "<!DOCTYPE html>\n\
         <html lang=\"en\">\n\
         <head>\n\
         <meta charset=\"utf-8\">\n\
         <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\
         <title>README — Rivet Export</title>\n\
         <style>{css}</style>\n\
         </head>\n\
         <body>\n",
    );

    out.push_str("<main>\n");
    out.push_str("<h1>Rivet HTML Export</h1>\n");
    out.push_str(
        "<p>This directory contains a static HTML export generated by \
                  <a href=\"https://github.com/pulseengine/rivet\">Rivet</a>, \
                  an SDLC traceability tool for safety-critical systems.</p>\n",
    );

    out.push_str("<h2>What is included</h2>\n");
    out.push_str("<ul>\n");
    out.push_str("<li><strong>index.html</strong> &mdash; Dashboard with artifact counts, validation summary, and coverage</li>\n");
    out.push_str("<li><strong>requirements.html</strong> &mdash; All artifacts grouped by type with anchor IDs</li>\n");
    out.push_str("<li><strong>documents.html</strong> &mdash; Document index with links to individual document pages</li>\n");
    out.push_str("<li><strong>doc-{ID}.html</strong> &mdash; Individual documents with resolved artifact links</li>\n");
    out.push_str(
        "<li><strong>stpa.html</strong> &mdash; STPA and STPA-Sec analysis hierarchy</li>\n",
    );
    out.push_str(
        "<li><strong>matrix.html</strong> &mdash; Traceability matrix (type x type)</li>\n",
    );
    out.push_str(
        "<li><strong>coverage.html</strong> &mdash; Per-rule traceability coverage</li>\n",
    );
    out.push_str(
        "<li><strong>validation.html</strong> &mdash; Diagnostics and rule check results</li>\n",
    );
    out.push_str(
        "<li><strong>graph.html</strong> &mdash; Traceability graph visualization (SVG)</li>\n",
    );
    out.push_str(
        "<li><strong>source.html</strong> &mdash; Source browser listing artifacts by file</li>\n",
    );
    out.push_str(
        "<li><strong>results.html</strong> &mdash; Test run results and pass rates</li>\n",
    );
    out.push_str(
        "<li><strong>config.js</strong> &mdash; Runtime configuration file (see below)</li>\n",
    );
    out.push_str("</ul>\n");

    out.push_str("<h2>Customizing config.js</h2>\n");
    out.push_str(
        "<p>Edit <code>config.js</code> to set deployment-specific values. \
                  No rebuild is needed &mdash; the HTML pages read this file at load time.</p>\n",
    );
    out.push_str("<pre><code>var RIVET_EXPORT = {\n");
    out.push_str("  homepage: \"https://example.com/projects/\",\n");
    out.push_str("  projectName: \"My Project\",\n");
    out.push_str("  versionLabel: \"v0.1.0\",\n");
    out.push_str("  versions: [\n");
    out.push_str("    { \"label\": \"v0.1.0\", \"path\": \"../v0.1.0/\" },\n");
    out.push_str("    { \"label\": \"v0.2.0\", \"path\": \"../v0.2.0/\" }\n");
    out.push_str("  ],\n");
    out.push_str("  // externalCss: \"/main.css\",\n");
    out.push_str("};\n");
    out.push_str("</code></pre>\n");

    out.push_str("<h3>External CSS</h3>\n");
    out.push_str(
        "<p>Set <code>externalCss</code> to a URL to replace the embedded styles \
                  with an external stylesheet. This is useful when deploying under a \
                  parent site that has its own CSS.</p>\n",
    );

    out.push_str("<h2>Learn more</h2>\n");
    out.push_str("<p>Rivet source and documentation: \
                  <a href=\"https://github.com/pulseengine/rivet\">github.com/pulseengine/rivet</a></p>\n");

    out.push_str("</main>\n");
    out.push_str("</body>\n</html>\n");
    out
}

// ── Tests ────────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;
    use crate::model::Artifact;
    use crate::schema::{Severity, TraceabilityRule};
    use crate::test_helpers::{artifact_with_links, minimal_schema};

    fn test_schema() -> Schema {
        let mut file = minimal_schema("test");
        file.traceability_rules = vec![TraceabilityRule {
            name: "req-to-dd".into(),
            description: "Requirements must be satisfied by design decisions".into(),
            source_type: "requirement".into(),
            required_link: None,
            required_backlink: Some("satisfies".into()),
            target_types: vec![],
            from_types: vec!["design-decision".into()],
            severity: Severity::Warning,
        }];
        Schema::merge(&[file])
    }

    fn make_artifact(id: &str, atype: &str, links: &[(&str, &str)]) -> Artifact {
        let mut a = artifact_with_links(id, atype, links);
        a.title = format!("Title for {id}");
        a.description = Some(format!("Description of {id}"));
        a.status = Some("draft".into());
        a.tags = vec!["core".into()];
        a
    }

    fn test_fixtures() -> (Store, Schema, LinkGraph, Vec<Diagnostic>) {
        let schema = test_schema();
        let mut store = Store::new();
        store
            .insert(make_artifact("REQ-001", "requirement", &[]))
            .unwrap();
        store
            .insert(make_artifact("REQ-002", "requirement", &[]))
            .unwrap();
        store
            .insert(make_artifact(
                "DD-001",
                "design-decision",
                &[("satisfies", "REQ-001")],
            ))
            .unwrap();
        store
            .insert(make_artifact(
                "FEAT-001",
                "feature",
                &[("implements", "REQ-001")],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diagnostics = crate::validate::validate(&store, &schema, &graph);
        (store, schema, graph, diagnostics)
    }

    fn default_config() -> ExportConfig {
        ExportConfig::default()
    }

    // rivet: verifies REQ-035
    #[test]
    fn index_contains_artifact_counts() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let html = render_index(
            &store,
            &schema,
            &graph,
            &diagnostics,
            "TestProject",
            "0.1.0",
            &default_config(),
        );

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("TestProject"));
        assert!(html.contains(">4<")); // total artifact count
        assert!(html.contains("requirement"));
        assert!(html.contains("design-decision"));
        assert!(html.contains("feature"));
        // Navigation links (relative)
        assert!(html.contains("./requirements.html"));
        assert!(html.contains("./matrix.html"));
        assert!(html.contains("./coverage.html"));
        assert!(html.contains("./validation.html"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn requirements_includes_all_artifacts() {
        let (store, schema, graph, _) = test_fixtures();
        let html = render_requirements(&store, &schema, &graph, &default_config());

        assert!(html.contains("<!DOCTYPE html>"));
        // All 4 artifact IDs present
        assert!(html.contains("REQ-001"));
        assert!(html.contains("REQ-002"));
        assert!(html.contains("DD-001"));
        assert!(html.contains("FEAT-001"));
        // Anchor IDs for linking
        assert!(html.contains("id=\"art-REQ-001\""));
        assert!(html.contains("id=\"art-DD-001\""));
        // Links rendered
        assert!(html.contains("satisfies"));
        // Status badges
        assert!(html.contains("badge-draft"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn matrix_has_correct_structure() {
        let (store, schema, graph, _) = test_fixtures();
        let html = render_traceability_matrix(&store, &schema, &graph, &default_config());

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Traceability Matrix"));
        // Type names in header
        assert!(html.contains("requirement"));
        assert!(html.contains("design-decision"));
        assert!(html.contains("feature"));
        // Table structure
        assert!(html.contains("<table>"));
        assert!(html.contains("Source \\ Target"));
        // At least one green cell (DD-001 links to REQ-001)
        assert!(html.contains("cell-green"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn validation_groups_by_severity() {
        let (store, schema, graph, _) = test_fixtures();
        let diagnostics = crate::validate::validate(&store, &schema, &graph);
        let html = render_validation(&diagnostics, &default_config());

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Validation Report"));
        // Should contain warnings (REQ-002 uncovered)
        assert!(html.contains("Warnings"));
        // Diagnostic references the uncovered artifact
        assert!(html.contains("REQ-002"));
        // Rule name shown
        assert!(html.contains("req-to-dd"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn all_pages_contain_nav_and_footer() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let cfg = default_config();
        let result_store = ResultStore::new();

        let pages = [
            render_index(&store, &schema, &graph, &diagnostics, "Test", "0.1.0", &cfg),
            render_requirements(&store, &schema, &graph, &cfg),
            render_traceability_matrix(&store, &schema, &graph, &cfg),
            render_coverage(&store, &schema, &graph, &cfg),
            render_validation(&diagnostics, &cfg),
            render_stpa(&store, &graph, &cfg),
            render_graph(&store, &graph, &cfg),
            render_source(&store, &cfg),
            render_results(&result_store, &cfg),
        ];

        for (i, page) in pages.iter().enumerate() {
            assert!(page.contains("<nav>"), "page {i} missing <nav>");
            assert!(page.contains("nav-links"), "page {i} missing nav-links");
            assert!(
                page.contains("Generated by Rivet"),
                "page {i} missing footer"
            );
            assert!(
                page.contains("</html>"),
                "page {i} missing closing html tag"
            );
        }
    }

    // rivet: verifies REQ-035
    #[test]
    fn coverage_page_shows_rules() {
        let (store, schema, graph, _) = test_fixtures();
        let html = render_coverage(&store, &schema, &graph, &default_config());

        assert!(html.contains("Coverage Report"));
        assert!(html.contains("req-to-dd"));
        assert!(html.contains("Overall coverage"));
        // The rule has REQ-002 uncovered
        assert!(html.contains("REQ-002"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn single_page_contains_all_sections() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let doc_store = DocumentStore::new();
        let html = render_single_page(
            &store,
            &schema,
            &graph,
            &diagnostics,
            "SingleTest",
            "0.1.0",
            &default_config(),
            &doc_store,
        );

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("id=\"index\""));
        assert!(html.contains("id=\"requirements\""));
        assert!(html.contains("id=\"documents\""));
        assert!(html.contains("id=\"matrix\""));
        assert!(html.contains("id=\"coverage\""));
        assert!(html.contains("id=\"validation\""));
        assert!(html.contains("SingleTest"));
        assert!(html.contains("Generated by Rivet"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn html_escape_works() {
        assert_eq!(html_escape("<b>test</b>"), "&lt;b&gt;test&lt;/b&gt;");
        assert_eq!(html_escape("a & b"), "a &amp; b");
        assert_eq!(html_escape("\"quoted\""), "&quot;quoted&quot;");
    }

    // rivet: verifies REQ-035
    #[test]
    fn dark_theme_contains_design_tokens() {
        let cfg = ExportConfig {
            theme: ExportTheme::Dark,
            ..Default::default()
        };
        let css = build_css(&cfg);
        assert!(css.contains("#0f1117")); // dark bg
        assert!(css.contains("#6c8cff")); // accent
        assert!(css.contains("Atkinson Hyperlegible")); // font
        assert!(css.contains("@import")); // Google Fonts
    }

    // rivet: verifies REQ-035
    #[test]
    fn light_theme_uses_light_colors() {
        let cfg = ExportConfig {
            theme: ExportTheme::Light,
            ..Default::default()
        };
        let css = build_css(&cfg);
        assert!(css.contains("#ffffff")); // light bg
        assert!(css.contains("#2563eb")); // accent
    }

    // rivet: verifies REQ-035
    #[test]
    fn offline_mode_skips_google_fonts() {
        let cfg = ExportConfig {
            offline: true,
            ..Default::default()
        };
        let css = build_css(&cfg);
        assert!(!css.contains("@import"));
        assert!(!css.contains("fonts.googleapis.com"));
        assert!(css.contains("system-ui")); // system fallback
    }

    // rivet: verifies REQ-035
    #[test]
    fn all_links_are_relative() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let cfg = default_config();
        let html = render_index(&store, &schema, &graph, &diagnostics, "Test", "0.1.0", &cfg);
        assert!(html.contains("./requirements.html"));
        assert!(html.contains("./matrix.html"));
        assert!(html.contains("./coverage.html"));
        assert!(html.contains("./documents.html"));
        assert!(html.contains("./validation.html"));
        assert!(html.contains("./stpa.html"));
        assert!(html.contains("./graph.html"));
        assert!(html.contains("./source.html"));
        assert!(html.contains("./results.html"));
        // No absolute path prefixes
        assert!(!html.contains("/projects/"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn print_media_overrides_to_light() {
        let cfg = ExportConfig {
            theme: ExportTheme::Dark,
            ..Default::default()
        };
        let css = build_css(&cfg);
        assert!(css.contains("@media print"));
        // Print overrides dark variables to light
        assert!(css.contains("--bg: #ffffff"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn nav_bar_includes_documents_link() {
        let cfg = default_config();
        let (store, schema, graph, diagnostics) = test_fixtures();
        let html = render_index(&store, &schema, &graph, &diagnostics, "Test", "0.1.0", &cfg);
        assert!(html.contains("./documents.html"));
        assert!(html.contains("Documents"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn documents_index_empty_store() {
        let cfg = default_config();
        let doc_store = DocumentStore::new();
        let html = render_documents_index(&doc_store, &cfg);
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Documents"));
        assert!(html.contains("No documents found"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn documents_index_with_docs() {
        let cfg = default_config();
        let mut doc_store = DocumentStore::new();
        let doc = crate::document::parse_document(
            "---\nid: SRS-001\ntype: specification\ntitle: Test Spec\n---\n\n# Test\n\n[[REQ-001]]\n",
            None,
        )
        .unwrap();
        doc_store.insert(doc);
        let html = render_documents_index(&doc_store, &cfg);
        assert!(html.contains("SRS-001"));
        assert!(html.contains("Test Spec"));
        assert!(html.contains("doc-SRS-001.html"));
        assert!(html.contains("1 document(s)"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn document_page_renders_body() {
        let cfg = default_config();
        let (store, _schema, graph, _) = test_fixtures();
        let doc = crate::document::parse_document(
            "---\nid: DOC-001\ntype: design\ntitle: Design Doc\n---\n\n# Design\n\nReferences [[REQ-001]] here.\n",
            None,
        )
        .unwrap();
        let html = render_document_page(&doc, &store, &graph, &_schema, &[], "abc1234", false, &cfg);
        assert!(html.contains("DOC-001"));
        assert!(html.contains("Design Doc"));
        assert!(html.contains("Design"));
        // The [[REQ-001]] link should be rewritten to requirements.html#art-REQ-001
        assert!(html.contains("requirements.html#art-REQ-001"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn rewrite_artifact_links_replaces_htmx() {
        let input = r##"<a class="artifact-ref" hx-get="/artifacts/REQ-001" hx-target="#content" href="#">REQ-001</a>"##;
        let result = rewrite_artifact_links(input, "./requirements.html");
        assert!(result.contains("./requirements.html#art-REQ-001"));
        assert!(!result.contains("hx-get"));
        assert!(!result.contains("href=\"#\""));
    }

    // rivet: verifies REQ-035
    #[test]
    fn nav_bar_has_hidden_placeholders() {
        let cfg = default_config();
        let nav = nav_bar("index", &cfg, false);
        // Home link is hidden placeholder
        assert!(nav.contains("id=\"home-link\""));
        assert!(nav.contains("style=\"display:none\""));
        // Version switcher is hidden placeholder
        assert!(nav.contains("id=\"version-select\""));
        assert!(nav.contains("version-switcher"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn nav_bar_has_export_header_wrapper() {
        let cfg = default_config();
        let nav = nav_bar("index", &cfg, false);
        assert!(nav.contains("<header class=\"export-header\">"));
        assert!(nav.contains("</header>"));
        assert!(nav.contains("nav-links"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn pages_include_config_js_script_tag() {
        let cfg = default_config();
        let (store, schema, graph, diagnostics) = test_fixtures();
        let html = render_index(&store, &schema, &graph, &diagnostics, "Test", "0.1.0", &cfg);
        assert!(html.contains("<script src=\"./config.js\"></script>"));
        // Inline runtime script is present
        assert!(html.contains("RIVET_EXPORT"));
        assert!(html.contains("DOMContentLoaded"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn pages_work_without_config_js_graceful_degradation() {
        // When config.js is missing, RIVET_EXPORT is undefined.
        // The inline script uses `window.RIVET_EXPORT || {}` so it
        // degrades gracefully — the home link and version switcher
        // remain hidden (display:none).
        let cfg = default_config();
        let nav = nav_bar("index", &cfg, false);
        // Both are hidden by default
        assert!(nav.contains("id=\"home-link\""));
        assert!(nav.contains("style=\"display:none\""));
        // Navigation links still work
        assert!(nav.contains("./requirements.html"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn generate_config_js_default() {
        let js = generate_config_js(None, "dev", &[], "rivet");
        assert!(js.contains("RIVET_EXPORT"));
        assert!(js.contains("homepage: \"\""));
        assert!(js.contains("versionLabel: \"dev\""));
        assert!(js.contains("projectName: \"rivet\""));
        // Empty versions has comment placeholder
        assert!(js.contains("// {"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn generate_config_js_with_values() {
        let versions = vec![
            VersionEntry {
                label: "v0.1.0".into(),
                path: "../v0.1.0/".into(),
            },
            VersionEntry {
                label: "v0.2.0".into(),
                path: "../v0.2.0/".into(),
            },
        ];
        let js = generate_config_js(
            Some("https://example.com/projects/"),
            "v0.3.0",
            &versions,
            "my-project",
        );
        assert!(js.contains("homepage: \"https://example.com/projects/\""));
        assert!(js.contains("versionLabel: \"v0.3.0\""));
        assert!(js.contains("\"label\": \"v0.1.0\""));
        assert!(js.contains("\"path\": \"../v0.1.0/\""));
        assert!(js.contains("\"label\": \"v0.2.0\""));
        assert!(js.contains("projectName: \"my-project\""));
    }

    // rivet: verifies REQ-035
    #[test]
    fn generate_config_js_escapes_special_chars() {
        let js = generate_config_js(
            Some("https://example.com/\"test\""),
            "v1.0\ninjection",
            &[],
            "proj\\name",
        );
        assert!(js.contains("\\\"test\\\""));
        assert!(js.contains("v1.0\\ninjection"));
        assert!(js.contains("proj\\\\name"));
    }

    // ── STPA page tests ─────────────────────────────────────────────────

    fn stpa_fixtures() -> (Store, Schema, LinkGraph) {
        let schema = test_schema();
        let mut store = Store::new();
        // Build a small STPA hierarchy: loss -> hazard -> constraint & uca
        let mut loss = artifact_with_links("L-001", "loss", &[]);
        loss.title = "System collision".into();
        store.insert(loss).unwrap();

        let mut haz = artifact_with_links("H-001", "hazard", &[("leads-to-loss", "L-001")]);
        haz.title = "Vehicle enters opposing lane".into();
        store.insert(haz).unwrap();

        let mut sc = artifact_with_links("SC-001", "system-constraint", &[("prevents", "H-001")]);
        sc.title = "System must keep vehicle in lane".into();
        store.insert(sc).unwrap();

        let mut uca = artifact_with_links(
            "UCA-001",
            "uca",
            &[("leads-to-hazard", "H-001"), ("issued-by", "CTRL-001")],
        );
        uca.title = "Not providing steering correction".into();
        store.insert(uca).unwrap();

        let mut ctrl = artifact_with_links("CTRL-001", "controller", &[]);
        ctrl.title = "Lane Keep Assist".into();
        store.insert(ctrl).unwrap();

        let graph = LinkGraph::build(&store, &schema);
        (store, schema, graph)
    }

    // rivet: verifies REQ-035
    #[test]
    fn stpa_page_contains_hierarchy() {
        let (store, _schema, graph) = stpa_fixtures();
        let html = render_stpa(&store, &graph, &default_config());

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("STPA Analysis"));
        // Type counts
        assert!(html.contains("loss"));
        assert!(html.contains("hazard"));
        assert!(html.contains("system-constraint"));
        assert!(html.contains("uca"));
        // Hierarchy links
        assert!(html.contains("L-001"));
        assert!(html.contains("H-001"));
        assert!(html.contains("SC-001"));
        assert!(html.contains("UCA-001"));
        // Links to requirements page
        assert!(html.contains("requirements.html#art-L-001"));
        assert!(html.contains("requirements.html#art-H-001"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn stpa_page_no_artifacts() {
        let schema = test_schema();
        let store = Store::new();
        let graph = LinkGraph::build(&store, &schema);
        let html = render_stpa(&store, &graph, &default_config());
        assert!(html.contains("No STPA artifacts found"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn stpa_page_has_nav_and_footer() {
        let (store, _schema, graph) = stpa_fixtures();
        let html = render_stpa(&store, &graph, &default_config());
        assert!(html.contains("<nav>"), "stpa page missing nav");
        assert!(
            html.contains("Generated by Rivet"),
            "stpa page missing footer"
        );
        // Nav should show STPA as active (bold, not a link)
        assert!(html.contains("<strong>STPA</strong>"));
    }

    // ── Graph page tests ────────────────────────────────────────────────

    // rivet: verifies REQ-035
    #[test]
    fn graph_page_renders_svg() {
        let (store, schema, graph, _diagnostics) = test_fixtures();
        let html = render_graph(&store, &graph, &default_config());

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Traceability Graph"));
        assert!(html.contains("<svg"));
        assert!(html.contains("</svg>"));
        // Legend present
        assert!(html.contains("Legend"));
        // Node count info
        let node_count = graph.graph().node_count();
        assert!(html.contains(&format!("{node_count} nodes")));

        // Verify schema is not needed for graph render
        drop(schema);
    }

    // rivet: verifies REQ-035
    #[test]
    fn graph_page_empty_store() {
        let schema = test_schema();
        let store = Store::new();
        let graph = LinkGraph::build(&store, &schema);
        let html = render_graph(&store, &graph, &default_config());
        assert!(html.contains("No artifacts to display"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn graph_page_has_nav_and_footer() {
        let (store, _schema, graph, _diagnostics) = test_fixtures();
        let html = render_graph(&store, &graph, &default_config());
        assert!(html.contains("<nav>"), "graph page missing nav");
        assert!(
            html.contains("Generated by Rivet"),
            "graph page missing footer"
        );
        assert!(html.contains("<strong>Graph</strong>"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn nav_bar_includes_stpa_and_graph() {
        let cfg = default_config();
        let nav = nav_bar("index", &cfg, false);
        assert!(nav.contains("stpa.html"), "nav missing stpa link");
        assert!(nav.contains("graph.html"), "nav missing graph link");
        assert!(nav.contains(">STPA<"), "nav missing STPA label");
        assert!(nav.contains(">Graph<"), "nav missing Graph label");
    }

    // rivet: verifies REQ-035
    #[test]
    fn single_page_contains_stpa_and_graph_sections() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let doc_store = DocumentStore::new();
        let html = render_single_page(
            &store,
            &schema,
            &graph,
            &diagnostics,
            "SingleTest",
            "0.1.0",
            &default_config(),
            &doc_store,
        );
        assert!(
            html.contains("id=\"stpa\""),
            "single page missing stpa section"
        );
        assert!(
            html.contains("id=\"graph\""),
            "single page missing graph section"
        );
        // Graph section should contain SVG
        assert!(html.contains("<svg"), "single page missing graph SVG");
    }

    // rivet: verifies REQ-035
    #[test]
    fn index_page_links_to_stpa_and_graph() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let html = render_index(
            &store,
            &schema,
            &graph,
            &diagnostics,
            "TestProject",
            "0.1.0",
            &default_config(),
        );
        assert!(html.contains("./stpa.html"), "index missing stpa link");
        assert!(html.contains("./graph.html"), "index missing graph link");
    }

    // ── Source page tests ─────────────────────────────────────────────

    // rivet: verifies REQ-035
    #[test]
    fn source_page_renders_empty_store() {
        let store = Store::new();
        let html = render_source(&store, &default_config());
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Source Browser"));
        assert!(html.contains("No source files found"));
        assert!(html.contains("<nav>"));
        assert!(html.contains("Generated by Rivet"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn source_page_groups_artifacts_by_file() {
        let (store, _schema, _graph, _) = test_fixtures();
        let html = render_source(&store, &default_config());
        assert!(html.contains("Source Browser"));
        // All artifacts should appear (they have no source_file set, so grouped under "(unknown)")
        assert!(html.contains("(unknown)"));
        assert!(html.contains("REQ-001"));
        assert!(html.contains("DD-001"));
        assert!(html.contains("FEAT-001"));
        // Should have artifact count
        assert!(html.contains("4 artifact(s)"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn source_page_with_source_files() {
        let schema = test_schema();
        let mut store = Store::new();
        let mut a1 = make_artifact("REQ-010", "requirement", &[]);
        a1.source_file = Some(std::path::PathBuf::from("artifacts/reqs.yaml"));
        store.insert(a1).unwrap();
        let mut a2 = make_artifact("DD-010", "design-decision", &[]);
        a2.source_file = Some(std::path::PathBuf::from("artifacts/reqs.yaml"));
        store.insert(a2).unwrap();
        let mut a3 = make_artifact("FEAT-010", "feature", &[]);
        a3.source_file = Some(std::path::PathBuf::from("artifacts/features.yaml"));
        store.insert(a3).unwrap();

        let html = render_source(&store, &default_config());
        assert!(html.contains("2 source file(s)"));
        assert!(html.contains("3 artifact(s)"));
        assert!(html.contains("artifacts/reqs.yaml"));
        assert!(html.contains("artifacts/features.yaml"));
        // Links to requirements page
        assert!(html.contains("requirements.html#art-REQ-010"));
        drop(schema);
    }

    // rivet: verifies REQ-035
    #[test]
    fn source_page_has_file_anchors() {
        let schema = test_schema();
        let mut store = Store::new();
        let mut a = make_artifact("REQ-020", "requirement", &[]);
        a.source_file = Some(std::path::PathBuf::from("artifacts/test.yaml"));
        store.insert(a).unwrap();

        let html = render_source(&store, &default_config());
        // File anchor should exist
        assert!(html.contains("id=\"file-"));
        // Table header
        assert!(html.contains("<th>File</th>"));
        assert!(html.contains("<th>Artifact Count</th>"));
        assert!(html.contains("<th>Types</th>"));
        drop(schema);
    }

    // ── Results page tests ────────────────────────────────────────────

    // rivet: verifies REQ-035
    #[test]
    fn results_page_renders_empty_state() {
        let result_store = ResultStore::new();
        let html = render_results(&result_store, &default_config());
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Test Results"));
        assert!(html.contains("No Test Results"));
        assert!(html.contains("results/"));
        assert!(html.contains("<nav>"));
        assert!(html.contains("Generated by Rivet"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn results_page_shows_summary() {
        use crate::results::{RunMetadata, TestResult, TestRun, TestStatus};

        let mut result_store = ResultStore::new();
        result_store.insert(TestRun {
            run: RunMetadata {
                id: "run-1".into(),
                timestamp: "2026-03-20T10:00:00Z".into(),
                source: Some("CI".into()),
                environment: Some("Linux".into()),
                commit: Some("abc123".into()),
            },
            results: vec![
                TestResult {
                    artifact: "REQ-001".into(),
                    status: TestStatus::Pass,
                    duration: Some("1.2s".into()),
                    message: None,
                },
                TestResult {
                    artifact: "REQ-002".into(),
                    status: TestStatus::Fail,
                    duration: None,
                    message: Some("Threshold exceeded".into()),
                },
            ],
            source_file: None,
        });

        let html = render_results(&result_store, &default_config());
        assert!(html.contains("Test Results"));
        // Summary cards
        assert!(html.contains("Test Runs"));
        assert!(html.contains("Pass Rate"));
        assert!(html.contains("50.0%"));
        // Run details
        assert!(html.contains("run-1"));
        assert!(html.contains("CI"));
        assert!(html.contains("Linux"));
        assert!(html.contains("abc123"));
        // Results table
        assert!(html.contains("REQ-001"));
        assert!(html.contains("REQ-002"));
        assert!(html.contains("badge-green"));
        assert!(html.contains("badge-red"));
        assert!(html.contains("Threshold exceeded"));
        assert!(html.contains("1.2s"));
        // Links to requirements
        assert!(html.contains("requirements.html#art-REQ-001"));
    }

    // rivet: verifies REQ-035
    #[test]
    fn nav_bar_includes_source_and_results() {
        let cfg = default_config();
        let nav = nav_bar("index", &cfg, false);
        assert!(nav.contains("source.html"), "nav missing source link");
        assert!(nav.contains("results.html"), "nav missing results link");
        assert!(nav.contains(">Source<"), "nav missing Source label");
        assert!(nav.contains(">Results<"), "nav missing Results label");
    }
}
