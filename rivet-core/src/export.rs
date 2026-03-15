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

use std::collections::BTreeMap;
use std::fmt::Write as _;

use crate::coverage;
use crate::document::{self, ArtifactInfo, DocumentStore};
use crate::links::LinkGraph;
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

/// A version entry for the version switcher dropdown.
#[derive(Debug, Clone)]
pub struct VersionEntry {
    /// Label shown in the dropdown (e.g. "v0.1.0").
    pub label: String,
    /// Relative path to the version root (e.g. "../v0.1.0/").
    pub path: String,
}

/// Configuration for HTML export rendering.
#[derive(Debug, Clone, Default)]
pub struct ExportConfig {
    /// Visual theme.
    pub theme: ExportTheme,
    /// Base path prefix for all links (e.g. `/projects/rivet/v0.1.0/`).
    /// When set, navigation hrefs are prefixed with this path.
    pub base_path: Option<String>,
    /// When true, skip Google Fonts import and use system fonts only.
    pub offline: bool,
    /// URL for the home/back link (e.g. `https://pulseengine.eu/projects/`).
    pub homepage: Option<String>,
    /// Version label shown in the version switcher (e.g. "v0.1.0").
    pub version_label: Option<String>,
    /// Other versions for the version switcher dropdown.
    pub versions: Vec<VersionEntry>,
}

impl ExportConfig {
    /// Resolve a sibling page href respecting `base_path`.
    fn page_href(&self, filename: &str) -> String {
        match &self.base_path {
            Some(base) => {
                let base = base.trim_end_matches('/');
                format!("{base}/{filename}")
            }
            None => format!("./{filename}"),
        }
    }
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
         </head>\n\
         <body>\n",
        title = html_escape(title),
    )
}

fn nav_bar(active: &str, config: &ExportConfig, is_single_page: bool) -> String {
    let pages = [
        ("index", "Overview", "index.html"),
        ("requirements", "Requirements", "requirements.html"),
        ("documents", "Documents", "documents.html"),
        ("matrix", "Matrix", "matrix.html"),
        ("coverage", "Coverage", "coverage.html"),
        ("validation", "Validation", "validation.html"),
    ];

    let mut out = String::from("<header class=\"export-header\">\n<nav>\n");

    // Homepage back-link
    if let Some(ref url) = config.homepage {
        let project_label = config
            .version_label
            .as_deref()
            .unwrap_or("Rivet");
        writeln!(
            out,
            "  <a href=\"{url}\" class=\"home-link\">&larr; {label}</a>",
            url = html_escape(url),
            label = html_escape(project_label),
        )
        .unwrap();
    }

    // Version switcher
    let current_label = config.version_label.as_deref().unwrap_or("dev");
    if !config.versions.is_empty() || config.version_label.is_some() {
        out.push_str("  <div class=\"version-switcher\">\n");
        out.push_str("    <select onchange=\"location.href=this.value\">\n");
        writeln!(
            out,
            "      <option value=\"./\" selected>{}</option>",
            html_escape(current_label),
        )
        .unwrap();
        for v in &config.versions {
            writeln!(
                out,
                "      <option value=\"{}\">{}</option>",
                html_escape(&v.path),
                html_escape(&v.label),
            )
            .unwrap();
        }
        out.push_str("    </select>\n");
        out.push_str("  </div>\n");
    }

    // Navigation links
    out.push_str("  <div class=\"nav-links\">\n");
    for (id, label, filename) in &pages {
        if *id == active {
            writeln!(out, "    <strong>{label}</strong>").unwrap();
        } else if is_single_page {
            writeln!(out, "    <a href=\"#{id}\">{label}</a>").unwrap();
        } else {
            let href = config.page_href(filename);
            writeln!(out, "    <a href=\"{href}\">{label}</a>").unwrap();
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
    let req_href = config.page_href("requirements.html");
    let docs_href = config.page_href("documents.html");
    let matrix_href = config.page_href("matrix.html");
    let cov_href = config.page_href("coverage.html");
    let val_href = config.page_href("validation.html");

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
            let req_href = config.page_href("requirements.html");
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
    let req_href = config.page_href("requirements.html");
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

// ── Document renderers ──────────────────────────────────────────────────

/// Render the documents index page listing all documents with links.
pub fn render_documents_index(
    doc_store: &DocumentStore,
    config: &ExportConfig,
) -> String {
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
            let doc_href = config.page_href(&format!("doc-{}.html", doc.id));
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
    let req_href = config.page_href("requirements.html");
    let body_html = render_document_body_for_export(doc, store, graph, &req_href);
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
    let raw_html = document::render_to_html(doc, artifact_exists, artifact_info);

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

    let pattern = "class=\"artifact-ref\" hx-get=\"/artifacts/";
    while let Some(start) = rest.find(pattern) {
        // Copy everything before the match
        result.push_str(&rest[..start]);

        let after_pattern = &rest[start + pattern.len()..];
        if let Some(quote_end) = after_pattern.find('"') {
            let artifact_id = &after_pattern[..quote_end];
            // Skip past the hx-target and href="#" parts
            let remaining = &after_pattern[quote_end..];
            if let Some(href_start) = remaining.find("href=\"#\"") {
                let after_href = &remaining[href_start + 8..];
                // Write the replacement
                write!(
                    result,
                    "class=\"artifact-ref\" href=\"{req_href}#art-{id}\"",
                    id = html_escape(artifact_id),
                )
                .unwrap();
                rest = after_href;
            } else {
                // Fallback: just copy as-is
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
        store.insert(make_artifact("REQ-001", "requirement", &[])).unwrap();
        store.insert(make_artifact("REQ-002", "requirement", &[])).unwrap();
        store
            .insert(make_artifact("DD-001", "design-decision", &[("satisfies", "REQ-001")]))
            .unwrap();
        store
            .insert(make_artifact("FEAT-001", "feature", &[("implements", "REQ-001")]))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diagnostics = crate::validate::validate(&store, &schema, &graph);
        (store, schema, graph, diagnostics)
    }

    fn default_config() -> ExportConfig {
        ExportConfig::default()
    }

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

    #[test]
    fn all_pages_contain_nav_and_footer() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let cfg = default_config();

        let pages = [
            render_index(&store, &schema, &graph, &diagnostics, "Test", "0.1.0", &cfg),
            render_requirements(&store, &schema, &graph, &cfg),
            render_traceability_matrix(&store, &schema, &graph, &cfg),
            render_coverage(&store, &schema, &graph, &cfg),
            render_validation(&diagnostics, &cfg),
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

    #[test]
    fn html_escape_works() {
        assert_eq!(html_escape("<b>test</b>"), "&lt;b&gt;test&lt;/b&gt;");
        assert_eq!(html_escape("a & b"), "a &amp; b");
        assert_eq!(html_escape("\"quoted\""), "&quot;quoted&quot;");
    }

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

    #[test]
    fn base_path_prefixes_links() {
        let cfg = ExportConfig {
            base_path: Some("/projects/rivet/v0.1.0/".into()),
            ..Default::default()
        };
        assert_eq!(
            cfg.page_href("requirements.html"),
            "/projects/rivet/v0.1.0/requirements.html"
        );

        let (store, schema, graph, diagnostics) = test_fixtures();
        let html = render_index(
            &store,
            &schema,
            &graph,
            &diagnostics,
            "Test",
            "0.1.0",
            &cfg,
        );
        assert!(html.contains("/projects/rivet/v0.1.0/requirements.html"));
        assert!(html.contains("/projects/rivet/v0.1.0/matrix.html"));
    }

    #[test]
    fn default_config_uses_relative_links() {
        let cfg = default_config();
        assert_eq!(cfg.page_href("index.html"), "./index.html");
        assert_eq!(cfg.page_href("requirements.html"), "./requirements.html");
    }

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

    #[test]
    fn nav_bar_includes_documents_link() {
        let cfg = default_config();
        let (store, schema, graph, diagnostics) = test_fixtures();
        let html = render_index(
            &store,
            &schema,
            &graph,
            &diagnostics,
            "Test",
            "0.1.0",
            &cfg,
        );
        assert!(html.contains("./documents.html"));
        assert!(html.contains("Documents"));
    }

    #[test]
    fn documents_index_empty_store() {
        let cfg = default_config();
        let doc_store = DocumentStore::new();
        let html = render_documents_index(&doc_store, &cfg);
        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("Documents"));
        assert!(html.contains("No documents found"));
    }

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

    #[test]
    fn document_page_renders_body() {
        let cfg = default_config();
        let (store, _schema, graph, _) = test_fixtures();
        let doc = crate::document::parse_document(
            "---\nid: DOC-001\ntype: design\ntitle: Design Doc\n---\n\n# Design\n\nReferences [[REQ-001]] here.\n",
            None,
        )
        .unwrap();
        let html = render_document_page(&doc, &store, &graph, &cfg);
        assert!(html.contains("DOC-001"));
        assert!(html.contains("Design Doc"));
        assert!(html.contains("Design"));
        // The [[REQ-001]] link should be rewritten to requirements.html#art-REQ-001
        assert!(html.contains("requirements.html#art-REQ-001"));
    }

    #[test]
    fn rewrite_artifact_links_replaces_htmx() {
        let input = r##"<a class="artifact-ref" hx-get="/artifacts/REQ-001" hx-target="#content" href="#">REQ-001</a>"##;
        let result = rewrite_artifact_links(input, "./requirements.html");
        assert!(result.contains("./requirements.html#art-REQ-001"));
        assert!(!result.contains("hx-get"));
        assert!(!result.contains("href=\"#\""));
    }

    #[test]
    fn version_switcher_renders_when_configured() {
        let cfg = ExportConfig {
            version_label: Some("v0.2.0".into()),
            versions: vec![VersionEntry {
                label: "v0.1.0".into(),
                path: "../v0.1.0/".into(),
            }],
            ..Default::default()
        };
        let nav = nav_bar("index", &cfg, false);
        assert!(nav.contains("version-switcher"));
        assert!(nav.contains("v0.2.0"));
        assert!(nav.contains("v0.1.0"));
        assert!(nav.contains("../v0.1.0/"));
    }

    #[test]
    fn homepage_link_renders_when_configured() {
        let cfg = ExportConfig {
            homepage: Some("https://example.com/projects/".into()),
            version_label: Some("v1.0".into()),
            ..Default::default()
        };
        let nav = nav_bar("index", &cfg, false);
        assert!(nav.contains("home-link"));
        assert!(nav.contains("https://example.com/projects/"));
        assert!(nav.contains("v1.0"));
    }

    #[test]
    fn nav_bar_has_export_header_wrapper() {
        let cfg = default_config();
        let nav = nav_bar("index", &cfg, false);
        assert!(nav.contains("<header class=\"export-header\">"));
        assert!(nav.contains("</header>"));
        assert!(nav.contains("nav-links"));
    }
}
