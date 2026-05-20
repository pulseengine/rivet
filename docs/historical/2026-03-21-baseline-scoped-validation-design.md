# Baseline-Scoped Validation Design

**Date:** 2026-03-21
**Status:** Draft
**Artifacts:** [[REQ-021]], [[REQ-024]], [[FEAT-036]], [[FEAT-041]], [[DD-016]], [[DD-019]]

## Problem

Rivet currently validates all artifacts as a single flat set. When a project
evolves across releases (v0.1.0, v0.2.0, ...), there is no way to say:

> "All artifacts committed to baseline v0.1.0 are fully linked and validated.
> Artifacts planned for v0.2.0 may still have gaps -- that is expected."

Today, `rivet validate` reports warnings for every artifact that lacks
downstream traceability, including artifacts deliberately scoped for a
future release. This makes validation noisy and masks real problems in the
current release scope.

The existing `phase` field on features (values: phase-1, phase-2, phase-3,
future) is an informal workaround. It lives only on `feature` artifacts, is
not schema-enforced across types, and has no integration with the validation
engine, coverage computation, or export pipeline.

The existing `rivet baseline verify` command checks for git tag presence
across repos (DD-016) but does not scope validation to the artifacts in that
baseline.

## Prior Art

### sphinx-needs

sphinx-needs stores versioned snapshots of all needs in `needs.json`, keyed
by the documentation version from `conf.py`. Each build appends a new
version entry. Comparison happens post-hoc by diffing two version snapshots.
There is no per-artifact baseline field or selective validation -- all needs
in a build are validated equally.

Limitations: no concept of "this need ships in v2.0 so skip it for v1.0
validation." Impact analysis (issue #685) is aspirational, not implemented.

### Eclipse SCORE

SCORE's process description (SUP.8, SUP.10) requires configuration baselines
and change request traceability. Their toolchain uses sphinx-needs with a
`known_good.json` manifest for cross-repo pinning. Baselining is at the
repository level (git tags), not at the artifact level. They face the same
gap: no way to scope validation to a release subset.

### Industry Standard (ASPICE SUP.8 / ISO 26262 Part 8)

A **configuration baseline** is a formally approved set of configuration items
at a point in time. Baselines are snapshots, not filters -- all items in the
baseline must be consistent and complete. A new baseline is created for each
release milestone. Items not yet in a baseline are "work in progress" and
are excluded from baseline validation.

## Design

### Core Concept: Baselines as Named Artifact Sets

A **baseline** is a named set of artifact IDs representing a release scope.
Each artifact declares which baseline(s) it belongs to via a `baseline` field.
Validation, coverage, and export can then be scoped to a specific baseline.

Key properties:
- An artifact can belong to multiple baselines (e.g., REQ-001 ships in
  both v0.1.0 and v0.2.0 because v0.2.0 is a superset).
- Baselines are **cumulative by default**: v0.2.0 includes everything in
  v0.1.0 plus new artifacts. This matches how software releases work.
- The baseline name is a free-form string, but convention is semver
  (v0.1.0, v0.2.0) or milestone names (mvp, ga).
- Baselines are distinct from git tags but can be cross-referenced:
  `rivet baseline verify v0.1.0` checks that the git tag `baseline/v0.1.0`
  exists and that all artifacts in the v0.1.0 baseline are present at that
  commit.

### Baseline Configuration in rivet.yaml

```yaml
project:
  name: rivet
  version: "0.1.0"
  schemas:
    - common
    - dev
    - aadl
    - stpa

baselines:
  v0.1.0:
    description: "Phase 1+2: core validation, schemas, dashboard, CLI"
    # Cumulative: false means only explicitly listed artifacts.
    # Cumulative: true (default) means "all artifacts from prior baselines
    # plus anything tagged with this baseline."
    cumulative: true
    # Optional: link to git tag for cross-referencing
    git-tag: baseline/v0.1.0

  v0.2.0:
    description: "Phase 3: commit traceability, cross-repo, mutation"
    cumulative: true
    git-tag: baseline/v0.2.0
```

**Why baselines are in rivet.yaml, not a separate file:**
Baseline definitions are project-level metadata, like schemas and sources.
They evolve with the project and should be version-controlled alongside
the artifact sources. A separate `baselines.yaml` file adds indirection
without benefit.

### Artifact Field: `baseline`

Every artifact type gains an optional `baseline` field. This is a common
base field (like `status` and `tags`), not a per-type schema field.

```yaml
artifacts:
  - id: REQ-001
    type: requirement
    title: Text-file-first artifact management
    status: approved
    baseline: v0.1.0          # Ships in v0.1.0
    # ...

  - id: REQ-020
    type: requirement
    title: Cross-repository artifact linking
    status: approved
    baseline: v0.2.0          # Ships in v0.2.0
    # ...
```

**Rules:**
- `baseline` is a string (not a list). An artifact belongs to the named
  baseline and all subsequent cumulative baselines.
- If `baseline` is omitted, the artifact is "unscoped" -- included in
  full validation but excluded from baseline-scoped validation.
- The `baseline` field is optional and defaults to `null`.

**Why a single string, not a list:**
In a cumulative model, an artifact only needs to declare the *first*
baseline it ships in. If v0.2.0 is cumulative on v0.1.0, then an
artifact with `baseline: v0.1.0` is automatically in v0.2.0. This is
simpler to maintain and matches how release scoping works in practice.
You add an artifact to the current milestone; you do not re-tag it for
every future milestone.

### Baseline Ordering

Baselines have an implicit ordering derived from their declaration order
in `rivet.yaml`. The first declared baseline is the earliest; subsequent
baselines are later. This ordering is used for cumulative inclusion:
`v0.2.0` includes all artifacts from `v0.1.0` because v0.1.0 is declared
before v0.2.0.

```yaml
baselines:
  v0.1.0: { ... }    # order 0
  v0.2.0: { ... }    # order 1 -- includes v0.1.0 artifacts
  v1.0.0: { ... }    # order 2 -- includes v0.1.0 + v0.2.0 artifacts
```

**Alternative considered:** Explicit `includes: [v0.1.0]` chains. Rejected
because it is redundant when baselines are almost always linear progressions.
If non-linear baselines are needed later (e.g., a hotfix branch that
cherry-picks from v0.2.0 but not all of it), an explicit `includes` field
can be added as an opt-in override.

### Artifact Resolution for a Baseline

Given baseline `B` at position `P` in the ordered baseline list:

1. Collect all artifacts where `baseline` is set to `B` or to any baseline
   at position `< P` (i.e., earlier baselines).
2. If `B.cumulative` is false, collect only artifacts where `baseline == B`.
3. Artifacts with no `baseline` field are **excluded** from scoped
   validation.

```
resolve_baseline("v0.2.0", cumulative=true):
  return artifacts where baseline in {"v0.1.0", "v0.2.0"}

resolve_baseline("v0.1.0", cumulative=true):
  return artifacts where baseline == "v0.1.0"
```

### Validation Scoping

#### `rivet validate --baseline v0.1.0`

When `--baseline` is specified:

1. **Resolve the artifact set** for the named baseline (see above).
2. **Build a scoped Store** containing only those artifacts.
3. **Build the link graph** from the scoped store. Links to artifacts
   outside the baseline are treated as **external references** (not
   broken links). This is critical: a v0.1.0 artifact may link to a
   v0.2.0 artifact via `satisfies`, and that link is valid but the
   target is outside the current baseline scope.
4. **Run structural validation** (phases 1-7) against the scoped store.
5. **Run traceability rule checks** only for artifacts in the scoped set.
   A requirement in v0.1.0 must have its `satisfies` backlinks from
   features **also in v0.1.0** (or earlier baselines).
6. **Run conditional rules** against the scoped set.
7. **Report coverage** as percentage of in-baseline artifacts that satisfy
   each traceability rule.

**Cross-baseline link semantics:**
- A link from an in-baseline artifact to an out-of-baseline artifact is
  **valid but not counted for traceability coverage**. It exists in the
  full graph but does not satisfy the "must have downstream in this
  baseline" requirement.
- A link from an out-of-baseline artifact to an in-baseline artifact is
  ignored (the source is not being validated).
- Broken links (target does not exist at all) are still errors regardless
  of baseline scope.

#### `rivet validate` (no baseline flag)

Unchanged behavior: validates all artifacts, all rules, full store. The
`baseline` field is simply ignored as a regular custom field.

#### Implementation Approach

The validation engine does not need to change internally. The scoping
happens at the **store construction** level:

```rust
/// Build a store containing only artifacts in the given baseline.
pub fn scoped_store(full_store: &Store, baseline: &str, config: &BaselineConfig) -> Store {
    let included_baselines = config.resolve_cumulative(baseline);
    let mut scoped = Store::new();
    for artifact in full_store.iter() {
        if let Some(bl) = artifact.baseline() {
            if included_baselines.contains(bl) {
                let _ = scoped.insert(artifact.clone());
            }
        }
    }
    scoped
}
```

The link graph, validator, coverage engine, and lifecycle checker all
operate on a `Store` -- they do not need to know about baselines. The
only change is building the store with the right subset of artifacts.

**Cross-baseline link handling** requires a refinement: when building
the scoped `LinkGraph`, links to out-of-scope artifacts should not be
recorded as broken links. This requires a small change to `LinkGraph::build`:

```rust
/// Build a link graph, treating missing targets that exist in
/// `full_store` as external (not broken).
pub fn build_scoped(scoped: &Store, schema: &Schema, full: &Store) -> LinkGraph {
    // ... same as build(), but when a link target is not in `scoped`
    // but IS in `full`, record it as an external reference rather
    // than a broken link.
}
```

### Coverage Scoping

`rivet coverage --baseline v0.1.0` computes coverage only over artifacts
in the named baseline. The denominator for each traceability rule is the
count of source-type artifacts *in the baseline*, not the full store.

This lets a project track per-release coverage:
- v0.1.0: 95% coverage (a few draft features not yet linked)
- v0.2.0: 80% coverage (new artifacts being developed)
- Full: 85% coverage (weighted average)

### Lifecycle Completeness Scoping

`check_lifecycle_completeness` currently checks all artifacts with
"traced" statuses (approved, implemented, done, accepted, verified).
With baseline scoping:

- Only artifacts in the baseline are checked.
- A requirement in v0.1.0 needs downstream features **also in v0.1.0**.
- A feature planned for v0.2.0 that satisfies a v0.1.0 requirement does
  NOT count as coverage for v0.1.0 baseline validation.

This is the key insight: **traceability completeness is evaluated within
the baseline boundary**, not across the full artifact set.

### Export Scoping

`rivet export --html --baseline v0.1.0` generates a compliance report
containing only artifacts in the named baseline. This produces a
self-contained release evidence package:

- Index page shows "Baseline: v0.1.0" in the header
- Requirements page lists only v0.1.0 requirements
- Coverage matrix shows only v0.1.0 traceability
- Validation results reflect only v0.1.0 rules
- Links to out-of-baseline artifacts are rendered as
  "external" (greyed out, with a note like "ships in v0.2.0")

The existing `config.js` version switcher (DD-038) naturally complements
baseline-scoped export: each version in the switcher corresponds to a
baseline export.

### Impact Analysis Integration

`rivet impact --baseline v0.1.0` restricts impact analysis to artifacts
in the baseline. When computing transitive impact, the graph walk stops
at the baseline boundary -- changes to v0.2.0 artifacts do not propagate
into v0.1.0 impact results.

### Dashboard Integration

The dashboard gains a baseline selector (dropdown in the header bar,
similar to the existing search). When a baseline is selected:

- Artifact list shows only in-baseline artifacts
- Graph view shows only in-baseline nodes (with out-of-baseline
  neighbors shown as faded ghost nodes)
- Coverage section shows baseline-scoped coverage
- Validation section shows baseline-scoped results
- Matrix view shows baseline-scoped traceability

The URL reflects the selection: `/artifacts?baseline=v0.1.0`

### CLI Interface Changes

New flags on existing commands:

```
rivet validate --baseline v0.1.0
rivet coverage --baseline v0.1.0
rivet list --baseline v0.1.0
rivet stats --baseline v0.1.0
rivet matrix --baseline v0.1.0
rivet export --html --baseline v0.1.0
rivet impact --baseline v0.1.0
rivet graph --baseline v0.1.0
```

New subcommands on `rivet baseline`:

```
rivet baseline verify v0.1.0     # existing: check git tags across repos
rivet baseline list              # existing: list git tags
rivet baseline show v0.1.0       # NEW: list artifact IDs in a baseline
rivet baseline status            # NEW: summary table of all baselines
                                 # with artifact counts and coverage %
```

`rivet baseline status` output:

```
Baselines:
  v0.1.0   247 artifacts   94.3% coverage   0 errors   2 warnings
  v0.2.0   327 artifacts   81.7% coverage   3 errors   8 warnings
  (full)   352 artifacts   79.2% coverage   5 errors  12 warnings
```

### Migration from `phase` to `baseline`

Current state: feature artifacts have `fields.phase: phase-1|phase-2|phase-3|future`.
Other artifact types (requirements, decisions) do not have a phase field.

Migration plan:

1. **Add `baseline` field to the Artifact model** as an optional base field
   (same level as `status`, `tags`). No schema change needed for this --
   it is a structural field.

2. **Add baselines block to rivet.yaml**:
   ```yaml
   baselines:
     v0.1.0:
       description: "Phase 1+2"
     v0.2.0:
       description: "Phase 3"
   ```

3. **Derive baseline from phase for features** using a one-time migration
   script (or manual update):
   - `phase: phase-1` or `phase: phase-2` -> `baseline: v0.1.0`
   - `phase: phase-3` -> `baseline: v0.2.0`
   - `phase: future` -> no baseline (unscoped)

4. **Assign baselines to non-feature artifacts**:
   - Requirements REQ-001 through REQ-019: `baseline: v0.1.0`
   - Requirements REQ-020 through REQ-036: `baseline: v0.2.0`
   - Design decisions DD-001 through DD-010: `baseline: v0.1.0`
   - Design decisions DD-011 onward: `baseline: v0.2.0`
   - STPA artifacts: `baseline: v0.1.0` (all shipped in phase 1)
   - Architecture artifacts: `baseline: v0.2.0`

5. **Keep the `phase` field** on features for backward compatibility,
   but deprecate it. The `phase` field becomes informational only;
   `baseline` is the authoritative scoping field.

6. **Update the dev schema** to add `baseline` to the allowed-values
   list or remove the phase field entirely in a future release.

### Relationship to Existing Baseline Features

| Feature | Current | With this design |
|---------|---------|-----------------|
| `rivet baseline verify` | Checks git tag presence across repos | Also validates artifact completeness within the baseline |
| `rivet baseline list` | Lists git tags | Also shows artifact counts per baseline |
| `rivet impact --since` | Compares current store to a git ref | Can additionally scope to a baseline |
| `rivet export --html` | Exports all artifacts | Can scope to a baseline for release evidence |
| `phase` field | Informal, features only | Superseded by `baseline` on all artifact types |

### Data Model Changes

```rust
// model.rs -- add baseline field to Artifact
pub struct Artifact {
    pub id: ArtifactId,
    pub artifact_type: String,
    pub title: String,
    pub description: Option<String>,
    pub status: Option<String>,
    pub tags: Vec<String>,
    pub links: Vec<Link>,
    pub fields: BTreeMap<String, serde_yaml::Value>,
    pub source_file: Option<PathBuf>,
    pub baseline: Option<String>,       // NEW
}

// model.rs -- add baseline config to ProjectConfig
pub struct ProjectConfig {
    pub project: ProjectMetadata,
    pub sources: Vec<SourceConfig>,
    pub docs: Vec<String>,
    pub results: Option<String>,
    pub commits: Option<CommitsConfig>,
    pub externals: Option<BTreeMap<String, ExternalProject>>,
    pub baselines: Option<IndexMap<String, BaselineDef>>,  // NEW
    // IndexMap preserves insertion order for baseline ordering
}

pub struct BaselineDef {
    pub description: Option<String>,
    pub cumulative: bool,  // default: true
    pub git_tag: Option<String>,
}
```

### Store Changes

```rust
// store.rs -- add baseline-scoped store builder
impl Store {
    /// Create a new store containing only artifacts in the given baseline.
    pub fn scoped(&self, baseline: &str, config: &BaselineConfig) -> Store {
        // ...
    }

    /// Get the set of artifact IDs in a baseline.
    pub fn ids_in_baseline(&self, baseline: &str, config: &BaselineConfig) -> HashSet<String> {
        // ...
    }
}
```

### LinkGraph Changes

```rust
// links.rs -- add scoped build
impl LinkGraph {
    /// Build a link graph for a scoped store, treating links to
    /// out-of-scope (but existing in full store) targets as external.
    pub fn build_scoped(scoped: &Store, schema: &Schema, full: &Store) -> LinkGraph {
        // ...
    }
}
```

### Query Changes

```rust
// query.rs -- add baseline filter
pub struct Query {
    pub artifact_type: Option<String>,
    pub status: Option<String>,
    pub tag: Option<String>,
    pub has_link_type: Option<String>,
    pub missing_link_type: Option<String>,
    pub baseline: Option<String>,        // NEW
}
```

## Implementation Plan

### Phase 1: Minimal Viable Baseline (3-4 hours)

1. Add `baseline: Option<String>` to `Artifact` struct in model.rs
2. Parse `baseline` field in generic-yaml and stpa-yaml adapters
3. Add `baselines` config block parsing to `ProjectConfig`
4. Implement `Store::scoped()` and `LinkGraph::build_scoped()`
5. Add `--baseline` flag to `rivet validate`
6. Add `--baseline` flag to `rivet coverage`
7. Migrate rivet's own artifacts: add baseline field to all artifact files

### Phase 2: Full Integration (2-3 hours)

8. Add `--baseline` flag to `rivet list`, `stats`, `matrix`, `export`
9. Add `rivet baseline show` and `rivet baseline status` subcommands
10. Add `baseline` filter to `Query` struct
11. Dashboard baseline selector dropdown

### Phase 3: Polish (1-2 hours)

12. `rivet baseline verify` enhanced: check artifact completeness
13. Impact analysis baseline scoping
14. Documentation and help text updates
15. Deprecation warning for `phase` field

## Open Questions

1. **Should `baseline` be a base field or a custom field?** This design
   proposes a base field (like status, tags) because it has semantic
   meaning to the validation engine. A custom field in `fields` would
   require schema changes per domain and could not be enforced uniformly.
   **Decision: base field.**

2. **What about artifacts shared across non-cumulative baselines?** For
   example, a hotfix release that includes REQ-001 from v0.1.0 and
   REQ-025 from v0.2.0 but not all of v0.2.0. The current design handles
   this via `cumulative: false` baselines that only include explicitly
   tagged artifacts. The artifact would need `baseline: hotfix-1` set
   manually. This is expected to be rare. **Decision: defer until needed.**

3. **Should baseline validation be strict or advisory?** This design makes
   `--baseline` a filter that scopes validation. All errors within the
   baseline are real errors. Missing links to out-of-baseline artifacts
   are not errors. **Decision: strict within scope, lenient at boundary.**

4. **How does this interact with OSLC configuration management?** OSLC
   Config Management (OSLC-CM) defines global configurations and baselines
   as sets of versioned resources. The `baseline` field maps to the OSLC
   concept of a configuration context. Future OSLC sync could map rivet
   baselines to OSLC global configurations. **Decision: design is
   compatible; OSLC mapping is future work.**
