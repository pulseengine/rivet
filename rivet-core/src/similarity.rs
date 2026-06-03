//! Title "intent" similarity — REQ-158 / #397.
//!
//! `rivet add` already rejects a *duplicate id*, but nothing flags a
//! *duplicate intent*: two artifacts that say the same thing under different
//! ids. Over a long-lived backlog these accrete (the #397 report). This module
//! provides a cheap, explainable, bounded similarity signal used by both
//! `rivet validate` (a `near-duplicate-intent` INFO diagnostic) and `rivet add`
//! (a non-blocking "similar to <ID>" note) — one shared implementation so the
//! two surfaces never disagree.
//!
//! The signal is **Jaccard overlap of significant title tokens**: lowercase,
//! split on non-alphanumerics, drop stopwords and tokens shorter than 3 chars,
//! then `|A ∩ B| / |A ∪ B|`. It is inherently bounded to `[0, 1]` and every
//! component is inspectable (the shared/total token counts), per the
//! bounded-composite-score doctrine — no opaque fuzzy number.
//!
//! Empirically calibrated: on the rivet repo's own 158 requirements the
//! [`NEAR_DUPLICATE_INTENT_THRESHOLD`] of 0.6 yields **zero** pairs, so the
//! default does not flood a real, well-differentiated backlog.

use std::collections::BTreeSet;

/// Title-intent Jaccard at/above which two same-type artifacts are flagged as
/// near-duplicates. Calibrated against the rivet repo (0 false positives).
pub const NEAR_DUPLICATE_INTENT_THRESHOLD: f64 = 0.6;

/// Common English function words plus a few rivet-domain filler words that
/// carry no "intent" signal. Kept small and explicit on purpose.
const STOPWORDS: &[&str] = &[
    "the", "a", "an", "and", "or", "of", "to", "for", "is", "are", "be", "must", "should", "no",
    "not", "with", "via", "from", "into", "on", "in", "by", "at", "as", "it", "its", "this",
    "that", "when", "then", "than", "only", "also", "new", "per", "each", "both", "vs", "so",
    "but", "if", "we", "do", "does", "any", "all", "can", "use", "used",
];

/// Significant tokens of a title: lowercased, alphanumeric-split, stopwords and
/// sub-3-char tokens removed. Deterministic (a `BTreeSet`).
pub fn intent_tokens(title: &str) -> BTreeSet<String> {
    title
        .split(|c: char| !c.is_alphanumeric())
        .map(|w| w.to_ascii_lowercase())
        .filter(|w| w.len() > 2 && !STOPWORDS.contains(&w.as_str()))
        .collect()
}

/// Jaccard overlap of two titles' significant-token sets, in `[0, 1]`.
/// Returns 0.0 when either title has no significant tokens (cannot judge
/// intent from stopwords alone — never a false "duplicate").
pub fn intent_similarity(a: &str, b: &str) -> f64 {
    similarity_of(&intent_tokens(a), &intent_tokens(b))
}

/// Jaccard of two pre-computed token sets — lets callers tokenize once when
/// comparing one title against many (e.g. the O(n²) validate pass).
pub fn similarity_of(a: &BTreeSet<String>, b: &BTreeSet<String>) -> f64 {
    if a.is_empty() || b.is_empty() {
        return 0.0;
    }
    let inter = a.intersection(b).count();
    let union = a.union(b).count();
    inter as f64 / union as f64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn identical_titles_are_fully_similar() {
        assert_eq!(
            intent_similarity(
                "Export must be self-contained",
                "Export must be self-contained"
            ),
            1.0
        );
    }

    #[test]
    fn near_duplicates_exceed_threshold() {
        let s = intent_similarity(
            "rivet validate must reject typo'd statuses",
            "rivet validate should reject a typo status",
        );
        assert!(
            s >= NEAR_DUPLICATE_INTENT_THRESHOLD,
            "expected near-duplicate (>= {NEAR_DUPLICATE_INTENT_THRESHOLD}), got {s}"
        );
    }

    #[test]
    fn distinct_intents_stay_below_threshold() {
        // Deliberately overlapping-but-distinct, like REQ-001 / REQ-002.
        let s = intent_similarity(
            "Parser builds a lossless concrete syntax tree",
            "HTML export bundles JavaScript for offline viewing",
        );
        assert!(
            s < NEAR_DUPLICATE_INTENT_THRESHOLD,
            "distinct intents must stay below threshold, got {s}"
        );
    }

    #[test]
    fn stopword_only_titles_never_match() {
        // No significant tokens -> never a false duplicate.
        assert_eq!(intent_similarity("the of a to", "and or for is"), 0.0);
    }

    #[test]
    fn tokens_strip_stopwords_and_short_words() {
        let t = intent_tokens("The rivet CLI is OK");
        // "the","is" stopwords; "ok" len 2 dropped; "cli" kept; "rivet" kept.
        assert!(t.contains("rivet") && t.contains("cli"));
        assert!(!t.contains("the") && !t.contains("is") && !t.contains("ok"));
    }
}
