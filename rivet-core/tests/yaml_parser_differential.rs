// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code, not by test harnesses.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_wrap,
    clippy::wildcard_enum_match_arm,
    clippy::panic,
    clippy::print_stdout
)]

//! Differential gate: rivet's rowan CST path vs the serde_yaml path.
//!
//! rivet parses `generic-yaml` sources through `serde_yaml` and `stpa-yaml`
//! sources through its own rowan CST, with nothing asserting the two agree
//! (REQ-348). REQ-346 proposes migrating the artifact read path onto the CST,
//! and this corpus is that migration's gate — it has to exist before the
//! change, not after.
//!
//! The corpus is driven from the `sources:` list in `rivet.yaml`, not from a
//! path literal. A gate that hardcodes `artifacts/` silently covers two thirds
//! of the declared sources while reporting "every artifact file" — the exact
//! weak-green defect class this test exists to catch.
//!
//! `differential_survey` ASSERTS agreement over every file under every
//! declared source. `divergence_probe` ASSERTS where the two DO differ on
//! constructs the corpus happens not to use, so the survey's agreement reads
//! as a finding rather than as a comparison that cannot fail — and so that
//! fixing one of those divergences reddens the record instead of silently
//! flipping it to `agree`.

use std::path::{Path, PathBuf};

fn workspace_root() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

/// The schema set and source list rivet itself is configured with, read from
/// `rivet.yaml`. Hardcoding either here would let the gate drift away from
/// what the tool actually loads.
fn project_config(root: &Path) -> (Vec<String>, Vec<String>) {
    let raw = std::fs::read_to_string(root.join("rivet.yaml")).expect("read rivet.yaml");
    let doc: serde_yaml::Value = serde_yaml::from_str(&raw).expect("parse rivet.yaml");
    let schemas = doc["project"]["schemas"]
        .as_sequence()
        .expect("project.schemas")
        .iter()
        .filter_map(|v| v.as_str().map(str::to_owned))
        .collect();
    let sources = doc["sources"]
        .as_sequence()
        .expect("sources")
        .iter()
        .filter_map(|s| s["path"].as_str().map(str::to_owned))
        .collect();
    (schemas, sources)
}

fn yaml_files(dir: &Path, out: &mut Vec<PathBuf>) {
    let Ok(rd) = std::fs::read_dir(dir) else {
        return;
    };
    for e in rd.flatten() {
        let p = e.path();
        if p.is_dir() {
            yaml_files(&p, out);
        } else if p.extension().is_some_and(|x| x == "yaml" || x == "yml") {
            out.push(p);
        }
    }
}

/// Compare a FINGERPRINT, not just ids. Matching id sequences would agree
/// while the two paths disagreed about type, status, links or provenance —
/// which is exactly the class of silent divergence REQ-348 is about.
/// `provenance` is here deliberately: it is written flow-style (`{…}`) in
/// eighteen artifacts and is the field the original investigation could not
/// compare, so leaving it out would assert agreement on the one shape most
/// likely to break.
fn fingerprint(a: &rivet_core::model::Artifact) -> String {
    let mut links: Vec<String> = a
        .links
        .iter()
        .map(|l| format!("{}->{}", l.link_type, l.target))
        .collect();
    links.sort();
    let prov = a.provenance.as_ref().map_or_else(
        || "-".to_owned(),
        |p| {
            serde_yaml::to_string(p)
                .unwrap_or_default()
                .replace('\n', ";")
        },
    );
    // `fields` is where `serde_yaml::Value` lives, so it is the component a
    // read-path migration is most likely to change — and the one the first
    // version of this fingerprint left out. `BTreeMap` iterates in key order,
    // so the rendering is deterministic.
    let fields = a
        .fields
        .iter()
        .map(|(k, v)| {
            let rendered = serde_yaml::to_string(v).unwrap_or_default();
            format!("{k}={}", rendered.trim_end().replace('\n', ";"))
        })
        .collect::<Vec<_>>()
        .join(",");
    // SEP is the ASCII unit separator, not `|`. `serde_yaml::to_string` emits
    // `|` for multi-line block scalars and titles may contain one, and a
    // stray `|` shifts every component after it — misattributing a `fields`
    // divergence to whatever came earlier.
    [
        a.id.as_str(),
        a.artifact_type.as_str(),
        a.title.as_str(),
        a.status.as_deref().unwrap_or(""),
        a.release.as_deref().unwrap_or(""),
        &a.tags.join("+"),
        &links.join(","),
        &prov,
        &fields,
    ]
    .join(SEP)
}

/// Component separator for `fingerprint`. See the note there.
const SEP: &str = "\u{1f}";

fn via_serde(content: &str, f: &Path) -> Vec<String> {
    match rivet_core::formats::generic::parse_generic_yaml(content, Some(f)) {
        Ok(v) => v.iter().map(fingerprint).collect(),
        Err(_) => Vec::new(),
    }
}

fn via_rowan(content: &str, schema: &rivet_core::schema::Schema, f: &Path) -> Vec<String> {
    rivet_core::yaml_hir::extract_schema_driven(content, schema, Some(f))
        .artifacts
        .iter()
        .map(|sa| fingerprint(&sa.artifact))
        .collect()
}

/// The fingerprint must actually carry every component it claims to compare.
///
/// This is the guard that is easy to lose. While the corpus diverged on 18
/// artifacts, narrowing the fingerprint moved that count and `differential_survey`
/// reddened on its own. Once the divergence closed and the expected count became
/// 0, narrowing it moved nothing — dropping provenance from the comparison, the
/// precise move that would hide the next divergence, passed silently. Verified
/// by re-running that negative control across the refactor: it went from
/// reddening to a clean pass.
///
/// So the shape is asserted here directly, on a synthetic artifact with every
/// component populated, where it holds regardless of what the corpus contains
/// or how many differences there are.
#[test]
fn fingerprint_carries_every_component_it_claims() {
    let a = rivet_core::model::Artifact {
        id: "REQ-001".into(),
        artifact_type: "requirement".into(),
        title: "a distinctive title".into(),
        status: Some("implemented".into()),
        release: Some("v9.9.9".into()),
        tags: vec!["alpha".into(), "beta".into()],
        links: vec![rivet_core::model::Link {
            link_type: "verifies".into(),
            target: "REQ-002".into(),
            ..Default::default()
        }],
        provenance: Some(rivet_core::model::Provenance {
            created_by: "ai-assisted".into(),
            model: Some("a-model-name".into()),
            session_id: None,
            timestamp: None,
            reviewed_by: None,
            federation: None,
        }),
        fields: [(
            "priority".to_owned(),
            serde_yaml::Value::String("a-distinctive-priority".to_owned()),
        )]
        .into_iter()
        .collect(),
        ..Default::default()
    };
    let f = fingerprint(&a);
    for (component, needle) in [
        ("id", "REQ-001"),
        ("type", "requirement"),
        ("title", "a distinctive title"),
        ("status", "implemented"),
        ("release", "v9.9.9"),
        ("tags", "alpha"),
        ("links", "verifies->REQ-002"),
        ("provenance.created-by", "ai-assisted"),
        ("provenance.model", "a-model-name"),
        ("fields.key", "priority"),
        ("fields.value", "a-distinctive-priority"),
    ] {
        assert!(
            f.contains(needle),
            "the fingerprint dropped `{component}`, so the survey would no longer \
             compare it and a divergence there would pass unnoticed: {f}"
        );
    }
}

/// Which fingerprint COMPONENT differs, so a failure names the defect rather
/// than the file. The order matches `fingerprint`.
fn first_differing_component(a: &str, b: &str) -> &'static str {
    const NAMES: [&str; 9] = [
        "id",
        "type",
        "title",
        "status",
        "release",
        "tags",
        "links",
        "provenance",
        "fields",
    ];
    let (av, bv): (Vec<&str>, Vec<&str>) = (a.split(SEP).collect(), b.split(SEP).collect());
    for (i, name) in NAMES.iter().enumerate() {
        if av.get(i) != bv.get(i) {
            return name;
        }
    }
    "none"
}

/// Does the serde path structurally address this document at all? `GenericFile`
/// reads a top-level `artifacts:` key; an STPA file keyed on `hazards:` is not
/// a divergence, it is a different grammar layer. Partition on the mechanical
/// rule rather than on a path literal, and print each partition's size.
fn has_artifacts_key(content: &str) -> bool {
    serde_yaml::from_str::<serde_yaml::Value>(content)
        .ok()
        .and_then(|v| v.get("artifacts").cloned())
        .is_some()
}

/// The corpus's known divergence count, with every counted artifact named.
///
/// HISTORY, because the number has been wrong twice and both times the gate
/// said it was fine. It was 18 (flow-style provenance) until REQ-353 added
/// `FlowMapping`, then 0. That 0 was a weak green: the fingerprint omitted
/// `fields`, which is where `serde_yaml::Value` lives. Adding `fields` took the
/// same corpus from `agree=26 differ=0` to `differ=10` across **110**
/// artifacts. 108 of them were one defect — rowan did not fold `>` block
/// scalars or honour `-`/`+` chomping — and that defect was LIVE: the rowan
/// path is production for `safety/stpa`, where 148 of 154 descriptions
/// disagreed with PyYAML. Fixed in the same change as this fingerprint; the
/// residual is the 2 below.
///
/// It was 2 until REQ-362. **REQ-277** wrote `category`, `priority` and
/// `upstream-ref` as top-level keys; serde dropped them and rowan read them.
/// REQ-362 made the serde path preserve such keys into `fields`, so the two
/// paths now agree and REQ-277 left the set — this constant reddened at
/// `differ=1` and forced this record, as it is meant to.
///
/// It was 1 until REQ-363. **DD-039** writes `alternatives:` as a multi-line
/// PLAIN scalar; PyYAML and serde fold the continuation line in, and rowan
/// truncated at the first line (`"...Rejected because it"`). REQ-363 made the
/// CST keep the continuation (across blank lines too) and the HIR fold it, so
/// DD-039 left the set — this constant reddened at `differ=0` and forced this
/// record.
///
/// ZERO IS THE STEADY STATE. The two paths now agree on every comparable file
/// in the corpus (26 of 26). Any future divergence is a new defect and must be
/// characterized against PyYAML, added to `KNOWN_DIVERGING_IDS` by id, and
/// counted here — never absorbed silently. Zero cannot be reached by comparing
/// nothing: `differential_survey` separately asserts `compared > 0`.
///
/// Kept as a named constant rather than a bare `differ == 0` so moving the
/// number in EITHER direction forces this record to be updated.
const KNOWN_DIVERGENCES: usize = 0;

/// The artifacts behind `KNOWN_DIVERGENCES`, by id.
///
/// The count alone has the same shape as the bug it replaced: if one known
/// divergence closed while a DIFFERENT artifact started diverging, the count
/// would stay put and the gate would stay green with a new defect swapped into
/// the old one's budget. The set is asserted as well, so a new instance
/// reddens as a new instance. Empty now; see `KNOWN_DIVERGENCES`.
const KNOWN_DIVERGING_IDS: &[&str] = &[];

// rivet: verifies REQ-348
#[test]
fn differential_survey() {
    let root = workspace_root();
    let (schema_names, source_paths) = project_config(&root);
    let schema = rivet_core::load_schemas(&schema_names, &root.join("schemas"))
        .expect("load the project's own schema set");

    let mut files = Vec::new();
    for s in &source_paths {
        yaml_files(&root.join(s), &mut files);
    }
    files.sort();
    assert!(
        source_paths.len() >= 4 && !files.is_empty(),
        "the corpus must come from rivet.yaml's declared sources: \
         sources={source_paths:?} files={}",
        files.len()
    );

    let (mut compared, mut agree, mut differ) = (0, 0, 0);
    let (mut rowan_only_shape, mut neither_shape) = (0, 0);
    let (mut total_serde, mut total_rowan, mut provenance_seen) = (0usize, 0usize, 0usize);
    let mut by_component: std::collections::BTreeMap<&str, usize> =
        std::collections::BTreeMap::new();
    let mut count_mismatch: Vec<String> = Vec::new();
    let mut examples: Vec<String> = Vec::new();
    let mut diverging_ids: std::collections::BTreeSet<String> = std::collections::BTreeSet::new();

    for f in &files {
        let content = std::fs::read_to_string(f).unwrap_or_default();
        let rel = f.strip_prefix(&root).unwrap_or(f).display().to_string();

        // Partition by shape, not by path. A document with no top-level
        // `artifacts:` key is outside the serde path's grammar by
        // construction, so comparing the two there would manufacture a
        // divergence that does not exist.
        if !has_artifacts_key(&content) {
            let n = via_rowan(&content, &schema, f).len();
            total_rowan += n;
            if n > 0 {
                rowan_only_shape += 1;
            } else {
                neither_shape += 1;
            }
            continue;
        }

        compared += 1;
        let serde_ids = via_serde(&content, f);
        let rowan_ids = via_rowan(&content, &schema, f);
        total_serde += serde_ids.len();
        total_rowan += rowan_ids.len();
        provenance_seen += serde_ids
            .iter()
            .filter(|f| f.contains("created-by"))
            .count();

        if serde_ids.len() != rowan_ids.len() {
            count_mismatch.push(format!(
                "{rel}: serde={} rowan={}",
                serde_ids.len(),
                rowan_ids.len()
            ));
        }
        if serde_ids == rowan_ids {
            agree += 1;
            continue;
        }
        differ += 1;
        for (a, b) in serde_ids.iter().zip(rowan_ids.iter()) {
            if a != b {
                *by_component
                    .entry(first_differing_component(a, b))
                    .or_default() += 1;
                if let Some(id) = a.split(SEP).next() {
                    diverging_ids.insert(id.to_owned());
                }
                if examples.len() < 4 {
                    examples.push(format!("{rel}\n      serde: {a}\n      rowan: {b}"));
                }
            }
        }
    }

    println!(
        "SURVEY sources={} files={} compared={compared} agree={agree} differ={differ}",
        source_paths.len(),
        files.len()
    );
    println!(
        "  out of scope: rowan-only-shape={rowan_only_shape} (schema-driven top-level keys, \
         no `artifacts:` — serde's GenericFile cannot address these at all)  \
         neither={neither_shape} (config documents under a source path)"
    );
    println!("  TOTALS serde={total_serde} rowan={total_rowan} with-provenance={provenance_seen}");
    for (k, v) in &by_component {
        println!("  DIVERGENCE component={k} artifacts={v}");
    }
    for e in &examples {
        println!("  EXAMPLE {e}");
    }

    // Positive control first: two paths that both find nothing agree
    // vacuously, and that must read as a broken gate rather than a green one.
    assert!(
        total_serde > 0 && total_rowan > 0 && compared > 0,
        "both paths must find artifacts over a non-empty compared set, or agreement \
         is vacuous: serde={total_serde} rowan={total_rowan} compared={compared}"
    );
    assert!(
        rowan_only_shape > 0,
        "the stpa-yaml sources must land in the rowan-only partition; if this is 0 the \
         shape partition has silently swallowed them"
    );
    // Companion to `fingerprint_carries_every_component_it_claims`: that test
    // proves the fingerprint CAN carry provenance, this one proves the corpus
    // comparison is actually exercising it. Both paths quietly ceasing to read
    // provenance would otherwise leave the survey green over an unchecked field.
    assert!(
        provenance_seen > 0,
        "no compared artifact contributed provenance to its fingerprint, so the \
         corpus is no longer exercising the field the 18-artifact divergence lived in"
    );
    // Losing or gaining an ARTIFACT is a different, worse failure than losing a
    // field on one, so it gets its own assertion and its own message.
    assert!(
        count_mismatch.is_empty(),
        "the two paths must find the SAME NUMBER of artifacts in every \
         `artifacts:`-shaped file:\n  {}",
        count_mismatch.join("\n  ")
    );
    // Report the divergence by CLASS, so a failure names the defect rather than
    // the file, and pin the total. Not a bare `differ == 0`: the point of the
    // number is that moving it in EITHER direction forces the record to be
    // updated rather than re-baselined.
    let classes: Vec<String> = by_component
        .iter()
        .map(|(k, v)| format!("{k}={v}"))
        .collect();
    let total_divergences: usize = by_component.values().sum();
    assert_eq!(
        total_divergences,
        KNOWN_DIVERGENCES,
        "the divergence count between rivet's two YAML paths changed \
         ({}). More means something was written that one path cannot read; \
         fewer means a gap was closed. Either way update the record and \
         KNOWN_DIVERGENCES — do not re-baseline the number silently.",
        if classes.is_empty() {
            "none".to_owned()
        } else {
            classes.join(", ")
        }
    );
    let expected: std::collections::BTreeSet<String> = KNOWN_DIVERGING_IDS
        .iter()
        .map(|s| (*s).to_owned())
        .collect();
    assert_eq!(
        diverging_ids, expected,
        "the SET of diverging artifacts changed even if the count did not. A new \
         id here is a new defect, not a budget to spend — characterize it against \
         PyYAML before touching KNOWN_DIVERGING_IDS."
    );
}

/// A mapping in the independent parse that carries a string id, with the
/// chain of `(key, mapping)` ancestors that leads to it (outermost first; the
/// last element is the artifact's own mapping, and its key is the key of the
/// sequence it sits in).
type IdChain<'a> = Vec<(Option<&'a str>, &'a serde_yaml::Mapping)>;

/// Keys that carry an artifact id. `ca` mirrors yaml_hir's documented alias —
/// "`ca` is an alias for `id` in STPA control-action items" — which is schema
/// behaviour, not parsing, so the reference has to know it to find those items.
const ID_KEYS: &[&str] = &["id", "ca"];

fn index_ids<'a>(
    v: &'a serde_yaml::Value,
    key: Option<&'a str>,
    chain: &mut IdChain<'a>,
    out: &mut std::collections::BTreeMap<String, Vec<IdChain<'a>>>,
) {
    match v {
        serde_yaml::Value::Mapping(m) => {
            chain.push((key, m));
            if let Some(id) = ID_KEYS
                .iter()
                .find_map(|k| m.get(*k).and_then(serde_yaml::Value::as_str))
            {
                out.entry(id.to_owned()).or_default().push(chain.clone());
            }
            for (k, child) in m {
                index_ids(child, k.as_str(), chain, out);
            }
            chain.pop();
        }
        serde_yaml::Value::Sequence(s) => {
            for child in s {
                index_ids(child, key, chain, out);
            }
        }
        _ => {}
    }
}

fn json(v: &serde_yaml::Value) -> serde_json::Value {
    serde_json::to_value(v).unwrap_or(serde_json::Value::Null)
}

fn strings_under(v: &serde_yaml::Value, out: &mut Vec<String>) {
    match v {
        serde_yaml::Value::String(s) => out.push(s.clone()),
        serde_yaml::Value::Sequence(s) => s.iter().for_each(|c| strings_under(c, out)),
        serde_yaml::Value::Mapping(m) => m.values().for_each(|c| strings_under(c, out)),
        _ => {}
    }
}

/// REQ-348's open half. `differential_survey` compares only `artifacts:`-shaped
/// files, so every `safety/stpa` file — the rowan-only partition, where the
/// folded-scalar corruption lived undetected — was compared against nothing.
///
/// This compares that partition against an INDEPENDENT parse of the same text
/// (serde_yaml's generic `Value`, which knows nothing of rivet's schemas). It
/// does not re-implement the schema-driven mapping; it checks that every value
/// rowan hands back is the value the document actually holds. For each artifact
/// rowan extracts, the reference must contain exactly one mapping with that
/// `id`, and rowan's title, description, status and every field value must
/// equal what that mapping (or, for inherited fields, its nearest ancestor)
/// holds; every link target must appear as a string under it. Per file, rowan
/// must find as many artifacts as the reference has `id`-bearing mappings.
// rivet: verifies REQ-348
#[test]
fn rowan_only_partition_matches_an_independent_parse() {
    let root = workspace_root();
    let (schema_names, source_paths) = project_config(&root);
    let schema = rivet_core::load_schemas(&schema_names, &root.join("schemas"))
        .expect("load the project's own schema set");
    let mut files = Vec::new();
    for s in &source_paths {
        yaml_files(&root.join(s), &mut files);
    }
    files.sort();

    let (mut files_compared, mut artifacts_compared, mut values_compared) = (0usize, 0, 0);
    let mut derived_compared = 0usize;
    let mut mismatches: Vec<String> = Vec::new();

    for f in &files {
        let content = std::fs::read_to_string(f).unwrap_or_default();
        if has_artifacts_key(&content) {
            continue;
        }
        let rel = f.strip_prefix(&root).unwrap_or(f).display().to_string();
        let parsed = rivet_core::yaml_hir::extract_schema_driven(&content, &schema, Some(f));
        if parsed.artifacts.is_empty() {
            continue;
        }
        let reference: serde_yaml::Value = match serde_yaml::from_str(&content) {
            Ok(v) => v,
            Err(e) => {
                mismatches.push(format!(
                    "{rel}: the independent parser rejects the file: {e}"
                ));
                continue;
            }
        };
        let mut by_id = std::collections::BTreeMap::new();
        index_ids(&reference, None, &mut Vec::new(), &mut by_id);
        files_compared += 1;

        let reference_count: usize = by_id.values().map(Vec::len).sum();
        if reference_count != parsed.artifacts.len() {
            mismatches.push(format!(
                "{rel}: rowan found {} artifacts, the reference has {reference_count} id-bearing mappings",
                parsed.artifacts.len()
            ));
        }

        for pa in &parsed.artifacts {
            let a = &pa.artifact;
            let Some(chains) = by_id.get(a.id.as_str()) else {
                mismatches.push(format!(
                    "{rel} {}: no mapping with this id in the reference",
                    a.id
                ));
                continue;
            };
            if chains.len() != 1 {
                mismatches.push(format!("{rel} {}: id appears {} times", a.id, chains.len()));
                continue;
            }
            let chain = &chains[0];
            let own = chain
                .last()
                .map(|(_, m)| *m)
                .expect("chain ends at the artifact");
            artifacts_compared += 1;

            for (key, got) in [
                ("title", Some(a.title.as_str())),
                ("description", a.description.as_deref()),
                ("status", a.status.as_deref()),
            ] {
                if let Some(want) = own.get(key).and_then(serde_yaml::Value::as_str) {
                    values_compared += 1;
                    if got != Some(want) {
                        mismatches.push(format!(
                            "{rel} {} {key}:\n      reference: {want:?}\n      rowan:     {got:?}",
                            a.id
                        ));
                    }
                }
            }
            for (k, v) in &a.fields {
                match chain.iter().rev().find_map(|(_, m)| m.get(k.as_str())) {
                    Some(want) => {
                        values_compared += 1;
                        if json(want) != json(v) {
                            mismatches.push(format!(
                                "{rel} {} field {k}:\n      reference: {:?}\n      rowan:     {:?}",
                                a.id,
                                json(want),
                                json(v)
                            ));
                        }
                    }
                    // `uca-type` is DERIVED, not read: yaml_hir sets it from the
                    // key of the group the item sits in (`not-providing:` …).
                    // It is checked against exactly that key, which the
                    // reference does know.
                    None if k == "uca-type" => {
                        let group_key = chain.last().and_then(|(key, _)| *key);
                        derived_compared += 1;
                        if v.as_str() != group_key {
                            mismatches.push(format!(
                                "{rel} {} uca-type {:?} is not the group key {group_key:?}",
                                a.id,
                                json(v)
                            ));
                        }
                    }
                    None => mismatches.push(format!(
                        "{rel} {} field {k}={:?}: not present in the reference mapping or its ancestors",
                        a.id,
                        json(v)
                    )),
                }
            }
            let mut present = Vec::new();
            for (_, m) in chain {
                strings_under(&serde_yaml::Value::Mapping((*m).clone()), &mut present);
            }
            for l in &a.links {
                if !present.iter().any(|s| s == &l.target) {
                    mismatches.push(format!(
                        "{rel} {} link {} -> {}: target not present in the reference",
                        a.id, l.link_type, l.target
                    ));
                }
            }
        }
    }

    println!(
        "ROWAN-ONLY PARTITION files={files_compared} artifacts={artifacts_compared} values={values_compared} derived={derived_compared} mismatches={}",
        mismatches.len()
    );
    for m in mismatches.iter().take(12) {
        println!("  MISMATCH {m}");
    }
    assert!(
        files_compared > 0 && artifacts_compared > 0 && values_compared > 0,
        "the rowan-only partition must be compared over a non-empty set, or agreement is \
         vacuous: files={files_compared} artifacts={artifacts_compared} values={values_compared}"
    );
    assert!(
        mismatches.is_empty(),
        "rowan disagrees with an independent parse on the rowan-only partition \
         ({} mismatches); first:\n  {}",
        mismatches.len(),
        mismatches.first().map(String::as_str).unwrap_or_default()
    );
}

/// Where DO the two paths diverge? The survey says nowhere on the real corpus,
/// which is only meaningful if the comparison can detect divergence at all.
///
/// yaml_cst documents that it does not handle anchors, aliases, tags, flow
/// mappings, complex keys, multi-document streams or merge keys. serde_yaml
/// handles most of those. Each case below ASSERTS the counts the two paths
/// currently produce, so that closing one of these gaps (REQ-346 needs the
/// flow-mapping one closed before it can migrate) reddens this test and forces
/// the record to be updated, rather than silently flipping to `agree`.
#[test]
fn divergence_probe() {
    let root = workspace_root();
    let (schema_names, _) = project_config(&root);
    let schema = rivet_core::load_schemas(&schema_names, &root.join("schemas"))
        .expect("load the project's own schema set");

    // (name, document, expected serde count (-1 = parse error), expected rowan count)
    let cases: Vec<(&str, String, i64, i64)> = vec![
        (
            "plain",
            "artifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n"
                .to_owned(),
            1,
            1,
        ),
        (
            "quoted-key",
            "artifacts:\n  - \"id\": R-1\n    \"type\": requirement\n    title: t\n    status: draft\n"
                .to_owned(),
            1,
            1,
        ),
        // Was the dangerous one: serde found the artifact, rowan returned
        // NOTHING and raised no error, so the artifact simply vanished.
        // `yaml_cst` gained a `FlowMapping` parse for REQ-346 and the two now
        // agree. Kept as an asserted case so a regression reddens here.
        (
            "flow-mapping",
            "artifacts:\n  - {id: R-1, type: requirement, title: t, status: draft}\n".to_owned(),
            1,
            1,
        ),
        // Both fail, differently: serde rejects the merge key outright, rowan
        // yields nothing.
        (
            "anchor+merge",
            "artifacts:\n  - &b\n    id: R-1\n    type: requirement\n    title: t\n    status: draft\n  - <<: *b\n    id: R-2\n"
                .to_owned(),
            -1,
            0,
        ),
        // Rowan is the MORE permissive path here: serde rejects a
        // multi-document stream, rowan parses the first document.
        (
            "multi-doc",
            "---\nartifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n---\nartifacts: []\n"
                .to_owned(),
            -1,
            1,
        ),
    ];

    println!("DIVERGENCE PROBE");
    let mut mismatches: Vec<String> = Vec::new();
    for (name, doc, want_serde, want_rowan) in &cases {
        let serde_n = rivet_core::formats::generic::parse_generic_yaml(doc, None)
            .map_or(-1, |v| v.len() as i64);
        let rowan_n = rivet_core::yaml_hir::extract_schema_driven(doc, &schema, None)
            .artifacts
            .len() as i64;
        let verdict = if serde_n == rowan_n {
            "agree"
        } else {
            "DIVERGE"
        };
        println!("  {name:<14} serde={serde_n:<3} rowan={rowan_n:<3} {verdict}");
        if serde_n != *want_serde || rowan_n != *want_rowan {
            mismatches.push(format!(
                "{name}: got serde={serde_n} rowan={rowan_n}, recorded serde={want_serde} rowan={want_rowan}"
            ));
        }
    }
    assert!(
        mismatches.is_empty(),
        "the recorded divergences changed — update REQ-348's record and REQ-346's \
         migration risk, do not just re-baseline the numbers:\n  {}",
        mismatches.join("\n  ")
    );
}

/// Flow mappings at the FIELD level rather than the artifact level — the shape
/// rivet's own corpus actually contains, in eighteen places: a block-mapped
/// artifact whose `provenance:` VALUE is a flow mapping.
///
/// This was the divergence. The artifact survived on both paths and the
/// provenance did not, which is why the survey reported 321 == 321 artifacts
/// and still differed on eighteen of them — a loss invisible to anything
/// counting artifacts. An earlier version of REQ-348 asserted the opposite,
/// that flow-style field values "both paths handle", on no evidence; this test
/// is that claim's oracle and it failed it until `FlowMapping` landed.
///
/// The block-style control is load-bearing: without it this test would pass on
/// a build where rowan never read provenance at all, which is a different
/// defect with a different fix.
#[test]
fn flow_style_field_value_reaches_both_paths() {
    let root = workspace_root();
    let (schema_names, _) = project_config(&root);
    let schema = rivet_core::load_schemas(&schema_names, &root.join("schemas"))
        .expect("load the project's own schema set");

    let block = "artifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n    provenance:\n      created-by: ai-assisted\n      model: m\n";
    let flow = "artifacts:\n  - id: R-1\n    type: requirement\n    title: t\n    status: draft\n    provenance: {created-by: ai-assisted, model: m}\n";

    let prov_serde = |doc: &str| {
        rivet_core::formats::generic::parse_generic_yaml(doc, None)
            .map(|v| v.iter().filter(|a| a.provenance.is_some()).count())
            .unwrap_or(0)
    };
    let prov_rowan = |doc: &str| {
        rivet_core::yaml_hir::extract_schema_driven(doc, &schema, None)
            .artifacts
            .iter()
            .filter(|sa| sa.artifact.provenance.is_some())
            .count()
    };

    // Control: block style is read by both. Without this the test below could
    // pass because rowan never reads provenance at all, which is a different
    // defect with a different fix.
    assert_eq!(
        prov_serde(block),
        1,
        "serde must read block-style provenance"
    );
    assert_eq!(
        prov_rowan(block),
        1,
        "rowan must read block-style provenance"
    );

    // The case that used to diverge.
    assert_eq!(prov_serde(flow), 1, "serde reads flow-style provenance");
    assert_eq!(
        prov_rowan(flow),
        1,
        "rowan must read flow-style provenance too — this asserted 0 until \
         REQ-346 added FlowMapping to yaml_cst"
    );

    // Same VALUES, not merely the same presence. A FlowMapping that parsed into
    // an empty Provenance would satisfy `is_some()` and still have lost the data.
    let model_of = |doc: &str| {
        rivet_core::yaml_hir::extract_schema_driven(doc, &schema, None)
            .artifacts
            .first()
            .and_then(|sa| sa.artifact.provenance.as_ref())
            .and_then(|p| p.model.clone())
    };
    assert_eq!(model_of(flow).as_deref(), Some("m"));
    assert_eq!(
        model_of(flow),
        model_of(block),
        "flow and block style must produce the same provenance, not merely both \
         produce one"
    );

    // And the artifact is still there — the flow parse must not consume it.
    let parsed = rivet_core::yaml_hir::extract_schema_driven(flow, &schema, None);
    assert_eq!(parsed.artifacts.len(), 1);
}
