// ── Reusable UI components ──────────────────────────────────────────────

use rivet_core::document::html_escape;

/// Shared query parameters for views with filtering, sorting and pagination.
#[derive(Debug, serde::Deserialize, Default, Clone)]
pub(crate) struct ViewParams {
    /// Comma-separated artifact type filter.
    pub types: Option<String>,
    /// Status filter (e.g. "approved", "draft", "error", "warning").
    pub status: Option<String>,
    /// Comma-separated tag filter.
    pub tags: Option<String>,
    /// Free-text search query.
    pub q: Option<String>,
    /// Sort column name.
    pub sort: Option<String>,
    /// Sort direction: "asc" or "desc".
    pub dir: Option<String>,
    /// Current page (1-based).
    pub page: Option<usize>,
    /// Items per page.
    pub per_page: Option<usize>,
    /// Comma-separated IDs of open/expanded tree nodes.
    pub open: Option<String>,
    /// Print mode flag (`1` = printable layout).
    pub print: Option<String>,
}

impl ViewParams {
    /// Build a query string from the current params (without leading `?`).
    pub fn to_query_string(&self) -> String {
        let mut parts: Vec<String> = Vec::new();
        if let Some(ref v) = self.types {
            if !v.is_empty() {
                parts.push(format!("types={}", urlencoding::encode(v)));
            }
        }
        if let Some(ref v) = self.status {
            if !v.is_empty() {
                parts.push(format!("status={}", urlencoding::encode(v)));
            }
        }
        if let Some(ref v) = self.tags {
            if !v.is_empty() {
                parts.push(format!("tags={}", urlencoding::encode(v)));
            }
        }
        if let Some(ref v) = self.q {
            if !v.is_empty() {
                parts.push(format!("q={}", urlencoding::encode(v)));
            }
        }
        if let Some(ref v) = self.sort {
            if !v.is_empty() {
                parts.push(format!("sort={}", urlencoding::encode(v)));
            }
        }
        if let Some(ref v) = self.dir {
            if !v.is_empty() {
                parts.push(format!("dir={}", urlencoding::encode(v)));
            }
        }
        if let Some(v) = self.page {
            if v > 1 {
                parts.push(format!("page={v}"));
            }
        }
        if let Some(v) = self.per_page {
            if v != 50 {
                parts.push(format!("per_page={v}"));
            }
        }
        if let Some(ref v) = self.open {
            if !v.is_empty() {
                parts.push(format!("open={}", urlencoding::encode(v)));
            }
        }
        if let Some(ref v) = self.print {
            if v == "1" {
                parts.push("print=1".to_string());
            }
        }
        parts.join("&")
    }

    /// Parse the `types` param into a list of type names.
    pub fn type_list(&self) -> Vec<String> {
        self.types
            .as_deref()
            .filter(|s| !s.is_empty())
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_default()
    }

    /// Parse the `tags` param into a list of tag names.
    pub fn tag_list(&self) -> Vec<String> {
        self.tags
            .as_deref()
            .filter(|s| !s.is_empty())
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_default()
    }

    /// Parse the `open` param into a list of IDs.
    pub fn open_list(&self) -> Vec<String> {
        self.open
            .as_deref()
            .filter(|s| !s.is_empty())
            .map(|s| s.split(',').map(|t| t.trim().to_string()).collect())
            .unwrap_or_default()
    }

    /// Current page number (1-based, defaults to 1).
    pub fn current_page(&self) -> usize {
        self.page.unwrap_or(1).max(1)
    }

    /// Items per page (defaults to 50).
    pub fn items_per_page(&self) -> usize {
        self.per_page.unwrap_or(50).clamp(1, 500)
    }

    /// Whether sort direction is ascending (defaults to true).
    pub fn sort_ascending(&self) -> bool {
        self.dir.as_deref().unwrap_or("asc") == "asc"
    }

    /// Whether print mode is active.
    pub fn is_print(&self) -> bool {
        self.print.as_deref() == Some("1")
    }
}

/// Render a filter bar with type checkboxes, status dropdown, and text search.
///
/// * `available_types` — all types to show as checkboxes.
/// * `selected_types` — types currently selected (empty = all).
/// * `current_status` — current status filter value.
/// * `current_query` — current text search value.
/// * `target_url` — hx-get target (e.g. "/artifacts").
pub fn filter_bar(
    available_types: &[&str],
    selected_types: &[String],
    current_status: Option<&str>,
    current_query: Option<&str>,
    target_url: &str,
) -> String {
    let mut html = String::with_capacity(2048);
    html.push_str(&format!(
        "<div class=\"card\"><form class=\"form-row\" hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\">",
        url = html_escape(target_url),
    ));

    // Type checkboxes
    if !available_types.is_empty() {
        html.push_str("<div><label>Types</label><div class=\"filter-grid\">");
        let all_selected = selected_types.is_empty();
        for t in available_types {
            let checked = if all_selected || selected_types.iter().any(|s| s == *t) {
                " checked"
            } else {
                ""
            };
            html.push_str(&format!(
                "<label><input type=\"checkbox\" name=\"types\" value=\"{t}\"{checked}> {t}</label>"
            ));
        }
        html.push_str("</div></div>");
    }

    // Status dropdown
    let status_val = current_status.unwrap_or("all");
    html.push_str("<div><label>Status</label><br><select name=\"status\">");
    for (val, label) in &[
        ("all", "All"),
        ("approved", "Approved"),
        ("draft", "Draft"),
        ("obsolete", "Obsolete"),
    ] {
        let sel = if *val == status_val { " selected" } else { "" };
        html.push_str(&format!("<option value=\"{val}\"{sel}>{label}</option>"));
    }
    html.push_str("</select></div>");

    // Text search
    let q_val = current_query.unwrap_or("");
    html.push_str(&format!(
        "<div><label>Search</label><br>\
         <input type=\"text\" name=\"q\" placeholder=\"ID or title...\" value=\"{}\" \
         hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" \
         hx-trigger=\"input changed delay:300ms\" hx-include=\"closest form\">\
         </div>",
        html_escape(q_val),
        url = html_escape(target_url),
    ));

    html.push_str("<div><label>&nbsp;</label><br><button type=\"submit\">Filter</button></div>");
    html.push_str("</form></div>");
    html
}

/// Render a sortable table header cell.
///
/// Generates `<th>` with clickable column header that toggles sort direction.
pub fn sortable_header(
    label: &str,
    column: &str,
    current_sort: Option<&str>,
    ascending: bool,
    base_url: &str,
    params: &ViewParams,
) -> String {
    let is_active = current_sort == Some(column);
    let new_dir = if is_active && ascending {
        "desc"
    } else {
        "asc"
    };
    let arrow = if is_active {
        if ascending {
            " <span class=\"tbl-sort-arrow\">\u{25B2}</span>"
        } else {
            " <span class=\"tbl-sort-arrow\">\u{25BC}</span>"
        }
    } else {
        ""
    };

    let mut p = params.clone();
    p.sort = Some(column.to_string());
    p.dir = Some(new_dir.to_string());
    p.page = Some(1);
    let qs = p.to_query_string();

    format!(
        "<th style=\"cursor:pointer\" hx-get=\"{base_url}?{qs}\" hx-target=\"#content\" hx-push-url=\"true\">{label}{arrow}</th>"
    )
}

/// Render pagination controls.
///
/// * `total_items` — total number of items.
/// * `page` — current 1-based page.
/// * `per_page` — items per page.
/// * `base_url` — URL to paginate (e.g. "/artifacts").
/// * `params` — current ViewParams for preserving other filters.
pub fn pagination(
    total_items: usize,
    page: usize,
    per_page: usize,
    base_url: &str,
    params: &ViewParams,
) -> String {
    let total_pages = total_items.div_ceil(per_page);
    if total_pages <= 1 {
        return String::new();
    }

    let mut html = String::from(
        "<div style=\"display:flex;align-items:center;gap:.5rem;margin:1rem 0;font-size:.85rem\">",
    );

    // Previous
    if page > 1 {
        let mut p = params.clone();
        p.page = Some(page - 1);
        let qs = p.to_query_string();
        html.push_str(&format!(
            "<a class=\"btn btn-secondary\" style=\"padding:.3rem .6rem;font-size:.8rem\" \
             hx-get=\"{base_url}?{qs}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{base_url}?{qs}\">&laquo; Prev</a>"
        ));
    }

    // Page numbers (show up to 7 pages around current)
    let start = page.saturating_sub(3).max(1);
    let end = (start + 6).min(total_pages);
    for p_num in start..=end {
        let mut p = params.clone();
        p.page = Some(p_num);
        let qs = p.to_query_string();
        let style = if p_num == page {
            "font-weight:700;color:var(--accent)"
        } else {
            ""
        };
        html.push_str(&format!(
            "<a style=\"padding:.2rem .5rem;{style}\" \
             hx-get=\"{base_url}?{qs}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{base_url}?{qs}\">{p_num}</a>"
        ));
    }

    // Next
    if page < total_pages {
        let mut p = params.clone();
        p.page = Some(page + 1);
        let qs = p.to_query_string();
        html.push_str(&format!(
            "<a class=\"btn btn-secondary\" style=\"padding:.3rem .6rem;font-size:.8rem\" \
             hx-get=\"{base_url}?{qs}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{base_url}?{qs}\">Next &raquo;</a>"
        ));
    }

    html.push_str(&format!(
        "<span class=\"meta\" style=\"margin-left:auto\">{total_items} items, page {page}/{total_pages}</span>"
    ));
    html.push_str("</div>");
    html
}

/// Slice a collection for the current page.
pub fn paginate<T>(items: &[T], page: usize, per_page: usize) -> &[T] {
    let start = (page.saturating_sub(1)) * per_page;
    let end = (start + per_page).min(items.len());
    if start >= items.len() {
        &[]
    } else {
        &items[start..end]
    }
}

/// Render a collapsible tree section with Expand All / Collapse All buttons.
///
/// * `title` — section heading.
/// * `content` — HTML content inside the collapsible.
/// * `tree_id` — unique ID for targeting JS.
pub fn collapsible_tree(title: &str, content: &str, tree_id: &str) -> String {
    format!(
        "<div class=\"card\">\
         <div style=\"display:flex;align-items:center;gap:1rem;margin-bottom:.75rem\">\
         <h3 style=\"margin:0\">{title}</h3>\
         <div style=\"margin-left:auto;display:flex;gap:.5rem\">\
         <button class=\"btn btn-secondary\" style=\"padding:.25rem .6rem;font-size:.75rem\" \
         onclick=\"document.querySelectorAll('#{tree_id} details').forEach(d=>d.open=true)\">Expand All</button>\
         <button class=\"btn btn-secondary\" style=\"padding:.25rem .6rem;font-size:.75rem\" \
         onclick=\"document.querySelectorAll('#{tree_id} details').forEach(d=>d.open=false)\">Collapse All</button>\
         </div></div>\
         <div id=\"{tree_id}\">{content}</div>\
         </div>",
        title = html_escape(title),
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn default_view_params() {
        let p = ViewParams::default();
        assert_eq!(p.current_page(), 1);
        assert_eq!(p.items_per_page(), 50);
        assert!(p.sort_ascending());
        assert!(!p.is_print());
    }

    #[test]
    fn view_params_page_clamping() {
        let p = ViewParams {
            page: Some(0),
            ..Default::default()
        };
        assert_eq!(p.current_page(), 1);
    }

    #[test]
    fn view_params_per_page_clamping() {
        let p = ViewParams {
            per_page: Some(0),
            ..Default::default()
        };
        assert_eq!(p.items_per_page(), 1);

        let p2 = ViewParams {
            per_page: Some(1000),
            ..Default::default()
        };
        assert_eq!(p2.items_per_page(), 500);
    }

    #[test]
    fn type_list_parsing() {
        let p = ViewParams {
            types: Some("loss,hazard, uca".into()),
            ..Default::default()
        };
        assert_eq!(p.type_list(), vec!["loss", "hazard", "uca"]);
    }

    #[test]
    fn type_list_empty() {
        let p = ViewParams::default();
        assert!(p.type_list().is_empty());
    }

    #[test]
    fn tag_list_parsing() {
        let p = ViewParams {
            tags: Some("safety,critical".into()),
            ..Default::default()
        };
        assert_eq!(p.tag_list(), vec!["safety", "critical"]);
    }

    #[test]
    fn open_list_parsing() {
        let p = ViewParams {
            open: Some("L-001,H-001".into()),
            ..Default::default()
        };
        assert_eq!(p.open_list(), vec!["L-001", "H-001"]);
    }

    #[test]
    fn sort_direction() {
        let p = ViewParams {
            dir: Some("desc".into()),
            ..Default::default()
        };
        assert!(!p.sort_ascending());

        let p2 = ViewParams {
            dir: Some("asc".into()),
            ..Default::default()
        };
        assert!(p2.sort_ascending());
    }

    #[test]
    fn print_mode() {
        let p = ViewParams {
            print: Some("1".into()),
            ..Default::default()
        };
        assert!(p.is_print());

        let p2 = ViewParams {
            print: Some("0".into()),
            ..Default::default()
        };
        assert!(!p2.is_print());
    }

    #[test]
    fn query_string_round_trip() {
        let p = ViewParams {
            types: Some("loss,hazard".into()),
            q: Some("search term".into()),
            page: Some(3),
            ..Default::default()
        };
        let qs = p.to_query_string();
        assert!(qs.contains("types=loss%2Chazard"));
        assert!(qs.contains("q=search%20term"));
        assert!(qs.contains("page=3"));
    }

    #[test]
    fn query_string_defaults_omitted() {
        let p = ViewParams::default();
        assert_eq!(p.to_query_string(), "");
    }

    #[test]
    fn paginate_basic() {
        let items: Vec<i32> = (1..=100).collect();
        let page = paginate(&items, 1, 10);
        assert_eq!(page, &[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

        let page2 = paginate(&items, 2, 10);
        assert_eq!(page2, &[11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
    }

    #[test]
    fn paginate_last_page() {
        let items: Vec<i32> = (1..=15).collect();
        let page = paginate(&items, 2, 10);
        assert_eq!(page, &[11, 12, 13, 14, 15]);
    }

    #[test]
    fn paginate_beyond_range() {
        let items: Vec<i32> = (1..=10).collect();
        let page = paginate(&items, 5, 10);
        assert!(page.is_empty());
    }

    #[test]
    fn filter_bar_renders_html() {
        let types = vec!["loss", "hazard"];
        let selected = vec!["loss".to_string()];
        let html = filter_bar(&types, &selected, Some("all"), Some("test"), "/stpa");
        assert!(html.contains("loss"));
        assert!(html.contains("hazard"));
        assert!(html.contains("hx-get=\"/stpa\""));
    }

    #[test]
    fn collapsible_tree_structure() {
        let html = collapsible_tree("STPA Hierarchy", "<p>tree content</p>", "stpa-tree");
        assert!(html.contains("STPA Hierarchy"));
        assert!(html.contains("Expand All"));
        assert!(html.contains("Collapse All"));
        assert!(html.contains("stpa-tree"));
        assert!(html.contains("<p>tree content</p>"));
    }

    #[test]
    fn pagination_single_page() {
        let p = ViewParams::default();
        let html = pagination(10, 1, 50, "/artifacts", &p);
        assert!(html.is_empty());
    }

    #[test]
    fn pagination_multi_page() {
        let p = ViewParams::default();
        let html = pagination(100, 1, 10, "/artifacts", &p);
        assert!(html.contains("Next"));
        assert!(html.contains("100 items"));
    }
}
