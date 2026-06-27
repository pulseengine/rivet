# Changelog

<!-- AUDIT-FILE: verified 2026-04-22 — all numeric counts in this file
     are historical snapshots taken at release time, not current state. -->

## [Unreleased]

## [0.22.1] - 2026-06-27

### Fixed
- **`rivet modify --set-release` no longer corrupts an artifact with a folded
  (`>`) or literal (`|`) `description:` scalar (data loss).** A follow-up to the
  v0.21.1 fix: the insert-position logic consumed a field's block extent but
  **broke on the first blank line** — and a block scalar can contain internal
  blank lines (a folded `description:` with a blank between paragraphs is very
  common). So `--set-release` spliced the new `release:` key *inside* the scalar,
  truncating the description and producing an invalid/misattributed value
  (silent — `modify` reported success). The inserter now peeks past blank runs:
  a blank belongs to the scalar only when a deeper-indented line follows.
  Reported on real v0.22.0 use (#613). (REQ-004)

## [0.22.0] - 2026-06-27

Theme: **Release planning, complete** — turn the v0.21 `release:` field into a
full, dogfooded workflow. v0.22 is the first rivet release planned, executed,
and gated entirely with rivet's own tooling: the plan lives in `release:`-tagged
artifacts, and `rivet release status` is the authority that called it cuttable.

### Added
- **`rivet list --release <ver>`** (REQ-232, #516) — the release-planning view;
  keep only artifacts scoped to a release. Sugar for `(= release "<ver>")`,
  composes with `--type`/`--status`/`--filter`.
- **`rivet release status <ver>`** (REQ-233, #516) — readiness burn-down:
  per-status counts of the artifacts in a release, the not-yet-`verified` set
  that blocks the cut, and a cuttable verdict. **Exits non-zero while not
  cuttable**, so CI can gate a release on it. `--format json` too.
- **`rivet release move <id> <ver>`** (REQ-234, #516) — re-target an artifact to
  a release as a logged scope decision; reports the old → new transition,
  idempotent, via the safe modify write-path.
- **`rivet shard <file>`** (REQ-235, #490 / DD-070) — split a single-file
  artifact source into one `<ID>.yaml` per artifact so existing projects adopt
  the conflict-free per-id layout (the data-migration half of #490). Reversible
  and lossless: writes the per-id files, verifies they hold the same id set,
  backs up the original, reloads the whole project to confirm nothing was lost,
  and only then removes the backup — restoring + refusing on any mismatch.

## [0.21.1] - 2026-06-26

### Fixed
- **`rivet modify --set-release` (and any new-base-field insert) no longer
  corrupts artifacts with a trailing block mapping (data loss).** `--set-release`
  — shipped in v0.21.0 — spliced the new `release:` key *between* a trailing
  `provenance:` block and its children, producing invalid YAML so the artifact
  (and its file-mates) vanished on reload. Since every AI-stamped artifact has a
  `provenance:` block, this hit most artifacts the command touched. The inserter
  now skips a field's full extent, including nested block-mapping children, and
  places the new field after the whole block. Found by dogfooding the v0.21.0
  release field. (REQ-004)

## [0.21.0] - 2026-06-26

Theme: **Authoring & release ergonomics** — fix the dogfooding friction that
bites while planning and editing artifacts, and make release-planning a
first-class, queryable dimension rather than a tag convention.

### Added
- **First-class `release:` field on artifacts (REQ-010, #516).** Optional
  top-level scope (e.g. `release: v0.21.0`) on every artifact — the
  release-planning axis the status lifecycle always implied. An unassigned
  artifact is backlog; readiness is the query "which artifacts in
  `release: vX.Y` are not yet `verified`". Threaded through every load/save and
  query path (generic-yaml + the rowan-yaml loader, `render_artifact_yaml`,
  importers) so the value round-trips with no data loss. Set it with
  `rivet modify <ID> --set-release vX.Y`; filter with
  `rivet list --filter '(= release "vX.Y")'` (also emitted in
  `list --format json`). Slice 1 of #516; a `--release` list filter and a
  release-readiness burn-down query follow.

### Fixed
- **`modify --set-field` no longer corrupts flow-style `fields:` maps
  (REQ-004, #573).** Setting a custom field on an artifact whose `fields:` was
  written inline (`fields: { a: 1 }`) used to append a block child under the
  flow mapping, producing invalid YAML — the file then failed to parse and
  **every artifact in it silently vanished** (data loss). The flow map is now
  normalized to block style via the real YAML parser before the insert.
- **`rivet verify` from a cargo workspace root (#574).** Confirmed the default
  marker scan finds `// rivet: verifies <ID>` markers in workspace member
  crates (the project-root fallback shipped in v0.18.0); added a regression
  test so the behaviour cannot silently regress. (REQ-226)
- **CI hygiene (#293):** `import_alias_works_for_reqif` is now cfg-gated to
  match the `import` alias (which only exists with the `wasm` feature off), so
  the nightly `--all-features` test-evidence job stops failing on it.

## [0.20.0] - 2026-06-25

Theme: **SQL over the artifact store** — query *and* change artifacts in the
query language LLMs know best, with no MCP server required.

### Added

- **REQ-229 / #580 — `rivet sql "<query>"`.** Read-only SQL over the artifact
  graph, projected as virtual tables (`artifacts`, `links`, `fields`,
  `provenance`). Works as a plain CLI command — **no server, no MCP** (for
  environments that forbid adding MCP servers). Expresses JOINs/aggregations the
  s-expression filter can't, e.g. the V-closure set is one query:
  `SELECT id FROM artifacts WHERE status='implemented' AND id NOT IN
  (SELECT target FROM links WHERE link_type='verifies')`. Output: `table` /
  `json` / `csv`.
- **REQ-230 / #582 — `rivet sql` writes (`UPDATE`).** `UPDATE artifacts SET
  {status|title|description} WHERE …` routes through the same validated path as
  `rivet modify`: every change is validated *before* any file is written
  (all-or-nothing), and applied via the indentation-safe YAML editor so sibling
  fields are preserved. Writes to `fields`/`links`, `INSERT`, and `DELETE` are
  refused with a clear message.
- **#583 — serve `POST /api/v1/sql`.** The same executor over HTTP, so a running
  `rivet serve` is queryable by any agent that can POST JSON. **Read-only by
  design** (a network endpoint must not accept arbitrary mutations) and rejects
  cross-origin requests (403) to close the permissive-CORS exfiltration vector.

### Changed

- **REQ-231 / #586 — SQL engine: rusqlite → gluesql-core (pure Rust).** The
  facade no longer compiles the bundled SQLite C amalgamation on every build —
  removing the per-CI-job weight that was compounding self-hosted runner
  contention. Behavior is identical (engine swapped behind the unchanged
  `sql::query`/`plan_write` API); `rusqlite` + `libsqlite3-sys` are gone from the
  dependency tree. (Design: DD-068 / DD-069.)

### Docs

- **#584 — documentation synced to the implementation.** Fixed a broken README
  quick-start command, understated export-format lists, a stale MCP tool count
  and install URL; documented `rivet sql`, `rivet verify`, the combined
  `rivet coverage` V-closure metric, the `cited-source` base field, and
  `rivet init --vendor-schemas`.

## [0.19.0] - 2026-06-24

Theme: **measure the V** — a combined closure metric plus build/parse fixes.

### Added

- **REQ-228 / #571 — combined V-closure metric in `rivet coverage`.** For every
  source type governed by more than one traceability rule, `rivet coverage` now
  reports the *intersection* — the share of artifacts satisfying **every**
  applicable rule (e.g. requirements that are BOTH satisfied AND verified). This
  is strictly stronger than the per-rule numbers, which hide the gap when
  different artifacts miss different rules: on this repo requirements are 12.8%
  V-closed vs 25.1% satisfied. `--format json` gains a `closure` array
  (`closed`/`total`/`open_ids`/`percentage`/`rule_names`). External-boundary
  (supplier-delegated) artifacts count as closed, matching the 3-state
  `accounted` convention.

### Fixed

- **REQ-227 / #543 — `rivet-core --features wasm` test build compiles.** The
  host `model::Link` gained an `external` field (prefix:ID externals); an
  "add it everywhere" pass had leaked it into the WIT-generated `types::Link`
  constructors, which carry only `link-type` + `target`, breaking
  `cargo test -p rivet-core --features wasm` (E0560). The host→WIT conversion
  now omits the host-only field; the `.wit` is unchanged.
- **#572 / #570 — YAML plain multi-line scalars parse as sequence items.** The
  rowan-yaml CST no longer mis-folds a plain multi-line scalar that continues
  onto an indented next line.

## [0.18.0] - 2026-06-23

Theme: **close the right side of the V** — make requirement→test→evidence a
first-class, drift-checked, status-advancing trace, and remove the schema
friction that blocked declaring verification artifacts.

### Added

- **REQ-226 / #559 — `rivet verify <ID>`.** Advances an `implemented` artifact
  to `verified` iff it has verifying evidence — an incoming `verifies` link OR a
  `// rivet: verifies <ID>` source marker (scanned from `src/` + `tests/`, or
  `--scan <path>`). Refuses with an actionable message when there's no evidence;
  no-ops if already `verified`; rejects non-`implemented` states. The write
  reuses the schema-validated `modify --set-status` path. Nothing previously
  advanced status from test evidence (`import-results` is a separate run-log),
  so a requirement stayed `implemented` no matter how many passing tests
  verified it.
- **REQ-222 / #555 — `requirement-verification` traceability rule.** A `dev`
  schema rule (`required-backlink: verifies`, severity warning) surfaces
  requirements with no incoming verification in the coverage report, closing the
  right side of the V in the rule set. (`dev` 0.1.0 → 0.2.0.)
- **REQ-225 / #556 — `cited-source` usable on any artifact type.** The
  sha256-stamped, drift-checked `cited-source` field is now a `common`
  base-field, so verification artifacts (`sw`/`unit`/`sys-verification`) can
  carry a tamper-evident citation without being flagged `unknown-field` — the
  requirement→test→evidence chain is exactly where it's wanted. The drift
  checker discovers it by name, so it runs on those types too. (`common`
  0.2.0 → 0.3.0.)

### Fixed

- **REQ-224 / #550 — per-type `status` enum overrides the global lifecycle.** A
  type that declares its own `status` field with allowed-values is now validated
  against that enum instead of the base lifecycle, so domain status sets (e.g.
  `ai-found-defect`'s `open`/`triaged`/`resolved`) validate correctly.
  (`common` 0.1.0 → 0.2.0.)
- **REQ-223 / #552 — `rivet add` synthesizes a default file for a new artifact
  type** instead of forcing `--file`. A first-of-its-type artifact lands in
  `<src_dir>/<type>s.yaml` with an `artifacts:` header.
- **REQ-221 / #530 — bundled bridge schemas load by name.** A consumer can list
  a bundled `*.bridge` schema by name in `schemas:` and the loader falls back to
  the embedded bridge after the embedded base schema.

### CI

- **#560 — VSIX Marketplace publish is non-blocking.** The release workflow no
  longer lets a Marketplace publish failure (expired PAT) mark the whole Release
  run as `failure` and skip the npm publish that gates on it.

## [0.17.0] - 2026-06-19

### Security

- **RUSTSEC-2026-0182 / #542 — bump wasmtime 43 → 44.0.3.** A new advisory flags
  a WASIp1 `fd_renumber` resource leak in `wasmtime-wasi`, fixed in 44.0.3. The
  Security Audit gate had gone red repo-wide; rivet's only wasmtime consumer is
  the compose-witness component runner (`wasm_runtime.rs`), which compiles
  unchanged against the new API. `cargo audit` is clean afterward.

### Added

- **#540 / #541 — `rivet check docs` oracle.** Enumerates every candidate path
  the doc scanner considered and tags each `loaded` / `skipped (<reason>)` /
  `excluded (<glob>)`. `--format json` emits the canonical
  `{oracle, entries, total, by_status}` envelope; `--strict` exits non-zero when
  any candidate is skipped (allowlist exclusions do not trip strict).
- **REQ-202 / #456 — minimal `--no-default-features` build.** `rivet-cli` gates
  the serve + MCP + LSP stack behind cargo features (all kept in `default`, so
  the published binary is byte-for-byte unchanged). `cargo build -p rivet-cli
  --no-default-features` yields the validate/list/add/commit-check core with
  none of axum/rmcp/lsp-server compiled in; `--format html` export, `snapshot`,
  and `embed` (which share the dashboard renderer) are serve-gated and refuse
  with a clear message in the minimal build.
- **REQ-220 / #431 — `rivet init --vendor-schemas`.** Writes the resolved
  built-in schemas (plus auto-discovered bridges) on-disk into `schemas/`, so a
  project pins its validation against rivet upgrades (the loader prefers on-disk
  over the embedded copy). Never overwrites an existing schema file.
- **#509 — runner-liveness alert.** A GitHub-hosted scheduled workflow
  (`runner-liveness.yml`) probes the self-hosted runner pool and queued-run age
  every 15 minutes and raises a durable `runner-down` tracking issue when the
  pool stalls, instead of every gate queueing forever with no signal.

### Fixed

- **REQ-218 / #479 — `next-id` honors IDs claimed in git history.** Allocation
  scanned only the working tree, so a reverted commit or an in-flight branch
  could reissue an ID already claimed elsewhere (the reverted-but-burned-ID
  trap). `next-id`
  and `add` now also consider IDs claimed in commit trailers / subject tags
  across all refs; overridable with `RIVET_NEXTID_NO_GIT=1`.
- **REQ-219 / #500 — JSON error envelope on a parse failure.** A misplaced
  top-level `--project`/`--schemas` (they are deliberately not clap `global`)
  left stdout empty under `--format json`, giving consumers a cryptic "EOF while
  parsing". Such invocations now emit a one-line `{error, hint}` envelope on
  stdout; non-JSON parse errors keep the stderr-only behavior.
- **#532 / #539 — variant loader skips feature-model binding files.**
  `load_variant_configs_from_dir` no longer trips over `variant:`-wrapped
  binding files.
- **#522 / #525 — restore `accepted` to the canonical status enum.**

### Changed

- **#533 — npm/npx is now a first-class install path** in the README, with the
  stale committed `npm/` + `platform-packages/` versions synced; RELEASING.md
  documents which version locations are authoritative vs workflow-managed.
- **#523 / #526 — mutation-testing CI moved off `lean-mem` to `rust-cpu`.**

## [0.16.1] - 2026-06-14

### Fixed

- **REQ-217 / #514 — `variant check` accepts the form `variant init` writes.**
  `rivet variant init` scaffolds a `variant:`-wrapped bindings file (and prints
  the `variant check --variant <that file>` command to run), but `check` parsed
  `--variant` strictly as the flat `{name, selects}` form and rejected it with
  `missing field 'name'`. `VariantConfig::from_yaml_str` now accepts both forms
  across every `--variant` path, so the init→check happy path works.
- **REQ-216 / #518 — mutating commands refuse on a parse-broken source.** A
  source file dropped from the graph by a YAML parse error (merge conflict,
  manual edit, or an unquoted-colon title pre-REQ-198) is invisible to the
  loader, so `next-id` allocated IDs against the *partial* store — colliding
  with the unparsed file's artifacts (the report saw five artifacts share one
  id) — and `add` exited 0 on the error. `rivet next-id` and `rivet add` now
  hard-fail (non-zero) with an actionable message when any source failed to
  parse; read-only commands still warn-and-continue.

## [0.16.0] - 2026-06-09

### Added

- **REQ-213 / #510 — `rivet schema presets`.** Lists every built-in schema
  preset you can declare in `rivet.yaml`'s `schemas:` (name, version,
  artifact-type count, description), so the enableable standard set —
  DO-178C / ISO 26262 / IEC 61508 / EN 50128 and the rest — is discoverable
  instead of undocumented. Needs no project; works in a bare directory.
- **REQ-211 / #506, #511 — `rivet list --format json --full`.** Emits each
  artifact's `description`, `tags`, and `fields` in bulk, so a machine-readable
  query for a custom field value (e.g. `release`/`baseline`) no longer needs one
  `rivet get` per artifact or a raw YAML parse.
- **REQ-212 / REQ-051, #436 — CI traceability gate.** A `traceability` job in
  `ci.yml` runs `rivet validate` (fail on errors) + `rivet commits` (orphan /
  broken-trailer gate on PRs): the traceability tool now gates its own PRs. The
  in-CI mechanism of REQ-051 (marking it a *required* check remains an operator
  step, #436).
- **Release planning via the `baseline` field (#512).** Documented in AGENTS.md
  that `baseline` is rivet's release field (`vX.Y.Z-track` while in progress →
  `vX.Y.Z` when shipped); readiness is the query
  `rivet list --filter '(= baseline "vX.Y.Z-track")'`. v0.16.0 is the first
  release scoped this way.

- **REQ-162 / #352, #355 — canonical status lifecycle is now enforced.** The
  shared `schemas/common.yaml` `status` base-field declares
  `[draft, proposed, approved, implemented, verified, released, deprecated, rejected]`,
  so a typo'd / off-vocabulary status now fails `rivet validate` with a
  `status-allowed-values` ERROR + remediation instead of passing silently, and
  the set is discoverable. Absent status is unaffected. The rivet repo's own 7
  drifting artifacts (`accepted`/`active`/`partial`) were migrated to fit.
  **Downstream note:** projects sharing `common.yaml` must use a status in this
  set or extend it. (#355 Finding 2 — the `approved`-hardcoded ASPICE promotion
  gates — is a separate follow-up needing a `status-at-least` predicate.)


- **REQ-161 / #408 — `rivet validate --structural`.** Gates only on
  structural-integrity diagnostics (broken links, duplicate ids, parse errors,
  bad link targets, cardinality, schema-rule inconsistencies), hiding
  coverage/lint findings (missing/extra/typo'd fields, orphans, prose-mention,
  near-duplicates). This gives bulk-edit and status-promotion workflows a
  meaningful "did I break the graph?" check independent of coverage noise —
  what spar/sigil hand-rolled as a `0 broken cross-refs` gate. Backed by a new
  `Diagnostic::is_structural()` classification (explicit allowlist; a unit test
  enumerates every built-in rule). The rivet repo `validate --structural`
  PASSes with 0 shown.

### Fixed

- **REQ-162 / #522 — restore `accepted` to the canonical status enum.** v0.16.0
  declared the canonical lifecycle (`draft → … → released` + `deprecated` /
  `rejected`) but dropped `accepted`, the documented terminal state for
  `design-decision` / `external-anchor` / requirement-meta artifacts. Downstream
  stores that followed the documented chain (e.g. the jess hardware-integration
  store, 12 of 21 errors on upgrade) flipped from PASS to FAIL on the 0.15 → 0.16
  bump with no migration path. `accepted` is now re-admitted in
  `schemas/common.yaml`, so stores upgrade cleanly; the `status-allowed-values`
  guard still fires on genuinely typo'd values (covered by
  `common_status_accepts_accepted_and_still_rejects_typos`). The wider
  migration / per-schema enum questions raised in #522 (slices 1 and 3) are
  tracked separately.

- **REQ-168 / #428 — `rivet bundle --incoming`.** `bundle` built the closure
  from *outgoing* links only, so bundling a requirement (a graph sink —
  everything links *to* it, it links *out* to nothing) returned just the bare
  artifact, dropping the realizing DDs/features/tests you actually want for LLM
  context. `--incoming` now also follows backlinks (sorted, so the bundle is
  reproducible — #415). `bundle()` stays outgoing-only for API/MCP stability.

- **REQ-167 / #426 — `rivet trace <id>`.** Added the discoverable namesake
  verb for the per-artifact traceability view (rules satisfied/missing, incoming
  + outgoing links, diagnostics) — previously reachable only via the
  non-obvious `rivet validate --explain <id>` (which stays as an alias). Also
  made that view **deterministic**: incoming links and the rule-satisfier
  representative were HashMap-ordered (varied per run); both now sort by
  (source, link-type), so `trace`/`--explain` output is reproducible audit
  evidence (#415).

- **REQ-166 / #402 — `rivet matrix` infers direction + link from the from/to
  pair.** `--direction` is now optional; omit it and the command probes the
  graph for the direction and link type that actually connect `--from` to
  `--to`, so `rivet matrix --from design-decision --to requirement` renders the
  real `satisfies` matrix instead of the old empty `backward` default. Explicit
  `--direction forward`/`backward` is byte-identical to before — inference only
  affects the omitted path. (CLI command only; the `{{matrix:from:to}}` embed is
  a separate follow-up.) Test `matrix_infers_direction_when_omitted`.

- **REQ-165 / #355 Finding 2 — ASPICE verification gates accept forward target
  status.** The three `V-*-verification-needs-approved-*` status gates hardcoded
  `(forall-linked "verifies" (= status "approved"))`, so an approved/released
  verifier mis-fired when the req/design it verifies had moved *past* approved
  (implemented / verified / released) — promoting `approved → implemented`
  wrongly re-raised "needs an approved design". Each consequent now accepts
  approved-or-beyond `(or approved implemented verified released)`; a target
  still below approved (draft/proposed) correctly still fires. Schema-only;
  regression test `aspice_status_gate_accepts_forward_target_status`.

- **REQ-163 / #420 — compliance CI now forwards the version-switcher + back-link
  inputs.** The published report for 0.15.0 lost the version selector and "back"
  nav that 0.1.0 has. `rivet export` still supports them (`--homepage`,
  `--versions`, `--version-label`), but the CI didn't pass them: the reusable
  `compliance.yml` sent `version:` (ignored — the action input is `report-label`)
  and never exposed `other-versions`, and `release.yml` passed no homepage.
  `compliance.yml` now maps `version → report-label` + adds an `other-versions`
  passthrough, and `release.yml` labels with the tag and sets a default homepage.
  (The cross-version switcher needs the full version list, which only the
  pulseengine.eu site pipeline knows — root-cause fix tracked on #420.)

- **REQ-160 / #415 — deterministic `list` / export / migrate output.**
  `query::execute` (behind `rivet list`, the MCP query tool, and `{{query:…}}`
  embeds) now returns results sorted by id — `rivet list`'s default path
  previously didn't sort, so order was nondeterministic. `rivet export`
  (ReqIF/Zola) and `rivet schema migrate` likewise sort before emitting, so
  exports and generated migrations are byte-reproducible across runs. Built on
  REQ-159's `iter_sorted()`.

### Added

- **REQ-159 / #415 — `Store::iter_sorted()` for deterministic iteration.**
  `Store::iter()` is `HashMap`-ordered (nondeterministic per process), which is
  how the REQ-158 `rivet add` note picked a different artifact in CI than
  locally and made the proptest job flaky. `iter()` now documents that its
  order is unspecified and points at the new `iter_sorted()` (ascending by id)
  for callers that produce stable output or select a representative. Migrating
  existing call sites and an ordered-map backing are tracked as follow-ups on
  #415.

- **REQ-158 / #397 — near-duplicate-intent detection.** `rivet add` rejects a
  duplicate *id* but nothing flagged a duplicate *intent* — two artifacts that
  say the same thing under different ids — so a backlog accreted near-dups.
  A new shared `rivet_core::similarity` signal (Jaccard overlap of significant,
  stopword-stripped title tokens, bounded `[0,1]`, threshold 0.6 — calibrated
  so the rivet repo's own 158 *requirements* produce zero pairs) now backs two
  surfaces: `rivet validate` emits a non-blocking `near-duplicate-intent`
  **INFO** diagnostic for each same-type pair at/above threshold (on both the
  salsa and `--direct` paths), and `rivet add` prints a non-blocking
  `note: intent is N% similar to <ID> …` before adding. Across *all* types the
  rivet repo surfaces 10 such pairs — all genuine near-duplicates (e.g. two
  `feature`s both titled "Property-based tests (proptest)"; two
  `system-constraint`s stating identical-results-to-full-validation) — INFO, so
  `validate` still PASSes. Per-rule suppression in `rivet.yaml` is a noted
  follow-up (no diagnostic-suppression config exists yet; INFO keeps it
  non-disruptive meanwhile).

### Fixed

- **REQ-157 / #406 — `rivet validate` no longer prints the per-file `skipping
  <file>` parse-error WARN twice.** It loaded each source once for validation
  and again for the REQ-075 duplicate-id re-scan, and both loads emitted the
  per-file WARN. The re-scan now uses a new quiet loader
  (`load_artifacts_with_report_quiet`), so the WARN fires once while the hard
  `artifact-parse-error` ERROR diagnostic and `Result: FAIL` are unchanged. The
  public `load_artifacts` signature is untouched; other commands' per-file WARN
  is preserved. Regression test
  `validate_emits_single_skip_warn_for_malformed_source`.

### Changed

- **REQ-156 / #410 — schema-level consistency checks now route through a single
  `Schema::consistency_diagnostics()` chokepoint.** Both the salsa (default
  `rivet validate`) and `--direct` paths call exactly one method instead of
  hand-registering each check at three call sites, so a future schema-level
  check can't land on some surfaces but not others — closing the salsa/direct
  divergence class REQ-146 just fixed for status-gate rules. Pure refactor:
  diagnostic output is unchanged (`validate` and `validate --direct` produce
  identical results on the rivet repo). Unit test asserts the chokepoint
  surfaces both conditional-rule and coverage-rule consistency diagnostics.

### Fixed

- **REQ-148 / #350 — new `coverage-rule-consistency` schema check flags a
  `required-backlink` rule that advertises an unsatisfiable satisfier.** When a
  coverage rule lists a `from-type` in `from-types` that the schema's own
  link-target rules can never let form the backlink (aspice
  `swe1-has-verification` lists `unit-verification`, whose `verifies`
  link-field targets only `sw-detail-design`, not `sw-req`), authors hit a
  confusing wall: the rule says "add a `verifies` from a unit-verification" but
  authoring that link is rejected by `link-target-type`. `validate` now emits a
  schema-level warning naming the rule, the unreachable from-type, what its
  link-field actually targets, and the fix (widen the target-types or drop the
  from-type). Runs on both the salsa and `--direct` paths (no divergence, cf.
  REQ-146); conservative (only flags a *declared* link-field that demonstrably
  excludes the target). Unit tests `coverage_rule_flags_unsatisfiable_from_type`
  / `coverage_rule_silent_when_all_from_types_linkable`. Whether the aspice
  `from-types` themselves are right is a separate compliance call (#350/#355).
- **REQ-155 / #353 — `prose-mention-without-typed-link` no longer fires an
  unactionable warning (or pressures a false trace).** When an artifact's
  prose names an id-shaped token that resolves to an artifact its own type
  cannot link to under the schema, `validate` used to advise "add a link in
  `links:`" — impossible when no such link type exists, and dangerous when
  the token is a coincidental id collision (following the advice fabricates a
  wrong trace; reported on the `sigil` project). The diagnostic is now
  suppressed when the schema permits no link type connecting the mentioning
  type to the mentioned type. Link types with empty `source-types`/
  `target-types` ("any → any") are unaffected, so only fully-constrained
  schemas change behaviour. Unit test
  `prose_mention_suppressed_when_no_schema_valid_link_type`.
- **REQ-154 / #353 — `rivet list` and `rivet stats` now loudly flag artifact
  sources dropped by a parse error.** A single stray top-level key (e.g.
  `unknown field 'loss-coverage', expected 'artifacts'`) drops a whole file —
  including its valid `artifacts:` list — from the graph. `rivet validate`
  already surfaced this as a hard `artifact-parse-error` ERROR, but `list`/
  `stats` returned a silently-smaller graph whose only signal was a `WARN`
  preamble line an agent could pipe away. They now print a consolidated
  "N artifact source(s) skipped due to parse errors" block to stderr naming
  each dropped file and pointing at `rivet validate`. Clean projects emit
  nothing new. Regression test (`list_reports_parse_error_skipped_sources`).
- **REQ-153 / #403 — `rivet impact --since` no longer massively over-reports.**
  The baseline was reconstructed with a bespoke per-file parser inconsistent
  with the live loader, so `impact --since` flagged hundreds of unchanged
  artifacts as added/changed (503 changed + 354 added on the rivet repo when
  only ~7 REQs actually changed). The baseline now materialises the git ref's
  tree (`git archive`) and loads it through the same `load_project_full` /
  `load_artifacts` path the live store uses, so only genuine changes surface
  (3 changed + 7 added on that same diff). The bespoke parse helpers were
  removed. Regression test on a 2-commit fixture.

- **REQ-152 — `rivet matrix` no longer silently renders an all-empty matrix as
  "no traceability".** The matrix defaults (`--direction backward`, auto-detected
  link) produced an all-`(none)` result for a forward relationship like
  `design-decision --satisfies--> requirement` — a dangerous false-negative for
  a traceability tool. When the matrix is all-empty (sources exist, zero links),
  it now emits an actionable stderr hint, naming the opposite `--direction` when
  that would surface links (e.g. "0 via 'satisfies' (backward), but 67 do with
  `--direction forward`") or pointing at `rivet schema show <from>` / `--link`
  otherwise. Matrices with links are unchanged. (Inferring direction from the
  link's source/target so the default just works is a tracked follow-up.)

## [0.15.0] - 2026-06-02

Self-contained & sub-directory-safe exports, agent-ergonomic CLI, and
validation-parity fixes. **Headline:** the Zola/HTML export no longer emits
absolute `/<prefix>/artifacts/…` links that 404 on a sub-directory deploy
(REQ-115/116/118) — the fix that missed the v0.14.0 cutoff. Plus query-driven
bulk `modify --where`, `list --rank-by-backlinks`, a global `--quiet`,
`validate --explain`/`--min-severity`, a salsa status-gate soundness fix, and
external `prefix:ID` resolution for hyphenated project slugs.

### Added

- **REQ-151 / #353 — global `-q`/`--quiet` flag.** Suppresses the WARN-level
  log preamble (e.g. "could not load externals: …") that otherwise prefixes a
  command's output, emitting only ERROR-level logs. A command's own stdout and
  hard-error reporting are untouched, so it pairs with `--format json` for
  clean machine-consumable output. Complements `-v/--verbose` (mutually
  exclusive). Closes the `--quiet` half of #353's agent-ergonomics asks.

- **REQ-128 — `rivet list --rank-by-backlinks`.** Orders the listing by
  inbound-link count (descending) — the most depended-upon artifacts first,
  i.e. the highest-impact-if-changed nodes — and surfaces the count (an
  inbound-count column in text, an `inbound_links` field in JSON). The
  complement of `--orphans`: where `--orphans` finds asserted-but-unanchored
  claims, this finds the load-bearing hubs. Built on `LinkGraph::backlinks_to`;
  exact integer counts, deterministic (ties break by id). Completes REQ-128.

- **REQ-138 / #378 — Zola export build smoke check (`scripts/zola-export-smoke.sh`).**
  Exports the corpus into a scaffolded Zola site whose `base_url` is a
  sub-directory deploy, runs a real `zola build`, and fails on a build error
  OR on any built-HTML artifact/document link that drops the deploy sub-path.
  This is the end-to-end gate the string-asserting unit tests can't give —
  "export succeeded" now provably implies "the site builds and its links
  resolve under a sub-directory." It catches the REQ-115/REQ-116/REQ-118 link
  class. Skips cleanly when `zola` isn't installed (so it can gate on
  availability). Verified: passes on the current corpus; the leak detector
  fires on the pre-fix absolute-link pattern.

- **REQ-145 / #386 — test-results import honors a `rivet_tc_id` testcase
  property.** A JUnit `<testcase>` may now declare its artifact id explicitly
  with `<property name="rivet_tc_id" value="…"/>`; that value becomes the
  imported result's artifact id, overriding every classname/name heuristic and
  the marker fallback. Previously the id was derived from `classname` + `name`,
  which rarely matched a real artifact, so the result linked to nothing. The
  parser now reads `<property>` children of a testcase (suite-level and
  unrelated properties are ignored); absent the property, behaviour is
  unchanged. Tests cover property-present, property-overrides-classname-id, and
  property-absent.

- **REQ-141 / #353 — `rivet modify --where '<s-expr>'`: query-driven bulk
  modify.** Select every artifact matching the same s-expression filter
  `rivet query` uses and apply any `--set-*` change in a single in-process
  pass — load once, validate all targets up front (all-or-nothing), write each
  affected file once. Because it never re-spawns a subprocess per ID, it can't
  race the way a shell loop of per-ID `rivet modify` calls can (the friction
  reported in #353). `--where` is mutually exclusive with a positional `<ID>`;
  `--dry-run` previews the match set without writing; an empty match set is a
  loud no-op (`no artifacts match the --where filter`). E.g. `rivet modify
  --where '(= status "draft")' --set-status implemented`. Integration tests.

- **REQ-128 / #358 — `rivet list --orphans`.** Lists only artifacts with no
  inbound and no outbound links — disconnected from the traceability graph,
  i.e. an asserted-but-unanchored claim (a requirement no test verifies, a
  decision no hazard drives). Combine with `--type`. Built on the existing
  `LinkGraph::orphans`; works in text and `--format json`. (The
  inbound-link-count ranking report remains a follow-up.)

- **REQ-125 / #349 / #350 / #358 — `rivet validate --explain <ID>`.** Explains
  one artifact: which traceability rules target its type and whether each is
  satisfied (and via which incoming/outgoing link, or what's missing — e.g.
  "needs an incoming 'satisfies' from one of [design-decision, feature]"), its
  links both directions, and its own diagnostics with remediation. Answers the
  "why is <ID> reported (un)covered?" question three agents independently
  asked for.

- **REQ-135 / #354 — `rivet modify`/`add` reject a status outside the enum.**
  Building on the retained `base-fields`, `validate_add` and `validate_modify`
  now reject a `status` value outside the `status` base-field's declared
  `allowed-values` *at mutation time* (so a typo never reaches a file), with
  the allowed set named. Inert when no enum is declared.

- **REQ-135 — status enum can now be enforced (the mechanism).** The merged
  `Schema` dropped `base-fields` entirely, so `status` (a base field) could
  never be enum-validated — the root cause behind a 4-issue cluster
  (#352/#354/#355/#353). `Schema::merge` now retains `base_fields`, and
  `validate` checks `artifact.status` against the `status` base-field's
  `allowed-values` when declared (rule `status-allowed-values`, with REQ-124
  remediation: "set to one of […]" / "widen the schema"). Non-breaking: with
  no `allowed-values` declared (today's `common.yaml`) the check is inert.
  Declaring the canonical lifecycle set activates enforcement.

- **Issue #357 — `validate --min-severity` filters display noise.** `rivet
  validate` printed every diagnostic; on a clean repo that is ~160 advisory
  warnings for 0 errors, burying the actionable ones. `rivet validate
  --min-severity error` (or `warning`/`info`) now shows only diagnostics at
  or above the floor, with a one-line note of how many were suppressed.
  Counts and exit code are unchanged (display-only).

- **Issues #359 / #360 — `rivet modify --set-description` + clearer usage.**
  `description` is a top-level base field, but the CLI exposed no
  `--set-description` flag — so updating a description forced
  `--set-field description=...`, which `mutate` then *rejected* with a hint
  pointing at a `--set-description` flag that did not exist. The flag is now
  wired (the core `ModifyParams.set_description` + `yaml_edit` already
  supported it). `rivet modify --help` now shows `--set-*` examples and a
  note that positionals (`modify <ID> status approved`) are not valid.

- **Issue #358 — incoming links are visible from `get` and `list`.** The
  single most common traceability question — "what verifies / satisfies X?"
  — lives on the backlink side, but `rivet get <ID>` only showed outbound
  `links` and `rivet list --format json` collapsed links to an integer
  count. Now `rivet get` emits an `incoming_links` array (`{type, source,
  inverse}`) in JSON and an `Incoming:` section in text, and `list
  --format json` emits the real link objects (matching `get`) instead of a
  count. Built on the existing `LinkGraph::backlinks_to`. (REQ-128.)

### Fixed

- **REQ-147 / #350 — coverage diagnostics now say HOW to satisfy a missing
  backlink.** A `required-backlink` coverage miss used to print only the rule
  description ("… should be verified …"), leaving the author to
  reverse-engineer which link type and source types satisfy it. The diagnostic
  now appends "— needs an incoming `<link>` link from one of [<types>]", and
  the `Lifecycle coverage gaps` summary points at `rivet validate --explain
  <ID>` for the full per-rule breakdown (incoming link + source types +
  alternates). Schema-agnostic; no rule semantics changed.

- **REQ-146 / #355 — default `rivet validate` now evaluates status-gate
  validation-rules (parity with `--direct` / `gaps-json`).** The incremental
  salsa path (`db::validate_all`) ran structural (phases 1-7) and conditional
  (phase 8) rules but silently skipped the status-gate `validation-rules`
  (phase 9 — the V-model promotion gates). So the default `rivet validate`
  PASSED a project that `rivet check gaps-json` and `rivet validate --direct`
  FAILED on a gate violation — a soundness gap in the default surface. Both
  salsa entry points now evaluate `validation_rules` against the same
  store/schema/graph; all validation surfaces agree. Regression test.

- **REQ-144 — source view no longer links an id that is a substring of a
  longer id.** The source viewer matched artifact ids into code/doc lines with
  `str::contains`, so a short id was linked when it appeared only as a
  substring of a longer, fully-qualified id (a base id nested inside a
  prefixed one) — a phantom trace edge. Matching is now whole-token: an id only
  matches when bounded by a non-`[A-Za-z0-9-]` character (hyphen is part of the
  id, not a delimiter). Regression test. (User-reported.)

- **REQ-143 — external artifact refs with a hyphenated prefix now resolve
  (were 404).** Browsing `/artifacts/linc-mesh:A-AVTP-STREAM` in serve returned
  "Artifact does not exist", and external `prefix:ID` refs with a kebab-case
  prefix were unresolved in document rendering, even though the artifact
  existed in the external project. `parse_artifact_ref` required the prefix to
  be *purely* lowercase ASCII (no hyphens), so a slug like `linc-mesh` fell
  through to a local lookup — even though externals are *stored* as
  `<prefix>:<id>` with that same hyphenated prefix, so the parse no longer
  round-tripped its own output. Now accepts a kebab slug (leading lowercase
  letter, then lowercase / digits / hyphens). One shared gate, so both the
  serve detail view and document link resolution are fixed; Kani round-trip
  proof updated. Regression tests.

- **REQ-142 / #381 — s-expr filter parse error now shows the field-equality
  form.** The filter dialect (shared by `query`, `list --filter`,
  `export --filter`, `modify --where`) puts an operator in head position, but
  the common first attempt `(status "draft")` (field name in head) failed with
  only a list of head forms and no example. The `unknown head symbol` note now
  states the head is an operator and shows `(= status "draft")` /
  `(and (= type "requirement") (has-tag "safety"))` inline — reaching every
  command that parses a filter, since the note is generated once in
  `sexpr_eval`. `export --filter` help also gained an example.

- **REQ-139 — directory import no longer warns on legitimate non-artifact
  YAML.** The generic-YAML directory load warned `[WARN] skipping <file>` for
  *every* file it declined to load — including expected non-artifact YAML
  under the source path (`bindings.yaml`, `feature-model.yaml`,
  `variants/*.yaml`). On a real project that put a WARN line in front of every
  command, burying the signal (reported in #353). The load-path WARN now keys
  off the existing REQ-062 `SkipKind`: it fires only for a genuinely malformed
  *artifact* file (`ParseError`) and stays silent for `NotArtifactFile`.
  `rivet validate` still re-scans and surfaces the malformed case as a hard
  `artifact-parse-error` Error, so nothing is lost. Regression test.

- **REQ-115 / REQ-116 / REQ-118 — Zola export links survive a sub-directory
  deploy.** Artifact cross-links, document `[[ID]]` wiki-links, and the
  `rivet_artifact` shortcode card all emitted absolute `/<prefix>/artifacts/…`
  paths, which drop the deploy sub-path and 404 on a GitHub-Pages-style project
  site served under `/<repo>/`. Markdown links now use Zola internal links
  (`@/<prefix>/artifacts/<slug>.md`) and the shortcode uses `get_url(…)` — both
  resolved against `base_url`. A wiki-/cross-link whose target isn't in the
  export degrades to plain text rather than leak an absolute path or break the
  downstream `zola build` with a dangling internal link. Verified end-to-end
  with a real `zola build` under a sub-directory `base_url` (504 links rewritten,
  0 absolute, 0 dangling); regression test (`export_zola.rs`) pins the generated
  link forms. (The HTML-export half of REQ-118 was already covered by REQ-105's
  `rewrite_static_links`, which rewrites `href`/`hx-get`/`src`.)

- **REQ-123 (F2 silent-failure) — ReqIF import fails on a title-less
  SPEC-OBJECT.** A SPEC-OBJECT with neither a `ReqIF.Name` attribute nor a
  `@LONG-NAME` used to import as an artifact with an empty `title` (a required
  base field) via `unwrap_or_default()` — a silently-invalid artifact. Import
  now returns an `Err` naming the object. Completes the ReqIF F2 sweep
  (REQ-119, REQ-120, REQ-123). Regression test.

- **REQ-119 (F2 silent-failure) — ReqIF import fails on an unresolved enum
  ref.** An `ENUM-VALUE-REF` matching no defined `ENUM-VALUE` identifier was
  silently dropped via `filter_map`, yielding a degraded/incomplete field
  value with no signal — an internally-inconsistent ReqIF imported as if
  clean. Import now returns an `Err` naming the unresolved ref(s). Regression
  test.

- **REQ-120 (F2 silent-failure) — ReqIF directory import fails loudly on a
  corrupt file.** `import_reqif_directory` used to skip a malformed `.reqif`
  with only a (often-suppressed) `log::warn!`, silently importing partial
  interchange data with no signal to the caller. It now collects every parse
  failure and returns an `Err` naming each un-imported file. Regression test.

- **REQ-117 — static export no longer emits a `localhost` oEmbed tag.** Every
  exported artifact page carried an oEmbed discovery `<link>` pointing at
  `http://localhost:<port>`, meaningless (and broken metadata) in a static
  `export --format html` that has no server. The tag is now emitted only when
  served (a real, non-zero port).

- **Issue #349 — `required-backlink` rules now match the inverse-name
  convention.** Schemas (e.g. `safety-case.yaml`) declare
  `required-backlink: supported-by` — the *inverse* of the forward
  `supports` link — and both `rivet validate` and `rivet coverage`
  compared that name against the stored `Backlink.link_type`, which
  holds the *forward* name. Result: GSN safety-case rules like
  `goal-has-support` fired (and counted as uncovered) for every
  artifact, even when the supporting solution was correctly linked.
  Match now accepts either the forward or the inverse name, so
  both conventions (`dev.yaml` uses forward, `safety-case.yaml` uses
  inverse) validate consistently. Same fix path additionally evaluates
  `alternate-backlinks` in both engines — previously a goal satisfied
  only via an alternate (e.g. `decomposed-by` instead of
  `supported-by`) was reported as missing.
- **REQ-110 / REQ-111 — coverage "totals" no longer masquerade as artifact
  counts.** The dashboard overview rendered `{covered} / {total} artifacts
  covered` and the `coverage --format json` `overall` object exposed
  `total`/`covered`, but both aggregate *per-rule* denominators — an artifact
  satisfying N traceability rules is counted N times — which is a different
  cardinality from the distinct-artifact `total` the `stats` command reports
  under the same key. The numbers are unchanged (per the relabel decision);
  the label is now honest: the HTML reads "coverage checks" and the JSON
  `overall` exposes `checks_covered` / `checks_total` (the ambiguous
  `total`/`covered` keys are removed from the `overall` object — a JSON
  consumer change). Per-rule `entries[]` keep `covered`/`total`, which are
  correct at rule scope.
## [0.14.0] — 2026-05-30

Theme: **agent-actionable validation + self-contained export**. Two
user-facing features: the validator now tells an agent *what to do* about a
diagnostic (not just what is wrong), and `export --format html` produces a
genuinely portable static site.

### Added

- **REQ-124 — agent-actionable diagnostic remediation.** A validation error
  stated *what* was wrong but not *what to do*, nor which of the competing
  fixes was right. The witnessed failure: an agent saw a `link-target-type`
  error and "fixed forward" by inventing type-invalid links on sibling
  artifacts, turning 26 warnings into 8 errors. The new
  `rivet-core::remediation` module re-derives a structured `Remediation`
  from the diagnostic plus the live schema + store — a post-construction
  pass keyed by `Diagnostic.rule`, so the ~70 diagnostic construction sites
  and the hot validation path are untouched. Each remediable diagnostic now
  renders a rustc-style `help:` block (artifact-fix first, schema-fix
  second, each tagged so a tool can tell the surfaces apart) in text, a
  `remediation` object in `--format json`, and a
  `rivet docs diagnostics/<rule>` explanation topic. Eight rules covered:
  `link-target-type`, `broken-link`, `unknown-link-type`, `required-field`,
  `allowed-values`, `cardinality`, `unknown-field`, `known-type`. Each
  re-derives the offending link/field/value and the schema menu of allowed
  alternatives faithfully — matching the validator's own known-set. The
  `link-target-type` doc explicitly warns against the fix-forward-onto-
  siblings anti-pattern. 12 unit tests.

### Fixed

- **REQ-105 — HTML export is self-contained.** `export --format html`
  reused the serve dashboard's rendering but shipped none of serve's runtime
  assets, so the static site was broken in three ways: absolute `/artifacts/X`
  links that only resolve under a live server, an unbundled `svg-viewer.js`,
  and uncopied `/docs-asset/` images. Export now rewrites route links to
  relative `.html` paths (depth-aware), bundles a standalone `svg-viewer.js`
  into `_assets/`, and copies referenced doc images into `_assets/docs/`
  with path-traversal hardening (component-based safe-path check +
  canonicalize containment, rejecting symlink/absolute escape). Verified on a
  real export: 0 absolute routes, all links resolve. Playwright `export.spec`
  updated to assert relative links.

### Roadmap

- Filed (draft, not yet implemented): REQ-110..123 (oracle-verified bug-hunt
  findings across cross-command reporting, git/remote semantics, path/URL
  leakage, and F2 silent-failure), and REQ-125..130 (gbrain-derived
  deterministic-armor backlog: `validate/coverage --explain`,
  `list --orphans`, baseline-snapshot drift gate, MCP fail-closed invariant,
  `--review-candidates`, and supersession-as-additive-link).

## [0.13.3] — 2026-05-29

Theme: **serve dashboard correctness — three user-reported fixes**.
All three surfaced from real cross-repo / variant usage; each ships
with a regression test.

### Fixed

- **REQ-106 — variant scope resolves bindings embedded in the variant
  file.** The serve dashboard reported `bound_artifact_count: 0` for
  every variant while the CLI (`variant solve --binding <variant-file>`)
  reported the correct counts. `ProjectVariants::discover` only loaded a
  separate project-level `bindings.yaml`; when the `bindings:` section is
  embedded in the variant file itself (the variant IS its own binding
  model) the dashboard saw no binding. Discovery now also parses each
  variant file as a `FeatureBinding`, and scope resolution prefers the
  variant's own embedded binding (falling back to the project-level
  one) — mirroring the CLI's `--binding <variant-file>` self-reference.
- **REQ-108 — external artifact links route to the artifact detail.**
  An artifact's outgoing link to a cross-repo `prefix:id` target linked
  to `/externals/<prefix>` (the project-list page) instead of
  `/artifacts/<prefix>:<id>` (the external artifact's own detail view,
  which already resolves against the synced external's store). You could
  reach an external artifact by typing the URL but never by clicking a
  link. Now links to the detail view, keeping the prefix badge. A
  Playwright guard asserts external references never route to
  `/externals/`. (Not a regression — present since the LSP-WebView
  rendering landed — but a real navigation gap now that cross-repo
  externals are in active use.)
- **REQ-107 — sequence / mapping field values render structurally.**
  A field whose value was a sequence of mappings rendered as the Rust
  `Debug` form (`Sequence [Mapping {"kind": String("e"), …}]`). Added a
  recursive `render_field_value` that renders scalars as text,
  sequences as `<ul>`, and mappings as nested `<dl>` — no Debug tokens
  reach the page.

## [0.13.2] — 2026-05-28

Theme: **ReqIF interchange completeness + export polish**. The
v0.13.1 export-format end-to-end test surfaced four findings; this
release ships the three that are contained, low-risk fixes and tracks
the rest (HTML link decoupling, serve-dashboard bugs) as REQs.

### Added

- **REQ-103 — ReqIF import reachable from the CLI.**
  `rivet import-results --format reqif <file>` parses an OMG ReqIF 1.2
  file (e.g. a DOORS / Polarion export) into rivet artifacts and writes
  generic YAML. `parse_reqif` already lived in rivet-core but was
  reachable only via the supplier-pull cache, so the DOORS/Polarion
  round-trip was export-only. Round-trip (`export --format reqif` →
  `import-results --format reqif`) preserves artifact + link counts.

### Fixed

- **REQ-104 — ReqIF export emits a SPECIFICATION + SPEC-HIERARCHY.**
  The export carried SPEC-OBJECTs + SPEC-RELATIONs + SPEC-OBJECT-TYPEs
  but no document tree, so importers rendered a flat object pool (some
  reject a hierarchy-less file). Export now emits one SPECIFICATION
  referencing a SPECIFICATION-TYPE, with one SPEC-HIERARCHY entry per
  SPEC-OBJECT in store order. Object/relation payload unchanged (797
  objects + 1551 relations on the rivet corpus — round-trip preserved).
- **REQ-102 — `gherkin` advertised in `rivet export --help`.** The
  format was accepted but undocumented; help text + the
  unsupported-format error now list it (and zola).
- **Test stabilisation: cited-source staleness fixture.** The
  `check_sources_strict_audit_gate` integration test hardcoded a
  `last-checked` date that aged past the 30-day staleness threshold,
  failing the "clean fixture passes" assertion once >30 days elapsed.
  The fixture now generates a fresh timestamp at test time.

### Documented (tracked, not implemented in v0.13.2)

- **REQ-105** — HTML export emits absolute server-route links
  (`href="/artifacts/X"`, no `.html`) inherited from the reused serve
  rendering, so static/file or sub-path hosting has broken internal
  navigation. Fix (relative links / `--base-path` + decouple export
  from the serve module) is regression-risky; deferred to the next
  minor release.
- **REQ-106** — serve dashboard reports `bound_artifact_count: 0`
  because the variant view calls the solver without self-referencing
  the variant file as its `--binding`. User-reported.
- **REQ-107** — sequence/mapping field values render as Rust `Debug`
  output instead of structured HTML. User-reported.
- **REQ-108** — serve external-artifact navigation (prefix:ID detail
  view, followable cross-repo references, inbound internal links) +
  shortcut-link contrast on the light background. User-reported.
- **REQ-109** — variant scoping for documents (design question).

## [0.13.1] — 2026-05-24

Theme: **silent-failure closeout + release-pipeline standardization**.
Fixes a rowan-yaml CST bug that hid links from the salsa validate
path for flush-left YAML (the format `serde_yaml::to_string` emits),
adopts the cross-repo standardized release pattern (SBOM + SLSA +
build-env), and pulls in the matured spar v0.10.0 toolchain.

### Fixed

- **REQ-091 — rowan-yaml flush-left link loss.** The salsa parser
  used by default `rivet validate` silently dropped artifacts written
  in YAML's zero-indent (flush-left) list style. `extract_schema_driven`
  returned 0 artifacts + 0 diagnostics while `parse_generic_yaml`
  (the `--direct` legacy path) returned them correctly — the link
  graph the validator should grade was invisible. Fixed in two places:
  - `yaml_cst::parse_mapping_entry` accepts `child_indent ==
    entry_indent` when the next-line content is a `Dash` (YAML's
    zero-indent block-sequence rule).
  - `extract_links_via_serde` emits a parse diagnostic on
    `serde_yaml::from_str` failure instead of silently returning an
    empty link vec (F2 loud-fail).
  Surfaced previously-silent cardinality errors in the
  `apply_rewrites_dev_to_aspice` migration test — test updated to
  document the migration's actual structural-only contract.

### Changed

- **Release pipeline standardized to the cross-repo synth pattern.**
  Every release now ships a CycloneDX SBOM
  (`rivet-X.Y.Z.cdx.json`), a SLSA v1 build-provenance attestation
  (`gh attestation verify ... --repo pulseengine/rivet`), the
  already-existing cosign-keyless-signed `SHA256SUMS.txt`, and a
  `build-env.txt` capturing the rustc / cargo / cosign / runner
  versions a release was produced with. Asset staging dir renamed
  `release/` → `release-assets/` for cross-repo verification-script
  parity.

- **spar dependency bumped `84a7363` → tag.** Brings in hir-def fixes
  (`applies_to` accepts feature paths per AADL v2.3, nested binding
  path resolution 3+ levels), assertion-eval fixes (`has()`,
  `count()`), and the v0.10.x EMV2 / NC tightness / mermaid /
  trace-topology capabilities. AADL adapter
  (`rivet-core/src/formats/aadl.rs`) compiles unchanged against the
  bumped API surface.

### Infrastructure

- **`rules_wasm_component` pinned via `git_override` in `MODULE.bazel`.**
  Earlier add of the `bazel_dep` without a matching override left
  Rocq Proofs CI red on every PR because the Bazel Central Registry
  has no `rules_wasm_component@1.0.0`. Pin to current
  `rules_wasm_component@main` HEAD so Bazel's shallow git fetch on
  self-hosted runners resolves the dep cleanly.

## [0.13.0] — 2026-05-24

Theme: **cross-repo feature models + audit-deliverable releases**.
v0.12.0's multi-file feature-model composition (REQ-083) now reaches
across git repositories via the consumer's `rivet.yaml` `externals:`,
and the GitHub Release ships the full audit bundle auditors actually
use instead of navigation-shell HTML.

### Added

- **REQ-085 — cross-repo feature model composition.** A mount in a
  `feature-model-binding` of the form `<external-prefix>:<inner-path>`
  resolves through the consumer's `rivet.yaml` `externals:` — single
  source of truth, no git config duplicated in the binding. Rides the
  existing `rivet sync` plumbing entirely. Both the core API
  (`FeatureModel::load_composed_with_externals` /
  `FeatureModel::load_with_externals`) and the CLI (`rivet variant`,
  `rivet validate --model`) are threaded; an unknown prefix is a hard
  error, never a silent local-path fallback (REQ-083 F2 ethos).
- **REQ-090 — audit-deliverable release bundle.** The GitHub Release
  attaches the full ~50 MB compliance tarball — rendered specs with
  resolved artifact tables + coverage + matrix + validate + ReqIF
  (OMG, importable into DOORS / Polarion / codeBeamer) +
  generic-yaml + README — instead of the previous 7 MB navigation
  shell. The compliance action grows an opt-in
  `include-data-formats` input (default false, backward-compatible);
  release.yml flips `single-page: false` + `include-data-formats: true`.
  Feasible at this size because v0.12.0's REQ-088 shared-assets
  dedup landed.

### Documented (no implementation in v0.13.0)

- **REQ-091** — clean-room-verified finding:
  `yaml_hir::extract_schema_driven` (the default rowan-yaml salsa
  load path) silently drops flush-left artifacts. The original
  parallel-agent attribution (`GenericYamlAdapter` /
  `parse_generic_yaml`) was falsified by probe — those return the
  expected 1 artifact + 1 link. Contributing factor:
  `extract_links_via_serde` silently `Vec::new()`s on
  `serde_yaml::from_str` parse error. Fix tracked for the next patch
  release; `rivet validate --direct` (legacy non-incremental) is the
  reliable path in the meantime.
- **REQ-092** — design for a future per-source-line traceability
  subcommand (Eclipse S-CORE `score_source_code_linker` equivalent)
  to ease S-CORE → rivet migration. Tracked for a later minor
  release.

### Maintenance

- `schemas/score.yaml` aligned with an Eclipse S-CORE comparison
  (+453 lines, -14 lines); worked conversion sketch added under
  `examples/score-conversion/`.
- `rules_rocq_rust` bumped to `e4660cc` (hermetic rules_rust toolchain)
  in the Bazel module config.
- Test stabilisation: `server_pages_push_url` switched to a 15s
  timeout + retry-on-status-0 to absorb the runner-load flake class.

## [0.12.0] — 2026-05-22

Theme: **multi-file feature models**. A product line can now be authored
as a top-level feature model plus per-level sub-models in their own
files — vehicle → powertrain → ECU — each file a valid, independently
solvable model on its own. Minor version: new file kind and new
`rivet variant` input behaviour, no breaking schema or CLI removal.

### Added

- **`feature-model-binding` files** (REQ-083) — a `kind:
  feature-model-binding` file with a `compose:` list mounts standalone
  sub-model files onto parent features. Each mount declares an explicit,
  unique `prefix:` and the sub-model's features are namespaced under it
  (`pwt:four-wheel`), mirroring the `externals: prefix:ID` model.
  Composition is recursive (a sub-model may itself be a parent) and
  resolves to one tree that `solve` / `check` / `explain` / `list`
  operate on. `FeatureModel::load_composed` / `FeatureModel::load`.
- Every `rivet variant` command accepts a binding file wherever it
  accepts a plain model (`rivet variant list --model binding.yaml`) —
  the file's `kind:` selects composition vs. single-file parsing.

### Changed

- The s-expression lexer accepts `:` inside a symbol, so a namespaced
  feature reference (`prefix:feature`) lexes as one token — required for
  cross-prefix constraints like `(implies car pwt:four-wheel)`.

### Notes

- Composition resolves sub-model files by path **relative to the binding
  file, within one repository**; pulling a sub-model from another git
  repo is not yet supported (tracked separately). A broken mount —
  missing file, unknown or `leaf` mount point, duplicate prefix, cyclic
  composition — is a hard error, never a silent skip.

## [0.11.1] — 2026-05-21

Theme: **the Mythos silent-failure hunt**. A `scripts/mythos/`
slop-hunt re-run after v0.11.0 — adjusted with a new degraded-input
oracle (`discover-silent-failure.md`) targeting the F2 silent-failure
class the cross-git investigation surfaced — swept the ingest/parse
subsystems the FEAT-135 waves did not cover. Four discovery agents
returned four confirmed findings; in every case the subsystem already
contained a sibling check doing the right thing and one code path that
forgot to. Filed as REQ-078..REQ-081 (`artifacts/mythos-silent-failure-findings.yaml`).
A fifth fix, REQ-082, addresses a user-reported v0.11.0 regression.
Patch-shaped: every change is a localized fix, no new flags, no schema
change.

### Fixed

- **`rivet commits` silently treated malformed artifact trailers as
  benign orphans** — a one-keystroke typo (`Implements: REQ-O1`) or a
  typo'd trailer key (`Implments:`) produced an empty `artifact_refs`,
  classified `Orphan` (warning, exit 0). Malformed references are now
  flagged as broken, asymmetric with the existing `BrokenRef` check
  for well-formed-but-unknown IDs (REQ-078).
- **ReqIF import silently typed a SPEC-OBJECT `unknown`** when its
  `<TYPE>` was missing or referenced an undeclared SPEC-OBJECT-TYPE —
  `parse_reqif` returned `Ok`. It now rejects the import naming the
  offending SPEC-OBJECT, matching the sibling dangling-SPEC-RELATION
  check (REQ-079).
- **Schema migration skipped the enum value-check on field-map-renamed
  fields** — a source value out of the target field's `allowed_values`
  enum produced zero conflicts and migrated `COMPLETE`. The renamed
  path now hits the same conflict path as the non-renamed path
  (REQ-080).
- **`needs.json` import accepted duplicate artifact IDs** — two
  sphinx-needs entries sharing one inner `id` both imported, exit 0.
  The importer now rejects the collision, reusing REQ-075's
  `detect_duplicate_ids` so the uniqueness rule has one definition
  (REQ-081).
- **`rivet validate` counted linked external repos' own schema
  violations against the consumer** — after `rivet sync`, a consumer
  project reported thousands of errors all originating from loaded
  external repos' artifacts, contradicting REQ-065 / AoU-X1. External
  (`prefix:`-qualified) artifacts now stay in the store ONLY so the
  consumer's `prefix:ID` cross-links resolve; every per-artifact
  validation pass skips them. The supplier's diagnostics remain opt-in
  via `--with-externals-validate` (REQ-082). User-reported.

## [0.11.0] — 2026-05-21

Theme: **the cross-git investigation**. A 2026-05-19 investigation
(six adversarial personas, ten scenarios, three test-bed repos in
different orgs) found eleven ways `rivet validate` could report a
green PASS while the project was, in fact, broken — the Cederqvist
"the tool reports textual success over a semantically-failed
operation" cliff. The findings were filed as typed Rivet artifacts
(FEAT-135, REQ-062..REQ-077) and closed across three waves. Minor
version: new flags and validation behaviour, no breaking schema or
CLI removal — but `rivet validate` is now stricter (it fails on
inputs it previously skipped silently), so a project that "passed"
on 0.10.x may legitimately FAIL on 0.11.0. That is the fix working.

### Added

- `rivet validate --with-externals-validate` — runs validate inside
  each linked external project and surfaces its diagnostics under a
  `cross_repo_diagnostics` array (REQ-065).
- `rivet validate --strict-orphans` — promote `orphan-artifact`
  warnings to errors for CI (REQ-076).
- `rivet supplier pull --accept-drift` — the explicit auditor
  override for sha256 drift (REQ-068).
- `rivet docs cross-repo-ci` — a new topic: the multi-repo CI
  sequence, a worked GitHub Actions example, the AoU register
  (REQ-071).
- `docs/rivet-is-not.md` — an ISO 26262-10 SEooC Safety-Manual-draft
  "Rivet is not..." doc with the Cross-org Assumptions-of-Use
  register AoU-X1..X7 (REQ-072), linked from the README.
- `external-anchor` schema now declares the `cited-source` field
  (REQ-066); `docs/historical/` archive + `docs/README.md`.

### Fixed

- **`rivet validate` reported `PASS` over artifact files that failed
  to parse** — the skip was a stderr log line, uncounted. Skipped
  files are now Error diagnostics (`artifact-parse-error`) and the
  run exits non-zero (REQ-062). The headline finding.
- **Duplicate artifact IDs** silently collapsed via `Store::upsert`
  last-write-wins — now detected at load time (`duplicate-artifact-id`,
  REQ-075). The new check immediately surfaced a real `REQ-060`
  collision in Rivet's own `artifacts/` (resolved → `REQ-077`).
- **Orphan artifacts** (no inbound/outbound links) were invisible to
  `rivet validate` — now reported (`orphan-artifact`, Warning;
  REQ-076).
- `rivet init --preset {do-178c, en-50128, iec-61508, iec-62304}`
  produced unvalidatable projects — the four safety-critical schemas
  are now embedded in the binary (REQ-063).
- A `derives-from-external` link did not satisfy a required
  `derives-from` link-field — the cross-org variant now counts
  (REQ-064).
- `rivet supplier pull` silently overwrote the cache on sha256
  drift — it now refuses, naming both hashes (REQ-068).
- Stale documentation: MSRV (1.85 → 1.89), the schema/oracle/module
  counts in `schemas.md` / `architecture.md` / `oracles.md` (REQ-074).

### Changed

- `rivet validate --format json` diagnostics now include the `rule`
  field.
- 17 stale planning docs archived to `docs/historical/`;
  `docs/historical/` is doc-check-exempt like `plans/` / `design/`.
- The `rivet docs cross-repo` topic now documents both cross-repo
  mechanisms (`externals:` vs `external-anchor` + `cited-source`)
  and when to use each (REQ-067).

## [0.10.1] — 2026-05-19

Theme: **adversarial-review action items + user-reported regressions**.
Six PRs landed in three days, each citing a specific finding from the
v0.10.0 adversarial-review batch (DPO / Auditor / Formal-Skeptiker /
Supply-Chain-Pentester / PM / Mobile-Scale lenses) or a direct user bug
report. Patch-shaped because every change is additive: no breaking
schema or CLI changes, only new fields/subcommands/heuristics.

### Added

- **`rivet audit`** subcommand (#297, partially closes #127). Read-only
  AI-session/commit traceability gate. Two checks: (a) every AI-authored
  commit (detected via `Co-Authored-By: ...noreply@anthropic.com` or
  `Generated-With:`/`Created-By: ai|ai-assisted` trailers) must have an
  `ai-session` artifact whose `commit-sha` matches; (b) every
  `ai-session.commit-sha` must point at a commit that exists and is
  reachable from HEAD. Composes with `rivet check ai-defects-open`
  (#295) — together they are the two operational TD1 loops the dossier
  §3 layer 5 names.

- **`rivet check ai-defects-open`** oracle (#295, TCL workstream B).
  Blocks release if any `ai-found-defect` with `triage-status: open`
  links to a `released`/`approved` artifact, OR if `triaged-by` equals
  the originating session's `invoker` (DPO segregation-of-duties).
  Ships the gate the dossier §3 had previously *claimed* without
  implementing.

- **`dpia` artifact type** in `schemas/common.yaml` (#295). DSGVO Art. 35
  Data Protection Impact Assessment record. Fields: `dpo-sign-off`,
  `personal-data-categories`, `risk-assessment`, `mitigation-measures`,
  `consultation-date`. Companion fields on `ai-session`: `lawful-basis`,
  `retention-period`, `erasure-mechanism`. Schema only — validate-time
  enforcement of the link from `invoker`-bearing sessions is deferred.

- **Variant-aware validate** (#298, Phase 2 of #287). The
  `fields_for_variant` resolver shipped in v0.10.0 now flows through
  validate's required-fields, allowed-values, and conditional-rule
  checks. New public APIs:
  `validate_with_variant`, `validate_with_externals_and_variant`,
  `validate_structural_with_variant`,
  `validate_structural_with_externals_and_variant`. CLI's
  `--variant <name>` flag finally has teeth.

- **JUnit importer marker join** (#302). New
  `parse_junit_xml_with_markers(xml, markers)` adds a 5th heuristic to
  `artifact_id_for`: when the existing fallback fires (cargo-nextest
  output without bracketed `[REQ-NNN]`), look up a marker whose
  `test_name` matches the case name. CLI's
  `rivet import-results --format junit` scans the project's
  `src/`+`tests/` for `// rivet: verifies REQ-NNN` markers and threads
  them in. Restores the test → artifact link that was silently dropped.

### Fixed

- **JUnit import overwrote previous runs** (#302, user-reported).
  `suite_to_run` derived `run_id` purely from the testsuite name, so
  a second CI run with the same name wiped the first. Now appends
  either the slugified `<testsuite timestamp>` (most CI emits it) or a
  16-hex `DefaultHasher` content digest. Idempotent on re-import of the
  same artefact, distinct on a new CI run.

- **Salsa `build_store` was not memoized** (#295, Mobile/Scale lens
  finding). Marked `#[salsa::tracked]` plus `#[salsa::tracked]` on
  `build_store_with_extras`. Required adding `PartialEq` to `Store`.
  Previously every revision rebuilt the whole HashMap (cloning every
  artifact) — the "incremental validator" was doing an O(N) rebuild on
  every keystroke. Now cache-hits on identical inputs.

- **Dossier scope statement overstated v0.10.0** (#295, Auditor +
  Formal-Skeptiker lens). `docs/design/tool-qualification-dossier.md`
  gained §0 "Honest scope statement" enumerating what is NOT yet
  defensible: no independent confirmation reviewer; unverified
  DO-330/IEC 62304/EN 50128 cross-walks; unproven five-layer
  independence; 29-mutant testing baseline; one `Admitted` Rocq theorem
  (`vmodel_chain_two_steps`); one `assume`'d Verus obligation
  (`backlink_symmetric`); unsigned SHA256SUMS; no DPIA enforcement.
  Strips the "Kani 2000+ proofs" claim (real number: 27 harnesses).
  Companion typed claim `TQ-CONF-RIVET.fields.scope` updated to match.

### Changed

- **Release `SHA256SUMS` now signed via sigstore keyless OIDC** (#296,
  Supply-Chain-Pentester lens). New artifacts on the release page:
  `SHA256SUMS.txt.cosign.bundle`, `SHA256SUMS.txt.sig`,
  `SHA256SUMS.txt.pem`. Trust anchor binds to the GitHub-Actions
  workflow identity (issuer
  `https://token.actions.githubusercontent.com`, subject
  `.github/workflows/release.yml@refs/tags/vX.Y.Z`). Verification is
  documented in new `RELEASING.md`. No long-lived signing key to rotate.

- **`build-test-evidence` non-blocking again** (#294). The release
  workflow's `build-test-evidence` job pulls in the spar wasm32-wasip2
  build, which transitively requires the highs-sys C++ solver and a
  flaky WASI cross-compile. Made `continue-on-error: true` and dropped
  from `create-release.needs`. Future tag pushes survive without
  manual republishing. Root-cause investigation tracked in #293.

- **`cargo-mutants --jobs 4 → --jobs 2`** (#301). lean-mem runners
  were hitting their 32G cgroup ceiling under 4-way parallel mutation
  testing (~8G/worker triggering swap-death-spiral). 2-way gives
  ~16G/worker with comfortable headroom. Each shard takes ~2× as long
  (was 12-20 min, now 20-40 min) but the lean-mem pool stops needing
  emergency cgroup-ceiling bumps.

## [0.10.0] — 2026-05-16

Theme: **audit-grade story**. Three orthogonal features that together
move rivet from "trace your project" to "describe the boundary and
defend the tool's role across it." Variant-aware properties (#255),
supplier-boundary coverage (#253), AI session provenance (#127), and
the tool-qualification dossier (TCL workstream A) ship as the four
mechanical primitives behind that story.

### Added

- **Variant-aware properties — per-variant field values** (#285,
  closes #255). New `fields-per-variant` map on every artifact +
  `Artifact::fields_for_variant(Option<&str>) -> Cow<...>` resolver
  with a zero-allocation `Borrowed` fallback. Schema-driven YAML
  parser recognises the typed key (no fall-through to the generic
  `fields` map). `#[derive(Default)]` on `Artifact` so future struct
  additions stay additive. Phase 2 (variant config loading +
  validate/coverage wiring) tracked in #287.

- **Cross-org / supplier-boundary coverage MVP** (#286, closes #253).
  New `external-anchor` artifact type in `schemas/common.yaml` marks
  the typed leaf at a supplier hand-off. `CoverageEntry` gains
  `external_boundary` + `external_boundary_ids` so the auditor sees
  three categories instead of two — satisfied / delegated to supplier
  / genuinely uncovered. The classification rule only honours
  on-contract anchors (anchor's `expected-derived-types` overlaps the
  rule's target types) — off-contract anchors do NOT silently absorb
  gaps. New `rivet supplier list` + `rivet supplier check` commands.
  `rivet coverage` JSON output extended additively. Phase 2
  (federation handshake, `rivet supplier pull` for ReqIF/file) tracked
  in #288.

- **AI session provenance — schema half** (#289, partially closes
  #127). New `ai-session` artifact type in `schemas/common.yaml`
  pins a Claude Code (or other AI) session to a commit so the auditor
  can reconstruct who/what authored a change: session-id, session-hash
  (SHA-256 of transcript), model-id, tool-version, commit-sha,
  started/ended timestamps, invoker. New link type `produced-by`
  carries the artifact → session relationship. Phase 2 (commit hook
  + audit-side enforcement subcommand) tracked alongside.

- **Tool-qualification workstream A — typed claim + dossier** (#289).
  New `tool-confidence` artifact type in `schemas/iso-26262.yaml`
  carries the typed TI/TD/TCL claim with `regime:` field so the
  DO-330/26262 numbering cross-walk is machine-readable. New
  `ai-found-defect` artifact type in `schemas/common.yaml` captures
  errors introduced by AI authoring that rivet's detection layer
  caught (severity, triage-status, detected-by). Companion link types
  `defect-against` and `corrects`. Dogfood claim `TQ-CONF-RIVET`
  (`safety/tool-qualification/rivet-tool-confidence.yaml`) at
  TI2/TD1/TCL1. Companion dossier at
  `docs/design/tool-qualification-dossier.md` rendered via
  `rivet docs tool-qualification`.

- **`rivet stats --qualification`** (#289). JSON-only configuration
  baseline manifest for the dossier — lists rivet version, schemas
  in use, every `tool-confidence` artifact, and `ai-found-defect`
  aggregates (by severity, by triage-status, open-IDs). The snapshot
  a safety manager pastes into the dossier evidence section.

- **`--qualification-mode` flag** (#289). Top-level flag that
  refuses out-of-scope subcommands per the dossier scope list.
  Initial gate refuses `rivet sync` (Phase 2 federation not yet
  qualified); read-only commands stay allowed. The flag is sticky
  for one invocation only.

- **`rivet coverage --aggregate <FILE>...`** (#188 sub-issue 3). File-based
  cross-repo V&V matrix aggregator: each repo's CI emits its
  `rivet coverage --matrix --format json`, a top-level job merges them
  into one matrix (text / markdown / html / json). Needs no GitHub API
  access — inputs are plain files; duplicate `(repo, id)` rows are
  coalesced so re-runs are idempotent, and the merged JSON re-feeds the
  aggregator unchanged.

### Fixed

- **TCL/TQL numbering convention in dogfood STPA** (#289, TCL design
  A1). `safety/stpa/tool-qualification.yaml` header now follows ISO
  26262-8 Table 3 unambiguously (TCL1 = lowest demand) instead of
  mixing 26262 and DO-330 conventions. The typed `tool-confidence`
  artifact's `regime` field disambiguates downstream.

## [0.9.0] — 2026-05-11

Theme: backlog drain. Ships the rivet-bundle command, the s-expr
`linked-via` operator, and the V&V coverage matrix CLI — three feature
requests that had been queued since v0.5. Plus infrastructure: CI
concurrency control across all workflows, migration to self-hosted
smithy runners for the long-tail jobs, and the release-npm trigger fix
that closes the v0.7.0/v0.8.0 npm-publication gap. Also retires the
RUSTSEC-2026-0114 wasmtime suppression introduced in v0.8.0.

### Added

- **`rivet bundle <ID> --depth N --as {yaml,jsonl}`** (#266, closes #206).
  Context-window-friendly artifact bundle: walk N hops from a root
  artifact and emit the closure as either YAML or JSONL. Output is
  paste-ready into chat/IDE contexts where the full repo doesn't fit.

- **`rivet coverage --matrix`** (#243, closes #188). Renders a V&V
  coverage matrix from `repo-status` artifacts — per-commit, per-repo,
  per-technique. Closes the dashboard gap for cross-repo V&V tracking.

- **s-expr `linked-via` operator + `linked-*` family docs** (#265,
  closes #190). Adds the missing predicate for "artifact links via
  *this specific link type*" queries; previously there was no clean way
  to express "missing outbound link of type X". Documents the full
  `linked-*` semantic family.

- **Externals: per-repo schema loading** (#267, closes #245). Each
  external repository now loads its own schemas alongside its
  artifacts. Prefixed artifacts (`other-repo:REQ-001`) are now
  type-checked against the external's schemas, not just the local
  schema set.

### Fixed

- **STPA: TCL numbering corrected to ISO 26262-8 (TCL1)** (#257,
  closes #254 part A1). Tool Confidence Level dossier now uses the
  ISO 26262-8 numbering scheme (TCL1/TCL2/TCL3) and includes a
  DO-330 cross-walk for aviation tooling. Pure data fix; no schema
  change.

- **wasmtime 42 → 43 (closes RUSTSEC-2026-0114)** (#260, closes #259).
  Retires the `cargo audit --ignore RUSTSEC-2026-0114` suppression
  added in v0.8.0. wasmtime is behind the optional wasm feature gate
  and rivet's usage doesn't allocate large wasmtime tables, but
  upstream is the correct fix.

- **`release-npm.yml` trigger switched to `workflow_run`** (#261).
  v0.7.0 and v0.8.0 npm publication had silently failed because the
  upstream Release workflow authenticated with `GITHUB_TOKEN`, which
  GitHub deliberately blocks from firing downstream `release:
  published` events. The `workflow_run` trigger is the documented
  escape hatch. Both v0.7.0 and v0.8.0 were retroactively published
  to npm via `workflow_dispatch`.

### Changed

- **CI concurrency control across all workflows** (#258). Adds
  per-workflow concurrency groups: `Benchmarks` and `CI` cancel
  superseded PR runs; `Compliance Report`, `Release`, and `Release
  NPM` serialize without cancellation (partial publication of signed
  artifacts / npm packages leaves state inconsistent).

- **CI migrated to self-hosted smithy runners** (#262). 16 of 21
  `ci.yml` jobs now run on the `smithy` runner pool instead of
  GitHub-hosted runners. Cuts queue time on the long-tail jobs
  (mutation testing, Verus, MSRV) at the cost of taking on disk-space
  hygiene as a self-hosted-runner concern.

- **Dependabot configuration added** (#216). Weekly dependency
  updates across github-actions, cargo (workspace + per-crate), and
  npm ecosystems.

## [0.8.0] — 2026-05-01

Theme: post-0.7.0 dogfood-driven follow-ups. The 12-persona dogfood
against 0.7.0 surfaced docs-corpus drift, coverage-gate flaws, and
CLI asymmetries on cited-source + schema-migrate. All three are
fixed here.

### Fixed

- **Stale literals shipped in 0.7.0 docs** (#252, closes #247).
  Tech-writer + DevOps personas independently flagged four embedded-
  doc literals: quickstart Step 1's `rivet 0.5.0` example, `rivet
  docs mcp`'s hardcoded `serverInfo.version: "0.5.0"`,
  `rivet docs schema/eu-ai-act`'s wrong `rivet init --schema X`
  flag, and a shipped `(TODO)` marker in `rivet docs schema/dev`.
  Plus 2 bonus drift items the agent caught: `v0.5.0` example tag
  in the `impact` topic, and `rivet export --gherkin` (the actual
  flag is `--format gherkin`).

  All six fixed. To prevent the class of drift from re-shipping,
  `rivet docs check` learned three new invariants that scan the
  embedded docs strings (the things `rivet docs <topic>` prints):
  - **`EmbeddedVersionLiterals`** flags any `vX.Y.Z`/`X.Y.Z` token
    that doesn't match the workspace version unless it's in
    `rivet.yaml`'s new `docs-check.allowed-version-literals`
    allowlist (used for legitimate non-rivet versions like ASPICE
    process IDs and the rmcp crate pin).
  - **`EmbeddedFlagReferences`** flags every `rivet <subcmd>
    --<flag>` token in topic bodies whose flag isn't declared on
    that subcommand in the live clap tree.
  - **`EmbeddedTodoMarkers`** flags `TODO` / `FIXME` / `XXX`
    markers in shipped doc bodies.

  Also adds a new `rivet docs docs-check` topic explaining the
  full invariant set (markdown-side + embedded-doc-side).

### Added

- **`rivet docs check --coverage --warn-only`** mode + tightened
  rule (#250, closes #248). The 0.7.0 `--coverage` gate marked
  `batch`, `query`, `stamp`, `lsp` as covered via parent-mapping
  even though the parent topic body never mentioned them. Rule 4
  (umbrella mapping) now requires the child subcommand's name to
  appear in the parent topic's body (whole-word, case-insensitive).
  Result: `lsp` and `batch` are now correctly reported as gaps.

  The default `--coverage` (no flag) is now silent-print exit 0,
  `--coverage --warn-only` prints + emits `::warning::` GitHub
  annotations, `--coverage --strict` exits 1 on any uncovered.
  `--warn-only` and `--strict` are mutually exclusive. CI uses
  `--warn-only` explicitly so the contract is legible at the call
  site.

- **`rivet check sources --strict`** — read-only audit mode for
  cited-source drift (#251, closes #249 part 1). Walks every
  artifact, reports per-artifact verdict (match / drift /
  missing-hash / stale), exits 1 on any non-match. Read-only —
  does NOT modify any YAML, even on drift detection. Mutually
  exclusive with `--update`. Replaces the "run `--update --apply`
  then `git diff --exit-code`" mutation-and-audit pattern with a
  clean read-only gate.

- **`rivet validate --strict-cited-source-stale`** — promotes
  `cited-source-stale` Info diagnostics to Error (#251, closes
  #249 part 2). Defaults off; current behavior preserved. Enables
  audit gates that enforce "every cited-source must be re-checked
  within 30 days." `cited-source-stale` now fires for missing,
  unparseable, OR older-than-30-days `last-checked` (was: only
  missing).

- **`rivet schema migrate --list`** — recipe discovery (#251,
  closes #249 part 3). Without `<target>`, prints all available
  recipes (built-in + project-local under `schemas/migrations/`)
  as a text table, or JSON with `--format json`. Project-local
  recipes shadow built-ins of the same name. Mutually exclusive
  with `<target>` and the action flags.

### Workspace

- Workspace, vscode-rivet, and npm root package versions bumped to
  0.8.0. Platform packages stay on the release-npm.yml override
  path.

### Verified

- cargo check, cargo clippy --workspace -- -D warnings, cargo fmt
  --all clean.
- cargo test workspace passes (912 unit tests + integration tests).
- `rivet docs check` clean against the rivet repo.
- `rivet docs check --coverage` reports 46/81 covered (was 48/81;
  rule 4 tightening correctly surfaces `lsp` + `batch` as gaps).
- `rivet check sources --strict` round-trips: clean fixture exits
  0; off-disk source edit exits 1 with no YAML mutation;
  `--update --apply` restores 0.
- `rivet schema migrate --list` enumerates the canned
  `dev-to-aspice` recipe.

## [0.7.0] — 2026-04-29

Theme: schema migration Phase 2 + docs coverage gate + housekeeping.
The migrate state machine is now the full git-rebase analogue —
conflict markers, `--continue`, `--skip`, `--edit` — and the embedded
docs corpus has a mechanical coverage check to prevent future drift.
Plus four hygiene PRs that had been sitting in the backlog.

### Added

- **`rivet schema migrate` Phase 2** — git-rebase-style conflict
  resolution UX (#242). When `--apply` hits a conflict, merge-conflict-
  style markers (`<<<<<<<` / `=======` / `>>>>>>>`) are spliced into
  the affected artifact YAML and the migration pauses. Three new
  subcommands resolve from there:
  - `--continue` — verify markers are gone, re-validate the touched
    artifact, advance to the next conflict or COMPLETE.
  - `--skip` — drop the current artifact from the migration; restore
    its pre-migration form from the snapshot, advance.
  - `--edit <id>` — re-stamp markers on a previously-resolved
    conflict for re-editing.

  New `MigrationState::Conflict` state, `current-conflict` pointer
  file wired in, `manifest.yaml` extended with per-artifact
  `resolutions: pending|resolved|skipped`. The diff engine now also
  emits `FieldValueConflict` when a source value violates the target
  field's `allowed-values` enum (the canonical conflict shape).

- **`MigrationConflict` invariant in `rivet docs check`** — scans
  `artifacts/**/*.yaml` for unresolved conflict markers. Catches
  accidental commits with markers still in the YAML; the gate is
  always-on so a half-resolved migration can't slip into git.

- **`rivet docs check --coverage`** subcommand-coverage gate (#241).
  Walks the live clap CLI tree, builds every subcommand path
  (top-level + nested actions), and cross-references each against
  the embedded `rivet docs` topic registry. Default is warn-only;
  `--strict` makes uncovered paths fail the build. JSON output for
  CI consumption. Wired into the `docs-check` CI job (warn-only
  initially; flip to `--strict` once the documented gaps are filled).
  Initial inventory: 48/81 paths covered (59%); 33 uncovered across
  7 families (variant, baseline, snapshot, runs, pipelines,
  templates, close-gaps).

### Changed (housekeeping merges)

- **`feat(validate)`: warn when prose names an artifact id without
  a typed link** (#234, closes #207). `rivet validate` now scans
  every artifact's `description` and string-typed fields for tokens
  matching `\b[A-Z][A-Z0-9]*-[0-9]+\b`. When such a mention resolves
  to an existing artifact and there's no typed link to it,
  `prose-mention-without-typed-link` warns. Suppressed for self-refs
  and unresolved IDs; deduplicated per artifact-pair.

- **`feat(schemas)`: vv-coverage repo-status type for V&V technique
  tracking** (#232, partial #188). New `vv-coverage` schema with the
  `repo-status` artifact type, designed as the source-of-truth shape
  for the planned `rivet coverage --matrix` rendering surface and
  cross-repo aggregation.

- **`feat(mutants)`: canonical cargo-mutants template + docs +
  schema fields** (#229, closes #185). Reusable `mutants.toml` +
  workflow YAML template under `templates/cargo-mutants/`, doc
  topic, and schema fields for tracking surviving mutants per
  test layer.

- **`docs(pre-commit)`: canonical 21-hook template + tier docs**
  (#222, closes #186). Copy-pasteable `templates/pre-commit/
  .pre-commit-config.yaml` and `docs/pre-commit.md`.

### Fixed

- **Release workflow now idempotent on existing tag** (#244). The
  `Create Release` step in `release.yml` previously failed with
  "a release with the same tag name already exists" if the
  maintainer ran `gh release create` manually right after pushing
  the tag — which happened on every release in the v0.5.0 / v0.5.1
  / v0.6.0 sequence. Net effect was that those release pages have
  no binary / VSIX / SHA256 assets attached. The step now detects
  an existing release and uploads assets via `gh release upload
  --clobber`, otherwise creates the release with assets. v0.7.0
  ships clean assets out of the box; older releases need manual
  asset upload if desired.

### Workspace

- Workspace, vscode-rivet, and npm root package versions bumped to
  0.7.0. Platform packages stay on the release-npm.yml override
  path.

### Known issues

- **v0.5.0 / v0.5.1 / v0.6.0 release pages have no binary assets.**
  The Release workflow doesn't have `workflow_dispatch`, so
  re-running on those tags isn't possible without a manual
  `gh release upload`. Tracked as a follow-up; v0.7.0 onward is
  unaffected.

## [0.6.0] — 2026-04-29

Theme: schema migration + cited-source faithfulness. Two marquee
features landing together — both surfaced during the post-0.5.0
fresh-user dogfood (#236, #237).

### Added

- **`rivet schema migrate <target-preset>`** — git-rebase-style preset/
  version migration with snapshot/abort. Phase 1 ships the diff engine
  + plan/apply/abort/status/finish. Three change classes (mechanical,
  decidable-with-policy, conflict). Mechanical-only auto-applied;
  conflicts bail loudly (Phase 2 will add merge-conflict-style markers
  + `--continue` / `--skip`). Storage layout under `.rivet/migrations/
  <ts>-<src>-to-<tgt>/` with full pre-migration snapshot, manifest,
  state file. One canned recipe ships:
  `schemas/migrations/dev-to-aspice.yaml` covering type renames
  (`requirement` -> `sw-req`, `feature` -> `sw-arch-component`),
  link-type renames (`satisfies` -> `derives-from`), and policy
  declarations (`unmapped-fields: keep-as-orphan`). 8 unit tests
  + 5 integration tests covering apply, abort byte-symmetry, and
  roundtrip. `rivet docs schema-migrate` documents the state machine
  and recipe format. (#238 / issue #236)

- **`cited-source` typed schema field** — first-class affordance for
  artifacts citing external sources. Field shape:
  `{ uri, kind: file|url|github|oslc|reqif|polarion, sha256, last-checked }`.
  Phase 1 ships the `kind: file` backend: `rivet validate`
  re-reads cited files, recomputes sha256, emits a new
  `cited-source-drift` diagnostic on mismatch (severity Warning by
  default, Error with `--strict-cited-sources`). URI scheme allowlist
  enforced at validation time to mitigate exfiltration / SSRF surface.
  New `rivet check sources` subcommand walks every cited-source and
  surfaces drift; `--update` interactively refreshes hashes,
  `--update --apply` batch-updates. The `dev` preset's `requirement`
  type opts in first; other presets adopt incrementally via overlay.
  `rivet docs schema-cited-sources` documents per-kind backend
  behaviour, the `last-checked` semantics, and the security model.
  (#239 / issue #237)

  Phase 2 backends (`url`, `github`, `oslc`, `reqif`, `polarion`)
  are deferred. Phase 3 LLM-judge layer documented as opt-in
  `Severity::Info` future work; *not* shipped here. The cited paper
  (arXiv 2604.19459) is explicitly *not* the motivation — it studies
  formal-proof faithfulness, not prose-to-prose comparison;
  RAG-grounding (FActScore, FaithEval) is the right literature for
  the LLM-judge path if/when it materializes.

### Workspace

- Workspace, vscode-rivet, and npm root package versions bumped to
  0.6.0. Platform packages stay on the release-npm.yml override path.

### Verified

- cargo check, cargo clippy --workspace -- -D warnings,
  cargo test -p rivet-cli (passes including new migrate + cited-source
  integration tests),
- `rivet schema migrate aspice` (plan + apply on a fresh `dev`
  project) returns PASS,
- `rivet validate` on a `cited-source: { kind: file, ... }` fixture
  catches drift after the underlying file changes,
- `rivet check sources --update --apply` restores PASS state.

## [0.5.1] — 2026-04-28

Theme: post-0.5.0 first-contact polish. Three fresh-user dogfood passes
(plus three parallel scenario-based ones — safety engineer / STPA,
compliance lead / Polarion-import, AI integrator / MCP) surfaced two
real bugs and one big doc gap. All three are fixed here.

### Fixed

- **`rivet init --preset aspice` seed now validates clean** (#233).
  Two bugs in the shipped aspice preset: the `common` schema registers
  `allocated-to` with `inverse: allocated-from` but never declares
  `allocated-from` as a forward token, so the seed's
  `sw-arch-component -> allocated-from -> sw-req` link was rejected.
  And the seed's `system-req` had no `derives-from` target, so the
  `sys2-derives-from-sys1` rule failed on the first
  `rivet validate` post-init. Now: `aspice` declares `allocated-from`
  as a forward link-type, and the seed grows a `stakeholder-req`
  V-model root with the `system-req -> derives-from -> stakeholder-req`
  link wired up. `rivet init --preset aspice && rivet validate`
  now returns `Result: PASS (0 warnings)`.

### Added

- **`rivet mcp --list-tools` and `rivet mcp --probe`** (#231). Two
  new flags for MCP discoverability — Scenario-C dogfood found that
  AI integrators wiring rivet's MCP server into a custom client burned
  ~30 minutes on JSON-RPC framing and writing throwaway requests just
  to enumerate the tool catalog.
  - `--list-tools` walks the registered tool router and prints the
    catalog (15 tools today). Default output is a human table;
    `--format json` emits the JSON-RPC `tools/list` payload exactly
    as the wire server would. Does not start the server.
  - `--probe` runs the in-process equivalent of
    `tools/call rivet_list` (no args) against the current project and
    prints the decoded `result.content[0].text` payload — same envelope
    a real MCP client would observe — without spinning up stdio.
  - Both reuse the same handlers the wire server dispatches to, so
    output cannot drift from a real session.
- **`rivet docs mcp` embedded topic** (#231). New ~1400-word doc
  covering: line-delimited JSON-RPC framing (NOT LSP-style
  Content-Length), the 3-message handshake (`initialize` ->
  `notifications/initialized` -> `tools/list`/`tools/call`), the
  full 15-tool catalog with input-schema summaries, the
  `result.content[0].text` envelope gotcha (tool results arrive as a
  stringified JSON document, not a structured object), the
  `rivet_reload`-after-mutation convention, and copy-pasteable
  smoke-test recipes.

### Changed

- **Quickstart rewrite for fresh-user clarity** (#230). Two clean-room
  dogfood passes plus three parallel scenario-based passes (safety
  engineer / STPA, compliance / Polarion-import / ASPICE overlay,
  AI integrator / MCP) surfaced six concrete issues that confuse a
  real first-contact user, all fixed here. Highlights:
  - New "What is rivet?" preamble (typed YAML + schema + graph + four
    interfaces; DOORS/Polarion/Jira analogy) so readers don't have to
    assemble the mental model by osmosis.
  - Step 2 now branches on preset choice: for `dev`, the seed is a
    placeholder (write your own in step 3); for `stpa`/`aspice`/etc.,
    the seed is a worked example in domain vocabulary — read it,
    skip step 3, jump to step 4.
  - Step 3's `rm artifacts/requirements.yaml` is gated to `dev` only
    so non-`dev` seed files aren't accidentally nuked.
  - Step 7's Python oracle uses the actual JSON key (`errors`, not
    `error_count`); a real broken link now exits 1.
  - Step 9 replaces the Mythos red-team scaffold reference (out of
    scope for first contact) with "add a living document" using
    markdown frontmatter + `{{stats}}` / `{{coverage}}` /
    `[[REQ-001]]` embeds + an explicit `rivet serve` restart oracle.
  - New "Existing-repo bring-up" appendix: explicit `rivet init`
    non-destructiveness contract, complete copy-pasteable ASPICE
    `sw-req` overlay (with `polarion_id` / `polarion_status` / `asil`
    additions and the required `derived-from` link-field with
    target-types verbatim from `rivet schema show`), and the
    `sw-req -> system-req -> stakeholder-req` stub-parent chain
    explained.
  - New "Common gotchas" appendix G.1 - G.7: LSP overlay blindness,
    overlay merge field-drop, forward/inverse link-type direction,
    doc vs artifact refs, `imported-stub` honesty, lifecycle severity
    scaling intent, `rivet schema show` preset locality.
  - Wall-time wins (round 3 dogfood vs round 1): STPA bring-up went
    from 13 min to 36 sec; Polarion -> ASPICE overlay went from 7 min
    to 3.8 min.

Workspace, vscode-rivet, and npm root package versions bumped to
0.5.1. Platform packages stay on the release-npm.yml override path.

Verified: cargo check, cargo clippy --workspace -- -D warnings,
cargo test -p rivet-cli, `rivet init --preset aspice && rivet validate`
returns PASS, `rivet docs mcp` prints the new topic,
`rivet mcp --list-tools` produces a 15-tool catalog,
`rivet mcp --probe` returns artifacts.

## [0.5.0] — 2026-04-27

Theme: oracle-gated agent pipelines + restored formal-method backstops +
mutation testing as a hard signal. The agent-first pillar (CLI + MCP +
LSP) now has a documented oracle-driven workflow (Mythos slop-hunt), an
external-coverage consumer (witness coverage), and a 16-shard mutation
matrix that surfaced and killed ~125 surviving mutants across the core
crate. Verus and Rocq verification jobs are fully restored, the
dashboard's variant scoping is coherent across all eight relevant
handlers, and `rivet docs check` no longer silently passes on
non-rivet markdown that drifted into a scanned directory.

### Added

- **README rewrite + `rivet quickstart`** — new oracle-gated 10-step
  walk-through (`rivet docs quickstart` or the `rivet quickstart`
  alias). Each step has a deterministic oracle command + expected
  output so an AI agent can follow the doc autonomously. README now
  leads with the three-pillar synthesis (typed atoms, oracle-gated
  agents, agent-first form factor) instead of a feature list.
- **Mythos slop-hunt agent pipeline** — `scripts/mythos/{rank,discover,validate,emit}.md`
  + `HOWTO.md`. Four-prompt audit adapted from Anthropic's red-team
  scaffold. Hunts dead code, duplicate parsers, and untraceable
  modules. Excision-primary / trace-interpretive oracle. (#205)
- **Agent-pipelines schema block** — `agent-pipelines:` per-schema
  declaration of which oracles apply, how to rank gaps, and what
  closure routing applies. Surfaced through `rivet pipelines list` /
  `rivet pipelines show` / `rivet close-gaps`. (#205)
- **CoverageStore** — typed witness-coverage consumer for external
  coverage-evidence files. Lets `rivet validate` and `rivet coverage`
  ingest tarpaulin/llvm-cov-style evidence as first-class artifacts
  with module digests, run metadata, and per-module summaries. (#208)
- **Variant scoping for 8 dashboard handlers** —
  `?variant=<name>` query parameter is now honoured uniformly across
  `/artifacts`, `/coverage`, `/stpa`, `/matrix`, `/stats`, `/graph`,
  `/source`, and `/diagnostics`. Closes the incoherence flagged in the
  PR #215 audit. (#223)
- **Docs warn-or-allowlist** — `rivet docs check` now surfaces non-rivet
  markdown files that drifted into a scanned directory under
  `rivet.yaml: docs:`. Default is `warn`; `rivet.yaml:
  docs-check.allowlist` flips specific paths back to silent. Resolves
  Task #56 — files like vendor docs no longer break the gate but no
  longer hide either. (#224)
- **10 new Playwright rendering-invariant tests** — coverage of the
  full route surface, with explicit `.svg-viewer` wrap pins, mermaid
  inline-render assertions, and graph-route timeouts validated. (#215)

### Changed

- **Mutation testing — 16-shard `rivet-core` matrix, 30 s timeout** —
  CI now shards the rivet-core mutation run across 16 jobs with a 30 s
  per-mutant timeout (down from 90 s). The shard reduction surfaced
  ~125 previously-untested mutants; PR #218 + #221 added ~64 new tests
  to kill them across `embed`, `reqif`, `validate`, `commits`,
  `coverage_evidence`, `compliance`, `convergence`, `links`, and
  `store`. Net effect: mutation run is faster *and* the kill rate is
  higher. (#218, #221)
- **Verus verification fully restored** — corrected `vstd` lemma paths
  after upstream rename, replaced `matches!` macros with `is`
  operators, fixed `lemma_div_multiples_vanish` invocation, added
  `#[trigger]` annotations to backlink-symmetry / reachable-in
  quantifiers, eliminated mid-quantifier in multi-step reachable case,
  cast nat→int in `lemma_div_is_ordered`. 15 specs proven. (#212)
- **Rocq proofs fully restored** — restored `Validation.v` import,
  replaced every `Admitted.` with a real proof. Schema and validation
  semantics now machine-checked end-to-end. (#210)
<!-- rivet-docs-check: ignore UNKNOWN-999 -->
- **Serve middleware preserves response status** —
  `wrap_full_page` was unconditionally rewriting downstream
  4xx/5xx responses to 200. Status is now preserved through the
  full-page wrapper so `/artifacts/UNKNOWN-999` correctly returns
  HTTP 404, etc. (#213)
- **Dashboard `/embed/*` route mounting** — moved under `Router::nest`
  so the embed routes inherit the same middleware stack as the rest of
  the dashboard (auth, layout-wrap exclusion, CSP). (#218)

### Fixed

- **Playwright suite green (384 passed)** — closed the remaining 8
  dashboard test failures (description-mermaid wrap, graph-render
  timeout, source-browser cross-reference, doc-linkage reverse index,
  variant-banner persistence). (#211, #213, #215, #217, #220)
- **Graph-route per-test timeout** — bumped 30 s → 60 s for slow CI
  runners; the layout engine occasionally exceeded the old budget on
  the larger test fixture. (#214)
- **`cargo fmt` drift** in mutation-test additions cleaned up. (#219)
- **CI**: Kani PR-smoke wiring, mutation shard config, Verus log
  upload. (#209)

### Tests

- **+10 Playwright rendering-invariant tests** — pin the
  `.svg-viewer` wrap, mermaid inline rendering, and graph-route
  timeouts. (#215)
- **+~64 rivet-core unit tests** killing surviving mutants across
  `embed`, `reqif`, `validate`, `commits`, `coverage_evidence`,
  `compliance`, `convergence`, `links`, `store`. (#218, #221)
- **CoverageStore unit + integration tests** — round-trip + summary
  invariants on witness coverage. (#208)

### Distribution

- **Workspace version bump** to `0.5.0` in `Cargo.toml`. The
  `rivet-cli`, `rivet-core`, and `etch` crates inherit via
  `version.workspace = true`.
- **VS Code extension** `vscode-rivet/package.json` bumped to `0.5.0`.
- **npm root package** `@pulseengine/rivet` bumped to `0.5.0`. Platform
  package versions are filled in by the `release-npm.yml` workflow on
  tag.

### Status (v0.5.x in flight)

- **Variant tooling** — six open product questions tracked in
  `.rivet/mythos/variant-matrix-design.md` (matrix emission, t-wise
  sampling, attribute-schema scope, audit cardinality, CLI
  ergonomics, dashboard interplay).
- **Formal-method gaps** — three documented gaps in Verus coverage
  (variant solver completeness, salsa incremental fixpoint, ReqIF
  round-trip). The larger gale-style differential-testing bar is
  a follow-up release item.

## [0.4.3] — 2026-04-23

### `rivet variant` — build-system query surface and solve debugger

Three new subcommands complete the variant-scoped CLI surface
(`REQ-046`). Feature models can now carry typed `attributes:` per
feature, round-tripped through `solve()` and emitted into seven
different build systems — the same one variant YAML can configure
Cargo, CMake, Bazel, a C/C++ header, Make, shell env, or structured
JSON without divergent hand-written shims.

- `rivet variant features --format {json,env,cargo,cmake,cpp-header,bazel,make}`
  emits every effective feature plus its `attributes:` entries with long,
  namespaced identifiers (`RIVET_FEATURE_*`, `RIVET_ATTR_*`). Every format
  is **loud on failure** — a variant that violates a constraint exits
  non-zero with the violation list, never a partial emission.
  Non-scalar attribute values (lists/maps) only serialise through
  `--format json`; build-system formatters return `Error::Schema` rather
  than invent a silent flattening convention.

- `rivet variant value FEATURE` — shell-friendly single-feature probe with
  exit codes `0` (selected), `1` (unselected), `2` (unknown feature or
  variant fails to solve). Designed for `if rivet variant value … ; then …`.

- `rivet variant attr FEATURE KEY` — print one attribute value. Scalars
  print bare; list/map values print as JSON so shells can parse
  structurally.

- `rivet variant explain [FEATURE]` — dev/debug UX for "why did my
  variant pick/skip feature X?". Full audit mode prints every effective
  feature with its origin (`selected` / `mandatory` / `implied by <X>` /
  `allowed`), plus the unselected set and the full constraint list.
  Single-feature focus mode zooms on one feature and lists every
  constraint that mentions it.

Feature models gained an `attributes:` key per feature, parsed as
`BTreeMap<String, serde_yaml::Value>`. The shipped
`examples/variant/feature-model.yaml` now carries realistic metadata
(`asil-numeric`, `compliance`, `locale`) so the worked examples in
`docs/getting-started.md` run against the fixture and produce the
documented output.

Test coverage: 11 unit tests in `rivet_core::variant_emit::tests` for
per-format rendering, 15 integration tests in
`rivet-cli/tests/variant_emit.rs` for CLI end-to-end, exit-code
contract, loud-on-failure path, and the realistic-example smoke across
all seven formats.

### S-expression follow-ups

- `(> (count <scope>) N)` now lowers to a new `CountCompare` expr
  variant that evaluates the count against the store once and compares
  to an integer threshold. Previously the audit documented `(count …)`
  as "meant for numeric comparisons" but no lowering existed — you
  could only use it as a standalone predicate. Every comparison operator
  (`>`, `<`, `>=`, `<=`, `=`, `!=`) now accepts a `(count …)` LHS with
  an integer RHS.

- `(matches <field> "<regex>")` validates the regex at lower time
  instead of silently returning `false` at runtime on malformed
  patterns. Closes the "mysterious empty result" footgun — typing
  `(matches id "[")` used to match nothing and cost debug time; now it
  produces a parse error with the compiler's message. Non-literal
  patterns (rare; from field interpolation) still use the runtime-lenient
  path.

- `docs/getting-started.md` gains dedicated sections for count
  comparisons and regex validation, plus a note that dotted accessors
  like `links.satisfies.target` are not supported — use the purpose-built
  `linked-by` / `linked-from` / `linked-to` / `links-count` predicates.

### Rivet Delta CI action — SVG render for email/mobile

`rivet-delta.yml` workflow now pre-renders the summary Mermaid diagram
to SVG and pushes it to an orphan `rivet-delta-renders` branch, so email
notifications and the GitHub mobile app show the diagram inline instead
of a `<mermaid>` text block that nothing except the web UI can render.
Classification-priority ordering in `scripts/diff-to-markdown.mjs` is
also fixed so multi-label changes (`breaking` + `additive` → `breaking`)
pick the most severe.

### Stamp command

- `rivet stamp all --missing-provenance` filter now correctly checks the
  first-class `provenance:` struct field (previously it looked for a
  `provenance` entry in generic `fields:` and was therefore a no-op).
- `set_provenance` no longer aborts the whole batch on a single
  CST-invisible artifact; it warns and skips that one artifact and
  continues.

### Safety-Critical Rust Consortium (SCRC) clippy escalation — Phase 1

Follow-up to the v0.4.2 commitment recorded in `DD-058`. The full
restriction-lint family is now declared at `warn` in
`[workspace.lints.clippy]`; new call sites in any workspace crate that
trip one of these lints will surface in CI. The 5,204 pre-existing
violations across 95 files are grandfathered in via file-scope
`#![allow(...)]` annotations, each stamped with a `SAFETY-REVIEW`
rationale tying back to `DD-058`. See `artifacts/v043-artifacts.yaml`
(`DD-059`) for the per-lint disposition and follow-on plan.

Lints now declared workspace-wide (all at `warn` with per-site opt-in
allow blocks):

- `unwrap_used`, `expect_used`
- `indexing_slicing`, `arithmetic_side_effects`
- `as_conversions`, `cast_possible_truncation`, `cast_sign_loss`
- `wildcard_enum_match_arm`, `match_wildcard_for_single_variants`
- `panic`, `todo`, `unimplemented`, `dbg_macro`
- `print_stdout`, `print_stderr`

`cargo clippy --all-targets --workspace -- -D warnings` exits 0.
`cargo test --workspace` stays green (all 36 test binaries pass).
`rivet docs check` stays PASS.

Phase 2 (tracked as DD-060) will walk the grandfathered file-scope
allows and either rewrite them to non-lint form or replace them with
per-site `#[allow(...)]` annotations carrying inline rationales.

## [0.4.2] — 2026-04-23

<!-- rivet-docs-check: ignore SEC-AS-001 -->

This release closes 18 silent-accept findings discovered through dogfooding
plus a customer bug-hunt pass. Theme: every place where invalid input used
to silently succeed now surfaces a typed error or warning. Most are tiny
behavioural changes; the cumulative effect is a much louder pipeline.

### Correctness fixes (silent-accept antipattern)

- **Required-link cardinality silently passed on flow-style YAML** —
  `links: [{type: X, target: Y}]` parsed without error but the cardinality
  counter saw zero, so a "required" link could be entirely absent and
  `rivet validate` still returned PASS. Same hole for the named-field form
  `targets: [SEC-AS-001]` derived from a schema's `link-fields[].name`. Both
  shapes now produce identical `Vec<Link>` and the cardinality counter sees
  them. (issue #3)
- **Schema link-fields referencing undeclared link types** were emitted as
  `Warning` from `rivet validate` (overall result still PASS) and silently
  tolerated at schema load. Now `Error` with one diagnostic per
  `(artifact, link-type)` pair, plus a new `Schema::validate_consistency()`
  for fail-fast load-time checks. (issue #1)
- **`{{group:TYPE:FIELD}}` two-arg form** discarded the second arg, treating
  the type name as the field — every artifact bucketed into `"unset"`.
- **`{{query (...) :limit 10}}`** colon-prefixed options were silently
  dropped because the parser only recognised `key=value`. Now rejected with
  a hint pointing to the correct syntax. New `fields=id,title,asil` option
  customises columns.
- **`{{coverage:typo-rule}} / {{matrix:UnknownType:Y}} / {{diagnostics:warnings}}`**
  all rendered blank or all-results when given typo'd arguments. Each now
  errors with a list of valid values.
- **Standalone `{{artifact|links|table:…}}` on its own line** wrapped in
  `<p>` producing invalid HTML nesting. Block-level embeds now emit
  directly.
- **`#[serde(deny_unknown_fields)]`** added to every schema-author struct
  (`SchemaFile`, `SchemaMetadata`, `ArtifactTypeDef`, `FieldDef`,
  `LinkFieldDef`, `LinkTypeDef`, `TraceabilityRule`, `ConditionalRule`,
  `MistakeGuide`, `AlternateBacklink`) plus the artifact-level `Link` and
  `Provenance` structs. Typo'd YAML keys now error at load time instead of
  being silently dropped. New `LinkFieldDef.description` and
  `TraceabilityRule.alternate_backlinks` to surface fields the bundled
  schemas were already using.
- **YAML CST parser** now handles inline `# comments` on mapping lines —
  the LSP previously emitted `expected mapping key, found Some(Comment)`
  on every CI workflow file. (issue #6b)
- **`rivet docs check`** now honors `rivet.yaml` `docs:` paths instead of
  only scanning the top-level `docs/` directory; projects with
  `crates/*/docs` or `rivet/docs` layouts no longer get silently skipped.

### LSP

- **LSP resolves workspace schemas** — was reading from the launching
  process's CWD. User-extended schema files referenced via
  `rivet.yaml: schemas:` now load correctly. (issue #6a)

### Dashboard / UI

- **Artifact detail page** lists the documents that `[[ID]]`-reference it
  (reverse index — closes the loop on the existing forward `/doc-linkage`
  view).
- **Mermaid + AADL diagrams** on artifact detail and `schema/show` pages
  now wrap in `.svg-viewer` so they get the same zoom / fullscreen / popout
  toolbar as graph and doc-linkage views. Parity test in
  `diagram-viewer.spec.ts` pins the invariant.
- **Document headings** carry stable `id="…"` slugs so in-page TOC links
  and `#anchor` URLs navigate. (B1)
- **Variants in the dashboard** are now documented in `getting-started.md`
  and `what-is-rivet.md`. The auto-discovery convention, sidebar entry,
  header dropdown and `/variants` overview are spelled out.

### Documentation invariants

- **External-namespace exemption** for `ArtifactIdValidity`. Three layers
  to escape the `[A-Z]+-NNN`-pattern check when the prose legitimately
  references external IDs (Jira, Polarion, hazard catalogs):
  - `rivet.yaml: docs-check.external-namespaces: [GNV, GNR, HZO, UC]`
  - `rivet.yaml: docs-check.ignore-patterns: [<regex>]`
  - HTML-comment directives: `<!-- rivet-docs-check: ignore GNV-396 -->`
    or `<!-- rivet-docs-check: ignore-line -->`.
- **AGENTS.md template** now ships an `ignore SC-1 REQ-001 FEAT-042`
  directive so a fresh `rivet init && rivet docs check` doesn't fail on
  its own example IDs. (issue #2)
- **`AUDIT:` marker syntax** documented for the `ArtifactCounts`
  invariant.
- **`conditional-rules:` worked example** in `getting-started.md`.
- **`<!-- BEGIN/END rivet-managed -->` contract** documented for
  `rivet init --agents`. Content outside the markers is preserved across
  regeneration.

### CLI

- **`rivet stamp` batch flags**: `--type PATTERN` (glob or exact type),
  `--changed-since REF` (git-aware), `--missing-provenance`. No more
  `xargs` loops to stamp a batch of artifacts. (issue #4)
- **`rivet init --agents --force-regen`** now requires `--yes` to confirm
  the destructive overwrite. The flag was previously one accidental
  trigger away from destroying a hand-written AGENTS.md.
- **`rivet embed artifact:X / links:X / table:T:F`** error message now
  explains why the embed only renders inside markdown documents instead
  of the cryptic "handled inline" string.

### Looking ahead — Safety-Critical Rust roadmap

The next planned release will start a workspace-wide clippy lint
escalation aligned with the Safety-Critical Rust Consortium guidelines:
`unwrap_used`, `expect_used`, `indexing_slicing`,
`wildcard_enum_match_arm`, `as_conversions`, `arithmetic_side_effects`,
and `print_stdout` / `print_stderr` outside the CLI binary. Each lint
will be enabled at `warn` first with per-site `allow` annotations
carrying a `// SAFETY-REVIEW:` rationale, then escalated to `deny` once
the backlog is drained. A later release will raise the `rivet-core`
coverage gate from 40% → 70% and flip mutation testing to a hard gate.

The eight commits in this release already implement the SCRC pattern
"no silent acceptance of malformed input" empirically — the lint
escalation makes the same discipline mechanical.

## [0.4.1] — 2026-04-22

### Correctness fixes (HIGH)

- **`rivet variant check` silently passed on cross-tree constraint violations** — `(implies X (not Y))` with both selected returned `Ok` because the solver only propagated bare-feature consequents and never evaluated compound expressions. Added a generic `eval_constraint` pass after propagation with proper propositional semantics (#156)
- **`rivet validate` (salsa default mode) silently dropped AADL + external artifacts** — non-YAML adapter sources (`aadl`/`reqif`/`needs-json`/`wasm`) fell through a `log::debug!` in `run_salsa_validation`, so every link into them was a phantom broken-link. Users had to pass `--direct` to get correct results. New `ExtraArtifactSet` salsa input + `_with_extras` query variants; default and `--direct` modes now produce identical diagnostic counts (#157)

### Silent-accept bugs fixed (from Mythos discovery + YAML fuzzer)

- **`yaml_hir.rs`**: null/`~`/empty shorthand-link values no longer emit phantom `Link { target: "null" }` (#168)
- **`formats/generic.rs`**: `GenericFile` now rejects unknown top-level keys (`artifact:` typo → error instead of silent `Ok(vec![])`) (#168)
- **`coverage.rs`**: self-satisfying links (`DD-001 → DD-001`) no longer inflate coverage (#168)
- **`validate.rs` + `coverage.rs`**: empty `from_types`/`target_types` on `TraceabilityRule` unified to "match any" semantics — was contradictory between the two reports (#168)

### ReqIF fidelity (6 round-trip bugs)

- **Provenance** (`created-by`, `model`, `timestamp`, `reviewed-by`, `reviewed-timestamp`) now round-trips via `rivet:*` string attributes — was unconditionally dropped (#175)
- **Non-string `fields` values** encoded typed (bool/number/list/mapping) — was `format!("{:?}", …)` garbage (#175)
- **Tags** serialized as JSON array with comma/whitespace safety (#175)
- **CREATION-TIME** header stamped with ISO 8601 UTC — was hardcoded empty (#175)
- **`DATATYPE-DEFINITION-ENUMERATION`** emitted when schema declares `allowed-values:` (opt-in via `ReqIfAdapter::with_schema`) (#175)
- **Dangling `SPEC-RELATION` targets** rejected with `Error::Adapter` — was silent phantom-link creation (#175)

### New features

- **`rivet variant init <name>`** — scaffolds `feature-model.yaml` + `bindings.yaml` with commented starter config (#174)
- **`rivet variant check-all --model M --binding B`** — iterates every declared binding; exits 0 iff all pass (#174)
- **`rivet validate --fail-on <error|warning|info>`** — configurable exit-code gate (#177)
- **`rivet coverage --fail-under N`** — CI gate on overall coverage (#177)
- **`rivet query --sexpr "..."`** — CLI mirror of MCP `rivet_query` (#180)
- **`rivet docs embeds`** — lists every registered embed token with signature + example (#180)
- **`rivet docs check`** — 8-invariant doc-vs-reality release gate (required CI + release job) (#178)
- **`rivet schema list-json` / `get-json`** — JSON schemas for CLI outputs (`validate-output`, `stats-output`, `coverage-output`, `list-output`) (#177)
- **Serve dashboard: variant selector + `/variants` overview + per-route filtering** — `?variant=<name>` on `/artifacts`, `/coverage`, `/stpa`, `/matrix`, `/stats`. Banner when filter active. (#179)
- **Embeds**: `{{query:(sexpr)}}`, `{{stats:type:NAME}}`, `{{group:FIELD}}` (#180)
- **Mermaid renders inline** in artifact descriptions (pulldown-cmark event-mapper) (#180)
- **Managed-section markers** for `rivet init --agents` — AGENTS.md/CLAUDE.md regen preserves content between `<!-- BEGIN rivet-managed -->` markers; `--migrate` and `--force-regen` flags for existing files (#167)

### Distribution

- **npm**: `@pulseengine/rivet` with per-platform `optionalDependencies` (linux x64/arm64, darwin x64/arm64, win32 x64). Publishes on tag with `NPM_TOKEN`. Enables `npx @pulseengine/rivet mcp` for Claude Code MCP integration (#166)
- **VS Code extension**: VSIX now attached to every GitHub Release; Marketplace publish wired correctly (previous `release-results` dependency pointed at a non-existent job in a different workflow — that's why the extension never shipped to Marketplace before) (#163)

### Developer ergonomics

- **Pre-commit hook**: marker discovery (walks up for `rivet.yaml`) — survives `rivet.yaml` relocation (#174)
- **`FilterError` messages**: semantic notes ("expected s-expression form: `(implies A B)`; got infix") on common user-error shapes (#174)
- **`rivet variant solve` output**: distinguishes `UserSelected` / `Mandatory` / `ImpliedBy(name)` / `Allowed` origins (#174)
- **Search URL persistence**: Cmd+K overlay now pushes `?cmdk=<q>` via `history.replaceState`, reload preserves (#159)

### Documentation

- `docs/what-is-rivet.md` — positioning doc in the v0.1.0 blog cadence (Problem → Answer → Evidence per use-case). README intro rewritten (#172)
- `docs/design/doc-reality-audit.md` — one-time register of 28 doc-vs-reality mismatches (#171)
- `docs/design/ai-evidence-trend-research.md` — competitive landscape; top-3 parallels (pharaoh, Continue.dev, SpecStory); EU AI Act / ISO/IEC 42001 / safety-standards update drivers (#173)
- `docs/design/ai-safety-cyber-hitl.md` — "AI proposes, qualified human owns judgment" frame + 4-point HITL contract + FAQ (#176)
- `docs/design/iso26262-artifact-mapping.md` — gap register (32.5% EXACT / 42.5% APPROX / 25% ABSENT) (#164)
- `docs/design/polarion-reqif-fidelity.md` — field-by-field fidelity for Polarion REST vs ReqIF paths (#169)
- `docs/design/sexpr-artifact-format.md` — Option-A-through-D cost analysis for s-expr as second format (#162)
- `docs/design/cli-gaps-2026-04.md` — 5 missing CLI features + ranked backlog (#161)
- `docs/design/release-channels.md` — npm/brew/cargo/docker/Marketplace distribution plan (#166)
- `docs/feature-model-schema.md` + `docs/feature-model-bindings.md` — feature-model YAML reference (#174)

### Testing

- **YAML footgun fuzzer**: 3 libfuzzer targets + `oracle_smoke` harness. 5 empirical silent-accept bugs found on the v0.4.0 corpus before fixes landed (#160)
- **Docs-check gate** now required on every PR + release tag (#178)

### Dependencies
- `rustls-webpki 0.103.12` (RUSTSEC-2026-0098 / 2026-0099); `thin_vec` UAF (RUSTSEC-2026-0103) ignored via deny.toml (transitive via `salsa 0.26.0`, no direct use)

## [0.4.0] — 2026-04-19

### Features

- **Verification pyramid** — STPA-Sec test suite (16 tests), differential YAML parsing (rowan vs serde_yaml), operation-sequence property tests, Kani BMC expanded from 15 to 27 harnesses covering the core public API, Verus/Rocq jobs wired into CI via Bazel (#150)
- **Variant / Product-Line Engineering** — feature-model schema, constraint solver, `rivet variant check/list/solve`, s-expression query language with forall/exists quantifiers and reachable graph traversal
- **Zola static-site export** — multi-project filtered export with `--prefix` namespacing, wiki-link resolution, JSON data files, TOML escaping
- **Sphinx-needs JSON import adapter** — migration path from sphinx-needs projects
- **LSP code actions** — quick-fix for missing-link diagnostics
- **MCP CRUD + integration tests** — query, modify, link, unlink, remove
- **AI-in-the-loop STPA + security analysis**
- **`rivet validate --variant`** — variant-scoped validation
- **EU AI Act runtime evidence**

### Fixes

- **STPA extraction** — suffix-based UCA discovery (e.g. `*-ucas` sections) and nested `control-actions` inside controllers; previously 0 control-action artifacts on real STPA projects, now extracted correctly (#150)
- **`rivet-core` unwrap hardening** — 12 production `unwrap()` sites replaced with safe `let Some(_) = _ else` patterns in validate, matrix, diff, mutate
- **Zola export** — TOML escaping, title fallback, date handling, mermaid block rendering
- **Playwright regressions** — coverage-view strict-mode violation, control-action title assumptions, `/graph` timeout handling (#151)
- **Deps** — rustls-webpki 0.103.12 (patches RUSTSEC-2026-0098 / -0099) (#151)
- **Clippy** — junit.rs `collapsible-match` from Rust 1.95 (#151)
- **Tool qualification** — STPA, requirements, MCP audit, regex bounds, `export --clean`, import verification

### Testing

- **27 Kani BMC harnesses** — up from 15, covering commit parsing, artifact IDs/ranges, trailer parsing, store upsert, diff, validation guards, markdown render, HTML strip
- **Differential YAML parser tests** — 6 tests comparing the rowan parser against serde_yaml for equivalence
- **Proptest operation sequences** — 3 tests fuzzing random insert/upsert/validate sequences against store invariants
- **Dual-crate mutation testing** — rivet-cli now covered alongside rivet-core, 40-minute CI timeout

### CI

- **Kani job enabled** — previously commented out
- **Verus + Rocq jobs** — added via Bazel (marked `continue-on-error: true` pending toolchain stabilization)
- **CLI mutation testing** — added alongside core

## [0.2.0] — 2026-03-21

### Features

- **LSP server** (`rivet lsp`) — language server with diagnostics, hover, go-to-definition, and completion for artifact YAML files; re-validates on file save (#58, #60, #61)
- **Baseline-scoped validation** — `--baseline v0.1.0` flag on validate, list, stats, coverage, export scopes to named artifact sets (#58)
- **STPA-Sec security analysis** — 31 adversarial threat artifacts (5 losses, 6 hazards, 6 constraints, 7 UCAs, 7 scenarios) with dashboard section (#45)
- **Eclipse SCORE schema** — 40+ artifact types mapping the SCORE metamodel for safety-critical automotive/embedded development (#61)
- **Self-contained binary** — HTMX, Mermaid, and Google Fonts bundled via `include_str!`; no CDN dependencies (#45)
- **Dashboard filter/sort/pagination** — `?types=`, `?q=`, `?sort=`, `?dir=`, `?per_page=`, `?page=` on `/artifacts` and `/stpa` (#52)
- **AADL compound graph layout** — nested `aadl-component` containers rendered via Etch compound layout engine (#45)
- **HTML export: STPA + graph pages** — static STPA hierarchy and SVG traceability graph in export output (#45)
- **Document-to-document references** — `[[DOC-ID]]` in document bodies resolves to `.doc-ref` links (#45)
- **`rivet init --agents`** — generates project-aware AGENTS.md (universal AI agent instruction standard, 25+ tools) (#59)
- **`rivet batch`** — atomic multi-mutation files for bulk artifact operations (#43)
- **`rivet add --link`** — add links inline when creating artifacts (#42)
- **`--format json` on validate and coverage** — machine-readable output for all query commands (#43)
- **Cross-repo fixes** — `rivet link` with externals, `--skip-external-validation`, `rivet sync --local` (#45)
- **Reusable UI components** — ViewParams, FilterBar, Pagination, SortableTable extracted to `components.rs` (#56)
- **Startup update check** — non-blocking background thread checks GitHub releases once per 24h (#56)
- **8 new ARCH components** — phase-3 requirements now have architecture allocation (#56)
- **WASM stubs in build.rs** — `--features embed-wasm` removed; build.rs generates stubs automatically (#50)
- **Etch rendering** — port-aware layout, orthogonal routing, interactive HTML, SVG edge render order fixes (#37, #53, #55)

### Security

- **Mermaid `securityLevel: strict`** — prevents XSS via crafted Mermaid diagrams (#61)
- **SSC-3: localhost default** — dashboard binds to 127.0.0.1 by default, warns on 0.0.0.0 (#52)
- **SSC-6: YAML document-size limit** — 10 MB limit in generic and STPA adapters prevents DoS (#52)
- **CSP `font-src data:`** — allows base64-embedded fonts without CSP violations (#47)
- **HTML escaping** — wiki-link IDs, source file refs, results view fields all properly escaped (#61)
- **WASM graceful fallback** — HEAD probe, no console error spam when spar WASM unavailable (#48, #49)

### Performance

- **7.8x store insert speedup** — O(n²) `contains()` → O(1) direct insert (#58)
- **Regex pre-compilation** — conditional validation rules compile regex once, not per-artifact (#58)
- **Zero-copy field reads** — `Cow<str>` for `get_field_value` eliminates unnecessary clones (#58)
- **Cached diagnostics** — `page_layout()` uses cached results instead of recomputing per page view (#61)

### Testing

- **235+ Playwright E2E tests** across 22 spec files covering all routes (#45, #51, #54, #62)
- **Playwright CI job** — runs after unit tests, builds release binary, installs Chromium (#45)
- **Audit regression tests** — 17 tests for security, performance, edge cases, consistency (#62)
- **Mutation testing** — 0 missed mutants in rivet-core (#63)
- **Coverage fixes** — 27 new tests for store, schema, model patch coverage (#60)
- **324 `// rivet: verifies` markers** across 22 source files for test scanner (#52)

### Fixes

- **Navigation `href="#"` eliminated** — all 65 occurrences replaced with real paths (#46)
- **`/assets/*` excluded from layout middleware** — HTMX/Mermaid JS served correctly (#47)
- **Print button** — `new URL()` replaced with string concat, mermaid.js added to print layout (#51, #57)
- **UTF-8 string slicing** — `&title[..26]` → `chars().take(26)` prevents panic on multi-byte chars (#61)
- **Serve integration test timeout** — 5s → 15s for slow CI runners (#45)

### V-Model & Traceability

- **0 lifecycle coverage gaps** — DD-036–039, FEAT-064–065, TEST-011–015 close all holes
- **3 structural gaps closed** — REQ-003 → FEAT-016, REQ-009 → FEAT-014, REQ-022 → DD-039
- **447 artifacts**, validate PASS, 0 warnings

### Infrastructure

- **7 stale branches deleted** — clean branch list (main, gh-pages only)
- **Pre-commit config** — large asset exclusion for mermaid.min.js and fonts.css

## [0.1.0] — 2026-03-14

Initial release. See git history for details.
