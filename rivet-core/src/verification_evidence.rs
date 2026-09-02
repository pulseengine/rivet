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
    let tokens = shell_tokens(command);
    // Must be a cargo test / cargo nextest run invocation.
    let mut i = tokens.iter().position(|t| t == "cargo")?;
    i += 1;
    // Optional `+toolchain`.
    if tokens.get(i).is_some_and(|t| t.starts_with('+')) {
        i += 1;
    }
    match tokens.get(i).map(String::as_str) {
        Some("test") => i += 1,
        Some("nextest") => {
            i += 1;
            if tokens.get(i).map(String::as_str) != Some("run") {
                return None;
            }
            i += 1;
        }
        _ => return None,
    }

    let mut past_dashdash = false;
    while i < tokens.len() {
        let tok = tokens[i].as_str();
        if !past_dashdash && tok == "--" {
            past_dashdash = true;
            i += 1;
            continue;
        }
        if tok.starts_with('-') {
            // A `--flag=value` carries its own value; a bare value-flag consumes
            // the next token. Test-binary flags after `--` (e.g. `--exact`,
            // `--nocapture`) are not filters and are skipped. `-E` /
            // `--filter-expr` carry a nextest FILTERSET (a test-path/regex
            // expression) — consumed here so it can never surface as a bogus
            // positional substring filter (see `uses_unsupported_nextest_filterset`).
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

/// Value-taking cargo/nextest flags whose following token is a VALUE, not the
/// positional filter. `-E` / `--filter-expr` are nextest filterset flags.
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
    "-E",
    "--filter-expr",
];

/// Split a stored command string into tokens, treating single/double quoted spans
/// as one token with the surrounding quotes removed. Not a full shell parser — it
/// only groups quoted runs so a quoted filterset (`-E 'test(a) | test(b)'`) stays
/// one argument and a positional filter copied verbatim from a shell (`'my_case'`)
/// loses its quotes instead of substring-matching against them.
fn shell_tokens(command: &str) -> Vec<String> {
    let mut tokens = Vec::new();
    let mut cur = String::new();
    let mut in_tok = false;
    let mut quote: Option<char> = None;
    for c in command.chars() {
        match quote {
            Some(q) => {
                if c == q {
                    quote = None; // closing quote; the token continues
                } else {
                    cur.push(c);
                }
            }
            None => {
                if c == '\'' || c == '"' {
                    quote = Some(c);
                    in_tok = true;
                } else if c.is_whitespace() {
                    if in_tok {
                        tokens.push(std::mem::take(&mut cur));
                        in_tok = false;
                    }
                } else {
                    cur.push(c);
                    in_tok = true;
                }
            }
        }
    }
    if in_tok {
        tokens.push(cur);
    }
    tokens
}

/// Extract candidate test names from Rust source: every `fn <name>`. This
/// over-approximates (it does not require `#[test]`), which is the SAFE
/// direction for a drift check — we only error when a named filter matches NO
/// function at all, so including non-test fns can only *suppress* a false
/// error, never invent one.
/// Extract names of functions that can actually serve as VERIFICATION
/// EVIDENCE: annotated with a `#[test]`-family attribute AND carrying a
/// non-empty body.
///
/// This deliberately reverses the over-approximation
/// [`extract_rust_fn_names`] documents as "the SAFE direction". It is not the
/// safe direction. That reasoning — including non-test fns can only suppress a
/// false error, never invent one — is exactly what made the check satisfiable
/// by the stub it exists to catch: an empty `#[test] fn <name>() {}` dropped
/// into `tests/` made a real finding disappear (#807 Defect 2), and a plain
/// helper sharing the name did the same. A gate that can only under-report is
/// not a conservative gate, it is a gate you cannot fail. See REQ-306.
///
/// Heuristic, and honestly so: it reads attributes in the contiguous block
/// above the `fn` and matches any attribute path ending in `test`, so
/// `#[test]`, `#[tokio::test]` and `#[rstest]` all qualify. A body is "empty"
/// when it contains nothing but whitespace and comments. Brace matching does
/// not track string or char literals, so a `{` inside a string in an otherwise
/// empty body reads as content — that direction is the safe one here, since it
/// can only ACCEPT a test, never reject a real one.
pub fn extract_test_fn_names(source: &str) -> BTreeSet<String> {
    let mut names = BTreeSet::new();
    let lines: Vec<&str> = source.lines().collect();

    for (idx, line) in lines.iter().enumerate() {
        let trimmed = line.trim_start();
        // Find `fn <name>` at the start of a (possibly `pub`/`async`) item.
        let Some(rel) = trimmed.find("fn ") else {
            continue;
        };
        let before = &trimmed[..rel];
        if !before
            .split_whitespace()
            .all(|w| matches!(w, "pub" | "async" | "const" | "unsafe" | "extern"))
        {
            continue;
        }
        let name: String = trimmed[rel + 3..]
            .chars()
            .skip_while(|c| c.is_whitespace())
            .take_while(|c| c.is_alphanumeric() || *c == '_')
            .collect();
        if name.is_empty() {
            continue;
        }

        // Walk up over the contiguous attribute / doc-comment block.
        let mut has_test_attr = false;
        let mut k = idx;
        while k > 0 {
            let prev = lines[k - 1].trim();
            if prev.starts_with("#[") {
                let inner = prev.trim_start_matches("#[").trim_end_matches(']');
                if inner
                    .split(['(', ','])
                    .next()
                    .unwrap_or("")
                    .trim()
                    .rsplit("::")
                    .next()
                    .unwrap_or("")
                    .trim()
                    == "test"
                {
                    has_test_attr = true;
                }
                k -= 1;
            } else if prev.starts_with("//") || prev.is_empty() {
                k -= 1;
            } else {
                break;
            }
        }
        if !has_test_attr {
            continue;
        }

        if body_has_content(&lines, idx) {
            names.insert(name);
        }
    }
    names
}

/// True when the `{ ... }` body starting at or after `start_line` holds
/// anything but whitespace and comments.
fn body_has_content(lines: &[&str], start_line: usize) -> bool {
    let mut depth = 0usize;
    let mut started = false;
    let mut content = String::new();
    for line in lines.iter().skip(start_line) {
        for ch in line.chars() {
            match ch {
                '{' => {
                    if started {
                        content.push(ch);
                    }
                    depth += 1;
                    started = true;
                }
                '}' => {
                    depth = depth.saturating_sub(1);
                    if depth == 0 && started {
                        let stripped: String = content
                            .lines()
                            .map(|l| l.split("//").next().unwrap_or("").trim())
                            .collect();
                        return !stripped.is_empty();
                    }
                    content.push(ch);
                }
                _ => {
                    if started {
                        content.push(ch);
                    }
                }
            }
        }
        if started {
            content.push('\n');
        }
    }
    // Unterminated body: treat as content rather than reject a real test.
    started
}

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

/// Extract the value of `--manifest-path` from a `cargo test` / `cargo nextest
/// run` command, so the caller can widen the scan for that step's evidence
/// check to include the tests reachable from the named crate. Handles both the
/// bare (`--manifest-path path/to/Cargo.toml`) and equals
/// (`--manifest-path=path/to/Cargo.toml`) forms.
///
/// Returns `None` for non-cargo commands and when the flag is absent. Only
/// considers tokens before `--` (a test-binary arg after `--` cannot be a
/// cargo flag).
///
/// This is the counterpart to [`parse_cargo_test_filter`]: without it, a step
/// like `cargo test --manifest-path compat/x/Cargo.toml the_test` false-fails
/// against a default scan of `./src` + `./tests`, because `--manifest-path` is
/// parsed only to prevent the value being mistaken for the filter — then
/// discarded. The flag already names the directory that should be scanned.
pub fn parse_cargo_manifest_path(command: &str) -> Option<String> {
    let tokens = shell_tokens(command);
    let mut i = tokens.iter().position(|t| t == "cargo")? + 1;
    // Optional `+toolchain`.
    if tokens.get(i).is_some_and(|t| t.starts_with('+')) {
        i += 1;
    }
    // Validate the subcommand up front. Anything other than `cargo test` /
    // `cargo nextest run` is not a shape this checker cares about, and its
    // `--manifest-path` (if any) must not leak through. No `i += 1` is done
    // after validation on purpose — the loop's default arm skips those
    // subcommand tokens naturally, which keeps the code from carrying
    // redundant increments that are equivalent to no-ops.
    match (
        tokens.get(i).map(String::as_str),
        tokens.get(i + 1).map(String::as_str),
    ) {
        (Some("test"), _) => {}
        (Some("nextest"), Some("run")) => {}
        _ => return None,
    }
    while i < tokens.len() {
        let tok = tokens[i].as_str();
        if tok == "--" {
            break;
        }
        if let Some(v) = tok.strip_prefix("--manifest-path=") {
            return Some(v.to_string());
        }
        if tok == "--manifest-path" {
            return tokens.get(i + 1).cloned();
        }
        i += 1;
    }
    None
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
    fn nextest_filterset_is_not_mistaken_for_a_positional_filter() {
        // #REQ-280 regression: a nextest `-E` filterset expression addresses full
        // test PATHS / regexes, not the leaf-`fn`-name universe this checker knows.
        // It must NOT leak through as a bogus positional substring filter (which
        // then substring-matches nothing and false-errors "test does not exist").
        assert_eq!(
            parse_cargo_test_filter("cargo nextest run -p linc-nm --lib -E 'test(/message::/)'"),
            None
        );
        assert_eq!(
            parse_cargo_test_filter("cargo nextest run -p x --filter-expr 'test(a) | test(b)'"),
            None
        );
        // A plain positional filter on nextest is still extracted normally
        // (only the `-E`/`--filter-expr` value is consumed, never leaked).
        assert_eq!(
            parse_cargo_test_filter("cargo nextest run -p x foo"),
            Some("foo".into())
        );
    }

    #[test]
    fn surrounding_quotes_are_stripped_from_a_positional_filter() {
        // #REQ-280: a stored command copied from a shell keeps literal quotes;
        // they must not become part of the substring filter.
        assert_eq!(
            parse_cargo_test_filter("cargo test -p x 'my_case'"),
            Some("my_case".into())
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

    /// An empty `#[test]` body is not evidence — it is the stub the check
    /// exists to catch, offered as its own proof (#807 Defect 2 / REQ-306).
    ///
    /// Lives here rather than only in the CLI integration test because the
    /// mutation gate runs `-- --lib` and cannot see `tests/*.rs`.
    #[test]
    fn test_fn_names_reject_hollow_and_non_test() {
        let src = "\
#[test]
fn genuine() { assert!(true); }

#[test]
fn hollow() {}

#[test]
fn only_comments() {
    // nothing but a comment
}

fn helper_not_a_test() { let _ = 1; }

#[tokio::test]
async fn async_flavoured() { let _ = 1; }
";
        let names = extract_test_fn_names(src);
        assert!(names.contains("genuine"), "got {names:?}");
        assert!(
            names.contains("async_flavoured"),
            "a #[tokio::test] is still a test; got {names:?}"
        );
        assert!(
            !names.contains("hollow"),
            "empty body is not evidence: {names:?}"
        );
        assert!(
            !names.contains("only_comments"),
            "a comment-only body is not evidence: {names:?}"
        );
        assert!(
            !names.contains("helper_not_a_test"),
            "a non-test fn is not evidence: {names:?}"
        );
        // Exactly the two real tests, so a mutant that widens acceptance shows.
        assert_eq!(names.len(), 2, "got {names:?}");
    }

    /// The old extractor keeps its over-approximating contract; only the
    /// evidence path moved. Pins that the two really do differ, so a mutant
    /// collapsing one into the other is visible.
    #[test]
    fn rust_fn_names_still_over_approximates() {
        let src = "#[test]\nfn hollow() {}\nfn helper() { let _ = 1; }\n";
        let all = extract_rust_fn_names(src);
        assert!(
            all.contains("hollow") && all.contains("helper"),
            "got {all:?}"
        );
        assert!(extract_test_fn_names(src).is_empty());
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

    #[test]
    fn parses_manifest_path_in_both_bare_and_equals_forms() {
        // #807 Defect 1: `--manifest-path` was parsed only to keep its value
        // from being read as the filter; the value itself was discarded, so
        // the scan never learned about the nested crate.
        assert_eq!(
            parse_cargo_manifest_path("cargo test --manifest-path compat/x/Cargo.toml the_test"),
            Some("compat/x/Cargo.toml".into())
        );
        assert_eq!(
            parse_cargo_manifest_path("cargo test --manifest-path=compat/x/Cargo.toml the_test"),
            Some("compat/x/Cargo.toml".into())
        );
        // Nextest and `+toolchain` preambles both work.
        assert_eq!(
            parse_cargo_manifest_path(
                "cargo nextest run --manifest-path compat/x/Cargo.toml the_test"
            ),
            Some("compat/x/Cargo.toml".into())
        );
        assert_eq!(
            parse_cargo_manifest_path(
                "cargo +nightly test --manifest-path compat/x/Cargo.toml the_test"
            ),
            Some("compat/x/Cargo.toml".into())
        );
    }

    #[test]
    fn manifest_path_absent_or_non_cargo_returns_none() {
        assert_eq!(
            parse_cargo_manifest_path("cargo test -p relay-hal the_test"),
            None
        );
        assert_eq!(parse_cargo_manifest_path("cargo test"), None);
        assert_eq!(parse_cargo_manifest_path("cargo build"), None);
        assert_eq!(parse_cargo_manifest_path("pytest -k something"), None);
        // A test-binary flag after `--` is NOT a cargo flag, so a
        // `--manifest-path` shape appearing there (contrived) must not leak.
        assert_eq!(
            parse_cargo_manifest_path("cargo test -p x -- --manifest-path bogus"),
            None
        );
    }

    #[test]
    fn manifest_path_from_non_test_subcommand_is_not_extracted() {
        // The checker is only meaningful for `cargo test` / `cargo nextest
        // run`. A `cargo build --manifest-path X` step is not a
        // named-test-exists check and its manifest-path must not surface as
        // if it were, so it is not our --scan responsibility to widen.
        // Also locks in the boundary that any positional shift on the
        // subcommand-validation step would let this leak.
        assert_eq!(
            parse_cargo_manifest_path("cargo build --manifest-path compat/x/Cargo.toml"),
            None
        );
        assert_eq!(
            parse_cargo_manifest_path("cargo check --manifest-path compat/x/Cargo.toml"),
            None
        );
        assert_eq!(
            parse_cargo_manifest_path("cargo run --manifest-path compat/x/Cargo.toml"),
            None
        );
    }

    #[test]
    fn nextest_without_run_subcommand_is_rejected() {
        // `cargo nextest` accepts other subcommands (`list`, `show-config`,
        // ...); only `nextest run` executes tests. A `--manifest-path` on
        // the wrong nextest subcommand must not surface either.
        assert_eq!(
            parse_cargo_manifest_path("cargo nextest list --manifest-path compat/x/Cargo.toml"),
            None
        );
        assert_eq!(
            parse_cargo_manifest_path(
                "cargo nextest show-config --manifest-path compat/x/Cargo.toml"
            ),
            None
        );
        // Boundary: nextest with NO further subcommand also rejects.
        assert_eq!(
            parse_cargo_manifest_path("cargo nextest --manifest-path compat/x/Cargo.toml"),
            None
        );
    }
}
