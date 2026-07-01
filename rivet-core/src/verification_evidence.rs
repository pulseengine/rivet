//! Named-test-exists evidence check (#556 / REQ-236 part 2).
//!
//! A common verification shape ties a requirement clause to a specific test:
//! `fields.steps[].run: "cargo test -p X some_test_name"`. But `cargo test -p X
//! typo` **exits 0 with "0 passed"** when the filter matches nothing — so a
//! renamed / removed / typo'd test name silently keeps the requirement
//! `verified`. This module extracts the named test filter from such a command
//! and checks that a matching test actually exists in the project's sources, so
//! the evidence can't rot unnoticed.
//!
//! Scope: cargo/Rust (the reported case). The command parser and test-name
//! extractor are pure + unit-tested here; the file scanning + artifact
//! iteration live in the CLI (`rivet check verification-evidence`).

// SAFETY-REVIEW (SCRC Phase 1, DD-058): file-scope allow, see sibling modules.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::panic,
    clippy::print_stdout,
    clippy::print_stderr
)]

use std::collections::BTreeSet;

/// Extract the test-name filter from a `run` command when it is a `cargo test`
/// invocation that names a specific filter, e.g.:
///
/// - `cargo test -p relay-hal some_test` → `Some("some_test")`
/// - `cargo test --test integration my_case` → `Some("my_case")`
/// - `cargo test -p relay-hal` (no filter — runs the whole crate) → `None`
/// - `cargo nextest run -p x foo` → `Some("foo")`
/// - `pytest -k something` / non-cargo commands → `None` (out of scope for now)
///
/// The filter is cargo's positional argument: the first bare token after the
/// `test`/`run` subcommand that is not a flag and not the value of a
/// value-taking flag (`-p`, `--package`, `--test`, `--bin`, `--example`,
/// `--features`, `--manifest-path`, `-j`, ...). A `--` separator ends cargo's
/// own args (everything after is passed to the test binary), so a filter after
/// `--` (`cargo test -- --exact name`) is handled too.
pub fn parse_cargo_test_filter(command: &str) -> Option<String> {
    let tokens: Vec<&str> = command.split_whitespace().collect();
    // Must be a cargo test / cargo nextest run invocation.
    let mut i = tokens.iter().position(|t| *t == "cargo")?;
    i += 1;
    // Optional `+toolchain`.
    if tokens.get(i).is_some_and(|t| t.starts_with('+')) {
        i += 1;
    }
    match tokens.get(i).copied() {
        Some("test") => i += 1,
        Some("nextest") => {
            i += 1;
            if tokens.get(i).copied() != Some("run") {
                return None;
            }
            i += 1;
        }
        _ => return None,
    }

    // Value-taking cargo flags whose following token is a VALUE, not the filter.
    const VALUE_FLAGS: &[&str] = &[
        "-p",
        "--package",
        "--exclude",
        "--test",
        "--bin",
        "--example",
        "--bench",
        "--features",
        "--manifest-path",
        "--target",
        "--target-dir",
        "--profile",
        "-j",
        "--jobs",
        "--color",
        "-F",
    ];

    let mut past_dashdash = false;
    while i < tokens.len() {
        let tok = tokens[i];
        if !past_dashdash && tok == "--" {
            past_dashdash = true;
            i += 1;
            continue;
        }
        if tok.starts_with('-') {
            // A `--flag=value` carries its own value; a bare value-flag consumes
            // the next token. Test-binary flags after `--` (e.g. `--exact`,
            // `--nocapture`) are not filters and are skipped.
            if !past_dashdash && VALUE_FLAGS.contains(&tok) && !tok.contains('=') {
                i += 1; // skip the value
            }
            i += 1;
            continue;
        }
        // First bare positional token = the filter.
        return Some(tok.to_string());
    }
    None
}

/// Extract candidate test names from Rust source: every `fn <name>`. This
/// over-approximates (it does not require `#[test]`), which is the SAFE
/// direction for a drift check — we only error when a named filter matches NO
/// function at all, so including non-test fns can only *suppress* a false
/// error, never invent one.
pub fn extract_rust_fn_names(source: &str) -> BTreeSet<String> {
    let mut names = BTreeSet::new();
    let bytes = source.as_bytes();
    let hay = source;
    let mut search_from = 0;
    while let Some(rel) = hay[search_from..].find("fn ") {
        let pos = search_from + rel;
        // `fn` must be a word boundary (preceded by start/whitespace/punct).
        let ok_before = pos == 0
            || !bytes
                .get(pos - 1)
                .is_some_and(|b| b.is_ascii_alphanumeric() || *b == b'_');
        search_from = pos + 3;
        if !ok_before {
            continue;
        }
        let rest = &source[pos + 3..];
        let name: String = rest
            .chars()
            .skip_while(|c| c.is_whitespace())
            .take_while(|c| c.is_alphanumeric() || *c == '_')
            .collect();
        if !name.is_empty() {
            names.insert(name);
        }
    }
    names
}

/// True when cargo's substring filter would match at least one of the known
/// test/function names. cargo matches a filter as a SUBSTRING of the full test
/// path, so `some_test` matches `mod::some_test_case`.
pub fn filter_matches_any(filter: &str, names: &BTreeSet<String>) -> bool {
    names.iter().any(|n| n.contains(filter))
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parses_the_positional_filter_past_value_flags() {
        assert_eq!(
            parse_cargo_test_filter("cargo test -p relay-hal some_test"),
            Some("some_test".into())
        );
        assert_eq!(
            parse_cargo_test_filter("cargo test --test integration my_case"),
            Some("my_case".into())
        );
        assert_eq!(
            parse_cargo_test_filter("cargo nextest run -p x foo"),
            Some("foo".into())
        );
        assert_eq!(
            parse_cargo_test_filter("cargo test --features a,b -p x the_test"),
            Some("the_test".into())
        );
        // filter after `--` (cargo passes it to the test binary)
        assert_eq!(
            parse_cargo_test_filter("cargo test -p x -- --exact modx::named"),
            Some("modx::named".into())
        );
    }

    #[test]
    fn no_filter_or_non_cargo_returns_none() {
        assert_eq!(parse_cargo_test_filter("cargo test -p relay-hal"), None);
        assert_eq!(parse_cargo_test_filter("cargo test"), None);
        assert_eq!(parse_cargo_test_filter("pytest -k something"), None);
        assert_eq!(parse_cargo_test_filter("make test"), None);
        assert_eq!(parse_cargo_test_filter("cargo build"), None);
    }

    #[test]
    fn extracts_fn_names_and_matches_as_substring() {
        let src = "#[test]\nfn my_case() {}\nasync fn helper(){}\npub fn exported() {}";
        let names = extract_rust_fn_names(src);
        assert!(names.contains("my_case"));
        assert!(names.contains("helper"));
        assert!(names.contains("exported"));
        // cargo substring semantics: a filter that is a substring matches.
        assert!(filter_matches_any("my_case", &names));
        assert!(filter_matches_any("case", &names));
        assert!(!filter_matches_any("nonexistent_test", &names));
    }

    #[test]
    fn fn_word_boundary_is_respected() {
        // `refn` / `fnord` must not be read as a `fn` keyword.
        let names = extract_rust_fn_names("let refn = 1; struct fnord;");
        assert!(names.is_empty());
    }
}
