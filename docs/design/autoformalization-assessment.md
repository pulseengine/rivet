# Autoformalizing Requirements to Lean — Assessment

Audience: maintainers deciding whether rivet should pursue autoformalizing
natural-language requirements into Lean propositions with proved biconditional
equivalence as certification evidence. Scope: REQ-340 / issue #508.

REQ-340 required two things, and this document does both: the issue's claims
checked **against the papers' source** rather than their abstracts, and the
central claim about rivet **tested on rivet's own artifacts** rather than
assumed.

## 1. TL;DR

**Decision: ACKNOWLEDGE. Do not pursue now.**

The lead rested on one claim — that rivet's *"typed, pre-grounded requirements
largely solve"* the paper's biggest bottleneck, making rivet *"ahead of the
literature"*. **Measured on rivet's corpus, that claim is false.** Rivet grounds
artifact *identity*; it does not ground what a requirement's *predicate talks
about*, which is the thing the paper means by grounding.

Of the issue's four claims about the literature, one is supported, one partly,
and **two are not in their cited sources at all**.

The investigation did surface one real improvement, independent of Lean:
62 of 67 STPA unsafe control actions name their control action in free text
that resolves to nothing (§4). That is filed separately.

## 2. What the paper actually does

Source: arXiv:2511.11829v1, Gupte & S. (General Motors), *"Towards
Autoformalization of LLM-generated Outputs for Requirement Verification."*
Read from the HTML and figures; Lean appears only as screenshots, so code
below is transcribed.

**The claimed bottleneck is real.** §5.4: *"manual grounding of variables is
the most critical and labor-intensive step in this pipeline."* (Qualitative —
the paper never measures time.)

**But grounding means something specific, and narrower than the issue implied.**
It is a human writing equality hypotheses asserting that two *LLM-invented*
variable names denote the same thing. §4.1: *"we need to manually point to the
Lean compiler that a set of variables having different naming conventions
actually refer to the same variable."* From Fig 5:

```lean
theorem req1_eq_req2
  (h_speed : mean_vehicle_speed = VehicleSpeedAverageDriven)
  (h_reminder_speed : seatbelt_reminder_speed = CALIBRATABLESeatbeltReminderSpeed)
  (h_seatbelt : seatbelt_plugged_in = Seatbelt) :
  (scc initiate_chime mean_vehicle_speed seatbelt_reminder_speed seatbelt_plugged_in) ↔
  (initiateSeatBeltChime initiate_chime VehicleSpeedAverageDriven CALIBRATABLESeatbeltReminderSpeed Seatbelt) := by
  simp_all [scc, initiateSeatBeltChime]
```

Once those three equalities are substituted the two propositions are
syntactically identical — so `simp_all` closes the goal. **The proof is carried
by the human's grounding hypotheses, not discovered by the prover.**

**Scale.** A 7B DeepSeek-Prover-V2, **four** requirements plus one generated
scenario, no success rates, self-described *"proof-of-concept"*. The
requirements are seatbelt chime and indicator *feature* requirements; the words
"safety", "ISO" and "26262" do not appear in the body.

**An unreported fidelity error that is the most important finding here.** In
§4.1, R1 reads *"Vehicle Speed Average Driven **≥** CALIBRATABLE Seatbelt
Reminder Speed"* while R2 reads *"greater than"*. The Lean formalization of R1
uses `>`. So the two natural-language requirements **differ when the speed
equals the threshold**, yet the pipeline "proved" them equivalent — because what
was proved equivalent was the two *formalizations*, one of which was wrong. The
paper does not mention this.

That is the whole risk of this technique in one example: **a machine-checked
proof of the wrong proposition** looks exactly like a machine-checked proof of
the right one.

## 3. The issue's four claims, checked against source

| Claim in #508 | Verdict | What the source says |
|---|---|---|
| **A.** Variable grounding is the paper's biggest manual bottleneck | **SUPPORTED**, with a caveat | Ranked first three times (§5.2, §5.4). But types differ too, not just names: *"a single physical parameter is represented using distinct variable names **and types**"* — Fig 10 has one sample as `Bool`, another as `Int`. An equality hypothesis cannot join a Bool to an Int. |
| **B.** Demonstrated on automotive safety requirements with DeepSeek-Prover-V2 | **PARTLY** | Model confirmed (7B, §3.1). "Safety" is not the paper's word; n = 4; no rates; proof-of-concept. |
| **C.** Nobody packages autoformalized requirements as DO-178C/ISO 26262 certification evidence (arXiv:2507.14330) | **NOT SUPPORTED** | Zero occurrences of "autoformal", "certif", "DO-178" or "26262" in the full text. An inference from silence. The paper even cites existing automotive work: *"Req2Spec converts 71% of BOSCH automotive requirements into formal specs."* |
| **D.** LLM-judged equivalence 97% → 67% on manual check (arXiv:2505.23486) | **NOT FOUND** | Neither figure appears in v1 or v2, HTML or PDF. The survey reports no LLM-judge accuracy figure at all. The number came from somewhere else. |

Claims C and D are the kind of citation that survives because nobody opens the
paper. Both had been carried in the issue for three and a half months.

## 4. The rivet claim, tested on rivet's corpus

The issue's pivotal claim: rivet's requirements are *"typed, pre-grounded"*,
which *"largely solve"* grounding. The paper states what grounding would need:
§5.2 — *"the necessity of grounding the entire autoformalization pipeline
within the system's defined ontology"*, proposing comparison against *"a formal
data dictionary."*

So the test is: **does rivet have a formal vocabulary of the things a
requirement's predicate is about?**

**No schema declares a variable, signal or quantity type.** Across every schema
under `schemas/`, the only names matching `variable|signal|quantity|unit|data`
are false positives — `unit` means *software unit*, the `data-*` types describe
datasets. There is no data dictionary.

**The most formal part of the corpus, STPA, confirms it.** Measured through
rivet's own store (`rivet list --format json --full`, guarded by an assertion
that `fields` are populated):

```
How does an unsafe control action name the control action it is about?
   62 / 67   free text that resolves to NOTHING in the store      (93%)
    5 / 67   a string that is an artifact ID

Controller process models:   8 prose lists,   0 typed
```

For example, UCA-C-1's control action is *"Build link graph, validate
artifacts, generate metrics"* — a sentence that matches none of the 20
control-action artifacts that exist. And every controller's process model is a
list of English phrases (*"Current state of local artifact files"*), with no
ids, types, units or ranges.

**What rivet does ground is artifact identity.** `issued-by → CTRL-CORE` and
`leads-to-hazard → H-1` are real typed links. That is valuable, and it is what
the issue mistook for grounding — but it answers *"which artifact is this
about?"*, not *"what quantity does this predicate constrain?"*. The paper's
bottleneck is the second question.

**So rivet is not ahead of the literature on grounding; it is at the same
starting line** — a paper-shaped problem of reconciling names in free text,
with no ontology to reconcile them against.

## 5. Decision

**ACKNOWLEDGE.** Record the technique, do not pursue it now.

- **Not ADOPT**: the precondition — a typed signal vocabulary that the
  formalizer is restricted to — does not exist in rivet, and the published
  evidence is four requirements on a 7B model with an unreported fidelity
  error.
- **Not INTEROPERATE**: there is no stable external format or tool to
  interoperate with; this is a technique, not an artefact.

**Revisit when both hold:** rivet has typed process-model variables that
artifacts reference by id, *and* there is a fidelity check between each
requirement and its formalization (back-translation or human review) — the
check that would have caught `≥` versus `>`.

## 6. What this surfaced that is worth doing anyway

The corpus test found a defect in rivet's own model, independent of Lean:

1. **UCA → control action should be a typed link, not a string.** 62 of 67
   UCAs reference their control action in free text that resolves to nothing,
   and `rivet validate` passes. STPA's value depends on each UCA being
   attributable to a specific control action; today that attribution is prose.
2. **Process-model entries should be addressable.** A UCA's `context` can only
   reference the controller's belief it is about by paraphrase. Giving
   process-model variables ids would let a UCA cite the belief it invalidates.

Both improve STPA rigour on their own merits, and both are exactly the
groundwork this technique would need if it is ever revisited. Filed as a
separate requirement.

## 7. Guardrails worth keeping from #508 regardless

The issue's instinct was right even where its citations were not:

- **Never trust an equivalence proof without a fidelity check** on each
  formalization. §2's `≥`/`>` error is the concrete demonstration.
- **Never trust an LLM-judged equivalence score.** The 97%→67% figure is not in
  the cited survey, so do not repeat it — but the principle stands on better
  evidence (see the LLM-as-judge findings recorded for the link-plausibility
  work, e.g. Cohen's κ ≈ 0.28 against human judgement).

## 8. Evidence register

| Claim | Source |
|---|---|
| Grounding ranked most labour-intensive | arXiv:2511.11829v1 §5.2, §5.4 |
| Grounding = human equality hypotheses | §4.1; Fig 5; Appendix A.2 |
| Types differ, not only names | §5.2; Fig 10 |
| 7B model, n = 4, proof-of-concept | §3.1; conclusion; §6 |
| R1 `≥` formalized as `>` | §4.1 text vs Figs 3 and 5 (full resolution) |
| Need for an ontology / data dictionary | §5.2 |
| Claim C absent from arXiv:2507.14330 | full-text search, v1 |
| Claim D absent from arXiv:2505.23486 | v1 and v2, HTML and PDF |
| No variable/signal type in any rivet schema | `schemas/*.yaml` |
| 62/67 UCAs unresolvable; 8/8 process models prose | rivet store, `list --full` |

**Not determined:** where the paper's requirements came from (*"a sample tool"*);
how long grounding actually took; the text of a warning glyph in Fig 5; whether
later versions of papers 1 and 2 changed anything (v1 of each was read); and
where the 97%/67% figure originates.
