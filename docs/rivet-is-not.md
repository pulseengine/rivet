# Rivet is not...

## What Rivet is

Rivet validates a typed knowledge graph of engineering artifacts against a domain schema, detects drift across repositories, and emits machine-checkable status. Within those bounds it is strict and reliable. Outside those bounds the following limits apply.

## What Rivet is not

In 1993, Per Cederqvist's CVS manual carried a section called *"CVS is not..."* — a frank inventory of what the tool would not do for you. The section below exists for Rivet. It is the contract about what Rivet does **not** decide.

## 1. Rivet is not a substitute for engineering management.

Rivet ingests a schema, validates a YAML graph, and emits PASS or FAIL. It does not know whether your project is on schedule, whether the requirement you just promoted to `approved` was the one your customer wanted, or whether shipping it makes business sense. The mechanical oracle in `rivet validate` reports on the artifacts you and your agents authored; it cannot tell you that you authored the wrong artifacts. Your tech leads, safety managers, and product owners are still the ones who choose which requirements matter, what risk the project will carry, and when a release is ready. Rivet binds the graph; it does not steer the program.

*Cliff:* an agent running `rivet add requirement --asil B` to close a coverage gap can drive coverage to 100% without anyone having decided that the new requirement is in scope, correctly classified, or aligned with the customer's safety goals. The oracle will applaud. The release review is where someone notices.

## 2. Rivet is not a substitute for schema design.

Rivet is a schema-driven validator, not a schema author. The 28 built-in schemas under `schemas/` (STPA, ASPICE 4.0, ISO/PAS 8800, DO-178C, EN 50128, GSN, EU AI Act, AADL, dev, common) are starting points, not the answer for your domain. When you adopt Rivet for a project, the question *"which artifact types, link types, fields, and validation rules represent how we actually engineer this system?"* is yours to answer. Rivet enforces the schema you give it strictly; if the schema is wrong, every PASS the tool emits is a PASS against the wrong contract. Schema design is a senior-engineer activity, not a tooling activity.

*Cliff:* you keep the default `dev` schema and ship a year of artifacts under it, then discover during your first external audit that the auditor expects ASPICE work-product types your schema never declared. Rivet was happy. The auditor is not.

## 3. Rivet is not a substitute for cross-team communication.

The `cited-source` field carries a `sha256` of an upstream document; `rivet sync` pins externals to a commit SHA in `rivet.lock`; `rivet baseline verify` cross-checks `baseline/<name>` tags across repos. These mechanisms **detect drift** — they raise their hand when the supplier's document, the upstream repo, or a sibling team's baseline has moved. They do not decide what to do about the drift. The conversation with the supplier about whether the new revision of REQ-SW-022 invalidates your hazard analysis is still a phone call, an email thread, or a meeting. Rivet tells you the hash changed; the engineering judgment about whether the change is benign or catastrophic is human work.

*Cliff:* `rivet baseline verify` flags that the supplier repo's `baseline/v4` tag now points at a different commit than your `rivet.lock` records. An engineer (or an agent) re-runs `rivet lock` an hour before the release branch cut to make the diagnostic go green. The diff is mechanically resolved. Nobody asked the supplier why the baseline moved.

## 4. Rivet is not a safety case.

`safety/tool-qualification/rivet-tool-confidence.yaml` carries `claim-status: self-claimed` and a TCL1 / TI2 / TD1 self-claim under ISO 26262-8 §11.4.7. The dossier in `docs/design/tool-qualification-dossier.md` is explicit in its §0: there is no independent confirmation reviewer, the DO-330 / IEC 62304 / EN 50128 cross-walks are unverified at clause level, the five-layer independence argument is not yet defensible, and the Rocq corpus still contains one `Admitted` theorem. A typed tool-confidence artifact and a draft dossier are *inputs* to a safety argument that your assessor builds; they are not the argument itself. Self-claimed is not qualified. A GSN goal node that says "rivet is TCL1" is a claim awaiting evidence, not a conclusion.

*Cliff:* an agent generates a GSN safety case linking every `requirement` to a `verification` and reports "argument complete." The TCL claim on the qualification artifact is `self-claimed`. The argument is structurally sound and substantively unqualified. The notified body will say so.

## 5. Rivet is not a semantic validator.

Rivet validates the artifact's *shape*, not its *meaning*. Schema conformance, link integrity, status gates, s-expression rules — all of these check the artifact as a piece of structured data. They do not check whether the data describes the physical world correctly. A hazard whose `description` is hallucinated by an agent, or invented by a tired engineer on Friday afternoon, a `loss-scenario` whose causal chain is plausible but wrong, a `controller-constraint` that mechanically inverts the UCA but ignores a feedback loop nobody on the project has yet seen — all of these can pass `rivet validate` cleanly. The oracle checks shape and graph integrity; it has no semantic model of your physical system. The `ai-found-defect` triage loop exists precisely because AI authors introduce defects the surrounding mechanical layers will not catch — but the same defect class is older than AI authoring, and human-authored variants pass the same way.

*Cliff:* `rivet add hazard -t "Battery overheat during regen braking"` validates green. The hazard is real. Whoever authored it — agent or engineer — then writes a `loss-scenario` blaming a sensor the vehicle does not have. The link shape is correct, the status gate passes, the schema is satisfied. The system engineer who knows the bill of materials is the only person who can catch this.

## 6. Rivet is not a legal or DPIA conformance instrument.

The `dpia` artifact type and the schema's `lawful-basis`, `retention-period`, and `erasure-mechanism` fields are *records* of a Data Protection Impact Assessment. Recording an assessment is not performing one. DSGVO Art. 35 (GDPR Art. 35) requires a qualitative judgment about risk to data subjects that a data-protection officer, not a YAML validator, is competent to make. Likewise the EU AI Act schema's `risk-category` field records the classification; it does not produce it. Rivet makes the assessment auditable once it exists. Conformance with the underlying legal duty is an activity that happens *before* the artifact is written.

The recording-without-performing failure mode is common in practice for a structural reason: the recording is cheap and the performing is expensive. Writing a `dpia` YAML takes minutes; convening the DPO, mapping the data flows, and reaching a defensible risk judgment takes weeks. Under deadline pressure, every team — agent-driven or human-driven — defaults to the cheap operation and hopes nobody asks until after the release. Rivet cannot tell the two apart; the well-formed `dpia` artifact looks identical whether the assessment was performed or invented.

*Cliff:* the qualification dossier itself notes that `ai-session.invoker` is personal data per DSGVO Art. 4 (GDPR Art. 4), and that `rivet validate` does not yet enforce that an invoker-bearing session links to a DPIA. An engineer or agent stamps thousands of AI sessions with `invoker:` and zero DPIAs because the release branch cut is at 16:00. Validation is green. The DPO is not.

## 7. Rivet is not a multi-repo dependency manager.

`rivet sync`, `rivet lock`, and `rivet externals` operate on the **artifact graph** across repositories, not on the **repository lifecycle**. They are not `git submodule`, not `repo`, not `cargo workspaces`. They fetch external rivet projects to resolve cross-repo `prefix:ID` links and pin them for reproducibility. They do not coordinate code dependencies, manage version conflicts between non-rivet artifacts, build the dependency tree, or arbitrate ownership when two upstreams change incompatibly. Rivet's federation story is single-organization today (per `cross-org-supplier-traceability.md` §2) — `rivet supplier pull` is Phase 2 and explicitly **out of scope** for the current TCL claim.

*Cliff:* an agent runs `rivet sync` against a supplier repo that ships ReqIF rather than rivet YAML. The sync succeeds because the externals graph is satisfied at the directory level; the supplier's artifacts are unreadable; coverage silently reports the boundary as `UNCOVERED` rather than `EXTERNAL_BOUNDARY`. The matrix looks like the supplier never delivered.

## 8. Rivet is not an AI provenance verifier.

When an agent stamps an artifact with `provenance.created-by: ai-assisted` and `model: claude-opus-4-7`, Rivet records the self-report. It does not independently confirm that an Anthropic model was actually invoked, that the cited model version was the one used, or that the `ai-session` block honestly reflects the prompt and the response. The `rivet stamp` command writes what it is told to write. The pre-commit hook that auto-stamps on edits runs in the same trust boundary as the agent doing the editing. Provenance is a recording mechanism, not a forensic one — useful exactly to the degree that the surrounding process (signed commits, CI-side re-validation, the human reviewing the PR) is trusted.

*Cliff:* `git commit --no-verify` skips the hook. CLAUDE.md says so explicitly: "git commit --no-verify trivially bypasses all hooks." An artifact arrives in `main` with no AI provenance stamp and a human-author trailer. There is no way for `rivet validate` to know it was AI-authored. CI's independent `rivet validate` run will not flag this either, because the provenance field is descriptive, not verifiable.

---

## The worked example

Consider an agent driving Rivet to close coverage gaps. The schema declares that every `requirement` of ASIL B or higher must be `verified-by` at least one `verification` artifact. `rivet coverage` reports 12 uncovered requirements. The agent runs, for each gap:

```
rivet add verification --title "Verify <REQ-NNN> via unit test"
rivet link VER-NNN -t verifies --target REQ-NNN
rivet validate
```

`rivet validate` returns PASS. `rivet coverage` returns 100%. `rivet commits` accepts the trailer `Verifies: REQ-NNN`. The status-gate rule from `validation-rules:` confirms that promoting REQ-NNN to `approved` is now permitted because every `verifies` link target reaches the satisfied state. Every oracle is green.

The diagnostic that does **not** fire: no oracle confirms that any of the twelve `verification` artifacts describes a test that exists, runs, or would detect a violation of the requirement it claims to verify. Rivet's concept of "verifies" — like CVS's concept of "conflict" — is purely structural. It is a link of type `verifies` between two well-formed artifacts. Whether the verification *actually verifies the requirement* in the physical sense is outside the realm of Rivet's competence. The auditor reading the traceability matrix sees a green cell. The test report, when someone finally writes it, reveals the cell to be ceremony.

This is the Cederqvist function-signature example, the same pattern at a different layer: file A (the requirement) and file B (the verification) link cleanly. The textual graph is consistent. The logical conflict — *no test exists* — lives one layer above what the tool can see.

## The prescription

Cederqvist closed his *"CVS is not..."* section with: *"Acquire the habit of reading specs and talking to your peers."* The Rivet prescription is the same, adapted: read the artifacts your agent just wrote, and talk to the engineers whose domain the artifacts describe. A PASS from `rivet validate` means the graph is well-formed; it does not mean the system is safe, the requirement is correct, the supplier agrees, the DPO has been consulted, the test exists, or the tool is qualified. The Rivet user in 2026 is increasingly an AI agent paired with a human reviewer. The agent's job is to keep the graph well-formed. The reviewer's job is everything the graph cannot tell you. Neither role is optional; the tool will not catch you if you skip one.
