# AI Evidence Trend Research

**Status:** Internal strategy, v1 — 2026-04-19
**Audience:** Rivet product lead
**Refs:** FEAT-001
**Scope:** Is "AI agents generating work-product evidence under human review" a real trend, and where is it going?

---

## 1. Verdict

**Emerging category, not a coalesced market.** Three adjacent waves are converging — supply-chain provenance (SBOM / SLSA / sigstore extending toward AI), AI-application observability (Langfuse, LangSmith, Weave, Phoenix), and coding-agent contracts (AGENTS.md, MCP, spec-kit) — but none frames its product as "human-reviewable evidence of what the AI built, inside the engineering work-product." Rivet's framing is underserved, defensible for 12–18 months, and has real regulatory tailwind. *Not* solo territory: useblocks' `pharaoh` (5 stars) occupies the same frame with near-zero traction, and SpecStory captures chat-level evidence. But as a safety-critical, schema-anchored, human-review-first artifact store tied to ASPICE / STPA / ISO 26262, rivet is currently the only serious contender we could identify.

---

## 2. The Field Map

| # | Tool / Std. | Category | AI-native? | Human-review loop? | Evidence unit | Maturity | OSS |
|---|---|---|---|---|---|---|---|
| 1 | SLSA (slsa.dev) | Supply-chain provenance | No (general) | Indirect | Build attestation | Mature (v1.0) | Yes |
| 2 | sigstore / cosign | Signing | No | No | Signed artifact | Mature | Yes |
| 3 | in-toto attestations | Attestation spec | No (general) | Indirect | Predicate | Mature | Yes |
| 4 | CycloneDX ML-BOM | AI BOM | Yes (assets) | No | ML component | Released | Yes |
| 5 | SPDX 3.0 AI Profile | AI BOM | Yes (assets) | No | Model/dataset | Released | Yes |
| 6 | EU AI Act Art. 12 | Regulation | Required | Required | Automatic log | Law (2024) | — |
| 7 | ISO/IEC 42001 | Std (AIMS) | Required | Required | Management record | Published 2023 | — |
| 8 | NIST AI RMF | Guidance | Required | Required | Govern/Map/Measure | Published | — |
| 9 | AGENTS.md | Agent context contract | Yes | No | `AGENTS.md` file | Growing | Yes |
| 10 | MCP | Context protocol | Yes | No | Tool call trace | Dominant | Yes |
| 11 | Claude Code hooks | Agent lifecycle | Yes | Weak | Hook output | Emerging | No |
| 12 | SpecStory | Chat capture | Yes | Weak | Session transcript | Indie | Partial |
| 13 | Aider | Coding agent + git | Yes | Strong (commits) | Git commit | Mature | Yes |
| 14 | Continue.dev | CI check agents | Yes | Strong (PR check) | GitHub status | Growing | Yes |
| 15 | GitHub spec-kit | Spec-driven AI | Yes | Weak | Spec → impl | **90k stars** | Yes |
| 16 | AWS Kiro | Spec-driven AI IDE | Yes | Medium | Spec / task file | GA | No |
| 17 | Langfuse / LangSmith / Weave / Phoenix | LLM observability | Yes | No (ops) | Run trace | Mature | Partial |
| 18 | promptfoo | LLM eval + redteam | Yes | No (ops) | Test case | Mature | Yes |
| 19 | Polarion / Jama / DOORS | ALM | No | Strong | Requirement | Mature | No |
| 20 | strictDoc | Open-source ALM | No (no AI features) | Strong | Need object | Active | Yes |
| 21 | sphinx-needs | Docs-first ALM | Ships `AGENTS.md` only | Strong | Need object | Mature | Yes |
| 22 | **pharaoh** (useblocks) | **AI + sphinx-needs** | **Yes** | **Yes** | **Need object** | **5 stars, 20 commits** | Yes |
| 23 | **rivet** | **AI + safety ALM** | **Yes** | **Yes** | **YAML artifact + git** | **Pre-1.0** | Yes |

Only rows 22 and 23 combine *AI-native*, *human-review loop*, and *structured engineering evidence unit*. Rows 17–18 stop at the model-run trace. Rows 19–21 have the review loop but no AI story. Row 15 (spec-kit) has mindshare but treats the spec as input and drops the evidence question once code is generated.

### Direct quotes from marketing

- **SLSA** (slsa.dev): *"a security framework from source to service, giving anyone working with software a common language for increasing levels of software security and supply chain integrity."* No mention of AI on the spec homepage as of this research.
- **MCP** (modelcontextprotocol.io): *"MCP (Model Context Protocol) is an open-source standard for connecting AI applications to external systems… Think of MCP like a USB-C port for AI applications."*
- **AGENTS.md** (agents.md): *"Think of AGENTS.md as a README for agents: a dedicated, predictable place to provide context and instructions to help AI coding agents work on your project."* No adoption statistics on the homepage; 22 contributors on the reference repo.
- **SpecStory** (github.com/specstoryai): *"Intent is the new source code. … Never lose a brilliant solution, code snippet, or architectural decision again. SpecStory captures, indexes, and makes searchable every interaction you have with AI coding assistants."* Local-first; chat transcripts, not structured artifacts.
- **Aider**: *"AI Pair Programming in Your Terminal."* Docs: *"Aider automatically commits changes with sensible commit messages. Use familiar git tools to easily diff, manage and undo AI changes."* Closest precedent for "git-as-evidence."
- **Continue.dev**: *"Source-controlled AI checks, enforceable in CI."* Reframes evidence as a PR status check — structurally the closest commercial analogue to rivet's direction, but scoped to code-review rather than SDLC artifacts.
- **GitHub spec-kit**: mission *"Build high-quality software faster"* through development that lets developers *"focus on product scenarios and predictable outcomes instead of vibe coding."* 90k stars, 7.7k forks.
- **pharaoh** (useblocks): *"AI assistant framework for sphinx-needs projects. Pharaoh combines structured development workflows with requirements engineering intelligence to help teams author, analyze, trace, and validate requirements using AI."* 5 stars, 20 commits, v1.0.0 on 2026-04-07. Explicit bet that "the AI is the runtime."
- **CycloneDX**: lists *"Machine Learning Bill of Materials (ML-BOM)"* as a first-class BOM type.
- **SPDX 3.0 AI Profile**: *"The AI profile describes an AI component's capabilities for a specific system (domain, model type, industry standards). It details its usage within the application, limitations, training methods, data handling, explainability, and energy consumption."*

Unverified in this pass (WebFetch denied): EU AI Act Art. 12 exact text, NIST AI RMF, ISO/IEC 42001, FDA AI/ML-SaMD guidance, Langfuse/LangSmith marketing pages, Polarion, Jama. Claims about these below rely on well-known public summaries and should be re-verified before external use.

---

## 3. The Regulatory Tailwind

Ranked by how directly each pushes organizations toward *AI-artifact evidence under human review*.

1. **EU AI Act, Article 12 (Reg. 2024/1689)** — *primary driver.* Requires high-risk AI systems to have automatic event logging over their lifecycle, sufficient to trace the system's functioning. High-risk categories cover safety components of machinery, medical devices, vehicles, critical infrastructure. The interpretation maturing in 2025–2026 extends scrutiny to AI used *to develop* safety-critical software — still being litigated. Either way, it creates a regulatory culture where "we cannot evidence what the AI did" is no longer acceptable for regulated SDLCs. *(Exact text unverified this pass; re-check eur-lex.)*
2. **ISO/IEC 42001:2023 (AI Management Systems)** — organisational-level control framework analogous to ISO 27001 but for AI. Requires documented governance over AI lifecycle including deployment inside development processes. Auditors of 42001-certified orgs will expect evidence stores for AI-produced work-products.
3. **Functional-safety standard updates** — ISO 26262, IEC 61508, DO-178C, IEC 62304 working groups are all actively examining "AI-developed software." The pattern in every prior tooling-qualification debate (MISRA, model-based design) is that the industry demands auditable traceability artifacts before new tech is allowed in the safety case. ASPICE 4.0 already tightens traceability obligations — AI-assisted development inside an ASPICE-audited org multiplies the burden.
4. **NIST AI RMF + Generative AI Profile** — not binding, but the de-facto US baseline and the lens US government procurement uses.
5. **FDA AI/ML SaMD guidance + Predetermined Change Control Plan** — specifically scopes AI *in* the device; the question of AI *developing* the device is downstream but coming.

**Takeaway:** the EU is leading with a law; the US is leading with a framework; safety-critical industries will translate both into requirements on tooling. The regulated buyer arrives *first* in automotive/medical/aerospace/rail, exactly where rivet is positioned.

---

## 4. Where Rivet Sits

### What is unique

- **Engineering-artifact-first evidence unit.** Other tools' evidence units are chat transcripts (SpecStory), tool-call spans (LangSmith, Weave), git commits (Aider), or SBOM components (CycloneDX). Rivet's is a *schema-validated YAML artifact* — requirement, hazard, UCA, test case — linked into a traceability graph. Maps directly onto what an ASPICE / ISO 26262 / DO-178C auditor already asks for.
- **AI provenance stamping on domain artifacts.** The PostToolUse hook stamping `created-by: ai-assisted` and `model: …` on *requirement-level* objects is rare. CycloneDX/SPDX stamp *components*. LangSmith stamps *runs*. Nobody else stamps a REQ.
- **Human-review-first validation layer.** `rivet validate` produces the kind of report a reviewer signs off. Observability tools assume an ops team, not a reviewer with authority to reject work.
- **MCP-native context + structured schema emission.** Combines the context-provision story (like AGENTS.md) with the deterministic-artifact-emission story (like sphinx-needs / strictDoc). Pharaoh is the only other project in this intersection, and it is tiny.

### What is crowded

- **Generic traceability / ReqIF import-export.** Polarion, Jama, DOORS Next, strictDoc, sphinx-needs all cover this. Rivet should interoperate, not compete.
- **LLM evaluation and observability.** Langfuse, LangSmith, Weave, Phoenix, promptfoo — do not attempt to enter this space.
- **Generic spec-driven development.** spec-kit has 90k stars. Competing on "tell the agent what to build" is already lost.

### What is risky

- **Betting on AGENTS.md as a durable convention.** Mindshare, but no standards body, no named adoption count, and commercial vendors (Cursor Rules, `CLAUDE.md`, Copilot instructions, Kiro specs) keep minting parallel formats. Rivet's dependency on a specific filename is small; the conceptual dependency on "agents read a contract" is large.
- **Regulator speed.** Art. 12 logging covers *runtime* systems; extending to *AI that built the code* may not land for years. Pitch cannot rely on imminent enforcement.
- **Safety-critical adoption is slow.** The same compliance posture that makes rivet valuable means buyers take 18–36 months from trial to production.

---

## 5. Where This Is Going (Speculation, Labelled)

**P1 — By end of 2026, at least one top-three cloud vendor (AWS, Google, MS) ships an "agent activity log" product capturing AI agent work-product as first-class evidence, priced for enterprise compliance.** *For:* CycloneDX ML-BOM, SPDX AI profile, Kiro specs, Copilot custom instructions all point the same way; EU AI Act makes it sellable. *Against:* big vendors enter late and narrowly; likely positioned as observability, not evidence, missing the review loop.

**P2 — MCP wins the context-provision protocol war by Q4 2026, displacing per-tool rules files for shared project context.** *For:* Anthropic-backed, supported by VS Code, Cursor, ChatGPT; explicitly *"USB-C for AI applications"*; per-tool formats are a tax. *Against:* AGENTS.md already claimed "README for agents"; Rules files are simpler and deployed; MCP adds an execution dependency.

**P3 — By 2027, at least one ASPICE / ISO 26262 assessor publicly refuses an assessment that cannot evidence AI usage during development.** *For:* the gap is obvious, assessors compete on rigor, German OEM buyers will ask. *Against:* assessors rarely move first; likely the first pressure comes from an internal safety-case review at a Tier-1.

**P4 — AIBOM becomes common alongside SBOM by Q3 2026 but stays focused on *model components* (weights, training data, licences), not *AI-authored work-products*.** *For:* CycloneDX ML-BOM and SPDX 3 AI profile already ship. *Against:* "what did the AI produce in my codebase" is orthogonal to BOM and will not be solved by extending it. **This is rivet's gap.**

**P5 — "Agentic SDLC" fragments into three: agent-observability (Langfuse / LangSmith), agent-governance-in-CI (Continue.dev and a GitHub-native alternative), and agent-artifact-evidence (open — rivet / pharaoh / a new entrant).** *For:* the three audiences differ. *Against:* market may consolidate into one "ops for AI code" suite.

**Strongest prediction:** P4. CycloneDX and SPDX already shipped the specs, and the gap they leave open is exactly rivet's niche.

---

## 6. Strategic Recommendation

**Emphasize:**

- **"Evidence, not telemetry."** Own *evidence*. Observability tools will not claim it; ALM tools cannot credibly claim AI-native. That is the lane.
- **The safety-critical auditor as named buyer.** Other adjacent tools sell to platform engineers or AI/ML ops leads. Rivet's buyer is a functional-safety manager or QA lead who signs off an assessment. Market to that persona, not the developer.
- **Interop over competition with ALM incumbents.** ReqIF export, Polarion/Jama adapters, sphinx-needs co-existence. Don't replace DOORS; be the AI-evidence layer that plugs into DOORS.
- **Couple AI provenance to formal verification.** Verus / Kani / Rocq results as the *cross-check* on AI-authored artifacts is the strongest anti-"vibe coding" story on the market; directly answers P3.
- **Participate in AGENTS.md / MCP, don't bet the product on either.** Ship compatibility; keep the evidence store portable.

**Do not compete on:**

- LLM observability or evaluation (promptfoo, Langfuse, LangSmith, Weave, Phoenix).
- General spec-driven development (spec-kit, Kiro).
- Generic enterprise ALM (Polarion, Jama, DOORS).
- Chat capture (SpecStory).

**Watch:**

- pharaoh (useblocks) — same frame, tiny team. A natural collaboration target or acquirer.
- Continue.dev — closest commercial analogue to PR-check-as-evidence; study their GTM.
- GitHub / AWS — if either ships an "agent activity log" SKU, re-evaluate positioning within 90 days.

---

## Appendix — Confidence and Gaps

**High-confidence** (quoted from primary source, verified this pass): MCP, AGENTS.md, SpecStory, Aider, Continue.dev, spec-kit, CycloneDX ML-BOM, SPDX 3 AI profile, pharaoh, SLSA v1.0 homepage wording, Arize Phoenix, W&B Weave, promptfoo, strictDoc, sphinx-needs, arxiv:2604.13108 headline claims.

**Unverified this pass** (WebFetch access denied or 404; re-confirm before external citation): EU AI Act Art. 12 exact text, ISO/IEC 42001 clauses, NIST AI RMF, FDA AI/ML-SaMD guidance, Langfuse and LangSmith marketing copy, CISA AIBOM stance, sigstore docs, Polarion and Jama AI roadmaps.

**Contradiction with the brief:** the brief cites AGENTS.md adoption as *"60,000+ projects per arxiv:2604.13108."* Re-fetching the paper did not surface an AGENTS.md adoption count; its headline claims are that formal architecture descriptors reduce agent navigation steps by 33–44% and behavioural variance by 52% across 7,012 sessions. The 60k figure should be re-sourced before external use.
