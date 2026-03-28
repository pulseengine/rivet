use rivet_core::document::html_escape;
use rivet_core::links::LinkGraph;
use rivet_core::store::Store;

use super::RenderContext;
use super::helpers::badge_for_type;

pub(crate) struct TraceParams {
    pub(crate) root_type: Option<String>,
    pub(crate) status: Option<String>,
    pub(crate) search: Option<String>,
}

pub(crate) struct TraceHistoryParams {
    pub(crate) file: Option<String>,
}

struct TraceNode {
    id: String,
    artifact_type: String,
    title: String,
    status: String,
    link_type: String,
    children: Vec<TraceNode>,
}

fn build_trace_children(
    id: &str,
    store: &Store,
    graph: &LinkGraph,
    depth: usize,
    max_depth: usize,
) -> Vec<TraceNode> {
    if depth >= max_depth {
        return Vec::new();
    }
    let backlinks = graph.backlinks_to(id);
    let mut nodes: Vec<TraceNode> = Vec::new();
    for bl in backlinks {
        let child_id = &bl.source;
        let (artifact_type, title, status) = if let Some(a) = store.get(child_id) {
            (
                a.artifact_type.clone(),
                a.title.clone(),
                a.status.clone().unwrap_or_default(),
            )
        } else {
            continue;
        };
        let children = build_trace_children(child_id, store, graph, depth + 1, max_depth);
        nodes.push(TraceNode {
            id: child_id.clone(),
            artifact_type,
            title,
            status,
            link_type: bl.link_type.clone(),
            children,
        });
    }
    nodes.sort_by(|a, b| a.link_type.cmp(&b.link_type).then(a.id.cmp(&b.id)));
    nodes
}

fn render_trace_node(node: &TraceNode, depth: usize, project_path: &str) -> String {
    let badge = badge_for_type(&node.artifact_type);
    let status_class = match node.status.as_str() {
        "approved" => "trace-status-approved",
        "draft" => "trace-status-draft",
        _ => "",
    };
    let status_badge = if !node.status.is_empty() {
        format!(
            "<span class=\"trace-status {status_class}\">{}</span>",
            html_escape(&node.status)
        )
    } else {
        String::new()
    };
    let edge_label = format!(
        "<span class=\"trace-edge\">{}</span>",
        html_escape(&node.link_type)
    );
    let escaped_title = html_escape(&node.title);
    let escaped_id = html_escape(&node.id);

    if node.children.is_empty() {
        format!(
            "<div class=\"trace-node\">{edge_label}{badge} \
             <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{escaped_id}</a> \
             <span style=\"color:var(--text-secondary)\">{escaped_title}</span>{status_badge}\
             <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
             hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\"\
             >History</button></div>\
             <div id=\"hist-{safe_id}\" style=\"margin-left:1.5rem\"></div>",
            id = node.id,
            file = html_escape(project_path),
            safe_id = node.id.replace('.', "_"),
        )
    } else {
        let open_attr = if depth == 0 { " open" } else { "" };
        let child_count = node.children.len();
        let mut html = format!(
            "<details class=\"trace-details\"{open_attr}>\
             <summary>{edge_label}{badge} \
             <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\" \
             onclick=\"event.stopPropagation()\">{escaped_id}</a> \
             <span style=\"color:var(--text-secondary)\">{escaped_title}</span>{status_badge}\
             <span style=\"color:var(--text-secondary);font-size:.75rem;margin-left:.25rem\">({child_count})</span>\
             <span class=\"trace-chevron\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 2l4 4-4 4\"/></svg></span>\
             <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
             hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\" \
             onclick=\"event.stopPropagation()\"\
             >History</button></summary>\
             <div id=\"hist-{safe_id}\" style=\"margin-left:1.5rem\"></div>\
             <div class=\"trace-level\">",
            id = node.id,
            file = html_escape(project_path),
            safe_id = node.id.replace('.', "_"),
        );
        for child in &node.children {
            html.push_str(&render_trace_node(child, depth + 1, project_path));
        }
        html.push_str("</div></details>");
        html
    }
}

fn source_path_for_artifact(store: &Store, id: &str) -> String {
    store
        .get(id)
        .and_then(|a| a.source_file.as_ref())
        .map(|p| p.display().to_string())
        .unwrap_or_default()
}

pub(crate) fn render_traceability_view(ctx: &RenderContext, params: &TraceParams) -> String {
    let store = ctx.store;
    let graph = ctx.graph;

    let mut all_types: Vec<&str> = store.types().collect();
    all_types.sort();

    let default_root = if store.count_by_type("requirement") > 0 {
        "requirement"
    } else if store.count_by_type("stakeholder-req") > 0 {
        "stakeholder-req"
    } else {
        all_types.first().copied().unwrap_or("requirement")
    };
    let root_type = params.root_type.as_deref().unwrap_or(default_root);
    let status_filter = params.status.as_deref().unwrap_or("all");
    let search_filter = params.search.as_deref().unwrap_or("").to_lowercase();

    let mut root_ids: Vec<&str> = store
        .by_type(root_type)
        .iter()
        .map(|s| s.as_str())
        .collect();
    root_ids.sort();

    let root_artifacts: Vec<&str> = root_ids
        .into_iter()
        .filter(|id| {
            if let Some(a) = store.get(id) {
                if status_filter != "all" && a.status.as_deref().unwrap_or("") != status_filter {
                    return false;
                }
                if !search_filter.is_empty() {
                    let id_match = id.to_lowercase().contains(&search_filter);
                    let title_match = a.title.to_lowercase().contains(&search_filter);
                    if !id_match && !title_match {
                        return false;
                    }
                }
                true
            } else {
                false
            }
        })
        .collect();

    let mut html = String::from("<h2>Traceability Explorer</h2>");

    html.push_str("<div class=\"card\"><form class=\"form-row\" hx-get=\"/traceability\" hx-target=\"#content\">");
    html.push_str("<div><label>Root type</label><select name=\"root_type\">");
    for t in &all_types {
        let sel = if *t == root_type { " selected" } else { "" };
        html.push_str(&format!(
            "<option value=\"{t}\"{sel}>{t}</option>",
            t = html_escape(t)
        ));
    }
    html.push_str("</select></div>");
    html.push_str("<div><label>Status</label><select name=\"status\">");
    for (val, label) in &[("all", "All"), ("approved", "Approved"), ("draft", "Draft")] {
        let sel = if *val == status_filter {
            " selected"
        } else {
            ""
        };
        html.push_str(&format!("<option value=\"{val}\"{sel}>{label}</option>"));
    }
    html.push_str("</select></div>");
    html.push_str(&format!(
        "<div><label>Search</label><input type=\"text\" name=\"search\" placeholder=\"ID or title...\" value=\"{}\"></div>",
        html_escape(&search_filter)
    ));
    html.push_str("<div><label>&nbsp;</label><button type=\"submit\">Filter</button></div>");
    html.push_str("</form></div>");

    let mut link_types_set: Vec<String> = Vec::new();
    for id in &root_artifacts {
        let backlinks = graph.backlinks_to(id);
        for bl in backlinks {
            if !link_types_set.contains(&bl.link_type) {
                link_types_set.push(bl.link_type.clone());
            }
        }
    }
    link_types_set.sort();

    if !root_artifacts.is_empty() && !link_types_set.is_empty() {
        html.push_str("<div class=\"card\" style=\"overflow-x:auto\"><h3 style=\"margin-top:0\">Coverage Matrix</h3>");
        html.push_str("<table class=\"trace-matrix\"><thead><tr><th>Artifact</th><th>Title</th>");
        for lt in &link_types_set {
            html.push_str(&format!("<th>{}</th>", html_escape(lt)));
        }
        html.push_str("</tr></thead><tbody>");
        for id in &root_artifacts {
            let a = store.get(id).unwrap();
            let backlinks = graph.backlinks_to(id);
            let cov_id_esc = html_escape(id);
            html.push_str(&format!(
                "<tr><td><a hx-get=\"/artifacts/{cov_id_esc}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{cov_id_esc}\">{cov_id_esc}</a></td><td style=\"color:var(--text-secondary);font-size:.82rem\">{}</td>",
                html_escape(&a.title)
            ));
            for lt in &link_types_set {
                let count = backlinks.iter().filter(|bl| bl.link_type == *lt).count();
                let (cell_class, display) = if count > 0 {
                    ("trace-cell-ok", count.to_string())
                } else {
                    ("trace-cell-gap", "0".to_string())
                };
                html.push_str(&format!(
                    "<td><span class=\"trace-cell {cell_class}\">{display}</span></td>"
                ));
            }
            html.push_str("</tr>");
        }
        html.push_str("</tbody></table></div>");
    }

    html.push_str("<div class=\"card\"><h3 style=\"margin-top:0\">Linkage Chains</h3>");
    if root_artifacts.is_empty() {
        html.push_str(
            "<p style=\"color:var(--text-secondary)\">No artifacts match the current filters.</p>",
        );
    } else {
        html.push_str("<div class=\"trace-tree\">");
        for id in &root_artifacts {
            let a = store.get(id).unwrap();
            let children = build_trace_children(id, store, graph, 0, 3);
            let badge = badge_for_type(&a.artifact_type);
            let status = a.status.as_deref().unwrap_or("");
            let status_class = match status {
                "approved" => "trace-status-approved",
                "draft" => "trace-status-draft",
                _ => "",
            };
            let status_badge = if !status.is_empty() {
                format!(
                    "<span class=\"trace-status {status_class}\">{}</span>",
                    html_escape(status)
                )
            } else {
                String::new()
            };
            let source_path = a
                .source_file
                .as_ref()
                .map(|p| p.display().to_string())
                .unwrap_or_default();
            let safe_id = id.replace('.', "_");

            if children.is_empty() {
                html.push_str(&format!(
                    "<div class=\"trace-node\" style=\"font-weight:600\">{badge} \
                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{escaped_id}</a> \
                     <span style=\"color:var(--text-secondary)\">{title}</span>{status_badge} \
                     <span style=\"color:var(--text-secondary);font-size:.75rem;font-style:italic;margin-left:.5rem\">(no inbound links)</span>\
                     <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
                     hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\"\
                     >History</button></div>\
                     <div id=\"hist-{safe_id}\"></div>",
                    id = html_escape(id),
                    escaped_id = html_escape(id),
                    title = html_escape(&a.title),
                    file = html_escape(&source_path),
                ));
            } else {
                let child_count = children.len();
                html.push_str(&format!(
                    "<details class=\"trace-details\" open>\
                     <summary style=\"font-weight:600\">{badge} \
                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\" \
                     onclick=\"event.stopPropagation()\">{escaped_id}</a> \
                     <span style=\"color:var(--text-secondary)\">{title}</span>{status_badge}\
                     <span style=\"color:var(--text-secondary);font-size:.75rem;margin-left:.25rem\">({child_count} inbound)</span>\
                     <span class=\"trace-chevron\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 2l4 4-4 4\"/></svg></span>\
                     <button class=\"btn btn-secondary\" style=\"margin-left:auto;padding:.2rem .5rem;font-size:.68rem\" \
                     hx-get=\"/traceability/history?file={file}\" hx-target=\"#hist-{safe_id}\" hx-swap=\"innerHTML\" \
                     onclick=\"event.stopPropagation()\"\
                     >History</button></summary>\
                     <div id=\"hist-{safe_id}\"></div>\
                     <div class=\"trace-level\">",
                    id = html_escape(id),
                    escaped_id = html_escape(id),
                    title = html_escape(&a.title),
                    file = html_escape(&source_path),
                ));
                for child in &children {
                    html.push_str(&render_trace_node(
                        child,
                        1,
                        &source_path_for_artifact(store, &child.id),
                    ));
                }
                html.push_str("</div></details>");
            }
        }
        html.push_str("</div>");
    }
    html.push_str("</div>");

    html
}

pub(crate) fn render_traceability_history(
    ctx: &RenderContext,
    params: &TraceHistoryParams,
) -> String {
    let pp = ctx.project_path;

    let file = match params.file {
        Some(ref f) if !f.is_empty() => f.clone(),
        _ => return "<div class=\"trace-history\"><span style=\"color:var(--text-secondary);font-size:.78rem\">No source file recorded</span></div>".to_string(),
    };

    let file_path = std::path::Path::new(&file);
    let rel_path = file_path.strip_prefix(pp).unwrap_or(file_path);

    let output = std::process::Command::new("git")
        .args([
            "log",
            "--oneline",
            "--follow",
            "--format=%h|%as|%s",
            "-10",
            "--",
        ])
        .arg(rel_path)
        .current_dir(pp)
        .output();

    match output {
        Ok(o) if o.status.success() => {
            let stdout = String::from_utf8_lossy(&o.stdout);
            let lines: Vec<&str> = stdout.lines().filter(|l| !l.is_empty()).collect();
            if lines.is_empty() {
                return "<div class=\"trace-history\"><span style=\"color:var(--text-secondary);font-size:.78rem\">No git history found</span></div>".to_string();
            }
            let mut h = String::from("<div class=\"trace-history\"><div class=\"trace-history-title\">Git History</div>");
            for line in &lines {
                let parts: Vec<&str> = line.splitn(3, '|').collect();
                if parts.len() == 3 {
                    h.push_str(&format!(
                        "<div class=\"trace-history-item\">\
                         <code>{}</code>\
                         <span class=\"hist-date\">{}</span>\
                         <span class=\"hist-msg\">{}</span></div>",
                        html_escape(parts[0]),
                        html_escape(parts[1]),
                        html_escape(parts[2]),
                    ));
                }
            }
            h.push_str("</div>");
            h
        }
        _ => "<div class=\"trace-history\"><span style=\"color:var(--text-secondary);font-size:.78rem\">Git history unavailable</span></div>".to_string(),
    }
}
