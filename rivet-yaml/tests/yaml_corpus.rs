// SAFETY-REVIEW (SCRC Phase 1, DD-058): test code; a failure should panic
// with a clear message, so unwrap/expect are the intended style here.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::arithmetic_side_effects
)]

//! rivet-yaml over this repository's own YAML (REQ-346).
//!
//! Before serde_yaml was removed, a differential test compared rivet's parser
//! and emitter with serde_yaml's on every YAML file and fenced ```yaml block in
//! the repository, and they agreed byte for byte (commit "drop serde_yaml",
//! REQ-346 S6). With the oracle gone this file keeps what needs no oracle:
//! every document that parses round-trips through the emitter unchanged, and
//! the emitter still writes the strings chosen for its style rules exactly as
//! serde_yaml did (`golden/emitter_strings.txt`, captured from serde_yaml).

use std::path::{Path, PathBuf};

fn corpus() -> Vec<PathBuf> {
    let root = Path::new(env!("CARGO_MANIFEST_DIR")).parent().unwrap();
    let mut out = Vec::new();
    let mut stack = vec![root.to_path_buf()];
    while let Some(dir) = stack.pop() {
        for entry in std::fs::read_dir(&dir).unwrap().flatten() {
            let path = entry.path();
            let name = entry.file_name().to_string_lossy().to_string();
            if path.is_dir() {
                if !(name.starts_with('.') && name != ".github")
                    && !["target", "node_modules", "corpus"].contains(&name.as_str())
                {
                    stack.push(path);
                }
            } else if name.ends_with(".yaml") || name.ends_with(".yml") || name.ends_with(".md") {
                out.push(path);
            }
        }
    }
    out.sort();
    out
}

/// Every YAML file, and every fenced ```yaml block in the docs.
fn documents() -> Vec<(String, String)> {
    let mut docs = Vec::new();
    for file in corpus() {
        let src = std::fs::read_to_string(&file).unwrap();
        if file.extension().is_some_and(|e| e == "md") {
            for (i, block) in yaml_blocks(&src).into_iter().enumerate() {
                docs.push((format!("{} (yaml block {})", file.display(), i + 1), block));
            }
        } else {
            docs.push((file.display().to_string(), src));
        }
    }
    docs
}

fn yaml_blocks(markdown: &str) -> Vec<String> {
    let mut blocks = Vec::new();
    let mut current: Option<String> = None;
    for line in markdown.lines() {
        let trimmed = line.trim_start();
        match &mut current {
            None if trimmed == "```yaml" || trimmed == "```yml" => current = Some(String::new()),
            Some(block) if trimmed.starts_with("```") => {
                blocks.push(std::mem::take(block));
                current = None;
            }
            Some(block) => {
                block.push_str(line);
                block.push('\n');
            }
            None => {}
        }
    }
    blocks
}

/// Parse → emit → parse gives back the same value, and emitting that again
/// gives the same text.
#[test]
fn every_corpus_document_round_trips_through_the_emitter() {
    let docs = documents();
    assert!(
        docs.len() > 200,
        "corpus walk found only {} documents",
        docs.len()
    );
    let mut parsed = 0usize;
    let mut failures = Vec::new();
    for (name, src) in &docs {
        let Ok(value) = rivet_yaml::from_str::<rivet_yaml::Value>(src) else {
            continue;
        };
        parsed += 1;
        let text = rivet_yaml::to_string(&value).unwrap();
        match rivet_yaml::from_str::<rivet_yaml::Value>(&text) {
            Ok(again) if again == value => {
                let text_again = rivet_yaml::to_string(&again).unwrap();
                if text_again != text {
                    failures.push(format!("{name}: second emit differs"));
                }
            }
            Ok(_) => failures.push(format!("{name}: re-parsed value differs")),
            Err(e) => failures.push(format!("{name}: emitted text does not parse: {e}")),
        }
    }
    assert!(parsed > 200, "only {parsed} documents parsed");
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

/// The emitter writes each string exactly as serde_yaml did.
#[test]
fn emitter_matches_the_serde_yaml_golden() {
    let golden = include_str!("golden/emitter_strings.txt");
    let mut lines = golden.lines();
    let mut failures = Vec::new();
    let mut checked = 0usize;
    for &s in TRICKY {
        for value in shapes(s) {
            let line = lines.next().expect("golden file is shorter than the cases");
            let (key, expected) = line.split_once('\t').expect("golden line has a tab");
            assert_eq!(key, format!("{value:?}"), "golden file is out of order");
            let ours = format!("{:?}", rivet_yaml::to_string(&value).unwrap());
            checked += 1;
            if ours != expected {
                failures.push(format!("{key}\n  golden: {expected}\n  owned:  {ours}"));
            }
        }
    }
    assert!(
        lines.next().is_none(),
        "golden file has more lines than cases"
    );
    assert_eq!(checked, TRICKY.len() * 3);
    assert!(failures.is_empty(), "{}", failures.join("\n"));
}

/// Strings chosen for the scalar-style rules: indicators, quoting triggers,
/// type-lookalikes, white space, line breaks and non-printable characters.
const TRICKY: &[&str] = &[
    "",
    " ",
    "a",
    "a b",
    " lead",
    "trail ",
    "1",
    "01",
    "-1",
    "1.5",
    "1e3",
    ".inf",
    "true",
    "True",
    "null",
    "~",
    "yes",
    "no",
    "0x1F",
    "0o17",
    "- x",
    "-x",
    "? x",
    ": x",
    "a: b",
    "a:b",
    "a #b",
    "a#b",
    "#x",
    "[x]",
    "x]",
    "{x}",
    "&a",
    "*a",
    "!t",
    "|x",
    ">x",
    "'q",
    "\"q",
    "%x",
    "@x",
    "`x",
    "---",
    "--- x",
    "...",
    "it's",
    "say \"hi\"",
    "back\\slash",
    "tab\there",
    "nul\0x",
    "bell\u{7}",
    "esc\u{1b}",
    "nel\u{85}x",
    "ls\u{2028}x",
    "nbsp\u{a0}x",
    "bom\u{feff}x",
    "é ü ∑ 😀",
    "line1\nline2",
    "line\n",
    "line\n\n",
    "\nlead",
    " lead\nx",
    "trail \nx",
    "x \ny",
    "x\n y",
    "a\r\nb",
    "a very long key that goes on and on and on and on and on and on and on and on and on and on and on and on and on and on and on",
];

fn shapes(s: &str) -> [rivet_yaml::Value; 3] {
    let mut map = rivet_yaml::Mapping::new();
    map.insert(
        rivet_yaml::Value::String(s.into()),
        rivet_yaml::Value::String(s.into()),
    );
    [
        rivet_yaml::Value::String(s.into()),
        rivet_yaml::Value::Sequence(vec![rivet_yaml::Value::String(s.into())]),
        rivet_yaml::Value::Mapping(map),
    ]
}
