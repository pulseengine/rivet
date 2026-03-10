#![no_main]

use libfuzzer_sys::fuzz_target;
use rivet_core::document::parse_document;

fuzz_target!(|data: &[u8]| {
    let Ok(s) = std::str::from_utf8(data) else {
        return;
    };

    // Feed arbitrary strings into the document frontmatter parser.
    // This exercises:
    //   - split_frontmatter (--- delimiter detection)
    //   - YAML frontmatter deserialization
    //   - extract_references ([[ID]] scanning)
    //   - extract_sections (heading-level detection)
    //
    // Errors from missing/malformed frontmatter are expected and gracefully
    // returned.  Only panics indicate real bugs.
    let _ = parse_document(s, None);
});
