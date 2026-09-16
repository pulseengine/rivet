//! `rivet check verification-evidence` gate decision, factored out for tests.
//!
//! Background — the shape this fixes (#954).
//!
//! `rivet check verification-evidence` reads each artifact's
//! `fields.steps[].run` looking for `cargo test <filter>` invocations and
//! asserts that a test matching the filter exists somewhere in the scanned
//! Rust sources. `cargo test <renamed_or_typod_filter>` exits 0 with "0
//! passed", so a stale filter would otherwise keep the requirement silently
//! `verified` — the very drift class the checker was built for (REQ-236,
//! hardened again in REQ-280).
//!
//! The command has been sitting behind the `traceability` job in `ci.yml`
//! and behind the hosted floor. It ran green every push on a corpus with
//! zero `fields.steps[].run` entries — the scan checked nothing and the
//! exit code said pass. #770 flipped the *text* output for that case
//! (`⚠ verification-evidence: no named-test step(s) found to check —
//! nothing was verified.`), but the *return value* stayed `missing.is_empty()`.
//! On an empty corpus that is `true`, so the pipeline read 0. A gate that
//! examined nothing was reporting itself green.
//!
//! Mirroring what `rivet check sources` just gained in REQ-357: a caller-opted
//! `--min N` floor on the checked population. `--min 0` (the default) keeps
//! existing behaviour so a project that legitimately has no named-test steps
//! keeps exiting 0. A project that expects them declares how many, and a
//! corpus that drops below the floor — steps deleted, or steps that stopped
//! parsing after a schema rename — fails instead of passing quietly.
//!
//! The decision lives here so it can be unit-tested. `rivet-cli` has no lib
//! target, so logic left in `main.rs` is only exercised through the binary.

/// A minimal snapshot of `cmd_check_verification_evidence`'s run — enough
/// for [`gate_reason`] to decide.
///
/// `empty_scan` is redundant with `checked == 0 && skipped == 0`, but the
/// caller already computes it (the `--json` output prints it as a distinct
/// field), so mirroring it avoids two definitions of "empty" drifting apart.
#[derive(Debug, Default, Clone, Copy, PartialEq, Eq)]
pub struct Report {
    /// Number of `fields.steps[].run` entries that parsed as a cargo-test
    /// filter and were resolved against the scanned `fn` names. Skipped
    /// nextest-filterset steps are counted in [`Self::skipped`], not here.
    pub checked: usize,
    /// Steps whose filter matched no scanned test — the drift the command
    /// exists to catch.
    pub missing: usize,
    /// Steps deferred because their expression (`-E`/`--filter-expr`)
    /// addresses full test paths / regexes and the leaf-`fn`-name scanner
    /// cannot evaluate them (REQ-280/REQ-281). Reported so the caller sees
    /// what was NOT verified.
    pub skipped: usize,
    /// `checked == 0 && skipped == 0` — the run examined nothing. Mirrors
    /// the JSON output's `empty_scan` field.
    pub empty_scan: bool,
}

/// Why this run should fail, or `None` to pass.
///
/// Two obligations, and the order matters for the message:
///
/// 1. The POPULATION. On a corpus with no named-test steps the missing count
///    is 0, and the command exited 0 having examined nothing. That is absence
///    reported as success on the assurance chain, where a named-test step
///    that stopped parsing after a rename would look identical to a corpus
///    that legitimately carries none. `--min N` is the positive control the
///    caller opts into.
///
/// 2. The MISSING count itself, unchanged — a step whose filter matches no
///    scanned test is the drift class the command exists to find.
///
/// `min` is a caller-opted floor, not a changed default: a project with no
/// named-test steps is a legitimate configuration and keeps exiting 0 at
/// `min == 0`. Meeting the floor never excuses missing tests — checked by
/// its own test, because a flag that could mask the defect the command
/// exists to find would be worse than the gap it closes.
pub fn gate_reason(report: &Report, min: usize) -> Option<String> {
    if report.checked < min {
        return Some(if report.checked == 0 {
            format!(
                "--min {min} was requested but this run checked nothing: no artifact \
                 carries a `fields.steps[].run` naming a cargo-test filter. Exiting 0 \
                 here would report an empty population as a verified one."
            )
        } else {
            format!(
                "--min {min} was requested but only {} named-test step(s) were checked. \
                 A step that stopped parsing after a schema rename would look identical \
                 to a step that was removed.",
                report.checked
            )
        });
    }
    if report.missing > 0 {
        return Some(format!(
            "{} named-test step(s) reference a test that does not exist",
            report.missing
        ));
    }
    None
}

#[cfg(test)]
mod tests {
    use super::*;

    fn rep(checked: usize, missing: usize, skipped: usize) -> Report {
        Report {
            checked,
            missing,
            skipped,
            empty_scan: checked == 0 && skipped == 0,
        }
    }

    /// The default (--min 0) keeps the prior behaviour: a project with no
    /// named-test steps must still exit 0. A flag whose default changes the
    /// exit code of a green pipeline would break every downstream consumer.
    #[test]
    fn min_zero_is_the_current_behaviour_and_accepts_an_empty_corpus() {
        assert_eq!(gate_reason(&rep(0, 0, 0), 0), None);
    }

    /// The bug in the issue: `check verification-evidence` returned ok=true on
    /// a corpus with zero `run:` entries. With --min opted in, that empty
    /// scan is now a failure with a message naming what was expected.
    #[test]
    fn an_empty_corpus_fails_when_a_minimum_is_required() {
        let why = gate_reason(&rep(0, 0, 0), 1)
            .expect("requiring 1 named-test step over an empty corpus must fail");
        assert!(
            why.contains("--min 1") && why.contains("checked nothing"),
            "the message must say the population was empty, not merely that a \
             threshold was missed: {why}"
        );
    }

    /// The shortfall must be reported against the REQUESTED minimum, so a
    /// corpus that shrank below it is caught too — not only the empty case.
    /// This is the drift the command was built for: steps that stopped
    /// parsing after a schema rename.
    #[test]
    fn a_shrunken_corpus_fails_against_its_declared_minimum() {
        let why = gate_reason(&rep(3, 0, 0), 5).expect("3 < 5 must fail");
        assert!(why.contains('3') && why.contains("--min 5"), "got: {why}");
        assert_eq!(gate_reason(&rep(5, 0, 0), 5), None, "5 >= 5 passes");
    }

    /// --min is a floor on the population, NOT a substitute for the missing
    /// check. A corpus that meets the minimum and has missing tests must
    /// still fail, or the new flag would mask the defect the command exists
    /// to find.
    #[test]
    fn meeting_the_minimum_does_not_excuse_missing() {
        let why = gate_reason(&rep(5, 2, 0), 5).expect("missing must still fire");
        assert!(why.contains("does not exist"), "got: {why}");
        assert!(
            why.contains('2'),
            "count of missing steps must appear: {why}"
        );
    }

    /// Missing must fire even without --min set — the pre-existing behaviour
    /// stays load-bearing.
    #[test]
    fn missing_still_fires_with_min_zero() {
        let why = gate_reason(&rep(3, 1, 0), 0).expect("missing must fire regardless of --min");
        assert!(why.contains("does not exist"), "got: {why}");
    }

    /// Skipped steps (nextest filterset) do not count toward `checked`
    /// because the scanner cannot verify them, so a corpus of only skipped
    /// steps under `--min N > 0` is still "checked nothing". Documented via
    /// the shape of `Report::empty_scan`.
    #[test]
    fn skipped_alone_does_not_satisfy_the_floor() {
        // 0 checked, 2 skipped, floor of 1 → still empty from the gate's POV.
        let why = gate_reason(&rep(0, 0, 2), 1)
            .expect("skipped steps are not verified evidence; the floor must still fire");
        assert!(why.contains("checked nothing"), "got: {why}");
    }
}
