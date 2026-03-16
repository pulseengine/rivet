# OSLC Ecosystem Analysis and Strategic Recommendation

**Date:** 2026-03-16
**Artifacts:** REQ-006, FEAT-011, DD-001
**Status:** Research complete, recommendation pending decision

---

## 1. What Rivet's OSLC Module Already Implements

The existing implementation in `rivet-core/src/oslc.rs` (~1870 lines) is a
well-structured OSLC client that covers the core protocol mechanics. Feature-gated
behind `#[cfg(feature = "oslc")]` to isolate the `reqwest` dependency.

### Implemented (working, tested)

| Capability | Status | Evidence |
|---|---|---|
| Service Provider Catalog discovery | Complete | `OslcClient::discover()`, wiremock test |
| OSLC Query with `oslc.where` / `oslc.select` | Complete | `OslcClient::query()`, wiremock test |
| Pagination support (next_page parsing) | Partial | Response struct supports it, no auto-follow |
| GET single resource (JSON-LD) | Complete | `OslcClient::get_resource()`, wiremock test |
| POST to creation factory | Complete | `OslcClient::create_resource()`, wiremock test |
| PUT to update resource | Complete | `OslcClient::update_resource()`, wiremock test |
| Basic auth | Complete | `with_basic_auth()`, wiremock test |
| Bearer token auth | Complete | `with_bearer_token()`, wiremock test |
| RM domain types (Requirement) | Complete | `OslcRequirement` struct, full serde |
| QM domain types (TestCase, TestResult) | Complete | `OslcTestCase`, `OslcTestResult` structs |
| CM domain types (ChangeRequest) | Complete | `OslcChangeRequest` struct |
| OSLC-to-Artifact mapping | Complete | `oslc_to_artifact()`, 6 link types mapped |
| Artifact-to-OSLC mapping | Complete | `artifact_to_oslc()`, bidirectional |
| Sync diff computation | Complete | `compute_diff()` with remote/local/modified/unchanged |
| SyncAdapter trait (pull/push/diff) | Complete | `OslcSyncAdapter` implements trait |
| Pull (query -> artifacts) | Complete | Tested with mixed resource types |
| Push (artifacts -> create) | Basic | Always POSTs; no create-vs-update logic |
| Error handling (HTTP codes, malformed JSON) | Complete | 404, 500, malformed JSON/catalog tests |
| JSON-LD @type dispatching | Complete | `parse_member_resource()` with fallback |

### Not Implemented (gaps for real-world use)

| Gap | Severity | Notes |
|---|---|---|
| DELETE resource | Minor | Not needed for most sync workflows |
| TRS (Tracked Resource Set) | Major | Required for incremental sync; currently full-pull only |
| OAuth 1.0a (Jazz Form Auth) | **Critical** | IBM ELM uses Jazz form-based auth + OAuth 1.0a, not Basic/Bearer |
| OAuth 2.0 / OIDC | **Critical** | Modern Polarion/codebeamer may require OIDC |
| Resource Shapes validation | Medium | No shape discovery or constraint checking |
| ETag / If-Match concurrency | Medium | No optimistic concurrency control on PUT |
| Pagination auto-follow | Minor | `next_page` is parsed but not auto-followed |
| Delegated Dialogs | Low | Only needed for embedded UI (not Rivet's pattern) |
| OSLC-Core-Version 3.0 header | Minor | Currently sends "2.0"; should be configurable |
| Configuration Management (versions/baselines) | Major | No OSLC Config support for versioned resources |
| ASPICE type mapping | **Critical** | Only maps 4 generic types; no mapping for ASPICE's 14 types |
| Push with diff-based create/update | Medium | Push always creates; no update-existing logic |
| Rate limiting / retry | Minor | No backoff or retry on transient failures |
| RDF/XML content type | Medium | Only JSON-LD; codebeamer requires `application/rdf+xml` |

---

## 2. OSLC Core 3.0 Specification Requirements

OSLC Core 3.0 (OASIS Standard, August 2021) is an 8-part multi-part specification.
It was designed for backward compatibility with OSLC 2.0 -- most 2.0 servers remain
3.0 compliant without changes.

### Parts of the Specification

| Part | Title | Client relevance |
|---|---|---|
| 1 | Overview | Architecture guidance |
| 2 | Discovery | **Required** -- catalog, service providers |
| 3 | Resource Preview | Optional -- compact rendering for UI |
| 4 | Delegated Dialogs | Optional -- embedded creation/selection UI |
| 5 | Attachments | Optional -- binary file handling |
| 6 | Resource Shape | **Important** -- server resource validation |
| 7 | Vocabulary | **Required** -- common terms (dcterms, oslc) |
| 8 | Constraints | Machine-readable shapes |

### What a Conformant Client MUST Do

1. Preserve unknown properties between GET and PUT (Rivet's `extra: BTreeMap` field
   does this correctly for typed resources, but `serde(flatten)` may drop nested
   JSON-LD constructs)
2. Send `OSLC-Core-Version: 2.0` header (currently implemented correctly)
3. Support content negotiation for at least one RDF format

### What a Conformant Server MUST Do (not Rivet's concern as a client)

1. Support GET returning RDF
2. Return OSLC-Core-Version header
3. Implement OSLC Core vocabulary

### Domain Specifications (OASIS Standards)

| Domain | Version | Key resources |
|---|---|---|
| Requirements Management (RM) | 2.1 | Requirement, RequirementCollection |
| Quality Management (QM) | 2.1 | TestCase, TestResult, TestPlan, TestExecutionRecord |
| Change Management (CM) | 3.0 | ChangeRequest |
| Architecture Management (AM) | 3.0 | Resource (generic) |
| Configuration Management | 1.0 | Versions, baselines, change sets |
| Tracked Resource Set (TRS) | 3.0 | Base + ChangeLog for incremental sync |

### TRS (Tracked Resource Set) -- Key for Incremental Sync

TRS is the mechanism for change tracking without polling individual resources.
A TRS provides:
- **Base**: point-in-time enumeration of all tracked resources (LDP Container)
- **Change Log**: ordered series of creation/modification/deletion events
- **Cutoff**: point in the change log already reflected in the base

A client reads the Base initially, then polls the Change Log for deltas.
This is conceptually similar to git fetch -- get the full state once,
then apply incremental changes.

**Assessment**: TRS is essential for production OSLC sync but adds significant
complexity. Without TRS, Rivet must do full-pull-and-diff on every sync,
which is acceptable for small/medium artifact sets (< 10,000) but not for
large enterprise deployments.

---

## 3. Real ALM Tools and Their Actual OSLC Support

### IBM DOORS Next (ELM) -- The Gold Standard

**OSLC support: Deep, native, original**

DOORS Next is the reference OSLC implementation. IBM created OSLC.

- **Domains**: RM (native provider), QM consumer, CM consumer
- **OSLC version**: 2.0 with some 3.0 extensions
- **Auth**: Jazz Form-based auth + OAuth 1.0a (not Basic Auth).
  Modern versions support OIDC (OpenID Connect).
  The authentication flow is complex: GET protected resource -> receive
  `X-com-ibm-team-repository-web-auth-msg: authrequired` header ->
  POST credentials to `/j_security_check` -> follow redirects -> get JSESSIONID.
  This is significantly more complex than Basic/Bearer auth.
- **TRS**: Supported. IBM uses TRS extensively for cross-tool integration
  within the ELM suite.
- **Config Management**: Supported (global configurations, baselines).
- **Practical notes**: DOORS Next is the most OSLC-capable tool, but its
  authentication mechanism is the most complex. Many OSLC client libraries
  exist for Java (Eclipse Lyo) but very few for Rust/non-Java languages.
  Module-level operations (document structure) are not fully exposed via OSLC.

### Siemens Polarion -- Partial, Growing

**OSLC support: Partial native, supplemented by OSLC Connect**

- **Domains**: RM (native), CM (native). **QM not natively supported** --
  requires manual admin configuration to add QM semantics.
- **OSLC version**: 2.0 / partial 3.0
- **Auth**: Basic Auth or token-based auth. More straightforward than Jazz.
- **REST API**: Polarion has a rich proprietary REST API (actively developed,
  version 2512 current) that is more capable than its OSLC endpoint for
  many operations. The REST API covers gaps that OSLC does not.
- **OSLC Connect**: Third-party product (SodiusWillert) that provides enhanced
  OSLC integration for Polarion, including linking to Jira, DOORS, etc.
  This suggests Polarion's native OSLC is not sufficient for cross-tool
  integration without middleware.
- **ReqIF**: Fully supported for import/export.
- **Practical notes**: For Polarion integration, the proprietary REST API
  is more practical than OSLC for most use cases. OSLC is primarily used
  for cross-tool linking with IBM ELM, not as the primary integration method.

### PTC codebeamer -- Partial, Evolving

**OSLC support: Provider and consumer, RM and CM domains**

- **Domains**: RM (provider/consumer), CM (provider/consumer).
  QM integration with IBM ETM added in codebeamer 3.1 (August 2025).
- **OSLC version**: 3.0 header required (`OSLC-Core-version: 3.0`)
- **Content type**: Requires `application/rdf+xml` (not JSON-LD!).
  This is a significant incompatibility with Rivet's current JSON-LD-only client.
- **Auth**: Basic Auth supported.
- **OSLC usage**: Primarily for linking with Windchill PLM and IBM ELM.
  Not the primary integration API for standalone use.
- **ReqIF**: Supported since codebeamer 7.6.0 for interchange with DOORS.
- **REST API**: codebeamer has a comprehensive proprietary REST API that
  is the primary integration method for most customers.
- **Practical notes**: codebeamer's OSLC is focused on PLM-to-ALM linking
  (PTC ecosystem integration), not on general-purpose data sync.

### Jama Connect -- External Adapter Only

**OSLC support: Not native. Requires third-party adapter.**

- **No native OSLC**: Jama does not implement OSLC natively.
- **OSLC adapter**: Available via Koneksys (oslc-adapter-jama on GitHub),
  which wraps Jama's REST API as an OSLC provider. This adapter supports
  RM domain and OAuth 1.0a but is a community/third-party project.
- **OSLC Model Connector**: Partnership with MiD/Smartfacts provides
  MBSE integration via OSLC, but this is for model-to-requirements linking,
  not general artifact sync.
- **REST API**: Jama has a well-documented REST API that is the primary
  integration method.
- **Practical notes**: Integrating with Jama via OSLC requires running a
  separate adapter service. Direct REST API integration is more practical.

### Summary: Actual OSLC Implementation Reality

| Tool | Native OSLC | RM | QM | CM | TRS | Auth Method | Primary API |
|---|---|---|---|---|---|---|---|
| DOORS Next | Yes (deep) | Yes | Yes | Yes | Yes | Jazz OAuth 1.0a / OIDC | OSLC |
| Polarion | Partial | Yes | No* | Yes | No | Basic / Token | Proprietary REST |
| codebeamer | Partial | Yes | Partial | Yes | No | Basic | Proprietary REST |
| Jama Connect | No | Adapter | No | No | No | OAuth 1.0a (adapter) | Proprietary REST |

*\* QM requires admin-level semantic configuration*

**Key finding**: Only IBM DOORS Next uses OSLC as its primary integration API.
Polarion, codebeamer, and Jama all have proprietary REST APIs that are more
capable, better documented, and more widely used than their OSLC endpoints.

---

## 4. The ASPICE Type Mapping Problem

Rivet's OSLC module maps only 4 generic OSLC types:

| OSLC Type | Rivet artifact type |
|---|---|
| oslc_rm:Requirement | requirement |
| oslc_qm:TestCase | test-case |
| oslc_qm:TestResult | test-result |
| oslc_cm:ChangeRequest | change-request |

But ASPICE v4.0 defines 14 artifact types that Rivet tracks:

| ASPICE Type | ASPICE Process | OSLC Mapping? |
|---|---|---|
| stakeholder-req | SYS.1 | oslc_rm:Requirement (lossy) |
| system-req | SYS.2 | oslc_rm:Requirement (lossy) |
| system-arch-component | SYS.3 | No OSLC equivalent |
| sw-req | SWE.1 | oslc_rm:Requirement (lossy) |
| sw-arch-component | SWE.2 | No OSLC equivalent |
| sw-detail-design | SWE.3 | No OSLC equivalent |
| unit-verification | SWE.4 | oslc_qm:TestCase (lossy) |
| sw-integration-verification | SWE.5 | oslc_qm:TestCase (lossy) |
| sw-verification | SWE.6 | oslc_qm:TestCase (lossy) |
| sys-integration-verification | SYS.4 | oslc_qm:TestCase (lossy) |
| sys-verification | SYS.5 | oslc_qm:TestCase (lossy) |
| verification-execution | -- | oslc_qm:TestResult (partial) |
| verification-verdict | -- | oslc_qm:TestResult (partial) |

**Fundamental problem**: OSLC's 4 resource types cannot represent ASPICE's
14-type V-model without information loss. The `aspice-process` field,
`method` field (automated-test, review, formal-verification, etc.), and the
detailed link types (derives-from, allocated-from, refines, verifies,
result-of, part-of-execution) have no OSLC-standard representation.

Workaround options:
1. Use `dcterms:type` or custom RDF properties to carry ASPICE type info
   (non-standard, tool-specific)
2. Map everything to generic Requirement/TestCase and lose type granularity
3. Use ReqIF instead, which preserves arbitrary attribute schemas

---

## 5. Eclipse SCORE and the Competitive Context

Eclipse SCORE (Safe Open Vehicle Core) is the primary adoption target for Rivet.

**SCORE's tooling approach**:
- **Documentation**: Sphinx + sphinx-needs (docs-as-code)
- **Requirements format**: `needs.json` (sphinx-needs export format)
- **Metamodel**: 50+ need types defined in `metamodel.yaml`
- **No OSLC usage**: SCORE does not use OSLC for tool synchronization
- **No ReqIF usage**: SCORE uses `needs.json` as its interchange format
- **Version control**: Git-based, plain text files

**Implication for Rivet**: The SCORE adoption opportunity (the strategic priority
per Rivet's roadmap) requires `needs.json` import (already implemented), not OSLC.
SCORE projects will not have Polarion or DOORS to sync with -- they use
sphinx-needs and git.

---

## 6. Alternative Approaches

### A. ReqIF Interchange (Already Implemented)

Rivet already has a working ReqIF 1.2 adapter (`rivet-core/src/reqif.rs`).

**Strengths**:
- Universal support: DOORS, Polarion, codebeamer all import/export ReqIF
- File-based: works across organizational boundaries (no server access needed)
- Preserves arbitrary attributes via ReqIF SPEC-OBJECT-TYPE/ATTRIBUTE
- Git-friendly when stored as XML files
- OMG standard with strong automotive industry adoption
- No authentication complexity

**Weaknesses**:
- Not real-time; requires explicit export/import cycles
- No incremental sync (full document exchange)
- XML verbosity
- Tool-specific attribute mapping still needed

**Assessment**: ReqIF is the proven interchange format for cross-company
requirements exchange in automotive. Every major ALM tool supports it. It is
the right format for "send requirements to supplier / receive from customer"
workflows, which is the dominant integration pattern in ASPICE processes.

### B. needs.json Import (Already Implemented)

Rivet already has a working needs.json adapter (`rivet-core/src/formats/needs_json.rs`).

**Strengths**:
- Direct path to Eclipse SCORE adoption
- JSON format, lightweight, git-friendly
- Preserves sphinx-needs-specific metadata
- No server infrastructure required

**Assessment**: This is the highest-priority integration for the SCORE adoption
play. Already implemented.

### C. Direct REST Adapters Per Tool

The approach OSLC was supposed to replace. Build specific adapters for
each tool's proprietary REST API.

**Strengths**:
- Full access to tool-specific features
- Better documentation and community support
- More reliable authentication
- Can leverage tool-specific SDKs

**Weaknesses**:
- N adapters for N tools (maintenance burden)
- API versioning and deprecation risk
- Each adapter is a significant effort

**Assessment**: Pragmatic but not scalable. Should be considered only for
the 1-2 tools with the highest demand from actual users.

### D. Git-Based Sync (Export/Import YAML)

Rivet's native format is YAML in git. The simplest "sync" is:
1. Export YAML from Rivet
2. Commit to a shared git repo
3. Other tools import from the repo (via adapter)

**Strengths**:
- Zero infrastructure
- Full Rivet fidelity (no lossy mapping)
- Git provides history, branching, merge
- Already how SCORE projects work

**Assessment**: This is actually the dominant real-world pattern for
docs-as-code projects. It works when the "other tool" can import YAML/JSON.

---

## 7. Strategic Assessment

### The DD-001 Decision Should Be Revisited

DD-001 ("OSLC over per-tool REST adapters") was based on the premise that
"Polarion, DOORS, and codebeamer already support [OSLC] natively" and that
"one adapter handles all tools."

**This premise is only partly true**:

1. Only DOORS Next has deep, native OSLC support. Polarion and codebeamer
   have partial OSLC that is secondary to their proprietary REST APIs.

2. OSLC's 4 resource types cannot represent ASPICE's 14-type V-model
   without information loss. ReqIF can.

3. OSLC authentication (Jazz OAuth, OIDC) is significantly more complex
   than the Basic/Bearer auth currently implemented. A production OSLC
   client for DOORS Next requires implementing Jazz form-based auth,
   which involves multi-step HTTP redirects, cookie management, and
   CSRF token handling.

4. The OSLC ecosystem has low adoption: research indicates only ~20% of
   the 25 most prevalent ALM tools have any OSLC capability.

5. Eclipse SCORE (Rivet's strategic adoption target) does not use OSLC.

### The Existing OSLC Code Is Not Wasted

The OSLC module is well-architected and serves as a solid foundation:
- The `SyncAdapter` trait is useful regardless of protocol
- The mapping layer (`oslc_to_artifact`, `artifact_to_oslc`) demonstrates
  the pattern for any adapter
- The `SyncDiff` computation is protocol-independent
- The test infrastructure (wiremock-based) is exemplary

### Cost/Benefit Analysis

| Investment | Benefit | Priority |
|---|---|---|
| Complete OSLC client (Jazz auth, TRS, RDF/XML, Config Mgmt) | Connect to DOORS Next | Low -- only ~10% of target users have DOORS Next |
| ReqIF import/export (already done) | Exchange with any major ALM tool | **Already shipped** |
| needs.json import (already done) | SCORE adoption | **Already shipped** |
| Polarion REST adapter | Direct Polarion sync | Medium -- if user demand materializes |
| codebeamer REST adapter | Direct codebeamer sync | Medium -- if user demand materializes |

---

## 8. Recommendation

### Near-Term (Phase 2-3): Keep OSLC as-is, invest elsewhere

1. **Do not invest further in OSLC** until a concrete customer/user requires
   DOORS Next integration. The existing OSLC module is a working prototype
   that demonstrates the architecture. It is sufficient for the "we support
   OSLC" checkbox.

2. **Invest in ReqIF robustness** -- this is the universal interchange format
   that every major tool supports. Ensure round-trip fidelity with DOORS,
   Polarion, and codebeamer exports. Add attribute-type-to-ASPICE-type mapping.

3. **Invest in needs.json quality** -- this is the SCORE adoption path.
   Ensure that SCORE's 50+ need types import cleanly with full link preservation.

4. **Ship the WASM adapter runtime (FEAT-012)** -- this allows users to write
   their own tool-specific adapters without Rivet needing to maintain them.
   A WASM adapter for Polarion's REST API or codebeamer's REST API can be
   contributed by the community.

### Medium-Term: Demote DD-001, promote adapter trait

5. **Update DD-001 status** from `approved` to `superseded` with rationale:
   "OSLC remains supported but is not the primary integration strategy.
   ReqIF for interchange, needs.json for SCORE, and WASM adapters for
   tool-specific REST APIs provide better coverage with less complexity."

6. **Rename REQ-006 priority** from `should` to `could`. OSLC sync is
   a nice-to-have, not a must-have, given the real-world tool landscape.

### Long-Term: OSLC When Demanded

7. If a customer requires DOORS Next integration:
   - Implement Jazz form-based authentication
   - Add TRS support for incremental sync
   - Add RDF/XML content negotiation
   - Add OSLC Configuration Management for baseline support
   - This is a 4-6 week effort for a production-quality client

8. If a customer requires Polarion or codebeamer integration:
   - Build a direct REST adapter (not OSLC)
   - Package it as a WASM component
   - This is a 1-2 week effort per tool

### Priority Order for Integration Work

```
1. needs.json import    [done]  -- SCORE adoption
2. ReqIF import/export  [done]  -- Universal interchange
3. WASM adapter runtime [planned] -- Extensibility
4. Polarion REST adapter [on demand] -- If users request
5. codebeamer REST adapter [on demand] -- If users request
6. OSLC + DOORS Next     [on demand] -- If users request
```

---

## Sources

### OSLC Specifications
- [OSLC Core 3.0 Overview](https://docs.oasis-open-projects.org/oslc-op/core/v3.0/oslc-core.html)
- [OSLC Specifications Index](https://open-services.net/specifications/)
- [OSLC TRS 3.0](https://docs.oasis-open-projects.org/oslc-op/trs/v3.0/tracked-resource-set.html)
- [OSLC Core 3.0 Changes](https://docs.oasis-open-projects.org/oslc-op/core-3.0-changes/v1.0/pn01/core-3.0-changes.html)

### Tool OSLC Support
- [DOORS Next OSLC Services](https://www.ibm.com/docs/en/engineering-lifecycle-management-suite/doors-next/7.0.3?topic=function-extending-doors-next-by-using-oslc-services)
- [Polarion REST API](https://developer.siemens.com/polarion/rest-api-spec.html)
- [Polarion OSLC Services](https://docs.sodiuswillert.com/oslc-connect/latest/polarion-oslc-services-for-your-configuration)
- [Codebeamer OSLC Server Guide](https://support.ptc.com/help/codebeamer/r2.1/en/codebeamer/cb_dpt_integration/26334048.html)
- [Jama OSLC Adapter](https://github.com/OSLC/oslc-adapter-jama)

### Authentication
- [Jazz Authentication Wiki](https://github.com/OSLC/oslc-client/wiki/JazzAuthentication)
- [Jazz OAuth discussion](https://jazz.net/forum/questions/268230/oslc-rootservices-with-oauth1-vs-oauth2)

### Industry Analysis
- [OSLC Challenges (Jama Software)](https://www.jamasoftware.com/blog/oslc-what-is-it-and-what-are-its-challenges/)
- [OSLC as ALM Integration Standard](https://mgtechsoft.com/blog/what-is-open-services-lifecycle-collaboration/)
- [ReqIF vs OSLC comparison](https://www.se-trends.de/en/reqif-and-systems-engineering/)
- [ReqIF overview (Visure)](https://visuresolutions.com/alm-guide/reqif/)

### Eclipse SCORE
- [S-CORE Documentation](https://eclipse-score.github.io/score/main/)
- [Eclipse S-CORE GitHub](https://github.com/eclipse-score)
- [Sphinx-Needs](https://www.sphinx-needs.com/)
- [Open-Needs](https://open-needs.org/)
