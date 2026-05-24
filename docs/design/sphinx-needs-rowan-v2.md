# `sphinx-needs` importer v2 — migrate front-end to rowan

**Status**: design proposal, scope ready for an implementation pass
**Tracking**: see follow-up REQ to be filed when this PR merges
**Owner suggestion**: whichever maintainer owns `rivet-core/src/yaml_cst.rs`
(this v2 reuses the same pattern for RST)

## TL;DR

v1 of `rivet import-results --format sphinx-needs` (commits `3a81249` +
`68564f2`) ships a hand-rolled regex scanner. It works — it goes green
against the full eclipse-score corpus (58 repos, 3008 needs, 0 errors)
— but the parser is the **only place in rivet-core where we parse a
structured source language with regex**. Every other front-end (YAML,
JUnit, ReqIF, OSLC) uses a typed parser.

This document proposes v2: replace the regex scanner with a rowan-based
RST CST, mirroring the YAML parsing pattern already established in
`rivet-core/src/yaml_cst.rs` + `yaml_hir.rs`.

## Why we shipped regex anyway

Documented at length in the v1 commit body. Short version:

- Eclipse uses ~5% of RST grammar (the directive shape).
- Cost of a rowan RST grammar is ~1500–3000 lines vs ~350 regex lines.
- Time-to-falsification-evidence was urgent — the eclipse-score-fork
  workspace (see `/Users/r/git/pulseengine/eclipse-score-fork/README.md`)
  needed a converter to validate the schema deltas in `64e9bc5` + `4a2890f`.
- The TYPE_MAP / LINK_MAP / STATUS_MAP / FIELD_MAP layer is
  parser-independent — swapping the front-end is purely mechanical.

## Why a rowan v2 is worth the work

1. **Architectural coherence**. Rivet's YAML pipeline is
   rowan → CST → HIR → salsa (`rivet-core/src/yaml_cst.rs`,
   `yaml_hir.rs`, `yaml_edit.rs`, plus salsa wiring). Anyone reading
   the codebase to learn the parser pattern hits one consistent shape.
   The regex scanner is the visible odd-one-out.

2. **Precise source spans**. The regex impl reports
   `"somewhere around line N"` for diagnostics. A rowan CST gives
   exact `(file, line, col, len)` for every directive, option, link
   target — which matters as soon as the importer reports issues back
   to the user (e.g. "the link target `wp__foo` on line 142 column 5
   does not resolve").

3. **Incremental / salsa compatibility**. The current v1 is a one-shot:
   open file → emit YAML → done. A rowan-based front-end plugs into
   salsa so re-running on a tree that has 3 changed files in a 900-file
   corpus does ~3 files of work, not 900. This matters once eclipse
   gets so large the regex parser takes more than a few seconds on a
   full pass.

4. **Future-proof for new RST features**. Eclipse currently uses ~5%
   of RST. As they grow:
   - Substitutions (`|name|`): rowan-natural, regex-painful.
   - File-level includes (`.. include::`): rowan-natural, regex-impossible
     without re-implementing RST's include machinery.
   - Custom Sphinx domains: rowan grammar extends in one place; regex
     would need a new pattern per case.

5. **Silent-failure prevention**. Today, an unrecognised RST construct
   silently drops a directive (the regex doesn't match). Coverage
   reports surface the count drop, but only if someone reads them.
   With a typed CST + recovery, an unrecognised construct becomes a
   typed `Error` node — still parses around it, but the dropped span
   is *visible* in the CST and counts in the diagnostics.

## What v1 already gets right (preserve it in v2)

Do **not** re-derive these in v2 — they are the durable artifacts from
the corpus-oracle journey (see
`/Users/r/git/pulseengine/eclipse-score-fork/tools/falsification-journey.md`):

- `TYPE_MAP` / `LINK_MAP` / `STATUS_MAP` / `FIELD_MAP` /
  `NATIVE_OPTIONS` / `TEMPLATE_PLACEHOLDER_IDS` — verbatim from
  `rivet-core/src/formats/sphinx_needs.rs`.
- The `gd_*` source-side link routing
  (`:satisfies:` → `fulfils-process-req` when source is `gd_*`).
- The status enumeration (`valid` → `approved`, `proposed` → `draft`,
  etc.).
- The output schema (rivet generic-yaml).

The v2 parser swaps the **scanner** layer; the conversion layer
(parse-tree → rivet artifact) stays put.

## Suggested implementation shape

```
rivet-core/src/formats/
├── sphinx_needs.rs         # current v1 (regex). Keep until v2 is at
│                           #   parity on the corpus oracle, then make
│                           #   thin wrapper / delete.
└── sphinx_needs_rowan/     # new module
    ├── mod.rs              # public API mirroring sphinx_needs.rs
    ├── cst.rs              # rowan SyntaxKind, builder, helpers
    ├── lex.rs              # tokeniser
    ├── parse.rs            # parse-tree construction
    └── hir.rs              # CST → ParsedNeed (existing struct,
                            #   reused unchanged)
```

The minimum sphinx-needs grammar needed:

```
File          := (Block | Blank)*
Block         := Directive | Comment | Section | Paragraph | CodeBlock
Directive     := DirectiveStart OptionBlock? Body?
DirectiveStart:= '..' WS Ident '::' (WS Title)? NL
OptionBlock   := (OptionLine | Continuation)+   # indented > directive
OptionLine    := WS ':' Ident ':' (WS Value)? NL
CodeBlock     := DirectiveStart-of-{code-block, code, literalinclude,
                                    parsed-literal} … (skip body)
Body          := (Line where indent > directive_indent)*
```

The grammar does **not** need to handle inline RST (emphasis, links,
roles, references) — sphinx-needs directives carry their semantic
weight in `:option:` values, which are atomic.  Body text is treated
as opaque markdown blob, same as today.

## Parity gate for v2

v2 ships when it satisfies all three:

1. `cargo test -p rivet-core --lib formats::sphinx_needs_rowan` —
   port and pass all current v1 tests (`tests/` block at the bottom of
   v1 source).

2. **Corpus oracle parity**. Against
   `/Users/r/git/pulseengine/eclipse-score-fork/upstream/eclipse-score-*`:

   - v2 must convert ≥ v1's count (3008 needs) ± 30 (allows for
     legitimate CST recovery on edge cases the regex skipped).
   - `rivet --schemas
     /Users/r/git/pulseengine/eclipse-score-fork/vendor/rivet-schemas
     validate` against the v2 output must report `Result: PASS`
     (warnings allowed, errors not).

3. **Diagnostic improvement**. At least one diagnostic that the
   regex impl reports as "somewhere around line N" must be reportable
   as `(file, line, col)` precise from v2.

## Non-goals for v2

- Full RST grammar (we still only handle the sphinx-needs subset).
- Auto-fix / rewrite tooling (out of scope for this importer).
- Replacing the per-format dispatcher in `rivet-cli/src/main.rs`'s
  `cmd_import_results` (the CLI surface stays).
- Migrating other formats to rowan (junit, reqif are external XML
  parsers — different question entirely).

## Effort estimate

- Lex + parse: 2–3 days
- HIR conversion (CST → existing `ParsedNeed`): 0.5 days
- Test port + new span-aware tests: 0.5 days
- Corpus oracle iteration: 0.5–2 days depending on how much CST
  recovery has to handle eclipse's edge cases the regex sidestepped
- Total: 4–6 days

## Open questions

1. Does v2 ship as a flag (`--use-rowan`) initially, with regex as
   default, then promoted? Or does v2 replace regex outright?
2. Should the v2 CST be reusable for general RST tooling elsewhere
   in rivet (e.g. rivet docs RST sources)? If yes, structure the
   parser as a stand-alone module not nested under `formats/`.
3. The Python reference at
   `/Users/r/git/pulseengine/eclipse-score-fork/tools/score_import.py`
   will eventually be deleted in favour of the Rust impl. After v2
   lands, is there value in keeping the Python tool as a smoke-test
   oracle, or should it go?
