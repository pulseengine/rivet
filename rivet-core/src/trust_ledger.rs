//! Trust-escape ledger (REQ-421, North Star O3).
//!
//! A trust escape is a place where a prover accepts a statement without
//! checking it, or where a harness narrows the inputs it checks. The ledger
//! (`proofs/trust-ledger.tsv`) lists each one as four tab-separated fields:
//! `section  file  kind  name`, where `section` is `source` (found in the
//! proof sources) or `kernel` (an axiom `coqchk -o` reports).
//!
//! The scan finds, after stripping comments:
//! - Rocq (`*.v`): `Admitted.`, `Admit Obligations`, `Axiom(s)`,
//!   `Parameter(s)`, `Conjecture`;
//! - Verus (files that use the Verus macro): `external_body`,
//!   `assume_specification`, `assume(...)`, `admit()`;
//! - Kani (every Rust file): `kani::assume(...)`, kind `kani-assume`.
//!   O3 counts every assumption that narrows a harness's
//!   input range, because a bug outside that range is invisible to the proof.
//!
//! Three checks use the scan. [`compare`] fails on a scanned escape the
//! ledger lacks and on a ledger row of a scanned kind the scan no longer
//! finds (a stale row would let a later escape of the same name in without
//! a ledger edit). Rows of other kinds, which another repo's detector
//! writes, are carried and counted but not compared. [`growth`] fails when
//! the ledger gained entries relative to a base ledger (the O3 guard
//! "entries may only shrink"). Kernel rows come from [`kernel_rows`].
//!
//! The scanner must not find its own patterns: the tokens it looks for are
//! built with `concat!` so this file's text never contains them.

/// The kinds this module's scanners produce. Ledger rows of any other kind
/// are foreign: counted, guarded by [`growth`], never reported stale.
pub const SCANNED_KINDS: [&str; 10] = [
    "admitted",
    "admit-obligations",
    "axiom",
    "parameter",
    "conjecture",
    "external_body",
    "assume_specification",
    "assume",
    "admit",
    "kani-assume",
];

const VERUS_MACRO: &str = concat!("verus", "!");

use std::collections::BTreeMap;
use std::sync::LazyLock;

use regex::Regex;
use serde::Serialize;

/// One ledger row.
#[derive(Debug, Clone, PartialEq, Eq, PartialOrd, Ord, Hash, Serialize)]
pub struct Row {
    pub section: String,
    pub file: String,
    pub kind: String,
    pub name: String,
}

impl Row {
    pub fn new(section: &str, file: &str, kind: &str, name: &str) -> Self {
        Row {
            section: section.to_string(),
            file: file.to_string(),
            kind: kind.to_string(),
            name: name.to_string(),
        }
    }

    /// The row as the ledger spells it.
    pub fn to_tsv(&self) -> String {
        format!(
            "{}\t{}\t{}\t{}",
            self.section, self.file, self.kind, self.name
        )
    }
}

/// Parse a ledger. Blank lines and lines starting with `#` are skipped.
/// Every other line must have exactly four tab-separated fields with a
/// `source` or `kernel` section; the error names the 1-based line.
pub fn parse_ledger(text: &str) -> Result<Vec<Row>, String> {
    let mut rows = Vec::new();
    for (n, line) in text.lines().enumerate() {
        if line.trim().is_empty() || line.starts_with('#') {
            continue;
        }
        let parts: Vec<&str> = line.split('\t').collect();
        if parts.len() != 4 || !matches!(parts[0], "source" | "kernel") {
            return Err(format!(
                "line {}: expected 4 tab-separated fields (source|kernel, file, kind, name), got: {line:?}",
                n + 1
            ));
        }
        rows.push(Row::new(parts[0], parts[1], parts[2], parts[3]));
    }
    Ok(rows)
}

/// Blank out Rocq `(* ... *)` comments, nested, keeping byte offsets and
/// newlines.
pub fn strip_rocq_comments(text: &str) -> String {
    let b = text.as_bytes();
    let mut out = b.to_vec();
    let mut depth = 0usize;
    let mut i = 0;
    while i < b.len() {
        if b[i..].starts_with(b"(*") {
            depth += 1;
            out[i] = b' ';
            out[i + 1] = b' ';
            i += 2;
            continue;
        }
        if depth > 0 && b[i..].starts_with(b"*)") {
            depth -= 1;
            out[i] = b' ';
            out[i + 1] = b' ';
            i += 2;
            continue;
        }
        if depth > 0 && b[i] != b'\n' {
            out[i] = b' ';
        }
        i += 1;
    }
    // Only ASCII bytes were replaced by ASCII spaces, but a multi-byte
    // character inside a comment is blanked byte by byte, which stays valid.
    String::from_utf8_lossy(&out).into_owned()
}

/// Remove Rust `/* ... */` (newlines kept) and `// ...` comments.
pub fn strip_rust_comments(text: &str) -> String {
    static BLOCK: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"(?s)/\*.*?\*/").unwrap());
    static LINE: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"//[^\n]*").unwrap());
    let blanked = BLOCK.replace_all(text, |c: &regex::Captures| {
        c[0].chars()
            .map(|ch| if ch == '\n' { '\n' } else { ' ' })
            .collect::<String>()
    });
    LINE.replace_all(&blanked, "").into_owned()
}

static ROCQ_DECL: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(
        r"\b(Theorem|Lemma|Corollary|Fact|Remark|Proposition|Example|Definition|Fixpoint|Instance|Program\s+\w+|Let)\s+([A-Za-z_][\w']*)",
    )
    .unwrap()
});
static ROCQ_AXIOM: LazyLock<Regex> = LazyLock::new(|| {
    Regex::new(r"(?m)^\s*(Axioms?|Parameters?|Conjecture)\s+([A-Za-z_][\w']*)").unwrap()
});
static ROCQ_ADMITTED: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\bAdmitted\s*\.").unwrap());
static ROCQ_ADMIT_OBL: LazyLock<Regex> =
    LazyLock::new(|| Regex::new(r"\bAdmit\s+Obligations\b").unwrap());
static RUST_FN: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"\bfn\s+([A-Za-z_]\w*)").unwrap());

/// The name of the last Rocq declaration that starts before `pos`, or `?`.
fn rocq_decl_before(text: &str, pos: usize) -> String {
    ROCQ_DECL
        .captures_iter(&text[..pos])
        .last()
        .map_or_else(|| "?".to_string(), |c| c[2].to_string())
}

/// Scan one Rocq source. `rel` is its path relative to the project root.
pub fn scan_rocq(rel: &str, text: &str) -> Vec<Row> {
    let text = strip_rocq_comments(text);
    let mut rows = Vec::new();
    for c in ROCQ_AXIOM.captures_iter(&text) {
        let kind = c[1].trim_end_matches('s').to_lowercase();
        rows.push(Row::new("source", rel, &kind, &c[2]));
    }
    for (rx, kind) in [
        (&*ROCQ_ADMITTED, "admitted"),
        (&*ROCQ_ADMIT_OBL, "admit-obligations"),
    ] {
        for m in rx.find_iter(&text) {
            rows.push(Row::new(
                "source",
                rel,
                kind,
                &rocq_decl_before(&text, m.start()),
            ));
        }
    }
    rows
}

/// The name of the last `fn` that starts before `pos`, or `?`.
fn rust_fn_before(text: &str, pos: usize) -> String {
    RUST_FN
        .captures_iter(&text[..pos])
        .last()
        .map_or_else(|| "?".to_string(), |c| c[1].to_string())
}

/// The name of the first `fn` that starts at or after `pos`, or `?`.
fn rust_fn_after(text: &str, pos: usize) -> String {
    RUST_FN
        .captures(&text[pos..])
        .map_or_else(|| "?".to_string(), |c| c[1].to_string())
}

/// True when the byte before `pos` is not an identifier character or `:`,
/// so `assume(` matches but `kani::assume(` and `my_assume(` do not.
fn standalone_at(text: &str, pos: usize) -> bool {
    match text[..pos].chars().next_back() {
        Some(ch) => !(ch.is_alphanumeric() || ch == '_' || ch == ':'),
        None => true,
    }
}

/// Scan one Rust source for Verus escapes. Files without the Verus macro
/// outside comments yield nothing.
pub fn scan_verus(rel: &str, raw: &str) -> Vec<Row> {
    let text = strip_rust_comments(raw);
    if !text.contains(VERUS_MACRO) {
        return Vec::new();
    }
    static EXTERNAL_BODY: LazyLock<Regex> = LazyLock::new(|| {
        Regex::new(r"#\[\s*verifier(?:::external_body|\s*\(\s*external_body\s*\))\s*\]").unwrap()
    });
    static ASSUME_SPEC: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"\bassume_specification\b").unwrap());
    static ASSUME: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"assume\s*\(").unwrap());
    static ADMIT: LazyLock<Regex> = LazyLock::new(|| Regex::new(r"admit\s*\(\s*\)").unwrap());

    let mut rows = Vec::new();
    for m in EXTERNAL_BODY.find_iter(&text) {
        rows.push(Row::new(
            "source",
            rel,
            "external_body",
            &rust_fn_after(&text, m.end()),
        ));
    }
    for m in ASSUME_SPEC.find_iter(&text) {
        rows.push(Row::new(
            "source",
            rel,
            "assume_specification",
            &rust_fn_after(&text, m.end()),
        ));
    }
    for (rx, kind) in [(&*ASSUME, "assume"), (&*ADMIT, "admit")] {
        for m in rx.find_iter(&text) {
            if standalone_at(&text, m.start()) {
                rows.push(Row::new(
                    "source",
                    rel,
                    kind,
                    &rust_fn_before(&text, m.start()),
                ));
            }
        }
    }
    rows
}

/// Scan one Rust source for `kani::assume(...)` calls, kind `kani-assume`,
/// named after the enclosing function (`?` when none). Every file is
/// scanned, so an assumption in a helper outside the harness file counts.
pub fn scan_kani(rel: &str, raw: &str) -> Vec<Row> {
    let text = strip_rust_comments(raw);
    static KANI_ASSUME: LazyLock<Regex> =
        LazyLock::new(|| Regex::new(r"\bkani\s*::\s*assume\s*\(").unwrap());
    KANI_ASSUME
        .find_iter(&text)
        .map(|m| {
            Row::new(
                "source",
                rel,
                "kani-assume",
                &rust_fn_before(&text, m.start()),
            )
        })
        .collect()
}

/// Result of comparing what a scan found with a ledger section.
#[derive(Debug, Clone, Default, PartialEq, Eq, Serialize)]
pub struct Comparison {
    /// Found but not in the ledger: these fail the check.
    pub new: Vec<Row>,
    /// In the ledger, of a scanned kind, but no longer found: these fail.
    pub gone: Vec<Row>,
    pub found: usize,
    pub in_ledger: usize,
    /// Ledger rows of kinds no scanner here produces (another repo's
    /// detector wrote them): carried, not compared.
    pub foreign: usize,
}

fn counter(rows: &[Row]) -> BTreeMap<&Row, usize> {
    let mut m = BTreeMap::new();
    for r in rows {
        *m.entry(r).or_insert(0) += 1;
    }
    m
}

/// Multiset difference `a - b`, sorted.
fn minus(a: &[Row], b: &[Row]) -> Vec<Row> {
    let have = counter(b);
    let mut out = Vec::new();
    for (row, n) in counter(a) {
        let keep = n.saturating_sub(have.get(row).copied().unwrap_or(0));
        out.extend(std::iter::repeat_n(row.clone(), keep));
    }
    out
}

/// Compare scanned rows with the ledger rows of one `section`, counting
/// duplicates (two `assume` calls in one function need two ledger rows).
/// Kernel rows are always compared; source rows only when their kind is in
/// [`SCANNED_KINDS`].
pub fn compare(found: &[Row], ledger: &[Row], section: &str) -> Comparison {
    let have: Vec<Row> = ledger
        .iter()
        .filter(|r| r.section == section)
        .cloned()
        .collect();
    let (compared, foreign): (Vec<Row>, Vec<Row>) = have
        .iter()
        .cloned()
        .partition(|r| section == "kernel" || SCANNED_KINDS.contains(&r.kind.as_str()));
    Comparison {
        new: minus(found, &compared),
        gone: minus(&compared, found),
        found: found.len(),
        in_ledger: have.len(),
        foreign: foreign.len(),
    }
}

/// Entries the head ledger has that the base ledger lacks. Non-empty means
/// the ledger grew, which the O3 guard forbids.
pub fn growth(base: &[Row], head: &[Row]) -> Vec<Row> {
    minus(head, base)
}

/// Row counts per `section/kind`, e.g. `source/kani-assume`.
pub fn counts_by_kind(rows: &[Row]) -> BTreeMap<String, usize> {
    let mut m = BTreeMap::new();
    for r in rows {
        *m.entry(format!("{}/{}", r.section, r.kind)).or_insert(0) += 1;
    }
    m
}

/// `Theory:` lines coqchk may print without the kernel being unsafe.
const SAFE_THEORY: [&str; 2] = ["Set is predicative", "Rewrite rules are not allowed"];

/// Parse `coqchk -o` output into kernel axiom rows and unsafe-setting flags.
/// Every summary block other than the axioms must read `<none>`, and every
/// `Theory:` line must be a known-safe one. A missing `CONTEXT SUMMARY`
/// is an error: the kernel check did not run.
pub fn kernel_rows(out: &str) -> Result<(Vec<Row>, Vec<String>), String> {
    let Some((_, summary)) = out.split_once("CONTEXT SUMMARY") else {
        return Err("coqchk output has no CONTEXT SUMMARY; the kernel check did not run".into());
    };
    #[derive(PartialEq)]
    enum Block {
        None,
        Axioms,
        Flag,
    }
    let mut rows = Vec::new();
    let mut flags = Vec::new();
    let mut block = Block::None;
    for line in summary.lines() {
        let s = line.trim();
        if let Some(body) = s.strip_prefix("* ") {
            let (head, rest) = body.split_once(':').unwrap_or((body, ""));
            let rest = rest.trim();
            if head == "Theory" {
                block = Block::None;
                if !SAFE_THEORY.contains(&rest) {
                    flags.push(s.to_string());
                }
                continue;
            }
            block = if head.starts_with("Axioms") {
                Block::Axioms
            } else {
                Block::Flag
            };
            if !rest.is_empty() && rest != "<none>" {
                if block == Block::Axioms {
                    rows.push(Row::new("kernel", "-", "axiom", rest));
                } else {
                    flags.push(s.to_string());
                }
            }
            continue;
        }
        if s.is_empty() || s.starts_with('=') || s == "<none>" || block == Block::None {
            continue;
        }
        if block == Block::Axioms {
            rows.push(Row::new("kernel", "-", "axiom", s));
        } else {
            flags.push(s.to_string());
        }
    }
    Ok((rows, flags))
}

#[cfg(test)]
mod tests {
    use super::*;

    fn kinds(rows: &[Row]) -> Vec<(String, String)> {
        rows.iter()
            .map(|r| (r.kind.clone(), r.name.clone()))
            .collect()
    }

    #[test]
    fn parse_ledger_skips_comments_and_names_a_bad_line() {
        let ok = "# header\n\nsource\tp.v\tadmitted\tfoo\nkernel\t-\taxiom\tp.foo\n";
        let rows = parse_ledger(ok).unwrap();
        assert_eq!(
            rows,
            vec![
                Row::new("source", "p.v", "admitted", "foo"),
                Row::new("kernel", "-", "axiom", "p.foo"),
            ]
        );
        let err = parse_ledger("# h\nsource\tp.v\tadmitted\n").unwrap_err();
        assert!(err.starts_with("line 2: expected 4"), "{err}");
        let err = parse_ledger("other\ta\tb\tc\n").unwrap_err();
        assert!(err.starts_with("line 1: expected 4"), "{err}");
    }

    #[test]
    fn rocq_scan_strips_nested_comments_and_names_the_declaration() {
        let src = "(* Axiom hidden. (* nested Admitted. *) still comment *)\n\
                   Axiom real_ax : True.\n\
                   Parameters p q : nat.\n\
                   Conjecture c1 : False.\n\
                   Lemma l1 : True.\nProof. Admitted.\n\
                   Program Definition pd := 1.\nAdmit Obligations.\n";
        let rows = scan_rocq("x.v", src);
        assert_eq!(
            kinds(&rows),
            vec![
                ("axiom".into(), "real_ax".into()),
                ("parameter".into(), "p".into()),
                ("conjecture".into(), "c1".into()),
                ("admitted".into(), "l1".into()),
                ("admit-obligations".into(), "pd".into()),
            ]
        );
        assert!(
            rows.iter()
                .all(|r| r.section == "source" && r.file == "x.v")
        );
    }

    #[test]
    fn rocq_admitted_before_any_declaration_is_named_question_mark() {
        assert_eq!(
            kinds(&scan_rocq("x.v", "Admitted.")),
            vec![("admitted".into(), "?".into())]
        );
    }

    #[test]
    fn strip_rocq_comments_keeps_offsets_and_unbalanced_close() {
        let s = "a (* b *) c *) d";
        let out = strip_rocq_comments(s);
        assert_eq!(out.len(), s.len());
        assert_eq!(out, "a         c *) d");
        assert_eq!(strip_rocq_comments("(*x\ny*)z"), "   \n   z");
    }

    #[test]
    fn verus_scan_finds_each_escape_and_skips_qualified_calls() {
        let src = concat!(
            "verus",
            "! {\n\
                   #[verifier::external_body]\nfn eb() {}\n\
                   #[verifier(external_body)]\nfn eb2() {}\n\
                   pub assume_specification[ foo ] fn spec_target();\n\
                   fn lemma() { assume(x); my_assume(y); a::assume(z); admit(); }\n\
                   // assume(commented);\n\
                   /* admit() */\n}\n"
        );
        let rows = scan_verus("v.rs", src);
        assert_eq!(
            kinds(&rows),
            vec![
                ("external_body".into(), "eb".into()),
                ("external_body".into(), "eb2".into()),
                ("assume_specification".into(), "spec_target".into()),
                ("assume".into(), "lemma".into()),
                ("admit".into(), "lemma".into()),
            ]
        );
        assert!(scan_verus("v.rs", "fn f() { assume(x); }").is_empty());
        let only_in_comment = concat!("// verus", "!\nfn f() { assume(x); }");
        assert!(scan_verus("v.rs", only_in_comment).is_empty());
    }

    #[test]
    fn kani_scan_counts_each_assume_outside_comments() {
        let call = concat!("kani", "::assume(");
        let spaced = concat!("kani :: ", "assume(");
        let src = format!(
            "fn h1() {{ {call}a); {call}b); }}\nfn h2() {{ // {call}c);\n {spaced}d); }}\n"
        );
        let rows = scan_kani("k.rs", &src);
        assert_eq!(
            kinds(&rows),
            vec![
                ("kani-assume".into(), "h1".into()),
                ("kani-assume".into(), "h1".into()),
                ("kani-assume".into(), "h2".into()),
            ]
        );
        assert_eq!(
            kinds(&scan_kani("k.rs", &format!("fn helper() {{ {call}a); }}"))),
            vec![("kani-assume".into(), "helper".into())]
        );
        assert_eq!(
            kinds(&scan_kani("k.rs", &format!("{call}top);"))),
            vec![("kani-assume".into(), "?".into())]
        );
        assert!(
            scan_kani(
                "k.rs",
                &format!("fn f() {{ /* {call}a); */ my_{call}b); }}")
            )
            .is_empty()
        );
    }

    #[test]
    fn compare_counts_duplicates_and_reports_gone_rows() {
        let a = Row::new("source", "f", "assume", "x");
        let b = Row::new("source", "f", "admit", "y");
        let k = Row::new("kernel", "-", "axiom", "z");
        let ledger = vec![a.clone(), b.clone(), k];
        let found = vec![a.clone(), a.clone()];
        let c = compare(&found, &ledger, "source");
        assert_eq!(c.new, vec![a.clone()]);
        assert_eq!(c.gone, vec![b]);
        assert_eq!((c.found, c.in_ledger), (2, 2));
        let clean = compare(&[a.clone()], &[a], "source");
        assert!(clean.new.is_empty() && clean.gone.is_empty());
        assert_eq!(clean.foreign, 0);
    }

    #[test]
    fn compare_carries_foreign_kinds_without_reporting_them_stale() {
        let unwind = Row::new("source", "s.rs", "kani-unwind=4", "h");
        let assume = Row::new("source", "s.rs", "kani-assume", "h");
        let c = compare(&[], &[unwind.clone(), assume.clone()], "source");
        assert_eq!(c.gone, vec![assume]);
        assert_eq!((c.in_ledger, c.foreign), (2, 1));
        let k = Row::new("kernel", "-", "kani-unwind=4", "odd");
        assert_eq!(compare(&[], &[k.clone()], "kernel").gone, vec![k]);
    }

    #[test]
    fn the_scanner_finds_nothing_in_its_own_source() {
        let own = include_str!("trust_ledger.rs");
        assert!(scan_verus("trust_ledger.rs", own).is_empty());
        assert!(scan_kani("trust_ledger.rs", own).is_empty());
        assert!(scan_rocq("trust_ledger.rs", "").is_empty());
    }

    #[test]
    fn growth_fails_only_on_added_entries() {
        let a = Row::new("source", "f", "assume", "x");
        let b = Row::new("source", "f", "kani-assume", "h");
        assert_eq!(
            growth(&[a.clone()], &[a.clone(), b.clone()]),
            vec![b.clone()]
        );
        assert!(growth(&[a.clone(), b.clone()], &[a.clone()]).is_empty());
        assert_eq!(growth(&[b.clone()], &[b.clone(), b.clone()]), vec![b]);
        assert!(growth(&[a.clone()], &[a]).is_empty());
    }

    #[test]
    fn counts_by_kind_groups_section_and_kind() {
        let rows = vec![
            Row::new("source", "f", "kani-assume", "h"),
            Row::new("source", "g", "kani-assume", "i"),
            Row::new("kernel", "-", "axiom", "z"),
        ];
        let m = counts_by_kind(&rows);
        assert_eq!(m.get("source/kani-assume"), Some(&2));
        assert_eq!(m.get("kernel/axiom"), Some(&1));
        assert_eq!(m.len(), 2);
    }

    #[test]
    fn kernel_rows_reads_axioms_and_flags_unsafe_settings() {
        let out = "noise\nCONTEXT SUMMARY\n===============\n\n\
                   * Theory: Set is predicative\n\n\
                   * Theory: Rewrite rules are not allowed\n\n\
                   * Axioms:\n    proofs.rocq.Schema.a1\n    proofs.rocq.Schema.a2\n\n\
                   * Constants/Inductives relying on type-in-type: <none>\n\n\
                   * Inductives whose positivity is assumed: <none>\n";
        let (rows, flags) = kernel_rows(out).unwrap();
        assert_eq!(
            rows,
            vec![
                Row::new("kernel", "-", "axiom", "proofs.rocq.Schema.a1"),
                Row::new("kernel", "-", "axiom", "proofs.rocq.Schema.a2"),
            ]
        );
        assert!(flags.is_empty(), "{flags:?}");

        let bad = "CONTEXT SUMMARY\n* Theory: Set is impredicative\n\
                   * Axioms: inline.ax\n\
                   * Constants/Inductives relying on type-in-type:\n    m.c\n\
                   * Inductives whose positivity is assumed: m.i\n";
        let (rows, flags) = kernel_rows(bad).unwrap();
        assert_eq!(rows, vec![Row::new("kernel", "-", "axiom", "inline.ax")]);
        assert_eq!(
            flags,
            vec![
                "* Theory: Set is impredicative".to_string(),
                "m.c".to_string(),
                "* Inductives whose positivity is assumed: m.i".to_string(),
            ]
        );
        assert!(kernel_rows("no summary here").is_err());
    }

    #[test]
    fn strip_rocq_comments_handles_eof_inside_a_comment_and_adjacent_markers() {
        assert_eq!(strip_rocq_comments("x (* open"), "x        ");
        assert_eq!(strip_rocq_comments("(**)y"), "    y");
    }

    #[test]
    fn strip_rust_comments_keeps_newlines_inside_block_comments() {
        assert_eq!(
            strip_rust_comments("a/*x\ny*/b // tail\nc"),
            "a   \n   b \nc"
        );
    }

    #[test]
    fn kernel_rows_skips_none_rule_and_preamble_lines() {
        let out = "CONTEXT SUMMARY\nchecked preamble text\n\
                   * Axioms:\n    <none>\n    =====\n\
                   * Constants/Inductives relying on type-in-type:\n    <none>\n";
        let (rows, flags) = kernel_rows(out).unwrap();
        assert!(rows.is_empty(), "{rows:?}");
        assert!(flags.is_empty(), "{flags:?}");
    }

    #[test]
    fn row_to_tsv_round_trips_through_parse() {
        let r = Row::new("source", "a/b.rs", "kani-assume", "h");
        assert_eq!(parse_ledger(&r.to_tsv()).unwrap(), vec![r]);
    }
}
