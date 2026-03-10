#![no_main]

use libfuzzer_sys::fuzz_target;
use rivet_core::model::Artifact;

fuzz_target!(|data: &[u8]| {
    let Ok(s) = std::str::from_utf8(data) else {
        return;
    };

    // First, try to deserialize a single Artifact directly from the fuzzed YAML.
    let _ = serde_yaml::from_str::<Artifact>(s);

    // Try to deserialize as a list of artifacts (the format used by generic-yaml files).
    let _ = serde_yaml::from_str::<Vec<Artifact>>(s);

    // Try to parse as a generic YAML value and check whether it has an "artifacts" key,
    // which is the top-level structure used by the generic-yaml adapter.
    if let Ok(value) = serde_yaml::from_str::<serde_yaml::Value>(s) {
        if let Some(artifacts) = value.get("artifacts") {
            // Attempt to interpret the value under "artifacts" as a Vec<Artifact>.
            let _ = serde_yaml::from_value::<Vec<Artifact>>(artifacts.clone());
        }
    }
});
