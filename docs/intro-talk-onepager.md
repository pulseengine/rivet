# rivet — one-page introduction

*Hand this to someone on the way to lunch. Read in 90 seconds. Try the demo in 5 minutes.*

---

## Why rivet exists

Three patterns are colliding right now. Rivet is the union.

1. **Typed atoms with stable IDs and graph queries** — the data model. Compliance engineering has shipped this since 1992 (sphinx-needs, DOORS, ASPICE, ISO 26262, DO-178C). The LLM-tooling community is rediscovering it this April under names like "LLM Wiki" and "Zettelkasten for LLMs."
2. **Oracle-gated agent pipelines** — the verification model. Anthropic published their red-team scaffold with Claude Mythos this April. Formal methods has been doing this since the 1980s.
3. **Agent-first form factor** — the deployment model. One binary, three interfaces: CLI for humans, MCP for AI agents, LSP for editors. The agent picks the surface.

The first two pillars are old patterns rediscovered. The third is genuinely new. Rivet is what happens when all three land in the same tool.

---

## What you do with it

```bash
# Bootstrap
cargo install --path rivet-cli
rivet init

# Add a typed artifact
cat > artifacts/req.yaml <<'EOF'
- id: REQ-001
  type: requirement
  title: Vehicle braking system shall stop within 30m at 50km/h
  status: approved
EOF

# Validate against schema + traceability rules
rivet validate

# Open the dashboard
rivet serve --port 3099
```

That's the full elevator demo. Five minutes. The dashboard at `http://localhost:3099/artifacts` shows the typed view, the link graph, search, and an audit trail. Same data is exposed via MCP for AI agents and LSP for editors.

---

## What makes it different from the alternatives

| Alternative | What it has | What rivet adds |
|---|---|---|
| sphinx-needs / DOORS / Polarion | Typed traceability | Native MCP server, formal proofs in CI, one binary, agent-first |
| Markdown wikis (LLM Wiki gist) | Cross-linked notes | Typed atoms with required fields, stable IDs, traceability rules, graph queries |
| Custom YAML + scripts | Flexibility | Schema enforcement, validation rules, dashboard, audit trail, oracle subcommands |

---

## Where to go next

- **Try it**: `rivet quickstart` — embedded 10-step walkthrough; each step has a machine-checkable oracle so an AI agent can complete onboarding autonomously while you watch.
- **Read the longer essay**: *[Three patterns colliding: Karpathy's LLM Wiki, oracle-gated agents, and typed compliance](https://pulseengine.eu/blog/three-patterns-colliding/)*.
- **Slop-hunt your own code**: copy `scripts/mythos/` and run the four-prompt audit on a target file. Real example: in rivet's own codebase the pipeline deleted ~370 LOC of typed-but-unwired code in one PR.
- **Read the full presenter template**: `docs/intro-talk-template.md` (this file's longer companion).

---

## Honest status

Stable enough that rivet audits itself in CI. Not 1.0. Variants, formal proof gaps, and conformity-declaration scope still in flight. Use it for safety-critical work today; expect API stability after 0.5.

---

*This page is intentionally short. The longer presenter template is at `docs/intro-talk-template.md`. The full essay is the blog post linked above.*
