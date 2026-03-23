use rivet_core::adapter::{Adapter, AdapterConfig, AdapterSource};
use rivet_core::diff::ArtifactDiff;
use rivet_core::document::html_escape;
use rivet_core::formats::generic::GenericYamlAdapter;
use rivet_core::model::ProjectConfig;
use rivet_core::store::Store;

use super::RenderContext;
use super::helpers::badge_for_type;

pub(crate) struct DiffParams {
    pub(crate) base: Option<String>,
    pub(crate) head: Option<String>,
}

fn discover_git_refs(pp: &std::path::Path) -> (Vec<String>, Vec<String>) {
    let rg = |a: &[&str]| -> Vec<String> {
        std::process::Command::new("git")
            .args(a)
            .current_dir(pp)
            .output()
            .ok()
            .filter(|o| o.status.success())
            .map(|o| {
                String::from_utf8_lossy(&o.stdout)
                    .lines()
                    .map(|l| l.trim().to_string())
                    .filter(|l| !l.is_empty())
                    .collect()
            })
            .unwrap_or_default()
    };
    let tags = rg(&["tag", "--list", "--sort=-creatordate"]);
    let branches: Vec<String> = rg(&["branch", "--list", "--format=%(refname:short)"])
        .into_iter()
        .filter(|b| b != "HEAD")
        .collect();
    (tags, branches)
}

fn load_store_from_git_ref(pp: &std::path::Path, gr: &str) -> Result<Store, String> {
    let rg = |a: &[&str]| -> Result<String, String> {
        let o = std::process::Command::new("git")
            .args(a)
            .current_dir(pp)
            .output()
            .map_err(|e| format!("git: {e}"))?;
        if !o.status.success() {
            return Err(format!(
                "git show {gr} failed: {}",
                String::from_utf8_lossy(&o.stderr).trim()
            ));
        }
        Ok(String::from_utf8_lossy(&o.stdout).to_string())
    };

    let prefix = rg(&["rev-parse", "--show-prefix"])?.trim().to_owned();

    let config_path = format!("{prefix}rivet.yaml");
    let cc = rg(&["show", &format!("{gr}:{config_path}")])?;
    let cfg: ProjectConfig =
        serde_yaml::from_str(&cc).map_err(|e| format!("parse rivet.yaml@{gr}: {e}"))?;
    let mut store = Store::new();
    let adp = GenericYamlAdapter::new();
    let ac = AdapterConfig::default();
    for src in &cfg.sources {
        if src.format != "generic-yaml" && src.format != "generic" {
            continue;
        }
        let src_path = format!("{prefix}{}", src.path);
        let tree = rg(&["ls-tree", "-r", "--name-only", gr, "--", &src_path])?;
        for fp in tree.lines() {
            let fp = fp.trim();
            if fp.is_empty() || (!fp.ends_with(".yaml") && !fp.ends_with(".yml")) {
                continue;
            }
            let ct = match rg(&["show", &format!("{gr}:{fp}")]) {
                Ok(c) => c,
                Err(_) => continue,
            };
            if let Ok(arts) = adp.import(&AdapterSource::Bytes(ct.into_bytes()), &ac) {
                for a in arts {
                    store.upsert(a);
                }
            }
        }
    }
    Ok(store)
}

fn diff_ref_options(sel: &str, tags: &[String], branches: &[String], inc_wt: bool) -> String {
    let mut h = String::new();
    if inc_wt {
        let s = if sel == "working" { " selected" } else { "" };
        h.push_str(&format!(
            "<option value=\"working\"{s}>Working tree (unstaged)</option>"
        ));
    }
    for o in &["HEAD", "HEAD~1", "HEAD~2", "HEAD~3", "HEAD~4", "HEAD~5"] {
        let s = if sel == *o { " selected" } else { "" };
        h.push_str(&format!("<option value=\"{o}\"{s}>{o}</option>"));
    }
    if !tags.is_empty() {
        h.push_str("<optgroup label=\"Tags\">");
        for t in tags {
            let s = if sel == t { " selected" } else { "" };
            h.push_str(&format!(
                "<option value=\"{t}\"{s}>{t}</option>",
                t = html_escape(t)
            ));
        }
        h.push_str("</optgroup>");
    }
    if !branches.is_empty() {
        h.push_str("<optgroup label=\"Branches\">");
        for b in branches {
            let s = if sel == b { " selected" } else { "" };
            h.push_str(&format!(
                "<option value=\"{b}\"{s}>{b}</option>",
                b = html_escape(b)
            ));
        }
        h.push_str("</optgroup>");
    }
    h
}

pub(crate) fn render_diff_view(ctx: &RenderContext, params: &DiffParams) -> String {
    let pp = ctx.project_path;
    let br = params.base.clone().unwrap_or_default();
    let hr = params.head.clone().unwrap_or_default();
    let (tags, branches) = discover_git_refs(pp);
    let mut html = String::from("<h2>Diff</h2>");
    html.push_str(
        "<div class=\"card\"><form class=\"form-row\" hx-get=\"/diff\" hx-target=\"#content\">",
    );
    let bs = if br.is_empty() { "HEAD" } else { &br };
    html.push_str("<div><label>Base</label><select name=\"base\">");
    html.push_str(&diff_ref_options(bs, &tags, &branches, false));
    html.push_str("</select></div>");
    let hs = if hr.is_empty() { "working" } else { &hr };
    html.push_str("<div><label>Head</label><select name=\"head\">");
    html.push_str(&diff_ref_options(hs, &tags, &branches, true));
    html.push_str("</select></div>");
    html.push_str("<div><label>&nbsp;</label><button type=\"submit\">Compare</button></div>");
    html.push_str("</form></div>");
    if br.is_empty() && hr.is_empty() {
        html.push_str("<div class=\"card\" style=\"text-align:center;padding:3rem;color:var(--text-secondary)\"><p style=\"font-size:1.1rem;margin-bottom:.5rem\">Select a base and head revision, then click <strong>Compare</strong>.</p><p style=\"font-size:.88rem\">This will compare artifact YAML files between two git states.</p></div>");
        return html;
    }
    let base_store = match load_store_from_git_ref(pp, &br) {
        Ok(s) => s,
        Err(e) => {
            html.push_str(&format!("<div class=\"card\" style=\"color:#c62828\"><strong>Error loading base ({}):</strong> {}</div>", html_escape(&br), html_escape(&e)));
            return html;
        }
    };
    let head_store: Store;
    let head_label: String;
    if hr == "working" || hr.is_empty() {
        head_store = ctx.store.clone();
        head_label = "Working tree".to_string();
    } else {
        match load_store_from_git_ref(pp, &hr) {
            Ok(s) => {
                head_store = s;
                head_label = hr.clone();
            }
            Err(e) => {
                html.push_str(&format!("<div class=\"card\" style=\"color:#c62828\"><strong>Error loading head ({}):</strong> {}</div>", html_escape(&hr), html_escape(&e)));
                return html;
            }
        }
    };
    let diff = ArtifactDiff::compute(&base_store, &head_store);
    html.push_str(&format!("<p class=\"meta\" style=\"margin-bottom:.75rem\">Comparing <strong>{}</strong> &rarr; <strong>{}</strong></p>", html_escape(&br), html_escape(&head_label)));
    html.push_str("<div class=\"diff-summary\">");
    html.push_str(&format!("<span class=\"diff-summary-item\"><span class=\"diff-icon diff-icon-add\">+</span> {} added</span>", diff.added.len()));
    html.push_str(&format!("<span class=\"diff-summary-item\"><span class=\"diff-icon diff-icon-remove\">&minus;</span> {} removed</span>", diff.removed.len()));
    html.push_str(&format!("<span class=\"diff-summary-item\"><span class=\"diff-icon diff-icon-modify\">&Delta;</span> {} modified</span>", diff.modified.len()));
    html.push_str(&format!("<span class=\"diff-summary-item\" style=\"color:var(--text-secondary)\">{} unchanged</span>", diff.unchanged));
    html.push_str("</div>");
    if diff.is_empty() {
        html.push_str("<div class=\"card\" style=\"text-align:center;padding:2rem;color:var(--text-secondary)\"><p>No differences found between these revisions.</p></div>");
        return html;
    }
    html.push_str("<div class=\"card\" style=\"padding:0;overflow:hidden\">");
    for id in &diff.added {
        let title = head_store.get(id).map(|a| a.title.as_str()).unwrap_or("");
        let at = head_store
            .get(id)
            .map(|a| a.artifact_type.as_str())
            .unwrap_or("");
        html.push_str(&format!("<div class=\"diff-added\" style=\"padding:.6rem .875rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.5rem\"><span class=\"diff-icon diff-icon-add\">+</span><code style=\"font-weight:600\">{}</code> {} <span>{}</span></div>", html_escape(id), badge_for_type(at), html_escape(title)));
    }
    for id in &diff.removed {
        let title = base_store.get(id).map(|a| a.title.as_str()).unwrap_or("");
        let at = base_store
            .get(id)
            .map(|a| a.artifact_type.as_str())
            .unwrap_or("");
        html.push_str(&format!("<div class=\"diff-removed\" style=\"padding:.6rem .875rem;border-bottom:1px solid var(--border);display:flex;align-items:center;gap:.5rem\"><span class=\"diff-icon diff-icon-remove\">&minus;</span><code style=\"font-weight:600\">{}</code> {} <span>{}</span></div>", html_escape(id), badge_for_type(at), html_escape(title)));
    }
    for ch in &diff.modified {
        let at = head_store
            .get(&ch.id)
            .map(|a| a.artifact_type.as_str())
            .unwrap_or("");
        let title = head_store
            .get(&ch.id)
            .map(|a| a.title.as_str())
            .unwrap_or("");
        html.push_str(&format!("<details class=\"diff-row\"><summary class=\"diff-modified\"><span class=\"diff-icon diff-icon-modify\">&Delta;</span><code style=\"font-weight:600\">{}</code> {} <span>{}</span><span class=\"ver-chevron\" style=\"margin-left:auto\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\"><path d=\"M4 2l4 4-4 4\"/></svg></span></summary><div class=\"diff-detail\">", html_escape(&ch.id), badge_for_type(at), html_escape(title)));
        if let Some((ref o, ref n)) = ch.title_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Title</span> <span class=\"diff-old\">{}</span> <span class=\"diff-arrow\">&rarr;</span> <span class=\"diff-new\">{}</span></div>", html_escape(o), html_escape(n)));
        }
        if let Some((ref o, ref n)) = ch.status_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Status</span> <span class=\"diff-old\">{}</span> <span class=\"diff-arrow\">&rarr;</span> <span class=\"diff-new\">{}</span></div>", html_escape(o.as_deref().unwrap_or("(none)")), html_escape(n.as_deref().unwrap_or("(none)"))));
        }
        if let Some((ref o, ref n)) = ch.type_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Type</span> <span class=\"diff-old\">{}</span> <span class=\"diff-arrow\">&rarr;</span> <span class=\"diff-new\">{}</span></div>", html_escape(o), html_escape(n)));
        }
        if ch.description_changed {
            html.push_str("<div class=\"diff-field\"><span class=\"diff-field-name\">Description</span> <span style=\"color:var(--text-secondary);font-style:italic\">changed</span></div>");
        }
        for t in &ch.tags_added {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Tag</span> <span class=\"diff-new\">+ {}</span></div>", html_escape(t)));
        }
        for t in &ch.tags_removed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Tag</span> <span class=\"diff-old\">&minus; {}</span></div>", html_escape(t)));
        }
        for l in &ch.links_added {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Link</span> <span class=\"diff-new\">+ {} &rarr; {}</span></div>", html_escape(&l.link_type), html_escape(&l.target)));
        }
        for l in &ch.links_removed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Link</span> <span class=\"diff-old\">&minus; {} &rarr; {}</span></div>", html_escape(&l.link_type), html_escape(&l.target)));
        }
        for f in &ch.fields_changed {
            html.push_str(&format!("<div class=\"diff-field\"><span class=\"diff-field-name\">Field</span> <span style=\"color:var(--text-secondary)\">{} changed</span></div>", html_escape(f)));
        }
        html.push_str("</div></details>");
    }
    html.push_str("</div>");
    html
}
