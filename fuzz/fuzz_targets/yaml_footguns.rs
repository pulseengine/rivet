#![no_main]
//! YAML-footguns fuzzer.
//!
//! Empirically measures how often rivet's artifact-ingest pipeline silently
//! corrupts structurally-wrong YAML inputs (arxiv:2604.13108 claim:
//! "YAML silently corrupts ~50% of structural errors").
//!
//! Oracle: for each adversarial mutation of a *known-valid* artifact YAML,
//! rivet must either
//!   (a) reject the input with an Error-severity diagnostic, or
//!   (b) preserve the intended value exactly
//! but never silently coerce/drop/synthesize a changed artifact without error.
//!
//! Complements `rivet-core/tests/differential_yaml.rs` (which catches cases
//! where rowan and serde_yaml *disagree*).  This target catches cases where
//! they *agree on a wrong AST* — the silent-accept class.
//!
//! Classification of findings (see `fuzz/README.md`):
//!   * panic          — any target panic (double fault)
//!   * silent-accept  — YAML parses to Ok(artifacts), but the resulting id /
//!                      link / field differs from the textually-present value
//!   * coercion       — scalar value (YAML 1.1 "Norway", version, date, etc.)
//!                      was silently re-typed

use arbitrary::Arbitrary;
use libfuzzer_sys::fuzz_target;
use rivet_core::formats::generic::parse_generic_yaml;
use rivet_core::model::Artifact;

/// A single adversarial mutation applied to a seed artifact-YAML document.
#[derive(Debug, Clone, Arbitrary)]
enum Footgun {
    /// YAML 1.1 Norway problem: replace a scalar with an unquoted boolean/null.
    Norway { which_field: u8, variant: u8 },
    /// Strip quotes from a version-like string.
    VersionCoercion { which_field: u8 },
    /// Prepend `0` to the integer suffix of the id.
    LeadingZeroId,
    /// Replace the title scalar with an unquoted date.
    UnquotedDate,
    /// Duplicate the `id:` or `type:` key.
    DuplicateKey { which: u8 },
    /// Replace a space-indent line with tab indent.
    TabIndent { line_offset: u8 },
    /// Inject a second `---\nartifacts: [...]\n` document.
    MultiDocument,
    /// Set a shorthand-link-style field to null / ~ / "".
    NullShorthandLink { variant: u8 },
    /// Rename the top-level `artifacts:` key.
    UnknownTopLevelKey { variant: u8 },
    /// Emit an anchor / alias cycle inside a field value.
    AnchorCycle,
    /// Deeply nest a list inside the `fields:` map.
    DeepNesting { depth: u8 },
    /// Insert a NUL/soft-hyphen/trailing-space into the id value.
    ControlCharInId { variant: u8 },
}

/// Wrapper to drive multiple footgun mutations per input.
#[derive(Debug, Arbitrary)]
struct FuzzInput {
    footguns: Vec<Footgun>,
}

const SEED_YAML: &str = "artifacts:\n  - id: REQ-001\n    type: requirement\n    title: Seed requirement\n    status: draft\n    tags: [safety]\n    links:\n      - type: derives-from\n        target: REQ-000\n    fields:\n      priority: must\n      baseline: v0.1.0\n";

fuzz_target!(|input: FuzzInput| {
    let mut yaml = SEED_YAML.to_string();
    // Apply up to 3 footgun mutations (more than that often yields invalid YAML that
    // just errors out — not interesting).
    for f in input.footguns.iter().take(3) {
        yaml = apply_footgun(&yaml, f);
    }
    probe(&yaml);
});

/// Feed an empty-Unstructured fallback path so cargo-fuzz can also consume raw
/// bytes when it wants to.  Not the primary oracle path.
#[allow(dead_code)]
fn probe_raw(data: &[u8]) {
    if let Ok(s) = std::str::from_utf8(data) {
        probe(s);
    }
}

/// Runs the oracle: parse through both the serde path and the rowan path.
/// Any panic fails the target automatically.  Any *semantic discrepancy*
/// between returned artifacts and text-present values flags a silent bug.
fn probe(yaml: &str) {
    // 1. Direct serde parse (`formats::generic::parse_generic_yaml`).
    let serde_result = parse_generic_yaml(yaml, None);

    // 2. Rowan HIR extraction, the path the LSP uses.
    let hir = rivet_core::yaml_hir::extract_generic_artifacts(yaml);

    // 3. Full artifact-level deserialize (some adapters use this).
    let _ = serde_yaml::from_str::<Artifact>(yaml);
    let _ = serde_yaml::from_str::<Vec<Artifact>>(yaml);

    // Oracle 1: if parse_generic_yaml returned Ok, every returned id must
    // literally appear in the source text.  A returned id that is NOT a
    // substring of the source is a silent-synthesis bug (Norway coercion,
    // duplicate key merge, etc.).
    if let Ok(artifacts) = &serde_result {
        for a in artifacts {
            // An empty id passes all substring checks but is itself a silent
            // acceptance bug — every artifact must have a non-empty id.
            assert!(
                !a.id.is_empty(),
                "silent-accept: empty id returned by parse_generic_yaml\nYAML:\n{yaml}"
            );
            // Exact substring match: the id must appear as-is in the source.
            // This catches Norway-problem coercions (e.g., `NO` being turned
            // into `false` and re-serialized as the string `"false"`).
            assert!(
                yaml.contains(&a.id),
                "silent-accept: parse_generic_yaml returned id {:?} not present in source\nYAML:\n{yaml}",
                a.id
            );
            // Same oracle for artifact_type.
            assert!(
                !a.artifact_type.is_empty(),
                "silent-accept: empty type returned by parse_generic_yaml\nYAML:\n{yaml}"
            );
            assert!(
                yaml.contains(&a.artifact_type),
                "silent-accept: parse_generic_yaml returned type {:?} not present in source\nYAML:\n{yaml}",
                a.artifact_type
            );
            // Link targets must also be source-present substrings.
            for l in &a.links {
                assert!(
                    !l.target.is_empty(),
                    "silent-accept: link with empty target (phantom link)\nYAML:\n{yaml}"
                );
                assert!(
                    yaml.contains(&l.target),
                    "silent-accept: link target {:?} not present in source\nYAML:\n{yaml}",
                    l.target
                );
            }
        }
    }

    // Oracle 2: HIR path.  Same substring invariant.
    for sa in &hir.artifacts {
        let a = &sa.artifact;
        if !a.id.is_empty() {
            assert!(
                yaml.contains(&a.id),
                "silent-accept: yaml_hir returned id {:?} not present in source\nYAML:\n{yaml}",
                a.id
            );
        }
        for l in &a.links {
            assert!(
                !l.target.is_empty(),
                "silent-accept: yaml_hir phantom link (empty target)\nYAML:\n{yaml}"
            );
            assert!(
                yaml.contains(&l.target),
                "silent-accept: yaml_hir link target {:?} not present in source\nYAML:\n{yaml}",
                l.target
            );
        }
    }

    // Oracle 3: "null-ish" link targets are always a phantom link.
    // serde_yaml happily materializes `target: null`, `target: ~`, and
    // `target: ""` as a link with a string-ish target that is not a real
    // artifact id.  This is the `yaml_hir.rs:530-549` bug class.
    for list in [
        serde_result.as_ref().ok().map(|v| v.as_slice()).unwrap_or(&[]),
    ] {
        for a in list {
            for l in &a.links {
                let t = l.target.trim();
                assert!(
                    t != "null" && t != "~" && t != "NULL" && t != "Null",
                    "silent-accept: link target coerced from YAML null: {:?}\nYAML:\n{yaml}",
                    l.target
                );
            }
        }
    }
    for sa in &hir.artifacts {
        for l in &sa.artifact.links {
            let t = l.target.trim();
            assert!(
                t != "null" && t != "~" && t != "NULL" && t != "Null",
                "silent-accept: hir link target coerced from YAML null: {:?}\nYAML:\n{yaml}",
                l.target
            );
        }
    }

    // Oracle 4: HIR+serde disagree on parse outcome for the top-level
    // `artifacts:` key.  If serde rejects with "missing field `artifacts`"
    // and HIR returns 0 artifacts with 0 diagnostics, that is the
    // `formats/generic.rs:138` Ok(vec![]) silent-accept.  We only flag the
    // specific 0-artifacts / 0-diagnostics / serde-error shape.
    if serde_result.is_err() && hir.artifacts.is_empty() && hir.diagnostics.is_empty() {
        // If the source text contains NO mention of any artifact id shape,
        // zero artifacts is the correct outcome.  We only panic when the
        // source clearly intended to declare artifacts but HIR dropped them
        // silently.  Heuristic: the source contains `id:` or `- id:`.
        if yaml.contains("id:") {
            panic!(
                "silent-accept: serde rejected input but yaml_hir returned 0 artifacts / 0 diagnostics (formats/generic.rs:138 class)\nYAML:\n{yaml}"
            );
        }
    }

    // Oracle 5: multi-document silent truncation (`yaml_cst.rs:517`).
    // If the source contains a literal `---` document separator preceded
    // by an `artifacts:` block, HIR will often keep only the first doc.
    // We compare the number of declared `- id:` occurrences on top-level
    // artifact-list lines against the number of artifacts HIR returned.
    // This is heuristic but empirically catches the known multi-doc bug.
    if yaml.contains("\n---\n") {
        // Count approximate declared artifacts.  We count lines matching
        // `^  - id:` (the canonical list-item indent for artifacts:).
        let declared: usize = yaml
            .lines()
            .filter(|l| l.trim_start().starts_with("- id:"))
            .count();
        if declared > hir.artifacts.len() && hir.diagnostics.is_empty() {
            panic!(
                "silent-accept: multi-document truncation — source declares {declared} artifacts but HIR returned {} with no diagnostics (yaml_cst.rs:517 class)\nYAML:\n{yaml}",
                hir.artifacts.len()
            );
        }
    }
}

// ── Mutation machinery ────────────────────────────────────────────────────

fn apply_footgun(yaml: &str, f: &Footgun) -> String {
    match f {
        Footgun::Norway { which_field, variant } => {
            let payload = norway_variant(*variant);
            // Replace the first scalar value at column 4+ that matches the
            // chosen field.  Keep it simple: pick one of id/title/status/
            // target/priority/baseline.
            let field = pick_field(*which_field);
            replace_field_value(yaml, field, payload)
        }
        Footgun::VersionCoercion { which_field } => {
            let field = pick_field(*which_field);
            // Baseline values are quoted in the seed; swap `"v0.1.0"` for
            // `v0.1.0` and also handle the 1.0 -> no quotes case.
            replace_field_value(yaml, field, "1.0")
        }
        Footgun::LeadingZeroId => yaml.replace("REQ-001", "REQ-0001"),
        Footgun::UnquotedDate => replace_field_value(yaml, "title", "2026-04-21"),
        Footgun::DuplicateKey { which } => {
            let key = if *which % 2 == 0 { "id" } else { "type" };
            // Duplicate the key on the same artifact with a different value.
            yaml.replace(
                &format!("    {key}:"),
                &format!("    {key}: DUPLICATE-VAL\n    {key}:"),
            )
        }
        Footgun::TabIndent { line_offset } => {
            // Convert one of the 4-space-indent lines to a tab.
            let mut lines: Vec<String> = yaml.lines().map(|s| s.to_string()).collect();
            if !lines.is_empty() {
                let idx = (*line_offset as usize) % lines.len();
                lines[idx] = lines[idx].replacen("    ", "\t", 1);
            }
            lines.join("\n") + "\n"
        }
        Footgun::MultiDocument => {
            format!("{yaml}\n---\nartifacts:\n  - id: REQ-999\n    type: requirement\n    title: Second doc\n")
        }
        Footgun::NullShorthandLink { variant } => {
            let value = match variant % 3 {
                0 => "null",
                1 => "~",
                _ => "\"\"",
            };
            // Overwrite the `target:` scalar with a null form.  The seed has
            // `target: REQ-000`; this exercises the phantom-link bug at
            // yaml_hir.rs:530.
            yaml.replace("target: REQ-000", &format!("target: {value}"))
        }
        Footgun::UnknownTopLevelKey { variant } => {
            let key = match variant % 3 {
                0 => "artifact:",    // singular typo
                1 => "Artifacts:",   // case
                _ => "artifcats:",   // misspelling
            };
            yaml.replacen("artifacts:", key, 1)
        }
        Footgun::AnchorCycle => {
            // Insert an anchor/alias cycle inside the fields: block.
            yaml.replace(
                "    fields:\n",
                "    fields:\n      cycle: &x\n        self: *x\n",
            )
        }
        Footgun::DeepNesting { depth } => {
            let d = (*depth % 40).max(2) as usize;
            let mut nested = String::from("[");
            for _ in 0..d {
                nested.push('[');
            }
            nested.push_str("inner");
            for _ in 0..d {
                nested.push(']');
            }
            nested.push(']');
            yaml.replace(
                "      priority: must\n",
                &format!("      priority: must\n      deep: {nested}\n"),
            )
        }
        Footgun::ControlCharInId { variant } => {
            let bad: &str = match variant % 3 {
                // NUL — should be rejected by any sane parser
                0 => "REQ-\u{0000}001",
                // Soft hyphen — visually invisible
                1 => "REQ-\u{00AD}001",
                // Trailing whitespace
                _ => "REQ-001 ",
            };
            yaml.replace("REQ-001", bad)
        }
    }
}

fn norway_variant(v: u8) -> &'static str {
    match v % 12 {
        0 => "NO",
        1 => "no",
        2 => "Off",
        3 => "off",
        4 => "yes",
        5 => "YES",
        6 => "true",
        7 => "TRUE",
        8 => "FALSE",
        9 => "~",
        10 => "null",
        _ => "NULL",
    }
}

fn pick_field(idx: u8) -> &'static str {
    match idx % 6 {
        0 => "id",
        1 => "title",
        2 => "status",
        3 => "target",
        4 => "priority",
        _ => "baseline",
    }
}

/// Replace the first occurrence of `<field>: <old>` with `<field>: <new>`.
/// Preserves indentation and trailing newline.
fn replace_field_value(yaml: &str, field: &str, new_value: &str) -> String {
    let mut out = String::with_capacity(yaml.len() + new_value.len());
    let mut replaced = false;
    for line in yaml.split_inclusive('\n') {
        if replaced {
            out.push_str(line);
            continue;
        }
        let trimmed = line.trim_start();
        if let Some(rest) = trimmed.strip_prefix(&format!("{field}:")) {
            let indent_len = line.len() - trimmed.len();
            let _ = rest; // unused; we replace whatever followed the colon
            out.push_str(&line[..indent_len]);
            out.push_str(field);
            out.push_str(": ");
            out.push_str(new_value);
            out.push('\n');
            replaced = true;
        } else {
            out.push_str(line);
        }
    }
    out
}
