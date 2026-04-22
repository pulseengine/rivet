# S-Expression as a Second Artifact Format

Status: Draft / Decision Request
Refs: #128 (PLE), DD-048 (s-expr-as-canonical)
Author: design note, 2026-04-19

---

## 1. TL;DR

Adding s-expr as a **second** artifact format buys parser-safe ingest and
graceful error degradation. Full bidirectional support (Option C) is
**40–60 person-days** plus permanent dual-path maintenance; a minimal
`intent.lisp` export (Option A) is **~5**. Recommendation: **Option A, gated on
YAML fuzzer results**.

---

## 2. Scope options

| Opt | Description | Days | Risk |
|-----|-------------|------|------|
| **A** | One-way export: `rivet convert --to sexpr` + top-level `intent.lisp` meta-descriptor (arxiv:2604.13108). No read-back, no LSP. | **~5** | Low. Isolated. |
| **B** | One-way import: read `.rivet` into `Artifact`. Writing stays YAML. Migration on-ramp. | **~15–20** | Medium. New HIR extractor + extension dispatch in 7 places. LSP stays YAML-only. |
| **C** | Full bidirectional: read + write + LSP + VS Code + dashboard + MCP + `rivet stamp` round-trip. | **~40–60** | High. Permanent dual-path cost: every new feature lands twice. |
| **D** | Replace YAML. | ~80 + community cost | **Not recommended.** Users hand-edit; ecosystem is YAML-native. |

---

## 3. What we already have

Verified by reading each file:

| File | LoC | What it gives us |
|------|-----|------------------|
| `rivet-core/src/sexpr.rs` | 579 | Rowan-based **lossless** s-expr CST. `parse(src) -> (GreenNode, Vec<ParseError>)`. Round-trip invariant documented at line 259–260. Tokens include `StringLit`/`IntLit`/`FloatLit`/`BoolTrue/False`/`Symbol`/`Comment`; error-recovery node exists. |
| `rivet-core/src/sexpr_eval.rs` | 1242 | Typed `Expr` AST + `lower(&SyntaxNode) -> Result<Expr, Vec<LowerError>>` (line 455). Predicate/accessor machinery. **Reusable** if artifacts are encoded as forms. |
| `rivet-core/src/feature_model.rs` | 840 | Production proof: `(requires A B)`, `(excludes X Y)` constraints already lowered via `sexpr_eval::lower`. Data model itself still YAML (`from_yaml` at 163). |
| `rivet-core/src/yaml_hir.rs` | 1901 | `extract_schema_driven(src, &Schema, path)` at 133 — **the twin we would have to build**. Span-accurate, schema-driven. |
| `rivet-core/src/yaml_cst.rs` | 1230 | Lossless YAML CST. **Not** reusable for s-expr; `sexpr.rs` already fills the role. |
| `rivet-core/src/yaml_edit.rs` | 1210 | **Line-based** (NOT rowan) editor for `set_field`/`add_link`/`remove_link`. S-expr twin needed. |
| `rivet-core/src/formats/generic.rs` | 228 | `GenericYamlAdapter` (serde_yaml). |
| `rivet-cli/src/mcp.rs` | 1134 | Talks to `mutate::*` → `yaml_edit`. Format-agnostic at the boundary. |
| `rivet-cli/src/main.rs` | 9879 | LSP at `cmd_lsp` (7947). Handles `hover`, `definition`, `completion`, `documentSymbol`, `codeAction`. YAML-only. |
| `vscode-rivet/package.json` | 130 | Activation: `workspaceContains:rivet.yaml`. **No** TextMate grammar; relies on VS Code's YAML. |

**Format-agnostic vs YAML-coupled.** Post-parse (`Artifact`, `Store`,
`LinkGraph`, `Schema`, coverage, validate, dashboard, MCP dispatch, traceability
rules) is format-agnostic — **~70 %** of plumbing doesn't care. The **~30 %**
that does: parser, HIR extractor, `yaml_edit`, LSP, VS Code grammar, 7
extension-filter sites, sample generators, span types threaded through
diagnostics/hover/goto.

---

## 4. Option C concrete breakdown

| Work item | Target file(s) | New LoC | Days |
|-----------|----------------|---------|------|
| S-expr CST reuse (already lossless) | — | 0 | 0 |
| HIR extractor — twin of `yaml_hir.rs` (1901 LoC): schema-driven, span-accurate, nested sub-artifacts, shorthand links, suffix discovery | new `rivet-core/src/sexpr_hir.rs` | ~900–1200 | 8–12 |
| Extension dispatch at `lib.rs:65`, `lib.rs:268`, `formats/generic.rs:192`, `main.rs:2845`, `serve/mod.rs:257`, `yaml_roundtrip.rs`×2 | 7 sites | ~80 | 2 |
| Round-trip edit ops (`set_field`/`add_link`/`remove_link`/`remove_artifact`/`modify_artifact`) — twin of `yaml_edit.rs` (1210 LoC). Rowan-based feasible (unlike YAML's line-based). | new `sexpr_edit.rs` | ~800–1000 | 6–8 |
| LSP: hover, goto, completion, symbols, codeAction over s-expr | `main.rs:cmd_lsp` (7947) | ~600 | 5–7 |
| VS Code TextMate grammar + `workspaceContains:*.rivet` activation | `vscode-rivet/syntaxes/rivet.tmLanguage.json` (new), `package.json` | ~150 | 1–2 |
| MCP dispatch layer: `mutate.rs:420–451` currently hard-codes YAML; pick backend by `source_file` extension | `mutate.rs` | ~60 | 1 |
| Dashboard format badge | `rivet-cli/src/render/*` | ~30 | 0.5 |
| `rivet stamp` round-trip via s-expr edit | `mutate.rs` + hook | ~20 | 0.5 |
| `rivet convert --to {yaml,sexpr}` writer | new `sexpr_writer.rs` | ~300 | 2–3 |
| Tests: proptest round-trip, differential (YAML vs s-expr HIR equivalence), golden fixtures, fuzzer | new test crates | ~600 | 4–6 |
| Docs + migration guide + changelog | — | — | 2 |
| Ongoing: every new schema/feature lands twice | — | — | ~20 %/yr |

**Subtotal Option C: ~32–46 days up front + ~20 %/yr ongoing. With realistic
slip (review, bisect, LSP snapshot flakiness): 40–60 person-days.**

---

## 5. Migration path

**Extension.** `.rivet` (unambiguous, no Common Lisp editor collision). `.lisp`
confuses users; `.sexpr` ugly. Rename is a `git mv`; both formats are text so
diff stays legible.

**`rivet convert --to sexpr`** must guarantee (a) comment preservation (lossless
CST gives this for free) and (b) YAML-only idioms flagged, not dropped: block
scalars (`|`/`>`), flow sequences (`[a,b]`), anchors/aliases, `!!tag`
constructors, and `null` shorthands (`~`, empty value — the Mythos #1 bug).

**Staged rollout.** Read-only (B) → authoring for new projects only → opt-in
default via `rivet.yaml` key `format: sexpr` → eventual `rivet init` default.
**Do not auto-migrate existing projects.**

**Dashboard.** Show `yaml`/`rivet` badge per artifact; `source_file: PathBuf`
already on `Artifact`.

---

## 6. Mythos findings retirement matrix

| Finding | Retired? | Notes |
|---------|----------|-------|
| yaml_hir null shorthand → phantom `Link{target:"null"}` | **Yes** | S-expr has no bare `null`; absent ≠ coerced. |
| yaml_cst multi-doc truncation after `---` | **Yes** | No document markers in s-expr. |
| model.rs Norway problem (`baseline: NO` → `false`) | **Yes** | S-expr bools only `true`/`false`; `NO` would be a symbol. |
| formats/generic.rs shape mismatch → `log::warn!` + drop | **No** | Serde-to-model coercion is format-independent; fix by hard-erroring. |
| schema.rs `#[serde(default)]` empty-list semantics | **No** | Schema-side bug. |
| bazel.rs duplicate kwarg silent overwrite | **No** | Starlark, unaffected. |
| store.rs non-deterministic iter | **No** | In-memory. |
| validate.rs invalid regex silent rule disable | **No** | Validator logic. |

**Score: 3 of 8 retired** — real but narrow.

---

## 7. What this does NOT fix

- **LLM comprehension.** Jin 2026 (arxiv:2604.13108): no significant difference
  YAML / JSON / S-expr / Markdown.
- **Silent corruption.** Paper's data: YAML = S-expr = **50 %**. **JSON = 21 %**
  (lowest, fails atomically). If silent corruption is the goal, JSON beats both.
- **Supply-chain, non-determinism, validator bugs** — orthogonal.
- **Human authoring experience.** Users prefer YAML in the same paper.

---

## 8. Honest recommendation

- **Goal = reduce silent corruption** → **ship the YAML fuzzer first** (cheap;
  scaffolded in `tests/yaml_roundtrip.rs`). If it finds zero real corruptions,
  the second-format case is speculative.
- **Goal = `intent.lisp` for AI navigation** (paper's actual proposal) →
  **Option A only**: one top-level `intent.lisp` per project. ~5 days.
- **Goal = parser-safe ingest for safety-critical users** → **Option B**
  (read-only import), ~15–20 days, defensible on-ramp.
- **Option C** (40–60 days + decade of dual-path) — not justified on current
  evidence.
- **Option D** — do not pursue.

---

## 9. Concrete next decision point

1. **Ship the YAML fuzzer.** Run against `artifacts/` and `safety/`.
2. Fuzzer finds real bugs → **evaluate Option B**.
3. Fuzzer finds none → **Option A** as opt-in AI-navigation descriptor.
4. Do **not** commit to Option C on theory alone. Revisit after user demand
   from production (3400+ artifact) projects.

---

## Appendix A: YAML call-site → s-expr mapping

| YAML site | Line | Disposition under Option C |
|-----------|------|----------------------------|
| `rivet-core/src/lib.rs::collect_yaml_files` | 65 | Rename + extend to dispatch by extension. |
| `rivet-core/src/lib.rs` (second walker) | 268 | Same. |
| `rivet-core/src/formats/generic.rs::import_generic_directory` | 192 | Add s-expr branch; keep YAML branch. |
| `rivet-core/src/formats/generic.rs::parse_generic_yaml` | 138 | **New path**: `parse_generic_sexpr`. |
| `rivet-core/src/yaml_cst::parse` | 1230 LoC | **Reuse `sexpr::parse`** — already lossless. |
| `rivet-core/src/yaml_hir::extract_schema_driven` | 133 | **New path**: `sexpr_hir::extract_schema_driven`. ~900–1200 LoC. |
| `rivet-core/src/yaml_edit` (all ops) | 168, 254, 312, 671, 687 | **New path**: `sexpr_edit`. ~800–1000 LoC. |
| `rivet-core/src/mutate.rs::add_link_to_file` etc. | 419, 432, 444, 451 | Add extension-based dispatch layer (~60 LoC). |
| `rivet-cli/src/main.rs::cmd_lsp` | 7947 | Parallel s-expr LSP paths (~600 LoC). |
| `rivet-cli/src/main.rs:2845` schema walker | 2845 | Format-agnostic; extend filter. |
| `rivet-cli/src/serve/mod.rs:257` | 257 | Extend filter. |
| `rivet-cli/src/mcp.rs` | — | **Reuse**; boundary is `mutate::*`, which is format-agnostic once dispatch layer exists. |
| `vscode-rivet/package.json` | — | Add `workspaceContains:*.rivet` activation + new TextMate grammar. |

---

## Appendix B: Unknowns flagged

- Production corpus silent-corruption rate: **unmeasured**. Fuzzer required.
- Whether any existing YAML artifact uses anchors/flow/tags in our 700 files:
  **not audited**. Would need a pre-migration scan before promising round-trip.
- Whether `sexpr_edit` can reuse rowan CST mutation primitives cleanly:
  **plausible but unproven**; rowan green-tree edits are supported but the
  library has no high-level edit API — we would write our own (see LoC estimate).
- Whether MCP tool callers identify files by content or path: checked, path
  only (`mcp.rs:872`), so extension dispatch is safe.
