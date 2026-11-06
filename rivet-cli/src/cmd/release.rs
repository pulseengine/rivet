//! `rivet release` — release notes, list, status, move and check.

use anyhow::{Context, Result};
use rivet_core::links::LinkGraph;
use rivet_core::model::ProjectConfig;

use crate::{
    Cli, ProjectContext, cmd_modify, default_marker_scan_paths, load_feature_model_via_project,
    load_result_store, marker_verified_ids, resolve_variant_arg, validate_format,
};

/// REQ-234 / #516: re-target an artifact to a different release — a logged scope
/// decision. The artifact edit (via the shared safe modify write-path) is the
/// durable record; this surfaces the old → new transition.
pub(crate) fn cmd_release_move(cli: &Cli, id: &str, version: &str) -> Result<bool> {
    // Capture the current release for the scope-change log. Scope the borrow so
    // `cmd_modify` can reload the project below.
    let old = {
        let ctx = ProjectContext::load(cli)?;
        ctx.store
            .get(id)
            .ok_or_else(|| anyhow::anyhow!("artifact '{id}' not found"))?
            .release
            .clone()
    };
    if old.as_deref() == Some(version) {
        println!("{id} is already scoped to {version} — nothing to do.");
        return Ok(true);
    }
    let ok = cmd_modify(
        cli,
        Some(id),
        None,
        false,
        None,
        Some(version),
        None,
        None,
        &[],
        &[],
        &[],
    )?;
    if ok {
        let from = old.as_deref().unwrap_or("(unassigned)");
        println!("scope change: {id} moved {from} \u{2192} {version}");
    }
    Ok(ok)
}

/// Shared release-readiness predicate (REQ-233 / #612 / #628), extracted from
/// `cmd_release_status` so that command and `cmd_release_check` (REQ-254 /
/// #673) compute "is this artifact release-ready" identically instead of
/// drifting a copy-pasted closure.
///
/// Release-ready statuses: the built-in `verified`/`accepted`, plus any the
/// project declares via `release.ready-when` (#612). `release.require` then
/// picks one of three modes:
///
/// - `status` (default): the status alone decides.
/// - `coverage`: ALSO count an artifact whose V is closed (every traceability
///   rule that applies to its type is satisfied) regardless of its status —
///   so V-model / ASPICE projects that verify via links can green the gate.
///   Purely additive.
/// - `evidence` (REQ-384): the status must be ready AND no `error`-severity
///   traceability rule for the artifact's type may be missing. `warning` and
///   `info` rules stay advisory. The only mode that makes a release *harder*
///   to cut: "accepted" stops being enough on its own.
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ReadinessMode {
    Status,
    Coverage,
    Evidence,
    /// `evidence`, plus a PASSING recorded result for the artifact or
    /// something tracing to it (#1129). The strictest rung.
    Results,
}

impl ReadinessMode {
    const KNOWN: &'static str = "status, coverage, evidence, results";

    /// An unknown value is an error, not a silent fall-back to `status`: a
    /// typo such as `coverag` used to be accepted and ignored, so the project
    /// believed it gated on something it did not (REQ-384).
    fn parse(v: Option<&str>) -> Result<Self> {
        match v {
            None | Some("status") => Ok(Self::Status),
            Some("coverage") => Ok(Self::Coverage),
            Some("evidence") => Ok(Self::Evidence),
            Some("results") => Ok(Self::Results),
            Some(other) => anyhow::bail!(
                "rivet.yaml: release.require: unknown value '{other}' (expected one of: {})",
                Self::KNOWN
            ),
        }
    }

    /// How "cuttable" is phrased in the text output for this mode.
    fn ready_phrase(self) -> &'static str {
        match self {
            Self::Status => "release-ready",
            Self::Coverage => "release-ready (verified/accepted, ready-when, or V-closed)",
            Self::Evidence => {
                "release-ready (ready status and every error-severity traceability rule satisfied)"
            }
            Self::Results => {
                "release-ready (ready status, every error-severity traceability rule satisfied, \
                 and a passing recorded result)"
            }
        }
    }
}

struct ReadinessCtx {
    extra_ready: std::collections::BTreeSet<String>,
    mode: ReadinessMode,
    // In coverage mode, `covered_types` are the artifact types governed by at
    // least one traceability rule, and `uncovered_ids` are the artifacts
    // strictly missing on some applicable rule. An artifact is V-closed when
    // its type is governed AND it is not in `uncovered_ids`.
    covered_types: std::collections::BTreeSet<String>,
    uncovered_ids: std::collections::BTreeSet<String>,
    // Every governed artifact's per-rule outcome (REQ-383). Computed in every
    // mode: evidence mode gates on it and the release note reports it.
    outcomes: std::collections::BTreeMap<String, Vec<rivet_core::coverage::RuleOutcome>>,
    markers: Vec<rivet_core::test_scanner::TestMarker>,
    /// Recorded-result evidence per artifact id; filled only under
    /// `require: results` (#1129).
    evidence: std::collections::BTreeMap<String, rivet_core::result_trace::EvidenceState>,
}

impl ReadinessCtx {
    fn compute(cli: &Cli, ctx: &ProjectContext) -> Result<Self> {
        let rel = ctx.config.release.as_ref();
        let extra_ready: std::collections::BTreeSet<String> = rel
            .map(|r| r.ready_when.iter().cloned().collect())
            .unwrap_or_default();
        let mode = ReadinessMode::parse(rel.and_then(|r| r.require.as_deref()))?;
        // REQ-389: coverage credits the same source markers the outcomes below
        // treat as `verifies` evidence.
        let marker_graph = ctx
            .graph
            .clone()
            .with_marker_evidence(marker_verified_ids(&cli.project));
        let mut cov =
            rivet_core::coverage::compute_coverage(&ctx.store, &ctx.schema, &marker_graph);
        // A rule the project declares it does not model must not block a
        // release in evidence mode — the same REQ-320 declaration `rivet
        // coverage` honours. A stale declaration is `rivet coverage`'s error
        // to report, so its problems are not repeated here.
        if let Some(cov_cfg) = ctx.config.coverage.as_ref() {
            let _ = rivet_core::coverage::mark_unmodelled(&mut cov, &cov_cfg.unmodelled_rules);
        }
        // Source markers are `verifies` evidence by another route (REQ-329);
        // without them a marker-verified requirement would read as missing
        // its verification rule.
        let markers = rivet_core::test_scanner::scan_source_files_in_project(
            &cli.project,
            &default_marker_scan_paths(&cli.project),
            &rivet_core::test_scanner::default_patterns(),
        );
        let marker_verified: std::collections::BTreeSet<String> = markers
            .iter()
            .filter(|m| m.link_type == "verifies")
            .map(|m| m.target_id.clone())
            .collect();
        let outcomes =
            rivet_core::coverage::rule_outcomes(&ctx.store, &ctx.schema, &cov, &marker_verified);
        let (covered_types, uncovered_ids) = if mode == ReadinessMode::Coverage {
            (
                cov.entries.iter().map(|e| e.source_type.clone()).collect(),
                cov.entries
                    .iter()
                    .flat_map(|e| e.uncovered_ids.iter().cloned())
                    .collect(),
            )
        } else {
            (Default::default(), Default::default())
        };
        // #1129: under `require: results` an artifact also needs a passing
        // recorded result. Refuse when there is nowhere to read results from,
        // rather than report every artifact as having none.
        let evidence = if mode == ReadinessMode::Results {
            let Some(results) = load_result_store(cli, &ctx.config)? else {
                anyhow::bail!(
                    "rivet.yaml: release.require: results needs a `results:` directory to read \
                     recorded test runs from (e.g. `results: results`). See `rivet docs \
                     recorded-results`."
                );
            };
            ctx.store
                .iter()
                .map(|a| {
                    let ev = rivet_core::result_trace::evidence_for(
                        &a.id,
                        &ctx.graph,
                        &results,
                        rivet_core::result_trace::EVIDENCE_DEPTH,
                    );
                    (a.id.clone(), ev.state)
                })
                .collect()
        } else {
            Default::default()
        };
        Ok(Self {
            extra_ready,
            mode,
            covered_types,
            uncovered_ids,
            outcomes,
            markers,
            evidence,
        })
    }

    fn status_ready(&self, a: &rivet_core::model::Artifact) -> bool {
        let s = a.status.as_deref();
        matches!(s, Some("verified") | Some("accepted"))
            || s.is_some_and(|x| self.extra_ready.contains(x))
    }

    /// The `error`-severity rules this artifact is missing — what blocks it in
    /// evidence mode. Empty for ungoverned types.
    fn missing_error_rules(&self, a: &rivet_core::model::Artifact) -> Vec<&str> {
        self.outcomes
            .get(&a.id)
            .map(|v| {
                v.iter()
                    .filter(|o| rivet_core::coverage::fails_an_error_rule(std::slice::from_ref(*o)))
                    .map(|o| o.rule.as_str())
                    .collect()
            })
            .unwrap_or_default()
    }

    fn is_ready(&self, a: &rivet_core::model::Artifact) -> bool {
        match self.mode {
            ReadinessMode::Status => self.status_ready(a),
            ReadinessMode::Coverage => {
                self.status_ready(a)
                    || (self.covered_types.contains(&a.artifact_type)
                        && !self.uncovered_ids.contains(&a.id))
            }
            ReadinessMode::Evidence => self.evidence_ready(a),
            ReadinessMode::Results => {
                self.evidence_ready(a)
                    && self.result_state(a)
                        == Some(rivet_core::result_trace::EvidenceState::Passing)
            }
        }
    }

    /// Ready status and no missing `error`-severity traceability rule.
    fn evidence_ready(&self, a: &rivet_core::model::Artifact) -> bool {
        self.status_ready(a)
            && !self
                .outcomes
                .get(&a.id)
                .is_some_and(|v| rivet_core::coverage::fails_an_error_rule(v))
    }

    /// The recorded-result state, under `require: results` only.
    fn result_state(
        &self,
        a: &rivet_core::model::Artifact,
    ) -> Option<rivet_core::result_trace::EvidenceState> {
        if self.mode != ReadinessMode::Results {
            return None;
        }
        Some(
            self.evidence
                .get(&a.id)
                .copied()
                .unwrap_or(rivet_core::result_trace::EvidenceState::NoResults),
        )
    }

    /// Why recorded results withhold `a`, for the not-ready listing; `None`
    /// outside `require: results` or when a passing result exists.
    fn result_withholds(&self, a: &rivet_core::model::Artifact) -> Option<&'static str> {
        use rivet_core::result_trace::EvidenceState::*;
        match self.result_state(a)? {
            Passing => None,
            Failing => Some("latest recorded result FAILS"),
            NotExercised => Some("recorded results are only skipped/blocked (not exercised)"),
            NoResults => Some("no recorded result"),
        }
    }

    /// Add `result_evidence` to a not-ready JSON row under `require: results`
    /// only, so the other modes' JSON is unchanged.
    fn annotate_json(
        &self,
        a: &rivet_core::model::Artifact,
        mut row: serde_json::Value,
    ) -> serde_json::Value {
        if let Some(state) = self.result_state(a) {
            row["result_evidence"] = serde_json::to_value(state).unwrap_or_default();
        }
        row
    }
}

/// REQ-233 / #516: readiness burn-down for a release — per-status counts of the
/// artifacts scoped to `release: <version>`, plus the not-yet-`verified` set.
/// The release is cuttable when that set is empty; returns `Ok(false)` (process
/// exits non-zero) when it is not, so CI can gate a release on it.
/// The 11-03 elements rivet does not yet compute, each with the evidence it
/// would have to come from. Printed in every note so an omission is a
/// declared gap rather than a silent one (REQ-327).
const RELEASE_NOTE_GAPS: &[(&str, &str)] = &[
    ("application parameters", "not modelled"),
    (
        "configurations and variants",
        "the variant subsystem exists but is not wired in here",
    ),
    ("intended area and environment of usage", "not modelled"),
    (
        "impact to other components linked to the release",
        "needs the cross-repo externals graph",
    ),
    ("upstream or downstream compatibility", "not modelled"),
    (
        "copyright and license information",
        "the cargo-deny licenses gate produces this but it is not read here",
    ),
    (
        "approval for delivery by responsible roles",
        "per-artifact reviewers are listed under Approval; a release-level sign-off \
         by a responsible role is not recorded (REQ-333)",
    ),
    ("dependencies to other linked products", "not modelled"),
];

/// Generate a release note from the trace (REQ-327, ASPICE 11-03).
pub(crate) fn cmd_release_notes(
    cli: &Cli,
    version: &str,
    format: &str,
    since: Option<&str>,
) -> Result<bool> {
    validate_format(format, &["markdown", "text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    ctx.warn_parse_error_skips(cli);

    // Local artifacts only (#907). A note that listed an external project's
    // unverified requirement as THIS release's withheld scope would state a
    // falsehood about another project's work in a compliance record.
    let mut scoped: Vec<&rivet_core::model::Artifact> = ctx
        .store
        .iter()
        .filter(|a| a.release.as_deref() == Some(version))
        .filter(|a| !a.id.contains(':'))
        .collect();
    scoped.sort_by(|a, b| a.id.cmp(&b.id));

    if scoped.is_empty() {
        anyhow::bail!(
            "release '{version}' has no artifacts scoped to it — a note over an \
             empty scope would describe nothing. Assign with \
             `rivet modify <ID> --set-release {version}`."
        );
    }

    let readiness = ReadinessCtx::compute(cli, &ctx)?;
    let schema = ctx.schema.clone();
    let graph = LinkGraph::build(&ctx.store, &schema);

    // Delivered vs withheld — 11-03's "set of functionalities provided" and
    // "limitations in relation to the committed scope" are the same partition
    // seen from two sides, which is why they are computed together.
    type ArtRef<'a> = &'a rivet_core::model::Artifact;
    let (delivered, withheld): (Vec<ArtRef<'_>>, Vec<ArtRef<'_>>) =
        scoped.iter().copied().partition(|a| readiness.is_ready(a));

    // "Result of verification and validation measures". Evidence is the UNION
    // of `verifies` backlinks and `// rivet: verifies <ID>` source markers.
    // Counting only links reproduces #788 (REQ-329), where the same evidence
    // read 0% through the link rules and 100% through the marker scan — this
    // surface would have reported every verified artifact as unverified.
    let markers = &readiness.markers;
    let evidence_for = |id: &str| -> (usize, usize) {
        let links = graph.backlinks_of_type(id, "verifies").len();
        let marks = markers
            .iter()
            .filter(|m| m.target_id == id && m.link_type == "verifies")
            .count();
        (links, marks)
    };
    let unverified: Vec<&str> = delivered
        .iter()
        .filter(|a| evidence_for(&a.id) == (0, 0))
        .map(|a| a.id.as_str())
        .collect();

    // REQ-383: judge each delivered artifact by the rules its schema declares
    // for its TYPE. The `verifies` test above stays (and stays in the JSON)
    // but is no longer the note's verdict: a design decision's schema rule is
    // `satisfies -> requirement`, and asking it for a `verifies` link reported
    // every decision in a release as unevidenced.
    use rivet_core::coverage::RuleState;
    let no_rule_outcomes: Vec<rivet_core::coverage::RuleOutcome> = Vec::new();
    let rules_of = |id: &str| readiness.outcomes.get(id).unwrap_or(&no_rule_outcomes);
    let has_evidence = |a: &rivet_core::model::Artifact| {
        evidence_for(&a.id) != (0, 0)
            || rules_of(&a.id).iter().any(|o| {
                matches!(
                    o.state,
                    RuleState::Satisfied | RuleState::SatisfiedByMarker | RuleState::Delegated
                )
            })
    };
    let without_evidence: Vec<&str> = delivered
        .iter()
        .filter(|a| !has_evidence(a))
        .map(|a| a.id.as_str())
        .collect();
    let missing_error: Vec<(&str, Vec<&str>)> = delivered
        .iter()
        .map(|a| (a.id.as_str(), readiness.missing_error_rules(a)))
        .filter(|(_, r)| !r.is_empty())
        .collect();
    fn reviewer_of(a: &rivet_core::model::Artifact) -> Option<&str> {
        a.provenance.as_ref().and_then(|p| p.reviewed_by.as_deref())
    }

    // Changes since the previous release, restricted to commits that name an
    // artifact in THIS release. Issue numbers are read from the subject only
    // where git itself put them, never regexed out of free prose.
    let mut changes: Vec<(String, String, Vec<String>)> = Vec::new();
    let mut changes_error: Option<String> = None;
    if let Some(base) = since {
        let scoped_ids: std::collections::BTreeSet<&str> =
            scoped.iter().map(|a| a.id.as_str()).collect();
        match collect_release_changes(cli, base, &scoped_ids) {
            Ok(c) => changes = c,
            Err(e) => changes_error = Some(e.to_string()),
        }
    }

    let by_type = |set: &[ArtRef<'_>]| {
        let mut m: std::collections::BTreeMap<String, Vec<(String, String, String)>> =
            std::collections::BTreeMap::new();
        for a in set {
            m.entry(a.artifact_type.clone()).or_default().push((
                a.id.clone(),
                a.title.clone(),
                a.status.as_deref().unwrap_or("(none)").to_string(),
            ));
        }
        m
    };
    let delivered_by_type = by_type(&delivered);

    if format == "json" {
        let obj = serde_json::json!({
            "release": version,
            "delivered": delivered.iter().map(|a| serde_json::json!({
                "id": a.id, "type": a.artifact_type, "title": a.title,
                "status": a.status.as_deref().unwrap_or("(none)"),
                "verifies_links": evidence_for(&a.id).0,
                "verifies_markers": evidence_for(&a.id).1,
                "has_verification_evidence": evidence_for(&a.id) != (0, 0),
                "rules": rules_of(&a.id),
                "has_evidence": has_evidence(a),
                "reviewed_by": reviewer_of(a),
            })).collect::<Vec<_>>(),
            "withheld": withheld.iter().map(|a| serde_json::json!({
                "id": a.id, "title": a.title,
                "status": a.status.as_deref().unwrap_or("(none)"),
            })).collect::<Vec<_>>(),
            "without_verification_evidence": unverified,
            "without_evidence": without_evidence,
            "missing_error_rules": missing_error.iter().map(|(id, r)| serde_json::json!({
                "id": id, "rules": r,
            })).collect::<Vec<_>>(),
            "changes": changes.iter().map(|(h, s, i)| serde_json::json!({
                "hash": h, "subject": s, "refs": i,
            })).collect::<Vec<_>>(),
            "changes_error": changes_error,
            "not_covered": RELEASE_NOTE_GAPS.iter()
                .map(|(e, w)| serde_json::json!({"element": e, "why": w}))
                .collect::<Vec<_>>(),
        });
        println!("{}", serde_json::to_string_pretty(&obj)?);
        return Ok(withheld.is_empty());
    }

    let md = format == "markdown";
    let h1 = if md { "# " } else { "" };
    let h2 = if md { "## " } else { "" };
    let bullet = if md { "- " } else { "  " };

    println!("{h1}Release note — {version}");
    println!();
    println!(
        "{} artifact(s) in scope: {} delivered, {} withheld.",
        scoped.len(),
        delivered.len(),
        withheld.len()
    );
    println!();

    println!("{h2}Functionalities provided");
    println!();
    for (ty, items) in &delivered_by_type {
        println!("{}{ty}", if md { "### " } else { "" });
        println!();
        for (id, title, status) in items {
            println!("{bullet}`{id}` ({status}) — {title}");
        }
        println!();
    }

    println!("{h2}Limitations in relation to the committed scope");
    println!();
    if withheld.is_empty() {
        println!("None — every artifact committed to {version} is release-ready.");
    } else {
        println!(
            "{} artifact(s) were committed to {version} but are NOT release-ready. \
             They ship unverified or not at all:",
            withheld.len()
        );
        println!();
        for a in &withheld {
            println!(
                "{bullet}`{}` ({}) — {}",
                a.id,
                a.status.as_deref().unwrap_or("(none)"),
                a.title
            );
        }
    }
    println!();

    println!("{h2}Result of verification measures");
    println!();
    println!(
        "Each delivered artifact is judged by the traceability rules its schema \
         declares for its type. A `verifies` link or source marker is evidence \
         for any type."
    );
    println!();
    if without_evidence.is_empty() {
        println!("Every delivered artifact carries evidence.");
    } else {
        println!(
            "{} of {} delivered artifact(s) carry NO evidence (no `verifies` link, \
             no source marker, and no traceability rule of their type met):",
            without_evidence.len(),
            delivered.len()
        );
        println!();
        for id in &without_evidence {
            println!("{bullet}`{id}`");
        }
    }
    println!();
    let advisory = delivered
        .iter()
        .filter(|a| {
            rules_of(&a.id).iter().any(|o| {
                o.state == RuleState::Missing && o.severity != rivet_core::schema::Severity::Error
            })
        })
        .count();
    if advisory > 0 {
        println!(
            "{advisory} delivered artifact(s) miss a warning- or info-severity rule \
             (advisory; listed per artifact below)."
        );
        println!();
    }
    if !missing_error.is_empty() {
        println!(
            "{} delivered artifact(s) miss an error-severity rule of their type \
             (`release: require: evidence` would withhold them):",
            missing_error.len()
        );
        println!();
        for (id, rules) in &missing_error {
            println!("{bullet}`{id}` — {}", rules.join(", "));
        }
        println!();
    }
    for a in &delivered {
        let (links, marks) = evidence_for(&a.id);
        let rules: Vec<String> = rules_of(&a.id)
            .iter()
            .map(|o| {
                let state = match o.state {
                    RuleState::Satisfied => "met".to_string(),
                    RuleState::SatisfiedByMarker => "met by source marker".to_string(),
                    RuleState::Missing => {
                        format!(
                            "missing ({})",
                            serde_json::to_value(o.severity)
                                .ok()
                                .and_then(|v| v.as_str().map(str::to_string))
                                .unwrap_or_default()
                        )
                    }
                    RuleState::Exempt => "exempt".to_string(),
                    RuleState::Delegated => "delegated to supplier".to_string(),
                    RuleState::Unmodelled => "not modelled".to_string(),
                };
                format!("{} {state}", o.rule)
            })
            .collect();
        let rules = if rules.is_empty() {
            "no rule governs its type".to_string()
        } else {
            rules.join(", ")
        };
        println!(
            "{bullet}`{}` — {links} link(s), {marks} source marker(s); {rules}",
            a.id
        );
    }
    println!();

    // 11-03 "approval for delivery by responsible roles", per artifact. The
    // release-level sign-off is still a declared gap (see below).
    println!("{h2}Approval");
    println!();
    let mut reviewers: std::collections::BTreeMap<&str, usize> = Default::default();
    for a in &delivered {
        if let Some(r) = reviewer_of(a) {
            *reviewers.entry(r).or_default() += 1;
        }
    }
    let reviewed: usize = reviewers.values().sum();
    println!(
        "{reviewed} of {} delivered artifact(s) carry a `reviewed-by` record.",
        delivered.len()
    );
    if !reviewers.is_empty() {
        println!();
        for (who, n) in &reviewers {
            println!("{bullet}{who} — {n} artifact(s)");
        }
    }
    println!();

    if let Some(base) = since {
        println!("{h2}Changes since {base}");
        println!();
        if let Some(err) = &changes_error {
            println!("Could not read the commit range: {err}");
        } else if changes.is_empty() {
            println!("No commits between {base} and HEAD reference an artifact in this release.");
        } else {
            for (hash, subject, issues) in &changes {
                let short: String = hash.chars().take(8).collect();
                if issues.is_empty() {
                    println!("{bullet}`{short}` {subject}");
                } else {
                    println!("{bullet}`{short}` {subject} — refs {}", issues.join(", "));
                }
            }
        }
        println!();
    }

    println!("{h2}Not covered by this note");
    println!();
    println!(
        "Automotive SPICE 11-03 names these release-note elements. rivet does \
         not yet compute them, so they are declared rather than omitted:"
    );
    println!();
    for (element, why) in RELEASE_NOTE_GAPS {
        println!("{bullet}**{element}** — {why}");
    }

    Ok(withheld.is_empty())
}

/// Commits between `base` and HEAD whose trailers name an artifact in `scoped`.
///
/// Returns `(hash, subject, refs)`. The `#N` tokens come from the subject
/// where git itself put them. They are reported as REFERENCES, never as
/// "closes": a `#N` in a squash-merge subject is usually the pull request,
/// not an issue, and the two are indistinguishable from the text alone.
/// Asserting closure here would fabricate a claim in a release record.
fn collect_release_changes(
    cli: &Cli,
    base: &str,
    scoped: &std::collections::BTreeSet<&str>,
) -> Result<Vec<(String, String, Vec<String>)>> {
    let config_path = cli.project.join("rivet.yaml");
    let config = rivet_core::load_project_config(&config_path)
        .with_context(|| format!("loading {}", config_path.display()))?;
    let commits_cfg = config
        .commits
        .as_ref()
        .ok_or_else(|| anyhow::anyhow!("no 'commits' section in rivet.yaml"))?;
    let project_path = std::fs::canonicalize(&cli.project).unwrap_or_else(|_| cli.project.clone());

    let commits = rivet_core::commits::git_log_commits(
        &project_path,
        &format!("{base}..HEAD"),
        &commits_cfg.trailers,
        &commits_cfg.skip_trailer,
    )
    .context("running git log")?;

    let mut out = Vec::new();
    for c in commits {
        let touches = c
            .artifact_refs
            .values()
            .flatten()
            .any(|id| scoped.contains(id.as_str()));
        if !touches {
            continue;
        }
        let issues: Vec<String> = c
            .subject
            .split(|ch: char| !ch.is_ascii_digit() && ch != '#')
            .filter_map(|tok| {
                tok.strip_prefix('#')
                    .filter(|d| !d.is_empty() && d.chars().all(|c| c.is_ascii_digit()))
                    .map(|d| format!("#{d}"))
            })
            .collect();
        out.push((c.hash.clone(), c.subject.clone(), issues));
    }
    Ok(out)
}

/// List every release label in the store, with per-release counts.
///
/// REQ-370. Sorted by version order where the label parses as `vMAJOR.MINOR.PATCH`,
/// so v0.9.0 precedes v0.10.0 rather than following it as a string sort would.
/// Labels that do not parse (e.g. `backlog`) sort last, by name.
pub(crate) fn cmd_release_list(cli: &Cli, format: &str) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    ctx.warn_parse_error_skips(cli);
    let readiness = ReadinessCtx::compute(cli, &ctx)?;

    // Externals are excluded for the same reason `release status` excludes
    // them from its verdict (#907): version labels collide across a
    // multi-repo toolchain, so another project's v0.5.0 must not appear as
    // one of ours.
    let mut by_release: std::collections::BTreeMap<String, Vec<&rivet_core::model::Artifact>> =
        std::collections::BTreeMap::new();
    for a in ctx.store.iter().filter(|a| !a.id.contains(':')) {
        if let Some(r) = a.release.as_deref() {
            by_release.entry(r.to_string()).or_default().push(a);
        }
    }

    // Version order, not string order: v0.9.0 before v0.10.0.
    fn version_key(label: &str) -> Option<(u64, u64, u64)> {
        let v = label.strip_prefix('v').unwrap_or(label);
        let mut it = v.split('.');
        let major = it.next()?.parse().ok()?;
        let minor = it.next()?.parse().ok()?;
        let patch = it.next().unwrap_or("0").parse().ok()?;
        if it.next().is_some() {
            return None;
        }
        Some((major, minor, patch))
    }
    let mut labels: Vec<String> = by_release.keys().cloned().collect();
    labels.sort_by(|a, b| match (version_key(a), version_key(b)) {
        (Some(x), Some(y)) => x.cmp(&y),
        (Some(_), None) => std::cmp::Ordering::Less,
        (None, Some(_)) => std::cmp::Ordering::Greater,
        (None, None) => a.cmp(b),
    });

    let unscoped_unstarted = ctx
        .store
        .iter()
        .filter(|a| !a.id.contains(':'))
        .filter(|a| a.release.is_none())
        .filter(|a| matches!(a.status.as_deref(), Some("draft" | "proposed")))
        .count();

    let rows: Vec<(String, usize, usize, bool)> = labels
        .iter()
        .map(|label| {
            let arts = &by_release[label];
            let ready = arts.iter().filter(|a| readiness.is_ready(a)).count();
            let cuttable = !arts.is_empty() && ready == arts.len();
            (label.clone(), arts.len(), ready, cuttable)
        })
        .collect();

    if format == "json" {
        let obj = serde_json::json!({
            "releases": rows.iter().map(|(label, total, ready, cuttable)| serde_json::json!({
                "release": label,
                "total": total,
                "ready": ready,
                "cuttable": cuttable,
            })).collect::<Vec<_>>(),
            "unscoped_unstarted": unscoped_unstarted,
        });
        println!("{}", serde_json::to_string_pretty(&obj)?);
    } else if rows.is_empty() {
        println!(
            "No release labels in the store. Scope work with \
             `rivet modify <ID> --set-release <version>`."
        );
    } else {
        println!("{} release label(s)", rows.len());
        println!();
        println!("  {:<12} {:>7} {:>7}  STATE", "RELEASE", "TOTAL", "READY");
        for (label, total, ready, cuttable) in &rows {
            let state = if *cuttable {
                "cuttable"
            } else {
                "not cuttable"
            };
            println!("  {label:<12} {total:>7} {ready:>7}  {state}");
        }
        println!();
        // A SHIPPED release can read "not cuttable": its artifacts were
        // scoped before the readiness rule existed and never advanced past
        // `implemented`. That is history, not a regression, and saying so
        // here stops the row being read as a broken release.
        println!(
            "  `not cuttable` on an already-shipped label means its artifacts predate the \
             current readiness rule, not that the release is broken."
        );
        println!("  `rivet release status <version>` for the not-yet-ready set of one release.");
        println!("  `rivet list --filter '(= release \"<version>\")'` for its artifacts.");
        if unscoped_unstarted > 0 {
            println!(
                "  {unscoped_unstarted} draft/proposed artifact(s) carry NO release and appear in no row above."
            );
        }
    }
    Ok(true)
}

pub(crate) fn cmd_release_status(cli: &Cli, version: &str, format: &str) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    ctx.warn_parse_error_skips(cli);

    // An external artifact carries a `prefix:ID` id. It must NOT feed the
    // verdict: version labels collide across a multi-repo toolchain, and a
    // release that can only go green when ANOTHER project verifies its own
    // work is a gate nobody can pass (#907 — kiln's v0.5.0 was permanently
    // not cuttable because gale used the same label). Cross-repo visibility
    // is genuinely useful, so they are reported, just separately.
    let mut scoped: Vec<&rivet_core::model::Artifact> = ctx
        .store
        .iter()
        .filter(|a| a.release.as_deref() == Some(version))
        .filter(|a| !a.id.contains(':'))
        .collect();
    scoped.sort_by(|a, b| a.id.cmp(&b.id));
    let mut external: Vec<&rivet_core::model::Artifact> = ctx
        .store
        .iter()
        .filter(|a| a.release.as_deref() == Some(version))
        .filter(|a| a.id.contains(':'))
        .collect();
    external.sort_by(|a, b| a.id.cmp(&b.id));

    // REQ-345: work that carries NO `release:` at all is invisible to every
    // readiness query, because every such query filters on one. 601 of this
    // repository's 706 artifacts had no release field, and 165 of those were
    // draft/proposed — real unstarted work nothing ever asked about. #104 sat
    // five months for exactly that reason. Counted and reported beside the
    // scoped set so the number is in front of whoever is already asking about
    // a release, which is when it matters.
    //
    // Only draft/proposed count. An approved or implemented artifact without a
    // release is finished work from before scoping existed, and a release field
    // on it would mean nothing — including those would report a number nobody
    // can act on, which is the defect this exists to avoid rather than repeat.
    let unscoped_unstarted = ctx
        .store
        .iter()
        .filter(|a| !a.id.contains(':'))
        .filter(|a| a.release.is_none())
        .filter(|a| matches!(a.status.as_deref(), Some("draft" | "proposed")))
        .count();

    let readiness = ReadinessCtx::compute(cli, &ctx)?;
    let mode = readiness.mode;
    let is_ready = |a: &rivet_core::model::Artifact| -> bool { readiness.is_ready(a) };
    let mut by_status: std::collections::BTreeMap<String, usize> =
        std::collections::BTreeMap::new();
    for a in &scoped {
        *by_status
            .entry(a.status.as_deref().unwrap_or("(none)").to_string())
            .or_default() += 1;
    }
    let not_done: Vec<&&rivet_core::model::Artifact> =
        scoped.iter().filter(|a| !is_ready(a)).collect();
    // An EMPTY scope is not cuttable: a release nobody has assigned artifacts
    // to — or, more commonly, a mistyped version — must not green a
    // `rivet release status vX.Y.Z || fail` CI gate. "Ship a release
    // containing nothing" is the most common operator typo, not success (#628).
    let cuttable = !scoped.is_empty() && not_done.is_empty();

    if format == "json" {
        let obj = serde_json::json!({
            "release": version,
            "total": scoped.len(),
            "by_status": by_status,
            "not_verified": not_done.iter().map(|a| readiness.annotate_json(a, serde_json::json!({
                "id": a.id,
                "status": a.status.as_deref().unwrap_or("(none)"),
                "title": a.title,
                "missing_error_rules": readiness.missing_error_rules(a),
            }))).collect::<Vec<_>>(),
            "cuttable": cuttable,
            "external": external.iter().map(|a| serde_json::json!({
                "id": a.id,
                "status": a.status.as_deref().unwrap_or("(none)"),
                "title": a.title,
            })).collect::<Vec<_>>(),
            "unscoped_unstarted": unscoped_unstarted,
        });
        println!("{}", serde_json::to_string_pretty(&obj)?);
    } else if scoped.is_empty() {
        println!(
            "Release {version}: no artifacts scoped — assign with \
             `rivet modify <ID> --set-release {version}`."
        );
    } else {
        println!("Release {version} — {} artifact(s)", scoped.len());
        for (status, count) in &by_status {
            println!("  {status:<12} {count}");
        }
        if cuttable {
            let how = mode.ready_phrase();
            println!("\n\u{2713} Cuttable — every artifact is {how}.");
        } else {
            println!("\nNot yet release-ready ({}):", not_done.len());
            for a in &not_done {
                println!(
                    "  {:<10} {:<12} {}",
                    a.id,
                    a.status.as_deref().unwrap_or("(none)"),
                    a.title
                );
                let missing = readiness.missing_error_rules(a);
                if !missing.is_empty() {
                    println!(
                        "  {:<10} missing error-severity rule(s): {}",
                        "",
                        missing.join(", ")
                    );
                }
                if let Some(why) = readiness.result_withholds(a) {
                    println!("  {:<10} {why}", "");
                }
            }
            println!(
                "\n\u{2717} NOT cuttable — {} artifact(s) not yet release-ready.",
                not_done.len()
            );
        }
        if unscoped_unstarted > 0 {
            println!(
                "\nUnscoped, informational — {unscoped_unstarted} artifact(s) at \
                 draft/proposed carry NO `release:` and therefore appear in no \
                 readiness query. Not part of this verdict. Assign one, or \
                 `rivet release move <ID> backlog` to state that it is not \
                 scheduled."
            );
        }
        if !external.is_empty() {
            println!(
                "\nExternal, informational ({}) — tagged {version} by another \
                 project and NOT part of this verdict:",
                external.len()
            );
            for a in &external {
                println!(
                    "  {:<28} {:<12} {}",
                    a.id,
                    a.status.as_deref().unwrap_or("(none)"),
                    a.title
                );
            }
        }
    }

    Ok(cuttable)
}

/// Discover the project's feature model file by convention — the same
/// candidate names the dashboard's variant discovery uses, but resolved
/// through `load_feature_model_via_project` so `extends`/externals compose.
/// Searches `artifacts/`, then each declared source `path`, then the project
/// root. Returns `None` when no candidate file exists.
fn discover_feature_model_path(
    project: &std::path::Path,
    config: &ProjectConfig,
) -> Option<std::path::PathBuf> {
    let mut roots: Vec<std::path::PathBuf> = vec![project.join("artifacts")];
    for s in &config.sources {
        let p = project.join(&s.path);
        if !roots.contains(&p) {
            roots.push(p);
        }
    }
    let proj = project.to_path_buf();
    if !roots.contains(&proj) {
        roots.push(proj);
    }
    let candidates = ["feature-model.yaml", "feature_model.yaml"];
    roots
        .iter()
        .flat_map(|r| candidates.iter().map(move |n| r.join(n)))
        .find(|p| p.is_file())
}

/// Resolve the feature-binding for a variant: prefer the variant file's own
/// embedded `bindings:` section (REQ-106), else the project-level
/// `bindings.yaml` / `feature-bindings.yaml`. Returns an empty binding when
/// neither exists (⇒ the variant binds no artifacts).
fn discover_variant_binding(
    project: &std::path::Path,
    config: &ProjectConfig,
    variant_yaml: &str,
) -> Result<rivet_core::feature_model::FeatureBinding> {
    // REQ-106: a variant file may embed its own `bindings:` — it IS its own
    // binding model. Mirrors `rivet variant solve --binding <variant-file>`.
    if let Ok(fb) = rivet_yaml::from_str::<rivet_core::feature_model::FeatureBinding>(variant_yaml)
    {
        if !fb.bindings.is_empty() {
            return Ok(fb);
        }
    }
    let mut roots: Vec<std::path::PathBuf> = vec![project.join("artifacts")];
    for s in &config.sources {
        let p = project.join(&s.path);
        if !roots.contains(&p) {
            roots.push(p);
        }
    }
    let proj = project.to_path_buf();
    if !roots.contains(&proj) {
        roots.push(proj);
    }
    let candidates = ["bindings.yaml", "feature-bindings.yaml"];
    if let Some(p) = roots
        .iter()
        .flat_map(|r| candidates.iter().map(move |n| r.join(n)))
        .find(|p| p.is_file())
    {
        let yaml =
            std::fs::read_to_string(&p).with_context(|| format!("reading {}", p.display()))?;
        return rivet_yaml::from_str(&yaml)
            .with_context(|| format!("parsing feature binding {}", p.display()));
    }
    Ok(rivet_core::feature_model::FeatureBinding {
        bindings: std::collections::BTreeMap::new(),
        variants: Vec::new(),
    })
}

/// Resolve `--variant <NAME|path>` to `(variant_name, bound_artifact_ids)`
/// using the project-convention feature model + binding — the same
/// solve-then-bind path as `rivet validate --variant` (see main.rs ~5539),
/// NOT the serve-only `build_variant_scope`.
fn resolve_variant_bound_ids(
    cli: &Cli,
    config: &ProjectConfig,
    variant_arg: &str,
) -> Result<(String, std::collections::BTreeSet<String>)> {
    // 1. Resolve the variant config file (bare name → artifacts/variants/<name>.yaml).
    let (variant_path, _name) = resolve_variant_arg(&cli.project, variant_arg)?;
    let variant_yaml = std::fs::read_to_string(&variant_path)
        .with_context(|| format!("reading variant config {}", variant_path.display()))?;
    let vc = rivet_core::feature_model::VariantConfig::from_yaml_str(&variant_yaml)
        .with_context(|| format!("parsing variant config {}", variant_path.display()))?;

    // 2. Discover + load the feature model (loud when absent — we cannot solve).
    let model_path = discover_feature_model_path(&cli.project, config).ok_or_else(|| {
        anyhow::anyhow!(
            "no feature model found — expected artifacts/feature-model.yaml (or \
             feature_model.yaml) under {}",
            cli.project.display()
        )
    })?;
    let fm = load_feature_model_via_project(&model_path)?;

    // 3. Solve the variant against the model.
    let resolved = rivet_core::feature_model::solve(&fm, &vc).map_err(|errs| {
        let msgs: Vec<String> = errs.iter().map(|e| format!("{e}")).collect();
        anyhow::anyhow!("variant solve failed:\n  {}", msgs.join("\n  "))
    })?;

    // 4. Collect bound artifact IDs from the effective features.
    let fb = discover_variant_binding(&cli.project, config, &variant_yaml)?;
    let bound_ids: std::collections::BTreeSet<String> = resolved
        .effective_features
        .iter()
        .flat_map(|f| {
            fb.bindings
                .get(f)
                .map(|b| b.artifacts.clone())
                .unwrap_or_default()
        })
        .collect();

    Ok((resolved.name, bound_ids))
}

/// REQ-254 / #673: cross-check a release against a variant — partition the
/// release-tagged artifacts against the variant's resolved artifact-id set AND
/// report whether the release is cuttable within that variant.
///
/// Consistency partitions the two id sets into `in-scope` (tagged AND bound),
/// `out-of-scope` (tagged but NOT bound — the primary inconsistency), and
/// `variant-only` (bound but NOT tagged — informational). Cuttability runs the
/// shared `ReadinessCtx` predicate scoped to the `in-scope` (intersection) set
/// — an empty intersection is NOT cuttable (same rule as `cmd_release_status`,
/// #628). The returned bool (→ process exit) is the cuttability, AND-ed with
/// "no out-of-scope artifacts" under `--strict`.
pub(crate) fn cmd_release_check(
    cli: &Cli,
    version: &str,
    variant: &str,
    format: &str,
    strict: bool,
) -> Result<bool> {
    validate_format(format, &["text", "json"])?;
    let ctx = ProjectContext::load(cli)?;
    ctx.warn_parse_error_skips(cli);

    let (variant_name, bound_ids) = resolve_variant_bound_ids(cli, &ctx.config, variant)?;

    // Release-tagged artifact ids.
    let release_ids: std::collections::BTreeSet<String> = ctx
        .store
        .iter()
        .filter(|a| a.release.as_deref() == Some(version))
        .map(|a| a.id.clone())
        .collect();

    // Consistency partition (BTreeSet ⇒ deterministic, id-sorted).
    let in_scope: std::collections::BTreeSet<String> =
        release_ids.intersection(&bound_ids).cloned().collect();
    let out_of_scope: std::collections::BTreeSet<String> =
        release_ids.difference(&bound_ids).cloned().collect();
    let variant_only: std::collections::BTreeSet<String> =
        bound_ids.difference(&release_ids).cloned().collect();

    // Cuttability: readiness predicate scoped to the intersection set.
    let readiness = ReadinessCtx::compute(cli, &ctx)?;
    let mode = readiness.mode;
    let mut in_scope_arts: Vec<&rivet_core::model::Artifact> = ctx
        .store
        .iter()
        .filter(|a| in_scope.contains(&a.id))
        .collect();
    in_scope_arts.sort_by(|a, b| a.id.cmp(&b.id));

    let mut by_status: std::collections::BTreeMap<String, usize> =
        std::collections::BTreeMap::new();
    for a in &in_scope_arts {
        *by_status
            .entry(a.status.as_deref().unwrap_or("(none)").to_string())
            .or_default() += 1;
    }
    let not_done: Vec<&&rivet_core::model::Artifact> = in_scope_arts
        .iter()
        .filter(|a| !readiness.is_ready(a))
        .collect();
    // An empty intersection is not cuttable (same rule as cmd_release_status,
    // #628): a release with nothing in this variant must not green a gate.
    let cuttable = !in_scope.is_empty() && not_done.is_empty();
    // `--strict` also fails when any release-tagged artifact is out-of-scope.
    let ok = cuttable && (!strict || out_of_scope.is_empty());

    if format == "json" {
        let obj = serde_json::json!({
            "release": version,
            "variant": variant_name,
            "total": in_scope_arts.len(),
            "by_status": by_status,
            "not_verified": not_done.iter().map(|a| readiness.annotate_json(a, serde_json::json!({
                "id": a.id,
                "status": a.status.as_deref().unwrap_or("(none)"),
                "title": a.title,
                "missing_error_rules": readiness.missing_error_rules(a),
            }))).collect::<Vec<_>>(),
            "in_scope": in_scope.iter().cloned().collect::<Vec<_>>(),
            "out_of_scope": out_of_scope.iter().cloned().collect::<Vec<_>>(),
            "variant_only": variant_only.iter().cloned().collect::<Vec<_>>(),
            "cuttable": cuttable,
            "strict": strict,
            "ok": ok,
        });
        println!("{}", serde_json::to_string_pretty(&obj)?);
    } else {
        println!("Release {version} \u{2229} variant '{variant_name}'");
        println!(
            "  in-scope     {:>3}  (tagged for {version} AND bound by the variant)",
            in_scope.len()
        );
        println!(
            "  out-of-scope {:>3}  (tagged for {version} but NOT in the variant)",
            out_of_scope.len()
        );
        println!(
            "  variant-only {:>3}  (bound by the variant but NOT tagged for {version})",
            variant_only.len()
        );

        if !out_of_scope.is_empty() {
            let tag = if strict { "\u{2717}" } else { "warning:" };
            println!("\n{tag} {} out-of-scope artifact(s):", out_of_scope.len());
            for id in &out_of_scope {
                let title = ctx.store.get(id).map(|a| a.title.as_str()).unwrap_or("");
                println!("  {id:<10} {title}");
            }
        }
        if !variant_only.is_empty() {
            println!(
                "\nvariant-only ({}) — bound by the variant but not tagged for {version}:",
                variant_only.len()
            );
            for id in &variant_only {
                println!("  {id}");
            }
        }

        // Cuttability, scoped to the intersection.
        println!(
            "\nCuttability (in-scope set, {} artifact(s)):",
            in_scope.len()
        );
        if in_scope.is_empty() {
            println!(
                "\u{2717} NOT cuttable — no artifact is both tagged for {version} and \
                 bound by the variant."
            );
        } else {
            for (status, count) in &by_status {
                println!("  {status:<12} {count}");
            }
            if cuttable {
                let how = mode.ready_phrase();
                println!("\n\u{2713} Cuttable — every in-scope artifact is {how}.");
            } else {
                println!("\nNot yet release-ready ({}):", not_done.len());
                for a in &not_done {
                    println!(
                        "  {:<10} {:<12} {}",
                        a.id,
                        a.status.as_deref().unwrap_or("(none)"),
                        a.title
                    );
                    let missing = readiness.missing_error_rules(a);
                    if !missing.is_empty() {
                        println!(
                            "  {:<10} missing error-severity rule(s): {}",
                            "",
                            missing.join(", ")
                        );
                    }
                    if let Some(why) = readiness.result_withholds(a) {
                        println!("  {:<10} {why}", "");
                    }
                }
                println!(
                    "\n\u{2717} NOT cuttable — {} in-scope artifact(s) not yet release-ready.",
                    not_done.len()
                );
            }
        }
        if strict && !out_of_scope.is_empty() && cuttable {
            println!("\n(--strict: exiting non-zero due to out-of-scope artifacts.)");
        }
    }

    Ok(ok)
}
