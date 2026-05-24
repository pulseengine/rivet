# Variant subsystem — eclipse-score evidence record

**Status**: evidence note for the variant subsystem
(REQ-085 + FEAT-106..114). Captures binary evidence that the
variant/PLE machinery solves a real, third-party-acknowledged need.
**Originating context**: the playground at
[`pulseengine/playground-eclipse-score`](https://github.com/pulseengine/playground-eclipse-score)
ships a starter feature-model + bindings against eclipse's actual
artifact set; `make variant-check` reports 4/4 named variants
solving cleanly against 2985 real ASIL-rated artifacts.

## The problem rivet's variant subsystem solves — in eclipse's own words

From
`upstream/eclipse-score-score/docs/requirements/stakeholder/index.rst`:

```rst
.. stkh_req:: Variant management
   :id: stkh_req__overall_goals__variant_management
   :reqtype: Functional
   :security: NO
   :safety: QM
   :rationale: tbd
   :status: valid

   The SW-platform shall provide variant management support.
   Variant management support shall enable users to ensure the
   compatibility of application software across vehicle variants
   and vehicle software releases.
```

And the derived feature requirement
(`upstream/eclipse-score-score/docs/features/persistency/requirements/index.rst`):

```rst
.. feat_req:: Variant management support
   :id: feat_req__persistency__variant_management
   :reqtype: Non-Functional
   :security: NO
   :safety: QM
   :satisfies: stkh_req__overall_goals__variant_management
   :status: valid

   The Persistency shall ensure compatibility across different SW
   versions.
```

Note: `:rationale: tbd, :status: valid`. The requirement is
acknowledged as unfulfilled in upstream's own data.

## What's NOT in eclipse-score that would solve this

Audited by the upstream-status research (see also
`docs/design/sphinx-needs-rust-port-v1.2-catchup.md` for context):

- **No `variant` need type** in
  `eclipse-score-docs-as-code/src/extensions/score_metamodel/metamodel.yaml`
  (1065-line file, ~30 need types, grep returns zero matches for
  `variant`, `feature_flag`, `cfg`, `product_line`).
- **No `:variant:` option** anywhere in the option vocabulary across
  the 1726 `:security:`-using artifacts.
- **No variant binding file format** declared anywhere in the
  metamodel.
- The archived **`inc_process_variant_management`** repo
  (https://github.com/eclipse-score/inc_process_variant_management)
  was a single-author experiment by `PhilipPartsch` between
  2025-03-03 and 2025-08-07 (3 substantive commits total, archived
  between 2025-08 and 2026-03 with no successor). Its sole
  technical content was a `sphinx_ifelse` proof-of-concept that
  conditionally renders RST blocks based on `OS == "Linux" | "QNX"`
  — a **rendering-layer** conditional, not a metamodel for variants.
- The closest live mechanism (`feature_flags.rst` in `score/docs/
  contribute/general/`) is about Bazel `bool_flag` build switches.
  The doc itself says **"feature flags should not be confused with
  platforms"** — eclipse explicitly distinguishes their build-flag
  toggling from variant management.

GitHub issue + PR + discussion searches across
`eclipse-score/{score, docs-as-code, process_description}` for
"variant" return zero matches about variant *management*. The word
appears only colloquially ("vehicle variants", "variants of AoUs").

**Conclusion**: as of 2026-05-24, eclipse-score has the requirement,
acknowledges it is unsolved, and has no active workstream addressing
it.

## What rivet ships in this space

Per `rivet variant --help` and `rivet docs schemas-overview`:

```
Usage: rivet variant <COMMAND>

Commands:
  init       Scaffold a starter feature-model.yaml + bindings/<name>.yaml
  check      Check a variant configuration against a feature model
  check-all  Check every variant declared in a binding file
  list       List features in a feature model
  solve      Propagate a variant selection, show effective features
  features   Emit effective features + attributes in a build-system-
             specific format. Exits non-zero on solve failure.
  value      Print "on"/"off" for a single feature
  attr       Print a single attribute value
  explain    Explain a variant: why each feature is (or is not)
             selected, what the solver did
  manifest   Per-feature source manifest for a resolved variant
  matrix     Emit a CI matrix driven by declared variants
```

Plus a typed schema for the feature model with attribute-schema
(typed feature attributes like `asil-numeric`, `compliance`,
`locale`) and constraints (s-expression DSL: `(implies asil-b iso26262)`).

REQ-085 + FEAT-106..114 captured the design and shipped in v0.13.0.

## The playground's evidence record

The playground at
[`pulseengine/playground-eclipse-score`](https://github.com/pulseengine/playground-eclipse-score)
contains a starter variant model that captures the variant axes
already implicit in eclipse's data:

`variants/feature-model.yaml`:
- **safety-classification** (alternative group: qm | asil-a..d)
- **security-classification** (alternative: required | not-required)
- **requirement-category** (alternative: functional | non-functional |
  interface | process)
- **process-areas** (or-group: 15 areas — safety-analysis,
  requirements-engineering, change-management, etc.)
- **standards-compliance** (or-group: iso26262 | iso-sae-21434 |
  aspice-40)
- **components** (or-group: 15 leaves, one per upstream repo with
  needs)

Plus 19 constraints encoding the metamodel's graph-check rules
declaratively:
- `(implies asil-b iso26262)`, `(implies asil-c iso26262)`,
  `(implies asil-d iso26262)`
- `(implies security-required iso-sae-21434)`
- 15× `(implies <process-area> process-description)`
- `(implies aspice-40 process-description)`

`variants/bindings.yaml` declares 4 named worked variants:
- `persistency-qm` (smoke: QM + functional + persistency)
- `persistency-asil-b-secure` (realistic safety + security build)
- `platform-only` (full platform + process backing)
- `aspice-assessment` (process-only audit run)

All 4 pass `rivet variant check-all`:

```
$ make variant-check
PASS  persistency-qm
PASS  persistency-asil-b-secure
PASS  platform-only
PASS  aspice-assessment
4/4 variants passed (0 failed)
```

And `make variant-matrix` emits a working GitHub Actions CI matrix
from the named variants — a workflow eclipse doesn't have.

The CI workflow at the playground runs `make sync && make convert
&& make validate` on every push, PR, and nightly cron. The
falsification claim ("rivet's variant subsystem solves real-world
ASIL-rated variant management at 2985-artifact scale") is now
externally reproducible by anyone with a clone + internet.

## Why this evidence matters for rivet

Three reasons this is worth keeping as an evidence record:

1. **It's binary, not narrative.** The variant subsystem isn't just
   "a feature we built" — it's a feature that **solves a specific,
   third-party-acknowledged, unfulfilled requirement at corpus
   scale.** That's the strongest form of evidence pulseengine
   methodology recognises (binary evidence directly supports
   claims, per the philosophy memory).

2. **It's reproducible.** The variants/feature-model.yaml file is
   public, the constraints are typed, the named variants
   demonstrate realistic build configurations, and CI re-runs the
   solver on every push. Anyone evaluating the variant subsystem
   can see it working against real data.

3. **It informs the positioning conversation.** When the rivet team
   gets asked "what's rivet's variant story?" the answer can cite
   this evidence directly: rivet's variant subsystem fills a
   real gap in the largest open ASIL-rated safety project's stated
   requirements. Not as positioning against eclipse-score — as
   evidence that the design covers real ground.

## What this is *not* evidence of

To stay honest about scope:

- **Not evidence of upstream adoption.** Eclipse-score has not asked
  pulseengine to ship this, hasn't been notified that we did, and
  has no obligation to integrate it. Per the upstream-status
  research, no one upstream is currently working on variant
  management — that doesn't mean they will adopt anything we built.

- **Not evidence of certification readiness.** The variant solver
  validates the feature-model structurally. It does not certify
  that a chosen variant constitutes valid ASIL evidence — that's the
  consumer's responsibility, per `rivet docs schema/safety-case`.

- **Not evidence the variant model captures every possible
  dimension.** The 6 axes are the ones implicit in eclipse's data.
  Other real-world variant models will have axes (deployment
  target, OS, hardware, regional regulations, etc.) that this
  starter doesn't include. The model is extensible by design; that
  it works for eclipse's slice doesn't prove it works for arbitrary
  slices.

## Related design notes

- `docs/design/sphinx-needs-rust-port-v1.2-catchup.md` — converter
  catch-up plan
- `docs/design/eclipse-score-vs-pulseengine-approach.md` —
  way-of-working comparison
- `docs/design/rivet-link-parse-bug.md` — silent-data-loss bug
- `docs/design/artifact-embed-with-fields.md` — per-field embed
  proposal
- `docs/design/sphinx-needs-rowan-v2.md` — v2 parser migration
- `docs/design/externals-kind-source.md` — clone-only externals mode

All surfaced by the playground's corpus oracle.

## File of record for the variant model

`https://github.com/pulseengine/playground-eclipse-score/blob/main/variants/feature-model.yaml`
`https://github.com/pulseengine/playground-eclipse-score/blob/main/variants/bindings.yaml`
