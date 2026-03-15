#![no_main]

use libfuzzer_sys::fuzz_target;
use rivet_core::formats::needs_json::import_needs_json;

fuzz_target!(|data: &[u8]| {
    let Ok(s) = std::str::from_utf8(data) else {
        return;
    };

    // Feed arbitrary strings into the needs.json parser.
    // Valid errors (malformed JSON, missing keys) are expected — only
    // panics or infinite loops indicate real bugs.
    let _ = import_needs_json(s, &Default::default());
});
