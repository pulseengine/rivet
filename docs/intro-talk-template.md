# Introducing rivet — presenter template

A reusable structure for introducing rivet in 5, 15, or 30 minutes. Pick the audience variant in §1, the demo depth in §3, and the close in §5. Hook and thesis (§2) are the same for all audiences — that's the canonical message.

This document is meant to be used **and** modified. If you're giving the talk, copy this file, adapt the bullets, and don't apologize for skipping sections that don't fit your audience. The thesis (§2) is the spine; everything else is replaceable.

---

## §1 — Pre-talk checklist (5 min, do once)

Before the talk:

- `rivet` binary installed and `which rivet` returns a path
- A clean demo repo, e.g. `~/demo-rivet/` with nothing in it
- Browser pointed at `http://localhost:3099` (you'll start `rivet serve` mid-demo)
- Terminal font visible from the back of the room
- Three windows pre-arranged: terminal, browser, your slides
- Have the link to the *Three patterns colliding* blog post open in a tab as a follow-up reference
- (For 30-min depth) a fixture repo with realistic artifact set so the dashboard isn't empty when you click Graph

---

## §2 — Hook (60s) and thesis (2 min) — the canonical message

These don't change by audience. They're the spine.

### Hook — pick one opening line based on audience (60s)

**For compliance / safety-critical engineers** (DOORS, sphinx-needs, IEC 61508, ISO 26262 background):

> "Typed-traceability tools have shipped in our world since 1992. The LLM-tooling community is rediscovering the pattern this April — they call it 'LLM Wiki' or 'Zettelkasten for LLMs'. We have a 30-year head start and we've been giving it away."

**For LLM-tooling / AI engineering audiences** (Karpathy, Anthropic, MCP background):

> "Karpathy posted his LLM Wiki gist this April. 5,000 GitHub stars in 48 hours. The comments figured out the strong version: it's a typed Zettelkasten, not a wiki. Compliance engineering has been shipping that exact pattern since the 1990s. This is what it looks like in Rust, exposed as MCP, with formal proofs in CI."

**For mixed engineering / general technical audiences:**

> "Compliance engineering and AI agents are the two communities least likely to talk to each other. The first thinks AI is unreliable; the second has never met an auditor. Both are wrong about each other, and the intersection is the most interesting place to build right now."

**For strategic / investor audiences:**

> "30 to 40 percent of safety-critical engineering cost is compliance bookkeeping. Most of it is mechanical. Rivet automates the bookkeeping while preserving the audit trail, which means an engineer can ship a high-confidence change in the time it currently takes to update the spreadsheet."

### Thesis — the same for every audience (2 min)

> "Three patterns are colliding right now, and rivet is the union.
>
> First: typed atoms with stable IDs and graph queries — the data model. That pattern has shipped in safety-critical engineering since 1992 — sphinx-needs, DOORS, ASPICE, ISO 26262, IEC 61508, DO-178C all assume it. The LLM-tooling community is rediscovering it this April from the markdown-wiki side.
>
> Second: oracle-gated agent pipelines — the verification model. Anthropic published their red-team scaffold this April with Claude Mythos. Same shape: one supervisor agent ranks targets, parallel discoverers in isolated worktrees, fresh-session validators that can't see each other's work, every step gated by a deterministic oracle. Formal methods has been doing this since the 1980s.
>
> Third: agent-first form factor — the deployment model. One binary, three interfaces — CLI for humans, MCP for AI agents, LSP for editors. The agent picks the surface. The human stops being the bottleneck.
>
> The first two pillars are old patterns rediscovered. The third is genuinely new. Rivet is what happens when all three land in the same tool."

**Speaker note**: Don't rush this. The thesis is the entire talk. The demo is just proof.

---

## §3 — Demo (5, 15, or 30 min — pick one)

Pre-stage: `cd ~/demo-rivet/`. Each block ends with a visible artifact the audience can see on screen.

### Demo block A — 5 min (the elevator demo)

```bash
# Step 1: bootstrap
rivet init                              # creates rivet.yaml + scaffolding (~3s)

# Step 2: typed artifact
cat > artifacts/req.yaml <<'EOF'
- id: REQ-001
  type: requirement
  title: Vehicle braking system shall stop within 30m at 50km/h
  status: approved
EOF

# Step 3: validate
rivet validate                          # exits 0; shows the rule check passed

# Step 4: dashboard
rivet serve --port 3099 &
open http://localhost:3099/artifacts    # link graph, typed view, search
```

**Talking point during demo**: "What you're seeing is a typed knowledge graph with stable IDs, traceability rules enforced at validate time, and a dashboard rendered from the same data. No spreadsheet. No PDF. No 'where did we put the requirement document.'"

### Demo block B — 15 min (adds verification + agent integration)

After block A:

```bash
# Step 5: add a design decision linked to the requirement
cat >> artifacts/decisions.yaml <<'EOF'
- id: DD-001
  type: design-decision
  title: Use redundant brake-by-wire ECUs for fail-operational behavior
  satisfies: [REQ-001]
EOF

# Step 6: rivet sees the link, traceability rule fires
rivet validate                          # still green; now rendering DD-001 → REQ-001
rivet list --type design-decision --format json | jq

# Step 7: MCP — Claude Code asks rivet via tool use
# (in another terminal, with Claude Code running in this dir):
#   "what requirements does DD-001 satisfy?"
# Claude calls rivet_list via MCP, returns: REQ-001
```

**Talking point**: "The same data backs all three interfaces. Claude Code didn't read the YAML; it called rivet's MCP server, which returned a structured answer. The agent never has to parse markdown."

### Demo block C — 30 min (adds the Mythos slop-hunt + formal proofs)

After block B:

```bash
# Step 8: Mythos slop-hunt — oracle-gated audit pipeline
ls scripts/mythos/                       # rank.md, discover.md, validate.md, emit.md
# Run rank prompt against the demo (or just show the output of rivet's own audit)
cat scripts/mythos/HOWTO.md              # the four-prompt scaffold + oracle pair

# Step 9: formal verification in CI
ls proofs/rocq/ verus/                   # Coq + Verus specs
# Show the GitHub Actions UI where Rocq + Verus + Kani are real CI gates

# Step 10: the audit chain comes full circle
rivet check bidirectional                # oracle: every link has its inverse
rivet check review-signoff REQ-001       # oracle: reviewer ≠ author
rivet check gaps-json                    # oracle: machine-readable gap report
```

**Talking point**: "Each oracle is one mechanical fact. They compose. An agent pipeline can declare 'this step requires `bidirectional` and `review-signoff` to pass before merge', and rivet enforces it in CI. This is what compliance gating looks like when the gates are code instead of checklists."

---

## §4 — The "where this is going" slide (2-5 min)

Pick 3-5 concrete bullets from the live work. Say one sentence per bullet. **Don't go long.**

**Recently shipped** (the audience can verify this is real):

- Variant scoping coherent across 8 dashboard handlers — the `?variant=minimal-ci` query actually scopes the data, not just the banner
- Mutation testing 16-shard with ~125 surviving mutants killed — the test suite is now keeping itself honest
- Formal verification fully restored — Rocq metamodel proofs + Verus SMT specs + Kani BMC harnesses all running in CI
- Embedded compliance content — rivet's own dashboard now shows its own EU AI Act Annex IV view (dogfooding the schema)

**On the roadmap** (be honest about what's not done):

- Variant tooling product questions: SAT backend? T-wise sampling? Configurator form-factor? Real questions, not yet decided
- Verus has one documented `assume()` and Rocq has one `Admitted` — the SMT-level proof gap and the closure-over-list inductive case
- Cross-repo discovery via `rivet externals` works for build manifests; conflict resolution between repos is open

---

## §5 — Close (60s) — pick one based on audience

**For compliance audiences:**

> "rivet is sphinx-needs lineage in Rust, with formal proofs and an MCP server bolted on. If you've been doing this work, this is the same work, faster. If you've been resisting AI in compliance because of audit-trail concerns, the audit trail is now the data model. Come kick the tires."

**For LLM-tooling audiences:**

> "If you're building knowledge-base tools for AI agents, you're solving a problem compliance engineering solved decades ago. Read sphinx-needs documentation before you reinvent typed-traceable knowledge graphs. And if you're building agent scaffolds, start with a deterministic oracle — rivet's design decisions are recorded as oracles too. The pattern composes."

**For mixed engineering audiences:**

> "The pattern that matters: typed atoms, oracle-gated agents, agent-first form factor. Pick any two, you have a useful tool. Pick all three, you have a tool that an LLM agent can use autonomously without lying to you. That's what we built."

**For strategic audiences:**

> "Compliance is the cost of doing business in safety-critical industries. AI just changed the cost curve. Rivet is the bridge between 30 years of compliance lineage and the next 30 years of AI-assisted engineering. The companies that own this bridge have a 5-10 year structural advantage. We're open-sourcing the bridge."

---

## §6 — Q&A prep — likely questions + tight answers

**Q: How is this different from sphinx-needs / DOORS / Polarion?**
A: Same data model. Three things rivet adds: (1) MCP server so AI agents read it natively, (2) formal proofs in CI as a real gate, (3) one binary instead of a Python stack — agents don't pay setup cost.

**Q: What about ReqIF / OSLC interop?**
A: ReqIF import + export landed in 0.4. OSLC push (diff-then-POST-or-PUT against an OSLC endpoint) shipped recently. The data model maps cleanly.

**Q: Why Rust?**
A: Single binary the agent can call CLI/MCP/LSP from. No Python venv. Compile-time guarantees on the data model. Plus: spar (sister project) is Rust-native MISRA/ASPICE analysis — same toolchain.

**Q: How do you avoid AI hallucinations in the artifact data?**
A: Two layers. First, every artifact is typed YAML with required fields enforced at validate-time. Second, the Mythos slop-hunt pipeline explicitly hunts for typed-but-unwired code — the oracle-pair (excision + git history) has caught real instances in our own codebase.

**Q: Production-ready?**
A: Stable enough that it audits itself in CI. Not 1.0 — variants, formal proof gaps, conformity-declaration scope still in flight. Use it for safety-critical work today; expect API stability after 0.5.

**Q: How do I get started?**
A: `cargo install --path rivet-cli` then `rivet quickstart` — embedded 10-step walkthrough, each step has a machine-checkable oracle so a new AI agent can run through it autonomously while you watch.

**Q: Open source license?**
A: [insert the actual license here — fill in before the talk].

---

## §7 — Reusability notes for other speakers

If you're adapting this template:

- **Don't change the thesis (§2)** — it's the canonical message. Hook variants are fine; the three-pillar argument is the spine.
- **Pick exactly one demo depth (§3) — don't combine.** Audience attention is finite. 5 min is "show me it works", 15 min is "show me how it composes", 30 min is "show me the full stack." Cramming 30 into 15 loses everyone.
- **The "where it's going" section (§4) ages out fast** — replace bullets with the most recent quarter's actual shipped work each time. This is the only section that requires maintenance per talk.
- **Don't show slides during the demo.** The terminal IS the demo. Audiences trust live commands more than screenshots.
- **Q&A is high-leverage**: spend 5 min preparing the answers, the talk feels much sharper.
- **The blog post _Three patterns colliding_ is the longer-form essay version** — link it from your slide deck so the audience can go deeper without you needing to.
- **Adapt the hook and close per audience.** Reusing the same opener for compliance engineers and LLM-tooling people loses both.
- **The thesis is the same in writing too**: when you write follow-up posts, blog summaries, or social media, hold the three-pillar frame. Consistency is the marketing.

---

## Versioning

This template is checked into the rivet repo at `docs/intro-talk-template.md`. When you adapt it, please:

- Don't fork silently. Either propose changes upstream (PR against rivet) or note in your local copy that you've diverged and where.
- The §4 "recently shipped" bullets are deliberately maintained in the rivet repo so anyone running `git pull` gets the current state. Replace per-talk; don't propose those edits upstream unless they reflect actual repo state.
- The §2 thesis evolves slowly. If you think it should change, that's a conversation, not a unilateral edit.

---

*Companion: `docs/intro-talk-onepager.md` — condensed version for hallway-track conversations or one-page handouts.*
