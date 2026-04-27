# Quickstart — 10 oracle-gated steps

Each step has a **goal**, the **commands** to run, and an **oracle**:
a deterministic command + expected output that proves the step succeeded.
Copy-paste each block top-to-bottom; an AI agent can follow this end-to-end
without supervision because every step is mechanically checkable.

> The walk-through assumes a fresh empty directory. Substitute paths as
> needed; the oracles still hold.

---

## 1. Install + version check

**Goal**: get the `rivet` binary on your PATH.

```bash
cargo install --path rivet-cli
# or:    npm install -g @pulseengine/rivet
# or:    download a release tarball from
#        https://github.com/pulseengine/rivet/releases
```

**Oracle**:

```bash
rivet --version
```

Expected: a line of the form `rivet 0.5.0` (or higher). Non-zero exit
means the binary is not on PATH.

---

## 2. Initialise an empty project

**Goal**: scaffold `rivet.yaml` + `schemas/` + `artifacts/` + `docs/`.

```bash
mkdir my-project && cd my-project
rivet init --preset dev
```

**Oracle**:

```bash
test -f rivet.yaml && test -d artifacts && test -d docs && echo OK
```

Expected: `OK`. The `dev` preset wires the lightweight `requirement` /
`design-decision` / `feature` types so you can validate without committing
to a full ASPICE or STPA shape on day one.

---

## 3. Add a typed artifact

**Goal**: write one valid requirement.

```bash
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

Expected: `OK`. Both artifacts are present, the link target resolves, and
validation still passes.

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
       assert d.get('error_count',0)==0, d; print('OK')"
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

## 9. (Optional) Run the slop-hunt agent pipeline

**Goal**: try the four-prompt agent-driven audit on a rivet-managed repo.

```bash
ls scripts/mythos/   # if you cloned the rivet repo
```

The four prompts (`rank.md`, `discover.md`, `validate.md`, `emit.md`) are
designed to run inside a Claude Code session against any rivet-managed
project. The HOWTO walks through the workflow:

```bash
rivet docs --grep mythos
```

**Oracle** (when run inside a Claude Code session):

```bash
test -f .rivet/mythos/ranking.json && echo OK
```

Expected: `OK` — the rank step writes `ranking.json` with one entry per
source file, scored 1–5 for slop likelihood. See
`scripts/mythos/HOWTO.md` for the full pipeline.

---

## 10. Where to go next

```bash
rivet docs                       # list every embedded topic
rivet docs cli                   # CLI command reference
rivet docs schema/stpa           # STPA schema deep-dive
rivet docs schema/aspice         # ASPICE 4.0 V-model schema
rivet docs commit-traceability   # git-trailer rules for compliance
rivet docs formal-verification   # Kani / Verus / Rocq strategy
rivet docs cross-repo            # multi-repo linking
rivet mcp                        # start the MCP server for AI agents
rivet lsp                        # start the LSP server for editors
```

For the larger picture — three-pillar synthesis, why agents need typed
schemas and oracle gates together — read
[*Three patterns colliding*](https://pulseengine.eu/blog/three-patterns-colliding/).

For the per-situation playbook (compliance lineage, ASPICE, STPA-Sec,
EU AI Act) read `docs/what-is-rivet.md` in this repo or
`rivet docs schemas-overview` from any rivet install.
