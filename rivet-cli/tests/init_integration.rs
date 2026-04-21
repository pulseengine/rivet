//! Integration tests for `rivet init --agents` managed-section behaviour.
//!
//! The managed-section scheme ensures `rivet init --agents` regenerates only
//! the content between `BEGIN rivet-managed` / `END rivet-managed` HTML
//! comments. Manual content outside the markers must be preserved across
//! regenerations.
//!
//! These tests exercise the full CLI binary end-to-end: they spawn a fresh
//! `rivet init` to create a project, then run `rivet init --agents` with
//! various pre-existing states for AGENTS.md / CLAUDE.md and verify the
//! resulting file content, exit codes, and diagnostic output.

use std::process::Command;

/// Locate the `rivet` binary built by cargo.
fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Create a fresh rivet project in a temporary directory. Returns the
/// `TempDir` (which must be kept alive for the duration of the test so the
/// directory isn't cleaned up early) and a ready-to-use path.
fn make_project() -> (tempfile::TempDir, std::path::PathBuf) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();

    let output = Command::new(rivet_bin())
        .args(["init", "--preset", "dev", "--dir", dir.to_str().unwrap()])
        .output()
        .expect("failed to execute rivet init");
    assert!(
        output.status.success(),
        "rivet init --preset dev must exit 0. stderr: {}",
        String::from_utf8_lossy(&output.stderr)
    );
    (tmp, dir)
}

/// Run `rivet --project <dir> init --agents [extra args]` and return the
/// raw `Output` so callers can inspect exit status + stderr.
fn run_init_agents(dir: &std::path::Path, extra: &[&str]) -> std::process::Output {
    let mut args = vec!["--project", dir.to_str().unwrap(), "init", "--agents"];
    args.extend_from_slice(extra);
    Command::new(rivet_bin())
        .args(&args)
        .output()
        .expect("failed to execute rivet init --agents")
}

// ── markers: constants mirroring rivet_core::managed_section ────────────────
// We match on prefixes to stay insensitive to the explanatory text in the
// opening comment.
const BEGIN_PREFIX: &str = "<!-- BEGIN rivet-managed";
const END_PREFIX: &str = "<!-- END rivet-managed";

fn count_markers(content: &str) -> (usize, usize) {
    let mut begins = 0;
    let mut ends = 0;
    for line in content.lines() {
        let t = line.trim_start();
        if t.starts_with(BEGIN_PREFIX) {
            begins += 1;
        } else if t.starts_with(END_PREFIX) {
            ends += 1;
        }
    }
    (begins, ends)
}

// ── Tests ───────────────────────────────────────────────────────────────────

/// Regenerating into a non-existent AGENTS.md writes the file wrapped with
/// a single BEGIN/END rivet-managed pair.
#[test]
fn agents_md_fresh_file_has_markers() {
    let (_tmp, dir) = make_project();
    let agents = dir.join("AGENTS.md");
    // Ensure the preset didn't drop an AGENTS.md.
    if agents.exists() {
        std::fs::remove_file(&agents).unwrap();
    }

    let out = run_init_agents(&dir, &[]);
    assert!(
        out.status.success(),
        "first `rivet init --agents` must succeed on empty tree. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    assert!(agents.exists(), "AGENTS.md must be created");

    let body = std::fs::read_to_string(&agents).unwrap();
    let (begins, ends) = count_markers(&body);
    assert_eq!(begins, 1, "expected exactly one BEGIN marker, got:\n{body}");
    assert_eq!(ends, 1, "expected exactly one END marker, got:\n{body}");
}

/// Manual prose above and below the markers is preserved verbatim across
/// regeneration; only the content between markers is replaced.
#[test]
fn agents_md_preserves_manual_section_outside_markers() {
    let (_tmp, dir) = make_project();
    let agents = dir.join("AGENTS.md");

    // Seed the file with manual prose wrapped around a minimal managed stub.
    let seed = "\
# Manually Edited AGENTS.md

MANUAL_MARKER_ABOVE_THE_REGION
Some audit notes a downstream consumer cares about.

<!-- BEGIN rivet-managed: seed -->
old generated content that should be replaced
<!-- END rivet-managed -->

MANUAL_MARKER_BELOW_THE_REGION
Closing notes, SLAs, whatever.
";
    std::fs::write(&agents, seed).unwrap();

    let out = run_init_agents(&dir, &[]);
    assert!(
        out.status.success(),
        "splice-mode `rivet init --agents` must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let body = std::fs::read_to_string(&agents).unwrap();
    assert!(
        body.contains("MANUAL_MARKER_ABOVE_THE_REGION"),
        "manual content above the markers must be preserved, got:\n{body}"
    );
    assert!(
        body.contains("MANUAL_MARKER_BELOW_THE_REGION"),
        "manual content below the markers must be preserved, got:\n{body}"
    );
    assert!(
        !body.contains("old generated content"),
        "managed region content must be replaced, got:\n{body}"
    );
    assert!(
        body.contains("# AGENTS.md — Rivet Project Instructions"),
        "managed region must contain regenerated header, got:\n{body}"
    );
    let (begins, ends) = count_markers(&body);
    assert_eq!(begins, 1, "still exactly one BEGIN marker");
    assert_eq!(ends, 1, "still exactly one END marker");
}

/// With no markers and no explicit flag, the command must refuse (exit 1)
/// and leave the file untouched.
#[test]
fn agents_md_refuses_no_markers_default() {
    let (_tmp, dir) = make_project();
    let agents = dir.join("AGENTS.md");

    let seed = "# Hand-authored AGENTS.md\n\nAll manual, no markers.\n";
    std::fs::write(&agents, seed).unwrap();
    let before = std::fs::read_to_string(&agents).unwrap();

    let out = run_init_agents(&dir, &[]);
    assert!(
        !out.status.success(),
        "rivet init --agents must refuse when AGENTS.md has no markers. stdout: {}, stderr: {}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("rivet-managed markers") || stderr.contains("--migrate"),
        "refusal message should mention markers or --migrate, got stderr: {stderr}"
    );

    let after = std::fs::read_to_string(&agents).unwrap();
    assert_eq!(
        before, after,
        "AGENTS.md must be byte-for-byte identical after refusal"
    );
}

/// `--force-regen` overwrites a no-marker file with freshly markered content
/// and warns loudly on stderr.
#[test]
fn agents_md_force_regen_overwrites_no_markers() {
    let (_tmp, dir) = make_project();
    let agents = dir.join("AGENTS.md");

    let seed = "# OLD HAND AUTHORED CONTENT\n\nOLD_SENTINEL_DELETE_ME\n";
    std::fs::write(&agents, seed).unwrap();

    let out = run_init_agents(&dir, &["--force-regen"]);
    assert!(
        out.status.success(),
        "--force-regen must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("force-regen") || stderr.contains("warning"),
        "--force-regen must print a warning on stderr, got: {stderr}"
    );

    let body = std::fs::read_to_string(&agents).unwrap();
    assert!(
        !body.contains("OLD_SENTINEL_DELETE_ME"),
        "--force-regen must discard the previous content, got:\n{body}"
    );
    let (begins, ends) = count_markers(&body);
    assert_eq!(begins, 1, "expected one BEGIN after force-regen");
    assert_eq!(ends, 1, "expected one END after force-regen");
}

/// `--migrate` wraps existing content: the managed section is placed on top
/// and the prior content is preserved verbatim below.
#[test]
fn agents_md_migrate_wraps_existing_content() {
    let (_tmp, dir) = make_project();
    let agents = dir.join("AGENTS.md");

    let seed = "# Downstream hand-authored AGENTS.md\n\nMIGRATE_SENTINEL_KEEP_ME\n";
    std::fs::write(&agents, seed).unwrap();

    let out = run_init_agents(&dir, &["--migrate"]);
    assert!(
        out.status.success(),
        "--migrate must succeed. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let body = std::fs::read_to_string(&agents).unwrap();
    let (begins, ends) = count_markers(&body);
    assert_eq!(begins, 1, "migrate emits exactly one BEGIN marker");
    assert_eq!(ends, 1, "migrate emits exactly one END marker");

    // Managed region must appear above the original content.
    let begin_pos = body
        .find(BEGIN_PREFIX)
        .expect("BEGIN marker must exist after --migrate");
    let end_pos = body
        .find(END_PREFIX)
        .expect("END marker must exist after --migrate");
    let sentinel_pos = body
        .find("MIGRATE_SENTINEL_KEEP_ME")
        .expect("migrated content must be preserved");
    assert!(
        begin_pos < end_pos,
        "BEGIN must precede END in migrated file"
    );
    assert!(
        end_pos < sentinel_pos,
        "preserved content must appear below the managed region after --migrate"
    );

    // Re-running without flags should now splice cleanly (markers exist).
    let out2 = run_init_agents(&dir, &[]);
    assert!(
        out2.status.success(),
        "second regen after migrate must splice cleanly. stderr: {}",
        String::from_utf8_lossy(&out2.stderr)
    );
    let body2 = std::fs::read_to_string(&agents).unwrap();
    assert!(
        body2.contains("MIGRATE_SENTINEL_KEEP_ME"),
        "preserved content must still be present after a subsequent splice"
    );
}

/// A file with two BEGIN/END pairs is structurally ambiguous; the command
/// refuses rather than silently pick one.
#[test]
fn agents_md_multiple_markers_rejected() {
    let (_tmp, dir) = make_project();
    let agents = dir.join("AGENTS.md");

    let seed = "\
# Pathological file
<!-- BEGIN rivet-managed: first -->
managed block A
<!-- END rivet-managed -->

middle prose

<!-- BEGIN rivet-managed: second -->
managed block B
<!-- END rivet-managed -->
";
    std::fs::write(&agents, seed).unwrap();
    let before = std::fs::read_to_string(&agents).unwrap();

    let out = run_init_agents(&dir, &[]);
    assert!(
        !out.status.success(),
        "rivet init --agents must refuse multiple BEGIN markers. stdout: {}, stderr: {}",
        String::from_utf8_lossy(&out.stdout),
        String::from_utf8_lossy(&out.stderr)
    );
    let stderr = String::from_utf8_lossy(&out.stderr);
    assert!(
        stderr.contains("multiple") || stderr.contains("BEGIN"),
        "refusal should mention multiple markers, got: {stderr}"
    );

    let after = std::fs::read_to_string(&agents).unwrap();
    assert_eq!(
        before, after,
        "file must be untouched when multi-marker error is raised"
    );
}

/// CLAUDE.md gets the same marker treatment as AGENTS.md; manual prose
/// outside the markers is preserved on regeneration.
#[test]
fn claude_md_preserves_manual_section_outside_markers() {
    let (_tmp, dir) = make_project();
    let claude = dir.join("CLAUDE.md");

    let seed = "\
# Local CLAUDE.md overrides

CLAUDE_MANUAL_SENTINEL_TOP

<!-- BEGIN rivet-managed: stub -->
stale stub body
<!-- END rivet-managed -->

CLAUDE_MANUAL_SENTINEL_BOTTOM
";
    std::fs::write(&claude, seed).unwrap();

    // AGENTS.md must also have markers (or not exist) or the whole command
    // will fail on the AGENTS.md write path before it reaches CLAUDE.md.
    let agents = dir.join("AGENTS.md");
    if agents.exists() {
        std::fs::remove_file(&agents).unwrap();
    }

    let out = run_init_agents(&dir, &[]);
    assert!(
        out.status.success(),
        "rivet init --agents must succeed with markered CLAUDE.md. stderr: {}",
        String::from_utf8_lossy(&out.stderr)
    );

    let body = std::fs::read_to_string(&claude).unwrap();
    assert!(
        body.contains("CLAUDE_MANUAL_SENTINEL_TOP"),
        "manual content above markers must survive, got:\n{body}"
    );
    assert!(
        body.contains("CLAUDE_MANUAL_SENTINEL_BOTTOM"),
        "manual content below markers must survive, got:\n{body}"
    );
    assert!(
        !body.contains("stale stub body"),
        "managed region content must be replaced, got:\n{body}"
    );
}
