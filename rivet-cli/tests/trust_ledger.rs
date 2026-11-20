// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code; a failure
// should panic with a clear message.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::panic,
    clippy::print_stdout,
    clippy::print_stderr
)]

//! `rivet check trust-ledger` (REQ-421): the ledger check fails on an
//! escape the ledger lacks, on a stale row of a scanned kind, on a ledger
//! that grew since `--base`, and on a kernel axiom the ledger lacks; rows
//! of kinds another repo's detector writes are carried, not compared.
//! Each test builds a throwaway git repository.

use std::path::{Path, PathBuf};
use std::process::{Command, Output};

use serde_json::Value;

fn rivet_bin() -> PathBuf {
    PathBuf::from(env!("CARGO_BIN_EXE_rivet"))
}

fn git(dir: &Path, args: &[&str]) {
    let out = Command::new("git")
        .args([
            "-c",
            "user.name=rivet-test",
            "-c",
            "user.email=rivet-test@example.invalid",
            "-c",
            "commit.gpgsign=false",
            "-c",
            "core.hooksPath=/dev/null",
        ])
        .args(args)
        .current_dir(dir)
        .output()
        .expect("run git");
    assert!(
        out.status.success(),
        "git {args:?} failed: {}",
        String::from_utf8_lossy(&out.stderr)
    );
}

// Built with concat! so this test file itself holds no scannable escape.
const ASSUME: &str = concat!("kani", "::assume(");
const HEADER: &str = "# section\tfile\tkind\tname\n";

fn project(src: &str, ledger: &str) -> tempfile::TempDir {
    let dir = tempfile::tempdir().unwrap();
    let p = dir.path();
    std::fs::create_dir_all(p.join("src")).unwrap();
    std::fs::create_dir_all(p.join("proofs")).unwrap();
    std::fs::write(p.join("src/harness.rs"), src).unwrap();
    std::fs::write(
        p.join("proofs/trust-ledger.tsv"),
        format!("{HEADER}{ledger}"),
    )
    .unwrap();
    git(p, &["init", "-q", "-b", "main"]);
    git(p, &["add", "."]);
    git(p, &["commit", "-q", "-m", "base"]);
    dir
}

fn run(dir: &Path, extra: &[&str]) -> Output {
    Command::new(rivet_bin())
        .arg("-p")
        .arg(dir)
        .args(["check", "trust-ledger"])
        .args(extra)
        .output()
        .expect("run rivet")
}

fn json(dir: &Path, extra: &[&str]) -> (Option<i32>, Value) {
    let mut args = vec!["--format", "json"];
    args.extend_from_slice(extra);
    let out = run(dir, &args);
    let v: Value = serde_json::from_slice(&out.stdout).unwrap_or_else(|e| {
        panic!(
            "not JSON ({e}): stdout={} stderr={}",
            String::from_utf8_lossy(&out.stdout),
            String::from_utf8_lossy(&out.stderr)
        )
    });
    (out.status.code(), v)
}

fn harness(n: usize) -> String {
    let calls: String = (0..n).map(|i| format!("{ASSUME}x > {i}); ")).collect();
    format!("fn h() {{ {calls}}}\n")
}

const ROW: &str = "source\tsrc/harness.rs\tkani-assume\th\n";

#[test]
fn a_ledger_that_lists_every_escape_passes_with_counts_by_kind() {
    let dir = project(&harness(2), &ROW.repeat(2));
    let (code, v) = json(dir.path(), &[]);
    assert_eq!(code, Some(0), "{v}");
    assert_eq!(v["pass"], Value::Bool(true));
    assert_eq!(v["found_by_kind"]["source/kani-assume"], 2);
    assert_eq!(v["source"]["found"], 2);
    assert_eq!(v["source"]["in_ledger"], 2);
}

#[test]
fn an_escape_the_ledger_lacks_fails_and_is_named() {
    let dir = project(&harness(2), ROW);
    let out = run(dir.path(), &[]);
    assert_eq!(out.status.code(), Some(1));
    let text = String::from_utf8_lossy(&out.stdout);
    assert!(
        text.contains("error: trust escape not in proofs/trust-ledger.tsv: source\tsrc/harness.rs\tkani-assume\th"),
        "{text}"
    );
    assert!(text.contains("1 new, 0 stale"), "{text}");
    assert!(text.ends_with("trust-ledger: FAIL\n"), "{text}");
}

#[test]
fn a_stale_row_of_a_scanned_kind_fails() {
    let dir = project(&harness(1), &ROW.repeat(2));
    let (code, v) = json(dir.path(), &[]);
    assert_eq!(code, Some(1), "{v}");
    assert_eq!(v["source"]["gone"].as_array().unwrap().len(), 1);
    assert_eq!(v["source"]["new"].as_array().unwrap().len(), 0);
}

#[test]
fn rows_of_another_repos_kinds_are_carried_not_compared() {
    let ledger = format!("{ROW}source\tsrc/harness.rs\tkani-unwind=4\th\n");
    let dir = project(&harness(1), &ledger);
    let (code, v) = json(dir.path(), &[]);
    assert_eq!(code, Some(0), "{v}");
    assert_eq!(v["source"]["foreign"], 1);
    assert_eq!(v["ledger_by_kind"]["source/kani-unwind=4"], 1);
}

#[test]
fn base_fails_when_the_ledger_grew_and_passes_when_it_shrank() {
    let dir = project(&harness(1), ROW);
    let p = dir.path();
    // Grow: one more escape, listed, so only --base can catch it.
    std::fs::write(p.join("src/harness.rs"), harness(2)).unwrap();
    std::fs::write(
        p.join("proofs/trust-ledger.tsv"),
        format!("{HEADER}{}", ROW.repeat(2)),
    )
    .unwrap();
    assert_eq!(
        run(p, &[]).status.code(),
        Some(0),
        "without --base it passes"
    );
    let out = run(p, &["--base", "HEAD"]);
    assert_eq!(out.status.code(), Some(1));
    let text = String::from_utf8_lossy(&out.stdout);
    assert!(text.contains("ledger gained an entry since HEAD"), "{text}");
    assert!(text.contains("ledger vs HEAD: 1 entry added"), "{text}");

    // Shrink: remove the escape and its row.
    std::fs::write(p.join("src/harness.rs"), "fn h() {}\n").unwrap();
    std::fs::write(p.join("proofs/trust-ledger.tsv"), HEADER).unwrap();
    let (code, v) = json(p, &["--base", "HEAD"]);
    assert_eq!(code, Some(0), "{v}");
    assert_eq!(v["growth"].as_array().unwrap().len(), 0);
    assert_eq!(v["base"], "HEAD");
}

#[test]
fn an_unresolvable_base_is_an_error_not_a_pass() {
    let dir = project(&harness(1), ROW);
    let out = run(dir.path(), &["--base", "no-such-ref"]);
    assert_ne!(out.status.code(), Some(0));
    let err = String::from_utf8_lossy(&out.stderr);
    assert!(err.contains("--base no-such-ref"), "{err}");
}

#[test]
fn kernel_axioms_are_compared_with_the_kernel_rows() {
    let ledger = format!("{ROW}kernel\t-\taxiom\tm.known\n");
    let dir = project(&harness(1), &ledger);
    let p = dir.path();
    let k = p.join("coqchk.txt");
    std::fs::write(&k, "CONTEXT SUMMARY\n* Axioms:\n    m.known\n").unwrap();
    let ok = run(p, &["--kernel", k.to_str().unwrap()]);
    assert_eq!(
        ok.status.code(),
        Some(0),
        "{}",
        String::from_utf8_lossy(&ok.stdout)
    );

    std::fs::write(&k, "CONTEXT SUMMARY\n* Axioms:\n    m.known\n    m.new\n").unwrap();
    let out = run(p, &["--kernel", k.to_str().unwrap()]);
    assert_eq!(out.status.code(), Some(1));
    let text = String::from_utf8_lossy(&out.stdout);
    assert!(
        text.contains(
            "error: kernel axiom not in proofs/trust-ledger.tsv: kernel\t-\taxiom\tm.new"
        ),
        "{text}"
    );

    std::fs::write(&k, "no summary").unwrap();
    assert_ne!(
        run(p, &["--kernel", k.to_str().unwrap()]).status.code(),
        Some(0)
    );
}

#[test]
fn a_malformed_ledger_line_is_an_error_naming_the_line() {
    let dir = project(&harness(1), "source\tonly-three\tfields\n");
    let out = run(dir.path(), &[]);
    assert_ne!(out.status.code(), Some(0));
    let err = String::from_utf8_lossy(&out.stderr);
    assert!(err.contains("line 2: expected 4"), "{err}");
}

#[test]
fn no_scan_counts_a_foreign_ledger_and_still_applies_base() {
    // Names that rivet's scanner would not produce (a macro-qualified name),
    // as spar's detector writes them.
    let row = "source\tsrc/harness.rs\tkani-assume\tnarrow!::h\n";
    let dir = project(&harness(1), row);
    let p = dir.path();
    assert_eq!(
        run(p, &[]).status.code(),
        Some(1),
        "the scan disagrees with the names"
    );
    let (code, v) = json(p, &["--no-scan"]);
    assert_eq!(code, Some(0), "{v}");
    assert_eq!(v["scanned"], Value::Bool(false));
    assert_eq!(v["source"]["foreign"], 1);
    assert_eq!(v["source"]["found"], 0);
    assert_eq!(v["ledger_by_kind"]["source/kani-assume"], 1);

    std::fs::write(
        p.join("proofs/trust-ledger.tsv"),
        format!("{HEADER}{row}{row}"),
    )
    .unwrap();
    let out = run(p, &["--no-scan", "--base", "HEAD"]);
    assert_eq!(out.status.code(), Some(1));
    let text = String::from_utf8_lossy(&out.stdout);
    assert!(text.contains("sources not scanned (--no-scan)"), "{text}");
    assert!(text.contains("ledger vs HEAD: 1 entry added"), "{text}");
}
