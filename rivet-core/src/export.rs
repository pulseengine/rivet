//! Static HTML report generation for audit evidence and publishing.
//!
//! Renders five self-contained HTML pages (index, requirements, matrix,
//! coverage, validation) plus a single-page combined variant.  Each page
//! embeds its own CSS and requires no external resources.

use std::collections::BTreeMap;
use std::fmt::Write as _;

use crate::coverage;
use crate::links::LinkGraph;
use crate::schema::{Schema, Severity};
use crate::store::Store;
use crate::validate::Diagnostic;

// ── Shared CSS ──────────────────────────────────────────────────────────

/// Professional CSS theme for exported reports.
const EXPORT_CSS: &str = r#"
:root {
    --bg: #ffffff;
    --fg: #1a1a2e;
    --muted: #6c6c8a;
    --border: #d4d4e0;
    --surface: #f5f5fa;
    --accent: #2563eb;
    --accent-light: #dbeafe;
    --green: #16a34a;
    --green-bg: #dcfce7;
    --yellow: #ca8a04;
    --yellow-bg: #fef9c3;
    --red: #dc2626;
    --red-bg: #fee2e2;
    --info-blue: #0284c7;
    --info-bg: #e0f2fe;
    --font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
}
* { box-sizing: border-box; margin: 0; padding: 0; }
html { font-size: 15px; }
body {
    font-family: var(--font-sans);
    color: var(--fg);
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
a:hover { text-decoration: underline; }
p { margin-bottom: 0.75rem; }
nav {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 0.75rem 1rem;
    margin-bottom: 2rem;
    display: flex;
    gap: 1.5rem;
    flex-wrap: wrap;
    align-items: center;
}
nav .nav-title { font-weight: 600; color: var(--fg); margin-right: 0.5rem; }
nav a { font-weight: 500; }
main { min-height: 60vh; }
footer {
    margin-top: 3rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border);
    font-size: 0.85rem;
    color: var(--muted);
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
th { background: var(--surface); font-weight: 600; }
tr:nth-child(even) td { background: var(--surface); }
.badge {
    display: inline-block;
    padding: 0.15rem 0.5rem;
    border-radius: 4px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.03em;
}
.badge-approved, .badge-green { background: var(--green-bg); color: var(--green); }
.badge-draft, .badge-yellow { background: var(--yellow-bg); color: var(--yellow); }
.badge-obsolete, .badge-red { background: var(--red-bg); color: var(--red); }
.badge-info { background: var(--info-bg); color: var(--info-blue); }
.badge-default { background: var(--surface); color: var(--muted); }
.severity-error { color: var(--red); font-weight: 600; }
.severity-warning { color: var(--yellow); font-weight: 600; }
.severity-info { color: var(--info-blue); font-weight: 600; }
.summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    gap: 1rem;
    margin: 1.5rem 0;
}
.summary-card {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 8px;
    padding: 1rem 1.25rem;
}
.summary-card .label { font-size: 0.85rem; color: var(--muted); }
.summary-card .value { font-size: 1.6rem; font-weight: 700; }
.artifact-section {
    margin-bottom: 1.5rem;
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 1rem 1.25rem;
}
.artifact-section .artifact-id { font-family: var(--font-mono); font-weight: 600; }
.artifact-section .artifact-meta { font-size: 0.85rem; color: var(--muted); margin-bottom: 0.5rem; }
.tag { display: inline-block; background: var(--accent-light); color: var(--accent); padding: 0.1rem 0.4rem; border-radius: 3px; font-size: 0.8rem; margin-right: 0.25rem; }
.cell-green { background: var(--green-bg) !important; }
.cell-yellow { background: var(--yellow-bg) !important; }
.cell-red { background: var(--red-bg) !important; }
.toc { column-count: 2; column-gap: 2rem; margin: 1rem 0; }
.toc-item { break-inside: avoid; margin-bottom: 0.25rem; }
.toc-item a { font-family: var(--font-mono); font-size: 0.9rem; }
ul.diag-list { list-style: none; padding: 0; }
ul.diag-list li { padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); }
ul.diag-list li:last-child { border-bottom: none; }
.diag-rule { font-family: var(--font-mono); font-size: 0.8rem; color: var(--muted); }

@media print {
    nav { display: none; }
    body { max-width: none; padding: 0.5cm; font-size: 10pt; }
    .artifact-section { break-inside: avoid; }
    table { font-size: 9pt; }
    h2 { break-after: avoid; }
    footer { font-size: 8pt; }
    a { color: inherit; text-decoration: none; }
    tr:nth-child(even) td { background: none !important; }
    .cell-green, .cell-yellow, .cell-red { background: none !important; }
}
"#;

// ── Page structure helpers ──────────────────────────────────────────────

fn html_escape(s: &str) -> String {
    s.replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;")
        .replace('"', "&quot;")
}

fn page_header(title: &str, is_single_page: bool) -> String {
    if is_single_page {
        return String::new();
    }
    format!(
        "<!DOCTYPE html>\n\
         <html lang=\"en\">\n\
         <head>\n\
         <meta charset=\"utf-8\">\n\
         <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\
         <title>{title} — Rivet Export</title>\n\
         <style>{EXPORT_CSS}</style>\n\
         </head>\n\
         <body>\n",
        title = html_escape(title),
    )
}

fn nav_bar(active: &str, is_single_page: bool) -> String {
    let pages = [
        ("index", "Index", "index.html"),
        ("requirements", "Requirements", "requirements.html"),
        ("matrix", "Matrix", "matrix.html"),
        ("coverage", "Coverage", "coverage.html"),
        ("validation", "Validation", "validation.html"),
    ];

    let mut out = String::from("<nav>\n  <span class=\"nav-title\">Rivet Report</span>\n");
    for (id, label, href) in &pages {
        if *id == active {
            writeln!(out, "  <strong>{label}</strong>").unwrap();
        } else if is_single_page {
            writeln!(out, "  <a href=\"#{id}\">{label}</a>").unwrap();
        } else {
            writeln!(out, "  <a href=\"{href}\">{label}</a>").unwrap();
        }
    }
    out.push_str("</nav>\n");
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
) -> String {
    let timestamp = timestamp_now();
    let is_single_page = false;

    let mut out = page_header(&format!("{project_name} — Index"), is_single_page);
    out.push_str(&nav_bar("index", is_single_page));

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
    out.push_str("<h2>Report Pages</h2>\n<ul>\n");
    out.push_str(
        "<li><a href=\"requirements.html\">Requirements Specification</a> \
         &mdash; all artifacts grouped by type</li>\n",
    );
    out.push_str(
        "<li><a href=\"matrix.html\">Traceability Matrix</a> \
         &mdash; link coverage between types</li>\n",
    );
    out.push_str(
        "<li><a href=\"coverage.html\">Coverage Report</a> \
         &mdash; per-rule traceability coverage</li>\n",
    );
    out.push_str(
        "<li><a href=\"validation.html\">Validation Report</a> \
         &mdash; diagnostics and rule checks</li>\n",
    );
    out.push_str("</ul>\n");

    out.push_str("</main>\n");
    out.push_str(&page_footer(version, &timestamp, is_single_page));
    out
}

/// Render the requirements specification page.
pub fn render_requirements(store: &Store, schema: &Schema, graph: &LinkGraph) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Requirements Specification", is_single_page);
    out.push_str(&nav_bar("requirements", is_single_page));

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
pub fn render_traceability_matrix(store: &Store, _schema: &Schema, graph: &LinkGraph) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Traceability Matrix", is_single_page);
    out.push_str(&nav_bar("matrix", is_single_page));

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
pub fn render_coverage(store: &Store, schema: &Schema, graph: &LinkGraph) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let report = coverage::compute_coverage(store, schema, graph);

    let mut out = page_header("Coverage Report", is_single_page);
    out.push_str(&nav_bar("coverage", is_single_page));

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
                        "<li><a href=\"requirements.html#art-{id}\">{id}</a></li>",
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
pub fn render_validation(diagnostics: &[Diagnostic]) -> String {
    let timestamp = timestamp_now();
    let version = env!("CARGO_PKG_VERSION");
    let is_single_page = false;

    let mut out = page_header("Validation Report", is_single_page);
    out.push_str(&nav_bar("validation", is_single_page));

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
                    "<a href=\"requirements.html#art-{id}\"><strong>{id}</strong></a> ",
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

/// Combine all reports into a single HTML page with internal anchors.
pub fn render_single_page(
    store: &Store,
    schema: &Schema,
    graph: &LinkGraph,
    diagnostics: &[Diagnostic],
    project_name: &str,
    version: &str,
) -> String {
    let timestamp = timestamp_now();

    let mut out = format!(
        "<!DOCTYPE html>\n\
         <html lang=\"en\">\n\
         <head>\n\
         <meta charset=\"utf-8\">\n\
         <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">\n\
         <title>{name} — Rivet Export</title>\n\
         <style>{EXPORT_CSS}</style>\n\
         </head>\n\
         <body>\n",
        name = html_escape(project_name),
    );

    out.push_str(&nav_bar("__single__", true));

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
    use crate::model::{Artifact, Link};
    use crate::schema::{SchemaFile, SchemaMetadata, TraceabilityRule};

    fn test_schema() -> Schema {
        let file = SchemaFile {
            schema: SchemaMetadata {
                name: "test".into(),
                version: "0.1.0".into(),
                namespace: None,
                description: None,
                extends: vec![],
            },
            base_fields: vec![],
            artifact_types: vec![],
            link_types: vec![],
            traceability_rules: vec![TraceabilityRule {
                name: "req-to-dd".into(),
                description: "Requirements must be satisfied by design decisions".into(),
                source_type: "requirement".into(),
                required_link: None,
                required_backlink: Some("satisfies".into()),
                target_types: vec![],
                from_types: vec!["design-decision".into()],
                severity: Severity::Warning,
            }],
        };
        Schema::merge(&[file])
    }

    fn make_artifact(id: &str, atype: &str, links: Vec<Link>) -> Artifact {
        Artifact {
            id: id.into(),
            artifact_type: atype.into(),
            title: format!("Title for {id}"),
            description: Some(format!("Description of {id}")),
            status: Some("draft".into()),
            tags: vec!["core".into()],
            links,
            fields: Default::default(),
            source_file: None,
        }
    }

    fn test_fixtures() -> (Store, Schema, LinkGraph, Vec<Diagnostic>) {
        let schema = test_schema();
        let mut store = Store::new();
        store
            .insert(make_artifact("REQ-001", "requirement", vec![]))
            .unwrap();
        store
            .insert(make_artifact("REQ-002", "requirement", vec![]))
            .unwrap();
        store
            .insert(make_artifact(
                "DD-001",
                "design-decision",
                vec![Link {
                    link_type: "satisfies".into(),
                    target: "REQ-001".into(),
                }],
            ))
            .unwrap();
        store
            .insert(make_artifact(
                "FEAT-001",
                "feature",
                vec![Link {
                    link_type: "implements".into(),
                    target: "REQ-001".into(),
                }],
            ))
            .unwrap();

        let graph = LinkGraph::build(&store, &schema);
        let diagnostics = crate::validate::validate(&store, &schema, &graph);
        (store, schema, graph, diagnostics)
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
        );

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("TestProject"));
        assert!(html.contains(">4<")); // total artifact count
        assert!(html.contains("requirement"));
        assert!(html.contains("design-decision"));
        assert!(html.contains("feature"));
        // Navigation links
        assert!(html.contains("requirements.html"));
        assert!(html.contains("matrix.html"));
        assert!(html.contains("coverage.html"));
        assert!(html.contains("validation.html"));
    }

    #[test]
    fn requirements_includes_all_artifacts() {
        let (store, schema, graph, _) = test_fixtures();
        let html = render_requirements(&store, &schema, &graph);

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
        let html = render_traceability_matrix(&store, &schema, &graph);

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
        let html = render_validation(&diagnostics);

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

        let pages = [
            render_index(&store, &schema, &graph, &diagnostics, "Test", "0.1.0"),
            render_requirements(&store, &schema, &graph),
            render_traceability_matrix(&store, &schema, &graph),
            render_coverage(&store, &schema, &graph),
            render_validation(&diagnostics),
        ];

        for (i, page) in pages.iter().enumerate() {
            assert!(page.contains("<nav>"), "page {i} missing <nav>");
            assert!(page.contains("Rivet Report"), "page {i} missing nav title");
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
        let html = render_coverage(&store, &schema, &graph);

        assert!(html.contains("Coverage Report"));
        assert!(html.contains("req-to-dd"));
        assert!(html.contains("Overall coverage"));
        // The rule has REQ-002 uncovered
        assert!(html.contains("REQ-002"));
    }

    #[test]
    fn single_page_contains_all_sections() {
        let (store, schema, graph, diagnostics) = test_fixtures();
        let html = render_single_page(&store, &schema, &graph, &diagnostics, "SingleTest", "0.1.0");

        assert!(html.contains("<!DOCTYPE html>"));
        assert!(html.contains("id=\"index\""));
        assert!(html.contains("id=\"requirements\""));
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
}
