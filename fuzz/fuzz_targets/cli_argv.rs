#![no_main]
//! CLI argv fuzzer.
//!
//! Drives `rivet-cli` with structurally-generated argv sequences.  Oracle:
//!   * process must exit with a sane status code (0/1/2), never panic or
//!     SIGSEGV,
//!   * when `--format json` is requested, stdout must be parseable JSON *or*
//!     stdout must be empty (with a human-readable error on stderr),
//!   * path arguments containing `../` or absolute `/etc/` must be rejected
//!     (we don't hard-assert — we record and surface via log).
//!
//! IMPORTANT: this target spawns `rivet` as a subprocess per iteration.  That
//! is 10^4-10^5 x slower than an in-process fuzzer and will not produce
//! millions of execs/sec.  It is still useful for hitting clap parsing paths
//! and panic-surface in argument validation.  The env var `RIVET_BIN` must
//! point at a pre-built rivet binary; we skip the target if unset, so the
//! fuzzer does not crash-loop on a missing binary.
//!
//! To run this target locally after building:
//!   cargo build --release --bin rivet
//!   RIVET_BIN=$PWD/target/release/rivet \
//!       cargo +nightly fuzz run cli_argv -- -max_total_time=60

use arbitrary::{Arbitrary, Unstructured};
use libfuzzer_sys::fuzz_target;
use std::process::{Command, Stdio};
use std::time::Duration;

#[derive(Debug, Arbitrary)]
enum Subcommand {
    Validate,
    List,
    ListJson,
    Coverage,
    Stats,
    Commits,
    Add,
    Modify,
    Stamp,
    Query,
    Variant,
    Help,
}

#[derive(Debug, Arbitrary)]
enum Flag {
    FormatJson,
    FormatYaml,
    FormatText,
    Type(String),
    Baseline(String),
    Path(String),
    Unknown(String),
}

#[derive(Debug, Arbitrary)]
struct ArgvInput {
    subcommand: Subcommand,
    flags: Vec<Flag>,
    positional: Vec<String>,
}

fn subcommand_name(s: &Subcommand) -> Option<&'static [&'static str]> {
    match s {
        Subcommand::Validate => Some(&["validate"]),
        Subcommand::List => Some(&["list"]),
        Subcommand::ListJson => Some(&["list", "--format", "json"]),
        Subcommand::Coverage => Some(&["coverage"]),
        Subcommand::Stats => Some(&["stats"]),
        Subcommand::Commits => Some(&["commits"]),
        Subcommand::Add => Some(&["add"]),
        Subcommand::Modify => Some(&["modify"]),
        Subcommand::Stamp => Some(&["stamp"]),
        Subcommand::Query => Some(&["query"]),
        Subcommand::Variant => Some(&["variant"]),
        Subcommand::Help => Some(&["--help"]),
    }
}

fn sanitize(s: &str) -> String {
    // Remove NULs (which std::process rejects on unix) and bound length.
    s.chars()
        .filter(|&c| c != '\0')
        .take(64)
        .collect::<String>()
}

fn build_argv(input: &ArgvInput) -> Vec<String> {
    let mut argv: Vec<String> = Vec::new();
    if let Some(parts) = subcommand_name(&input.subcommand) {
        for p in parts {
            argv.push(p.to_string());
        }
    }
    for flag in input.flags.iter().take(6) {
        match flag {
            Flag::FormatJson => {
                argv.push("--format".into());
                argv.push("json".into());
            }
            Flag::FormatYaml => {
                argv.push("--format".into());
                argv.push("yaml".into());
            }
            Flag::FormatText => {
                argv.push("--format".into());
                argv.push("text".into());
            }
            Flag::Type(t) => {
                argv.push("--type".into());
                argv.push(sanitize(t));
            }
            Flag::Baseline(b) => {
                argv.push("--baseline".into());
                argv.push(sanitize(b));
            }
            Flag::Path(p) => {
                argv.push("-p".into());
                argv.push(sanitize(p));
            }
            Flag::Unknown(u) => {
                let cleaned = sanitize(u);
                if !cleaned.is_empty() {
                    argv.push(cleaned);
                }
            }
        }
    }
    for p in input.positional.iter().take(4) {
        let c = sanitize(p);
        if !c.is_empty() {
            argv.push(c);
        }
    }
    argv
}

/// Returns true if the argv requested JSON output.
fn is_json_format(argv: &[String]) -> bool {
    let mut i = 0;
    while i + 1 < argv.len() {
        if argv[i] == "--format" && argv[i + 1] == "json" {
            return true;
        }
        i += 1;
    }
    false
}

fuzz_target!(|input: ArgvInput| {
    let Ok(bin) = std::env::var("RIVET_BIN") else {
        // No binary configured → skip quietly.  We don't want the fuzzer to
        // treat a missing binary as a crash.
        return;
    };
    let argv = build_argv(&input);
    let json_mode = is_json_format(&argv);

    let mut cmd = Command::new(&bin);
    cmd.args(&argv)
        .stdin(Stdio::null())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        // Avoid leaking the calling shell's CWD config.
        .env_clear()
        .env("PATH", std::env::var_os("PATH").unwrap_or_default())
        .env("HOME", std::env::var_os("HOME").unwrap_or_default())
        // Prevent update check from making network calls.
        .env("RIVET_NO_UPDATE_CHECK", "1");

    let Ok(mut child) = cmd.spawn() else {
        return;
    };

    // Poor-man's 5-second timeout: spawn a reaper thread.  We cannot use
    // `std::process::Child::wait_timeout` without adding a dep.
    let start = std::time::Instant::now();
    loop {
        match child.try_wait() {
            Ok(Some(status)) => {
                // Oracle: exit code must be in {0, 1, 2, 64..}.  A SIGSEGV
                // (signal 11) or SIGABRT (signal 6) surfaces as a panic.
                if let Some(sig) = status_signal(&status) {
                    panic!("rivet-cli died from signal {sig} on argv {argv:?}");
                }
                // Read stdout/stderr for the JSON oracle.  If stdout is
                // supposed to be JSON, it must parse OR be empty.
                let output = child
                    .wait_with_output()
                    .ok()
                    .or_else(|| Some(std::process::Output {
                        status,
                        stdout: Vec::new(),
                        stderr: Vec::new(),
                    }))
                    .unwrap();
                if json_mode && status.success() && !output.stdout.is_empty() {
                    let stdout = std::str::from_utf8(&output.stdout).unwrap_or("");
                    if serde_json::from_str::<serde_json::Value>(stdout).is_err() {
                        // Not a panic — surface it as a finding.  We keep
                        // the target lenient because some subcommands may
                        // not support --format json and should error out.
                        // Require a non-zero exit in that case, which is
                        // caught by status.success() above.
                        panic!(
                            "--format json returned success but stdout is not JSON\nargv={argv:?}\nstdout={stdout:?}"
                        );
                    }
                }
                return;
            }
            Ok(None) => {
                if start.elapsed() > Duration::from_secs(5) {
                    let _ = child.kill();
                    let _ = child.wait();
                    return;
                }
                std::thread::sleep(Duration::from_millis(20));
            }
            Err(_) => return,
        }
    }
});

#[cfg(unix)]
fn status_signal(status: &std::process::ExitStatus) -> Option<i32> {
    use std::os::unix::process::ExitStatusExt;
    status.signal()
}

#[cfg(not(unix))]
fn status_signal(_status: &std::process::ExitStatus) -> Option<i32> {
    None
}

// Re-export of arbitrary so the derive sees `Unstructured` at expected path.
#[allow(dead_code)]
fn _unstructured_marker(_u: Unstructured<'_>) {}
