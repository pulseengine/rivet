// SAFETY-REVIEW (SCRC Phase 1, DD-058): test code; a failure should panic
// with a clear message, so unwrap/expect are the intended style here.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::print_stdout,
    clippy::arithmetic_side_effects,
    clippy::wildcard_enum_match_arm
)]

//! rivet's YAML parser against the official yaml-test-suite (REQ-346).
//!
//! With serde_yaml gone, the suite is the oracle that does not come from
//! rivet: each case has the input and either the JSON it must read as or an
//! `error` marker. The gate is that the parser is never SILENTLY wrong —
//! every case it accepts reads exactly as the suite says. Refusing a case
//! (tags, complex keys, multi-document streams …) is allowed and counted.
//!
//! The suite is fetched, not vendored (7.6 MB): CI checks it out at a pinned
//! commit and sets `YAML_TEST_SUITE`. Without it the test says so and passes
//! locally, but fails under CI, so it cannot skip there.
//!
//! The counts are ratchets: a change may raise `MATCHED`, `INVALID_REJECTED`
//! or lower `INVALID_ACCEPTED`, and then the constant moves with it.

use std::path::{Path, PathBuf};

/// yaml-test-suite `data-2022-01-17`.
pub const SUITE_COMMIT: &str = "6e6c296ae9c9d2d5c4134b4b64d01b29ac19ff6f";

const MATCHED: usize = 134;
const INVALID_REJECTED: usize = 53;
const INVALID_ACCEPTED: usize = 41;

fn to_json(v: &rivet_yaml::Value) -> serde_json::Value {
    use rivet_yaml::Value as Y;
    match v {
        Y::Null => serde_json::Value::Null,
        Y::Bool(b) => (*b).into(),
        Y::Number(n) => {
            if let Some(i) = n.as_i64() {
                i.into()
            } else if let Some(u) = n.as_u64() {
                u.into()
            } else {
                serde_json::json!(n.as_f64().unwrap())
            }
        }
        Y::String(s) => s.clone().into(),
        Y::Sequence(s) => s.iter().map(to_json).collect::<Vec<_>>().into(),
        Y::Mapping(m) => {
            let mut o = serde_json::Map::new();
            for (k, v) in m {
                let key = match k {
                    Y::String(s) => s.clone(),
                    other => serde_json::to_string(&to_json(other)).unwrap(),
                };
                o.insert(key, to_json(v));
            }
            o.into()
        }
        Y::Tagged(t) => to_json(&t.value),
    }
}

/// Case directories: `ABCD/` or, for a case with variants, `ABCD/NN/`. The
/// suite's `name/` and `tags/` trees only link to these again.
fn cases(root: &Path) -> Vec<PathBuf> {
    let mut out = Vec::new();
    for entry in std::fs::read_dir(root).unwrap().flatten() {
        let path = entry.path();
        let name = entry.file_name().to_string_lossy().to_string();
        let is_case_id = name.len() == 4
            && name
                .chars()
                .all(|c| c.is_ascii_uppercase() || c.is_ascii_digit());
        if !path.is_dir() || !is_case_id {
            continue;
        }
        if path.join("in.yaml").exists() {
            out.push(path);
        } else {
            for sub in std::fs::read_dir(&path).unwrap().flatten() {
                if sub.path().join("in.yaml").exists() {
                    out.push(sub.path());
                }
            }
        }
    }
    out.sort();
    out
}

// rivet: verifies REQ-346
#[test]
fn rivet_yaml_is_never_silently_wrong_on_the_yaml_test_suite() {
    let Ok(root) = std::env::var("YAML_TEST_SUITE") else {
        assert!(
            std::env::var_os("CI").is_none(),
            "CI must check out yaml-test-suite {SUITE_COMMIT} and set YAML_TEST_SUITE"
        );
        println!("YAML_TEST_SUITE not set: yaml-test-suite conformance not checked");
        return;
    };
    let cases = cases(Path::new(&root));
    assert!(cases.len() > 300, "found only {} suite cases", cases.len());
    let (mut matched, mut refused, mut rejected, mut multi) = (0, 0, 0, 0);
    let mut wrong = Vec::new();
    let mut accepted = Vec::new();
    for case in &cases {
        let id = case.strip_prefix(&root).unwrap().display().to_string();
        let yaml = std::fs::read_to_string(case.join("in.yaml")).unwrap();
        let ours = rivet_yaml::from_str::<rivet_yaml::Value>(&yaml);
        if case.join("error").exists() {
            if ours.is_err() {
                rejected += 1;
            } else {
                accepted.push(id);
            }
            continue;
        }
        let Ok(json) = std::fs::read_to_string(case.join("in.json")) else {
            continue;
        };
        let docs: Vec<serde_json::Value> = serde_json::Deserializer::from_str(&json)
            .into_iter()
            .collect::<Result<_, _>>()
            .unwrap_or_default();
        if docs.len() != 1 {
            // A stream of several documents (or none): rivet reads one.
            multi += 1;
            if docs.len() > 1 && ours.is_ok() {
                wrong.push(format!("{id}: a multi-document stream was read as one"));
            }
            continue;
        }
        match ours {
            Err(_) => refused += 1,
            Ok(v) if to_json(&v) == docs[0] => matched += 1,
            Ok(v) => wrong.push(format!(
                "{id}\n  want: {}\n  got:  {}",
                docs[0],
                to_json(&v)
            )),
        }
    }
    println!(
        "yaml-test-suite: {} cases | matched {matched} | refused {refused} | wrong {} | \
         invalid rejected {rejected} | invalid accepted {} | multi-document {multi}",
        cases.len(),
        wrong.len(),
        accepted.len()
    );
    assert!(wrong.is_empty(), "silently wrong:\n{}", wrong.join("\n"));
    assert!(matched >= MATCHED, "matched {matched} < recorded {MATCHED}");
    assert!(
        rejected >= INVALID_REJECTED,
        "rejected {rejected} < recorded {INVALID_REJECTED}"
    );
    assert!(
        accepted.len() <= INVALID_ACCEPTED,
        "invalid accepted {} > recorded {INVALID_ACCEPTED}: {}",
        accepted.len(),
        accepted.join(", ")
    );
}
