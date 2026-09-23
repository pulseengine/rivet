// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
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

//! Differential gate for SCALAR STYLES: rivet's rowan HIR vs serde_yaml.
//!
//! `differential_yaml.rs` generates artifact STRUCTURE (flow and block
//! mappings) with plain values. This file holds the structure fixed and varies
//! how one value is written, which is where the rowan path had diverged
//! without anyone noticing.
//!
//! REQ-364: a single- or double-quoted scalar spanning lines was truncated to
//! `"alpha` or `'alpha` — opening quote kept, the rest dropped, no diagnostic.
//! PyYAML's `safe_dump` writes exactly that shape for long quoted strings, and
//! `stpa-yaml` sources load through rowan in production. This gate found it;
//! it failed on five of the eight multi-line styles surveyed below.
//!
//! serde_yaml is the oracle (a dev-dependency, independent of rivet's parser).
//! Where the test can know the intended value it also checks serde_yaml
//! against that, so a generator bug cannot pass as agreement.

use proptest::prelude::*;
use rivet_core::yaml_hir::extract_generic_artifacts;

/// The `tags: ['after']` line is deliberate: a quoted scan that ran away from
/// the description would close on its quote and swallow `status: draft`. With
/// nothing quoted after the value, a runaway scan finds no closing quote, falls
/// back, and could never turn this gate red.
fn artifact_yaml(description_value: &str) -> String {
    format!(
        "artifacts:\n  - id: REQ-001\n    type: requirement\n    title: t\n    description: {description_value}    status: draft\n    tags: ['after']\n"
    )
}

/// Parse with both paths and assert they agree on the description and that
/// neither lost the key that follows it.
fn assert_paths_agree(yaml: &str, context: &str) -> Result<String, TestCaseError> {
    let serde: rivet_yaml::Value = rivet_yaml::from_str(yaml).map_err(|e| {
        TestCaseError::fail(format!(
            "GENERATOR produced invalid YAML ({e}): {context} {yaml:?}"
        ))
    })?;
    let serde_desc = serde["artifacts"][0]["description"]
        .as_str()
        .ok_or_else(|| {
            TestCaseError::fail(format!("GENERATOR: description not a string: {yaml:?}"))
        })?
        .to_string();
    prop_assert_eq!(
        serde["artifacts"][0]["status"].as_str(),
        Some("draft"),
        "GENERATOR broke structure: {} {:?}",
        context,
        yaml
    );

    let hir = extract_generic_artifacts(yaml);
    prop_assert_eq!(
        hir.artifacts.len(),
        1,
        "rowan artifact count: {} {:?}",
        context,
        yaml
    );
    let artifact = &hir.artifacts[0].artifact;
    prop_assert_eq!(
        artifact.description.as_deref().unwrap_or_default(),
        serde_desc.as_str(),
        "DIVERGENCE: {} {:?}",
        context,
        yaml
    );
    prop_assert_eq!(
        artifact.status.as_deref(),
        Some("draft"),
        "rowan lost the next key: {} {:?}",
        context,
        yaml
    );
    Ok(serde_desc)
}

// ── Family 1: one-line scalars, every quoting style, adversarial content ─

#[derive(Debug, Clone, Copy)]
enum InlineStyle {
    Double,
    DoubleUnicodeEscapes,
    Single,
}

fn arb_inline_text() -> impl Strategy<Value = String> {
    prop::collection::vec(
        prop_oneof![
            8 => prop::char::range('a', 'z'),
            2 => Just(' '),
            1 => Just(':'),
            1 => Just('#'),
            1 => Just('\''),
            1 => Just('"'),
            1 => Just('\\'),
            1 => Just('\t'),
            1 => Just('é'),
            1 => Just('中'),
            1 => Just('🦀'),
            1 => Just('-'),
            1 => Just('{'),
            1 => Just('['),
        ],
        1..30,
    )
    .prop_map(|v| v.into_iter().collect())
}

fn encode_double(s: &str, unicode: bool) -> String {
    let mut out = String::from("\"");
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            '\n' => out.push_str("\\n"),
            '\t' => out.push_str("\\t"),
            c if unicode && !c.is_ascii() && (c as u32) <= 0xFFFF => {
                out.push_str(&format!("\\u{:04X}", c as u32));
            }
            c if unicode && !c.is_ascii() => out.push_str(&format!("\\U{:08X}", c as u32)),
            c => out.push(c),
        }
    }
    out.push('"');
    out
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(512))]

    #[test]
    fn one_line_quoted_scalars_agree(
        style in prop_oneof![Just(InlineStyle::Double), Just(InlineStyle::DoubleUnicodeEscapes), Just(InlineStyle::Single)],
        text in arb_inline_text(),
    ) {
        let rendered = match style {
            InlineStyle::Double => encode_double(&text, false),
            InlineStyle::DoubleUnicodeEscapes => encode_double(&text, true),
            InlineStyle::Single => format!("'{}'", text.replace('\'', "''")),
        };
        let yaml = artifact_yaml(&format!("{rendered}\n"));
        let decoded = assert_paths_agree(&yaml, &format!("{style:?}"))?;
        prop_assert_eq!(decoded, text, "ORACLE disagrees with the intended value");
    }
}

// ── Family 2: block scalars ─────────────────────────────────────────────

fn arb_block_lines() -> impl Strategy<Value = Vec<String>> {
    prop::collection::vec("[a-zA-Z0-9][a-zA-Z0-9 .:#'\"{}\\[\\]-]{0,20}", 1..4)
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(512))]

    #[test]
    fn literal_block_scalars_agree(strip in prop::bool::ANY, lines in arb_block_lines()) {
        let body: String = lines.iter().map(|l| format!("      {l}\n")).collect();
        let yaml = artifact_yaml(&format!("{}\n{body}", if strip { "|-" } else { "|" }));
        let decoded = assert_paths_agree(&yaml, if strip { "literal strip" } else { "literal clip" })?;
        let intended = if strip { lines.join("\n") } else { format!("{}\n", lines.join("\n")) };
        prop_assert_eq!(decoded, intended, "ORACLE disagrees with the intended value");
    }
}

// ── Family 3: quoted scalars spanning lines (REQ-364) ───────────────────

/// One continuation line of a multi-line quoted scalar.
#[derive(Debug, Clone)]
struct QuotedLine {
    words: Vec<&'static str>,
    /// Indentation beyond the opening line's (the rule needs at least 1).
    extra_indent: usize,
    /// Empty lines between the previous line and this one; each is `\n`.
    empty_lines_before: usize,
    /// White space left at the end of the PREVIOUS line (not content).
    trailing_ws_before: &'static str,
    /// End the previous line with an escaped break (double quotes only).
    escaped_break_before: bool,
}

const DOUBLE_WORDS: &[&str] = &[
    "alpha",
    "beta",
    "x:y",
    "#hash",
    "- dash",
    "\\\"q\\\"",
    "\\\\",
    "\\t",
    "é",
    "中",
    "a\\ ",
    "it's",
];
const SINGLE_WORDS: &[&str] = &[
    "alpha",
    "beta",
    "x:y",
    "#hash",
    "- dash",
    "it''s",
    "é",
    "中",
    "back\\slash",
    "\"dq\"",
];

fn arb_quoted_lines(double: bool) -> impl Strategy<Value = Vec<QuotedLine>> {
    let words = if double { DOUBLE_WORDS } else { SINGLE_WORDS };
    prop::collection::vec(
        (
            prop::collection::vec(prop::sample::select(words), 1..4),
            1usize..4,
            prop_oneof![6 => Just(0usize), 2 => Just(1usize), 1 => Just(2usize)],
            prop::sample::select(vec!["", "", " ", "  ", "\t"]),
            prop::bool::weighted(if double { 0.3 } else { 0.0 }),
        )
            .prop_map(
                |(
                    words,
                    extra_indent,
                    empty_lines_before,
                    trailing_ws_before,
                    escaped_break_before,
                )| {
                    QuotedLine {
                        words,
                        extra_indent,
                        empty_lines_before,
                        trailing_ws_before,
                        escaped_break_before,
                    }
                },
            ),
        2..5,
    )
}

fn render_quoted(double: bool, crlf: bool, lines: &[QuotedLine]) -> String {
    let nl = if crlf { "\r\n" } else { "\n" };
    let quote = if double { '"' } else { '\'' };
    // The value opens on the `    description:` line, indent 4.
    let mut out = String::new();
    out.push(quote);
    for (i, line) in lines.iter().enumerate() {
        if i > 0 {
            out.push_str(line.trailing_ws_before);
            if double && line.escaped_break_before {
                out.push('\\');
            }
            out.push_str(nl);
            for _ in 0..line.empty_lines_before {
                out.push_str(nl);
            }
            out.push_str(&" ".repeat(4 + line.extra_indent));
        }
        out.push_str(&line.words.join(" "));
    }
    out.push(quote);
    out.push_str(nl);
    out
}

proptest! {
    #![proptest_config(ProptestConfig::with_cases(1024))]

    #[test]
    fn multi_line_quoted_scalars_agree(
        // The vocabulary depends on the quote style (`back\slash` is only
        // valid in single quotes), so both come from one draw.
        (double, lines) in prop::bool::ANY.prop_flat_map(|d| (Just(d), arb_quoted_lines(d))),
        crlf in prop::bool::weighted(0.2),
    ) {
        let rendered = render_quoted(double, crlf, &lines);
        let mut yaml = artifact_yaml(&rendered);
        if crlf {
            yaml = yaml.replace("\r\n", "\n").replace('\n', "\r\n");
        }
        assert_paths_agree(&yaml, if double { "double multi-line" } else { "single multi-line" })?;
    }
}

// ── Family 4: quote characters in block bodies must not swallow keys ────

const PROSE_WORDS: &[&str] = &[
    "Rivet's",
    "don't",
    "\"unclosed",
    "'unclosed",
    "x: 'y",
    "k: \"v",
    "''",
    "\"\"",
    "plain",
    "a\\",
];

proptest! {
    #![proptest_config(ProptestConfig::with_cases(512))]

    /// The lexer is context-free and tokenizes block scalar bodies too, so a
    /// quote in prose is where a multi-line quoted scan could run away. The
    /// continuation rule must keep every body inside its block and the
    /// following key a key.
    #[test]
    fn quotes_in_block_bodies_never_swallow_the_next_key(
        header in prop::sample::select(vec!["|", "|-", ">", ">-"]),
        lines in prop::collection::vec(
            (prop::collection::vec(prop::sample::select(PROSE_WORDS), 1..4), 0usize..3),
            1..5,
        ),
    ) {
        // The first body line sets the block's indentation, so only later
        // lines may be more indented.
        let body: String = lines
            .iter()
            .enumerate()
            .map(|(i, (words, extra))| {
                let extra = if i == 0 { 0 } else { *extra };
                format!("{}{}\n", " ".repeat(6 + extra), words.join(" "))
            })
            .collect();
        let yaml = artifact_yaml(&format!("{header}\n{body}"));
        assert_paths_agree(&yaml, &format!("block {header}"))?;
    }
}

// ── Named survey: each multi-line style, deterministic ──────────────────

#[test]
fn every_multi_line_style_agrees() {
    let cases: &[(&str, &str)] = &[
        ("double folded", "\"alpha\n      beta gamma\"\n"),
        ("double escaped break", "\"alpha\\\n      beta gamma\"\n"),
        ("double empty line", "\"alpha\n\n      beta gamma\"\n"),
        ("single folded", "'alpha\n      beta gamma'\n"),
        ("single empty line", "'alpha\n\n      beta gamma'\n"),
        ("literal keep", "|+\n      alpha\n      beta gamma\n\n"),
        (
            "folded more-indented",
            ">\n      alpha\n        beta gamma\n      alpha\n",
        ),
        (
            "literal indentation indicator",
            "|2\n        alpha\n      beta gamma\n",
        ),
        (
            "PyYAML safe_dump wrap",
            "'Controller issues: a ''quoted'' brake command with a colon: and a\n      long explanation that keeps going well past eighty columns so the emitter wraps\n      it'\n",
        ),
    ];
    let mut differ = Vec::new();
    for (name, rendered) in cases {
        let yaml = artifact_yaml(rendered);
        if let Err(e) = assert_paths_agree(&yaml, name) {
            differ.push(format!("{name}: {e}"));
        }
    }
    assert!(
        differ.is_empty(),
        "{} style(s) diverge:\n{}",
        differ.len(),
        differ.join("\n")
    );
}
