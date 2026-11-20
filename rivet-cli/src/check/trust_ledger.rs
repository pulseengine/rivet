//! `rivet check trust-ledger` (REQ-421): compare the trust escapes in the
//! proof sources with the ledger, and optionally refuse a ledger that grew
//! relative to a base ref or a kernel axiom the ledger lacks.
//!
//! The scanning and comparison live in `rivet_core::trust_ledger`; this
//! module walks the project, reads files and git, and renders the report.
//! The ledger format is the seam in pulseengine/rivet#1300.

use std::collections::BTreeMap;
use std::path::{Path, PathBuf};
use std::process::Command;

use anyhow::{Context, Result, bail};
use rivet_core::trust_ledger::{self as tl, Comparison, Row};
use serde::Serialize;

/// Directories the scan never enters (build outputs and vendored trees).
const SKIP_DIRS: [&str; 6] = [
    "target",
    ".git",
    "node_modules",
    "bazel-bin",
    "bazel-out",
    "bazel-testlogs",
];

#[derive(Debug, Serialize)]
pub struct KernelReport {
    pub new: Vec<Row>,
    pub gone: Vec<Row>,
    pub unsafe_settings: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct Report {
    pub oracle: &'static str,
    pub ledger: String,
    /// False under `--no-scan`: the ledger belongs to another repo's
    /// detector, so rivet only counts it and applies `--base`.
    pub scanned: bool,
    pub found_by_kind: BTreeMap<String, usize>,
    pub ledger_by_kind: BTreeMap<String, usize>,
    pub source: Comparison,
    /// `--base`: the ref compared against, and the rows the ledger gained.
    pub base: Option<String>,
    pub growth: Option<Vec<Row>>,
    pub kernel: Option<KernelReport>,
    pub pass: bool,
}

fn walk(root: &Path, dir: &Path, out: &mut Vec<(String, PathBuf)>) -> Result<()> {
    let mut entries: Vec<_> = std::fs::read_dir(dir)
        .with_context(|| format!("reading {}", dir.display()))?
        .collect::<std::io::Result<_>>()?;
    entries.sort_by_key(|e| e.file_name());
    for e in entries {
        let path = e.path();
        let name = e.file_name().to_string_lossy().into_owned();
        let ft = e.file_type()?;
        if ft.is_dir() {
            if !SKIP_DIRS.contains(&name.as_str()) && !name.starts_with("bazel-") {
                walk(root, &path, out)?;
            }
        } else if ft.is_file() && (name.ends_with(".v") || name.ends_with(".rs")) {
            let rel = path
                .strip_prefix(root)
                .unwrap_or(&path)
                .components()
                .map(|c| c.as_os_str().to_string_lossy().into_owned())
                .collect::<Vec<_>>()
                .join("/");
            out.push((rel, path));
        }
    }
    Ok(())
}

/// Scan every `*.v` and `*.rs` file under `root`.
pub fn scan(root: &Path) -> Result<Vec<Row>> {
    let mut files = Vec::new();
    walk(root, root, &mut files)?;
    let mut rows = Vec::new();
    for (rel, path) in files {
        let Ok(text) = std::fs::read_to_string(&path) else {
            continue; // not UTF-8: no proof source rivet can read
        };
        if rel.ends_with(".v") {
            rows.extend(tl::scan_rocq(&rel, &text));
        } else {
            rows.extend(tl::scan_verus(&rel, &text));
            rows.extend(tl::scan_kani(&rel, &text));
        }
    }
    rows.sort();
    Ok(rows)
}

/// The ledger's text at a git ref, or empty when the file did not exist
/// there. A ref git cannot resolve is an error.
fn ledger_at(root: &Path, base: &str, rel: &str) -> Result<String> {
    let verify = Command::new("git")
        .arg("-C")
        .arg(root)
        .args(["rev-parse", "--verify", "--quiet"])
        .arg(format!("{base}^{{commit}}"))
        .output()
        .context("running git rev-parse")?;
    if !verify.status.success() {
        bail!("--base {base}: git cannot resolve this ref to a commit");
    }
    let out = Command::new("git")
        .arg("-C")
        .arg(root)
        .arg("show")
        .arg(format!("{base}:{rel}"))
        .output()
        .context("running git show")?;
    if out.status.success() {
        Ok(String::from_utf8_lossy(&out.stdout).into_owned())
    } else {
        Ok(String::new())
    }
}

pub fn compute(
    root: &Path,
    ledger_rel: &str,
    no_scan: bool,
    base: Option<&str>,
    kernel_out: Option<&Path>,
) -> Result<Report> {
    let ledger_path = root.join(ledger_rel);
    let ledger_text = std::fs::read_to_string(&ledger_path)
        .with_context(|| format!("reading {}", ledger_path.display()))?;
    let ledger = tl::parse_ledger(&ledger_text)
        .map_err(|e| anyhow::anyhow!("{}: {e}", ledger_path.display()))?;

    let (found, source) = if no_scan {
        let in_ledger = ledger.iter().filter(|r| r.section == "source").count();
        let none = Comparison {
            in_ledger,
            foreign: in_ledger,
            ..Comparison::default()
        };
        (Vec::new(), none)
    } else {
        let found = scan(root)?;
        let c = tl::compare(&found, &ledger, "source");
        (found, c)
    };

    let growth = match base {
        Some(b) => {
            let base_rows = tl::parse_ledger(&ledger_at(root, b, ledger_rel)?)
                .map_err(|e| anyhow::anyhow!("{ledger_rel} at {b}: {e}"))?;
            Some(tl::growth(&base_rows, &ledger))
        }
        None => None,
    };

    let kernel = match kernel_out {
        Some(p) => {
            let text =
                std::fs::read_to_string(p).with_context(|| format!("reading {}", p.display()))?;
            let (rows, unsafe_settings) =
                tl::kernel_rows(&text).map_err(|e| anyhow::anyhow!("{}: {e}", p.display()))?;
            let c = tl::compare(&rows, &ledger, "kernel");
            Some(KernelReport {
                new: c.new,
                gone: c.gone,
                unsafe_settings,
            })
        }
        None => None,
    };

    let pass = source.new.is_empty()
        && source.gone.is_empty()
        && growth.as_ref().is_none_or(|g| g.is_empty())
        && kernel
            .as_ref()
            .is_none_or(|k| k.new.is_empty() && k.gone.is_empty() && k.unsafe_settings.is_empty());

    Ok(Report {
        oracle: "trust-ledger",
        ledger: ledger_rel.to_string(),
        scanned: !no_scan,
        found_by_kind: tl::counts_by_kind(&found),
        ledger_by_kind: tl::counts_by_kind(&ledger),
        source,
        base: base.map(str::to_string),
        growth,
        kernel,
        pass,
    })
}

pub fn render_text(r: &Report) -> String {
    let mut s = String::new();
    for row in &r.source.gone {
        s.push_str(&format!(
            "error: ledger entry no longer found (remove it in this change): {}\n",
            row.to_tsv()
        ));
    }
    for row in &r.source.new {
        s.push_str(&format!(
            "error: trust escape not in {}: {}\n",
            r.ledger,
            row.to_tsv()
        ));
    }
    if !r.scanned {
        s.push_str("sources not scanned (--no-scan): the ledger's own detector owns its rows\n");
    }
    s.push_str(&format!(
        "trust escapes: {} found, {} in ledger ({} of other kinds, not compared), {} new, {} stale\n",
        r.source.found,
        r.source.in_ledger,
        r.source.foreign,
        r.source.new.len(),
        r.source.gone.len()
    ));
    for (kind, n) in &r.found_by_kind {
        s.push_str(&format!("  {kind}: {n}\n"));
    }
    if let (Some(base), Some(growth)) = (&r.base, &r.growth) {
        for row in growth {
            s.push_str(&format!(
                "error: ledger gained an entry since {base} (entries may only shrink): {}\n",
                row.to_tsv()
            ));
        }
        s.push_str(&format!(
            "ledger vs {base}: {} entr{} added\n",
            growth.len(),
            if growth.len() == 1 { "y" } else { "ies" }
        ));
    }
    if let Some(k) = &r.kernel {
        for row in &k.gone {
            s.push_str(&format!(
                "error: kernel ledger entry no longer reported (remove it): {}\n",
                row.to_tsv()
            ));
        }
        for row in &k.new {
            s.push_str(&format!(
                "error: kernel axiom not in {}: {}\n",
                r.ledger,
                row.to_tsv()
            ));
        }
        for f in &k.unsafe_settings {
            s.push_str(&format!(
                "error: coqchk reports an unsafe kernel setting: {f}\n"
            ));
        }
    }
    s.push_str(if r.pass {
        "trust-ledger: PASS\n"
    } else {
        "trust-ledger: FAIL\n"
    });
    s
}
