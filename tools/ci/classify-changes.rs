//! classify-changes — which CI jobs a change must run (REQ-412, REQ-291).
//!
//! Replaces the classification in tools/ci/detect-changes.sh, which now only
//! compiles and runs this file. Plain rustc, no crates, so the `changes` job
//! needs no workspace build.
//!
//! Outputs, each `true` or `false`, written as `key=value` to $GITHUB_OUTPUT
//! (stdout when unset):
//!
//!   rust    compile-heavy Rust jobs (clippy, msrv, deny, mutation, proptest, ...)
//!   tests   Test and cargo-vet: code changes, plus data the tests read
//!   wasm    the wasm-seam build gate (REQ-268)
//!   e2e     Playwright, which serves this repository's own artifacts
//!   vscode  the VS Code extension job
//!   kani    Kani proofs over rivet-core
//!   miri    Miri over rivet-core and rivet-yaml
//!   bench   criterion benchmarks (rivet-core benches)
//!   verus   Verus, a Bazel build over the files verus/BUILD.bazel names
//!   rocq    Rocq, a Bazel build over proofs/rocq
//!   proofs  verus || rocq (kept for existing readers)
//!
//! The first five keep detect-changes.sh's rules: a list of what is NOT code
//! (data, other), so an unknown path is code. The rest are taken from the
//! build graph, not hand lists: `cargo metadata --no-deps` gives each crate's
//! directory and its path dependencies, the crate sources give the files they
//! embed (`include_str!`, `include_bytes!`, `include_dir!`) or load
//! (`#[path = ...]`), and the Bazel BUILD files give the `srcs` labels.
//!
//! FAILS CLOSED: every output is true for a non-PR, non-queue event, an empty
//! base, a failed or empty diff, unreadable GATE_PROBE_FILES, a failed
//! `cargo metadata`, an unparseable BUILD label, and any change to a pin or to
//! CI itself (.github/, tools/ci/, Cargo.toml/Cargo.lock at the root,
//! rust-toolchain*, .cargo/, MODULE.bazel*, .bazelrc, .bazelversion). On GitHub
//! a job skipped by `if:` reports as passed, so doubt must run jobs.
//!
//! Inputs (environment): EVENT_NAME, BASE_SHA (pull_request.base.sha, or
//! merge_group.base_sha in a queue run), GITHUB_OUTPUT, and GATE_PROBE_FILES
//! (temper's gate probe: a file of changed paths that replaces the event and
//! the diff). Run from the repository root.
//!
//! Build and run: rustc --edition 2021 -O tools/ci/classify-changes.rs -o cc && ./cc
//! Tests:         rustc --edition 2021 --test tools/ci/classify-changes.rs -o cc-test && ./cc-test
//! The tests include the false-skip control, run on the real repository from
//! its root: a change to each job's true input selects that job, and a
//! docs-only change selects none of the heavy jobs.

use std::collections::{BTreeMap, BTreeSet};
use std::fs;
use std::io::Write;
use std::path::Path;
use std::process::Command;

const KEYS: &[&str] = &[
    "rust", "tests", "wasm", "e2e", "vscode", "kani", "miri", "bench", "verus", "rocq", "proofs",
];

/// Crates whose dependency closure each crate-scoped job compiles.
const KANI_ROOTS: &[&str] = &["rivet-core"];
const MIRI_ROOTS: &[&str] = &["rivet-core", "rivet-yaml"];
const BENCH_ROOTS: &[&str] = &["rivet-core"];
/// Bazel packages whose BUILD file names each proof job's inputs.
const VERUS_BUILD: &str = "verus/BUILD.bazel";
const ROCQ_BUILD: &str = "proofs/rocq/BUILD.bazel";

type Outputs = BTreeMap<&'static str, bool>;

fn all(v: bool) -> Outputs {
    KEYS.iter().map(|k| (*k, v)).collect()
}

/// What the build graph says each job reads. Built from the repository.
#[derive(Debug, Default, Clone)]
pub struct Graph {
    /// crate name -> directory (repo-relative, no trailing slash)
    crate_dir: BTreeMap<String, String>,
    /// crate name -> path-dependency crate names (all kinds)
    crate_deps: BTreeMap<String, Vec<String>>,
    /// crate name -> files outside its directory that its sources embed or load
    crate_extra: BTreeMap<String, BTreeSet<String>>,
    /// every embedded/loaded file across the workspace (the `rust` tier)
    embedded: BTreeSet<String>,
    verus_inputs: BTreeSet<String>,
    rocq_inputs: BTreeSet<String>,
}

/// A path change that runs everything: CI itself, a pin or a toolchain.
fn is_global(p: &str) -> bool {
    p.starts_with(".github/")
        || p.starts_with("tools/ci/")
        || p == "Cargo.toml"
        || p == "Cargo.lock"
        || p.starts_with("rust-toolchain")
        || p.starts_with(".cargo/")
        || p.starts_with("MODULE.bazel")
        || p == ".bazelrc"
        || p == ".bazelversion"
}

fn basename(p: &str) -> &str {
    p.rsplit('/').next().unwrap_or(p)
}

fn is_code(p: &str) -> bool {
    p.ends_with(".rs")
        || matches!(basename(p), "Cargo.toml" | "Cargo.lock")
        || p.starts_with(".github/workflows/")
        || p.starts_with(".github/actions/")
        || p.starts_with("tools/ci/detect-changes")
}

fn is_data(p: &str) -> bool {
    const DIRS: &[&str] = &[
        "artifacts/", "safety/", "docs/", "schemas/", "arch/", "examples/", "results/",
        "templates/", "supply-chain/", ".rivet/",
    ];
    DIRS.iter().any(|d| p.starts_with(d)) || p == "rivet.yaml" || (!p.contains('/') && p.ends_with(".md"))
}

fn is_other(p: &str) -> bool {
    const DIRS: &[&str] = &[
        "vscode-rivet/", "tests/playwright/", "npm/", "platform-packages/", "proofs/", "verus/",
        ".claude/",
    ];
    let b = basename(p);
    DIRS.iter().any(|d| p.starts_with(d))
        || b == "BUILD"
        || b == "BUILD.bazel"
        || b == "MODULE.bazel"
        || b == "MODULE.bazel.lock"
        || p.ends_with(".bzl")
        || p == ".bazelrc"
        || p == ".bazelversion"
        || (!p.contains('/') && p.starts_with("LICENSE"))
        || p == ".gitignore"
        || p == ".gitattributes"
}

fn is_proof_input(p: &str) -> bool {
    let b = basename(p);
    p.starts_with("proofs/")
        || p.starts_with("verus/")
        || b == "BUILD"
        || b == "BUILD.bazel"
        || b == "MODULE.bazel"
        || b == "MODULE.bazel.lock"
        || p.ends_with(".bzl")
        || p == ".bazelrc"
        || p == ".bazelversion"
}

fn is_e2e_input(p: &str) -> bool {
    p.starts_with("tests/playwright/")
        || p.starts_with("artifacts/")
        || p.starts_with("safety/")
        || p.starts_with("arch/")
        || p == "rivet.yaml"
}

impl Graph {
    /// Every file the closure of `roots` compiles: each crate's directory and
    /// the files its sources embed from elsewhere.
    fn touches(&self, roots: &[&str], p: &str) -> bool {
        let mut seen = BTreeSet::new();
        let mut stack: Vec<String> = roots.iter().map(|r| r.to_string()).collect();
        while let Some(c) = stack.pop() {
            if !seen.insert(c.clone()) {
                continue;
            }
            if let Some(d) = self.crate_dir.get(&c) {
                if p.starts_with(&format!("{d}/")) {
                    return true;
                }
            }
            if self.crate_extra.get(&c).is_some_and(|e| e.contains(p)) {
                return true;
            }
            stack.extend(self.crate_deps.get(&c).cloned().unwrap_or_default());
        }
        false
    }
}

/// Classifies a list of changed paths against the build graph.
pub fn classify(changed: &[String], g: &Graph) -> Outputs {
    if changed.is_empty() {
        return all(true);
    }
    if changed.iter().any(|p| is_global(p)) {
        return all(true);
    }
    let mut o = all(false);
    for p in changed {
        let code = is_code(p) || g.embedded.contains(p) || !(is_data(p) || is_other(p));
        if code {
            o.insert("rust", true);
            o.insert("tests", true);
            o.insert("wasm", true);
        } else if is_data(p) {
            o.insert("tests", true);
            if p.starts_with("supply-chain/") {
                o.insert("wasm", true);
            }
        }
        if g.touches(KANI_ROOTS, p) {
            o.insert("kani", true);
        }
        if g.touches(MIRI_ROOTS, p) {
            o.insert("miri", true);
        }
        if g.touches(BENCH_ROOTS, p) {
            o.insert("bench", true);
        }
        if g.verus_inputs.contains(p) || p.starts_with("verus/") {
            o.insert("verus", true);
        }
        if g.rocq_inputs.contains(p) || p.starts_with("proofs/") {
            o.insert("rocq", true);
        }
        // Any Bazel input can break either proof build.
        if is_proof_input(p) && !p.starts_with("proofs/") && !p.starts_with("verus/") {
            o.insert("verus", true);
            o.insert("rocq", true);
        }
        if is_e2e_input(p) {
            o.insert("e2e", true);
        }
        if p.starts_with("vscode-rivet/") {
            o.insert("vscode", true);
        }
    }
    let rust = o["rust"];
    if rust {
        // Playwright and the extension drive the rivet binary.
        o.insert("e2e", true);
        o.insert("vscode", true);
    }
    let proofs = o["verus"] || o["rocq"];
    o.insert("proofs", proofs);
    o
}

// ── Build graph ───────────────────────────────────────────────────────────

/// Normalizes `a/b/../c` lexically, repo-relative.
fn normalize(p: &str) -> Option<String> {
    let mut parts: Vec<&str> = Vec::new();
    for s in p.split('/') {
        match s {
            "" | "." => {}
            ".." => {
                parts.pop()?;
            }
            s => parts.push(s),
        }
    }
    Some(parts.join("/"))
}

fn dirname(p: &str) -> &str {
    p.rsplit_once('/').map(|x| x.0).unwrap_or("")
}

/// String literal arguments of `include_str!("x")`, `include_bytes!("x")`,
/// `include_dir!("x")` and `#[path = "x"]` in Rust source.
fn referenced_paths(src: &str) -> Vec<String> {
    let mut out = Vec::new();
    for pat in ["include_str!(\"", "include_bytes!(\"", "include_dir!(\""] {
        let mut rest = src;
        while let Some(i) = rest.find(pat) {
            rest = &rest[i + pat.len()..];
            if let Some(end) = rest.find('"') {
                out.push(rest[..end].to_string());
            }
        }
    }
    let mut rest = src;
    while let Some(i) = rest.find("#[path") {
        rest = &rest[i + 6..];
        let line = rest.split(']').next().unwrap_or("");
        if let Some(q) = line.find('"') {
            if let Some(e) = line[q + 1..].find('"') {
                out.push(line[q + 1..q + 1 + e].to_string());
            }
        }
    }
    out
}

fn rs_files(dir: &Path, out: &mut Vec<std::path::PathBuf>) {
    let Ok(rd) = fs::read_dir(dir) else { return };
    for e in rd.flatten() {
        let p = e.path();
        if p.file_name().is_some_and(|n| n == "target" || n == "node_modules") {
            continue;
        }
        if p.is_dir() {
            rs_files(&p, out);
        } else if p.extension().is_some_and(|x| x == "rs") {
            out.push(p);
        }
    }
}

/// Bazel labels in `srcs = [...]` and `exports_files([...])` of a BUILD file,
/// as repo-relative paths. Err on a label this parser does not understand.
fn bazel_inputs(build: &str, pkg: &str) -> Result<BTreeSet<String>, String> {
    let mut out = BTreeSet::new();
    out.insert(format!("{pkg}/BUILD.bazel"));
    for key in ["srcs", "data"] {
        let mut rest = build;
        while let Some(i) = rest.find(key) {
            rest = &rest[i + key.len()..];
            let t = rest.trim_start();
            let Some(t) = t.strip_prefix('=') else { continue };
            let t = t.trim_start();
            let Some(t) = t.strip_prefix('[') else {
                return Err(format!("{pkg}: `{key} =` is not a literal list"));
            };
            let list = t.split(']').next().unwrap_or("");
            for item in list.split(',') {
                let item = item.trim();
                if item.is_empty() || item.starts_with('#') {
                    continue;
                }
                let Some(lbl) = item.strip_prefix('"').and_then(|s| s.strip_suffix('"')) else {
                    return Err(format!("{pkg}: `{item}` in {key} is not a string label"));
                };
                let path = if let Some(abs) = lbl.strip_prefix("//") {
                    let (p, f) = abs.split_once(':').ok_or(format!("{pkg}: label {lbl} has no target"))?;
                    out.insert(format!("{p}/BUILD.bazel"));
                    format!("{p}/{f}")
                } else if lbl.starts_with('@') {
                    return Err(format!("{pkg}: external label {lbl}"));
                } else {
                    format!("{pkg}/{}", lbl.trim_start_matches(':'))
                };
                out.insert(path);
            }
        }
    }
    Ok(out)
}

/// Reads the build graph from the repository at the current directory.
pub fn load_graph() -> Result<Graph, String> {
    let root = std::env::current_dir().map_err(|e| e.to_string())?;
    let out = Command::new("cargo")
        .args(["metadata", "--no-deps", "--format-version", "1", "--offline"])
        .output()
        .map_err(|e| format!("cargo metadata: {e}"))?;
    if !out.status.success() {
        return Err(format!("cargo metadata failed: {}", String::from_utf8_lossy(&out.stderr)));
    }
    let meta = json::parse(&String::from_utf8_lossy(&out.stdout))?;
    let mut g = Graph::default();
    let rel = |abs: &str| -> Option<String> {
        Path::new(abs).strip_prefix(&root).ok().map(|p| p.to_string_lossy().replace('\\', "/"))
    };
    let pkgs = meta.get("packages").and_then(|p| p.arr()).ok_or("metadata has no packages")?;
    for pkg in pkgs {
        let name = pkg.get("name").and_then(|v| v.str()).ok_or("package without name")?.to_string();
        let manifest = pkg.get("manifest_path").and_then(|v| v.str()).ok_or("package without manifest_path")?;
        let dir = rel(dirname(manifest)).ok_or(format!("{name} is outside the repository"))?;
        let mut deps = Vec::new();
        for d in pkg.get("dependencies").and_then(|v| v.arr()).unwrap_or(&[]) {
            if d.get("path").and_then(|v| v.str()).is_some() {
                deps.push(d.get("name").and_then(|v| v.str()).unwrap_or_default().to_string());
            }
        }
        let mut files = Vec::new();
        rs_files(&root.join(&dir), &mut files);
        let mut extra = BTreeSet::new();
        for f in files {
            let Ok(src) = fs::read_to_string(&f) else { continue };
            let Some(frel) = rel(&f.to_string_lossy()) else { continue };
            for r in referenced_paths(&src) {
                if r.starts_with('/') || r.contains("env!") {
                    continue;
                }
                if let Some(n) = normalize(&format!("{}/{r}", dirname(&frel))) {
                    g.embedded.insert(n.clone());
                    if !n.starts_with(&format!("{dir}/")) {
                        extra.insert(n);
                    }
                }
            }
        }
        g.crate_dir.insert(name.clone(), dir);
        g.crate_deps.insert(name.clone(), deps);
        g.crate_extra.insert(name, extra);
    }
    if g.crate_dir.is_empty() {
        return Err("cargo metadata listed no workspace crates".into());
    }
    for (file, set) in [(VERUS_BUILD, &mut g.verus_inputs), (ROCQ_BUILD, &mut g.rocq_inputs)] {
        let text = fs::read_to_string(file).map_err(|e| format!("{file}: {e}"))?;
        *set = bazel_inputs(&text, dirname(file))?;
    }
    Ok(g)
}

// ── Minimal JSON reader (cargo metadata only) ─────────────────────────────

mod json {
    #[derive(Debug)]
    pub enum V {
        Null,
        Bool,
        Num,
        Str(String),
        Arr(Vec<V>),
        Obj(Vec<(String, V)>),
    }
    impl V {
        pub fn get(&self, k: &str) -> Option<&V> {
            match self {
                V::Obj(m) => m.iter().find(|(a, _)| a == k).map(|(_, v)| v),
                _ => None,
            }
        }
        pub fn arr(&self) -> Option<&[V]> {
            match self {
                V::Arr(a) => Some(a),
                _ => None,
            }
        }
        pub fn str(&self) -> Option<&str> {
            match self {
                V::Str(s) => Some(s),
                _ => None,
            }
        }
    }
    pub fn parse(s: &str) -> Result<V, String> {
        let b = s.as_bytes();
        let mut i = 0;
        let v = value(b, &mut i)?;
        ws(b, &mut i);
        if i != b.len() {
            return Err(format!("json: trailing data at {i}"));
        }
        Ok(v)
    }
    fn ws(b: &[u8], i: &mut usize) {
        while *i < b.len() && b[*i].is_ascii_whitespace() {
            *i += 1;
        }
    }
    fn value(b: &[u8], i: &mut usize) -> Result<V, String> {
        ws(b, i);
        match b.get(*i) {
            Some(b'{') => {
                *i += 1;
                let mut m = Vec::new();
                ws(b, i);
                if b.get(*i) == Some(&b'}') {
                    *i += 1;
                    return Ok(V::Obj(m));
                }
                loop {
                    ws(b, i);
                    let k = string(b, i)?;
                    ws(b, i);
                    if b.get(*i) != Some(&b':') {
                        return Err(format!("json: expected ':' at {i}"));
                    }
                    *i += 1;
                    m.push((k, value(b, i)?));
                    ws(b, i);
                    match b.get(*i) {
                        Some(b',') => *i += 1,
                        Some(b'}') => {
                            *i += 1;
                            return Ok(V::Obj(m));
                        }
                        _ => return Err(format!("json: expected ',' or '}}' at {i}")),
                    }
                }
            }
            Some(b'[') => {
                *i += 1;
                let mut a = Vec::new();
                ws(b, i);
                if b.get(*i) == Some(&b']') {
                    *i += 1;
                    return Ok(V::Arr(a));
                }
                loop {
                    a.push(value(b, i)?);
                    ws(b, i);
                    match b.get(*i) {
                        Some(b',') => *i += 1,
                        Some(b']') => {
                            *i += 1;
                            return Ok(V::Arr(a));
                        }
                        _ => return Err(format!("json: expected ',' or ']' at {i}")),
                    }
                }
            }
            Some(b'"') => Ok(V::Str(string(b, i)?)),
            Some(b't') if b[*i..].starts_with(b"true") => {
                *i += 4;
                Ok(V::Bool)
            }
            Some(b'f') if b[*i..].starts_with(b"false") => {
                *i += 5;
                Ok(V::Bool)
            }
            Some(b'n') if b[*i..].starts_with(b"null") => {
                *i += 4;
                Ok(V::Null)
            }
            Some(c) if *c == b'-' || c.is_ascii_digit() => {
                while *i < b.len() && matches!(b[*i], b'-' | b'+' | b'.' | b'e' | b'E' | b'0'..=b'9') {
                    *i += 1;
                }
                Ok(V::Num)
            }
            _ => Err(format!("json: unexpected input at {i}")),
        }
    }
    fn string(b: &[u8], i: &mut usize) -> Result<String, String> {
        if b.get(*i) != Some(&b'"') {
            return Err(format!("json: expected string at {i}"));
        }
        *i += 1;
        let mut out = Vec::new();
        while let Some(&c) = b.get(*i) {
            *i += 1;
            match c {
                b'"' => return String::from_utf8(out).map_err(|e| e.to_string()),
                b'\\' => {
                    let e = *b.get(*i).ok_or("json: bad escape")?;
                    *i += 1;
                    match e {
                        b'n' => out.push(b'\n'),
                        b't' => out.push(b'\t'),
                        b'r' => out.push(b'\r'),
                        b'b' => out.push(8),
                        b'f' => out.push(12),
                        b'u' => {
                            let h = std::str::from_utf8(b.get(*i..*i + 4).ok_or("json: bad \\u")?)
                                .map_err(|e| e.to_string())?;
                            let cp = u32::from_str_radix(h, 16).map_err(|e| e.to_string())?;
                            *i += 4;
                            let ch = char::from_u32(cp).unwrap_or('\u{fffd}');
                            let mut buf = [0u8; 4];
                            out.extend_from_slice(ch.encode_utf8(&mut buf).as_bytes());
                        }
                        other => out.push(other),
                    }
                }
                c => out.push(c),
            }
        }
        Err("json: unterminated string".into())
    }
}

// ── Entry point ───────────────────────────────────────────────────────────

fn changed_paths() -> Result<Vec<String>, String> {
    if let Ok(f) = std::env::var("GATE_PROBE_FILES") {
        if !f.is_empty() {
            let t = fs::read_to_string(&f).map_err(|e| format!("GATE_PROBE_FILES={f} is unreadable: {e}"))?;
            eprintln!("gate probe: classifying the paths listed in {f}");
            return Ok(t.lines().map(str::trim).filter(|l| !l.is_empty()).map(String::from).collect());
        }
    }
    let ev = std::env::var("EVENT_NAME").unwrap_or_default();
    if ev != "pull_request" && ev != "merge_group" {
        return Err(format!("non-PR, non-queue event ({})", if ev.is_empty() { "unset" } else { &ev }));
    }
    let base = std::env::var("BASE_SHA").unwrap_or_default();
    if base.is_empty() {
        return Err(format!("no base sha for {ev}"));
    }
    let out = Command::new("git")
        .args(["diff", "--name-only", &format!("{base}...HEAD")])
        .output()
        .map_err(|e| format!("git diff: {e}"))?;
    if !out.status.success() {
        return Err(format!("git diff failed against base={base}"));
    }
    eprintln!("event: {ev}, base: {base}");
    Ok(String::from_utf8_lossy(&out.stdout).lines().filter(|l| !l.is_empty()).map(String::from).collect())
}

fn emit(o: &Outputs) {
    let mut text = String::new();
    for k in KEYS {
        text.push_str(&format!("{k}={}\n", o[k]));
    }
    match std::env::var("GITHUB_OUTPUT") {
        Ok(p) if !p.is_empty() => {
            let ok = fs::OpenOptions::new()
                .create(true)
                .append(true)
                .open(&p)
                .and_then(|mut f| f.write_all(text.as_bytes()));
            if let Err(e) = ok {
                eprintln!("could not write {p}: {e}");
                std::process::exit(1);
            }
        }
        _ => print!("{text}"),
    }
}

fn main() {
    let o = match changed_paths().and_then(|c| {
        if c.is_empty() {
            return Err("no changed paths".into());
        }
        eprintln!("changed files:\n  {}", c.join("\n  "));
        let g = load_graph()?;
        Ok(classify(&c, &g))
    }) {
        Ok(o) => o,
        Err(why) => {
            eprintln!("→ {why}; failing closed, running every job");
            all(true)
        }
    };
    for k in KEYS {
        eprintln!("  {k:<6} {}", if o[k] { "run" } else { "skip" });
    }
    emit(&o);
}

#[cfg(test)]
mod tests {
    use super::*;

    fn paths(p: &[&str]) -> Vec<String> {
        p.iter().map(|s| s.to_string()).collect()
    }

    /// A small graph: core embeds a schema and depends on yaml; cli on core.
    fn graph() -> Graph {
        let mut g = Graph::default();
        for (c, d) in [("rivet-core", "rivet-core"), ("rivet-yaml", "rivet-yaml"), ("rivet-cli", "rivet-cli")] {
            g.crate_dir.insert(c.into(), d.into());
        }
        g.crate_deps.insert("rivet-core".into(), vec!["rivet-yaml".into()]);
        g.crate_deps.insert("rivet-cli".into(), vec!["rivet-core".into()]);
        g.crate_extra.insert("rivet-core".into(), ["schemas/dev.yaml".to_string()].into());
        g.embedded.insert("schemas/dev.yaml".into());
        g.verus_inputs = ["verus/BUILD.bazel", "rivet-core/src/verus_specs.rs", "rivet-core/src/BUILD.bazel"]
            .iter()
            .map(|s| s.to_string())
            .collect();
        g.rocq_inputs = ["proofs/rocq/Schema.v".to_string()].into();
        g
    }

    fn on(o: &Outputs) -> Vec<&'static str> {
        KEYS.iter().copied().filter(|k| o[k]).collect()
    }

    #[test]
    fn a_cli_only_change_skips_the_core_proofs() {
        let o = classify(&paths(&["rivet-cli/src/main.rs"]), &graph());
        assert_eq!(on(&o), vec!["rust", "tests", "wasm", "e2e", "vscode"]);
    }

    #[test]
    fn a_path_dependency_selects_its_dependents_jobs() {
        let o = classify(&paths(&["rivet-yaml/src/lib.rs"]), &graph());
        assert!(o["kani"] && o["miri"] && o["bench"], "{o:?}");
        assert!(!o["verus"] && !o["rocq"], "{o:?}");
    }

    #[test]
    fn an_embedded_asset_is_code_and_selects_its_crate() {
        let o = classify(&paths(&["schemas/dev.yaml"]), &graph());
        assert!(o["rust"] && o["kani"] && o["miri"], "{o:?}");
        let o = classify(&paths(&["schemas/other.yaml"]), &graph());
        assert_eq!(on(&o), vec!["tests"], "a schema nothing embeds is data");
    }

    #[test]
    fn verus_and_rocq_follow_their_build_files() {
        let o = classify(&paths(&["rivet-core/src/verus_specs.rs"]), &graph());
        assert!(o["verus"] && !o["rocq"] && o["proofs"], "{o:?}");
        let o = classify(&paths(&["proofs/rocq/Schema.v"]), &graph());
        assert_eq!(on(&o), vec!["rocq", "proofs"]);
        let o = classify(&paths(&["rivet-core/src/lib.rs"]), &graph());
        assert!(!o["verus"] && !o["rocq"], "{o:?}");
        let o = classify(&paths(&["tools/rules.bzl"]), &graph());
        assert!(o["verus"] && o["rocq"], "{o:?}");
    }

    #[test]
    fn ci_pins_and_unknown_paths_fail_closed() {
        for p in [".github/workflows/ci.yml", ".github/dependabot.yml", "tools/ci/x.sh", "Cargo.lock",
                  "Cargo.toml", "rust-toolchain.toml", ".cargo/mutants.toml", "MODULE.bazel", ".bazelversion"] {
            assert_eq!(classify(&paths(&[p]), &graph()), all(true), "{p}");
        }
        assert_eq!(classify(&[], &graph()), all(true));
        let o = classify(&paths(&["somewhere/new.thing"]), &graph());
        assert!(o["rust"] && o["tests"] && o["wasm"] && o["e2e"] && o["vscode"], "{o:?}");
    }

    #[test]
    fn data_and_docs_skip_every_heavy_job() {
        let o = classify(&paths(&["docs/guide.md", "README.md"]), &graph());
        assert_eq!(on(&o), vec!["tests"]);
        let o = classify(&paths(&["artifacts/requirements.yaml"]), &graph());
        assert_eq!(on(&o), vec!["tests", "e2e"]);
        let o = classify(&paths(&["supply-chain/audits.toml"]), &graph());
        assert_eq!(on(&o), vec!["tests", "wasm"]);
        let o = classify(&paths(&["vscode-rivet/package.json"]), &graph());
        assert_eq!(on(&o), vec!["vscode"]);
    }

    #[test]
    fn referenced_paths_reads_includes_and_path_attributes() {
        let src = "const A: &str = include_str!(\"../../schemas/a.yaml\");\n#[path = \"gen/x.rs\"]\nmod x;\nlet b = include_bytes!(\"b.bin\");";
        assert_eq!(referenced_paths(src), vec!["../../schemas/a.yaml", "b.bin", "gen/x.rs"]);
        assert_eq!(normalize("rivet-core/src/../../schemas/a.yaml").as_deref(), Some("schemas/a.yaml"));
        assert_eq!(normalize("../x"), None);
    }

    #[test]
    fn bazel_labels_resolve_or_fail_closed() {
        let b = "rust_x(srcs = [\"//rivet-core/src:verus_specs.rs\", \":local.rs\"])\nrocq(srcs = [\"Schema.v\"])";
        let s = bazel_inputs(b, "verus").unwrap();
        for p in ["verus/BUILD.bazel", "rivet-core/src/BUILD.bazel", "rivet-core/src/verus_specs.rs", "verus/local.rs", "verus/Schema.v"] {
            assert!(s.contains(p), "{p}: {s:?}");
        }
        assert!(bazel_inputs("x(srcs = glob([\"*.v\"]))", "p").is_err());
        assert!(bazel_inputs("x(srcs = [\"@ext//:a\"])", "p").is_err());
        assert!(bazel_inputs("x(srcs = [VAR])", "p").is_err());
    }

    #[test]
    fn json_reads_cargo_metadata_shapes() {
        let v = json::parse(r#"{"packages":[{"name":"ab","n":-1.5e3,"t":true,"z":null,"deps":[]}]}"#).unwrap();
        let p = &v.get("packages").unwrap().arr().unwrap()[0];
        assert_eq!(p.get("name").unwrap().str(), Some("ab"));
        assert!(json::parse("{\"a\":}").is_err());
        assert!(json::parse("[1,2] x").is_err());
    }

    /// FALSE-SKIP CONTROL on the real repository (run from its root, as the
    /// YAML Lint job does). Each heavy job's true input, named here by hand as
    /// an independent oracle, must select that job through the graph read from
    /// cargo metadata and the BUILD files; a docs-only change must select none.
    #[test]
    fn false_skip_control_on_the_real_repository() {
        let g = load_graph().expect("run from the repository root with cargo on PATH");
        let cases: &[(&str, &[&str])] = &[
            ("rivet-core/src/proofs.rs", &["kani", "miri", "bench", "rust"]),
            ("rivet-yaml/src/lib.rs", &["kani", "miri", "bench", "rust"]),
            ("rivet-core/benches/core_benchmarks.rs", &["bench", "kani", "rust"]),
            ("rivet-core/src/verus_specs.rs", &["verus", "kani", "rust"]),
            ("verus/BUILD.bazel", &["verus"]),
            ("proofs/rocq/Schema.v", &["rocq"]),
            ("rivet-cli/src/main.rs", &["rust", "e2e", "vscode"]),
            ("vscode-rivet/src/extension.ts", &["vscode"]),
            ("tests/playwright/x.spec.ts", &["e2e"]),
        ];
        for (p, want) in cases {
            let o = classify(&paths(&[p]), &g);
            for k in *want {
                assert!(o[k], "{p} must select {k}: {o:?}");
            }
        }
        // An asset rivet-core embeds is a true kani input although it is not
        // under rivet-core/: the graph must have found at least one.
        let core_extra = g.crate_extra.get("rivet-core").cloned().unwrap_or_default();
        assert!(!core_extra.is_empty(), "no embedded asset found for rivet-core");
        for p in &core_extra {
            let o = classify(&paths(&[p]), &g);
            assert!(o["kani"] && o["rust"], "{p} is embedded by rivet-core: {o:?}");
        }
        // Negative control: documentation selects no heavy job.
        let o = classify(&paths(&["docs/getting-started.md", "CHANGELOG.md"]), &g);
        for k in ["rust", "kani", "miri", "bench", "verus", "rocq", "e2e", "vscode"] {
            assert!(!o[k], "a docs-only change must not select {k}: {o:?}");
        }
    }
}
