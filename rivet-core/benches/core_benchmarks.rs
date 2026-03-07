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

use rivet_core::links::LinkGraph;
use rivet_core::matrix::{self, Direction};
use rivet_core::model::{Artifact, Link};
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
);
criterion_main!(benches);
