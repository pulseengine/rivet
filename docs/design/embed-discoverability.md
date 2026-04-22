# Design note: embed discoverability, `{{query:...}}`, mermaid, and `rivet query`

**Status:** Design only. No code changes in this note.
**Author:** dogfooding feedback (UX bug report, 2026-04)
**Scope:** Four small, independent gaps that showed up when a real user tried
to author documents and artifacts against a live project.

The four gaps share one root cause: **the things that make the dashboard
valuable (embeds, s-expr queries, diagrams) are not surfaced through the CLI
or `rivet --help`.** You have to grep the source to find them. This note
proposes the minimum set of changes that makes them first-class without
re-architecting anything.

Recommendations are listed in **priority order** at the end.

---

## 1. Embed token discoverability — `rivet docs embeds`

### Problem

Today the canonical list of valid `{{...}}` tokens lives in two places:

- Rust match arms in `rivet-core/src/embed.rs:162-181` (the `resolve_embed`
  dispatcher) and the inline legacy embeds in
  `rivet-core/src/document.rs:793-900` (for `{{artifact:...}}`, `{{links:...}}`,
  `{{table:...}}`).
- A static markdown constant `EMBED_SYNTAX_DOC` in
  `rivet-cli/src/docs.rs:1620-1700`, exposed only as
  `rivet docs embed-syntax` — a slug you have to know.

Neither shows up in `rivet --help`, `rivet docs --list`, or the dashboard's
Help view without knowing what to look for. The `rivet embed QUERY` subcommand
(`rivet-cli/src/main.rs:671-679`) takes a query but offers no way to list
the valid token names.

### Proposal

Add a new subcommand **`rivet docs embeds`** (or `rivet embeds list`) that
prints every registered embed token with its signature, a one-line
description, and a runnable example. The list must be **generated from the
same source of truth the resolver uses**, not a hand-maintained string.

Concretely:

- Introduce a small registry in `rivet-core/src/embed.rs` — a `const`
  slice of `EmbedSpec { name, args, summary, example }` that
  `resolve_embed` matches against instead of the current hard-coded
  `match request.name.as_str()` (lines 162-181). Legacy inline embeds
  (`artifact`, `links`, `table`) get registered as `is_legacy: true` so
  they still dispatch via `document.rs` but appear in the listing.
- Expose `embed::registry()` as a public function returning
  `&'static [EmbedSpec]`.
- In `rivet-cli/src/main.rs`, extend the `Docs` subcommand (line 410) or
  add a sibling variant `Embeds { action: EmbedsAction }`. The latter is
  cleaner because `rivet embed QUERY` already exists (line 672) — keeping
  `rivet embeds list` parallel to `rivet schema list` (line 709) matches
  the existing convention.
- In `rivet-cli/src/render/help.rs`, add a dashboard panel listing the
  same registry, rendered into the existing Help view (`render_help`
  around line 1-60) so the discoverability fix hits both CLI and web.

### Output sketch

```
$ rivet embeds list
NAME           ARGS                       SUMMARY
stats          [section]                  Project statistics (types, status, validation)
coverage       [rule]                     Traceability coverage bars
diagnostics    [severity]                 Validation findings (error|warning|info)
matrix         [from:to]                  Requirement↔feature (or any pair) matrix
artifact       ID[:modifier[:depth]]      Inline card for a single artifact
links          ID                         Incoming+outgoing link table for an artifact
table          TYPE:FIELDS                Filtered artifact table
query          SEXPR                      (proposed) Results of an s-expression filter

Run `rivet docs embed-syntax` for full syntax reference.
Run `rivet embed <NAME>[:args]` to render any of these from the CLI.
```

### Files touched (future PR, not this note)

- `rivet-core/src/embed.rs:14-181` — add `EmbedSpec`, registry, make
  `resolve_embed` table-driven.
- `rivet-cli/src/main.rs:410-430` — new subcommand wiring.
- `rivet-cli/src/docs.rs` — thin wrapper that prints the registry.
- `rivet-cli/src/render/help.rs:240-300` — dashboard listing.

---

## 2. `{{query:<sexpr>}}` embed — MVP

### Why this is the highest-value gap for dogfooding

`{{table:TYPE:FIELDS}}` already exists but is **type-scoped only** — you
can't say "all requirements tagged `stpa` whose status is `approved`." That
query is trivial with the existing s-expression evaluator
(`rivet-core/src/sexpr_eval.rs`, already powering `rivet list --filter`
and MCP's `rivet_query`), but there is no way to embed the result in a
document today.

Users are writing these queries in their heads and transcribing results
by hand. A `{{query:...}}` embed closes the loop.

### MVP scope (and explicit non-scope)

**In scope:**

- **Read-only evaluation.** Reuses
  `rivet_core::sexpr_eval::parse_filter` (already called from
  `rivet-cli/src/mcp.rs:936`) and
  `matches_filter_with_store` (line 945). No new evaluator.
- **Cacheable result.** Output depends only on the filter string plus
  the current `Store` + `LinkGraph` hashes — the same inputs that drive
  incremental validation. Hash those as the cache key; invalidate on any
  store mutation. Piggy-back on the salsa/incremental layer
  (`rivet-core/src/incremental.rs`, if present) or do a simple
  `BTreeMap<(String, StoreHash), String>` cache keyed inside `EmbedContext`.
- **No side effects.** The embed cannot trigger validation, fetch
  externals, or mutate anything. It is a pure function of
  `(filter, store, graph) → HTML`.
- **Rendered as a compact table** with columns `id | type | title |
  status`. Same look as `{{table:...}}` so users don't learn a new style.
- **Hard `limit` arg** with a safe default (50) and a max (500) to keep
  render time bounded. Over-limit renders a "showing N of M — narrow your
  filter" footer, never silently truncates without a hint.

**Out of scope for MVP (deliberately):**

- Custom column selection. Start with the fixed column set; add
  `fields=...` later if needed.
- Sort order. MVP renders in store order.
- Cross-repo queries against externals. MVP is project-local.
- Reactive updates in the dashboard. MVP renders once per page request.
- Write/aggregate expressions (sum, count, group-by). Read-only only.

### Syntax

```markdown
{{query:(and (= type "requirement") (has-tag "stpa"))}}
{{query:(and (= type "hazard") (= status "approved")) limit=25}}
```

The parser in `rivet-core/src/embed.rs:108-147` already accepts
`key=val` options after a space, so `limit=25` drops in for free. The
s-expression itself is the first (and only) positional arg; it will
contain colons and parens, so the parser's `split(':')` at line 128
needs a small adjustment: treat the whole tail after `query:` as the
s-expression, not as colon-separated args.

### Files touched (future PR)

- `rivet-core/src/embed.rs:162` — add `"query" => Ok(render_query(...))`
  to the match.
- `rivet-core/src/embed.rs:108-147` — special-case `name == "query"` so
  args aren't colon-split.
- `rivet-core/src/embed.rs` (new function `render_query`) — calls
  `sexpr_eval::parse_filter`, iterates `ctx.store`, emits the same
  table markup as `render_matrix` (lines 558+).
- `rivet-cli/src/docs.rs:1620` — add the new embed to
  `EMBED_SYNTAX_DOC` (or, if we land recommendation #1 first, just add
  it to the registry).

### Security

Same surface as `{{table:...}}` today: results go through `html_escape`
before insertion. The s-expression evaluator is pure and has no I/O —
confirmed by reading `rivet-core/src/sexpr_eval.rs`. No new attack
surface.

---

## 3. Mermaid in artifact bodies — one-line fix in `markdown.rs`

### Where the escape fails today

There are **two markdown renderers** in the codebase, and they disagree:

- `rivet-core/src/document.rs:371-401` — a hand-rolled line-by-line
  renderer used for **document bodies** (`.md` files with
  frontmatter). This one **does** handle fenced ` ```mermaid `
  blocks (line 388): it emits `<pre class="mermaid">content</pre>`, which
  the dashboard's mermaid.js picks up via the selector
  `mermaid.run({querySelector:'.mermaid'})` (see
  `rivet-cli/src/serve/layout.rs:176,270,305`).
- `rivet-core/src/markdown.rs::render_markdown` (line 56-76) — a
  pulldown-cmark-based renderer used for **artifact descriptions and
  custom fields** (called from
  `rivet-cli/src/render/artifacts.rs:283,397`). This one emits
  pulldown-cmark's default output: `<pre><code class="language-mermaid">...</code></pre>`.
  The `.mermaid` selector misses it, so the diagram renders as a
  literal code block with `graph TD` text.

Result: users who drop a mermaid diagram into a document body are
happy; users who drop the same snippet into `description:` see raw source.

### Proposal

Intercept fenced code blocks in `render_markdown` using
pulldown-cmark's event stream, and for `language-mermaid` emit the
same `<pre class="mermaid">...</pre>` tag the document renderer already
produces. This preserves the single-source dashboard JS glue — nothing
on the client side changes.

### Concrete change (future PR)

In `rivet-core/src/markdown.rs:56-76`, replace the current
`Parser::new_ext(...).filter(...)` pipeline with a small event-mapping
pass:

```rust
// pseudocode — not to be taken as final
use pulldown_cmark::{CodeBlockKind, Event, Tag, TagEnd};

let mut in_mermaid = false;
let parser = Parser::new_ext(input, options)
    .filter(|e| !matches!(e, Event::Html(_) | Event::InlineHtml(_)))
    .map(|e| match e {
        Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(ref lang)))
            if lang.as_ref() == "mermaid" =>
        {
            in_mermaid = true;
            Event::Html(r#"<pre class="mermaid">"#.into())
        }
        Event::End(TagEnd::CodeBlock) if in_mermaid => {
            in_mermaid = false;
            Event::Html("</pre>".into())
        }
        Event::Text(t) if in_mermaid => Event::Text(t), // passthrough
        other => other,
    });
```

One subtlety: the current filter strips `Event::Html` events for XSS
defense. The mermaid branch needs to emit its wrapper *before* that
filter runs (or we special-case the two wrapper strings by bypassing
the filter only for them — but synthesising the events upstream of the
filter is cleaner). The `sanitize_html` post-pass on line 75 will
happily leave `<pre class="mermaid">` alone because it targets
`<script>`, `<iframe>`, `<object>`, `<embed>`, `<form>`, `on*` handlers,
and `javascript:` URLs — none of which match.

### Security

Mermaid is already initialised with `securityLevel:'strict'`
(`layout.rs:175,269,304`), which disables `<foreignObject>` HTML
embedding and click handlers. No new risk.

### Tests to add

`rivet-core/src/markdown.rs::tests` already has a `code_blocks` test at
line 126 — add:

- `fenced_mermaid_becomes_pre_mermaid` — input ` ```mermaid\ngraph TD\nA-->B\n``` ` produces a string containing `<pre class="mermaid">` and `graph TD`.
- `fenced_mermaid_inside_artifact_description_renders` — end-to-end
  through `render_markdown` with an artifact-description-sized input.
- `plain_code_block_still_works` — regression: ` ```rust ` fence still
  produces `<pre><code class="language-rust">` (already covered by
  `code_blocks`, extend with lang class assertion).

---

## 4. `rivet query` CLI — mirror MCP's `rivet_query`

### What exists today

- **MCP:** `rivet_query` tool, `rivet-cli/src/mcp.rs:339-350` calls
  `tool_query` at line 935. Input: `filter: String`, `limit:
  Option<usize>`. Output: JSON with `filter`, `count`, `artifacts[]`.
- **CLI:** `rivet list --filter "<sexpr>"`
  (`rivet-cli/src/main.rs:236-257`) already accepts the same filter
  strings via the same `sexpr_eval::parse_filter` entry point. But
  `list` is type-centric (`--type`, `--status`) and its JSON output
  format is a flat artifact array, not the MCP shape, and the
  `--filter` flag is buried under `list` where nobody thinks to look.
- **Dashboard/embed:** no way to run an ad-hoc query (this is what
  `{{query:...}}` in #2 above addresses).

Net: the evaluator is already universal, but the CLI surface for it
is hidden inside `list` and MCP. The user's feedback — "`rivet query`
is not exposed as a CLI command" — is correct in spirit.

### Proposal

Add a new top-level subcommand:

```
rivet query --sexpr "(and (= type \"requirement\") (has-tag \"stpa\"))"
rivet query --sexpr "(and ...)" --limit 25 --format json
rivet query --sexpr "..."        --format text   # default, id+title+status lines
```

This is a thin adapter: it parses the filter, calls the same
`sexpr_eval::matches_filter_with_store` that MCP uses, and prints
results. It's effectively `rivet list --filter ... --format json`
with a dedicated name and the MCP output shape for scripting parity.

### Files touched (future PR)

- `rivet-cli/src/main.rs:704` — add `Query { sexpr: String, limit:
  Option<usize>, format: String }` variant to the `Command` enum, next
  to `Mcp` and `Lsp`.
- `rivet-cli/src/main.rs:1132` — dispatch a new `cmd_query` function.
- `rivet-cli/src/main.rs:7870` — put `cmd_query` next to `cmd_embed`;
  body is essentially a reshape of
  `rivet-cli/src/mcp.rs:935-977::tool_query`. To avoid duplication,
  lift the shared logic into `rivet_core::query` (a module already
  referenced by `rivet-cli/src/mcp.rs:516-521` — `rivet_core::query::Query`
  and `execute`). If that module doesn't already cover the
  `sexpr_eval::parse_filter` path, add a sibling `execute_sexpr`
  function there and have both MCP and CLI call it.
- `rivet-cli/src/docs.rs:32-36` — mention `rivet query` in `CLI_DOC`.

### Relationship to `rivet list --filter`

Keep `rivet list --filter` (backward compat) but document `rivet query`
as the canonical way to run an s-expression from the CLI. Their JSON
outputs should converge: both should emit the MCP shape (`{ filter,
count, artifacts[] }`) so scripts work identically against MCP, CLI,
and the (future) `{{query:...}}` embed.

---

## Recommendations in priority order

| # | Change | Why this order | Effort |
|---|---|---|---|
| **1** | **Mermaid in `render_markdown`** (Section 3) | Silent wrong output is worse than missing output. Users already type `` ```mermaid `` because it works in document bodies; they rightly assume it works in descriptions. One-function change. Highest ratio of UX improvement to lines of code. | XS (≤ 40 LOC + tests) |
| **2** | **`{{query:<sexpr>}}` embed MVP** (Section 2) | Unlocks the single most-requested authoring pattern and completes the dogfooding loop — artifacts can reference live query results instead of stale hand-transcribed lists. All plumbing (`sexpr_eval`, `EmbedContext`) already exists. | S (~150 LOC + tests) |
| **3** | **`rivet docs embeds` + registry** (Section 1) | Discoverability is the long-term fix; once the registry exists, every future embed is auto-documented. Requires refactor of `resolve_embed` to be table-driven — touches more call sites than 1-2 but still small. | S (~200 LOC) |
| **4** | **`rivet query` CLI** (Section 4) | Nice parity with MCP, but the evaluator is already reachable via `rivet list --filter` so power users have a workaround today. Least urgent. Do this last to avoid churn if the output shape is revisited. | XS (~80 LOC) |

### Sequencing note

Do 1 first and land it standalone — it's a bug fix with no API surface.
Then 2 and 3 can be done in either order, but **doing 3 before 2** means
`{{query:...}}` can register itself in the new embed registry instead of
getting added twice (once to the match, once to the docs). Prefer 3 → 2
if the schedule allows.

4 is optional and can ship any time.

---

## What this note explicitly does NOT propose

- New dashboard UI beyond the Help panel in (1).
- Changes to `sexpr_eval` grammar. The current one is sufficient.
- A templating language beyond the existing `{{...}}` syntax.
- Cross-repo / externals queries. Scope stays project-local.
- Mutation embeds (`{{set:...}}`, `{{apply:...}}` etc.). Read-only
  only — mutation belongs in CLI/MCP, not in rendered documents.
