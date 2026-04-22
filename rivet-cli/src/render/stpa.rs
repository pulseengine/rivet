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
use rivet_core::store::Store;

use super::RenderContext;
use super::helpers::badge_for_type;
use crate::serve::components::{self, ViewParams};

pub(crate) fn render_stpa(ctx: &RenderContext, params: &ViewParams) -> String {
    let store = ctx.store;
    let graph = ctx.graph;

    let stpa_types = [
        ("loss", "Losses"),
        ("hazard", "Hazards"),
        ("sub-hazard", "Sub-Hazards"),
        ("system-constraint", "System Constraints"),
        ("controller", "Controllers"),
        ("controlled-process", "Controlled Processes"),
        ("control-action", "Control Actions"),
        ("uca", "UCAs"),
        ("controller-constraint", "Controller Constraints"),
        ("loss-scenario", "Loss Scenarios"),
    ];

    // ── Parse filter params ─────────────────────────────────────
    let type_filter: Option<Vec<String>> = params
        .types
        .as_ref()
        .filter(|s| !s.is_empty())
        .map(|s| s.split(',').map(|t| t.trim().to_lowercase()).collect());

    let q_filter: Option<String> = params
        .q
        .as_ref()
        .filter(|s| !s.trim().is_empty())
        .map(|s| s.trim().to_lowercase());

    let total: usize = stpa_types.iter().map(|(t, _)| store.count_by_type(t)).sum();
    let has_active_filter = type_filter.is_some() || q_filter.is_some();

    let mut html = String::from("<h2>STPA Analysis</h2>");

    // ── Filter bar ──────────────────────────────────────────────
    let q_val = params.q.as_deref().unwrap_or("");
    let types_val = params.types.as_deref().unwrap_or("");
    html.push_str("<div class=\"filter-bar card\">");
    html.push_str(
        "<div class=\"form-row\" style=\"margin-bottom:0;width:100%;align-items:center\">",
    );

    // Search input
    html.push_str(&components::search_input(
        "Search STPA artifacts...",
        q_val,
        "/stpa",
        &["types"],
    ));

    // Hidden input to hold comma-separated types — triggers reload on change
    html.push_str(&format!(
        "<input type=\"hidden\" name=\"types\" id=\"stpa-types-hidden\" value=\"{}\" \
         hx-get=\"/stpa\" hx-target=\"#content\" hx-push-url=\"true\" \
         hx-trigger=\"change\" hx-include=\"[name='q']\">",
        html_escape(types_val),
    ));

    html.push_str("</div>"); // form-row

    // Type checkbox row
    let selected_types = type_filter.clone().unwrap_or_default();
    let types_with_counts: Vec<(&str, &str, usize)> = stpa_types
        .iter()
        .map(|(t, l)| (*t, *l, store.count_by_type(t)))
        .collect();
    html.push_str(&components::type_checkboxes(
        &types_with_counts,
        &selected_types,
        "stpa-types-hidden",
        "stpaUpdateTypes",
        "stpa-type-cb",
    ));

    html.push_str("</div>"); // filter-bar

    if total == 0 {
        html.push_str(
            "<div class=\"card\">\
             <p>No STPA artifacts found in this project.</p>\
             <p style=\"color:var(--text-secondary);font-size:.9rem;margin-top:.5rem\">\
             Add artifacts of types <code>loss</code>, <code>hazard</code>, <code>uca</code>, etc. \
             using the <code>stpa</code> schema to enable the STPA analysis dashboard.</p>\
             </div>",
        );
        return html;
    }

    // Summary stat cards
    html.push_str("<div class=\"stat-grid\">");
    let stat_colors = [
        "#dc3545", "#fd7e14", "#fd7e14", "#20c997", "#6f42c1", "#6610f2", "#17a2b8", "#e83e8c",
        "#20c997", "#e83e8c",
    ];
    for (i, (type_name, label)) in stpa_types.iter().enumerate() {
        let count = store.count_by_type(type_name);
        if count == 0 {
            continue;
        }
        let color = stat_colors[i];
        html.push_str(&format!(
            "<div class=\"stat-box\" style=\"border-top-color:{color}\">\
             <div class=\"number\" style=\"color:{color}\">{count}</div>\
             <div class=\"label\">{label}</div></div>"
        ));
    }
    html.push_str("</div>");

    // Hierarchy tree view
    html.push_str("<div class=\"card\"><h3>STPA Hierarchy</h3><div class=\"stpa-tree\">");

    let losses = store.by_type("loss");
    if losses.is_empty() {
        html.push_str(
            "<p class=\"meta\">No losses defined. The STPA hierarchy starts with losses.</p>",
        );
    }

    let mut sorted_losses: Vec<&str> = losses.iter().map(|s| s.as_str()).collect();
    sorted_losses.sort();

    for loss_id in &sorted_losses {
        let Some(loss) = store.get(loss_id) else {
            continue;
        };
        if has_active_filter
            && (!type_visible(&type_filter, "loss") || !matches_text(store, loss_id, &q_filter))
        {
            continue;
        }
        html.push_str("<details class=\"stpa-details\" open><summary>");
        html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
        html.push_str(&badge_for_type("loss"));
        html.push_str(&format!(
            " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
             <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>",
            id = html_escape(loss_id),
            title = html_escape(&loss.title),
        ));
        html.push_str("</summary>");

        let hazard_backlinks = graph.backlinks_of_type(loss_id, "leads-to-loss");
        if !hazard_backlinks.is_empty() {
            html.push_str("<div class=\"stpa-level\">");
            let mut hazard_ids: Vec<&str> = hazard_backlinks
                .iter()
                .map(|bl| bl.source.as_str())
                .collect();
            hazard_ids.sort();
            hazard_ids.dedup();
            for hazard_id in &hazard_ids {
                let Some(hazard) = store.get(hazard_id) else {
                    continue;
                };
                if has_active_filter
                    && (!type_visible(&type_filter, &hazard.artifact_type)
                        || !matches_text(store, hazard_id, &q_filter))
                {
                    continue;
                }
                html.push_str("<details class=\"stpa-details\" open><summary>");
                html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
                html.push_str("<span class=\"stpa-link-label\">leads-to-loss</span>");
                html.push_str(&badge_for_type(&hazard.artifact_type));
                html.push_str(&format!(
                    " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                     <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>",
                    id = html_escape(hazard_id),
                    title = html_escape(&hazard.title),
                ));
                html.push_str("</summary>");

                let constraint_bls = graph.backlinks_of_type(hazard_id, "prevents");
                let uca_bls = graph.backlinks_of_type(hazard_id, "leads-to-hazard");

                if !constraint_bls.is_empty() || !uca_bls.is_empty() {
                    html.push_str("<div class=\"stpa-level\">");

                    // System Constraints
                    let mut sc_ids: Vec<&str> = constraint_bls
                        .iter()
                        .filter(|bl| {
                            store
                                .get(&bl.source)
                                .map(|a| a.artifact_type == "system-constraint")
                                .unwrap_or(false)
                        })
                        .map(|bl| bl.source.as_str())
                        .collect();
                    sc_ids.sort();
                    sc_ids.dedup();
                    for sc_id in &sc_ids {
                        let Some(sc) = store.get(sc_id) else { continue };
                        if has_active_filter
                            && (!type_visible(&type_filter, "system-constraint")
                                || !matches_text(store, sc_id, &q_filter))
                        {
                            continue;
                        }
                        html.push_str(&format!(
                            "<div class=\"stpa-node\">\
                             <span class=\"stpa-link-label\">prevents</span>{badge}\
                             <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                             <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                             </div>",
                            badge = badge_for_type("system-constraint"),
                            id = html_escape(sc_id),
                            title = html_escape(&sc.title),
                        ));
                    }

                    // UCAs
                    let mut uca_ids: Vec<&str> = uca_bls
                        .iter()
                        .filter(|bl| {
                            store
                                .get(&bl.source)
                                .map(|a| a.artifact_type == "uca")
                                .unwrap_or(false)
                        })
                        .map(|bl| bl.source.as_str())
                        .collect();
                    uca_ids.sort();
                    uca_ids.dedup();
                    for uca_id in &uca_ids {
                        let Some(uca) = store.get(uca_id) else {
                            continue;
                        };
                        if has_active_filter
                            && (!type_visible(&type_filter, "uca")
                                || !matches_text(store, uca_id, &q_filter))
                        {
                            continue;
                        }
                        // Collapse below level 2
                        html.push_str("<details class=\"stpa-details\"><summary>");
                        html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
                        html.push_str("<span class=\"stpa-link-label\">leads-to-hazard</span>");
                        html.push_str(&badge_for_type("uca"));
                        html.push_str(&format!(
                            " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                             <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>",
                            id = html_escape(uca_id),
                            title = html_escape(&uca.title),
                        ));
                        html.push_str("</summary>");

                        let cc_bls = graph.backlinks_of_type(uca_id, "inverts-uca");
                        let ls_bls = graph.backlinks_of_type(uca_id, "caused-by-uca");

                        if !cc_bls.is_empty() || !ls_bls.is_empty() {
                            html.push_str("<div class=\"stpa-level\">");
                            // Controller Constraints
                            let mut cc_ids: Vec<&str> =
                                cc_bls.iter().map(|bl| bl.source.as_str()).collect();
                            cc_ids.sort();
                            cc_ids.dedup();
                            for cc_id in &cc_ids {
                                let Some(cc) = store.get(cc_id) else { continue };
                                if has_active_filter
                                    && (!type_visible(&type_filter, "controller-constraint")
                                        || !matches_text(store, cc_id, &q_filter))
                                {
                                    continue;
                                }
                                html.push_str(&format!(
                                    "<div class=\"stpa-node\">\
                                     <span class=\"stpa-link-label\">inverts-uca</span>{badge}\
                                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                                     <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                                     </div>",
                                    badge = badge_for_type("controller-constraint"),
                                    id = html_escape(cc_id),
                                    title = html_escape(&cc.title),
                                ));
                            }
                            // Loss Scenarios
                            let mut ls_ids: Vec<&str> =
                                ls_bls.iter().map(|bl| bl.source.as_str()).collect();
                            ls_ids.sort();
                            ls_ids.dedup();
                            for ls_id in &ls_ids {
                                let Some(ls) = store.get(ls_id) else { continue };
                                if has_active_filter
                                    && (!type_visible(&type_filter, "loss-scenario")
                                        || !matches_text(store, ls_id, &q_filter))
                                {
                                    continue;
                                }
                                html.push_str(&format!(
                                    "<div class=\"stpa-node\">\
                                     <span class=\"stpa-link-label\">caused-by-uca</span>{badge}\
                                     <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                                     <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                                     </div>",
                                    badge = badge_for_type("loss-scenario"),
                                    id = html_escape(ls_id),
                                    title = html_escape(&ls.title),
                                ));
                            }
                            html.push_str("</div>"); // stpa-level (CC/LS)
                        }
                        html.push_str("</details>"); // UCA
                    }
                    html.push_str("</div>"); // stpa-level (SC/UCA)
                }
                html.push_str("</details>"); // Hazard
            }
            html.push_str("</div>"); // stpa-level (Hazards)
        }
        html.push_str("</details>"); // Loss
    }

    html.push_str("</div></div>"); // stpa-tree, card

    // UCA Table
    let uca_ids = store.by_type("uca");
    let show_uca_table = !uca_ids.is_empty() && type_visible(&type_filter, "uca");
    if show_uca_table {
        html.push_str("<div class=\"card\"><h3>Unsafe Control Actions</h3>");

        struct UcaRow {
            id: String,
            title: String,
            uca_type: String,
            control_action: String,
            linked_hazards: Vec<String>,
        }

        let mut rows: Vec<UcaRow> = Vec::new();
        for uca_id in uca_ids {
            let Some(uca) = store.get(uca_id) else {
                continue;
            };
            if has_active_filter && !matches_text(store, uca_id, &q_filter) {
                continue;
            }
            let uca_type = uca
                .fields
                .get("uca-type")
                .and_then(|v| v.as_str())
                .unwrap_or("-")
                .to_string();
            let controller_links: Vec<&str> = uca
                .links
                .iter()
                .filter(|l| l.link_type == "issued-by")
                .map(|l| l.target.as_str())
                .collect();
            let control_action = if let Some(ctrl_id) = controller_links.first() {
                let ca_bls = graph.backlinks_of_type(ctrl_id, "issued-by");
                ca_bls
                    .iter()
                    .filter(|bl| {
                        store
                            .get(&bl.source)
                            .map(|a| a.artifact_type == "control-action")
                            .unwrap_or(false)
                    })
                    .map(|bl| bl.source.clone())
                    .next()
                    .unwrap_or_else(|| ctrl_id.to_string())
            } else {
                "-".to_string()
            };
            let hazards: Vec<String> = uca
                .links
                .iter()
                .filter(|l| l.link_type == "leads-to-hazard")
                .map(|l| l.target.clone())
                .collect();
            rows.push(UcaRow {
                id: uca_id.clone(),
                title: uca.title.clone(),
                uca_type,
                control_action,
                linked_hazards: hazards,
            });
        }

        rows.sort_by(|a, b| {
            a.control_action
                .cmp(&b.control_action)
                .then(a.id.cmp(&b.id))
        });

        html.push_str(
            "<table class=\"stpa-uca-table\"><caption class=\"sr-only\">Unsafe Control Actions</caption><thead><tr>\
             <th>ID</th><th>Control Action</th><th>UCA Type</th>\
             <th>Description</th><th>Linked Hazards</th>\
             </tr></thead><tbody>",
        );

        for row in &rows {
            let type_class = match row.uca_type.as_str() {
                "not-providing" => "uca-type-not-providing",
                "providing" => "uca-type-providing",
                "too-early-too-late" => "uca-type-too-early-too-late",
                "stopped-too-soon" => "uca-type-stopped-too-soon",
                _ => "",
            };
            let type_badge = if type_class.is_empty() {
                html_escape(&row.uca_type)
            } else {
                format!(
                    "<span class=\"uca-type-badge {type_class}\">{}</span>",
                    html_escape(&row.uca_type),
                )
            };
            let hazard_links: Vec<String> = row
                .linked_hazards
                .iter()
                .map(|h| {
                    format!(
                        "<a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\" \
                     style=\"font-family:var(--mono);font-size:.8rem\">{id}</a>",
                        id = html_escape(h),
                    )
                })
                .collect();
            let ca_display = if row.control_action == "-" {
                "-".to_string()
            } else {
                format!(
                    "<a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\" \
                     style=\"font-family:var(--mono);font-size:.8rem\">{id}</a>",
                    id = html_escape(&row.control_action),
                )
            };
            html.push_str(&format!(
                "<tr>\
                 <td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a></td>\
                 <td>{ca}</td>\
                 <td>{type_badge}</td>\
                 <td>{title}</td>\
                 <td>{hazards}</td></tr>",
                id = html_escape(&row.id),
                ca = ca_display,
                title = html_escape(&row.title),
                hazards = hazard_links.join(", "),
            ));
        }

        html.push_str("</tbody></table></div>");
    }

    html.push_str(&format!(
        "<p class=\"meta\">{total} STPA artifacts total</p>"
    ));

    // ── STPA-Sec section ────────────────────────────────────────────────
    let sec_types = [
        ("sec-loss", "Security Losses"),
        ("sec-hazard", "Security Hazards"),
        ("sec-constraint", "Security Constraints"),
        ("sec-uca", "Security UCAs"),
        ("sec-scenario", "Security Scenarios"),
    ];
    let sec_total: usize = sec_types.iter().map(|(t, _)| store.count_by_type(t)).sum();

    if sec_total > 0 {
        html.push_str(
            "<hr style=\"margin:2rem 0;border:none;border-top:2px solid #fee2e2\">\
             <h2 style=\"color:#991b1b\">STPA-Sec — Security Analysis</h2>\
             <p style=\"color:var(--text-secondary);font-size:.9rem;margin-bottom:1rem\">\
             STPA extended with adversarial threat modelling. Each security hazard includes \
             CIA-triad impact; each security UCA includes an adversarial-causation field \
             explaining how an attacker could introduce the unsafe condition.\
             </p>",
        );

        // Stat cards
        html.push_str("<div class=\"stat-grid\">");
        let sec_colors = ["#ef4444", "#dc2626", "#b91c1c", "#991b1b", "#7f1d1d"];
        for (i, (type_name, label)) in sec_types.iter().enumerate() {
            let count = store.count_by_type(type_name);
            if count == 0 {
                continue;
            }
            let color = sec_colors[i];
            html.push_str(&format!(
                "<div class=\"stat-box\" style=\"border-top-color:{color}\">\
                 <div class=\"number\" style=\"color:{color}\">{count}</div>\
                 <div class=\"label\">{label}</div></div>"
            ));
        }
        html.push_str("</div>");

        // Sec hierarchy: sec-loss → sec-hazard → sec-constraint + sec-uca → sec-scenario
        html.push_str("<div class=\"card\"><h3>Security Hierarchy</h3><div class=\"stpa-tree\">");

        let sec_losses = store.by_type("sec-loss");
        let mut sorted_sec_losses: Vec<&str> = sec_losses.iter().map(|s| s.as_str()).collect();
        sorted_sec_losses.sort();

        if sorted_sec_losses.is_empty() {
            html.push_str("<p class=\"meta\">No security losses defined.</p>");
        }

        for sl_id in &sorted_sec_losses {
            let Some(sl) = store.get(sl_id) else {
                continue;
            };
            if has_active_filter
                && (!type_visible(&type_filter, "sec-loss")
                    || !matches_text(store, sl_id, &q_filter))
            {
                continue;
            }
            let cia = sl
                .fields
                .get("cia-impact")
                .and_then(|v| v.as_sequence())
                .map(|seq| {
                    seq.iter()
                        .filter_map(|v| v.as_str())
                        .collect::<Vec<_>>()
                        .join(", ")
                })
                .unwrap_or_default();
            let cia_badge = if !cia.is_empty() {
                format!(
                    "<span style=\"font-size:.7rem;background:#fee2e2;color:#991b1b;\
                     padding:.1rem .35rem;border-radius:4px;margin-left:.4rem\">{cia}</span>"
                )
            } else {
                String::new()
            };

            html.push_str("<details class=\"stpa-details\" open><summary>");
            html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
            html.push_str(&badge_for_type("sec-loss"));
            html.push_str(&format!(
                " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                 <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>{cia_badge}",
                id = html_escape(sl_id),
                title = html_escape(&sl.title),
            ));
            html.push_str("</summary>");

            let sh_backlinks = graph.backlinks_of_type(sl_id, "leads-to-sec-loss");
            if !sh_backlinks.is_empty() {
                html.push_str("<div class=\"stpa-level\">");
                let mut sh_ids: Vec<&str> =
                    sh_backlinks.iter().map(|bl| bl.source.as_str()).collect();
                sh_ids.sort();
                sh_ids.dedup();

                for sh_id in &sh_ids {
                    let Some(sh) = store.get(sh_id) else {
                        continue;
                    };
                    if has_active_filter
                        && (!type_visible(&type_filter, "sec-hazard")
                            || !matches_text(store, sh_id, &q_filter))
                    {
                        continue;
                    }
                    let sh_cia = sh
                        .fields
                        .get("cia-impact")
                        .and_then(|v| v.as_sequence())
                        .map(|seq| {
                            seq.iter()
                                .filter_map(|v| v.as_str())
                                .collect::<Vec<_>>()
                                .join(", ")
                        })
                        .unwrap_or_default();
                    let sh_cia_badge = if !sh_cia.is_empty() {
                        format!(
                            "<span style=\"font-size:.7rem;background:#fee2e2;color:#991b1b;\
                             padding:.1rem .35rem;border-radius:4px;margin-left:.4rem\">{sh_cia}</span>"
                        )
                    } else {
                        String::new()
                    };

                    html.push_str("<details class=\"stpa-details\" open><summary>");
                    html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
                    html.push_str("<span class=\"stpa-link-label\">leads-to-sec-loss</span>");
                    html.push_str(&badge_for_type("sec-hazard"));
                    html.push_str(&format!(
                        " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                         <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>{sh_cia_badge}",
                        id = html_escape(sh_id),
                        title = html_escape(&sh.title),
                    ));
                    html.push_str("</summary>");

                    let ssc_bls = graph.backlinks_of_type(sh_id, "prevents-sec-hazard");
                    let suca_bls = graph.backlinks_of_type(sh_id, "leads-to-sec-hazard");

                    if !ssc_bls.is_empty() || !suca_bls.is_empty() {
                        html.push_str("<div class=\"stpa-level\">");

                        // Security Constraints
                        let mut ssc_ids: Vec<&str> =
                            ssc_bls.iter().map(|bl| bl.source.as_str()).collect();
                        ssc_ids.sort();
                        ssc_ids.dedup();
                        for ssc_id in &ssc_ids {
                            let Some(ssc) = store.get(ssc_id) else {
                                continue;
                            };
                            if has_active_filter
                                && (!type_visible(&type_filter, "sec-constraint")
                                    || !matches_text(store, ssc_id, &q_filter))
                            {
                                continue;
                            }
                            html.push_str(&format!(
                                "<div class=\"stpa-node\">\
                                 <span class=\"stpa-link-label\">prevents</span>{badge}\
                                 <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                                 <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                                 </div>",
                                badge = badge_for_type("sec-constraint"),
                                id = html_escape(ssc_id),
                                title = html_escape(&ssc.title),
                            ));
                        }

                        // Security UCAs
                        let mut suca_ids: Vec<&str> = suca_bls
                            .iter()
                            .filter(|bl| {
                                store
                                    .get(&bl.source)
                                    .map(|a| a.artifact_type == "sec-uca")
                                    .unwrap_or(false)
                            })
                            .map(|bl| bl.source.as_str())
                            .collect();
                        suca_ids.sort();
                        suca_ids.dedup();
                        for suca_id in &suca_ids {
                            let Some(suca) = store.get(suca_id) else {
                                continue;
                            };
                            if has_active_filter
                                && (!type_visible(&type_filter, "sec-uca")
                                    || !matches_text(store, suca_id, &q_filter))
                            {
                                continue;
                            }
                            html.push_str("<details class=\"stpa-details\"><summary>");
                            html.push_str("<span class=\"stpa-chevron\">&#9654;</span> ");
                            html.push_str(
                                "<span class=\"stpa-link-label\">leads-to-sec-hazard</span>",
                            );
                            html.push_str(&badge_for_type("sec-uca"));
                            html.push_str(&format!(
                                " <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                                 <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>",
                                id = html_escape(suca_id),
                                title = html_escape(&suca.title),
                            ));
                            html.push_str("</summary>");

                            let sls_bls = graph.backlinks_of_type(suca_id, "caused-by-sec-uca");
                            if !sls_bls.is_empty() {
                                html.push_str("<div class=\"stpa-level\">");
                                let mut sls_ids: Vec<&str> =
                                    sls_bls.iter().map(|bl| bl.source.as_str()).collect();
                                sls_ids.sort();
                                sls_ids.dedup();
                                for sls_id in &sls_ids {
                                    let Some(sls) = store.get(sls_id) else {
                                        continue;
                                    };
                                    if has_active_filter
                                        && (!type_visible(&type_filter, "sec-scenario")
                                            || !matches_text(store, sls_id, &q_filter))
                                    {
                                        continue;
                                    }
                                    let av = sls
                                        .fields
                                        .get("attack-vector")
                                        .and_then(|v| v.as_str())
                                        .unwrap_or("-");
                                    html.push_str(&format!(
                                        "<div class=\"stpa-node\">\
                                         <span class=\"stpa-link-label\">caused-by-sec-uca</span>{badge}\
                                         <a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a>\
                                         <span style=\"color:var(--text-secondary);font-size:.85rem\"> {title}</span>\
                                         <span style=\"font-size:.7rem;background:#fef3c7;color:#92400e;\
                                         padding:.1rem .35rem;border-radius:4px;margin-left:.4rem\">{av}</span>\
                                         </div>",
                                        badge = badge_for_type("sec-scenario"),
                                        id = html_escape(sls_id),
                                        title = html_escape(&sls.title),
                                    ));
                                }
                                html.push_str("</div>");
                            }
                            html.push_str("</details>"); // sec-uca
                        }

                        html.push_str("</div>"); // stpa-level (SSC/SUCA)
                    }
                    html.push_str("</details>"); // sec-hazard
                }
                html.push_str("</div>"); // stpa-level (sec-hazards)
            }
            html.push_str("</details>"); // sec-loss
        }

        html.push_str("</div></div>"); // stpa-tree, card

        // Security UCA table
        let suca_ids = store.by_type("sec-uca");
        let show_sec_uca_table = !suca_ids.is_empty() && type_visible(&type_filter, "sec-uca");
        if show_sec_uca_table {
            html.push_str(
                "<div class=\"card\"><h3>Security Unsafe Control Actions</h3>\
                 <table class=\"stpa-uca-table\"><caption class=\"sr-only\">Security Unsafe Control Actions</caption><thead><tr>\
                 <th>ID</th><th>Controller</th><th>UCA Type</th>\
                 <th>Attacker</th><th>Description</th><th>Hazards</th>\
                 </tr></thead><tbody>",
            );

            let mut suca_list: Vec<(String, String, String, String, String, Vec<String>)> =
                Vec::new();
            for suca_id in suca_ids {
                let Some(suca) = store.get(suca_id) else {
                    continue;
                };
                if has_active_filter && !matches_text(store, suca_id, &q_filter) {
                    continue;
                }
                let uca_type = suca
                    .fields
                    .get("uca-type")
                    .and_then(|v| v.as_str())
                    .unwrap_or("-")
                    .to_string();
                let attacker = suca
                    .fields
                    .get("attacker-type")
                    .and_then(|v| v.as_str())
                    .unwrap_or("-")
                    .to_string();
                let controller = suca
                    .links
                    .iter()
                    .find(|l| l.link_type == "issued-by")
                    .map(|l| l.target.clone())
                    .unwrap_or_else(|| "-".to_string());
                let hazards: Vec<String> = suca
                    .links
                    .iter()
                    .filter(|l| l.link_type == "leads-to-sec-hazard")
                    .map(|l| l.target.clone())
                    .collect();
                suca_list.push((
                    suca_id.clone(),
                    suca.title.clone(),
                    uca_type,
                    attacker,
                    controller,
                    hazards,
                ));
            }
            suca_list.sort_by(|a, b| a.4.cmp(&b.4).then(a.0.as_str().cmp(b.0.as_str())));

            for (id, title, uca_type, attacker, controller, hazards) in &suca_list {
                let type_class = match uca_type.as_str() {
                    "not-providing" => "uca-type-not-providing",
                    "providing" => "uca-type-providing",
                    "too-early-too-late" => "uca-type-too-early-too-late",
                    "stopped-too-soon" => "uca-type-stopped-too-soon",
                    _ => "",
                };
                let type_badge = if type_class.is_empty() {
                    html_escape(uca_type)
                } else {
                    format!(
                        "<span class=\"uca-type-badge {type_class}\">{}</span>",
                        html_escape(uca_type),
                    )
                };
                let attacker_color = match attacker.as_str() {
                    "external-network" => "#dc2626",
                    "insider" => "#b45309",
                    "supply-chain" => "#7c3aed",
                    "physical" => "#1d4ed8",
                    _ => "var(--text-secondary)",
                };
                let attacker_badge = format!(
                    "<span style=\"font-size:.75rem;color:{attacker_color}\">{}</span>",
                    html_escape(attacker),
                );
                let hazard_links: String = hazards
                    .iter()
                    .map(|h| {
                        format!(
                            "<a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\" \
                             style=\"font-family:var(--mono);font-size:.8rem\">{id}</a>",
                            id = html_escape(h),
                        )
                    })
                    .collect::<Vec<_>>()
                    .join(", ");
                let ctrl_display = if controller == "-" {
                    "-".to_string()
                } else {
                    format!(
                        "<a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\" \
                         style=\"font-family:var(--mono);font-size:.8rem\">{id}</a>",
                        id = html_escape(controller),
                    )
                };
                html.push_str(&format!(
                    "<tr>\
                     <td><a hx-get=\"/artifacts/{id}\" hx-target=\"#content\" hx-push-url=\"true\" href=\"/artifacts/{id}\">{id}</a></td>\
                     <td>{ctrl_display}</td>\
                     <td>{type_badge}</td>\
                     <td>{attacker_badge}</td>\
                     <td>{title}</td>\
                     <td>{hazard_links}</td></tr>",
                    id = html_escape(id),
                    title = html_escape(title),
                ));
            }
            html.push_str("</tbody></table></div>");
        }

        html.push_str(&format!(
            "<p class=\"meta\">{sec_total} STPA-Sec artifacts total</p>"
        ));
    }

    html
}

// ── Private helpers ───────────────────────────────────────────────────────

/// Check if an artifact matches the text query.
fn matches_text(store: &Store, id: &str, q: &Option<String>) -> bool {
    let Some(q) = q else { return true };
    if id.to_lowercase().contains(q) {
        return true;
    }
    if let Some(a) = store.get(id) {
        if a.title.to_lowercase().contains(q) {
            return true;
        }
        if let Some(ref desc) = a.description {
            if desc.to_lowercase().contains(q) {
                return true;
            }
        }
    }
    false
}

/// Check if an artifact type is in the filter set.
fn type_visible(tf: &Option<Vec<String>>, art_type: &str) -> bool {
    match tf {
        Some(types) => types.contains(&art_type.to_lowercase()),
        None => true,
    }
}
