//! Reusable HTML UI components for the Rivet dashboard.
//!
//! Each component renders an HTML fragment as a `String`. All components
//! encode their state in URL query parameters so the view survives page
//! reload and browser back/forward.

// Components are built ahead of view integration — suppress dead code
// warnings until views are migrated to use them.

use super::html_escape;

// ── ViewParams ──────────────────────────────────────────────────────────

/// Common query parameters shared across dashboard views.
///
/// Views deserialise this from the request URL.  Components use it to
/// render controls whose state matches the URL and to generate links
/// that preserve existing params when changing one value.
#[derive(Debug, Clone, serde::Deserialize, Default)]
pub struct ViewParams {
    /// Comma-separated artifact type filter.
    #[serde(default)]
    pub types: Option<String>,
    /// Status filter (e.g. "approved", "draft").
    #[serde(default)]
    pub status: Option<String>,
    /// Comma-separated tag filter.
    #[serde(default)]
    pub tags: Option<String>,
    /// Free-text search query.
    #[serde(default)]
    pub q: Option<String>,
    /// Sort column name.
    #[serde(default)]
    pub sort: Option<String>,
    /// Sort direction: "asc" or "desc".
    #[serde(default)]
    pub dir: Option<String>,
    /// 1-based page number.
    #[serde(default)]
    pub page: Option<usize>,
    /// Items per page.
    #[serde(default)]
    pub per_page: Option<usize>,
    /// Comma-separated IDs of open tree nodes.
    #[serde(default)]
    pub open: Option<String>,
    /// Print mode: strips nav/chrome when true.
    #[serde(default)]
    pub print: Option<bool>,
}

impl ViewParams {
    /// Build a query string, merging `overrides` on top of current values.
    /// Pass `("key", "")` to remove a parameter.
    pub fn to_query_string(&self, overrides: &[(&str, &str)]) -> String {
        let mut params: Vec<(String, String)> = Vec::new();

        // Collect current params
        macro_rules! push_opt {
            ($field:ident) => {
                if let Some(ref v) = self.$field {
                    if !v.is_empty() {
                        params.push((stringify!($field).to_string(), v.clone()));
                    }
                }
            };
        }
        push_opt!(types);
        push_opt!(status);
        push_opt!(tags);
        push_opt!(q);
        push_opt!(sort);
        push_opt!(dir);
        push_opt!(open);

        if let Some(p) = self.page {
            params.push(("page".into(), p.to_string()));
        }
        if let Some(pp) = self.per_page {
            params.push(("per_page".into(), pp.to_string()));
        }
        if self.print == Some(true) {
            params.push(("print".into(), "1".into()));
        }

        // Apply overrides
        for &(key, val) in overrides {
            params.retain(|(k, _)| k != key);
            if !val.is_empty() {
                params.push((key.to_string(), val.to_string()));
            }
        }

        if params.is_empty() {
            String::new()
        } else {
            let qs: Vec<String> = params
                .iter()
                .map(|(k, v)| format!("{}={}", urlencoding::encode(k), urlencoding::encode(v)))
                .collect();
            format!("?{}", qs.join("&"))
        }
    }

    /// Parse the `types` field into a vec of individual type strings.
    pub fn type_list(&self) -> Vec<String> {
        self.types
            .as_deref()
            .filter(|s| !s.is_empty())
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_default()
    }

    /// Parse the `tags` field into a vec of individual tag strings.
    pub fn tag_list(&self) -> Vec<String> {
        self.tags
            .as_deref()
            .filter(|s| !s.is_empty())
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_default()
    }

    /// Parse the `open` field into a vec of node IDs.
    pub fn open_list(&self) -> Vec<String> {
        self.open
            .as_deref()
            .filter(|s| !s.is_empty())
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_default()
    }

    /// Current page (1-based, defaults to 1).
    pub fn current_page(&self) -> usize {
        self.page.unwrap_or(1).max(1)
    }

    /// Items per page (defaults to 50).
    pub fn items_per_page(&self) -> usize {
        self.per_page.unwrap_or(50).clamp(10, 500)
    }

    /// Sort direction: true = ascending.
    pub fn sort_ascending(&self) -> bool {
        self.dir.as_deref() != Some("desc")
    }
}

// ── FilterBar ───────────────────────────────────────────────────────────

/// Configuration for a filter bar component.
pub struct FilterBarConfig<'a> {
    /// Route path (e.g., "/artifacts", "/stpa").
    pub base_url: &'a str,
    /// All available artifact types for checkboxes.
    pub available_types: &'a [String],
    /// All available status values for dropdown.
    pub available_statuses: &'a [String],
    /// Current view parameters (determines checked/selected state).
    pub params: &'a ViewParams,
}

/// Render a horizontal filter bar with type checkboxes, status dropdown,
/// and text search.  All changes trigger HTMX GET to preserve URL state.
pub fn filter_bar(cfg: &FilterBarConfig) -> String {
    let active_types = cfg.params.type_list();
    let active_status = cfg.params.status.as_deref().unwrap_or("");
    let search_text = cfg.params.q.as_deref().unwrap_or("");

    let mut html = String::with_capacity(2048);
    html.push_str(
        "<div class=\"filter-bar card\" style=\"padding:.75rem 1rem;margin-bottom:1rem\">",
    );

    // Wrap in a form-like container — JS updates URL on change
    html.push_str(&format!(
        "<div class=\"filter-controls\" data-base-url=\"{}\" \
         style=\"display:flex;flex-wrap:wrap;gap:.75rem;align-items:center\">",
        html_escape(cfg.base_url)
    ));

    // Type checkboxes
    if !cfg.available_types.is_empty() {
        html.push_str("<div style=\"display:flex;flex-wrap:wrap;gap:.35rem;align-items:center\">");
        html.push_str(
            "<span style=\"font-size:.75rem;font-weight:600;margin-right:.25rem\">Type:</span>",
        );
        for t in cfg.available_types {
            let checked = if active_types.contains(t) {
                " checked"
            } else {
                ""
            };
            html.push_str(&format!(
                "<label style=\"font-size:.75rem;display:flex;align-items:center;gap:.2rem;cursor:pointer\">\
                 <input type=\"checkbox\" class=\"filter-type\" value=\"{}\"{}> {}</label>",
                html_escape(t),
                checked,
                html_escape(t)
            ));
        }
        html.push_str("</div>");
    }

    // Status dropdown
    if !cfg.available_statuses.is_empty() {
        html.push_str("<div style=\"display:flex;align-items:center;gap:.25rem\">");
        html.push_str("<span style=\"font-size:.75rem;font-weight:600\">Status:</span>");
        html.push_str("<select class=\"filter-status\" style=\"font-size:.75rem;padding:.15rem .3rem;font-family:var(--mono)\">");
        html.push_str("<option value=\"\">all</option>");
        for s in cfg.available_statuses {
            let selected = if s.as_str() == active_status {
                " selected"
            } else {
                ""
            };
            html.push_str(&format!(
                "<option value=\"{}\"{}>{}</option>",
                html_escape(s),
                selected,
                html_escape(s)
            ));
        }
        html.push_str("</select>");
        html.push_str("</div>");
    }

    // Text search
    html.push_str(
        "<div style=\"display:flex;align-items:center;gap:.25rem;flex:1;min-width:150px\">",
    );
    html.push_str("<span style=\"font-size:.75rem;font-weight:600\">Search:</span>");
    html.push_str(&format!(
        "<input type=\"search\" class=\"filter-search\" value=\"{}\" \
         placeholder=\"Filter...\" \
         style=\"font-size:.75rem;padding:.2rem .4rem;font-family:var(--mono);flex:1;border:1px solid var(--border);border-radius:4px\" \
         hx-get=\"{}\" hx-target=\"#content\" hx-push-url=\"true\" \
         hx-trigger=\"keyup changed delay:300ms\" \
         hx-include=\"closest .filter-controls\" \
         name=\"q\">",
        html_escape(search_text),
        html_escape(cfg.base_url),
    ));
    html.push_str("</div>");

    // Clear button
    html.push_str(&format!(
        "<a href=\"{}\" hx-get=\"{}\" hx-target=\"#content\" hx-push-url=\"true\" \
         style=\"font-size:.72rem;color:var(--accent);cursor:pointer;text-decoration:none\">Clear</a>",
        html_escape(cfg.base_url),
        html_escape(cfg.base_url),
    ));

    html.push_str("</div>"); // filter-controls
    html.push_str("</div>"); // filter-bar

    // JS to wire up checkboxes and dropdown → URL param updates
    html.push_str(&format!(
        r#"<script>
(function() {{
  const bar = document.querySelector('.filter-bar[data-base-url]') || document.querySelector('.filter-controls');
  if (!bar) return;
  const base = '{}';

  function buildUrl() {{
    const types = Array.from(bar.querySelectorAll('.filter-type:checked')).map(c => c.value).join(',');
    const status = (bar.querySelector('.filter-status') || {{}}).value || '';
    const q = (bar.querySelector('.filter-search') || {{}}).value || '';
    let params = [];
    if (types) params.push('types=' + encodeURIComponent(types));
    if (status) params.push('status=' + encodeURIComponent(status));
    if (q) params.push('q=' + encodeURIComponent(q));
    return base + (params.length ? '?' + params.join('&') : '');
  }}

  bar.querySelectorAll('.filter-type').forEach(cb => {{
    cb.addEventListener('change', () => {{
      htmx.ajax('GET', buildUrl(), {{target: '#content', pushUrl: true}});
    }});
  }});

  const sel = bar.querySelector('.filter-status');
  if (sel) sel.addEventListener('change', () => {{
    htmx.ajax('GET', buildUrl(), {{target: '#content', pushUrl: true}});
  }});
}})();
</script>"#,
        cfg.base_url,
    ));

    html
}

// ── SortableTable ───────────────────────────────────────────────────────

/// Sort direction.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum SortDir {
    Asc,
    Desc,
}

/// Column definition for a sortable table.
pub struct Column {
    /// Internal key used in `?sort=` param.
    pub key: String,
    /// Display header text.
    pub label: String,
    /// Whether this column is sortable.
    pub sortable: bool,
}

/// Configuration for a sortable table.
pub struct TableConfig<'a> {
    pub base_url: &'a str,
    pub columns: &'a [Column],
    /// Each row is a vec of HTML cell contents.
    pub rows: &'a [Vec<String>],
    pub params: &'a ViewParams,
}

/// Render a sortable HTML table with clickable column headers.
pub fn sortable_table(cfg: &TableConfig) -> String {
    let current_sort = cfg.params.sort.as_deref().unwrap_or("");
    let current_dir = if cfg.params.sort_ascending() {
        SortDir::Asc
    } else {
        SortDir::Desc
    };

    let mut html = String::with_capacity(4096);
    html.push_str("<table><thead><tr>");

    for col in cfg.columns.iter() {
        if col.sortable {
            let (new_dir, arrow) = if col.key == current_sort {
                match current_dir {
                    SortDir::Asc => ("desc", " ↑"),
                    SortDir::Desc => ("asc", " ↓"),
                }
            } else {
                ("asc", "")
            };
            let qs =
                cfg.params
                    .to_query_string(&[("sort", &col.key), ("dir", new_dir), ("page", "1")]);
            html.push_str(&format!(
                "<th><a hx-get=\"{}{}\" hx-target=\"#content\" hx-push-url=\"true\" \
                 href=\"#\" style=\"text-decoration:none;color:inherit\">{}{}</a></th>",
                html_escape(cfg.base_url),
                qs,
                html_escape(&col.label),
                arrow,
            ));
        } else {
            html.push_str(&format!("<th>{}</th>", html_escape(&col.label)));
        }
    }

    html.push_str("</tr></thead><tbody>");

    for row in cfg.rows.iter() {
        html.push_str("<tr>");
        for cell in row {
            html.push_str(&format!("<td>{cell}</td>"));
        }
        html.push_str("</tr>");
    }

    html.push_str("</tbody></table>");
    html
}

// ── Pagination ──────────────────────────────────────────────────────────

/// Render pagination controls: « ‹ page N of M › »
pub fn pagination(total_items: usize, params: &ViewParams, base_url: &str) -> String {
    let per_page = params.items_per_page();
    let total_pages = total_items.div_ceil(per_page);
    let current = params.current_page().min(total_pages).max(1);

    if total_pages <= 1 {
        return format!(
            "<div class=\"pagination\" style=\"font-size:.75rem;color:var(--muted);margin:.5rem 0\">\
             {} items</div>",
            total_items
        );
    }

    let mut html = String::with_capacity(512);
    html.push_str(
        "<div class=\"pagination\" style=\"display:flex;gap:.5rem;align-items:center;\
         font-size:.75rem;font-family:var(--mono);margin:.75rem 0\">",
    );

    // Helper to make a page link
    let page_link = |page: usize, label: &str, enabled: bool| -> String {
        if enabled {
            let qs = params.to_query_string(&[("page", &page.to_string())]);
            format!(
                "<a hx-get=\"{base_url}{qs}\" hx-target=\"#content\" hx-push-url=\"true\" \
                 href=\"#\" style=\"padding:.15rem .4rem;border:1px solid var(--border);\
                 border-radius:3px;text-decoration:none;color:var(--accent)\">{label}</a>"
            )
        } else {
            format!(
                "<span style=\"padding:.15rem .4rem;border:1px solid var(--border);\
                 border-radius:3px;color:var(--muted)\">{label}</span>"
            )
        }
    };

    html.push_str(&page_link(1, "«", current > 1));
    html.push_str(&page_link(
        current.saturating_sub(1).max(1),
        "‹",
        current > 1,
    ));
    html.push_str(&format!(
        "<span>page <strong>{current}</strong> of {total_pages}</span>"
    ));
    html.push_str(&page_link(
        (current + 1).min(total_pages),
        "›",
        current < total_pages,
    ));
    html.push_str(&page_link(total_pages, "»", current < total_pages));
    html.push_str(&format!(
        "<span style=\"color:var(--muted)\">({total_items} items)</span>"
    ));

    html.push_str("</div>");
    html
}

// ── CollapsibleTree ─────────────────────────────────────────────────────

/// A node in a collapsible tree.
pub struct TreeNode {
    /// Unique ID (used in `?open=` param).
    pub id: String,
    /// HTML content for the summary line.
    pub summary_html: String,
    /// HTML content shown when expanded.
    pub detail_html: String,
    /// Child nodes.
    pub children: Vec<TreeNode>,
}

/// Render a hierarchical tree with `<details>/<summary>` elements.
/// The `open_ids` set determines which nodes start expanded.
/// Provides "Expand All" / "Collapse All" buttons.
pub fn collapsible_tree(
    nodes: &[TreeNode],
    open_ids: &[String],
    base_url: &str,
    params: &ViewParams,
) -> String {
    let mut html = String::with_capacity(4096);

    // Expand/Collapse all buttons
    let all_ids: Vec<&str> = collect_all_ids(nodes);
    let expand_qs = params.to_query_string(&[("open", &all_ids.join(","))]);
    let collapse_qs = params.to_query_string(&[("open", "")]);

    html.push_str(&format!(
        "<div style=\"margin-bottom:.5rem;display:flex;gap:.5rem\">\
         <a hx-get=\"{base_url}{expand_qs}\" hx-target=\"#content\" hx-push-url=\"true\" \
         href=\"#\" style=\"font-size:.72rem;color:var(--accent);text-decoration:none\">\
         ▶ Expand All</a>\
         <a hx-get=\"{base_url}{collapse_qs}\" hx-target=\"#content\" hx-push-url=\"true\" \
         href=\"#\" style=\"font-size:.72rem;color:var(--accent);text-decoration:none\">\
         ▼ Collapse All</a>\
         </div>"
    ));

    render_tree_nodes(&mut html, nodes, open_ids, 0);
    html
}

fn collect_all_ids(nodes: &[TreeNode]) -> Vec<&str> {
    let mut ids = Vec::new();
    for node in nodes {
        ids.push(node.id.as_str());
        ids.extend(collect_all_ids(&node.children));
    }
    ids
}

fn render_tree_nodes(html: &mut String, nodes: &[TreeNode], open_ids: &[String], depth: usize) {
    let indent = depth * 16;
    for node in nodes {
        let is_open = open_ids.iter().any(|id| id == &node.id);
        let open_attr = if is_open { " open" } else { "" };

        html.push_str(&format!(
            "<details{open_attr} style=\"margin-left:{indent}px;margin-bottom:.25rem\">"
        ));
        html.push_str(&format!(
            "<summary style=\"cursor:pointer;font-size:.85rem;padding:.2rem 0\">{}</summary>",
            node.summary_html
        ));
        html.push_str(&format!(
            "<div style=\"margin-left:1rem;font-size:.82rem\">{}</div>",
            node.detail_html
        ));

        if !node.children.is_empty() {
            render_tree_nodes(html, &node.children, open_ids, depth + 1);
        }

        html.push_str("</details>");
    }
}

// ── Paginate helper ─────────────────────────────────────────────────────

/// Apply pagination to a slice: returns the page slice and total count.
#[allow(clippy::needless_lifetimes)]
pub fn paginate<'a, T>(items: &'a [T], params: &ViewParams) -> (&'a [T], usize) {
    let total = items.len();
    let per_page = params.items_per_page();
    let page = params.current_page();
    let start = (page - 1) * per_page;
    if start >= total {
        (&[], total)
    } else {
        let end = (start + per_page).min(total);
        (&items[start..end], total)
    }
}

// ── Tests ───────────────────────────────────────────────────────────────

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn view_params_defaults() {
        let p = ViewParams::default();
        assert_eq!(p.current_page(), 1);
        assert_eq!(p.items_per_page(), 50);
        assert!(p.sort_ascending());
        assert!(p.type_list().is_empty());
        assert!(p.open_list().is_empty());
    }

    #[test]
    fn view_params_to_query_string() {
        let p = ViewParams {
            types: Some("requirement,feature".into()),
            sort: Some("id".into()),
            dir: Some("desc".into()),
            ..Default::default()
        };
        let qs = p.to_query_string(&[]);
        assert!(qs.contains("types="));
        assert!(qs.contains("sort=id"));
        assert!(qs.contains("dir=desc"));
    }

    #[test]
    fn view_params_override_removes_param() {
        let p = ViewParams {
            types: Some("requirement".into()),
            status: Some("approved".into()),
            ..Default::default()
        };
        let qs = p.to_query_string(&[("status", "")]);
        assert!(!qs.contains("status"));
        assert!(qs.contains("types="));
    }

    #[test]
    fn view_params_override_replaces_param() {
        let p = ViewParams {
            page: Some(3),
            ..Default::default()
        };
        let qs = p.to_query_string(&[("page", "1")]);
        assert!(qs.contains("page=1"));
        assert!(!qs.contains("page=3"));
    }

    #[test]
    fn type_list_parsing() {
        let p = ViewParams {
            types: Some("requirement, feature, hazard".into()),
            ..Default::default()
        };
        let list = p.type_list();
        assert_eq!(list, vec!["requirement", "feature", "hazard"]);
    }

    #[test]
    fn pagination_single_page() {
        let p = ViewParams::default();
        let html = pagination(30, &p, "/artifacts");
        assert!(html.contains("30 items"));
        // Should not have page navigation (single page with 50 per_page)
        assert!(!html.contains("page <strong>"));
    }

    #[test]
    fn pagination_multi_page() {
        let p = ViewParams {
            page: Some(2),
            per_page: Some(10),
            ..Default::default()
        };
        let html = pagination(35, &p, "/artifacts");
        assert!(html.contains("page <strong>2</strong> of 4"));
        assert!(html.contains("35 items"));
    }

    #[test]
    fn paginate_slice() {
        let items: Vec<i32> = (0..100).collect();
        let p = ViewParams {
            page: Some(3),
            per_page: Some(20),
            ..Default::default()
        };
        let (slice, total) = paginate(&items, &p);
        assert_eq!(total, 100);
        assert_eq!(slice.len(), 20);
        assert_eq!(slice[0], 40);
    }

    #[test]
    fn paginate_last_page_partial() {
        let items: Vec<i32> = (0..55).collect();
        let p = ViewParams {
            page: Some(3),
            per_page: Some(20),
            ..Default::default()
        };
        let (slice, total) = paginate(&items, &p);
        assert_eq!(total, 55);
        assert_eq!(slice.len(), 15); // 55 - 40 = 15
    }

    #[test]
    fn filter_bar_renders_html() {
        let types = vec!["requirement".to_string(), "feature".to_string()];
        let statuses = vec!["draft".to_string(), "approved".to_string()];
        let p = ViewParams {
            types: Some("requirement".into()),
            ..Default::default()
        };
        let html = filter_bar(&FilterBarConfig {
            base_url: "/artifacts",
            available_types: &types,
            available_statuses: &statuses,
            params: &p,
        });
        assert!(html.contains("filter-bar"));
        assert!(html.contains("checked")); // requirement should be checked
        assert!(html.contains("feature")); // feature checkbox present
        assert!(html.contains("Clear")); // clear button
    }

    #[test]
    fn sortable_table_renders_headers() {
        let cols = vec![
            Column {
                key: "id".into(),
                label: "ID".into(),
                sortable: true,
            },
            Column {
                key: "title".into(),
                label: "Title".into(),
                sortable: true,
            },
        ];
        let rows = vec![vec!["REQ-001".into(), "First req".into()]];
        let p = ViewParams {
            sort: Some("id".into()),
            dir: Some("asc".into()),
            ..Default::default()
        };
        let html = sortable_table(&TableConfig {
            base_url: "/artifacts",
            columns: &cols,
            rows: &rows,
            params: &p,
        });
        assert!(html.contains("<table>"));
        assert!(html.contains("ID")); // ↑ arrow for ascending sort on id
        assert!(html.contains("REQ-001"));
    }

    #[test]
    fn collapsible_tree_respects_open_ids() {
        let nodes = vec![TreeNode {
            id: "H-1".into(),
            summary_html: "<strong>H-1</strong>".into(),
            detail_html: "Hazard details".into(),
            children: vec![TreeNode {
                id: "SC-1".into(),
                summary_html: "<strong>SC-1</strong>".into(),
                detail_html: "Constraint details".into(),
                children: vec![],
            }],
        }];
        let p = ViewParams::default();
        let html = collapsible_tree(&nodes, &["H-1".into()], "/stpa", &p);
        // H-1 should be open, SC-1 should be closed
        assert!(html.contains("<details open"));
        assert!(html.contains("Hazard details"));
        assert!(html.contains("Expand All"));
        assert!(html.contains("Collapse All"));
    }
}
