# Rivet CLI Gaps — 2026-04

Status: design proposal (no code yet)
Author: synthesised from a 37-module unit-test-to-artifact gap walk on a
3,400-artifact rivet project.
Refs: FEAT-001

This document captures five missing rivet features that would have turned
a week of manual artifact scaffolding into a single afternoon, plus a
ranked backlog of smaller improvements the same session surfaced.

All file-path anchors below were verified against the current tree in
`rivet-cli/src/` and `rivet-core/src/` at the commit this doc was written
against (branch `docs/cli-gaps-2026-04`). Line numbers are stable enough
to aim at, not exact contracts.

---

## Severity & improvement backlog

Ranked by impact observed during the 37-module gap walk. Items 1, 2, and 9
are already being worked on by parallel agents and are included for
completeness only. LoC estimates are rough (small <200, medium 200-500,
large 500+).

| #  | Severity | Item                                                                      | Fix site                                                              | LoC  |
|----|----------|---------------------------------------------------------------------------|-----------------------------------------------------------------------|------|
| 1  | HIGH     | Variant check ignores cross-tree constraints (correctness bug)            | `rivet-core/src/feature_model.rs` `solve()` around line 337           | med  |
| 2  | HIGH     | Salsa default validation emits spurious AADL broken-link errors           | `rivet-core/src/db.rs` salsa query for link graph + AADL load path    | med  |
| 3  | HIGH     | Feature-model YAML schema is undocumented                                 | `docs/schemas.md` + new section; pointer from `rivet-core/src/feature_model.rs` doctests | small |
| 4  | MED      | Pre-commit hook path fragility after repo relocation                      | `rivet-cli/src/main.rs` `cmd_init_hooks` @ 2416, `which_rivet` @ 2483 | small |
| 5  | MED      | `import-results` discoverability is near-zero                             | `rivet-cli/src/main.rs` Command enum @ 538; `docs/getting-started.md` | small |
| 6  | MED      | Variant-scoped validation API: all three flags are required together     | `rivet-cli/src/main.rs` `cmd_validate` @ 2945-2993                    | small |
| 7  | MED      | Constraint syntax errors are positional, not semantic                     | `rivet-core/src/feature_model.rs` `preprocess_feature_constraint` @ 112, `from_yaml` @ 207 | med |
| 8  | MED      | `rivet variant solve` does not distinguish selected vs propagated         | `rivet-core/src/feature_model.rs` `ResolvedVariant` @ 61 + `solve()` @ 337; `cmd_variant_solve` @ 6663 | small |
| 9  | MED      | Doc embeds are undiscoverable (no `rivet docs list-embeds`)               | `rivet-core/src/embed.rs` + new `rivet docs --embeds` flag            | small |
| 10 | MED      | `rivet init --agents` regen clobbers local edits                          | `rivet-cli/src/main.rs` `cmd_init_agents` @ 2551                      | small |

Minor / polish items:

| Item                                                          | Fix site                                                                        | LoC  |
|---------------------------------------------------------------|---------------------------------------------------------------------------------|------|
| `rivet validate --format json` has no published schema        | `schemas/` (new `validate-output.schema.json`) + doc ref from `cmd_validate`    | small |
| No `rivet validate --fail-on warning`                         | `rivet-cli/src/main.rs` Validate args @ 192-224; exit-code logic @ 3335        | small |
| `rivet stats --format json` missing warning/error counts      | `rivet-cli/src/main.rs` `compute_stats` @ 3648 + `cmd_stats` @ 3601             | small |
| No `--min-coverage <N>` gate flag (symmetric with `--fail-under`) | `rivet-cli/src/main.rs` Coverage args @ 274-299 (already has `fail_under`: rename/alias) | small |

---

## The five missing features

Ordered for implementation. Feature 4 (schema `path` field type) is the
foundation; features 1 and 5 are the reporting-project daily drivers;
feature 2 builds on 1; feature 3 builds on the validator + feature 1.

### Dependency graph

```
   (4) schema path type
         |
         +---> (1) rivet discover
         |         |
         |         +---> (2) rivet add --from-source
         |         |
         |         +---> (3) rivet gaps --rule --suggest
         |
         +---> (5) JUnit -> unit-verification generation
```

Implementation order: **4 -> 1 -> 2 -> 5 -> 3**.

- 4 first because its effect on the schema (declaring `source-file` as a
  typed `path`) removes an `unknown-field` info diagnostic from every
  artifact with a source pointer, and gives 1/2/3/5 a typed, validated
  input to read.
- 1 second because it is the scanner everything else calls.
- 2 third because it is the smallest user-facing consumer of 1.
- 5 before 3 because 5's output (generated `SWVF_*` artifacts) is what
  closes the "tests exist, just missing artifact" bucket that 3
  surfaces — if 3 shipped first its top remediation would be "run 5".
- 3 last because it is the report/UX layer over 1+5.

---

### Feature 4 — Typed `path` field in the schema

**Why.** Today `source-file:` on any `sw-detail-design` or similar artifact
produces `INFO: field 'source-file' is not defined in schema for type ...`
(emitted at `rivet-core/src/validate.rs:448`). Users work around this by
adding it as `type: string` (see `schemas/score.yaml:400-402`), losing
path existence checks and preventing tools like the new `rivet discover`
from getting a typed index.

**Scope.**
- In: add `path` as a first-class `field_type` value. Validate that the
  value is a relative path, that the file exists (relative to the
  artifact's source YAML file's directory, with fallback to project
  root), and index artifacts by resolved source-file path in the store.
- In: keep `type: string` working for `source-file` so existing schemas
  parse unchanged. `type: path` is an opt-in upgrade.
- Out: globs, multiple paths per field (`list<path>`), URI schemes,
  symlink resolution.

**CLI shape.** No new subcommand. Affects `rivet validate` output
(`path-not-found` warnings replace `unknown-field` infos) and gives
`rivet schema show <type>` a new field-type string.

**Impl anchor.**
- `rivet-core/src/schema.rs:102-112` `FieldDef` — extend the doc comment
  to document `path` as an accepted `field_type` string. No struct
  change needed (field_type is already a `String`).
- `rivet-core/src/validate.rs:195-245` — after the allowed-values block,
  add an `if field.field_type == "path"` arm that checks existence
  relative to `artifact.source_file`'s directory and emits a new
  `path-not-found` diagnostic (Severity::Warning). The `Artifact`
  already carries `source_file: Option<PathBuf>` (model.rs:97-99) so
  the base dir is available.
- `rivet-core/src/store.rs` — add a `by_source_path(&Path) ->
  Vec<&Artifact>` index, populated on `upsert`. This is what
  `rivet discover` (Feature 1) will call.
- `schemas/score.yaml:400-402` and `schemas/stpa.yaml` — upgrade
  `source-file: type: string` to `type: path`.
- `rivet-core/src/validate.rs:433-455` (unknown-field loop) — no change,
  but `source-file` stops triggering it because the typed field is
  declared.

**Dependency.** None. Foundation for 1, 2, 3, 5.

**Risk.** File-existence checks in `validate` turn a pure function
impure (walks the disk). Must stay cheap: one `Path::exists` per
artifact, no recursion. Also: paths in YAML can be relative to the
*source YAML file*, not `cli.project` — get the base dir wrong and you
break validation for every project that uses multiple source dirs.

**LoC.** Small (~120: new validation arm + store index + schema edits +
tests).

---

### Feature 1 — `rivet discover` / `rivet scan`

**Why.** Given a 3,400-artifact project with declared `source-file:
rivet-core/src/validate.rs` on each design artifact, there is no way to
ask "which of these modules have tests, how many, and of what flavour?"
Today the user writes a one-off `grep -r '#\[test\]'` script for each
language. The existing `rivet-core/src/test_scanner.rs` only finds
*rivet-specific* markers (`// rivet: verifies REQ-001`), not native
test-framework markers (`#[test]`, `#[kani::proof]`, `TEST(`, etc.).

**Scope.**
- In: per-language native-test detectors for Rust (`#[test]`,
  `#[tokio::test]`, `#[kani::proof]`, `proptest!`), Python
  (`def test_*`, `@pytest.mark.*`), Go (`func Test*`), C/C++ (GoogleTest
  `TEST(`, `TEST_F(`), Java (`@Test`).
- In: output is a per-artifact table of `(id, source-file, lang, test
  count)` plus a suggested `unit-verification` artifact YAML stub on
  stdout or to a file with `--emit`.
- In: reads `source-file` field values out of the store via the Feature
  4 index; resolves each to disk and scans only those files (not the
  whole tree).
- Out: test *coverage* line counts, LLVM profdata, flaky-test detection,
  parametrised test expansion.

**CLI shape.**

```
rivet discover [--type <artifact-type>] [--lang rust|python|go|cpp|java|all]
               [--format text|json] [--emit <dir>] [--no-tests-only]
```

- no positional args: defaults to scanning every artifact in the store
  that has a `source-file` field of schema-type `path`.
- `--emit <dir>`: writes a per-module `SWVF_<crate>_<module>.yaml`
  scaffold (scaffolds only, no YAML write if `-` passed — stdout dump).
- `--no-tests-only`: show only artifacts where zero tests were found
  (the "gap" mode).
- text output columns: `ID | source-file | lang | #test | #kani |
  #proptest | suggestion`

**Impl anchor.**
- `rivet-core/src/test_scanner.rs` (existing, line ~108
  `default_patterns()`) — add a parallel
  `pub fn default_native_test_patterns() -> Vec<NativeTestPattern>` with
  per-language regexes; do **not** fold them into the existing rivet-marker
  patterns because consumers of `compute_test_coverage` depend on the
  current behaviour.
- `rivet-core/src/test_scanner.rs` — new `pub struct
  NativeTestReport { per_file: BTreeMap<PathBuf, TestCounts> }` and `pub
  fn scan_native_tests(paths: &[PathBuf]) -> NativeTestReport`. Reuse
  `detect_language()` @ line 111 and `scan_directory/scan_file`
  machinery @ lines 176-260.
- `rivet-cli/src/main.rs` — add a `Discover { .. }` variant to the
  Command enum near the other introspection verbs at line 405
  (`Schema`), and a `cmd_discover()` function next to
  `cmd_coverage_tests` @ 3784 (same shape: iterate store, call scanner,
  render text/JSON).
- `rivet-cli/src/main.rs` — the `--emit` writer reuses the YAML append
  machinery already in `rivet-core/src/mutate.rs`
  (`append_artifact_to_file`).

**Dependency.** Hard-depends on Feature 4 for the typed `source-file`
index — without it the command has to re-walk `fields` across every
artifact looking for a magic key name, which is the exact fragility this
doc is trying to remove.

**Risk.** Regex-based test detection has false positives (a comment
containing `#[test]`). Mitigate by anchoring patterns to start-of-line
with leading whitespace, and by shipping with a `--verify-with cargo
test --list` escape hatch for Rust (deferred out of MVP but leave the
seam).

**LoC.** Medium (~350: new patterns + NativeTestReport + subcommand +
text/JSON render + tests for each language).

---

### Feature 2 — `rivet add --from-source <path>`

**Why.** Symmetric to `rivet import-results --format junit` (line 538 of
main.rs) which creates *results*, but there is no analogous command for
creating the *artifact* a result would bind to. During the 37-module
walk the user typed `rivet add --type sw-verification --title "..."
--field source-file=... --link ...` 37 times. A single `rivet add
--from-source src/foo.rs --type sw-verification` that autofills the
title, source-file, and a skeleton links block would collapse that into
one command.

**Scope.**
- In: given a source path, run the native-test detector (Feature 1),
  pick a sensible title (`{crate}::{module} unit verification`), set
  `source-file`, optionally suggest `verifies:` links by looking at
  artifacts with the same `source-file` and adding a
  `verifies:<their-id>` link if exactly one matches.
- In: `--dry-run` prints the YAML it would write.
- Out: multi-file batching (that's what Feature 1 `--emit` is for),
  auto-filing into the right YAML file if no `find_file_for_type` match
  exists.

**CLI shape.**

```
rivet add --from-source <path> --type <type>
          [--file <target.yaml>] [--dry-run]
          [--title <override>] [--link <type:target>]...
```

The existing `Add` variant at `rivet-cli/src/main.rs:567-599` already
takes most of these flags. `--from-source` is an additional mutually-
exclusive input mode that populates defaults before the normal
validate-and-write pipeline at line 7329
(`mutate::validate_add`).

**Impl anchor.**
- `rivet-cli/src/main.rs:567` `Add { .. }` — add
  `from_source: Option<PathBuf>` field and `dry_run: bool`.
- `rivet-cli/src/main.rs:7277` `cmd_add()` — new branch near the top
  that, when `from_source.is_some()`, calls into a new
  `scaffold_from_source()` helper in
  `rivet-core/src/mutate.rs`. That helper returns a fully-populated
  `Artifact` which the existing code path then validates and writes
  (lines 7316-7346).
- `rivet-core/src/mutate.rs` — new `pub fn scaffold_from_source(path:
  &Path, artifact_type: &str, store: &Store, schema: &Schema) ->
  Result<Artifact, Error>` that calls
  `test_scanner::scan_native_tests(&[path])` (Feature 1) to populate
  title/description, sets `source-file`, and walks the store to
  suggest `verifies` links.

**Dependency.** Soft-depends on Feature 1 (for test detection to
populate the title/description) and Feature 4 (to set `source-file` as a
validated path). Works without them in degraded mode (just `title:
"<module> unit verification"`).

**Risk.** Auto-link suggestion is subtle: it has to avoid silently
linking to the wrong requirement when two design artifacts share a
source file. MVP rule: link only if exactly one candidate; otherwise
omit and print a hint.

**LoC.** Small (~180: one helper in mutate.rs + one arg + one branch in
cmd_add + tests).

---

### Feature 5 — JUnit -> unit-verification artifact generation

**Why.** `rivet import-results --format junit`
(`rivet-cli/src/main.rs:7103`) records pass/fail against artifacts that
*already exist*. When the artifacts do **not** exist, each testcase just
becomes a result pointing at a dangling artifact ID that
`rivet validate` then flags. The user needs a mode that, given JUnit XML
and an ID-template, *creates* the missing artifacts before recording
results. The 37-module session's naming convention:
`SWVF_rust_unit_<crate>_<module>` bound to
`SDD_MOD_<crate>_<module>` by `verifies` link.

**Scope.**
- In: new `rivet import-results --format junit --generate-artifacts
  --template <tmpl> --link-template <tmpl>` that, for every testcase
  not already in the store, emits one `unit-verification` artifact and
  (optionally) one `verifies` link to a template-derived target ID.
- In: ID template uses `{classname}`, `{test}`, `{crate}`, `{module}`
  with a simple `{classname:split:.}` transform for dot-separated
  classnames.
- In: `--dry-run` lists what it *would* create without writing.
- Out: mutating already-existing artifacts to add missing `verifies`
  links (that is what `rivet link` is for).

**CLI shape.**

```
rivet import-results --format junit <file>
                     [--output <dir>]
                     [--generate-artifacts]
                     [--template 'SWVF_{lang}_unit_{classname:split:.:-1}']
                     [--link-template 'verifies:SDD_MOD_{classname:split:.:-1}']
                     [--artifact-file <target.yaml>]
                     [--dry-run]
```

**Impl anchor.**
- `rivet-cli/src/main.rs:537-549` `ImportResults` — add
  `generate_artifacts: bool`, `template: Option<String>`,
  `link_template: Option<String>`, `artifact_file: Option<PathBuf>`,
  `dry_run: bool`.
- `rivet-cli/src/main.rs:7103` `cmd_import_results_junit` — after the
  existing `parse_junit_xml()` call (line 7110), if
  `generate_artifacts` is set, load the project store, expand each
  testcase through the template, filter out those already in the
  store, build `Artifact` values, run `mutate::validate_add`, and
  append using `mutate::append_artifact_to_file` (all helpers already
  used by `cmd_add`).
- `rivet-core/src/junit.rs` — add a small `pub struct IdTemplate` with
  `expand(testcase_name, classname) -> String` that supports the
  `{field:split:sep:index}` grammar above; unit-test it heavily.
- `rivet-core/src/mutate.rs` — no change, reuse `append_artifact_to_file`
  / `validate_add`.

**Dependency.** Independent of Features 1-3. Benefits from Feature 4
because the generated artifacts will carry `source-file:` fields.

**Risk.** Template language creep — everyone wants Jinja. MVP must ship
with exactly the `{field}` and `{field:split:sep:idx}` grammar and
refuse anything else with an explicit error. Otherwise we will be
supporting `{field | upper | default("x")}` in six months.

**LoC.** Medium (~250: template expander + generate branch + template
tests + a few integration tests against a fixture JUnit XML).

---

### Feature 3 — `rivet gaps --rule <name> --suggest`

**Why.** After running `rivet validate --format json`, users see a flat
list of rule violations. To remediate a single rule (say
`sw-design-needs-verification`) they have to cross-reference the failed
artifact list against what is actually in the source tree. Today this
takes 90 minutes of shell pipelines. `rivet gaps` bucketises the failed
artifacts into actionable groups using Features 1 + 5 as the evidence
source.

**Scope.**
- In: `--rule <name>` filters the diagnostic stream to a single rule
  (exact match of `Diagnostic.rule`). Each flagged artifact goes into
  one of three buckets:
  1. `tests-exist-missing-artifact`: Feature 1's native scanner finds
     tests in the source-file, but no verification artifact exists.
     Suggested remediation: `rivet import-results --format junit
     --generate-artifacts ...` or `rivet add --from-source ...`.
  2. `no-tests-anywhere`: source-file exists, but the scanner finds
     zero native tests. Suggested remediation: write tests.
  3. `covered-elsewhere`: the `verifies` link from this artifact points
     at a test artifact that is covered by integration tests (i.e., has
     at least one `rivet import-results`-derived pass). Suggested
     remediation: none, expected state.
- In: `--suggest` prints a copy-pasteable remediation row per bucket.
- Out: auto-running the remediation.

**CLI shape.**

```
rivet gaps --rule <rule-name> [--suggest]
           [--format text|json]
           [--bucket tests-exist|no-tests|covered-elsewhere|all]
```

**Impl anchor.**
- `rivet-cli/src/main.rs` — add a `Gaps { .. }` Command variant near the
  Coverage variant @ 275, and a `cmd_gaps()` function next to
  `cmd_coverage_tests` @ 3784. The function runs the same
  `run_salsa_validation` as `cmd_validate`
  (`rivet-cli/src/main.rs:3019`), filters diagnostics by rule, and for
  each flagged artifact:
  - call `test_scanner::scan_native_tests` (Feature 1) on its
    `source-file`,
  - cross-reference against `ResultStore` loaded from
    `rivet-core/src/results.rs:188` `load_results`.
- `rivet-core/src/validate.rs` — no change; the existing `Diagnostic`
  struct already carries `rule` and `artifact_id`.
- `rivet-core/src/test_scanner.rs` — expose
  `NativeTestReport::has_tests_for(&Path) -> bool` as a convenience.
- `rivet-cli/src/main.rs:7088` `cmd_import_results` — no change; the
  `--suggest` output just prints the command strings.

**Dependency.** Hard-depends on Feature 1 (native-test evidence) and
Feature 5 (for one of the three suggested remediations to actually
exist as a command). Soft-depends on Feature 4 (for `source-file` to be
a typed field it can safely read).

**Risk.** Bucketising requires three data sources (diagnostics, native
tests, result store) to agree on artifact IDs. If any source uses a
different ID shape the bucketisation silently mis-categorises.
Mitigation: emit a `ambiguous` bucket for any artifact where two
sources disagree, rather than hiding the disagreement.

**LoC.** Medium (~300: subcommand + bucketiser + suggestion renderer +
tests with a three-bucket fixture project).

---

## Out of scope for this doc

- `rivet discover` producing a *diff* between declared and discovered
  tests (that's a phase-2 feature on top of 1).
- Coverage-based weighting in Feature 3 (line-hit counts per test).
- A WIT interface for plugging custom language detectors (today's set
  of 5-6 languages is the MVP).

## Notes on the commit trailer

Per `CLAUDE.md`, commits touching `rivet-core/src/` or `rivet-cli/src/`
require traceability trailers. This doc does not touch source code, only
`docs/design/`. The commit message still includes `Refs: FEAT-001`
because FEAT-001 is the dashboard/traceability feature that all five
proposals plug into.
