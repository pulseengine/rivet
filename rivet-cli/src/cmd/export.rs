//! `rivet export` — HTML, Zola, Gherkin and other export formats.

use anyhow::{Context, Result};

use crate::{
    Cli, ProjectContext, apply_baseline_scope, apply_variant_overlay, resolve_variant_arg,
    validate_format,
};
#[cfg(feature = "serve")]
use crate::{find_latest_snapshot, render, resolve_schemas_dir, serve};

/// Export all project artifacts in the specified format.
// The HTML export path (and its params: single_page/theme/offline/homepage/
// version_label/versions_json) is gated behind `serve`, which owns the shared
// renderer (#456/#104). Without that feature those params are unused.
#[cfg_attr(not(feature = "serve"), allow(unused_variables))]
#[allow(clippy::too_many_arguments)]
pub(crate) fn cmd_export(
    cli: &Cli,
    format: &str,
    output: Option<&std::path::Path>,
    single_page: bool,
    theme: &str,
    offline: bool,
    homepage: Option<&str>,
    version_label: Option<&str>,
    versions_json: Option<&str>,
    baseline_name: Option<&str>,
    prefix: &str,
    sexpr_filter: Option<&str>,
    variant_arg: Option<&str>,
    shortcodes: bool,
    clean: bool,
) -> Result<bool> {
    validate_format(
        format,
        &[
            "reqif",
            "generic-yaml",
            "generic",
            "html",
            "gherkin",
            "zola",
        ],
    )?;
    // Resolve `--variant` (name or path) to a variant name ONCE, so every
    // export format applies the same per-variant field overlay (REQ-265).
    let variant_name: Option<String> = match variant_arg {
        Some(arg) => Some(resolve_variant_arg(&cli.project, arg)?.1),
        None => None,
    };
    let variant = variant_name.as_deref();
    if format == "zola" {
        return cmd_export_zola(
            cli,
            output,
            prefix,
            sexpr_filter,
            shortcodes,
            clean,
            baseline_name,
            variant,
        );
    }
    if format == "html" {
        #[cfg(not(feature = "serve"))]
        anyhow::bail!(
            "`export --format html` requires the `serve` feature — the HTML renderer \
             is shared with the dashboard server (#456/#104). This binary was built \
             with --no-default-features; rebuild with `--features serve` (or use \
             `--format zola`, `gherkin`, `reqif`, or `generic-yaml`)."
        );
        #[cfg(feature = "serve")]
        return cmd_export_html(
            cli,
            output,
            single_page,
            theme,
            offline,
            homepage,
            version_label,
            versions_json,
            sexpr_filter,
            variant,
        );
    }

    if format == "gherkin" {
        return cmd_export_gherkin(cli, output, baseline_name, variant);
    }

    use rivet_core::adapter::{Adapter, AdapterConfig};

    let ctx = ProjectContext::load(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let store = apply_variant_overlay(store, variant);
    // Sorted by id so the exported artifact (ReqIF/etc.) is byte-reproducible
    // across runs (REQ-159 / #415; the store is HashMap-ordered).
    let artifacts: Vec<_> = store.iter_sorted().cloned().collect();
    let config = AdapterConfig::default();

    let bytes = match format {
        "reqif" => {
            let adapter = rivet_core::reqif::ReqIfAdapter::new();
            adapter
                .export(&artifacts, &config)
                .map_err(|e| anyhow::anyhow!("{e}"))?
        }
        "generic-yaml" | "generic" => {
            let adapter = rivet_core::formats::generic::GenericYamlAdapter::new();
            adapter
                .export(&artifacts, &config)
                .map_err(|e| anyhow::anyhow!("{e}"))?
        }
        other => {
            anyhow::bail!(
                "unsupported export format: {other} (supported: reqif, generic-yaml, html, gherkin, zola)"
            )
        }
    };

    if let Some(path) = output {
        // The reqif/generic formats write a SINGLE file. If `--output` is an
        // existing directory the bare `fs::write` fails with a cryptic
        // "Is a directory (os error 21)"; give an actionable message instead.
        if path.is_dir() {
            let ext = if format == "reqif" { "reqif" } else { "yaml" };
            anyhow::bail!(
                "--output '{}' is a directory, but the '{format}' format writes a single file. \
                 Pass a file path (e.g. `--output out.{ext}`), or use a directory format \
                 (html/zola) for a multi-file site.",
                path.display(),
            );
        }
        std::fs::write(path, &bytes).with_context(|| format!("writing {}", path.display()))?;
        println!(
            "Exported {} artifacts to {}",
            artifacts.len(),
            path.display()
        );
    } else {
        use std::io::Write;
        std::io::stdout()
            .write_all(&bytes)
            .context("writing to stdout")?;
    }

    Ok(true)
}

/// Export artifacts to a Zola-compatible static site structure.
///
/// Writes content/<prefix>/artifacts/*.md with TOML frontmatter and
/// data/<prefix>/*.json with aggregate data. Additive-only: never
/// modifies existing files outside the prefix namespace.
#[allow(clippy::too_many_arguments)]
fn cmd_export_zola(
    cli: &Cli,
    output: Option<&std::path::Path>,
    prefix: &str,
    sexpr_filter: Option<&str>,
    shortcodes: bool,
    clean: bool,
    baseline_name: Option<&str>,
    variant: Option<&str>,
) -> Result<bool> {
    let ctx = ProjectContext::load_with_docs(cli)?;
    let store = apply_baseline_scope(ctx.store, baseline_name, &ctx.config);
    let store = apply_variant_overlay(store, variant);
    let doc_store = ctx.doc_store.unwrap_or_default();
    let graph = rivet_core::links::LinkGraph::build(&store, &ctx.schema);

    // Apply s-expression filter if provided. Sorted by id so the exported
    // site is reproducible across runs (REQ-159 / #415; store is HashMap-order).
    let mut artifacts: Vec<&rivet_core::model::Artifact> = if let Some(filter_src) = sexpr_filter {
        let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
            anyhow::anyhow!("invalid filter: {}", msgs.join("; "))
        })?;
        store
            .iter()
            .filter(|a| rivet_core::sexpr_eval::matches_filter_with_store(&expr, a, &graph, &store))
            .collect()
    } else {
        store.iter().collect()
    };
    artifacts.sort_by(|a, b| a.id.cmp(&b.id));

    // Slugs of the artifacts that actually get a page in this export. Used to
    // decide whether a cross-link / wiki-link can be emitted as a Zola internal
    // link (`@/…md`, which Zola resolves against `base_url` so it survives a
    // sub-directory deploy) — or, when the target is absent, degraded to plain
    // text so it neither leaks an absolute path nor breaks the downstream
    // `zola build` with a dangling internal link. (REQ-115, REQ-118)
    let exported_slugs: std::collections::HashSet<String> = artifacts
        .iter()
        .map(|a| a.id.to_lowercase().replace('.', "-"))
        .collect();

    let site_dir = output
        .map(|p| p.to_path_buf())
        .unwrap_or_else(|| std::path::PathBuf::from("."));

    // Validate the output directory looks like a Zola site.
    if !site_dir.join("config.toml").exists() && !site_dir.join("content").exists() {
        eprintln!(
            "warning: {} doesn't look like a Zola site (no config.toml or content/). Creating directories anyway.",
            site_dir.display()
        );
    }

    // Create namespaced directories.
    let content_dir = site_dir.join("content").join(prefix);
    let artifacts_dir = content_dir.join("artifacts");
    let data_dir = site_dir.join("data").join(prefix);

    // REQ-049: --clean removes stale pages before writing.
    if clean {
        if content_dir.exists() {
            std::fs::remove_dir_all(&content_dir)
                .with_context(|| format!("cleaning {}", content_dir.display()))?;
            println!("  cleaned {}", content_dir.display());
        }
        if data_dir.exists() {
            std::fs::remove_dir_all(&data_dir)
                .with_context(|| format!("cleaning {}", data_dir.display()))?;
        }
    }

    std::fs::create_dir_all(&artifacts_dir)
        .with_context(|| format!("creating {}", artifacts_dir.display()))?;
    std::fs::create_dir_all(&data_dir)
        .with_context(|| format!("creating {}", data_dir.display()))?;

    // ── Section index ───────────────────────────────────────────────
    let section_index = format!(
        "\
+++
title = \"{prefix}\"
sort_by = \"title\"
template = \"section.html\"
page_template = \"page.html\"
+++

Artifacts from the **{prefix}** project, exported by [rivet](https://github.com/pulseengine/rivet).
"
    );
    std::fs::write(content_dir.join("_index.md"), &section_index)?;

    let artifacts_index = format!(
        "\
+++
title = \"{prefix} — Artifacts\"
sort_by = \"title\"
+++

{count} artifacts exported.
",
        count = artifacts.len()
    );
    std::fs::write(artifacts_dir.join("_index.md"), &artifacts_index)?;

    // ── Individual artifact pages ───────────────────────────────────
    // Use provenance timestamp from first artifact that has one, or fallback.
    let export_date = artifacts
        .iter()
        .filter_map(|a| a.provenance.as_ref()?.timestamp.as_deref())
        .next()
        .and_then(|ts| ts.get(..10)) // "2026-04-07T..." -> "2026-04-07"
        .unwrap_or("2026-01-01");
    let mut artifact_count = 0;
    for artifact in &artifacts {
        let slug = artifact.id.to_lowercase().replace('.', "-");
        let status = artifact.status.as_deref().unwrap_or("unset");
        let mut all_tags: Vec<String> = artifact.tags.iter().map(|t| format!("\"{t}\"")).collect();
        all_tags.push(format!("\"{}\"", artifact.artifact_type));
        all_tags.push(format!("\"{}\"", status));
        let description_raw = artifact.description.as_deref().unwrap_or("");

        // Use description as fallback title if title is empty.
        let raw_title = if artifact.title.trim().is_empty() {
            description_raw
                .lines()
                .find(|l| !l.trim().is_empty())
                .unwrap_or(&artifact.id)
                .trim()
        } else {
            artifact.title.as_str()
        };

        // Escape title for TOML (replace quotes, collapse to single line).
        let title_escaped = raw_title
            .replace('\\', "\\\\")
            .replace('"', "\\\"")
            .replace('\n', " ");
        // TOML multi-line basic strings (""") process backslash escapes, so a
        // literal `\` in the description (e.g. a regex like `\.rs$`) is an
        // invalid escape that breaks `zola build`. Escape backslashes first
        // (like the title does), then the `"""` edge case.
        let description_toml = description_raw
            .replace('\\', "\\\\")
            .replace("\"\"\"", "\\\"\\\"\\\"");

        let links_md: String = artifact
            .links
            .iter()
            .map(|l| {
                let target_slug = l.target.to_lowercase().replace('.', "-");
                if exported_slugs.contains(&target_slug) {
                    // Zola internal link: resolved against `base_url`, so it
                    // survives a sub-directory deploy (REQ-115).
                    format!(
                        "- **{}** → [{}](@/{prefix}/artifacts/{target_slug}.md)\n",
                        l.link_type, l.target
                    )
                } else {
                    // Target not in this export — emit text, not a dead link.
                    format!("- **{}** → {}\n", l.link_type, l.target)
                }
            })
            .collect();

        // Include diagram field as Mermaid code block if present.
        let diagram_md = artifact
            .fields
            .get("diagram")
            .and_then(|v| v.as_str())
            .map(|d| format!("\n### Diagram\n\n```mermaid\n{d}\n```\n"))
            .unwrap_or_default();

        // Include rationale field if present (design decisions).
        let rationale_md = artifact
            .fields
            .get("rationale")
            .and_then(|v| v.as_str())
            .map(|r| format!("\n### Rationale\n\n{r}\n"))
            .unwrap_or_default();

        let page = format!(
            "\
+++
title = \"{id}: {title}\"
slug = \"{slug}\"
weight = {weight}
date = {date}

[taxonomies]
tags = [{tags}]

[extra]
id = \"{id}\"
artifact_type = \"{art_type}\"
status = \"{status}\"
description = \"\"\"\n{description}\n\"\"\"
links_count = {links_count}
+++

## {id}: {title}

{desc_body}
{rationale}{diagram}
### Links

{links_md}\
",
            id = artifact.id,
            title = title_escaped,
            slug = slug,
            weight = artifact_count,
            date = export_date,
            art_type = artifact.artifact_type,
            status = status,
            tags = all_tags.join(", "),
            description = description_toml,
            links_count = artifact.links.len(),
            desc_body = description_raw,
            rationale = rationale_md,
            diagram = diagram_md,
            links_md = if links_md.is_empty() {
                "No links.".to_string()
            } else {
                links_md
            },
        );

        let page_path = artifacts_dir.join(format!("{slug}.md"));
        std::fs::write(&page_path, &page)?;
        artifact_count += 1;
    }
    println!(
        "  wrote {artifact_count} artifact pages to {}",
        artifacts_dir.display()
    );

    // ── JSON data files ─────────────────────────────────────────────
    let artifacts_json: Vec<serde_json::Value> = artifacts
        .iter()
        .map(|a| {
            serde_json::json!({
                "id": a.id,
                "type": a.artifact_type,
                "title": a.title,
                "status": a.status.as_deref().unwrap_or("-"),
                "tags": a.tags,
                "links": a.links.iter().map(|l| serde_json::json!({"type": l.link_type, "target": l.target})).collect::<Vec<_>>(),
                "description": a.description.as_deref().unwrap_or(""),
            })
        })
        .collect();

    let data_output = serde_json::json!({
        "project": ctx.config.project.name,
        "prefix": prefix,
        "count": artifacts_json.len(),
        "artifacts": artifacts_json,
    });
    std::fs::write(
        data_dir.join("artifacts.json"),
        serde_json::to_string_pretty(&data_output)?,
    )?;

    // Stats data.
    let mut type_counts = std::collections::BTreeMap::new();
    let mut status_counts = std::collections::BTreeMap::new();
    for a in &artifacts {
        *type_counts.entry(a.artifact_type.clone()).or_insert(0usize) += 1;
        *status_counts
            .entry(a.status.clone().unwrap_or_else(|| "unset".into()))
            .or_insert(0usize) += 1;
    }
    let stats_output = serde_json::json!({
        "total": artifacts.len(),
        "by_type": type_counts,
        "by_status": status_counts,
    });
    std::fs::write(
        data_dir.join("stats.json"),
        serde_json::to_string_pretty(&stats_output)?,
    )?;
    // REQ-049: embed validation result so consumers can verify export freshness.
    let diagnostics = rivet_core::validate::validate_with_externals(
        &store,
        &ctx.schema,
        &graph,
        &ctx.external_schemas,
    );
    let errors = diagnostics
        .iter()
        .filter(|d| d.severity == rivet_core::schema::Severity::Error)
        .count();
    let warnings = diagnostics
        .iter()
        .filter(|d| d.severity == rivet_core::schema::Severity::Warning)
        .count();
    let validation_output = serde_json::json!({
        "result": if errors > 0 { "FAIL" } else { "PASS" },
        "errors": errors,
        "warnings": warnings,
        "artifact_count": artifacts.len(),
        "exported_at": export_date,
    });
    std::fs::write(
        data_dir.join("validation.json"),
        serde_json::to_string_pretty(&validation_output)?,
    )?;
    println!("  wrote data files to {}", data_dir.display());

    // ── Shortcodes (optional) ───────────────────────────────────────
    if shortcodes {
        let shortcodes_dir = site_dir.join("templates").join("shortcodes");
        std::fs::create_dir_all(&shortcodes_dir)?;

        // rivet_artifact shortcode.
        let artifact_shortcode = r#"{# rivet_artifact: embed an artifact card by ID.
   Usage: {{ rivet_artifact(id="REQ-001", prefix="rivet") }}
#}
{% set prefix = prefix | default(value="rivet") %}
{% set data = load_data(path="data/" ~ prefix ~ "/artifacts.json") %}
{% set matches = data.artifacts | filter(attribute="id", value=id) %}
{% if matches | length > 0 %}
{% set art = matches | first %}
{% set slug = art.id | lower | replace(from=".", to="-") %}
<div class="rivet-artifact-card" style="border:1px solid #444; border-radius:6px; padding:12px; margin:8px 0;">
  <div>
    <span style="background:#2563eb;color:#fff;padding:2px 8px;border-radius:3px;font-size:0.85em;">{{ art.type }}</span>
    <span style="background:#059669;color:#fff;padding:2px 8px;border-radius:3px;font-size:0.85em;">{{ art.status }}</span>
  </div>
  <strong><a href="{{ get_url(path=prefix ~ '/artifacts/' ~ slug ~ '/') }}">{{ art.id }}</a></strong>: {{ art.title }}
  {% if art.description %}<p style="margin:4px 0;font-size:0.9em;">{{ art.description | truncate(length=200) }}</p>{% endif %}
</div>
{% else %}
<span style="color:red;">Unknown artifact: {{ id }}</span>
{% endif %}
"#;
        std::fs::write(
            shortcodes_dir.join("rivet_artifact.html"),
            artifact_shortcode,
        )?;

        // rivet_stats shortcode.
        let stats_shortcode = r#"{# rivet_stats: show artifact counts.
   Usage: {{ rivet_stats(prefix="rivet") }}
#}
{% set prefix = prefix | default(value="rivet") %}
{% set data = load_data(path="data/" ~ prefix ~ "/stats.json") %}
<div class="rivet-stats" style="display:flex;gap:16px;flex-wrap:wrap;margin:8px 0;">
  <div style="padding:8px 16px;background:#1e293b;border-radius:6px;">
    <strong>{{ data.total }}</strong> artifacts
  </div>
  {% for type_name, count in data.by_type %}
  <div style="padding:8px 16px;background:#1e293b;border-radius:6px;">
    <strong>{{ count }}</strong> {{ type_name }}
  </div>
  {% endfor %}
</div>
"#;
        std::fs::write(shortcodes_dir.join("rivet_stats.html"), stats_shortcode)?;
        println!("  wrote shortcodes to {}", shortcodes_dir.display());
    }

    // ── Documents ────────────────────────────────────────────────────
    if !doc_store.is_empty() {
        let docs_dir = content_dir.join("docs");
        std::fs::create_dir_all(&docs_dir)?;

        let docs_index = format!(
            "\
+++
title = \"{prefix} — Documents\"
sort_by = \"title\"
+++

{count} document(s) exported.
",
            count = doc_store.len()
        );
        std::fs::write(docs_dir.join("_index.md"), &docs_index)?;

        let mut doc_count = 0;
        for doc in doc_store.iter() {
            let slug: String = doc
                .id
                .to_lowercase()
                .chars()
                .map(|c| if c == '.' || c == ' ' { '-' } else { c })
                .collect();
            let status = doc.status.as_deref().unwrap_or("unset");

            // Resolve [[ID]] wiki-links. Emit a Zola internal link (`@/…md`,
            // resolved against `base_url` so it survives a sub-directory
            // deploy) when the target is in this export; otherwise degrade to
            // the bare ID text rather than leak an absolute path or break the
            // downstream `zola build` with a dangling internal link (REQ-118).
            let mut body = doc.body.clone();
            let mut scan_from = 0;
            while let Some(rel) = body[scan_from..].find("[[") {
                let start = scan_from + rel;
                if let Some(end) = body[start + 2..].find("]]") {
                    let id = body[start + 2..start + 2 + end].to_string();
                    let target_slug = id.to_lowercase().replace('.', "-");
                    let replacement = if exported_slugs.contains(&target_slug) {
                        format!("[{id}](@/{prefix}/artifacts/{target_slug}.md)")
                    } else {
                        id.clone()
                    };
                    body.replace_range(start..start + 2 + end + 2, &replacement);
                    scan_from = start + replacement.len();
                } else {
                    break;
                }
            }

            let page = format!(
                "\
+++
title = \"{title}\"
slug = \"{slug}\"
weight = {weight}

[extra]
id = \"{id}\"
doc_type = \"{doc_type}\"
status = \"{status}\"
+++

{body}
",
                title = doc.title.replace("\"", "\\\""),
                slug = slug,
                weight = doc_count,
                id = doc.id,
                doc_type = doc.doc_type,
                status = status,
                body = body,
            );

            std::fs::write(docs_dir.join(format!("{slug}.md")), &page)?;
            doc_count += 1;
        }
        println!(
            "  wrote {doc_count} document pages to {}",
            docs_dir.display()
        );
    }

    // ── Fallback templates (only if missing) ──────────────────────
    // Zola requires taxonomy templates when tags are used. If the site
    // has no theme and no templates, generate minimal ones so `zola build` works.
    let templates_dir = site_dir.join("templates");
    let fallback_templates = [
        (
            "taxonomy_list.html",
            "<html><body><h1>{{ taxonomy.name | title }}</h1><ul>{% for term in terms %}<li><a href=\"{{ term.permalink }}\">{{ term.name }}</a> ({{ term.pages | length }})</li>{% endfor %}</ul></body></html>",
        ),
        (
            "taxonomy_single.html",
            "<html><body><h1>{{ term.name }}</h1><ul>{% for page in term.pages %}<li><a href=\"{{ page.permalink }}\">{{ page.title }}</a></li>{% endfor %}</ul></body></html>",
        ),
    ];
    for (name, content) in &fallback_templates {
        let path = templates_dir.join(name);
        if !path.exists() {
            std::fs::create_dir_all(&templates_dir)?;
            std::fs::write(&path, content)?;
        }
    }

    // ── Instructions ────────────────────────────────────────────────
    println!("\nZola export complete ({prefix}).");
    println!("  Content: content/{prefix}/artifacts/");
    if !doc_store.is_empty() {
        println!("  Content: content/{prefix}/docs/");
    }
    println!("  Data:    data/{prefix}/");
    println!("\n  Ensure your config.toml has a 'tags' taxonomy:");
    println!("    [[taxonomies]]");
    println!("    name = \"tags\"");

    Ok(true)
}

/// Export artifacts with acceptance-criteria fields to Gherkin .feature files.
fn cmd_export_gherkin(
    cli: &Cli,
    output: Option<&std::path::Path>,
    baseline_name: Option<&str>,
    variant: Option<&str>,
) -> Result<bool> {
    let ctx = ProjectContext::load(cli)?;
    let baselines = ctx.config.baselines.as_deref().unwrap_or(&[]);
    let store = if let Some(name) = baseline_name {
        ctx.store.scoped(name, baselines)
    } else {
        ctx.store.clone()
    };
    let store = apply_variant_overlay(store, variant);

    let out_dir = output.unwrap_or(std::path::Path::new("features"));
    std::fs::create_dir_all(out_dir).with_context(|| format!("creating {}", out_dir.display()))?;

    let mut file_count = 0;
    let mut scenario_count = 0;

    for art in store.iter() {
        let criteria = art
            .fields
            .get("acceptance-criteria")
            .and_then(|v| v.as_sequence());
        let Some(criteria) = criteria else { continue };
        if criteria.is_empty() {
            continue;
        }

        // Build .feature file
        let mut feature = String::new();
        feature.push_str(&format!(
            "# Generated from {} by rivet export --format gherkin\n",
            art.id
        ));
        feature.push_str(&format!("Feature: {} — {}\n", art.id, art.title));
        if let Some(ref desc) = art.description {
            for line in desc.lines().take(5) {
                feature.push_str(&format!("  {}\n", line.trim()));
            }
        }
        feature.push('\n');

        // Generate linked requirements as tags
        let req_tags: Vec<String> = art
            .links
            .iter()
            .filter(|l| l.link_type == "verifies" || l.link_type == "satisfies")
            .map(|l| format!("@{}", l.target))
            .collect();

        for (i, criterion) in criteria.iter().enumerate() {
            // REQ-313 / #856: a criterion may be a bare string OR a mapping
            // carrying `text` / `status` / `blocked-by`, which is what an
            // author writes when a criterion is not yet dischargeable. This
            // used to call `as_str()` and `continue` on anything else, so the
            // mapping form was SILENTLY DROPPED — the generated .feature file
            // got a header and no scenarios, with no error anywhere.
            let Some(parsed) = rivet_core::model::parse_acceptance_criterion(criterion) else {
                // Not silently. An unreadable criterion is exactly the thing
                // this requirement exists to stop vanishing.
                eprintln!(
                    "  warning: {} acceptance-criteria[{}] has no usable `text` — \
                     skipped in the gherkin export",
                    art.id, i
                );
                continue;
            };
            let text = parsed.text.as_str();

            // Parse "Given X, When Y, Then Z" or just use as-is
            if !req_tags.is_empty() {
                feature.push_str(&format!("  {}\n", req_tags.join(" ")));
            }
            // A declared-blocked criterion is tagged and annotated rather than
            // rendered as an ordinary scenario, so a reader of the .feature —
            // and any runner that reads tags — can tell "declared not yet
            // dischargeable" from "expected to pass".
            if parsed.is_blocked() {
                feature.push_str("  @blocked\n");
            }
            feature.push_str(&format!("  Scenario: {} criterion {}\n", art.id, i + 1));
            if parsed.is_blocked() {
                match parsed.blocked_by.as_deref() {
                    Some(b) => feature.push_str(&format!(
                        "    # DECLARED BLOCKED — cannot be discharged until: {b}\n"
                    )),
                    None => feature.push_str("    # DECLARED BLOCKED — no blocker recorded\n"),
                }
            }

            // Try to parse structured given/when/then
            let parts: Vec<&str> = text.splitn(3, ',').collect();
            if parts.len() >= 3
                && parts[0].trim().to_lowercase().starts_with("given")
                && parts[1].trim().to_lowercase().starts_with("when")
            {
                feature.push_str(&format!("    {}\n", parts[0].trim()));
                feature.push_str(&format!("    {}\n", parts[1].trim()));
                feature.push_str(&format!("    {}\n", parts[2].trim()));
            } else {
                // Freeform — wrap in Given/Then
                feature.push_str(
                    "    Given the system is operational
",
                );
                feature.push_str(&format!("    Then {}\n", text));
            }
            feature.push('\n');
            scenario_count += 1;
        }

        // Write to file
        let filename = format!("{}.feature", art.id.to_lowercase().replace('-', "_"));
        let path = out_dir.join(&filename);
        std::fs::write(&path, &feature).with_context(|| format!("writing {}", path.display()))?;
        file_count += 1;
    }

    eprintln!(
        "Exported {} scenarios across {} .feature files to {}",
        scenario_count,
        file_count,
        out_dir.display()
    );

    if file_count == 0 {
        eprintln!(
            "hint: No artifacts have acceptance-criteria fields. Add them:\n\
             rivet modify TEST-001 --set-field 'acceptance-criteria=[\"Given X, When Y, Then Z\"]'"
        );
    }

    Ok(true)
}

/// Export to a static HTML site using the dashboard render module.
/// Whether a `/docs-asset/<rel>` path is a safe relative subpath to copy.
///
/// Artifact/document content can come from UNTRUSTED cross-repo externals
/// (REQ-085 externals / supplier pull), so a crafted `src="/docs-asset/…"`
/// must not be able to read or write outside the export's `_assets/docs/`.
/// `rel.contains("..")` alone is insufficient: an absolute path makes
/// `Path::join` discard the base (`docs_out.join("/etc/passwd")` ==
/// `/etc/passwd`). Require every path component to be a plain `Normal`
/// segment (which excludes `..`, `.`, root, and Windows prefixes), reject
/// backslashes (a Unix `rel` should never contain them), and cap length.
#[cfg(feature = "serve")]
fn is_safe_doc_asset_path(rel: &str) -> bool {
    use std::path::{Component, Path};
    if rel.is_empty() || rel.len() > 1024 || rel.contains('\\') || rel.contains('\0') {
        return false;
    }
    let p = Path::new(rel);
    if p.is_absolute() {
        return false;
    }
    p.components().all(|c| matches!(c, Component::Normal(_)))
}

/// Map a `rivet serve` route to the static export's file path, relative
/// to the export root (no leading slash). REQ-105: the export reuses the
/// serve dashboard's HTML, whose links are absolute server routes
/// (`/artifacts/REQ-1`, `/coverage`) — which 404 as static files. This
/// returns the on-disk page the export actually wrote for that route, so
/// links can be rewritten to a working relative path.
///
/// Mirrors the route→file layout in `cmd_export_html`'s `write_page`
/// calls; keep the two in sync.
#[cfg(feature = "serve")]
fn static_file_for_route(route: &str) -> String {
    // Strip query string / fragment, then split into non-empty segments.
    let path = route.split(['?', '#']).next().unwrap_or(route);
    let segs: Vec<&str> = path.split('/').filter(|s| !s.is_empty()).collect();
    match segs.as_slice() {
        // Overview is written as index.html (route "/" or "/stats").
        [] | ["stats"] => "index.html".to_string(),
        ["artifacts"] => "artifacts/index.html".to_string(),
        // /artifacts/{id} and sub-routes (/artifacts/{id}/graph, …, which
        // the static export does not render) both resolve to the detail page.
        ["artifacts", id, ..] => format!("artifacts/{id}.html"),
        ["documents"] => "documents/index.html".to_string(),
        ["documents", id, ..] => format!("documents/{id}.html"),
        ["help"] => "help/index.html".to_string(),
        ["help", "schema"] => "help/schema/index.html".to_string(),
        ["help", "schema", name, ..] => format!("help/schema/{name}.html"),
        ["help", "links"] => "help/links.html".to_string(),
        ["help", "rules"] => "help/rules.html".to_string(),
        // Section roots exported as <section>/index.html.
        [sec]
            if matches!(
                *sec,
                "validate" | "matrix" | "coverage" | "graph" | "stpa" | "eu-ai-act"
            ) =>
        {
            format!("{sec}/index.html")
        }
        // Unknown route: best-effort to its section index so a link never
        // points at the filesystem root.
        [first, ..] => format!("{first}/index.html"),
    }
}

/// Rewrite absolute serve-route links + `/docs-asset/` image srcs in a
/// page's rendered content so the static export is self-navigable
/// (REQ-105). `prefix` is the page's depth-adjusted `../` chain.
/// `href`/`hx-get` routes become `{prefix}<static-file>`; `/docs-asset/`
/// image srcs become `{prefix}_assets/docs/<path>` and the referenced
/// path is recorded in `docs_assets` so the caller can copy the image.
/// External (http/https/`//`), in-page anchors (`#…`), and already-relative
/// links are left untouched.
#[cfg(feature = "serve")]
fn rewrite_static_links(
    content: &str,
    prefix: &str,
    docs_assets: &mut std::collections::BTreeSet<String>,
) -> String {
    let mut out = String::with_capacity(content.len() + 64);
    let mut rest = content;
    // Attribute openers whose value is a URL we may need to rewrite.
    const ATTRS: &[&str] = &["href=\"", "hx-get=\"", "src=\""];
    'outer: loop {
        // Find the earliest next attribute opener.
        let mut best: Option<(usize, &str)> = None;
        for a in ATTRS {
            if let Some(i) = rest.find(a) {
                if best.is_none_or(|(b, _)| i < b) {
                    best = Some((i, a));
                }
            }
        }
        let Some((idx, attr)) = best else {
            out.push_str(rest);
            break 'outer;
        };
        let val_start = idx + attr.len();
        out.push_str(&rest[..val_start]);
        let after = &rest[val_start..];
        let Some(end) = after.find('"') else {
            out.push_str(after);
            break 'outer;
        };
        let url = &after[..end];
        // Only absolute same-origin paths (start with a single '/').
        let rewritten = if url.starts_with("//") || !url.starts_with('/') {
            url.to_string()
        } else if let Some(asset) = url.strip_prefix("/docs-asset/") {
            // Image/asset from a docs directory → copy under _assets/docs/.
            // Only record + rewrite paths that are safe relative subpaths
            // (untrusted cross-repo content could craft a traversal). An
            // unsafe path is left as-is (a dead link), never copied.
            if is_safe_doc_asset_path(asset) {
                docs_assets.insert(asset.to_string());
                format!("{prefix}_assets/docs/{asset}")
            } else {
                url.to_string()
            }
        } else if attr == "src=\"" {
            // Other absolute src (rare) — leave as-is.
            url.to_string()
        } else {
            format!("{prefix}{}", static_file_for_route(url))
        };
        out.push_str(&rewritten);
        rest = &after[end..];
    }
    out
}

/// REQ-401 item 2: write the export's `config.js` from `--homepage`,
/// `--version-label` and `--versions`. Every exported page loads it and fills
/// its home link and version switcher. The label defaults to rivet.yaml's
/// `project.version`, else "dev"; a `--versions` value that is not a JSON
/// array of `{"label", "path"}` objects is an error rather than ignored.
#[cfg(feature = "serve")]
fn write_export_config_js(
    out_dir: &std::path::Path,
    project_path: &std::path::Path,
    project_name: &str,
    homepage: Option<&str>,
    version_label: Option<&str>,
    versions_json: Option<&str>,
) -> Result<()> {
    #[derive(serde::Deserialize)]
    struct Entry {
        label: String,
        path: String,
    }
    let versions: Vec<rivet_core::export::VersionEntry> = match versions_json {
        None => Vec::new(),
        Some(raw) => serde_json::from_str::<Vec<Entry>>(raw)
            .with_context(|| {
                format!(
                    "--versions must be a JSON array of {{\"label\", \"path\"}} objects, got: {raw}"
                )
            })?
            .into_iter()
            .map(|e| rivet_core::export::VersionEntry {
                label: e.label,
                path: e.path,
            })
            .collect(),
    };
    let project_version = rivet_core::load_project_config(&project_path.join("rivet.yaml"))
        .ok()
        .and_then(|c| c.project.version);
    let label = version_label
        .map(str::to_string)
        .or(project_version)
        .unwrap_or_else(|| "dev".to_string());
    let js = rivet_core::export::generate_config_js(homepage, &label, &versions, project_name);
    let path = out_dir.join("config.js");
    std::fs::write(&path, js).with_context(|| format!("writing {}", path.display()))
}

/// This generates one standalone `.html` file per view, using the same
/// render functions as `rivet serve`. No HTMX is included — all links
/// are plain `<a href="...">` anchors that work in any static file server
/// or offline browser.
#[allow(clippy::too_many_arguments)]
#[cfg(feature = "serve")]
fn cmd_export_html(
    cli: &Cli,
    output: Option<&std::path::Path>,
    single_page: bool,
    theme: &str,
    offline: bool,
    homepage: Option<&str>,
    version_label: Option<&str>,
    versions_json: Option<&str>,
    sexpr_filter: Option<&str>,
    variant: Option<&str>,
) -> Result<bool> {
    use crate::render::styles;
    use crate::serve::components::ViewParams;

    let schemas_dir = resolve_schemas_dir(cli);
    let project_path = cli
        .project
        .canonicalize()
        .unwrap_or_else(|_| cli.project.clone());

    // Load project state using the same pipeline as `rivet serve`.
    let mut state = serve::reload_state(&project_path, &schemas_dir, 0)
        .context("loading project for export")?;

    // Apply the variant's per-variant field overlay to the store so the
    // compliance bundle reflects variant-scoped field values (REQ-265). The
    // link graph is rebuilt so any downstream trace view stays consistent.
    if variant.is_some() {
        state.store = apply_variant_overlay(state.store, variant);
        state.graph = rivet_core::links::LinkGraph::build(&state.store, &state.schema)
            .with_marker_evidence(state.marker_verified.iter().cloned());
    }

    // ── Single-page mode (audit-bundle shape) ────────────────────────
    //
    // The multi-page export below mirrors the `rivet serve` dashboard
    // (~800 pages, ~800 MB) which is useful for browsing but not for an
    // audit bundle. `--single-page` short-circuits to the dedicated
    // single-page renderer in `rivet_core::export::render_single_page`:
    // one self-contained `index.html` with the index / requirements /
    // documents / STPA / EU-AI-Act / coverage / matrix / validation /
    // graph sections inline, ~3-5 MB total. This is the path the
    // `.github/actions/compliance` action calls; the CLI previously
    // ignored the flag (the parameters were `_`-prefixed).
    if single_page {
        let config = rivet_core::export::ExportConfig {
            theme: match theme {
                "light" => rivet_core::export::ExportTheme::Light,
                _ => rivet_core::export::ExportTheme::Dark,
            },
            offline,
        };
        let project_name = state.context.project_name.clone();
        let version = env!("CARGO_PKG_VERSION").to_string();
        // REQ-400: apply the project's declared unmodelled rules, as the
        // dashboard and `rivet coverage` do.
        let unmodelled = state
            .config
            .coverage
            .as_ref()
            .map_or(&[][..], |c| &c.unmodelled_rules);
        let html = rivet_core::export::render_single_page_with_unmodelled(
            &state.store,
            &state.schema,
            &state.graph,
            &state.cached_diagnostics,
            &project_name,
            &version,
            &config,
            &state.doc_store,
            unmodelled,
        );
        let out_dir = output.unwrap_or(std::path::Path::new("dist"));
        std::fs::create_dir_all(out_dir)
            .with_context(|| format!("creating {}", out_dir.display()))?;
        write_export_config_js(
            out_dir,
            &project_path,
            &project_name,
            homepage,
            version_label,
            versions_json,
        )?;
        let out_file = out_dir.join("index.html");
        std::fs::write(&out_file, &html)
            .with_context(|| format!("writing {}", out_file.display()))?;
        println!(
            "Exported single-page HTML ({} bytes) to {}",
            html.len(),
            out_file.display(),
        );
        return Ok(true);
    }

    // Auto-detect baseline snapshot for delta rendering.
    let snap_dir = project_path.join("snapshots");
    let baseline_snapshot = find_latest_snapshot(&snap_dir)
        .ok()
        .and_then(|path| rivet_core::snapshot::read_from_file(&path).ok());
    if let Some(ref snap) = baseline_snapshot {
        eprintln!(
            "delta: comparing against baseline {} ({})",
            snap.git_commit_short, snap.created_at,
        );
    }

    let mut ctx = state.as_render_context();
    ctx.baseline = baseline_snapshot.as_ref();
    ctx.static_export = true;
    let params = ViewParams::default();

    // SC-EMBED-1: warn when working tree is dirty.
    if let Some(ref git) = state.context.git {
        if git.is_dirty {
            eprintln!(
                "warning: working tree is dirty ({} uncommitted change{}) — exported data may not match any commit",
                git.dirty_count,
                if git.dirty_count == 1 { "" } else { "s" },
            );
        }
    }

    // ── Mermaid JS (inlined so the site works offline) ──────────────
    const MERMAID_JS: &str = include_str!("../../assets/mermaid.min.js");
    // REQ-105: the svg-viewer toolbar handlers (zoom-fit / fullscreen /
    // popout). serve delivers these inline via serve/js.rs; the static
    // export must bundle them or the toolbar buttons are dead.
    const SVG_VIEWER_JS: &str = include_str!("../../assets/svg-viewer.js");

    // REQ-105: `/docs-asset/<path>` image references collected across all
    // pages during rewrite, copied into `_assets/docs/` after rendering.
    let docs_assets = std::cell::RefCell::new(std::collections::BTreeSet::<String>::new());

    // ── Static layout wrapper ────────────────────────────────────────
    // Produces a full HTML document with CSS + Mermaid, a nav sidebar
    // with plain <a href="..."> links, and the page content in <main>.
    // No HTMX is included — this is a completely static site.
    let artifact_count = state.store.len();
    let error_count = state
        .cached_diagnostics
        .iter()
        .filter(|d| d.severity == rivet_core::schema::Severity::Error)
        .count();

    let wrap_page = |title: &str, content: &str, rel_path: &str| -> String {
        // A static export has no `rivet serve` JS to fill the `.aadl-diagram`
        // placeholder, so the perpetual "Loading AADL diagram..." reads as a
        // hung page in compliance reports (#468). Replace it with an honest
        // note. (REQ-196 patched rivet-core's render_document_page, which this
        // multi-page exporter does not use — so it never reached the real
        // output; REQ-200 fixes it here, the universal per-page wrapper.)
        let content = content.replace(
            "<p class=\"aadl-loading\">Loading AADL diagram...</p>",
            "<p class=\"aadl-loading\">AADL architecture diagram — interactive \
             rendering is available in the <code>rivet serve</code> dashboard.</p>",
        );
        let content = content.as_str();
        // REQ-088: depth-adjusted prefix so per-page asset and nav hrefs
        // work for pages at any nesting (root, depth-1, depth-2, …).
        // `rel_path` is the page's path relative to `out_dir`, e.g.
        // "index.html" (depth 0) or "artifacts/foo.html" (depth 1) or
        // "help/schema/foo.html" (depth 2).
        let depth = rel_path.matches('/').count();
        let prefix: String = "../".repeat(depth);
        let version = env!("CARGO_PKG_VERSION");
        // REQ-401 item 2: the config.js loader and its nav placeholders, shared
        // with the core export pages.
        let config_runtime = rivet_core::export::config_runtime_script();
        let config_hooks = rivet_core::export::config_nav_placeholders();
        let project_name = &state.context.project_name;
        let error_badge = if error_count > 0 {
            format!("<span class=\"nav-badge nav-badge-error\">{error_count}</span>")
        } else {
            "<span class=\"nav-badge\">OK</span>".to_string()
        };
        let doc_count = state.doc_store.len();
        let doc_badge = if doc_count > 0 {
            format!("<span class=\"nav-badge\">{doc_count}</span>")
        } else {
            String::new()
        };
        let stpa_count: usize = rivet_core::export::STPA_TYPES
            .iter()
            .map(|t| state.store.count_by_type(t))
            .sum();
        let stpa_nav = if stpa_count > 0 {
            format!(
                "<li><a href=\"{prefix}stpa/index.html\">STPA \
                 <span class=\"nav-badge\">{stpa_count}</span></a></li>"
            )
        } else {
            String::new()
        };
        // Externals appear in the nav only when the project configures them,
        // as on the dashboard; the page is exported under the same condition.
        let externals_nav = if state.externals.is_empty() {
            String::new()
        } else {
            format!("<li><a href=\"{prefix}externals/index.html\">Externals</a></li>")
        };
        let eu_ai_act_loaded = rivet_core::compliance::is_eu_ai_act_loaded(&state.schema);
        let eu_ai_act_nav = if eu_ai_act_loaded {
            let eu_count: usize = rivet_core::compliance::EU_AI_ACT_TYPES
                .iter()
                .map(|t| state.store.count_by_type(t))
                .sum();
            // #956: the dashboard nav shows `0` for a loaded schema with no
            // artifacts; the export showed nothing. Same badge in both now.
            let badge = format!("<span class=\"nav-badge\">{eu_count}</span>");
            format!("<li><a href=\"{prefix}eu-ai-act/index.html\">EU AI Act{badge}</a></li>")
        } else {
            String::new()
        };
        format!(
            r#"<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title} — {project_name} — Rivet</title>
<link rel="stylesheet" href="{prefix}_assets/styles.css">
<script src="{prefix}_assets/mermaid.min.js"></script>
<script src="{prefix}_assets/svg-viewer.js"></script>
<script>window.RIVET_EXPORT_ROOT="{prefix}";</script>
<script src="{prefix}config.js"></script>
{config_runtime}
<script>
mermaid.initialize({{startOnLoad:false,theme:'neutral',securityLevel:'strict'}});
document.addEventListener('DOMContentLoaded',function(){{
  mermaid.run({{querySelector:'.mermaid'}}).catch(function(){{}});
}});
</script>
</head>
<body>
<div class="shell">
<nav role="navigation" aria-label="Main navigation">
  <h1>Rivet</h1>
{config_hooks}  <ul>
    <li><a href="{prefix}index.html">Overview
      <span class="nav-badge">{artifact_count}</span></a></li>
    <li><a href="{prefix}artifacts/index.html">Artifacts
      <span class="nav-badge">{artifact_count}</span></a></li>
    <li><a href="{prefix}validate/index.html">Validation
      {error_badge}</a></li>
    <li class="nav-divider"></li>
    <li><a href="{prefix}matrix/index.html">Matrix</a></li>
    <li><a href="{prefix}coverage/index.html">Coverage</a></li>
    <li><a href="{prefix}graph/index.html">Graph</a></li>
    <li><a href="{prefix}documents/index.html">Documents{doc_badge}</a></li>
    <li><a href="{prefix}traceability/index.html">Traceability</a></li>
    <li><a href="{prefix}verification/index.html">Verification</a></li>
    <li><a href="{prefix}doc-linkage/index.html">Doc Linkage</a></li>
    <li><a href="{prefix}results/index.html">Test Results</a></li>
    {externals_nav}
    <li class="nav-divider"></li>
    {stpa_nav}
    {eu_ai_act_nav}
    <li><a href="{prefix}help/index.html">Help &amp; Docs</a></li>
  </ul>
  <div style="padding:.75rem 1rem;font-size:.7rem;color:var(--sidebar-text)">
    v{version}
  </div>
</nav>
<div class="content-area">
<main id="content" role="main">
{content}
<div class="footer">Generated by Rivet v{version} &mdash; <a href="{prefix}index.html">Back to top</a></div>
</main>
</div>
</div>
</body>
</html>"#,
        )
    };

    let out_dir = output.unwrap_or(std::path::Path::new("dist"));
    std::fs::create_dir_all(out_dir).with_context(|| format!("creating {}", out_dir.display()))?;
    write_export_config_js(
        out_dir,
        &project_path,
        &state.context.project_name,
        homepage,
        version_label,
        versions_json,
    )?;

    // REQ-088: write CSS + JS to a shared `_assets/` directory once,
    // instead of inlining ~3MB of mermaid.min.js into every page. With
    // 5000+ artifacts the previous per-page embed produced ~13 GB of
    // mostly-identical bytes; this drops total export size by ~99%
    // (4000 pages * 3MB inline -> 4000 pages of ~50KB markup + one
    // 3MB shared asset).
    let assets_dir = out_dir.join("_assets");
    std::fs::create_dir_all(&assets_dir)
        .with_context(|| format!("creating {}", assets_dir.display()))?;
    std::fs::write(
        assets_dir.join("styles.css"),
        format!("{}{}", styles::FONTS_CSS, styles::CSS),
    )
    .with_context(|| format!("writing {}", assets_dir.join("styles.css").display()))?;
    std::fs::write(assets_dir.join("mermaid.min.js"), MERMAID_JS)
        .with_context(|| format!("writing {}", assets_dir.join("mermaid.min.js").display()))?;
    std::fs::write(assets_dir.join("svg-viewer.js"), SVG_VIEWER_JS)
        .with_context(|| format!("writing {}", assets_dir.join("svg-viewer.js").display()))?;

    let mut page_count = 0usize;

    // Helper: render a page, wrap it, and write it to a relative path within out_dir.
    // `rel_path` is like "index.html" or "artifacts/index.html".
    // `page` is the route string passed to render_page().
    let write_page =
        |rel_path: &str, page: &str, title: &str, out_dir: &std::path::Path| -> Result<()> {
            let result = render::render_page(&ctx, page, &params);
            // REQ-105: rewrite the rendered content's absolute serve-route
            // links + /docs-asset image srcs to working relative paths
            // before wrapping, so the static export is self-navigable.
            let depth = rel_path.matches('/').count();
            let prefix: String = "../".repeat(depth);
            let content =
                rewrite_static_links(&result.html, &prefix, &mut docs_assets.borrow_mut());
            let html = wrap_page(title, &content, rel_path);
            let dest = out_dir.join(rel_path);
            if let Some(parent) = dest.parent() {
                std::fs::create_dir_all(parent)
                    .with_context(|| format!("creating directory {}", parent.display()))?;
            }
            std::fs::write(&dest, &html).with_context(|| format!("writing {}", dest.display()))?;
            Ok(())
        };

    // ── Top-level pages ──────────────────────────────────────────────
    write_page("index.html", "/stats", "Overview", out_dir)?;
    page_count += 1;
    write_page("artifacts/index.html", "/artifacts", "Artifacts", out_dir)?;
    page_count += 1;
    write_page("validate/index.html", "/validate", "Validation", out_dir)?;
    page_count += 1;
    write_page("stpa/index.html", "/stpa", "STPA", out_dir)?;
    page_count += 1;
    write_page("eu-ai-act/index.html", "/eu-ai-act", "EU AI Act", out_dir)?;
    page_count += 1;
    write_page("documents/index.html", "/documents", "Documents", out_dir)?;
    page_count += 1;
    write_page("graph/index.html", "/graph", "Graph", out_dir)?;
    page_count += 1;
    write_page("matrix/index.html", "/matrix", "Matrix", out_dir)?;
    page_count += 1;
    write_page("coverage/index.html", "/coverage", "Coverage", out_dir)?;
    page_count += 1;
    write_page("help/index.html", "/help", "Help", out_dir)?;
    page_count += 1;
    // #956: the dashboard nav has 18 sections; the export carried 10. These
    // render to complete static pages. Left out on purpose: /diff (an
    // interactive revision picker), /variants (a "use rivet serve" stub when
    // rendered outside the server) and /source (it publishes the local project
    // path and links to per-file pages that are not exported).
    write_page(
        "traceability/index.html",
        "/traceability",
        "Traceability",
        out_dir,
    )?;
    page_count += 1;
    write_page(
        "verification/index.html",
        "/verification",
        "Verification",
        out_dir,
    )?;
    page_count += 1;
    write_page(
        "doc-linkage/index.html",
        "/doc-linkage",
        "Document Linkage",
        out_dir,
    )?;
    page_count += 1;
    write_page("results/index.html", "/results", "Test Results", out_dir)?;
    page_count += 1;
    if !state.externals.is_empty() {
        write_page("externals/index.html", "/externals", "Externals", out_dir)?;
        page_count += 1;
    }
    write_page(
        "help/schema/index.html",
        "/help/schema",
        "Schema Types",
        out_dir,
    )?;
    page_count += 1;
    write_page("help/links.html", "/help/links", "Link Types", out_dir)?;
    page_count += 1;
    write_page(
        "help/rules.html",
        "/help/rules",
        "Traceability Rules",
        out_dir,
    )?;
    page_count += 1;

    // ── Per-artifact detail pages ────────────────────────────────────
    //
    // REQ-087: apply the s-expression `--filter` if provided so the
    // per-artifact page set narrows to the requested subset. Previously
    // `cmd_export` accepted `--filter` but never threaded it into
    // `cmd_export_html`, so a filtered HTML export silently emitted
    // every artifact — the F2 silent-failure class (flag claims a
    // semantic the implementation does not deliver).
    let artifact_ids: Vec<String> = if let Some(filter_src) = sexpr_filter {
        let expr = rivet_core::sexpr_eval::parse_filter(filter_src).map_err(|errs| {
            let msgs: Vec<String> = errs.iter().map(|e| e.to_string()).collect();
            anyhow::anyhow!("invalid --filter expression: {}", msgs.join("; "))
        })?;
        state
            .store
            .iter()
            .filter(|a| {
                rivet_core::sexpr_eval::matches_filter_with_store(
                    &expr,
                    a,
                    &state.graph,
                    &state.store,
                )
            })
            .map(|a| a.id.clone())
            .collect()
    } else {
        state.store.iter().map(|a| a.id.clone()).collect()
    };
    for id in &artifact_ids {
        let rel = format!("artifacts/{id}.html");
        let page = format!("/artifacts/{id}");
        write_page(&rel, &page, id, out_dir)?;
        page_count += 1;
    }

    // ── Per-schema-type help pages ───────────────────────────────────
    let schema_type_names: Vec<String> = state.schema.artifact_types.keys().cloned().collect();
    for name in &schema_type_names {
        let rel = format!("help/schema/{name}.html");
        let page = format!("/help/schema/{name}");
        write_page(&rel, &page, name, out_dir)?;
        page_count += 1;
    }

    // ── Per-document detail pages ────────────────────────────────────
    let doc_ids: Vec<String> = state.doc_store.iter().map(|d| d.id.clone()).collect();
    for id in &doc_ids {
        let rel = format!("documents/{id}.html");
        let page = format!("/documents/{id}");
        write_page(&rel, &page, id, out_dir)?;
        page_count += 1;
    }

    // ── Copy referenced docs-asset images (REQ-105) ──────────────────
    // Documentation can reference relative images (`![](diagram.svg)`),
    // rendered with src="/docs-asset/<path>" and rewritten above to
    // "_assets/docs/<path>". Copy each referenced file from the doc
    // directories into the export so the <img> resolves offline. Missing
    // files warn loudly rather than silently producing a broken image.
    let wanted: Vec<String> = docs_assets.borrow().iter().cloned().collect();
    if !wanted.is_empty() {
        let docs_out = assets_dir.join("docs");
        std::fs::create_dir_all(&docs_out)
            .with_context(|| format!("creating {}", docs_out.display()))?;
        // Canonical export-assets root: every copy destination must stay
        // inside it (defence-in-depth against traversal from untrusted
        // cross-repo content, on top of is_safe_doc_asset_path).
        let docs_out_canon = docs_out.canonicalize().unwrap_or_else(|_| docs_out.clone());
        let mut copied = 0usize;
        for rel in &wanted {
            // Belt-and-braces: the rewriter already filtered, but re-check
            // before any filesystem op.
            if !is_safe_doc_asset_path(rel) {
                eprintln!("warning: skipping unsafe docs-asset path: {rel}");
                continue;
            }
            // Resolve src only to a file that genuinely lives inside one of
            // the doc directories (reject symlink escapes).
            let src = state.doc_dirs.iter().find_map(|d| {
                let cand = d.join(rel);
                if !cand.is_file() {
                    return None;
                }
                let d_canon = d.canonicalize().ok()?;
                let cand_canon = cand.canonicalize().ok()?;
                cand_canon.starts_with(&d_canon).then_some(cand_canon)
            });
            match src {
                Some(src) => {
                    let dest = docs_out.join(rel);
                    if let Some(parent) = dest.parent() {
                        std::fs::create_dir_all(parent)
                            .with_context(|| format!("creating {}", parent.display()))?;
                    }
                    // Verify the resolved destination is still inside docs_out.
                    let dest_ok = dest
                        .parent()
                        .and_then(|p| p.canonicalize().ok())
                        .is_some_and(|p| p.starts_with(&docs_out_canon));
                    if !dest_ok {
                        eprintln!("warning: skipping docs-asset escaping _assets/docs: {rel}");
                        continue;
                    }
                    std::fs::copy(&src, &dest)
                        .with_context(|| format!("copying docs-asset {}", src.display()))?;
                    copied += 1;
                }
                None => eprintln!(
                    "warning: doc references image '{rel}' not found in any docs directory — \
                     exported <img> will be broken"
                ),
            }
        }
        if copied > 0 {
            eprintln!("Copied {copied} docs-asset image(s) to _assets/docs/");
        }
    }

    eprintln!("Exported {page_count} pages to {}/", out_dir.display());
    Ok(true)
}

#[cfg(test)]
mod export_static_links_tests {
    use super::{rewrite_static_links, static_file_for_route};
    use std::collections::BTreeSet;

    #[test]
    fn route_to_static_file_map() {
        assert_eq!(static_file_for_route("/"), "index.html");
        assert_eq!(static_file_for_route("/stats"), "index.html");
        assert_eq!(static_file_for_route("/artifacts"), "artifacts/index.html");
        assert_eq!(
            static_file_for_route("/artifacts/REQ-1"),
            "artifacts/REQ-1.html"
        );
        // sub-routes the static export doesn't render fall back to the detail page
        assert_eq!(
            static_file_for_route("/artifacts/REQ-1/graph"),
            "artifacts/REQ-1.html"
        );
        assert_eq!(
            static_file_for_route("/documents/DOC-1"),
            "documents/DOC-1.html"
        );
        assert_eq!(static_file_for_route("/coverage"), "coverage/index.html");
        assert_eq!(static_file_for_route("/matrix"), "matrix/index.html");
        assert_eq!(static_file_for_route("/help"), "help/index.html");
        assert_eq!(
            static_file_for_route("/help/schema"),
            "help/schema/index.html"
        );
        assert_eq!(
            static_file_for_route("/help/schema/requirement"),
            "help/schema/requirement.html"
        );
        assert_eq!(static_file_for_route("/help/links"), "help/links.html");
        assert_eq!(static_file_for_route("/help/rules"), "help/rules.html");
        // query string ignored
        assert_eq!(
            static_file_for_route("/artifacts/REQ-1?x=1"),
            "artifacts/REQ-1.html"
        );
    }

    // rivet: partially-verifies REQ-105
    #[test]
    fn rewrites_absolute_links_with_depth_prefix() {
        let mut a = BTreeSet::new();
        // a depth-1 page (artifacts/REQ-1.html) → prefix "../"
        let html = r#"<a hx-get="/artifacts/REQ-2" href="/artifacts/REQ-2">REQ-2</a> <a href="/coverage">cov</a>"#;
        let out = rewrite_static_links(html, "../", &mut a);
        assert!(out.contains(r#"href="../artifacts/REQ-2.html""#), "{out}");
        assert!(out.contains(r#"hx-get="../artifacts/REQ-2.html""#), "{out}");
        assert!(out.contains(r#"href="../coverage/index.html""#), "{out}");
        // no absolute server routes remain
        assert!(!out.contains(r#"href="/artifacts"#), "{out}");
        assert!(!out.contains(r#"href="/coverage"#), "{out}");
    }

    #[test]
    fn leaves_external_and_anchor_links_untouched() {
        let mut a = BTreeSet::new();
        let html = r##"<a href="https://x.com/y">ext</a> <a href="//cdn/z">proto</a> <a href="#section">anchor</a> <a href="relative.html">rel</a>"##;
        let out = rewrite_static_links(html, "../", &mut a);
        assert!(out.contains(r#"href="https://x.com/y""#), "{out}");
        assert!(out.contains(r#"href="//cdn/z""#), "{out}");
        assert!(out.contains(r##"href="#section""##), "{out}");
        assert!(out.contains(r#"href="relative.html""#), "{out}");
        assert!(a.is_empty());
    }

    #[test]
    fn rewrites_docs_asset_images_and_records_them() {
        let mut a = BTreeSet::new();
        let html = r#"<img src="/docs-asset/diagrams/arch.svg" alt="arch">"#;
        let out = rewrite_static_links(html, "", &mut a);
        assert!(
            out.contains(r#"src="_assets/docs/diagrams/arch.svg""#),
            "{out}"
        );
        assert!(a.contains("diagrams/arch.svg"));
    }

    /// Untrusted cross-repo content must not traverse out of `_assets/docs/`.
    /// A crafted `/docs-asset/` path that is absolute or uses `..` is
    /// neither recorded for copy nor rewritten to the assets dir.
    #[test]
    fn docs_asset_traversal_is_rejected() {
        use super::is_safe_doc_asset_path;
        assert!(is_safe_doc_asset_path("img/a.png"));
        assert!(is_safe_doc_asset_path("a.svg"));
        assert!(!is_safe_doc_asset_path("../../../etc/passwd"));
        assert!(!is_safe_doc_asset_path("/etc/passwd"));
        assert!(!is_safe_doc_asset_path("a/../../b"));
        assert!(!is_safe_doc_asset_path(""));
        assert!(!is_safe_doc_asset_path("a\\..\\b"));

        let mut a = BTreeSet::new();
        let html =
            r#"<img src="/docs-asset/../../../etc/passwd"> <img src="/docs-asset//etc/shadow">"#;
        let out = rewrite_static_links(html, "../", &mut a);
        assert!(a.is_empty(), "unsafe paths must not be recorded: {a:?}");
        assert!(!out.contains("_assets/docs/.."), "{out}");
        assert!(!out.contains("_assets/docs//etc"), "{out}");
    }
}
