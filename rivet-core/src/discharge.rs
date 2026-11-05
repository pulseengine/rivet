//! Clause discharge for `rivet verify` (#838, option 3).
//!
//! A requirement is often a list of clauses, but a `verifies` link or marker
//! attaches to the whole requirement. So "has evidence" is coarser than the
//! claim, and `rivet verify` used to advance a requirement whose clause 3 was
//! undischarged exactly as it advanced one whose clauses all held. The reader
//! of `status: verified` could not tell the two apart.
//!
//! This module makes the judgement explicit. When a description states a
//! numbered clause list, `rivet verify` must be told which clauses the
//! evidence discharges (`--clauses-discharged`), and a partial discharge must
//! say why the rest are pending (`--note`). The claim is recorded on the
//! artifact (`discharged-clauses`, `discharge-note`), so the caveat is in the
//! trace graph rather than in a commit message.
//!
//! # Detection fails closed
//!
//! An UNDERCOUNT is the dangerous error: a description with three clauses read
//! as one lets `--clauses-discharged 1` record a full discharge. So detection
//! never guesses. It reads every line that OPENS with a number (`<digits>.`
//! or `<digits>)` then whitespace, after any indentation). Detection does not
//! parse fences: a description with any fence
//! line (three or more backticks or tildes) and any line opening with a
//! number is ambiguous, since getting fence scope wrong hides clauses:
//!
//! - none at all: [`Detection::None`], and `rivet verify` behaves as before;
//! - exactly `1, 2, …, N`, in order: [`Detection::Clauses`];
//! - anything else, including Markdown's lazy `1. 1. 1.`, a nested sub-list,
//!   two lists, a numbered prose or continuation line, a skipped number, or
//!   numbering inside a line such as a folded (`>`) description leaves behind:
//!   [`Detection::Ambiguous`], and `rivet verify` refuses until the author
//!   states the count.
//!
//! A LAST line `# rivet: clauses = N` states the count and resolves any
//! ambiguity; `N = 0` says the description has no clauses. The stated count
//! can raise the count, never lower it: N below the number of lines opening
//! with a number (anywhere, fenced or not) is ambiguous, so a stale override
//! or one inside a fenced example cannot undercount. An override-looking
//! line anywhere but last, a second one, or one that does not parse is
//! ambiguous rather than ignored.
//!
//! A recorded discharge names clauses by number, and prose clauses renumber
//! when the description is edited (REQ-308). So the record also carries a
//! [`fingerprint`] of the clause opening lines as they were when the
//! judgement was made; [`is_stale`] says when the description has moved on.
//! It catches renumbering, added or removed clauses, and edits to a clause's
//! first line, not edits to wrapped continuation lines. Under the override
//! detection does not know which lines are clauses, so the whole description
//! is fingerprinted and any edit to it makes the record stale.

use std::fmt;

/// The field recording which clauses `rivet verify` was told the evidence
/// discharges.
pub const DISCHARGED_FIELD: &str = "discharged-clauses";
/// The field recording why the clauses not in [`DISCHARGED_FIELD`] are
/// pending.
pub const NOTE_FIELD: &str = "discharge-note";
/// The field recording [`fingerprint`] of the clauses the judgement was about.
pub const FINGERPRINT_FIELD: &str = "discharge-fingerprint";
/// The most clauses a description may state, and the most a
/// `--clauses-discharged` value may expand to. Bounds every allocation that a
/// number in a description or on the command line controls.
pub const MAX_CLAUSES: usize = 1000;

/// The numbered clauses a description states.
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Clauses {
    /// How many clauses there are, numbered `1..=count`.
    pub count: usize,
    /// Each detected clause with the line that opens it, for
    /// `rivet verify --explain-clauses`. Empty when the count came from the
    /// override.
    pub anchors: Vec<(usize, String)>,
    /// True when `# rivet: clauses = N` set the count.
    pub overridden: bool,
}

/// What detection makes of a description.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Detection {
    /// No numbered clauses.
    None,
    /// A clean `1..=N` clause list, or an override.
    Clauses(Clauses),
    /// Numbering detection cannot read with certainty; the reason says why.
    /// Resolved by a `# rivet: clauses = N` line.
    Ambiguous(String),
}

impl Detection {
    /// The clauses, when detection is certain there are some.
    pub fn clauses(&self) -> Option<&Clauses> {
        match self {
            Self::Clauses(c) => Some(c),
            _ => None,
        }
    }
}

/// The digits a line opens with, if it starts (after leading whitespace)
/// with `<digits>.` or `<digits>)` followed by whitespace or the end of line.
fn opening_digits(line: &str) -> Option<&str> {
    let t = line.trim_start();
    let n = t.bytes().take_while(u8::is_ascii_digit).count();
    if n == 0 {
        return None;
    }
    let rest = t.get(n..)?;
    let mut chars = rest.chars();
    match (chars.next(), chars.next()) {
        (Some('.' | ')'), None) => t.get(..n),
        (Some('.' | ')'), Some(c)) if c.is_whitespace() => t.get(..n),
        _ => None,
    }
}

/// `Some(Ok(n))` for a well-formed `# rivet: clauses = N` line, `Some(Err)`
/// for a line that claims to be one and does not parse, `None` otherwise.
fn override_line(line: &str) -> Option<Result<usize, String>> {
    let t = line.trim().strip_prefix('#')?.trim_start();
    let lower = t.to_ascii_lowercase();
    let after = lower.strip_prefix("rivet:")?.trim_start();
    let value = after.strip_prefix("clauses")?.trim_start();
    let Some(value) = value.strip_prefix('=') else {
        return Some(Err(format!("malformed override `{}`", line.trim())));
    };
    Some(
        value
            .trim()
            .parse::<usize>()
            .map_err(|_| format!("malformed override `{}`", line.trim())),
    )
}

/// A line that may open or close a code fence: three or more backticks or
/// tildes, at any indentation. Deliberately loose: detection does not parse
/// fences (CommonMark scopes them to list items and indentation, and getting
/// that wrong hides clauses), it only notices that one may be there.
fn looks_like_fence(line: &str) -> bool {
    let t = line.trim_start();
    t.starts_with("```") || t.starts_with("~~~")
}

/// `description` with every line break a reader's editor shows as one made
/// `\n` (CRLF, a lone CR, and the Unicode separators `str::lines` does not
/// split on: U+0085, U+2028, U+2029, vertical tab, form feed) and every
/// invisible format character removed, so a zero-width space pasted in front
/// of `3.` cannot hide clause 3.
fn normalise_lines(description: &str) -> String {
    description
        .replace("\r\n", "\n")
        .replace(
            ['\r', '\u{85}', '\u{2028}', '\u{2029}', '\u{0B}', '\u{0C}'],
            "\n",
        )
        .chars()
        .filter(|c| !is_format_char(*c))
        .collect()
}

/// The Unicode format characters (category Cf) that render as nothing in
/// running text: soft hyphen, zero-width spaces and joiners, directional
/// marks and embeddings, word joiners and invisible operators, and the BOM.
fn is_format_char(c: char) -> bool {
    matches!(
        c,
        '\u{AD}'
            | '\u{061C}'
            | '\u{180E}'
            | '\u{200B}'..='\u{200F}'
            | '\u{202A}'..='\u{202E}'
            | '\u{2060}'..='\u{2064}'
            | '\u{2066}'..='\u{206F}'
            | '\u{FEFF}'
    )
}

/// How far the words of `text` run `1.`, `2.`, `3.`, … in order, wherever they
/// sit: what YAML leaves of a numbered list in a folded (`>`) description, or
/// a clause line that carries more numbered clauses. Only the `N.` form
/// counts: `N)` inside a line is usually a parenthetical, as in
/// "(case 1) … (case 2)", which is how REQ-294 reads.
fn inline_sequence(text: &str) -> usize {
    let mut next = 1usize;
    for w in text.split_whitespace() {
        if w.strip_suffix('.').and_then(|d| d.parse::<usize>().ok()) == Some(next) {
            next += 1;
        }
    }
    next - 1
}

/// Detect the numbered clauses `description` states. See the module docs for
/// the rule; it fails closed.
pub fn detect(description: &str) -> Detection {
    let text = normalise_lines(description);

    // The override is the description's last non-blank line, and it can
    // raise the count, never lower it below the lines opening with a number:
    // a stale override, or one inside a fenced example, must not undercount.
    let last = text.lines().rev().find(|l| !l.trim().is_empty());
    let overrides = text.lines().filter(|l| override_line(l).is_some()).count();
    if let Some(found) = last.and_then(override_line) {
        // The floor: every line opening with a number, its highest label, and
        // the longest in-order inline run, whichever is largest.
        let labels: Vec<usize> = text
            .lines()
            .filter_map(opening_digits)
            .map(|d| d.parse::<usize>().unwrap_or(usize::MAX))
            .collect();
        let numbered = labels
            .len()
            .max(labels.iter().copied().max().unwrap_or(0))
            .max(inline_sequence(&text));
        return match found {
            _ if overrides > 1 => Detection::Ambiguous(
                "more than one `# rivet: clauses` line; only the last line may be one".into(),
            ),
            Err(e) => Detection::Ambiguous(e),
            Ok(n) if n < numbered => Detection::Ambiguous(format!(
                "`# rivet: clauses = {n}` is below the {numbered} clause(s) the numbering \
                 shows; the stated count can raise the count, never lower it"
            )),
            Ok(0) => Detection::None,
            Ok(n) if n > MAX_CLAUSES => Detection::Ambiguous(format!(
                "`# rivet: clauses = {n}` exceeds the limit of {MAX_CLAUSES}"
            )),
            Ok(n) => Detection::Clauses(Clauses {
                count: n,
                anchors: Vec::new(),
                overridden: true,
            }),
        };
    }
    if overrides > 0 {
        return Detection::Ambiguous(
            "a `# rivet: clauses` line must be the description's last line".into(),
        );
    }

    let has_fence = text.lines().any(looks_like_fence);
    let mut anchors: Vec<(usize, String)> = Vec::new();
    for line in text.lines() {
        let Some(digits) = opening_digits(line) else {
            continue;
        };
        if has_fence {
            return Detection::Ambiguous(
                "the description has a code fence and a line opening with a number, \
                 and detection does not read fences"
                    .into(),
            );
        }
        let expected = anchors.len() + 1;
        match digits.parse::<usize>() {
            Ok(n) if n == expected && n <= MAX_CLAUSES => {
                anchors.push((n, line.trim().to_string()));
            }
            _ => {
                return Detection::Ambiguous(format!(
                    "`{}` opens with {digits} where clause {expected} was expected; \
                     a numbered list must run 1, 2, 3, … with no other line opening \
                     with a number",
                    line.trim()
                ));
            }
        }
    }
    // Numbering inside a line that runs past the list: a folded `>`
    // description, or a clause line carrying more clauses.
    if inline_sequence(&text) > anchors.len().max(1) {
        return Detection::Ambiguous(
            "numbering appears inside a line (`1. … 2. …`), as a folded `>` \
             description leaves a list"
                .into(),
        );
    }
    if anchors.is_empty() {
        return Detection::None;
    }
    Detection::Clauses(Clauses {
        count: anchors.len(),
        anchors,
        overridden: false,
    })
}

/// Parse a `--clauses-discharged` value: comma-separated clause numbers and
/// inclusive ranges, e.g. `1,2,4` or `1-3,5`. Sorted and deduplicated; no
/// number or range may go past [`MAX_CLAUSES`].
pub fn parse_clause_list(s: &str) -> Result<Vec<usize>, String> {
    let mut out = Vec::new();
    for part in s.split(',').map(str::trim).filter(|p| !p.is_empty()) {
        let num = |x: &str| {
            let n = x
                .trim()
                .parse::<usize>()
                .map_err(|_| format!("'{x}' is not a clause number in '{s}'"))?;
            if n > MAX_CLAUSES {
                return Err(format!("clause {n} is past the limit of {MAX_CLAUSES}"));
            }
            Ok(n)
        };
        match part.split_once('-') {
            Some((a, b)) => {
                let (a, b) = (num(a)?, num(b)?);
                if a > b {
                    return Err(format!("range '{part}' runs backwards"));
                }
                out.extend(a..=b);
            }
            None => out.push(num(part)?),
        }
    }
    out.sort_unstable();
    out.dedup();
    Ok(out)
}

/// A discharge `rivet verify` may record.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum Discharge {
    /// The description states no clause list: verify behaves as before and
    /// records nothing.
    NoClauses,
    /// Every clause is discharged.
    Full { clauses: Vec<usize> },
    /// Some clauses are pending, and the note says why.
    Partial {
        discharged: Vec<usize>,
        pending: Vec<usize>,
        note: String,
    },
}

/// Why `rivet verify` refuses a discharge.
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum DischargeError {
    /// Detection cannot read the numbering with certainty.
    Ambiguous { reason: String },
    /// Clauses exist and the caller named none of them.
    Undeclared { count: usize },
    /// A clause number outside `1..=count`.
    UnknownClause { clause: usize, count: usize },
    /// Clauses are pending and no note says why.
    NoteRequired { pending: Vec<usize> },
    /// `--clauses-discharged` or `--note` was given for a description with no
    /// clause list, so the caller expected clauses the tool does not see.
    NothingToDischarge,
}

fn join(ns: &[usize]) -> String {
    ns.iter()
        .map(usize::to_string)
        .collect::<Vec<_>>()
        .join(",")
}

impl fmt::Display for DischargeError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Ambiguous { reason } => write!(
                f,
                "cannot tell how many clauses the description states: {reason}. \
                 End the description with a line `# rivet: clauses = N` \
                 (N = 0 if it states none); `rivet verify --explain-clauses` shows what detection sees"
            ),
            Self::Undeclared { count } => write!(
                f,
                "the description states {count} numbered clause(s); pass \
                 `--clauses-discharged {}` to advance, or \
                 `--clauses-discharged <subset> --note <why the rest are pending>` \
                 to record a partial discharge",
                if *count == 1 {
                    "1".to_string()
                } else {
                    format!("1-{count}")
                }
            ),
            Self::UnknownClause { clause, count } => write!(
                f,
                "clause {clause} does not exist: the description states clauses 1-{count}"
            ),
            Self::NoteRequired { pending } => write!(
                f,
                "clause(s) {} are not discharged; pass `--note <why they are pending>` \
                 so the partial discharge is on record",
                join(pending)
            ),
            Self::NothingToDischarge => write!(
                f,
                "the description states no numbered clause list, so there is nothing \
                 to discharge; drop `--clauses-discharged` / `--note`, or add a \
                 `# rivet: clauses = N` line if detection missed them \
                 (`rivet verify --explain-clauses` shows what it sees)"
            ),
        }
    }
}

impl std::error::Error for DischargeError {}

/// The note as `rivet verify` records it: trimmed, and kept only when it
/// says something, that is carries at least one letter or digit. So
/// whitespace or a zero-width character is no note.
pub fn normalise_note(note: Option<&str>) -> Option<&str> {
    note.map(str::trim)
        .filter(|n| n.chars().any(char::is_alphanumeric))
}

/// Decide what `rivet verify` may record, given what detection made of the
/// description and the caller's `--clauses-discharged` / `--note`.
pub fn check_discharge(
    detection: &Detection,
    discharged: Option<&[usize]>,
    note: Option<&str>,
) -> Result<Discharge, DischargeError> {
    // A flag given at all counts on a description with no clauses, even a
    // blank `--note`: it asks to record something there is nothing to record.
    let given = discharged.is_some() || note.is_some();
    let note = normalise_note(note);
    let clauses = match detection {
        Detection::Ambiguous(reason) => {
            return Err(DischargeError::Ambiguous {
                reason: reason.clone(),
            });
        }
        Detection::None if given => return Err(DischargeError::NothingToDischarge),
        Detection::None => return Ok(Discharge::NoClauses),
        Detection::Clauses(c) => c,
    };
    let mut discharged: Vec<usize> = match discharged {
        Some(d) if !d.is_empty() => d.to_vec(),
        _ => {
            return Err(DischargeError::Undeclared {
                count: clauses.count,
            });
        }
    };
    discharged.sort_unstable();
    discharged.dedup();
    if let Some(&clause) = discharged.iter().find(|&&c| c == 0 || c > clauses.count) {
        return Err(DischargeError::UnknownClause {
            clause,
            count: clauses.count,
        });
    }
    let pending: Vec<usize> = (1..=clauses.count)
        .filter(|c| discharged.binary_search(c).is_err())
        .collect();
    if pending.is_empty() {
        return Ok(Discharge::Full {
            clauses: discharged,
        });
    }
    match note {
        Some(n) => Ok(Discharge::Partial {
            discharged,
            pending,
            note: n.to_string(),
        }),
        None => Err(DischargeError::NoteRequired { pending }),
    }
}

/// A fingerprint of the clauses `description` states now: what a recorded
/// discharge was about, so a later edit that renumbers or rewords them is
/// visible. `None` unless the description states clauses.
///
/// Detected clauses are fingerprinted by their opening lines. Under the
/// override detection does not know which lines are clauses, so the whole
/// description is, with line endings and trailing whitespace normalised.
pub fn fingerprint(description: &str) -> Option<String> {
    let detection = detect(description);
    let clauses = detection.clauses()?;
    let basis = if clauses.overridden {
        let text = normalise_lines(description);
        let lines: Vec<&str> = text.lines().map(str::trim_end).collect();
        format!("override\n{}", lines.join("\n").trim_end())
    } else {
        clauses
            .anchors
            .iter()
            .map(|(_, line)| line.as_str())
            .collect::<Vec<_>>()
            .join("\n")
    };
    Some(format!(
        "sha256:{}",
        crate::cited_source::sha256_hex(basis.as_bytes())
    ))
}

/// True when a recorded discharge no longer describes `description`: its
/// clauses changed, became ambiguous, or vanished since `recorded` was taken.
pub fn is_stale(description: &str, recorded: &str) -> bool {
    fingerprint(description).as_deref() != Some(recorded)
}

/// `(discharged, total)` for an artifact's recorded discharge, for coverage
/// and trace columns; `None` unless the description states clauses.
pub fn discharge_summary(description: &str, recorded: &[usize]) -> Option<(usize, usize)> {
    let detection = detect(description);
    let clauses = detection.clauses()?;
    let mut seen: Vec<usize> = recorded
        .iter()
        .copied()
        .filter(|&c| c >= 1 && c <= clauses.count)
        .collect();
    seen.sort_unstable();
    seen.dedup();
    Some((seen.len(), clauses.count))
}

/// What `rivet coverage --tests` and `rivet trace` show for an artifact's
/// clause discharge (#1168): the recorded fraction, or that the record is
/// stale. A stale record carries no fraction, since the clauses it counted
/// are gone; `total` is then the count the description states now, if any.
#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize)]
pub struct DischargeState {
    /// Clauses the recorded discharge names, counted against the clauses the
    /// description states now. `None` when the record is stale.
    pub discharged: Option<usize>,
    /// Clauses the description states now. `None` when it states none, or
    /// detection cannot count them.
    pub total: Option<usize>,
    /// The recorded fingerprint no longer matches the clauses
    /// (`discharge-stale`).
    pub stale: bool,
}

impl DischargeState {
    /// The report cell: `2/3`, or `stale`.
    pub fn cell(&self) -> String {
        match (self.stale, self.discharged, self.total) {
            (false, Some(d), Some(t)) => format!("{d}/{t}"),
            _ => "stale".to_string(),
        }
    }
}

/// The [`DischargeState`] of `artifact`, or `None` when its description
/// states no clause list and no discharge is recorded on it, which reports
/// show as no fraction.
///
/// A description with clauses and no recorded discharge reads `0/N`: the
/// clauses are there and nothing has been claimed about them.
pub fn discharge_state(artifact: &crate::model::Artifact) -> Option<DischargeState> {
    let description = artifact.description.as_deref().unwrap_or("");
    let detection = detect(description);
    let total = detection.clauses().map(|c| c.count);
    let fingerprint = artifact
        .fields
        .get(FINGERPRINT_FIELD)
        .and_then(|v| v.as_str());
    if fingerprint.is_some_and(|fp| is_stale(description, fp)) {
        return Some(DischargeState {
            discharged: None,
            total,
            stale: true,
        });
    }
    total?;
    let recorded: Vec<usize> = artifact
        .fields
        .get(DISCHARGED_FIELD)
        .and_then(|v| match (v.as_sequence(), v.as_str()) {
            (Some(seq), _) => Some(
                seq.iter()
                    .filter_map(|v| v.as_u64())
                    .filter_map(|n| usize::try_from(n).ok())
                    .collect(),
            ),
            // A record written as the string "[1, 2]" (before the field was
            // typed from `common.yaml`, or in a project that does not load
            // it) is still a record, not `0/N`.
            (None, Some(text)) => {
                parse_clause_list(text.trim().trim_start_matches('[').trim_end_matches(']')).ok()
            }
            _ => None,
        })
        .unwrap_or_default();
    let (discharged, total) = discharge_summary(description, &recorded)?;
    Some(DischargeState {
        discharged: Some(discharged),
        total: Some(total),
        stale: false,
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    const VARVE_STYLE: &str = "The stamp is monotonic.

1. a stamp is never earlier than the previous one
   on the same host
2. the stamp survives a restart

3. a clock step backwards is reported
Acceptance is measured on CI.";

    fn count(d: &str) -> Option<usize> {
        detect(d).clauses().map(|c| c.count)
    }

    fn ambiguous(d: &str) -> bool {
        matches!(detect(d), Detection::Ambiguous(_))
    }

    // rivet: verifies REQ-308
    #[test]
    fn detects_a_numbered_list_with_wrapped_and_blank_lines() {
        let d = detect(VARVE_STYLE);
        let c = d.clauses().unwrap();
        assert_eq!(c.count, 3);
        assert!(!c.overridden);
        assert_eq!(
            c.anchors.iter().map(|(n, _)| *n).collect::<Vec<_>>(),
            [1, 2, 3]
        );
        assert_eq!(c.anchors[1].1, "2. the stamp survives a restart");
        assert_eq!(count("1) one\n2) two"), Some(2));
        assert_eq!(count("01. a\n02. b"), Some(2));
        // A clause whose text starts on the next line: a bare `1.`.
        assert_eq!(count("1.\n   fast\n2.\n   safe"), Some(2));
        // CRLF and lone-CR line endings are line breaks.
        assert_eq!(count("1. a\r\n2. b\r\n3. c\r\n"), Some(3));
        assert_eq!(count("1. a\r2. b\r3. c"), Some(3));
    }

    // rivet: verifies REQ-308
    #[test]
    fn no_numbering_is_no_clauses() {
        for d in [
            "Plain prose.",
            "Requires 1.2.3 or later.",
            "1.2 is the floor",
            "v1.0 then v2.0",
            // A parenthetical enumeration inside prose (REQ-294's shape).
            "two triggers: (case 1) a near-miss key; (case 2) a typo",
        ] {
            assert_eq!(detect(d), Detection::None, "{d:?}");
        }
    }

    // rivet: verifies REQ-308
    #[test]
    fn uncertain_numbering_fails_closed_instead_of_undercounting() {
        // Each of these would undercount if detection guessed (the clean-room
        // review's HIGH findings), so a partial set could pass as Full.
        for d in [
            // Markdown lazy numbering renders 1, 2, 3.
            "1. a\n1. b\n1. c",
            // A nested sub-list.
            "1. a\n   1. sub\n   2. sub\n2. b\n3. c",
            // Two lists: the first is not the clause list.
            "Formats:\n1. JSON\n2. YAML\n\nThe system shall:\n1. a\n2. b\n3. c",
            // A numbered continuation or prose line.
            "1. timeout at most\n   2. seconds after start\n2. b\n3. c",
            "1. a\n2. b\n2024. was the year\n3. c",
            // A skipped number, a list not starting at 1, a numbered line
            // before the list.
            "1. a\n2. b\n4. d",
            "2. second\n3. third",
            "0. a\n1. b\n2. c",
            "3. see below\n1. a\n2. b",
            // A number too large to parse, or past the limit.
            "1. a\n99999999999999999999999. b\n2. c",
            // Numbering inside a line: what a folded `>` description leaves.
            "The system shall: 1. a 2. b 3. c",
        ] {
            assert!(
                ambiguous(d),
                "expected Ambiguous for {d:?}, got {:?}",
                detect(d)
            );
        }
    }

    // rivet: verifies REQ-308
    #[test]
    fn fenced_code_is_not_read() {
        // A fence with any numbered line is ambiguous, however it nests.
        assert!(ambiguous("Run:\n```\n1. step\n2. step\n```"));
        assert!(ambiguous("1. a\n~~~\n1. not a clause\n~~~\n2. b"));
        // A fence with no numbered line is no clause list.
        assert_eq!(detect("Run:\n```\nmake\n```"), Detection::None);
    }

    // rivet: verifies REQ-308
    #[test]
    fn the_override_resolves_ambiguity_and_a_bad_one_is_not_ignored() {
        let d = detect("1. a\n1. b\n1. c\n# rivet: clauses = 3");
        let c = d.clauses().unwrap();
        assert_eq!((c.count, c.overridden, c.anchors.len()), (3, true, 0));
        assert_eq!(detect("prose\n#rivet:clauses=0"), Detection::None);
        assert_eq!(
            count("1. a\n2. b\n# rivet: clauses = 3"),
            Some(3),
            "raising is allowed"
        );
        assert_eq!(count("# Rivet: Clauses = 2"), Some(2));
        for d in [
            "1. a\n2. b\n# rivet: clauses = two",
            "# rivet: clauses = -1",
            "# rivet: clauses 2",
            "# rivet: clauses = 10000000000\n\n",
            // Lowering below the numbered lines: stale, or fenced, or zero.
            "1. a\n2. b\n3. c\n# rivet: clauses = 2",
            "1. a\n2. b\n3. c\nExample:\n```yaml\n# rivet: clauses = 1",
            "1. a\n2. b\n#rivet:clauses=0",
            // Anywhere but last, or twice.
            "# rivet: clauses = 3\nOne sentence with three obligations.",
            "# rivet: clauses = 1\n1. a\n2. b",
            "# rivet: clauses = two\n1. a\n2. b",
            "# rivet: clauses = 9\n# rivet: clauses = 2",
            // The floor also counts the highest label and inline numbering.
            "1. a\n5. e\n# rivet: clauses = 2",
            "The system shall: 1. a 2. b 3. c\n# rivet: clauses = 1",
        ] {
            assert!(ambiguous(d), "expected Ambiguous for {d:?}");
        }
        // The limit itself is allowed; one past it is not.
        assert_eq!(
            count(&format!("# rivet: clauses = {MAX_CLAUSES}")),
            Some(MAX_CLAUSES)
        );
        assert!(ambiguous(&format!(
            "# rivet: clauses = {}",
            MAX_CLAUSES + 1
        )));
        assert_eq!(
            count("1. a\n1. b\n1. c\n# rivet: clauses = 3  \n\n"),
            Some(3)
        );
    }

    // rivet: verifies REQ-308
    #[test]
    fn parses_lists_and_ranges_within_the_limit() {
        assert_eq!(parse_clause_list("4, 1,2"), Ok(vec![1, 2, 4]));
        assert_eq!(parse_clause_list("1-3,5,2"), Ok(vec![1, 2, 3, 5]));
        assert_eq!(parse_clause_list("2-2"), Ok(vec![2]));
        assert_eq!(parse_clause_list(""), Ok(vec![]));
        assert!(parse_clause_list("1,x").is_err());
        assert!(parse_clause_list("3-1").is_err());
        // A huge range is refused before anything is allocated.
        assert!(parse_clause_list("1-18446744073709551615").is_err());
        assert!(parse_clause_list(&format!("1-{}", MAX_CLAUSES + 1)).is_err());
        assert_eq!(
            parse_clause_list(&format!("1-{MAX_CLAUSES}")).map(|v| v.len()),
            Ok(MAX_CLAUSES)
        );
    }

    // rivet: verifies REQ-308
    #[test]
    fn check_discharge_decision_table() {
        let three = detect(VARVE_STYLE);
        let c = &three;
        assert_eq!(
            check_discharge(c, None, None),
            Err(DischargeError::Undeclared { count: 3 })
        );
        assert_eq!(
            check_discharge(c, Some(&[]), Some("x")),
            Err(DischargeError::Undeclared { count: 3 })
        );
        // Duplicates and order do not matter.
        assert_eq!(
            check_discharge(c, Some(&[3, 1, 2, 1]), None),
            Ok(Discharge::Full {
                clauses: vec![1, 2, 3]
            })
        );
        assert_eq!(
            check_discharge(c, Some(&[1, 2]), None),
            Err(DischargeError::NoteRequired { pending: vec![3] })
        );
        // Whitespace or a zero-width character is no note.
        for blank in ["  ", "\n\t ", "\u{200b}"] {
            assert_eq!(
                check_discharge(c, Some(&[1, 2]), Some(blank)),
                Err(DischargeError::NoteRequired { pending: vec![3] }),
                "{blank:?}"
            );
        }
        assert_eq!(
            check_discharge(c, Some(&[1, 3]), Some("2 pending #93")),
            Ok(Discharge::Partial {
                discharged: vec![1, 3],
                pending: vec![2],
                note: "2 pending #93".into()
            })
        );
        for (bad, clause) in [(&[1, 4][..], 4), (&[0, 1][..], 0)] {
            assert_eq!(
                check_discharge(c, Some(bad), Some("x")),
                Err(DischargeError::UnknownClause { clause, count: 3 })
            );
        }
        // No clause list: today's flow, unless the caller expected clauses.
        let none = Detection::None;
        assert_eq!(check_discharge(&none, None, None), Ok(Discharge::NoClauses));
        assert_eq!(
            check_discharge(&none, Some(&[1]), None),
            Err(DischargeError::NothingToDischarge)
        );
        assert_eq!(
            check_discharge(&none, None, Some("a note")),
            Err(DischargeError::NothingToDischarge)
        );
        assert_eq!(
            check_discharge(&none, None, Some("   ")),
            Err(DischargeError::NothingToDischarge),
            "a blank --note is still a flag"
        );
        // Ambiguous numbering refuses whatever the caller passes.
        let amb = detect("1. a\n1. b\n1. c");
        for d in [None, Some(&[1][..]), Some(&[1, 2, 3][..])] {
            assert!(matches!(
                check_discharge(&amb, d, Some("x")),
                Err(DischargeError::Ambiguous { .. })
            ));
        }
    }

    // rivet: verifies REQ-308
    #[test]
    fn refusal_messages_name_the_way_out() {
        assert!(
            DischargeError::Undeclared { count: 3 }
                .to_string()
                .contains("`--clauses-discharged 1-3`")
        );
        assert!(
            DischargeError::Undeclared { count: 1 }
                .to_string()
                .contains("`--clauses-discharged 1`")
        );
        assert!(
            DischargeError::NoteRequired {
                pending: vec![2, 4]
            }
            .to_string()
            .contains("clause(s) 2,4 are not discharged")
        );
        let amb = DischargeError::Ambiguous { reason: "r".into() }.to_string();
        assert!(amb.contains("`# rivet: clauses = N`"), "{amb}");
    }

    // rivet: verifies REQ-308
    #[test]
    fn a_changed_clause_list_makes_the_record_stale() {
        let fp = fingerprint(VARVE_STYLE).unwrap();
        assert_eq!(fingerprint("Prose only."), None);
        assert!(fp.starts_with("sha256:") && fp.len() == 7 + 64, "{fp}");
        assert!(!is_stale(VARVE_STYLE, &fp));
        // Wrapped continuation lines and prose outside the list are not read.
        assert!(!is_stale(
            &VARVE_STYLE.replace("on the same host", "on one host"),
            &fp
        ));
        assert!(!is_stale(&format!("Preface.\n{VARVE_STYLE}"), &fp));
        // Inserting a clause renumbers the rest.
        let inserted = VARVE_STYLE.replace(
            "2. the stamp survives a restart",
            "2. the stamp is UTC\n3. the stamp survives a restart",
        );
        assert!(is_stale(&inserted, &fp));
        // Appending a clause, or a second list (both ambiguous or longer).
        assert!(is_stale(&format!("{VARVE_STYLE}\n4. an extra clause"), &fp));
        assert!(is_stale(&format!("{VARVE_STYLE}\n1. x\n2. y"), &fp));
        // Rewording a clause's first line.
        assert!(is_stale(
            &VARVE_STYLE.replace("survives a restart", "survives a reboot"),
            &fp
        ));
        // The clause list removed entirely.
        assert!(is_stale("Prose only now.", &fp));
        // Under the override any edit is one, since detection does not know
        // which lines are the clauses; line endings and trailing blanks are not.
        let ovd = "1. a\n2. b\n# rivet: clauses = 2";
        let ov = fingerprint(ovd).unwrap();
        assert!(!is_stale(ovd, &ov));
        assert!(!is_stale("1. a  \r\n2. b\r\n# rivet: clauses = 2\n\n", &ov));
        assert!(
            is_stale("1. b\n2. a\n# rivet: clauses = 2", &ov),
            "swapped texts"
        );
        assert!(is_stale("1. a\n2. b\n# rivet: clauses = 3", &ov));
        assert_ne!(
            fingerprint("1. a\n2. b").unwrap(),
            ov,
            "the override basis never collides with the anchor basis"
        );
    }

    // rivet: verifies REQ-308
    // Detection does not parse fences, so a fence anywhere next to a
    // numbered line is ambiguous: each of these hid clauses from a parser that
    // tried (a backtick span, a fence closed by a later item's fence, an
    // indented "fence" that is really an indented code block, and an override
    // inside a fenced example).
    #[test]
    fn a_fence_next_to_numbered_lines_is_ambiguous() {
        for d in [
            "The tool shall:\n1. refuse the force flag:\n   ```--force``` is never accepted\n2. log every refusal\n3. exit non-zero",
            "1. run the setup:\n   ```\n   make setup\n2. log every refusal\n3. print usage:\n   ```",
            "Example:\n\n    ```\n1. a\n2. b\n    ```",
            "1. a\n```\n2. b\n3. c",
            "1. a\n2. b\n~~~~",
        ] {
            assert!(
                matches!(detect(d), Detection::Ambiguous(ref r) if r.contains("code fence")),
                "{d:?}: {:?}",
                detect(d)
            );
        }
        // An override inside a fenced example is not the last line.
        assert!(matches!(
            detect("1. a\n2. b\n3. c\n```yaml\n# rivet: clauses = 1\n```"),
            Detection::Ambiguous(ref r) if r.contains("must be the description's last line")
        ));
        assert_eq!(
            detect("``\n1. a\n2. b").clauses().map(|c| c.count),
            Some(2),
            "two backticks are no fence"
        );
        // The stated count settles it.
        assert_eq!(
            detect("1. a\n```\n2. b\n```\n# rivet: clauses = 2")
                .clauses()
                .map(|c| c.count),
            Some(2)
        );
    }

    // rivet: verifies REQ-308
    // Every break an editor shows splits a line, and a clause line that
    // carries more numbered clauses is not one clause.
    #[test]
    fn unicode_breaks_split_lines_and_inline_runs_past_the_list_are_ambiguous() {
        for sep in ['\u{2028}', '\u{2029}', '\u{85}', '\u{0B}', '\u{0C}', '\r'] {
            let d = format!("1. a{sep}2. b{sep}3. c");
            assert_eq!(detect(&d).clauses().map(|c| c.count), Some(3), "{d:?}");
        }
        assert!(matches!(
            detect("1. a 2. b 3. c\n2. d"),
            Detection::Ambiguous(ref r) if r.contains("inside a line")
        ));
        // Incidental numbers inside a clause are not a run.
        assert_eq!(
            detect("1. see section 4. for the format\n2. b")
                .clauses()
                .map(|c| c.count),
            Some(2)
        );
        assert_eq!(detect("Step 1. is optional.").clauses(), None);
        // Invisible format characters cannot hide a clause or a number.
        for zw in ['\u{200B}', '\u{2060}', '\u{FEFF}', '\u{AD}', '\u{200E}'] {
            let before = format!("The tool shall:\n1. a\n2. b\n{zw}3. c");
            assert_eq!(
                detect(&before).clauses().map(|c| c.count),
                Some(3),
                "{before:?}"
            );
            let after = format!("{zw}1.{zw} a\n{zw}2.{zw} b\n{zw}3.{zw} c");
            assert_eq!(
                detect(&after).clauses().map(|c| c.count),
                Some(3),
                "{after:?}"
            );
        }
        assert!(!is_format_char('a') && !is_format_char(' ') && !is_format_char('\u{2028}'));
        assert_eq!(inline_sequence("1. a 3. b 2. c 3. d"), 3);
        assert_eq!(inline_sequence("2. a 1. b"), 1);
    }

    // rivet: verifies REQ-308
    #[test]
    fn summary_counts_distinct_clauses_that_exist() {
        assert_eq!(discharge_summary(VARVE_STYLE, &[1, 3, 3, 9]), Some((2, 3)));
        assert_eq!(discharge_summary("prose", &[1]), None);
        assert_eq!(discharge_summary("1. a\n1. b", &[1]), None);
    }

    /// #1168: the state reports show — a fraction, stale, or nothing.
    // rivet: verifies REQ-308
    #[test]
    fn discharge_state_reports_fraction_stale_or_nothing() {
        let clauses = "1. a\n2. b\n3. c";
        let art = |description: &str, fields: &[(&str, rivet_yaml::Value)]| {
            let mut a = crate::model::Artifact {
                id: "REQ-1".to_string(),
                description: Some(description.to_string()),
                ..Default::default()
            };
            for (k, v) in fields {
                a.fields.insert((*k).to_string(), v.clone());
            }
            a
        };
        let list = |ns: &[u64]| {
            rivet_yaml::Value::Sequence(
                ns.iter()
                    .map(|&n| rivet_yaml::Value::Number(n.into()))
                    .collect(),
            )
        };
        let fp = rivet_yaml::Value::String(fingerprint(clauses).expect("three clauses"));

        let partial = art(
            clauses,
            &[
                (DISCHARGED_FIELD, list(&[1, 2])),
                (FINGERPRINT_FIELD, fp.clone()),
            ],
        );
        let s = discharge_state(&partial).expect("clauses");
        assert_eq!(
            s,
            DischargeState {
                discharged: Some(2),
                total: Some(3),
                stale: false
            }
        );
        assert_eq!(s.cell(), "2/3");

        assert_eq!(
            discharge_state(&art(clauses, &[])).map(|s| s.cell()),
            Some("0/3".to_string()),
            "clauses with nothing recorded"
        );

        let edited = art(
            "1. a\n2. b changed\n3. c",
            &[
                (DISCHARGED_FIELD, list(&[1, 2])),
                (FINGERPRINT_FIELD, fp.clone()),
            ],
        );
        let s = discharge_state(&edited).expect("stale");
        assert!(s.stale && s.discharged.is_none() && s.total == Some(3));
        assert_eq!(s.cell(), "stale");

        // Clauses edited away entirely: still stale, not silently gone.
        let gone = art("prose now", &[(FINGERPRINT_FIELD, fp)]);
        assert_eq!(
            discharge_state(&gone).map(|s| s.cell()),
            Some("stale".into())
        );

        assert_eq!(discharge_state(&art("just prose", &[])), None);

        let quoted = art(
            clauses,
            &[(DISCHARGED_FIELD, rivet_yaml::Value::String("[1, 2]".into()))],
        );
        assert_eq!(
            discharge_state(&quoted).map(|s| s.cell()),
            Some("2/3".into())
        );
    }
}
