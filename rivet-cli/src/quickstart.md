# Quickstart — 10 oracle-gated steps

**What is rivet?** It's a CLI that stores engineering artifacts
(requirements, features, decisions, hazards…) as typed YAML, validates
them and the typed links between them against a pluggable schema, and
exposes the resulting graph through a CLI, an HTTP dashboard, an LSP,
and an MCP server. Picture a Git-friendly, file-based replacement for
DOORS / Polarion / Jira where the artifact model is text and the
validator is `make`-fast. This walkthrough takes about 15 minutes.

Each step has a **goal**, the **commands** to run, and an **oracle**:
a deterministic command + expected output that proves the step succeeded.
Copy-paste each block top-to-bottom; an AI agent can follow this end-to-end
without supervision because every step is mechanically checkable.

> **Two ways to use this guide:**
>
> - **Greenfield** (recommended for first contact): work in a fresh empty
>   directory. Steps 1–10 run cleanly with no prior setup.
> - **Existing repo**: skip the `mkdir` in step 2, `cd` into your project
>   root, and read the *Existing-repo bring-up* appendix at the end before
>   committing to a schema preset.

---

## 1. Install + version check

**Goal**: get the `rivet` binary on your PATH.

```bash
# from a clone of the rivet repo:
cargo install --path rivet-cli

# or via npm (no source checkout needed):
npm install -g @pulseengine/rivet

# or download a binary release from:
# https://github.com/pulseengine/rivet/releases
```

**Oracle**:

```bash
rivet --version
```

Expected: a line of the form `rivet 0.5.0` (or higher). Non-zero exit
means the binary is not on PATH.

---

## 2. Initialise an empty project

**Goal**: scaffold `rivet.yaml`, `artifacts/`, and `docs/`, with one
seed artifact file as a placeholder example.

```bash
mkdir my-project && cd my-project
rivet init --preset dev
```

For an existing repo: skip `mkdir`, `cd` into your repo root, and pick
the preset that fits the domain:

- `dev` — lightweight `requirement` / `design-decision` / `feature` (good for first contact)
- `aspice` — automotive V-model SW process (Polarion/DOORS shape)
- `stpa` — Systems-Theoretic Process Analysis safety
- `eu-ai-act` — EU AI Act Annex IV conformity
- `safety-case` — GSN safety arguments

`rivet docs schemas-overview` lists every shipped preset.

**Oracle**:

```bash
test -f rivet.yaml && test -d artifacts && test -d docs && echo OK
```

Expected: `OK`. `init` creates a seed `artifacts/requirements.yaml`
with placeholder REQ-001 + FEAT-001 — a worked example you can inspect
(`cat artifacts/requirements.yaml`) and then delete in step 3.

---

## 3. Add a typed artifact

**Goal**: write one valid requirement.

```bash
# Replace the seed with your own clean slate. The seed REQ-001 collides
# with what we're about to write — delete it.
rm artifacts/requirements.yaml

cat > artifacts/sample.yaml <<'EOF'
artifacts:
  - id: REQ-001
    type: requirement
    title: Database write returns acknowledgement
    status: draft
    description: >
      The system shall return an acknowledgement record within 50 ms of
      a successful database write.
EOF
```

**Oracle**:

```bash
rivet list --type requirement --format json | grep -q '"id": "REQ-001"' && echo OK
```

Expected: `OK`. The artifact is now in the typed store and queryable.

> If you're importing from another system (Polarion, Jira, DOORS),
> preserve the source IDs as custom fields — see the
> *Existing-repo bring-up* appendix.

---

## 4. Validate — no diagnostics

**Goal**: prove the artifact survives the schema engine.

```bash
rivet validate
```

**Oracle**:

```bash
rivet validate --format json | grep -q '"result": "PASS"' && echo OK
echo "exit=$?"
```

Expected: `OK` and `exit=0`. A non-PASS result means the schema rejected
something — the JSON output lists every diagnostic.

---

## 5. List the typed artifact

**Goal**: confirm the typed query surface works.

```bash
rivet list --type requirement
```

**Oracle**:

```bash
rivet list --type requirement --format json \
  | grep -E '"id":\s*"REQ-001"' \
  && echo OK
```

Expected: `OK` and a row showing `REQ-001 | requirement | …`.

---

## 6. Add a second artifact + a typed link

**Goal**: write a feature that satisfies the requirement, with a typed
`satisfies` link from feature → requirement.

```bash
cat >> artifacts/sample.yaml <<'EOF'
  - id: FEAT-001
    type: feature
    title: Async write-ack pipeline
    status: draft
    links:
      - type: satisfies
        target: REQ-001
EOF
```

**Oracle**:

```bash
rivet list --format json \
  | grep -q '"id": "FEAT-001"' \
  && rivet validate --format json | grep -q '"result": "PASS"' \
  && echo OK
```

Expected: `OK`. Both artifacts are present, the link target resolves,
and validation still passes.

---

## 7. Re-run validate — link target resolves

**Goal**: prove the typed link is honoured by the validator.

```bash
rivet validate
```

**Oracle**:

```bash
rivet validate --format json \
  | python3 -c "import json,sys; d=json.load(sys.stdin); \
       assert d['result']=='PASS', d; \
       assert d.get('errors',0)==0, d; print('OK')"
```

Expected: `OK`. If you change `target: REQ-001` to a typo like
`target: REQ-999`, this oracle will fail with a broken-link diagnostic —
that's the loudness contract.

---

## 8. Start the dashboard

**Goal**: serve the typed graph over HTTP for human review.

```bash
rivet serve --port 3099 &
SERVE_PID=$!
sleep 1
```

**Oracle**:

```bash
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3099/artifacts
# expect: 200
kill "$SERVE_PID"
```

Expected: `200`. The dashboard renders the artifact list, the
traceability graph, the coverage matrix, and the document viewer. Open
http://localhost:3099 in a browser to see it; press `Cmd+K` for the
global search.

---

## 9. Add a living document

**Goal**: see how markdown documents with rivet embeds resolve.

```bash
cat > docs/coverage.md <<'EOF'
---
id: DOC-COVERAGE
title: Verification coverage report
type: report
---

# Coverage

{{stats}}

{{coverage}}

The async pipeline [[FEAT-001]] satisfies the latency contract
[[REQ-001]].
EOF
```

**Oracle**:

```bash
rivet validate --format json | grep -q '"result": "PASS"' && echo OK
```

Expected: `OK`. Restart the dashboard (step 8 killed it):

```bash
rivet serve --port 3099 &
SERVE_PID=$!
sleep 1
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3099/documents/DOC-COVERAGE
# expect: 200
kill "$SERVE_PID"
```

Open `http://localhost:3099/documents/DOC-COVERAGE` in a browser and
the document viewer renders the embeds with live stats + coverage; the
`[[REQ-001]]` references become clickable links.

For the full embed catalog: `rivet docs embed-syntax`.

---

## 10. Where to go next

```bash
rivet docs                       # list every embedded topic
rivet docs cli                   # CLI command reference
rivet docs schemas-overview      # all built-in presets
rivet docs schema/aspice         # ASPICE 4.0 V-model schema
rivet docs schema/stpa           # STPA hazard analysis
rivet docs commit-traceability   # git-trailer rules for compliance
rivet docs cross-repo            # multi-repo linking
```

The same artifact graph is also reachable from agents and editors:

- **MCP server** — `rivet mcp` exposes typed-graph queries to AI agents
  via Model Context Protocol. Claude Code calls it natively.
- **LSP server** — `rivet lsp` is the Language Server for editor
  integrations (jump-to-artifact, hover, diagnostics in YAML files).

For the larger picture — three-pillar synthesis, why agents need typed
schemas and oracle gates together — read
[*Three patterns colliding*](https://pulseengine.eu/blog/three-patterns-colliding/).

---

## Appendix: Existing-repo bring-up

Steps 1–10 work cleanly on a fresh directory. To bring rivet into an
existing project (a real codebase with real source-of-truth docs), the
flow is the same but with three additions.

### Pick the closest built-in preset

`rivet docs schemas-overview` lists every shipped preset. Pick the one
nearest to your existing document model — ASPICE for V-model SW
projects, STPA-Sec for safety/security analysis, `eu-ai-act` for
EU AI Act conformity, etc. You can always add a per-repo overlay on
top.

### Curate, don't bulk-import

The seed file is just an example. Replace it with ~5 hand-picked
artifacts per layer drawn from your existing docs. Use **verbatim
titles** so you can grep them back to the source.

> **Hard rule:** never bulk-extract on the first pass. The point of the
> first import is to discover where your real document model maps
> cleanly onto the rivet schema and where it does not. Bulk import
> hides both.

Preserve provenance:

```yaml
- id: SRS-001                    # rivet-native ID
  type: sw-req
  title: Unidirectional periodic data delivery  # verbatim from source
  fields:
    polarion_id: CMWD-66890      # source-of-truth pointer
    polarion_status: approved
```

### Add a project-local schema overlay

The base preset will not know your custom fields. To extend a base
type, you redeclare it in an overlay listing **every base field and
every base link-field, plus your additions**. Forgetting to repeat
them silently drops them — that's gotcha G.2.

#### Step 1: Dump the base type

```bash
rivet schema show requirement
rivet schema links               # all link types and their inverses
```

> **Caveat (gotcha G.7):** `rivet schema show <type>` only works for
> types in your *currently-loaded* schema. If you're planning an
> overlay over `aspice` from a `dev` project, the command will error
> with `Unknown artifact type`. Workaround: temporarily change
> `rivet.yaml`'s `schemas:` to include the target preset, run
> `rivet schema show`, then switch back.

#### Step 2: Write the overlay

Add `schemas/my-project-overlay.yaml`. The example below extends the
`requirement` type from the `dev` preset with a `polarion_id` field —
this is **complete and copy-pasteable from the project you built in
steps 1–10**. Note how every base field (`priority`, `category`,
`baseline`, `upstream-ref`) and every link-field (`satisfies`,
`derives-from`) is repeated verbatim:

```yaml
schema:
  name: my-project-overlay
  version: "0.1.0"
  extends: [common, dev]

artifact-types:
  - name: requirement                  # MUST match base type name
    description: Requirement with Polarion provenance
    fields:                            # MUST list ALL base fields + additions
      - name: priority
        type: string
        required: false
        allowed-values: [must, should, could, wont]
      - name: category
        type: string
        required: false
        allowed-values: [functional, non-functional, constraint, interface]
      - name: baseline
        type: string
        required: false
      - name: upstream-ref
        type: string
        required: false
      - name: polarion_id              # the addition
        type: string
        required: false
    link-fields:                       # MUST list ALL base link-fields
      - name: satisfies
        link-type: satisfies
        target-types: [any]
        required: false
        cardinality: zero-or-many
      - name: derives-from
        link-type: derives-from
        target-types: [any]
        required: false
        cardinality: zero-or-many
```

For larger presets like `aspice`, the same pattern applies: extend the
shipped `sw-req` / `sys-req` types, but the field/link-field lists are
longer. Always start by dumping the base with `rivet schema show`.

#### Step 3: Register the overlay

Edit `rivet.yaml`:

```yaml
project:
  name: my-project
  schemas:
    - common
    - dev
    - my-project-overlay         # bare name, no path, no .yaml
```

#### Step 4: Verify

```bash
rivet validate
rivet schema show requirement     # should now show polarion_id in Fields
```

If `polarion_id` appears in the Fields list, your overlay is wired in.
Add `polarion_id: <some-value>` under `fields:` on any requirement
artifact and re-validate to confirm.

---

## Appendix: Common gotchas

These are the rough edges most people hit on a first real bring-up.
None block you, but knowing them up-front saves time.

### G.1 The editor LSP doesn't see overlay types

When you use a project-local schema overlay, your YAML editor will flag
`unknown artifact type 'sw-req'` and similar errors. Trust
`rivet validate` (the CLI loads the overlay); ignore the LSP
diagnostics for overlaid types until LSP overlay support lands.

### G.2 Schema overlays merge by name and silently drop unlisted fields

Rivet has no `field-extensions:` syntax. To add a field to an existing
type, you redeclare the type in your overlay. **You must list every
field and every `link-fields:` entry the base type had**, plus your
additions. Forgetting to repeat the link-fields will make validation
fail with `link type 'X' is not defined in the schema` on artifacts
that worked yesterday.

### G.3 Forward and inverse link-types are independent

The `common` schema declares some link types only in their inverse
direction (e.g. `allocated-to` registered with `inverse: allocated-from`).
If your overlay uses `allocated-from` as the *forward* direction (as
ASPICE `sw-arch-component` does), declare it explicitly:

```yaml
link-types:
  - name: allocated-from
    inverse: allocated-to
    description: Forward allocation used by ASPICE arch components
```

### G.4 Document refs vs artifact refs

In `docs/*.md`, the double-bracket form like `[[REQ-001]]` resolves to
an artifact and becomes a clickable link. Pointing it at a *document*
ID produces a "document references X which does not exist" warning —
documents are not artifacts. Use plain markdown links between docs:

```markdown
See the [SRS](srs.md) for requirements.
```

### G.5 Be honest about stubs

When you import an artifact whose real content lives elsewhere, mark
it explicitly:

```yaml
- id: SYSREQ-001
  status: imported-stub
  description: |
    NOTE: Stub. The real content lives in upstream system document XYZ
    which is not yet imported into this rivet project.
```

The `imported-stub` status raises a WARN (not an INFO) so reviewers see
at a glance which artifacts are placeholders. Faking content defeats
the point of the typed model.

### G.6 Lifecycle severity scaling is intentional

`swe1-has-verification` (and similar lifecycle rules) fire:
- **WARN** for `status: approved` or `imported-stub`
- **INFO** for `status: draft`

This is by design — approved artifacts without verification deserve
more attention than drafts. Don't "fix" the warnings by downgrading
status.

### G.7 `rivet schema show <type>` only sees loaded types

`rivet schema show` introspects the schema the *current project* is
configured with (per `rivet.yaml`). Asking it about a type the project
doesn't load returns `Unknown artifact type`, even if that type exists
in another shipped preset. To plan an overlay over a different preset:

1. Temporarily set `rivet.yaml`'s `schemas:` to include the target
   preset (e.g. `aspice`).
2. Run `rivet schema show <type>` to dump fields and link-fields.
3. Restore `rivet.yaml` and write the overlay using what you dumped.

Or use a scratch project (`mkdir /tmp/dump-aspice && cd $_ && rivet
init --preset aspice && rivet schema show sw-req`) and copy from
there.
