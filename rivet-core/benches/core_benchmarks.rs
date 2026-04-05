//! Performance benchmarks for rivet-core.
//!
//! These benchmarks serve as KPI baselines for core operations.
//! Target thresholds (on modern hardware):
//!   - Store insert of 10,000 artifacts:    < 10ms
//!   - Store lookup of 10,000 artifacts:    < 5ms
//!   - Link graph build (10,000 artifacts): < 50ms
//!   - Full validation (10,000 artifacts):  < 100ms
//!   - Matrix computation (10,000 source):  < 50ms

use std::collections::BTreeMap;
use std::path::PathBuf;

use criterion::{BenchmarkId, Criterion, criterion_group, criterion_main};

use rivet_core::diff::ArtifactDiff;
use rivet_core::document;
use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
use rivet_core::model::{Artifact, Link};
use rivet_core::query::{self, Query};
use rivet_core::schema::Schema;
use rivet_core::store::Store;
use rivet_core::validate;

// ── Helpers ─────────────────────────────────────────────────────────────

fn schemas_dir() -> PathBuf {
    PathBuf::from(env!("CARGO_MANIFEST_DIR")).join("../schemas")
}

fn load_test_schema(names: &[&str]) -> Schema {
    let dir = schemas_dir();
    let mut files = Vec::new();
    for name in names {
        let path = dir.join(format!("{name}.yaml"));
        if path.exists() {
            files.push(Schema::load_file(&path).expect("load schema"));
        }
    }
    Schema::merge(&files)
}

const ARTIFACT_TYPES: &[&str] = &[
    "loss",
    "hazard",
    "system-constraint",
    "controller",
    "controlled-process",
];

/// Generate N artifacts with deterministic links.
/// Each artifact links to ~`links_per` other artifacts.
fn generate_artifacts(n: usize, links_per: usize) -> Vec<Artifact> {
    (0..n)
        .map(|i| {
            let art_type = ARTIFACT_TYPES[i % ARTIFACT_TYPES.len()];
            let links: Vec<Link> = (1..=links_per)
                .map(|j| {
                    let target_idx = (i + j) % n;
                    Link {
                        link_type: "leads-to-loss".into(),
                        target: format!("BENCH-{target_idx}"),
                    }
                })
                .filter(|l| l.target != format!("BENCH-{i}"))
                .collect();
            Artifact {
                id: format!("BENCH-{i}"),
                artifact_type: art_type.to_string(),
                title: format!("Benchmark artifact {i}"),
                description: Some(format!("Description for benchmark artifact {i}")),
                status: Some("approved".into()),
                tags: vec!["bench".into(), format!("group-{}", i % 10)],
                links,
                fields: {
                    let mut f = BTreeMap::new();
                    f.insert("priority".into(), serde_yaml::Value::String("must".into()));
                    f
                },
                provenance: None,
                source_file: None,
            }
        })
        .collect()
}

/// Build a pre-populated store.
fn build_store(artifacts: &[Artifact]) -> Store {
    let mut store = Store::new();
    for a in artifacts {
        store.upsert(a.clone());
    }
    store
}

// ── Benchmarks ──────────────────────────────────────────────────────────

fn bench_store_insert(c: &mut Criterion) {
    let mut group = c.benchmark_group("store_insert");

    for &n in &[100, 1000, 10000] {
        let artifacts = generate_artifacts(n, 0);
        group.bench_with_input(BenchmarkId::from_parameter(n), &artifacts, |b, arts| {
            b.iter(|| {
                let mut store = Store::new();
                for a in arts {
                    store.upsert(a.clone());
                }
                store
            });
        });
    }

    group.finish();
}

fn bench_store_lookup(c: &mut Criterion) {
    let mut group = c.benchmark_group("store_lookup");

    for &n in &[100, 1000, 10000] {
        let artifacts = generate_artifacts(n, 0);
        let store = build_store(&artifacts);
        let ids: Vec<String> = (0..n).map(|i| format!("BENCH-{i}")).collect();

        group.bench_with_input(BenchmarkId::from_parameter(n), &ids, |b, ids| {
            b.iter(|| {
                for id in ids {
                    std::hint::black_box(store.get(id));
                }
            });
        });
    }

    group.finish();
}

fn bench_store_by_type(c: &mut Criterion) {
    let mut group = c.benchmark_group("store_by_type");

    for &n in &[100, 1000, 10000] {
        let artifacts = generate_artifacts(n, 0);
        let store = build_store(&artifacts);

        group.bench_with_input(BenchmarkId::from_parameter(n), &n, |b, _| {
            b.iter(|| {
                for t in ARTIFACT_TYPES {
                    std::hint::black_box(store.by_type(t));
                }
            });
        });
    }

    group.finish();
}

fn bench_schema_load_and_merge(c: &mut Criterion) {
    c.bench_function("schema_load_and_merge", |b| {
        b.iter(|| {
            let schema = load_test_schema(&["common", "stpa", "aspice"]);
            std::hint::black_box(schema)
        });
    });
}

fn bench_link_graph_build(c: &mut Criterion) {
    let mut group = c.benchmark_group("link_graph_build");
    let schema = load_test_schema(&["common", "stpa"]);

    for &n in &[100, 1000, 10000] {
        let artifacts = generate_artifacts(n, 3);
        let store = build_store(&artifacts);

        group.bench_with_input(BenchmarkId::from_parameter(n), &n, |b, _| {
            b.iter(|| {
                let graph = LinkGraph::build(&store, &schema);
                std::hint::black_box(graph)
            });
        });
    }

    group.finish();
}

fn bench_validate(c: &mut Criterion) {
    let mut group = c.benchmark_group("validate");
    let schema = load_test_schema(&["common", "stpa"]);

    for &n in &[100, 1000, 10000] {
        let artifacts = generate_artifacts(n, 3);
        let store = build_store(&artifacts);
        let graph = LinkGraph::build(&store, &schema);

        group.bench_with_input(BenchmarkId::from_parameter(n), &n, |b, _| {
            b.iter(|| {
                let diags = validate::validate(&store, &schema, &graph);
                std::hint::black_box(diags)
            });
        });
    }

    group.finish();
}

fn bench_traceability_matrix(c: &mut Criterion) {
    let mut group = c.benchmark_group("traceability_matrix");
    let schema = load_test_schema(&["common", "stpa"]);

    for &n in &[100, 1000, 10000] {
        let artifacts = generate_artifacts(n, 3);
        let store = build_store(&artifacts);
        let graph = LinkGraph::build(&store, &schema);

        group.bench_with_input(BenchmarkId::from_parameter(n), &n, |b, _| {
            b.iter(|| {
                let m = matrix::compute_matrix(
                    &store,
                    &graph,
                    "hazard",
                    "loss",
                    "leads-to-loss",
                    Direction::Forward,
                );
                std::hint::black_box(m)
            });
        });
    }

    group.finish();
}

// ── Diff helpers ────────────────────────────────────────────────────────

/// Build a pair of stores (base, head) that differ in a realistic way.
///
/// - ~10% of artifacts are added in head (not in base)
/// - ~10% of artifacts are removed from head (only in base)
/// - ~20% of common artifacts have modified titles
/// - remaining ~60% are identical
fn build_diff_stores(n: usize) -> (Store, Store) {
    let added_count = n / 10;
    let removed_count = n / 10;
    let common_count = n - added_count - removed_count;
    let modified_count = common_count / 3; // roughly 20% of total

    let mut base = Store::new();
    let mut head = Store::new();

    // Common artifacts (some modified in head)
    for i in 0..common_count {
        let art_type = ARTIFACT_TYPES[i % ARTIFACT_TYPES.len()];
        let base_art = Artifact {
            id: format!("DIFF-{i}"),
            artifact_type: art_type.to_string(),
            title: format!("Artifact {i}"),
            description: Some(format!("Description for artifact {i}")),
            status: Some("approved".into()),
            tags: vec!["common".into()],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        base.upsert(base_art.clone());

        if i < modified_count {
            // Modified in head: change title and add a tag
            let mut head_art = base_art;
            head_art.title = format!("Modified artifact {i}");
            head_art.tags.push("modified".into());
            head.upsert(head_art);
        } else {
            head.upsert(base_art);
        }
    }

    // Removed artifacts (only in base)
    for i in 0..removed_count {
        let idx = common_count + i;
        let art = Artifact {
            id: format!("DIFF-{idx}"),
            artifact_type: "loss".to_string(),
            title: format!("Removed artifact {i}"),
            description: None,
            status: Some("draft".into()),
            tags: vec![],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        base.upsert(art);
    }

    // Added artifacts (only in head)
    for i in 0..added_count {
        let idx = common_count + removed_count + i;
        let art = Artifact {
            id: format!("DIFF-{idx}"),
            artifact_type: "hazard".to_string(),
            title: format!("Added artifact {i}"),
            description: None,
            status: Some("draft".into()),
            tags: vec!["new".into()],
            links: vec![],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };
        head.upsert(art);
    }

    (base, head)
}

// ── Document helpers ────────────────────────────────────────────────────

/// Generate a markdown document string with YAML frontmatter and `n` sections,
/// each containing `[[ID]]` artifact references.
fn generate_document(sections: usize) -> String {
    let mut doc = String::new();

    // YAML frontmatter
    doc.push_str("---\n");
    doc.push_str("id: BENCH-DOC-001\n");
    doc.push_str("type: specification\n");
    doc.push_str("title: Benchmark Specification Document\n");
    doc.push_str("status: draft\n");
    doc.push_str("glossary:\n");
    doc.push_str("  STPA: Systems-Theoretic Process Analysis\n");
    doc.push_str("  UCA: Unsafe Control Action\n");
    doc.push_str("---\n\n");

    doc.push_str("# Benchmark Specification Document\n\n");
    doc.push_str("## Introduction\n\n");
    doc.push_str("This is a benchmark document for measuring parse performance.\n\n");

    for i in 0..sections {
        doc.push_str(&format!("## Section {i}\n\n"));
        doc.push_str(&format!(
            "This section describes requirement [[REQ-{i}]] in detail.\n\n"
        ));
        doc.push_str(&format!(
            "It also references [[HAZ-{i}]] and [[SC-{i}]] for traceability.\n\n"
        ));
        // Add some filler prose to make the document realistically sized
        doc.push_str(
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit. \
             Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. \
             Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.\n\n",
        );
    }

    doc
}

// ── New benchmarks ──────────────────────────────────────────────────────

fn bench_diff(c: &mut Criterion) {
    let mut group = c.benchmark_group("diff");

    for &n in &[100, 1000, 10000] {
        let (base, head) = build_diff_stores(n);

        group.bench_with_input(BenchmarkId::from_parameter(n), &n, |b, _| {
            b.iter(|| {
                let diff = ArtifactDiff::compute(&base, &head);
                std::hint::black_box(diff)
            });
        });
    }

    group.finish();
}

fn bench_query(c: &mut Criterion) {
    let mut group = c.benchmark_group("query");

    for &n in &[100, 1000, 10000] {
        let artifacts = generate_artifacts(n, 2);
        let store = build_store(&artifacts);

        // Query filters by type + status + tag (exercises multiple match arms)
        let query = Query {
            artifact_type: Some("hazard".into()),
            status: Some("approved".into()),
            tag: Some("bench".into()),
            has_link_type: Some("leads-to-loss".into()),
            missing_link_type: None,
        };

        group.bench_with_input(BenchmarkId::from_parameter(n), &n, |b, _| {
            b.iter(|| {
                let results = query::execute(&store, &query);
                std::hint::black_box(results)
            });
        });
    }

    group.finish();
}

fn bench_document_parse(c: &mut Criterion) {
    let mut group = c.benchmark_group("document_parse");

    // Scale by number of sections: 10, 100, 1000 (producing small/medium/large docs)
    for &sections in &[10, 100, 1000] {
        let content = generate_document(sections);

        group.bench_with_input(
            BenchmarkId::from_parameter(sections),
            &content,
            |b, content| {
                b.iter(|| {
                    let doc = document::parse_document(content, None).unwrap();
                    std::hint::black_box(doc)
                });
            },
        );
    }

    group.finish();
}

// ── Criterion groups ────────────────────────────────────────────────────

criterion_group!(
    benches,
    bench_store_insert,
    bench_store_lookup,
    bench_store_by_type,
    bench_schema_load_and_merge,
    bench_link_graph_build,
    bench_validate,
    bench_traceability_matrix,
    bench_diff,
    bench_query,
    bench_document_parse,
);
criterion_main!(benches);
