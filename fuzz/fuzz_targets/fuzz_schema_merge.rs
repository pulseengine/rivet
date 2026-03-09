#![no_main]

use libfuzzer_sys::fuzz_target;
use rivet_core::schema::{Schema, SchemaFile};

fuzz_target!(|data: &[u8]| {
    let Ok(s) = std::str::from_utf8(data) else {
        return;
    };

    // Try to parse the fuzzed input as a SchemaFile.
    let Ok(fuzzed_schema) = serde_yaml::from_str::<SchemaFile>(s) else {
        return;
    };

    // Build a minimal base schema to merge with.
    let base_yaml = r#"
schema:
  name: base
  version: "0.1.0"
artifact-types: []
link-types: []
traceability-rules: []
"#;
    let base_schema: SchemaFile = serde_yaml::from_str(base_yaml).unwrap();

    // Merge the base schema with the fuzzed schema — this exercises the
    // HashMap insertion, inverse-map building, and traceability-rule
    // collection logic in Schema::merge.
    let merged = Schema::merge(&[base_schema, fuzzed_schema]);

    // Poke the lookup methods to make sure they don't panic on arbitrary data.
    for type_name in merged.artifact_types.keys() {
        let _ = merged.artifact_type(type_name);
    }
    for link_name in merged.link_types.keys() {
        let _ = merged.link_type(link_name);
        let _ = merged.inverse_of(link_name);
    }
});
