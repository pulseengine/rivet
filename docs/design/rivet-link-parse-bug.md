# BUG: `GenericYamlAdapter` round-trip drops `links:` when written in
# flush-left list indentation

**Severity**: high (silent data loss on adapter round-trip)
**Discovered**: 2026-05-24, while validating the sphinx-needs importer
(commits `592d5e0`, `46563a3`) against the full 58-repo Eclipse S-CORE
corpus.
**Fixture**: `docs/design/rivet-link-parse-bug-fixture/`

## TL;DR

`rivet_core::formats::generic::GenericYamlAdapter::export()` produces
YAML via `serde_yaml::to_string`, which serialises list items
flush-left (no extra indent below the parent key). `parse_generic_yaml`
uses `serde_yaml::from_str`, which **silently loses the `links:` field**
when artifacts use that same flush-left list style — even though
serde_yaml emitted that exact YAML in the first place.

Net effect: rivet's own emitter writes a file that rivet's own parser
fails to fully ingest. Round-trip is broken. Validation passes
because rivet can't see the link graph it should be grading.

## Reproduction

`docs/design/rivet-link-parse-bug-fixture/artifacts/` contains two
files with semantically identical content, differing only in YAML
indentation. Both reference the same dangling target.

`flush.yaml`:
```yaml
artifacts:
- id: COMP_REQ__FLUSH__A
  type: comp-req
  title: Flush-left
  status: approved
  links:
  - type: satisfies
    target: FEAT_REQ__NOPE__DANGLE
```

`indent.yaml`:
```yaml
artifacts:
  - id: COMP_REQ__INDENT__B
    type: comp-req
    title: Indented
    status: approved
    links:
      - type: satisfies
        target: FEAT_REQ__NOPE__DANGLE
```

Run from `docs/design/rivet-link-parse-bug-fixture/`:

```sh
rivet --schemas <vendored-eclipse-score-schemas> validate
```

**Observed output**:

```
Diagnostics:
  ERROR: [COMP_REQ__INDENT__B] link 'satisfies' targets
         'FEAT_REQ__NOPE__DANGLE' which does not exist
  WARN:  [COMP_REQ__INDENT__B] Every component requirement should
         satisfy at least one feature requirement: missing 'satisfies'
         link to ["feat-req"]
  WARN:  [COMP_REQ__INDENT__B] Every component requirement must be
         implemented by a static or dynamic design
  WARN:  [COMP_REQ__INDENT__B] Every component requirement should
         be verified by at least one test specification

Lifecycle coverage gaps (2):
  COMP_REQ__INDENT__B (comp-req, status: approved) — missing: no downstream
  COMP_REQ__FLUSH__A  (comp-req, status: approved) — missing: no downstream

Result: FAIL (1 errors, 3 warnings, 0 broken cross-refs)
```

The indented artifact produces 1 error + 3 warnings (correct: link
parsed, target validated, lifecycle rules fired).  The flush-left
artifact produces **0 diagnostics** — its `links:` section is silently
dropped on parse. It appears in the lifecycle-gap summary only
because rivet sees the artifact exists; the link graph for it is
empty as far as rivet is concerned.

## Why this bug stayed hidden

1. `serde_yaml::to_string` always emits flush-left list items. Any
   rivet code path that exports and re-imports is round-tripping
   through this exact failure mode.
2. `serde_yaml::from_str` returns `Ok(GenericFile)` rather than
   erroring — the `links` field on `GenericArtifact` has
   `#[serde(default, skip_serializing_if = "Vec::is_empty")]`, so
   when the deserializer fails to bind the nested list, it falls
   back to an empty `Vec`.
3. `GenericFile`/`GenericArtifact` use `#[serde(deny_unknown_fields)]`,
   which catches typo'd keys but not silently-dropped nested
   sequences.

The result: the parser thinks the artifact has no links, validate
passes, no error, no warning.

## Real-world impact (discovered case)

Running the new sphinx-needs importer (commits `592d5e0`, `46563a3`)
on the full 58-repo eclipse-score corpus produces 3008 artifacts
with `~2752` `links:` entries between them. After
`GenericYamlAdapter::export` writes the result and `rivet validate`
re-parses it:

| Source | Total warnings | Distinct warning categories |
|---|---:|---:|
| Python reference tool (Python-style indent) | 2507 | 13 |
| Rust port (rivet's own export → flush-left) | 488 | 1 (orphan only) |

The Rust port's "PASS (488 warnings)" is a **false-positive PASS** —
~2019 warnings the reference tool surfaces (field-value mismatches,
lifecycle-coverage gaps, "must satisfy" / "should verify" rules) are
*invisible* to rivet because the link graph never makes it into the
loaded model.

Cross-corroborated by running `rivet validate` on a single isolated
persistency repo:

- Python output → 18+ dangling-cross-ref ERRORs (correct: these refs
  point to artifacts that live in eclipse-score-score, which isn't
  loaded in the isolated run).
- Rust output → "No issues found" (incorrect: same artifacts, same
  refs, but rivet can't see them).

## Suggested fix path

Two angles, both worth doing; either alone closes the silent-data-loss
window:

### Fix A — parser side (preferred)

`parse_generic_yaml` should accept both flush-left and indented list
styles for `links:`/`tags:`/etc. **with the same semantics**, OR
reject ambiguous YAML loudly. The current behaviour (silently bind
to default) is the worst of three options.

If serde_yaml itself is the offender (it might be — see open issues
on the serde-yaml repo about flush-left list parsing edge cases),
investigate whether switching to `serde_yml` (the actively-maintained
fork) closes the gap. Add a round-trip test:

```rust
#[test]
fn generic_yaml_round_trips_links() {
    let artifact = Artifact {
        id: "X".into(),
        artifact_type: "comp-req".into(),
        title: "T".into(),
        links: vec![Link { link_type: "satisfies".into(),
                            target: "Y".into() }],
        // …
    };
    let yaml = GenericYamlAdapter::new().export(&[artifact.clone()],
                                                  &Default::default())
        .unwrap();
    let parsed = parse_generic_yaml(std::str::from_utf8(&yaml).unwrap(),
                                     None).unwrap();
    assert_eq!(parsed[0].links.len(), 1, "links must survive round-trip");
}
```

This test would fail on `main` today.

### Fix B — emitter side (cheaper, narrower)

Have `GenericYamlAdapter::export` post-process serde_yaml's output
to indent list items, OR switch to a custom emitter that does so
directly. Either makes rivet's own emitter produce YAML the parser
can re-load losslessly. Doesn't fix imports of YAML from other
sources (e.g. hand-written) but plugs the round-trip hole.

If only one fix is taken, prefer A: it correctly handles all valid
YAML on disk, not just rivet's own emissions.

## What this implies for the sphinx-needs importer

The corpus oracle on the sphinx-needs Rust port should be re-graded
once the parser is fixed. The Python reference tool's output
(`/Users/r/git/pulseengine/eclipse-score-fork/rivet/eclipse-score-*/artifacts/imported.yaml`)
remains the trustworthy baseline.

When this bug is fixed, the Rust port's output is expected to
produce roughly the same warning shape as the Python tool's output
(~2500 warnings, ~570 lifecycle gaps). If it doesn't, that's the
next falsification finding to chase.

## Open question

How many other rivet adapters round-trip through GenericYamlAdapter
and have therefore been silently masking link-graph data? Worth a
quick audit of:

- `rivet diff` (writes intermediate YAML between baseline + head)
- `rivet snapshot` (writes per-snapshot YAML)
- `rivet bundle` (serialises closure)
- `rivet export --format yaml`
- `rivet import-results --format junit` (writes per-artifact YAML)
- `rivet add` (writes a new artifact YAML file)

Anywhere a link is supposed to be preserved across a write/read
boundary, this bug applies.
