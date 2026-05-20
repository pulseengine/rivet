# Cross-Repository Artifact Linking — Design

## Goal

Enable rivet projects across multiple git repositories to reference each
other's artifacts, validate cross-repo links, and create distributed
baselines — without requiring a central platform repository.

## Architecture

**Mesh topology.** Any rivet repo can declare dependencies on any other rivet
repo. No hub-and-spoke or central authority. Bidirectional links are supported:
links are stored on one side, backlinks computed at analysis time (matching
OSLC guidance and rivet's existing intra-project model).

**Transitive resolution.** If meld depends on rivet and rivet depends on loom,
meld can validate rivet's links to loom. Meld cannot reference loom artifacts
directly unless it declares loom as its own external.

## Externals Configuration

Each repo declares its direct dependencies in `rivet.yaml`:

```yaml
externals:
  rivet:
    git: https://github.com/pulseengine/rivet
    ref: main                    # branch, tag, or commit SHA
    prefix: rivet                # local alias for cross-links
  loom:
    git: https://github.com/pulseengine/loom
    ref: v0.3.0
    prefix: loom
```

- `git` — clone URL for the external repo
- `ref` — git ref to fetch (branch, tag, or commit SHA)
- `prefix` — short alias used in cross-links; must be unique within the project
- Local path support: `path: ../meld` as alternative to `git:` for co-located repos

## Cross-Link Syntax

In artifact YAML, cross-repo links use `prefix:ID`:

```yaml
- id: UCA-C-1
  type: uca
  title: CLI does not validate when user commits
  links:
    - type: traces-to
      target: rivet:REQ-001      # resolves via externals
    - type: mitigates
      target: rivet:H-1          # same external, different artifact
```

**Resolution rules:**
- Bare IDs (no colon) resolve locally as today
- Prefixed IDs (`prefix:ID`) resolve against the named external
- Unknown prefixes are validation errors
- IDs not found in the external are broken-reference errors

## Cache and Sync

**Cache location:** `.rivet/repos/<prefix>/` — gitignored.

`rivet sync`:
1. Reads `externals` from `rivet.yaml`
2. For each external, clones (or fetches) the repo into `.rivet/repos/<prefix>/`
3. Checks out the declared `ref`
4. Recursively processes the external's own `externals` (transitive deps)
5. Checks `.gitignore` for `.rivet/` — warns or auto-adds if missing

`rivet lock`:
- Writes `rivet.lock` pinning each external (including transitive) to an exact
  commit SHA
- Subsequent `rivet sync` respects the lockfile for reproducible builds
- `rivet lock --update` refreshes to latest refs

## Validation

`rivet validate` with externals:
1. Loads local artifacts as today
2. Loads external artifacts from `.rivet/repos/` cache
3. Resolves all links (local and cross-repo)
4. Reports broken cross-repo references with the external prefix
5. External artifacts are read-only — no schema validation of external
   artifacts (they validated themselves in their own repo)

## Distributed Baselining

### Phase A: Convention Tags

Any repo participates in a baseline by tagging: `git tag baseline/v1.0`

- `rivet baseline verify v1.0` — syncs all externals at their `baseline/v1.0`
  tag, validates cross-links. Missing tags are **warnings**, not errors (the
  baseline is an evolving process — repos join at their own pace).
- `rivet baseline list` — lists baselines found across externals (tags
  matching `baseline/*`)
- `rivet baseline diff v1.0 v2.0` — shows artifact changes across repos
  between two baselines
- `--strict` flag for release gates: fails if any external is missing the tag

### Phase C (Future): Baseline Receipts

When tagging, rivet writes `baselines/v1.0.yaml` in the repo:

```yaml
baseline: v1.0
created: 2026-03-10T19:30:00Z
self: abc123def456
externals:
  rivet: def456abc789
  loom: 789abc012def
```

Verification compares receipts across repos to detect disagreements (repo A
says it baselined with repo B at commit X, but repo B says it baselined at
commit Y).

## Single Binary — WASM Asset Embedding

Embed spar WASM/JS files at compile time via `include_bytes!`/`include_str!`
so the `rivet` binary is fully self-contained:

```rust
const SPAR_WASM_JS: &str = include_str!("../assets/wasm/js/spar_wasm.js");
const SPAR_CORE_WASM: &[u8] = include_bytes!("../assets/wasm/js/spar_wasm.core.wasm");
```

Feature-gated (`#[cfg(feature = "embed-wasm")]`) so builds without spar
assets still compile. The `wasm_asset` handler serves from embedded constants
instead of reading from disk.

The server-side WASM component (`spar_wasm.wasm`) for `call_render`/
`call_analyze` is also embedded.

## Documentation References

Add methodology references with URLs to built-in docs topics:
- `schema/stpa` — STPA Handbook (MIT), link to PDF
- `schema/aspice` — Automotive SPICE PAM reference
- `schema/cybersecurity` — ISO/SAE 21434 reference
- URLs accessible to both humans and AI agents

## Design Decisions

- **DD-014: Prefixed IDs over URI-style** — `rivet:REQ-001` is simpler and
  more readable in YAML than `rivet://pulseengine/rivet#REQ-001`. The prefix
  is a local alias configured in `rivet.yaml`.
- **DD-015: Mesh over hub-and-spoke** — any repo links to any other. No
  central authority required. Matches distributed team workflows.
- **DD-016: Distributed baselining over centralized manifest** — repos tag
  themselves, consistency is verified not enforced. No platform repo required.
- **DD-017: Transitive dependency resolution** — declare direct deps only,
  discover transitively. Scales naturally, avoids redundant declarations.

## Dogfooding Artifacts

### Requirements
- REQ-020: Cross-repository artifact linking via prefixed IDs
- REQ-021: Distributed baselining via convention tags
- REQ-022: Single-binary WASM asset embedding

### Design Decisions
- DD-014: Prefixed IDs over URI-style references
- DD-015: Mesh topology over hub-and-spoke
- DD-016: Distributed baselining over centralized manifest
- DD-017: Transitive dependency resolution

### Features
- FEAT-033: `externals` config block and prefix resolution
- FEAT-034: `rivet sync` — fetch external repos into `.rivet/repos/`
- FEAT-035: `rivet lock` — pin externals to exact commits
- FEAT-036: `rivet baseline verify` — cross-repo baseline validation
- FEAT-037: Embedded WASM/JS assets (single binary)
- FEAT-038: Cross-repo link validation in `rivet validate`
- FEAT-039: Dashboard external project browsing

## Prior Art

| Tool | Pattern | Adopted |
|------|---------|---------|
| sphinx-needs | JSON manifest + id_prefix namespace | Prefixed IDs |
| OSLC | URI identity, store links on one side, global configurations | Link storage model, baseline concepts |
| ReqView | Linked projects, file-based, workspace scripts | Local path externals |
| Android repo | Manifest-based multi-repo orchestration | Sync/cache model |
| Cargo | Lockfile for reproducible builds | `rivet.lock` |
| Doorstop | Single-repo only | Anti-pattern avoided |
