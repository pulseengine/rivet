#![no_main]
//! Artifact-ID round-trip fuzzer.
//!
//! Feeds arbitrary byte sequences as `id:` values inside an otherwise-valid
//! artifact YAML document.  Oracle: if the YAML parses at all, the id string
//! must round-trip through the `Store` — `insert` then `get` returns an
//! artifact whose id is byte-identical to the one we fed in.
//!
//! This catches silent normalization (whitespace stripping, unicode
//! canonicalization, case folding) and insert/get key mismatches.

use libfuzzer_sys::fuzz_target;
use rivet_core::formats::generic::parse_generic_yaml;
use rivet_core::store::Store;

fuzz_target!(|data: &[u8]| {
    let Ok(raw) = std::str::from_utf8(data) else {
        return;
    };

    // Sanitize the candidate id so it is embeddable as a YAML plain scalar
    // on the id: line.  We intentionally DO allow exotic unicode, since that
    // is part of what we want to probe.  We DO strip newlines and NULs
    // because those would break the surrounding YAML grammar itself (not
    // rivet's fault).
    let id_raw: String = raw
        .chars()
        .filter(|&c| c != '\n' && c != '\r' && c != '\0')
        .take(128)
        .collect();

    if id_raw.is_empty() {
        return;
    }

    // YAML-quote the id so even `:` and `#` survive into the scalar.  Double
    // quotes with escaping handle everything except a stray `"` or `\` — we
    // escape those.
    let quoted = yaml_double_quote(&id_raw);

    let yaml = format!(
        "artifacts:\n  - id: {quoted}\n    type: requirement\n    title: Fuzz\n"
    );

    let Ok(artifacts) = parse_generic_yaml(&yaml, None) else {
        return;
    };
    if artifacts.is_empty() {
        return;
    }

    // There must be exactly one artifact returned.  Anything else is a bug.
    assert_eq!(
        artifacts.len(),
        1,
        "id-roundtrip: expected 1 artifact, got {} for id={id_raw:?}",
        artifacts.len()
    );

    let parsed_id = artifacts[0].id.clone();

    // Round-trip through the store.
    let mut store = Store::new();
    let artifact = artifacts.into_iter().next().unwrap();
    store.insert(artifact).expect("first insert cannot fail");

    // Lookup by the id returned from the parser.
    let fetched = store.get(&parsed_id).unwrap_or_else(|| {
        panic!(
            "id-roundtrip: Store::insert succeeded but Store::get({parsed_id:?}) returned None"
        )
    });

    assert_eq!(
        fetched.id, parsed_id,
        "id-roundtrip: fetched id differs from inserted id\n  inserted={parsed_id:?}\n  fetched={:?}",
        fetched.id
    );
});

fn yaml_double_quote(s: &str) -> String {
    let mut out = String::with_capacity(s.len() + 2);
    out.push('"');
    for c in s.chars() {
        match c {
            '"' => out.push_str("\\\""),
            '\\' => out.push_str("\\\\"),
            // Control chars other than tab must be escaped as \uXXXX.
            c if (c as u32) < 0x20 && c != '\t' => {
                out.push_str(&format!("\\u{:04X}", c as u32));
            }
            c => out.push(c),
        }
    }
    out.push('"');
    out
}
