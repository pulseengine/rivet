# `sphinx-needs` Rust port — v1.2 catch-up

**Status**: design note, no code change in this branch
**Originating context**: the
[`pulseengine/playground-eclipse-score`](https://github.com/pulseengine/playground-eclipse-score)
workspace (corpus oracle: 2985 needs, PASS) has evolved its Python
converter `tools/score_import.py` past the snapshot the Rust port
was originally derived from (commit `46563a3` on this branch).
**Estimated effort**: see decision matrix below; lowest is ~3h, highest
is the v2 rowan migration (`docs/design/sphinx-needs-rowan-v2.md`).

## What the Python converter added since `46563a3`

| Capability | Python change | What the Rust port needs |
|---|---|---|
| `needextend` resolution | New `NeedExtend` dataclass, `parse_needextends()`, AST-based safe filter evaluator (5 supported expression shapes), pre-scan pass that bakes `+tags` / `+belongs_to` mutations into the static artifacts at conversion time. 114 rules → 2504 mutations in the eclipse-score corpus. | Port the parser + the evaluator. The AST-shape evaluator is straight-forward in Rust (`syn` is overkill — match on a tiny enum of supported expression shapes). |
| Markdown document emission | `emit_markdown_for_rst()` walks each RST file with a need directive and emits a parallel `.md` under `rivet/<repo>/docs/<same-path>.md`. Section headings mapped to `#`/`##`/`###`, need declarations become `### {title}` + `{{artifact:ID:status,safety-level,security}}` embed, inline `:need:`X`` → `[[X]]`. 634 documents in the eclipse-score corpus. | Port the markdown emitter as a second output stream alongside the YAML emitter. Reuse the existing `--docs-out` CLI flag shape. |
| Cross-repo `docname` normalisation | docname is built as `<repo-short>/<rel-path>` with the `score/` prefix stripped — eclipse's `needextend` filters expect that shape because their Bazel `docs(...)` macro mounts each external repo at `<repo-short>/...`. | Mirror the same prefix-strip logic in the Rust port's directory walker. |
| `{{artifact:ID:fields}}` embed shape | Per the proposal in `docs/design/artifact-embed-with-fields.md` (commit `7e8cd57` on this branch), the markdown emitter emits the per-field embed shape today; renders as a plain compact card until that proposal lands, then auto-upgrades. | Same behaviour — emit the per-field shape, no special-casing on rivet version. |
| Brace-bug lesson | The Python emitter had a string-concat bug where `f"{{{{artifact:..."` was concatenated with non-f-string `"...}}}}"`, producing four literal `}` chars. Closed by making both parts f-strings. | Rust string literals don't have the same f-string-vs-raw-string footgun, but the test fixture (one persistency artifact end-to-end) should still be ported to lock the contract: input RST → expected markdown with valid `{{artifact:ID:fields}}` embed. |
| Bulk `.gitignore` of upstream `score_metamodel/tests/` and `test/fixtures/` | Already in the Rust port (`46563a3`). | No change. |
| `TEMPLATE_PLACEHOLDER_IDS` global filter | Already in the Rust port (`46563a3`). | No change. |

The Python converter's `score_import.py` is the authoritative spec —
the Rust port should produce byte-equivalent YAML / markdown for the
same RST input, modulo trivial whitespace.

## Three decision paths

| Path | What | When useful | Effort | Risk |
|---|---|---|---|---|
| **A. Port to Rust v1.1** | Implement the four capabilities above on top of `46563a3`. v1 Rust port reaches feature parity with the Python tool. | If v2 rowan is more than ~2 months out. v1 catch-up unblocks anyone who wants to use the Rust port as an in-tree replacement for the playground's Python tool today. | ~6–12h (needextend + markdown emitter are the big chunks) | Adds ~600 lines to `sphinx_needs.rs`. Increases v1 surface — every line is also a line v2 will need to migrate from. |
| **B. Fold into v2 rowan migration** | Skip v1 catch-up. The v2 rowan parser ships with all current Python features included. Until v2 ships, document the Python tool as the recommended path. | If v2 is on the near-term roadmap (≤8 weeks). Cleaner long-term outcome — no duplicated work. | v2 estimate is 4–6 days (`docs/design/sphinx-needs-rowan-v2.md`) plus 1–2 days for needextend + markdown emitter on top. | Users who want the in-tree subcommand have to wait or use the playground's Python tool in the meantime. |
| **C. Freeze v1, document the Python tool as canonical until v2** | Make `46563a3` the permanent v1 — feature-frozen, supports the original spec. Recommend the playground's Python tool for full feature parity. | If neither A nor B is immediate priority. Honest framing that the Python tool is the falsification reference; the Rust port is the in-tree convenience version that lags. | ~30 min: one paragraph in `rivet docs needs-json` plus an issue link to the playground. | Two-tool maintenance burden: bug fixes in the playground tool need backporting to Rust eventually. |

## Recommendation

If v2 is scheduled for the next rivet release, **B (fold into v2)** is
the cleanest path. The playground tool fills the gap in the meantime.

If v2 is not scheduled, **A (port to v1.1)** is the better move — the
playground tool runs Python which is heavier than `cargo install
rivet-cli` for the typical rivet user. Three-month half-life on the
duplication before v2 supersedes it is acceptable.

**C (freeze)** is only the right answer if neither v2 nor v1.1 is
near-term and we want to avoid surprise feature drift.

## Falsification gate (for either A or B)

When the Rust port catches up, the corpus oracle is the contract:

```sh
git clone https://github.com/pulseengine/playground-eclipse-score
cd playground-eclipse-score
make sync
# Replace the Python converter step with the Rust one:
for r in upstream/eclipse-score-*; do
    name=$(basename $r)
    mkdir -p /tmp/rust-corpus/$name/artifacts /tmp/rust-corpus/$name/docs
    rivet import-results --format sphinx-needs \
        --input-dir $r \
        --out /tmp/rust-corpus/$name/artifacts/imported.yaml \
        --docs-out /tmp/rust-corpus/$name/docs
done
# Then point a combined rivet.yaml at /tmp/rust-corpus/ and validate.
rivet --schemas vendor/rivet-schemas validate
```

Expected: `Result: PASS (~2786 warnings, 0 errors)` and 4/4 variant
checks. Numeric parity with the Python tool is the gate — if it
diverges, that's the next falsification finding to chase.

## Cross-references

- v2 plan: `docs/design/sphinx-needs-rowan-v2.md`
- Parser bug + repro: `docs/design/rivet-link-parse-bug.md`
- Per-field embed proposal: `docs/design/artifact-embed-with-fields.md`
- Externals clone-only mode: `docs/design/externals-kind-source.md`
- Python reference impl:
  https://github.com/pulseengine/playground-eclipse-score/blob/main/tools/score_import.py
- Live corpus oracle: https://github.com/pulseengine/playground-eclipse-score (CI badge)
