# Phase 3 Parallel Workstreams — Design

## Goal

Define 8 independent implementation workstreams that can execute concurrently,
covering SCORE adoption enablement, CLI mutation safety, incremental validation
architecture, formal verification, and build-system integration.

## Dependency Graph

```
W1 (score schema)  ──→  W3 (needs.json import)
W6 (MODULE.bazel)  ──→  FEAT-044 (build-system providers, future)
W5 (conditional)   ──→  salsa migration (future)

All others are fully independent.
```

## Workstreams

### W1 — SCORE Metamodel Schema (`schemas/score.yaml`)

**Artifacts:** REQ-025
**Effort:** Small (1-2 days)
**Unblocks:** W3

Translate Eclipse SCORE's public `metamodel.yaml` (50+ need types) into a
Rivet-compatible schema file. Covers SCORE's artifact types:

- Process types: TSF, workflow, guidance, tool_req
- Requirements: stkh_req, feat_req, comp_req, aou_req
- Architecture: feat, comp, mod (static/dynamic views)
- Implementation: dd_sta, dd_dyn, sw_unit
- Safety: FMEA entries, DFA entries
- Testing: test_spec, test_exec, test_verdict
- Documents: doc, decision_record

Link types: satisfies, complies, fulfils, implements, belongs_to, consists_of,
uses, violates, mitigated_by, fully_verifies, partially_verifies.

**Testing:** Validate the schema loads and merges correctly. Integration test
importing a sample `needs.json` from SCORE's public documentation builds.

**Architecture notes:** The schema file follows the existing mergeable pattern
(`common` + `score`). SCORE-specific ID regex patterns (e.g., `stkh_req__*`)
are expressed as field-level `allowed-values` patterns.

---

### W2 — CLI Mutation Commands

**Artifacts:** REQ-031, DD-028, FEAT-052..056
**Effort:** Large (1-2 weeks)
**STPA linkage:** Satisfies SC-1 (validate cross-references), SC-2 (never silently discard)

Five new CLI subcommands with schema-validated write:

```
rivet add       --type <type> --title <title> [--status] [--tags] [--field k=v]...
rivet modify    <id> [--set-status] [--set-title] [--add-tag] [--remove-tag] [--set-field k=v]
rivet remove    <id> [--force]
rivet link      <source-id> --type <link-type> --target <target-id>
rivet unlink    <source-id> --type <link-type> --target <target-id>
rivet next-id   --type <type> | --prefix <prefix>
```

**Architecture:**

New module `rivet-core/src/mutate.rs` containing:

```rust
pub struct Mutation {
    pub kind: MutationKind,
    pub target_file: PathBuf,
}

pub enum MutationKind {
    AddArtifact { artifact: Artifact },
    ModifyArtifact { id: ArtifactId, changes: Vec<FieldChange> },
    RemoveArtifact { id: ArtifactId, force: bool },
    AddLink { source: ArtifactId, link: Link },
    RemoveLink { source: ArtifactId, link: Link },
}

pub fn validate_mutation(store: &Store, schema: &Schema, mutation: &Mutation) -> Vec<Diagnostic>;
pub fn apply_mutation(mutation: &Mutation) -> Result<(), Error>;
```

Pre-validation checks before any file write:
- ID uniqueness (add) or existence (modify/remove/link)
- Type exists in schema
- Required fields present
- Status in allowed values
- Link type valid for source→target type pair
- Cardinality constraints not violated
- No orphaned incoming links (remove, unless --force)

File write strategy: YAML append for `add`, targeted string replacement for
`modify`/`link`/`unlink`, line deletion for `remove`. Preserves comments and
formatting in existing file content.

**Testing:**
- Unit tests for `validate_mutation` covering all rejection cases
- Integration tests: add → validate → verify artifact exists
- Integration tests: link → validate → verify link resolved
- Integration tests: remove with incoming links → verify rejection
- proptest: random mutation sequences never produce invalid YAML

---

### W3 — sphinx-needs JSON Import Adapter

**Artifacts:** REQ-025, DD-020, FEAT-042
**Effort:** Medium (3-5 days)
**Depends on:** W1 (score schema for type mapping)

New adapter `rivet-core/src/formats/needs_json.rs`.

**Architecture:**

```rust
pub struct NeedsJsonAdapter;

impl Adapter for NeedsJsonAdapter {
    fn import(&self, source: &str, options: &AdapterOptions) -> Result<Vec<Artifact>>;
}

pub struct NeedsJsonOptions {
    pub type_mapping: HashMap<String, String>,  // sphinx-needs type → rivet type
    pub id_transform: IdTransform,               // underscores_to_dashes, etc.
    pub field_mapping: HashMap<String, String>,  // optional field renaming
}
```

needs.json structure (sphinx-needs export):
```json
{
  "current_version": "1.0",
  "versions": {
    "": {
      "needs": {
        "stkh_req__automotive_safety": {
          "id": "stkh_req__automotive_safety",
          "type": "stkh_req",
          "title": "Automotive Safety",
          "status": "valid",
          "links": ["comp_req__safe_compute"],
          "links_back": ["feat__safety_monitoring"],
          "tags": ["safety"],
          ...
        }
      }
    }
  }
}
```

**Testing:**
- Unit test: parse minimal needs.json with 3-5 needs
- Integration test: import SCORE-style needs.json → validate against score schema
- Round-trip test: import → export as generic YAML → re-import → compare
- Fuzz target: `fuzz_needs_json_import`

---

### W4 — Kani Proof Harnesses

**Artifacts:** REQ-030, DD-025, FEAT-049
**Effort:** Medium (3-5 days)
**STPA linkage:** Satisfies SC-14 (proofs verify actual implementation)

10-15 Kani proof harnesses in `rivet-core/src/proofs/` (or `kani/`):

| Harness | Target function | Property |
|---------|----------------|----------|
| `proof_parse_artifact_ref` | `parse_artifact_ref()` | No panics for any &str input |
| `proof_schema_merge` | `Schema::merge()` | No panics, all input types preserved |
| `proof_linkgraph_build` | `LinkGraph::build()` | No panics for any valid store+schema |
| `proof_backlink_symmetry` | `LinkGraph::build()` | forward(A→B) implies backward(B←A) |
| `proof_cardinality_check` | `validate()` cardinality | All Cardinality enum arms handled |
| `proof_cycle_detection` | `has_cycles()` | Terminates for graphs up to N nodes |
| `proof_reachable` | `reachable()` | Terminates, result is subset of all nodes |
| `proof_broken_links` | `LinkGraph::build()` | broken set = links with unknown targets |
| `proof_orphan_detection` | `orphans()` | orphans ∩ (has_links ∪ has_backlinks) = ∅ |
| `proof_detect_circular` | `detect_circular_deps()` | DFS terminates for any graph |
| `proof_id_uniqueness` | `Store::insert()` | Duplicate insert returns error |
| `proof_coverage_bounds` | `compute_coverage()` | 0.0 ≤ coverage ≤ 1.0 always |

**CI integration:** New GitHub Actions job:
```yaml
kani:
  runs-on: ubuntu-latest
  steps:
    - uses: model-checking/kani-github-action@v1
    - run: cargo kani --tests -p rivet-core
```

**Testing:** The harnesses ARE the tests. Kani verification replaces
traditional assertions with exhaustive bounded checking.

---

### W5 — Conditional Validation Rules

**Artifacts:** REQ-023, DD-018, FEAT-040, FEAT-048
**Effort:** Medium (3-5 days)
**STPA linkage:** Satisfies SC-12 (verify rule consistency before applying)

**Schema extension:**

```yaml
# In schema YAML
conditional-rules:
  - name: approved-requires-verification-criteria
    description: Approved requirements must have verification criteria
    when:
      field: status
      equals: approved
    then:
      required-fields: [verification-criteria]
    severity: error

  - name: asil-requires-mitigation
    when:
      field: safety
      matches: "ASIL_.*"
    then:
      required-links: [mitigated_by]
    severity: error
```

**Architecture:**

New types in `schema.rs`:
```rust
pub struct ConditionalRule {
    pub name: String,
    pub description: Option<String>,
    pub when: Condition,
    pub then: Requirement,
    pub severity: Severity,
}

pub enum Condition {
    Equals { field: String, value: String },
    Matches { field: String, pattern: String },
    Exists { field: String },
    Not(Box<Condition>),
    All(Vec<Condition>),
    Any(Vec<Condition>),
}

pub enum Requirement {
    RequiredFields(Vec<String>),
    RequiredLinks(Vec<String>),
    ForbiddenFields(Vec<String>),
    All(Vec<Requirement>),
}
```

**Consistency check at schema load time (SC-12):**
```rust
pub fn check_rule_consistency(rules: &[ConditionalRule]) -> Vec<Diagnostic> {
    // For each pair of rules that can co-fire on the same artifact:
    // Check that their requirements don't contradict
    // (e.g., one requires field X, another forbids field X)
}
```

**Testing:**
- Unit tests: each Condition variant matches/doesn't match
- Unit tests: each Requirement variant validates/rejects
- Integration test: conditional rule catches missing verification-criteria
- Integration test: contradictory rules detected at schema load time
- proptest: random rule + random artifact → deterministic result
- Kani harness: `proof_condition_eval` — no panics for any field values

---

### W6 — MODULE.bazel rowan Parser

**Artifacts:** REQ-028, DD-023, FEAT-046
**Effort:** Medium (3-5 days)
**STPA linkage:** Satisfies SC-13 (reject unrecognized constructs with diagnostics)

**Architecture:**

New module `rivet-core/src/formats/starlark.rs` (or separate crate `rivet-starlark`):

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash)]
#[repr(u16)]
pub enum SyntaxKind {
    // Tokens
    Whitespace, Comment, Newline,
    LParen, RParen, LBracket, RBracket,
    Comma, Equals, Colon, Dot,
    String, Integer, True, False, None,
    Ident,
    // Composite nodes
    Root,
    FunctionCall,       // module(), bazel_dep(), git_override()
    ArgumentList,
    KeywordArgument,    // name = "value"
    ListExpr,           // ["a", "b"]
    // Error
    Error,
}
```

Supported function calls (MODULE.bazel subset):
- `module(name, version, ...)`
- `bazel_dep(name, version, dev_dependency, ...)`
- `git_override(module_name, remote, commit, ...)`
- `archive_override(module_name, urls, strip_prefix, integrity, ...)`
- `local_path_override(module_name, path)`
- `single_version_override(module_name, version, ...)`

Unsupported constructs emit `SyntaxKind::Error` with diagnostic span:
- `load()` statements
- Variable assignments
- String concatenation
- `if` / `for` expressions
- Function definitions

**HIR extraction:**

```rust
pub struct BazelModule {
    pub name: String,
    pub version: String,
    pub deps: Vec<BazelDep>,
    pub overrides: Vec<Override>,
    pub diagnostics: Vec<Diagnostic>,
}

pub struct BazelDep {
    pub name: String,
    pub version: String,
    pub dev_dependency: bool,
}

pub enum Override {
    Git { module_name: String, remote: String, commit: String },
    Archive { module_name: String, urls: Vec<String>, integrity: Option<String> },
    LocalPath { module_name: String, path: String },
}
```

**Testing:**
- Unit tests: lex each token type
- Unit tests: parse each function call type
- Unit tests: error recovery on malformed input
- Integration test: parse real MODULE.bazel from eclipse-score/score
- Fuzz target: `fuzz_starlark_parse`
- Kani harness: `proof_starlark_parse` — no panics for any byte input

---

### W7 — Change Impact Analysis (`rivet impact`)

**Artifacts:** REQ-024, DD-019, FEAT-041
**Effort:** Medium (3-5 days)

**Architecture:**

```rust
// In rivet-core/src/impact.rs
pub struct ImpactAnalysis {
    pub changed: Vec<ArtifactId>,       // directly changed
    pub directly_affected: Vec<ArtifactId>,  // depth 1
    pub transitively_affected: Vec<ArtifactId>,  // depth 2+
}

pub fn compute_impact(
    current: &Store,
    baseline: &Store,
    graph: &LinkGraph,
) -> ImpactAnalysis {
    let diff = compute_diff(current, baseline);
    let changed_ids: Vec<_> = diff.added.iter()
        .chain(diff.modified.iter())
        .chain(diff.removed.iter())
        .collect();
    // Walk link graph from each changed node
    // Collect transitively reachable artifacts
}
```

Content hashing for baseline comparison:
```rust
pub fn content_hash(artifact: &Artifact) -> u64 {
    // Hash title + description + status + fields + links
    // Deterministic, ignores formatting
}
```

**CLI:** `rivet impact --since <commit|tag> [--format json] [--depth N]`

**Testing:**
- Unit test: unchanged store → empty impact set
- Unit test: one artifact changed → correct transitive set
- Integration test: modify REQ → verify downstream DD and FEAT in impact set
- proptest: impact set is always a subset of all artifacts

---

### W8 — Test-to-Requirement Source Scanner

**Artifacts:** REQ-026, DD-021, FEAT-043
**Effort:** Medium (3-5 days)

**Architecture:**

```rust
// In rivet-core/src/test_scanner.rs
pub struct TestMarker {
    pub test_name: String,
    pub file: PathBuf,
    pub line: usize,
    pub link_type: String,      // "verifies", "partially-verifies"
    pub target_id: ArtifactId,
}

pub fn scan_source_files(paths: &[PathBuf], patterns: &[MarkerPattern]) -> Vec<TestMarker>;

pub struct MarkerPattern {
    pub language: String,          // "rust", "python", "generic"
    pub regex: Regex,
}
```

Default patterns:
- Rust: `// rivet: (verifies|partially-verifies) ([\w-]+)`
- Rust attribute: `#\[rivet::(verifies|partially_verifies)\("([\w-]+)"\)\]`
- Python: `# rivet: (verifies|partially-verifies) ([\w-]+)`
- Python decorator: `@rivet_(verifies|partially_verifies)\("([\w-]+)"\)`

Ephemeral injection (same pattern as commits.rs):
```rust
pub fn inject_test_nodes(graph: &mut LinkGraph, markers: &[TestMarker]) {
    // Add ephemeral test nodes linked to referenced artifacts
}
```

**CLI:** `rivet coverage --tests [--scan-paths src/ tests/]`

**Testing:**
- Unit test: each marker pattern matches expected formats
- Unit test: scan Rust file with `// rivet: verifies REQ-001`
- Integration test: scan → inject → coverage shows test coverage
- Fuzz target: `fuzz_marker_scan`

---

## Cross-Cutting Concerns

### Documentation updates needed

Each workstream must update the built-in docs (`rivet docs`):
- W2: New topic `mutation` covering add/modify/remove/link/unlink commands
- W3: Update topic `adapters` with needs-json adapter documentation
- W5: New topic `conditional-rules` with schema syntax and examples
- W6: New topic `build-system-integration` covering MODULE.bazel discovery
- W7: New topic `impact-analysis` covering the impact command
- W8: New topic `test-traceability` covering marker syntax per language

### CI pipeline additions

- W4: New `kani` job
- All: Existing test/clippy/fmt jobs cover new code automatically

### STPA coverage

New UCAs (UCA-C-10..C-17) and controller constraints (CC-C-10..C-17) cover
the safety-relevant workstreams (W2, W5, W6). Existing STPA analysis covers
W3 (adapter UCAs) and W7/W8 (core engine UCAs).
