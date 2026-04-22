// ── Reusable UI components ──────────────────────────────────────────────

// SAFETY-REVIEW (SCRC Phase 1, DD-058): File-scope blanket allow for
// the v0.4.3 clippy restriction-lint escalation. These lints are
// enabled at workspace scope at `warn` so new violations surface in
// CI; the existing call sites here are grandfathered in via this
// file-level allow until Phase 2 (per-site #[allow(...)] + rewrite).
// Rationale per lint class:
//   * unwrap_used / expect_used: legacy sites — many are on parser
//     post-conditions, BTreeMap lookups by key just inserted, or
//     regex::new on literals. Safe to keep; will migrate to ? with
//     typed errors in Phase 2 where user-facing.
//   * indexing_slicing / arithmetic_side_effects: tight math in
//     CST offsets, layout coordinates, and counted-loop indices that
//     is reviewed but not rewritten to checked_* for readability.
//   * as_conversions / cast_possible_truncation / cast_sign_loss:
//     usize<->u32/u64 in offsets where the value range is bounded by
//     input size (bytes of a loaded YAML file).
//   * wildcard_enum_match_arm / match_wildcard_for_single_variants:
//     tolerant parsers intentionally catch-all on token kinds.
//   * panic: only reached on programmer-error invariants.
//   * print_stdout / print_stderr: rivet-cli binary I/O.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

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
    /// Active variant scope (by name). When set, the `store` +
    /// `graph` in the render context are filtered to artifacts bound
    /// to the variant's effective features.
    pub variant: Option<String>,
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
        if let Some(ref v) = self.variant {
            if !v.is_empty() {
                parts.push(format!("variant={}", urlencoding::encode(v)));
            }
        }
        parts.join("&")
    }

    /// Build a query string omitting the `page` parameter (for building pagination links).
    pub fn query_string_without_page(&self) -> String {
        let mut copy = self.clone();
        copy.page = None;
        copy.to_query_string()
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

// ── Search input ──────────────────────────────────────────────────────────

/// Render a search input with magnifying-glass icon.
///
/// * `placeholder` — placeholder text (e.g. "Search artifacts...").
/// * `current_query` — current search value.
/// * `target_url` — hx-get target (e.g. "/artifacts").
/// * `include_names` — comma-separated list of input names to include via hx-include.
pub fn search_input(
    placeholder: &str,
    current_query: &str,
    target_url: &str,
    include_names: &[&str],
) -> String {
    let hx_include: String = include_names
        .iter()
        .map(|n| format!("[name='{n}']"))
        .collect::<Vec<_>>()
        .join(",");
    format!(
        "<div style=\"position:relative;flex:1;min-width:200px\">\
         <svg width=\"15\" height=\"15\" viewBox=\"0 0 16 16\" fill=\"none\" stroke=\"currentColor\" \
         stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\" \
         style=\"position:absolute;left:.75rem;top:50%;transform:translateY(-50%);opacity:.4\">\
         <circle cx=\"7\" cy=\"7\" r=\"4.5\"/><path d=\"M10.5 10.5L14 14\"/></svg>\
         <input type=\"search\" name=\"q\" placeholder=\"{placeholder}\" value=\"{value}\" \
         hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" \
         hx-trigger=\"keyup changed delay:300ms\" hx-include=\"{hx_include}\" \
         style=\"width:100%;padding:.6rem .75rem .6rem 2.25rem;border:1px solid var(--border);\
         border-radius:var(--radius-sm);font-size:.875rem;font-family:var(--font);\
         background:var(--surface);color:var(--text);outline:none\">\
         </div>",
        placeholder = html_escape(placeholder),
        value = html_escape(current_query),
        url = html_escape(target_url),
    )
}

// ── Type select dropdown ──────────────────────────────────────────────────

/// Render a `<select>` dropdown for filtering by a single artifact type.
///
/// * `all_types` — all available type names.
/// * `selected_type` — currently selected type (empty = all).
/// * `target_url` — hx-get target.
/// * `include_names` — other input names to include.
pub fn type_select(
    all_types: &[String],
    selected_type: &str,
    target_url: &str,
    include_names: &[&str],
) -> String {
    let hx_include: String = include_names
        .iter()
        .map(|n| format!("[name='{n}']"))
        .collect::<Vec<_>>()
        .join(",");
    let mut html = format!(
        "<select name=\"types\" hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" \
         hx-include=\"{hx_include}\" \
         style=\"padding:.4rem .6rem;font-size:.82rem;min-width:140px\">",
        url = html_escape(target_url),
    );
    html.push_str(&format!(
        "<option value=\"\"{sel}>All types</option>",
        sel = if selected_type.is_empty() {
            " selected"
        } else {
            ""
        },
    ));
    let selected_lower = selected_type.to_lowercase();
    for t in all_types {
        let is_selected = !selected_lower.is_empty() && t.to_lowercase() == selected_lower;
        let sel = if is_selected { " selected" } else { "" };
        html.push_str(&format!(
            "<option value=\"{val}\"{sel}>{label}</option>",
            val = html_escape(t),
            label = html_escape(t),
        ));
    }
    html.push_str("</select>");
    html
}

// ── Per-page select ───────────────────────────────────────────────────────

/// Render a `<select>` for items-per-page.
///
/// * `current` — current per_page value.
/// * `target_url` — hx-get target.
/// * `include_names` — other input names to include.
pub fn per_page_select(current: usize, target_url: &str, include_names: &[&str]) -> String {
    let hx_include: String = include_names
        .iter()
        .map(|n| format!("[name='{n}']"))
        .collect::<Vec<_>>()
        .join(",");
    format!(
        "<select name=\"per_page\" hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" \
         hx-include=\"{hx_include}\" \
         style=\"padding:.4rem .6rem;font-size:.82rem;min-width:80px\">\
         <option value=\"25\"{s25}>25</option>\
         <option value=\"50\"{s50}>50</option>\
         <option value=\"100\"{s100}>100</option>\
         <option value=\"200\"{s200}>200</option>\
         </select>",
        url = html_escape(target_url),
        s25 = if current == 25 { " selected" } else { "" },
        s50 = if current == 50 { " selected" } else { "" },
        s100 = if current == 100 { " selected" } else { "" },
        s200 = if current == 200 { " selected" } else { "" },
    )
}

// ── Type checkboxes (STPA-style) ──────────────────────────────────────────

/// Render a row of type checkboxes with JS to collect values into a hidden input.
///
/// * `types_with_counts` — `(type_name, display_label, count)` tuples.
/// * `selected_types` — currently selected type names (empty = none checked).
/// * `hidden_input_id` — DOM id for the hidden `<input name="types">`.
/// * `js_fn_name` — name of the JS function that collects checkbox values.
/// * `checkbox_class` — CSS class for the checkboxes.
pub fn type_checkboxes(
    types_with_counts: &[(&str, &str, usize)],
    selected_types: &[String],
    hidden_input_id: &str,
    js_fn_name: &str,
    checkbox_class: &str,
) -> String {
    let mut html = String::with_capacity(1024);
    html.push_str(
        "<div style=\"display:flex;flex-wrap:wrap;gap:.5rem;margin-top:.5rem;align-items:center\">",
    );
    html.push_str("<span style=\"font-size:.78rem;color:var(--text-secondary);font-weight:600;text-transform:uppercase;letter-spacing:.04em;margin-right:.25rem\">Types:</span>");

    for (type_name, label, count) in types_with_counts {
        if *count == 0 {
            continue;
        }
        let checked = if selected_types.iter().any(|s| s == type_name) {
            " checked"
        } else {
            ""
        };
        html.push_str(&format!(
            "<label style=\"display:inline-flex;align-items:center;gap:.25rem;font-size:.8rem;cursor:pointer\">\
             <input type=\"checkbox\" class=\"{checkbox_class}\" value=\"{type_name}\" \
             onchange=\"{js_fn_name}()\" \
             {checked}>{label} ({count})</label>",
        ));
    }
    html.push_str("</div>");

    // JS to collect checked checkboxes into hidden input and trigger HTMX
    html.push_str(&format!(
        "<script>\
        function {js_fn_name}(){{\
          var cbs=document.querySelectorAll('.{checkbox_class}:checked');\
          var vals=Array.from(cbs).map(function(c){{return c.value}});\
          var h=document.getElementById('{hidden_input_id}');\
          h.value=vals.join(',');\
          htmx.trigger(h,'change');\
        }}\
        </script>",
    ));

    html
}

// ── Filter bar (full) ─────────────────────────────────────────────────────

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

// ── Sortable header ───────────────────────────────────────────────────────

/// Render a sortable table header cell with an anchor link.
///
/// Generates `<th>` containing an `<a>` that toggles sort direction,
/// with both `hx-get` and `href` attributes for HTMX and direct access.
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
        if ascending { " &#9650;" } else { " &#9660;" }
    } else {
        ""
    };

    let mut p = params.clone();
    p.sort = Some(column.to_string());
    p.dir = Some(new_dir.to_string());
    p.page = Some(1);
    let qs = p.to_query_string();

    let href = format!("{base_url}?{qs}");
    format!(
        "<th><a hx-get=\"{href}\" hx-target=\"#content\" hx-push-url=\"true\" \
         href=\"{href}\" style=\"color:inherit;text-decoration:none;cursor:pointer\">\
         {label}{arrow}</a></th>",
    )
}

// ── Pagination ────────────────────────────────────────────────────────────

/// Render pagination controls with ellipsis, prev/next, and page numbers.
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
    let total_pages = if total_items == 0 {
        1
    } else {
        total_items.div_ceil(per_page)
    };
    if total_pages <= 1 {
        return String::new();
    }

    let qbase = params.query_string_without_page();

    let make_url = |p: usize| -> String {
        if qbase.is_empty() {
            format!("{base_url}?page={p}")
        } else {
            format!("{base_url}?{qbase}&page={p}")
        }
    };

    let mut html = String::from("<div class=\"pagination\">");

    // Previous
    if page > 1 {
        let url = make_url(page - 1);
        html.push_str(&format!(
            "<a hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{url}\">&laquo; Prev</a>",
        ));
    } else {
        html.push_str("<span class=\"pagination-disabled\">&laquo; Prev</span>");
    }

    // Page numbers with ellipsis window
    let window = 2usize;
    let pstart = if page > window + 1 { page - window } else { 1 };
    let pend = total_pages.min(page + window);

    if pstart > 1 {
        let url = make_url(1);
        html.push_str(&format!(
            "<a hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{url}\">1</a>",
        ));
        if pstart > 2 {
            html.push_str("<span class=\"pagination-ellipsis\">&hellip;</span>");
        }
    }
    for p in pstart..=pend {
        if p == page {
            html.push_str(&format!("<span class=\"pagination-current\">{p}</span>"));
        } else {
            let url = make_url(p);
            html.push_str(&format!(
                "<a hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{url}\">{p}</a>",
            ));
        }
    }
    if pend < total_pages {
        if pend < total_pages - 1 {
            html.push_str("<span class=\"pagination-ellipsis\">&hellip;</span>");
        }
        let url = make_url(total_pages);
        html.push_str(&format!(
            "<a hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{url}\">{total_pages}</a>",
        ));
    }

    // Next
    if page < total_pages {
        let url = make_url(page + 1);
        html.push_str(&format!(
            "<a hx-get=\"{url}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"{url}\">Next &raquo;</a>",
        ));
    } else {
        html.push_str("<span class=\"pagination-disabled\">Next &raquo;</span>");
    }

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

// ── Collapsible tree ──────────────────────────────────────────────────────

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

// ── Severity filter (for validation) ──────────────────────────────────────

/// Render a severity filter bar for the validation view.
///
/// * `error_count`, `warning_count`, `info_count` — counts for each severity.
/// * `current_status` — current severity filter ("all", "error", "warning", "info").
/// * `current_query` — current text search value.
pub fn validation_filter_bar(
    error_count: usize,
    warning_count: usize,
    info_count: usize,
    current_status: &str,
    current_query: &str,
) -> String {
    let mut html = String::with_capacity(1024);
    html.push_str("<div class=\"filter-bar card\">");
    html.push_str(
        "<div class=\"form-row\" style=\"margin-bottom:0;width:100%;align-items:center\">",
    );

    // Search input
    html.push_str(&search_input(
        "Search by artifact, rule, message...",
        current_query,
        "/validate",
        &["status"],
    ));

    // Severity filter
    html.push_str(
        "<select name=\"status\" hx-get=\"/validate\" hx-target=\"#content\" hx-push-url=\"true\" \
         hx-include=\"[name='q']\" \
         style=\"padding:.4rem .6rem;font-size:.82rem;min-width:140px\">",
    );
    for (val, label, count) in &[
        (
            "all",
            "All severities",
            error_count + warning_count + info_count,
        ),
        ("error", "Errors", error_count),
        ("warning", "Warnings", warning_count),
        ("info", "Info", info_count),
    ] {
        let sel = if *val == current_status {
            " selected"
        } else {
            ""
        };
        html.push_str(&format!(
            "<option value=\"{val}\"{sel}>{label} ({count})</option>",
        ));
    }
    html.push_str("</select>");

    html.push_str("</div>"); // form-row
    html.push_str("</div>"); // filter-bar
    html
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
    fn query_string_includes_variant() {
        let p = ViewParams {
            variant: Some("minimal-ci".into()),
            ..Default::default()
        };
        let qs = p.to_query_string();
        assert!(qs.contains("variant=minimal-ci"));
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
    fn query_string_without_page_omits_page() {
        let p = ViewParams {
            types: Some("loss".into()),
            page: Some(3),
            ..Default::default()
        };
        let qs = p.query_string_without_page();
        assert!(qs.contains("types=loss"));
        assert!(!qs.contains("page="));
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
        assert!(html.contains("class=\"pagination\""));
    }

    #[test]
    fn search_input_renders() {
        let html = search_input("Search...", "hello", "/artifacts", &["types", "sort"]);
        assert!(html.contains("value=\"hello\""));
        assert!(html.contains("hx-get=\"/artifacts\""));
        assert!(html.contains("[name='types'],[name='sort']"));
    }

    #[test]
    fn type_select_renders() {
        let types = vec!["loss".to_string(), "hazard".to_string()];
        let html = type_select(&types, "loss", "/artifacts", &["q"]);
        assert!(html.contains("All types"));
        assert!(html.contains("loss"));
        assert!(html.contains("hazard"));
    }

    #[test]
    fn per_page_select_renders() {
        let html = per_page_select(100, "/artifacts", &["q", "types"]);
        assert!(html.contains("100\" selected"));
    }

    #[test]
    fn sortable_header_active_asc() {
        let p = ViewParams::default();
        let html = sortable_header("ID", "id", Some("id"), true, "/artifacts", &p);
        assert!(html.contains("dir=desc"));
        assert!(html.contains("&#9650;")); // up arrow
    }

    #[test]
    fn sortable_header_inactive() {
        let p = ViewParams::default();
        let html = sortable_header("Title", "title", Some("id"), true, "/artifacts", &p);
        assert!(html.contains("dir=asc"));
        assert!(!html.contains("&#9650;"));
        assert!(!html.contains("&#9660;"));
    }

    #[test]
    fn validation_filter_bar_renders() {
        let html = validation_filter_bar(3, 5, 2, "all", "");
        assert!(html.contains("All severities (10)"));
        assert!(html.contains("Errors (3)"));
        assert!(html.contains("hx-get=\"/validate\""));
    }
}
