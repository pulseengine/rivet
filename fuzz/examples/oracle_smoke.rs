//! Standalone smoke test for the yaml_footguns oracle.
//!
//! Runs the same `probe()` logic the fuzzer uses against a hand-picked
//! set of known-footgun YAML inputs.  Intended as a reproducibility
//! harness — if any invariant fires here, the fuzzer will surface the
//! same finding in under a second.
//!
//! Run with:
//!   cargo run --release --example oracle_smoke -p rivet-fuzz
//!
//! Exit codes:
//!   0  — no silent-accept bugs triggered in the fixed corpus
//!   1  — at least one invariant panicked; see stderr for details
//!
//! NOTE: this is NOT a replacement for `cargo fuzz run yaml_footguns`.
//! It only exercises the hand-picked Mythos-predicted patterns.

use rivet_core::formats::generic::parse_generic_yaml;
use rivet_core::model::Artifact;

fn main() {
    // Count the number of probes and the number of silent-accept findings.
    let mut probes = 0usize;
    let mut findings: Vec<String> = Vec::new();

    for (name, yaml) in cases() {
        probes += 1;
        // Diagnostic dump: show what the two parse paths return so a reader
        // can classify "silently dropped" vs "returned wrong value" vs
        // "correctly rejected".
        let serde_res = parse_generic_yaml(yaml, None);
        let hir = rivet_core::yaml_hir::extract_generic_artifacts(yaml);
        match &serde_res {
            Ok(artifacts) => {
                eprintln!(
                    "[{name}] serde_ok={} artifact(s): {:?}",
                    artifacts.len(),
                    artifacts
                        .iter()
                        .map(|a| (&a.id, &a.artifact_type))
                        .collect::<Vec<_>>()
                );
                for (i, a) in artifacts.iter().enumerate() {
                    if !a.links.is_empty() {
                        eprintln!(
                            "    a[{i}].links = {:?}",
                            a.links.iter().map(|l| (&l.link_type, &l.target)).collect::<Vec<_>>()
                        );
                    }
                }
            }
            Err(e) => eprintln!("[{name}] serde_err = {e}"),
        }
        eprintln!(
            "[{name}] hir artifacts={}  diagnostics={}",
            hir.artifacts.len(),
            hir.diagnostics.len()
        );
        for sa in &hir.artifacts {
            if !sa.artifact.links.is_empty() {
                eprintln!(
                    "    hir links = {:?}",
                    sa.artifact
                        .links
                        .iter()
                        .map(|l| (&l.link_type, &l.target))
                        .collect::<Vec<_>>()
                );
            }
        }

        let finding = check(name, yaml);
        if let Some(msg) = finding {
            eprintln!("FINDING [{name}]: {msg}");
            findings.push(name.to_string());
        }
    }

    println!("smoke probes: {probes}");
    println!("silent-accept findings: {}", findings.len());
    for f in &findings {
        println!("  - {f}");
    }
    if !findings.is_empty() {
        std::process::exit(1);
    }
}

fn cases() -> &'static [(&'static str, &'static str)] {
    &[
        (
            "null-shorthand-link",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: seed\n",
                "    links:\n",
                "      - type: derives-from\n",
                "        target: null\n",
            ),
        ),
        (
            "tilde-shorthand-link",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: seed\n",
                "    links:\n",
                "      - type: derives-from\n",
                "        target: ~\n",
            ),
        ),
        (
            "empty-string-link-target",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: seed\n",
                "    links:\n",
                "      - type: derives-from\n",
                "        target: \"\"\n",
            ),
        ),
        (
            "multi-document",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: seed\n",
                "---\n",
                "artifacts:\n",
                "  - id: REQ-999\n",
                "    type: requirement\n",
                "    title: second\n",
            ),
        ),
        (
            "norway-problem-status",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: seed\n",
                "    status: NO\n",
            ),
        ),
        (
            "norway-problem-id",
            concat!(
                "artifacts:\n",
                "  - id: NO\n",
                "    type: requirement\n",
                "    title: seed\n",
            ),
        ),
        (
            "unknown-top-level-key",
            concat!(
                "artifact:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: seed\n",
            ),
        ),
        (
            "duplicate-id-key",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    id: REQ-XXX\n",
                "    type: requirement\n",
                "    title: seed\n",
            ),
        ),
        (
            "unquoted-date-title",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: 2026-04-21\n",
            ),
        ),
        (
            "unquoted-version-baseline",
            concat!(
                "artifacts:\n",
                "  - id: REQ-001\n",
                "    type: requirement\n",
                "    title: seed\n",
                "    fields:\n",
                "      baseline: 1.0\n",
            ),
        ),
        (
            "leading-zero-id",
            concat!(
                "artifacts:\n",
                "  - id: REQ-0001\n",
                "    type: requirement\n",
                "    title: seed\n",
            ),
        ),
        (
            "soft-hyphen-in-id",
            "artifacts:\n  - id: \"REQ-\u{00AD}001\"\n    type: requirement\n    title: seed\n",
        ),
    ]
}

fn check(_name: &str, yaml: &str) -> Option<String> {
    // Use catch_unwind so a panic in probe() becomes a reported finding
    // instead of aborting the whole smoke run.
    let yaml_string = yaml.to_string();
    let res = std::panic::catch_unwind(std::panic::AssertUnwindSafe(move || probe(&yaml_string)));
    match res {
        Ok(None) => None,
        Ok(Some(msg)) => Some(msg),
        Err(_) => Some("probe panicked".to_string()),
    }
}

fn probe(yaml: &str) -> Option<String> {
    let serde_result = parse_generic_yaml(yaml, None);
    let hir = rivet_core::yaml_hir::extract_generic_artifacts(yaml);

    // Also run the plain serde paths to catch panics.
    let _ = serde_yaml::from_str::<Artifact>(yaml);
    let _ = serde_yaml::from_str::<Vec<Artifact>>(yaml);

    if let Ok(artifacts) = &serde_result {
        for a in artifacts {
            if a.id.is_empty() {
                return Some(format!(
                    "serde: empty id returned (silent-accept)\nYAML:\n{yaml}"
                ));
            }
            if !yaml.contains(&a.id) {
                return Some(format!(
                    "serde: id {:?} not present in source (silent-accept / coercion)\nYAML:\n{yaml}",
                    a.id
                ));
            }
            if a.artifact_type.is_empty() {
                return Some(format!(
                    "serde: empty type returned (silent-accept)\nYAML:\n{yaml}"
                ));
            }
            if !yaml.contains(&a.artifact_type) {
                return Some(format!(
                    "serde: type {:?} not present in source\nYAML:\n{yaml}",
                    a.artifact_type
                ));
            }
            for l in &a.links {
                if l.target.is_empty() {
                    return Some(format!(
                        "serde: phantom link (empty target)\nYAML:\n{yaml}"
                    ));
                }
                if !yaml.contains(&l.target) {
                    return Some(format!(
                        "serde: link target {:?} not present in source\nYAML:\n{yaml}",
                        l.target
                    ));
                }
            }
        }
    }

    for sa in &hir.artifacts {
        let a = &sa.artifact;
        if !a.id.is_empty() && !yaml.contains(&a.id) {
            return Some(format!(
                "hir: id {:?} not present in source\nYAML:\n{yaml}",
                a.id
            ));
        }
        for l in &a.links {
            if l.target.is_empty() {
                return Some(format!(
                    "hir: phantom link (empty target — yaml_hir.rs:530 bug class)\nYAML:\n{yaml}"
                ));
            }
            if !yaml.contains(&l.target) {
                return Some(format!(
                    "hir: link target {:?} not present in source\nYAML:\n{yaml}",
                    l.target
                ));
            }
        }
    }

    // Oracle: null-ish link targets.
    let null_ish = |t: &str| matches!(t.trim(), "null" | "NULL" | "Null" | "~");
    if let Ok(arts) = &serde_result {
        for a in arts {
            for l in &a.links {
                if null_ish(&l.target) {
                    return Some(format!(
                        "serde: link target coerced from YAML null: {:?} (yaml_hir.rs:530 class)\nYAML:\n{yaml}",
                        l.target
                    ));
                }
            }
        }
    }
    for sa in &hir.artifacts {
        for l in &sa.artifact.links {
            if null_ish(&l.target) {
                return Some(format!(
                    "hir: link target coerced from YAML null: {:?}\nYAML:\n{yaml}",
                    l.target
                ));
            }
        }
    }

    // Oracle: serde rejected but hir silently accepted 0 artifacts.
    if serde_result.is_err()
        && hir.artifacts.is_empty()
        && hir.diagnostics.is_empty()
        && yaml.contains("id:")
    {
        return Some(format!(
            "hir: serde rejected but HIR returned 0 artifacts / 0 diagnostics (formats/generic.rs:138 class)\nYAML:\n{yaml}"
        ));
    }

    // Oracle: multi-document silent truncation.
    if yaml.contains("\n---\n") {
        let declared: usize = yaml
            .lines()
            .filter(|l| l.trim_start().starts_with("- id:"))
            .count();
        if declared > hir.artifacts.len() && hir.diagnostics.is_empty() {
            return Some(format!(
                "hir: multi-document truncation — source declares {declared} artifacts, HIR returned {} (yaml_cst.rs:517 class)\nYAML:\n{yaml}",
                hir.artifacts.len()
            ));
        }
    }

    None
}
