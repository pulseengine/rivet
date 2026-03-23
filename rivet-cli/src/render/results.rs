use rivet_core::document::html_escape;

use super::RenderContext;
use super::helpers::badge_for_type;

pub(crate) fn render_verification_view(ctx: &RenderContext) -> String {
    let store = ctx.store;
    let graph = ctx.graph;
    let schema = ctx.schema;

    let mut verifiable_types: Vec<(String, String)> = Vec::new();
    for rule in &schema.traceability_rules {
        if rule.required_backlink.as_deref() == Some("verifies") {
            verifiable_types.push((rule.source_type.clone(), rule.name.clone()));
        }
    }

    if verifiable_types.is_empty() {
        let mut seen = std::collections::HashSet::new();
        for artifact in store.iter() {
            let backlinks = graph.backlinks_to(&artifact.id);
            for bl in backlinks {
                if bl.link_type == "verifies" && seen.insert(artifact.artifact_type.clone()) {
                    verifiable_types.push((artifact.artifact_type.clone(), "verifies".to_string()));
                }
            }
        }
    }

    let mut html = String::from("<h2>Verification</h2>");

    if verifiable_types.is_empty() {
        html.push_str("<div class=\"card\"><p>No verification traceability rules found in the schema. \
            Add <code>required-backlink: verifies</code> rules to your schema to enable the verification dashboard.</p></div>");
        return html;
    }

    let mut total_reqs = 0usize;
    let mut verified_reqs = 0usize;

    for (source_type, _rule_name) in &verifiable_types {
        let source_ids = store.by_type(source_type);
        if source_ids.is_empty() {
            continue;
        }

        total_reqs += source_ids.len();

        struct ReqRow {
            id: String,
            title: String,
            status: String,
            verifiers: Vec<VerifierInfo>,
        }
        struct VerifierInfo {
            id: String,
            title: String,
            artifact_type: String,
            method: String,
            steps: Vec<StepInfo>,
            latest_result: Option<(String, rivet_core::results::TestStatus)>,
        }
        struct StepInfo {
            step: String,
            action: String,
            expected: String,
        }

        let mut rows: Vec<ReqRow> = Vec::new();

        for req_id in source_ids {
            let req = store.get(req_id).unwrap();
            let backlinks = graph.backlinks_to(req_id);
            let ver_links: Vec<_> = backlinks
                .iter()
                .filter(|bl| bl.link_type == "verifies")
                .collect();

            if !ver_links.is_empty() {
                verified_reqs += 1;
            }

            let mut verifiers = Vec::new();
            for bl in &ver_links {
                if let Some(ver_artifact) = store.get(&bl.source) {
                    let method = ver_artifact
                        .fields
                        .get("method")
                        .and_then(|v| v.as_str())
                        .unwrap_or("unspecified")
                        .to_string();

                    let steps = ver_artifact
                        .fields
                        .get("steps")
                        .and_then(|v| v.as_sequence())
                        .map(|seq| {
                            seq.iter()
                                .map(|s| {
                                    let step = s
                                        .get("step")
                                        .map(|v| {
                                            if let Some(n) = v.as_u64() {
                                                n.to_string()
                                            } else if let Some(s) = v.as_str() {
                                                s.to_string()
                                            } else {
                                                format!("{v:?}")
                                            }
                                        })
                                        .unwrap_or_default();
                                    let action = s
                                        .get("action")
                                        .and_then(|v| v.as_str())
                                        .unwrap_or("")
                                        .to_string();
                                    let expected = s
                                        .get("expected")
                                        .and_then(|v| v.as_str())
                                        .unwrap_or("")
                                        .to_string();
                                    StepInfo {
                                        step,
                                        action,
                                        expected,
                                    }
                                })
                                .collect()
                        })
                        .unwrap_or_default();

                    let latest_result = ctx
                        .result_store
                        .latest_for(&bl.source)
                        .map(|(_run, r)| (r.status.to_string(), r.status.clone()));

                    verifiers.push(VerifierInfo {
                        id: ver_artifact.id.clone(),
                        title: ver_artifact.title.clone(),
                        artifact_type: ver_artifact.artifact_type.clone(),
                        method,
                        steps,
                        latest_result,
                    });
                }
            }

            rows.push(ReqRow {
                id: req.id.clone(),
                title: req.title.clone(),
                status: req.status.as_deref().unwrap_or("-").to_string(),
                verifiers,
            });
        }

        rows.sort_by(|a, b| a.id.cmp(&b.id));

        let type_verified = rows.iter().filter(|r| !r.verifiers.is_empty()).count();
        let type_total = rows.len();
        let pct = if type_total > 0 {
            (type_verified as f64 / type_total as f64) * 100.0
        } else {
            100.0
        };

        html.push_str("<div class=\"ver-level\"><div class=\"card\">");
        html.push_str(&format!(
            "<div class=\"ver-level-header\">\
             {} <span class=\"ver-level-arrow\">&rarr;</span> \
             <span class=\"ver-level-title\">verified by</span> \
             <span class=\"badge badge-info\">{type_verified}/{type_total} ({pct:.0}%)</span></div>",
            badge_for_type(source_type),
        ));

        for row in &rows {
            let ver_count = row.verifiers.len();
            let has_verifiers = ver_count > 0;
            let coverage_badge = if has_verifiers {
                format!(
                    "<span class=\"badge badge-ok\">{ver_count} verifier{}</span>",
                    if ver_count > 1 { "s" } else { "" }
                )
            } else {
                "<span class=\"badge badge-error\">unverified</span>".to_string()
            };

            html.push_str("<details class=\"ver-row\"><summary>");
            html.push_str(&format!(
                "<span class=\"ver-chevron\"><svg width=\"12\" height=\"12\" viewBox=\"0 0 12 12\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.5\"><path d=\"M4.5 2.5l4 3.5-4 3.5\"/></svg></span>\
                 <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\" style=\"flex-shrink:0\">{id}</a>\
                 <span style=\"flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:var(--text-secondary)\">{title}</span>\
                 <span class=\"badge\" style=\"font-size:0.7rem;opacity:0.6\">{status}</span>\
                 {coverage_badge}",
                id = html_escape(&row.id),
                title = html_escape(&row.title),
                status = html_escape(&row.status),
            ));

            for v in &row.verifiers {
                if let Some((_, ref status)) = v.latest_result {
                    let dot_class = match status {
                        rivet_core::results::TestStatus::Pass => "result-dot-pass",
                        rivet_core::results::TestStatus::Fail => "result-dot-fail",
                        rivet_core::results::TestStatus::Skip => "result-dot-skip",
                        rivet_core::results::TestStatus::Error => "result-dot-error",
                        rivet_core::results::TestStatus::Blocked => "result-dot-blocked",
                    };
                    html.push_str(&format!(
                        "<span class=\"result-dot {dot_class}\" title=\"{}: {}\"></span>",
                        html_escape(&v.id),
                        status
                    ));
                }
            }

            html.push_str("</summary>");

            if has_verifiers {
                html.push_str("<div class=\"ver-detail\">");
                for v in &row.verifiers {
                    html.push_str(&format!(
                        "<p style=\"margin-bottom:.5rem\">\
                         <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a> \
                         {type_badge} \
                         <span class=\"method-badge\">{method}</span> \
                         &mdash; {title}",
                        id = html_escape(&v.id),
                        type_badge = badge_for_type(&v.artifact_type),
                        method = html_escape(&v.method),
                        title = html_escape(&v.title),
                    ));
                    if let Some((ref status_str, _)) = v.latest_result {
                        html.push_str(&format!(
                            " <span class=\"badge badge-{cls}\">{status_str}</span>",
                            cls = match status_str.as_str() {
                                "pass" => "ok",
                                "fail" | "error" => "error",
                                "skip" | "blocked" => "warn",
                                _ => "info",
                            },
                        ));
                    }
                    html.push_str("</p>");

                    if !v.steps.is_empty() {
                        html.push_str(
                            "<table class=\"ver-steps\"><thead><tr>\
                             <th style=\"width:3rem\">#</th><th>Action</th><th>Expected</th>\
                             </tr></thead><tbody>",
                        );
                        for s in &v.steps {
                            html.push_str(&format!(
                                "<tr><td>{}</td><td>{}</td><td>{}</td></tr>",
                                html_escape(&s.step),
                                html_escape(&s.action),
                                html_escape(&s.expected),
                            ));
                        }
                        html.push_str("</tbody></table>");
                    }
                }
                html.push_str("</div>");
            }

            html.push_str("</details>");
        }

        html.push_str("</div></div>");
    }

    let ver_pct = if total_reqs > 0 {
        (verified_reqs as f64 / total_reqs as f64) * 100.0
    } else {
        100.0
    };
    let summary = format!(
        "<div class=\"stat-grid\">\
         <div class=\"stat-box stat-blue\"><div class=\"number\">{total_reqs}</div><div class=\"label\">Requirements</div></div>\
         <div class=\"stat-box stat-green\"><div class=\"number\">{verified_reqs}</div><div class=\"label\">Verified</div></div>\
         <div class=\"stat-box stat-red\"><div class=\"number\">{}</div><div class=\"label\">Unverified</div></div>\
         <div class=\"stat-box stat-purple\"><div class=\"number\">{ver_pct:.0}%</div><div class=\"label\">Coverage</div></div>\
         </div>",
        total_reqs - verified_reqs,
    );

    html = format!(
        "<h2>Verification</h2>{summary}{}",
        &html["<h2>Verification</h2>".len()..]
    );

    html
}

pub(crate) fn render_results_view(ctx: &RenderContext) -> String {
    let result_store = ctx.result_store;

    let mut html = String::from("<h2>Test Results</h2>");

    if result_store.is_empty() {
        html.push_str("<div class=\"card\"><p>No test results loaded. Add result YAML files to a <code>results/</code> directory and reference it in <code>rivet.yaml</code>:</p>\
            <pre style=\"background:#f1f3f5;padding:1rem;border-radius:4px;font-size:.88rem;margin-top:.5rem\">results: results</pre>\
            <p style=\"margin-top:.75rem;color:var(--text-secondary);font-size:.88rem\">Each result file contains a <code>run:</code> metadata block and a <code>results:</code> list with per-artifact pass/fail/skip status.</p></div>");
        return html;
    }

    let summary = result_store.summary();

    html.push_str("<div class=\"stat-grid\">");
    html.push_str(&format!(
        "<div class=\"stat-box stat-blue\"><div class=\"number\">{}</div><div class=\"label\">Total Runs</div></div>",
        summary.total_runs
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-green\"><div class=\"number\">{:.0}%</div><div class=\"label\">Pass Rate</div></div>",
        summary.pass_rate()
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-green\"><div class=\"number\">{}</div><div class=\"label\">Passed</div></div>",
        summary.pass_count
    ));
    html.push_str(&format!(
        "<div class=\"stat-box stat-red\"><div class=\"number\">{}</div><div class=\"label\">Failed</div></div>",
        summary.fail_count
    ));
    if summary.skip_count > 0 {
        html.push_str(&format!(
            "<div class=\"stat-box stat-amber\"><div class=\"number\">{}</div><div class=\"label\">Skipped</div></div>",
            summary.skip_count
        ));
    }
    if summary.blocked_count > 0 {
        html.push_str(&format!(
            "<div class=\"stat-box stat-amber\"><div class=\"number\">{}</div><div class=\"label\">Blocked</div></div>",
            summary.blocked_count
        ));
    }
    html.push_str("</div>");

    html.push_str("<div class=\"card\"><h3>Run History</h3>");
    html.push_str(
        "<table><thead><tr><th>Run ID</th><th>Timestamp</th><th>Source</th><th>Environment</th>\
         <th>Pass</th><th>Fail</th><th>Skip</th><th>Total</th></tr></thead><tbody>",
    );

    for run in result_store.runs() {
        let pass = run.results.iter().filter(|r| r.status.is_pass()).count();
        let fail = run.results.iter().filter(|r| r.status.is_fail()).count();
        let skip = run.results.len() - pass - fail;
        let total = run.results.len();

        let status_badge = if fail > 0 {
            "<span class=\"badge badge-error\">FAIL</span>"
        } else {
            "<span class=\"badge badge-ok\">PASS</span>"
        };

        html.push_str(&format!(
            "<tr>\
             <td><a hx-get=\"/results/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/results/{id}\">{id}</a> {status_badge}</td>\
             <td>{ts}</td>\
             <td>{src}</td>\
             <td>{env}</td>\
             <td style=\"color:#15713a\">{pass}</td>\
             <td style=\"color:#c62828\">{fail}</td>\
             <td style=\"color:#6e6e73\">{skip}</td>\
             <td>{total}</td>\
             </tr>",
            id = html_escape(&run.run.id),
            ts = html_escape(&run.run.timestamp),
            src = html_escape(run.run.source.as_deref().unwrap_or("-")),
            env = html_escape(run.run.environment.as_deref().unwrap_or("-")),
        ));
    }

    html.push_str("</tbody></table></div>");

    html
}

pub(crate) fn render_result_detail(ctx: &RenderContext, run_id: &str) -> String {
    let result_store = ctx.result_store;

    let Some(run) = result_store.get_run(run_id) else {
        return format!(
            "<h2>Not Found</h2><p>Run <code>{}</code> does not exist.</p>",
            html_escape(run_id)
        );
    };

    let mut html = format!("<h2>Run: {}</h2>", html_escape(&run.run.id));

    html.push_str("<div class=\"card\"><dl>");
    html.push_str(&format!(
        "<dt>Timestamp</dt><dd>{}</dd>",
        html_escape(&run.run.timestamp)
    ));
    if let Some(ref source) = run.run.source {
        html.push_str(&format!("<dt>Source</dt><dd>{}</dd>", html_escape(source)));
    }
    if let Some(ref env) = run.run.environment {
        html.push_str(&format!(
            "<dt>Environment</dt><dd>{}</dd>",
            html_escape(env)
        ));
    }
    if let Some(ref commit) = run.run.commit {
        html.push_str(&format!(
            "<dt>Commit</dt><dd><code>{}</code></dd>",
            html_escape(commit)
        ));
    }
    html.push_str("</dl></div>");

    html.push_str("<div class=\"card\"><h3>Results</h3>");
    html.push_str(
        "<table><thead><tr><th>Artifact</th><th>Title</th><th>Status</th><th>Duration</th><th>Message</th></tr></thead><tbody>",
    );

    for result in &run.results {
        let title = ctx
            .store
            .get(&result.artifact)
            .map(|a| a.title.as_str())
            .unwrap_or("-");
        let (status_badge, status_class) = match result.status {
            rivet_core::results::TestStatus::Pass => {
                ("<span class=\"badge badge-ok\">PASS</span>", "")
            }
            rivet_core::results::TestStatus::Fail => (
                "<span class=\"badge badge-error\">FAIL</span>",
                "result-fail",
            ),
            rivet_core::results::TestStatus::Skip => {
                ("<span class=\"badge badge-info\">SKIP</span>", "")
            }
            rivet_core::results::TestStatus::Error => (
                "<span class=\"badge badge-error\">ERROR</span>",
                "result-error",
            ),
            rivet_core::results::TestStatus::Blocked => {
                ("<span class=\"badge badge-warn\">BLOCKED</span>", "")
            }
        };

        let duration = result.duration.as_deref().unwrap_or("-");
        let message = result.message.as_deref().unwrap_or("");

        html.push_str(&format!(
            "<tr class=\"{status_class}\">\
             <td><a hx-get=\"/artifacts/{aid}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{aid}\">{aid}</a></td>\
             <td>{title}</td>\
             <td>{status_badge}</td>\
             <td>{duration}</td>\
             <td>{msg}</td>\
             </tr>",
            aid = html_escape(&result.artifact),
            title = html_escape(title),
            msg = html_escape(message),
        ));
    }

    html.push_str("</tbody></table></div>");

    html.push_str(
        "<p><a hx-get=\"/results\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/results\" class=\"btn btn-secondary\">&larr; Back to results</a></p>",
    );

    html
}
