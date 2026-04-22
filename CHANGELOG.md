# Changelog

<!-- AUDIT-FILE: verified 2026-04-22 — all numeric counts in this file
     are historical snapshots taken at release time, not current state. -->

## [Unreleased]

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
