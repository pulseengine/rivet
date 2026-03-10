#![no_main]

use libfuzzer_sys::fuzz_target;
use rivet_core::reqif::parse_reqif;

fuzz_target!(|data: &[u8]| {
    let Ok(s) = std::str::from_utf8(data) else {
        return;
    };

    // Feed arbitrary strings into the ReqIF XML parser.
    // Valid errors (malformed XML, missing elements) are expected — only
    // panics or infinite loops indicate real bugs.
    let _ = parse_reqif(s, &std::collections::HashMap::new());
});
