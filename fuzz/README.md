# rivet fuzz targets

Fuzz targets for the rivet artifact-ingest pipeline.  Built on
[`cargo-fuzz`](https://rust-fuzz.github.io/book/cargo-fuzz.html) +
`libfuzzer-sys`.

## What each target checks

- **`yaml_footguns`** — adversarial mutations of a known-valid artifact YAML;
  oracle fails when rivet silently coerces / drops / synthesizes a changed
  value instead of rejecting with an error.
- **`cli_argv`** — structurally-generated argv for `rivet-cli`; oracle fails
  on signal-death, or when `--format json` produces invalid JSON on stdout.
- **`artifact_ids`** — arbitrary bytes as an `id:` scalar; oracle fails when
  `Store::insert` → `Store::get` does not round-trip the parsed id byte-exact.
- **`fuzz_yaml_artifact`** / **`fuzz_schema_merge`** / **`fuzz_reqif_import`**
  / **`fuzz_document_parse`** / **`fuzz_needs_json_import`** — pre-existing
  smoke fuzzers that only check for panics in low-level parse paths.

## How to run locally

```bash
# Once, install the driver.  Requires a nightly toolchain for sanitizer flags.
cargo install cargo-fuzz --locked
rustup install nightly

# YAML footgun fuzzer — priority target.
cargo +nightly fuzz run yaml_footguns -- -max_total_time=60

# Artifact-ID round-trip fuzzer.
cargo +nightly fuzz run artifact_ids -- -max_total_time=60

# CLI argv fuzzer.  Requires a pre-built rivet binary exposed via $RIVET_BIN.
cargo build --release --bin rivet
RIVET_BIN="$PWD/../target/release/rivet" \
    cargo +nightly fuzz run cli_argv -- -max_total_time=60
```

All commands are run from the `fuzz/` directory.  Crashes land in
`fuzz/artifacts/<target>/` and the evolved corpus in `fuzz/corpus/<target>/`.

## What the oracle considers a failure

The oracle is intentionally conservative: we only flag behavior we can prove
is wrong from the input text alone.

### `yaml_footguns`

- **panic**  — any `unwrap`, `expect`, arithmetic overflow, or explicit panic
  in `rivet_core::formats::generic::parse_generic_yaml` or
  `rivet_core::yaml_hir::extract_generic_artifacts`.
- **silent-accept** — parse returned `Ok(artifacts)` but at least one of
  `Artifact::id`, `Artifact::artifact_type`, or `Link::target` is
  (a) empty, or (b) not a substring of the source YAML.  The substring check
  is cheap but catches Norway-problem coercions, duplicate-key merges, and
  null-shorthand phantom links.

### `cli_argv`

- **panic** — the subprocess died from `SIGSEGV`, `SIGABRT`, `SIGILL`, or
  any other signal.  Non-zero exit codes are NOT failures; rivet is
  expected to reject malformed argv with a non-zero status.
- **silent-accept** — `--format json` returned exit 0 with non-empty stdout
  that does not parse as JSON.  CI pipelines pipe that to `jq`.

### `artifact_ids`

- **panic** — any panic from `parse_generic_yaml` or `Store::insert`.
- **roundtrip mismatch** — `Store::get(parsed_id)` either returned `None`,
  or returned an artifact whose `.id` byte-differs from the id we stored.
  Both indicate silent normalization (whitespace, Unicode, case) in the
  id handling code path.

## How to classify a finding

When a crash reproducer lands in `fuzz/artifacts/<target>/crash-*`, run:

```bash
cargo +nightly fuzz fmt <target> fuzz/artifacts/<target>/crash-<hash>
```

to pretty-print the structured input.  Classify as follows:

| Symptom in panic message | Class | Likely root cause |
|---|---|---|
| `silent-accept: … not present in source` | silent-accept | serde Value coerced YAML 1.1 bool/null/version into a different Rust string |
| `silent-accept: phantom link` | silent-accept | `yaml_hir.rs` extracted a link target from a `null`/`~`/`""` scalar |
| `id-roundtrip: … returned None` | roundtrip-bug | `Store` insert-key and lookup-key differ (normalization mismatch) |
| `rivet-cli died from signal …` | panic | CLI path hit an uncaught assertion or stack overflow |
| `--format json returned success but stdout is not JSON` | silent-accept | JSON path printed a human-readable error on stdout |
| plain Rust panic stack | panic | investigate directly; often `unwrap()` on schema lookup |

If the finding reproduces a bug documented in the Mythos pass (e.g.,
`yaml_hir.rs:530-549` phantom-link, `yaml_cst.rs:517` multi-doc truncation,
`formats/generic.rs:138` unknown-top-level-key acceptance), that's
empirical confirmation — file the minimal reproducer as a regression test
under `rivet-core/tests/yaml_edge_cases.rs`.

## CI

`.github/workflows/fuzz.yml` runs each target for 15 minutes on push-to-main
and nightly at 06:17 UTC.  Fuzz runs are `continue-on-error: true` so a new
crash does not block main; crashes upload as workflow artifacts.  The
evolved corpus is uploaded as an artifact and cached between runs.
