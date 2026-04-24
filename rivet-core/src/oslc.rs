//! OSLC (Open Services for Lifecycle Collaboration) client module.
//!
//! This module provides a client for interacting with ALM tools that implement
//! the OSLC standard, such as IBM DOORS, Polarion, and codebeamer. OSLC is a
//! set of REST-based specifications that define how lifecycle tools expose and
//! consume resources using Linked Data principles (RDF, JSON-LD).
//!
//! # OSLC Protocol Overview
//!
//! OSLC defines domain-specific resource shapes and a discovery mechanism:
//!
//! 1. **Service Provider Catalog** — A root document (typically at a well-known
//!    URL) that lists all available service providers. Each provider represents
//!    a project or area that offers creation/query capabilities.
//!
//! 2. **Service Provider** — Describes the services offered for a particular
//!    project, including query capabilities and creation factories for each
//!    resource type.
//!
//! 3. **Resources** — Typed RDF resources identified by URI. OSLC defines
//!    domain specifications:
//!    - **oslc_rm** — Requirements Management (Requirement, RequirementCollection)
//!    - **oslc_qm** — Quality Management (TestCase, TestResult, TestPlan)
//!    - **oslc_cm** — Change Management (ChangeRequest)
//!
//! 4. **Query** — OSLC Query Syntax allows filtering and selecting resource
//!    properties: `oslc.where=dcterms:identifier="REQ-001"&oslc.select=dcterms:title`
//!
//! # Architecture
//!
//! The module is structured in layers:
//! - Resource types (`OslcRequirement`, `OslcTestCase`, etc.) map OSLC RDF
//!   types to Rust structs using JSON-LD serialization.
//! - `OslcClient` handles HTTP communication, service provider catalog
//!   discovery, and CRUD operations.
//! - `OslcSyncAdapter` provides bidirectional sync by converting between OSLC
//!   resources and Rivet's internal `Artifact` model.
//!
//! # Feature Flag
//!
//! This module is gated behind the `oslc` feature flag because it introduces
//! a dependency on `reqwest` for HTTP communication. Enable it with:
//!
//! ```toml
//! rivet-core = { version = "0.1", features = ["oslc"] }
//! ```

use std::collections::BTreeMap;
use std::fmt;

use serde::{Deserialize, Serialize};

use crate::error::Error;
use crate::model::{Artifact, ArtifactId, Link};

// ---------------------------------------------------------------------------
// OSLC namespace constants
// ---------------------------------------------------------------------------

/// RDF type URI for OSLC Requirements Management Requirement.
pub const OSLC_RM_REQUIREMENT: &str = "http://open-services.net/ns/rm#Requirement";

/// RDF type URI for OSLC Quality Management TestCase.
pub const OSLC_QM_TEST_CASE: &str = "http://open-services.net/ns/qm#TestCase";

/// RDF type URI for OSLC Quality Management TestResult.
pub const OSLC_QM_TEST_RESULT: &str = "http://open-services.net/ns/qm#TestResult";

/// RDF type URI for OSLC Change Management ChangeRequest.
pub const OSLC_CM_CHANGE_REQUEST: &str = "http://open-services.net/ns/cm#ChangeRequest";

/// Dublin Core Terms namespace (used for standard properties like title, identifier).
pub const DCTERMS_NS: &str = "http://purl.org/dc/terms/";

/// OSLC core namespace.
pub const OSLC_NS: &str = "http://open-services.net/ns/core#";

// ---------------------------------------------------------------------------
// OSLC Resource Types
// ---------------------------------------------------------------------------

/// Represents the kind of OSLC resource, mapping to the four supported
/// domain specifications.
#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum OslcResourceType {
    /// oslc_rm:Requirement — a requirements management artifact.
    Requirement,
    /// oslc_qm:TestCase — a quality management test case definition.
    TestCase,
    /// oslc_qm:TestResult — the result of executing a test case.
    TestResult,
    /// oslc_cm:ChangeRequest — a change or defect tracking artifact.
    ChangeRequest,
}

impl OslcResourceType {
    /// Return the RDF type URI for this resource type.
    pub fn rdf_type(&self) -> &'static str {
        match self {
            Self::Requirement => OSLC_RM_REQUIREMENT,
            Self::TestCase => OSLC_QM_TEST_CASE,
            Self::TestResult => OSLC_QM_TEST_RESULT,
            Self::ChangeRequest => OSLC_CM_CHANGE_REQUEST,
        }
    }

    /// Parse an RDF type URI into an `OslcResourceType`, if recognized.
    pub fn from_rdf_type(uri: &str) -> Option<Self> {
        match uri {
            OSLC_RM_REQUIREMENT => Some(Self::Requirement),
            OSLC_QM_TEST_CASE => Some(Self::TestCase),
            OSLC_QM_TEST_RESULT => Some(Self::TestResult),
            OSLC_CM_CHANGE_REQUEST => Some(Self::ChangeRequest),
            _ => None,
        }
    }

    /// Map this OSLC resource type to a Rivet artifact type name.
    pub fn to_artifact_type(&self) -> &'static str {
        match self {
            Self::Requirement => "requirement",
            Self::TestCase => "test-case",
            Self::TestResult => "test-result",
            Self::ChangeRequest => "change-request",
        }
    }

    /// Try to map a Rivet artifact type name to an OSLC resource type.
    pub fn from_artifact_type(artifact_type: &str) -> Option<Self> {
        match artifact_type {
            "requirement" | "req" | "SWREQ" | "SYSREQ" => Some(Self::Requirement),
            "test-case" | "test_case" | "testcase" => Some(Self::TestCase),
            "test-result" | "test_result" | "testresult" => Some(Self::TestResult),
            "change-request" | "change_request" | "changerequest" | "defect" | "bug" => {
                Some(Self::ChangeRequest)
            }
            _ => None,
        }
    }
}

impl fmt::Display for OslcResourceType {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        write!(f, "{}", self.rdf_type())
    }
}

/// An OSLC Requirement (oslc_rm:Requirement).
///
/// Represents a requirement in the OSLC Requirements Management domain.
/// Properties follow Dublin Core Terms and the OSLC RM vocabulary.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OslcRequirement {
    /// The resource URI (JSON-LD `@id`).
    #[serde(rename = "@id", default, skip_serializing_if = "Option::is_none")]
    pub about: Option<String>,

    /// The RDF type URI (JSON-LD `@type`).
    #[serde(rename = "@type", default)]
    pub rdf_type: Vec<String>,

    /// dcterms:identifier — external unique identifier.
    #[serde(
        rename = "dcterms:identifier",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub identifier: Option<String>,

    /// dcterms:title — human-readable title.
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// dcterms:description — detailed description.
    #[serde(
        rename = "dcterms:description",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub description: Option<String>,

    /// oslc_rm:elaboratedBy — links to elaborating resources.
    #[serde(
        rename = "oslc_rm:elaboratedBy",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub elaborated_by: Vec<OslcLink>,

    /// oslc_rm:satisfiedBy — links to satisfying resources.
    #[serde(
        rename = "oslc_rm:satisfiedBy",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub satisfied_by: Vec<OslcLink>,

    /// oslc_rm:trackedBy — links to tracking resources (e.g., change requests).
    #[serde(
        rename = "oslc_rm:trackedBy",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub tracked_by: Vec<OslcLink>,

    /// Additional properties not explicitly modeled.
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_json::Value>,
}

/// An OSLC TestCase (oslc_qm:TestCase).
///
/// Represents a test case definition in the OSLC Quality Management domain.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OslcTestCase {
    /// The resource URI (JSON-LD `@id`).
    #[serde(rename = "@id", default, skip_serializing_if = "Option::is_none")]
    pub about: Option<String>,

    /// The RDF type URI (JSON-LD `@type`).
    #[serde(rename = "@type", default)]
    pub rdf_type: Vec<String>,

    /// dcterms:identifier — external unique identifier.
    #[serde(
        rename = "dcterms:identifier",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub identifier: Option<String>,

    /// dcterms:title — human-readable title.
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// dcterms:description — detailed description of the test case.
    #[serde(
        rename = "dcterms:description",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub description: Option<String>,

    /// oslc_qm:validatesRequirement — links to requirements validated by this test.
    #[serde(
        rename = "oslc_qm:validatesRequirement",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub validates_requirement: Vec<OslcLink>,

    /// Additional properties not explicitly modeled.
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_json::Value>,
}

/// An OSLC TestResult (oslc_qm:TestResult).
///
/// Represents the outcome of a test execution in the OSLC Quality Management domain.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OslcTestResult {
    /// The resource URI (JSON-LD `@id`).
    #[serde(rename = "@id", default, skip_serializing_if = "Option::is_none")]
    pub about: Option<String>,

    /// The RDF type URI (JSON-LD `@type`).
    #[serde(rename = "@type", default)]
    pub rdf_type: Vec<String>,

    /// dcterms:identifier — external unique identifier.
    #[serde(
        rename = "dcterms:identifier",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub identifier: Option<String>,

    /// dcterms:title — human-readable title.
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// oslc_qm:status — the test execution status (passed, failed, etc.).
    #[serde(
        rename = "oslc_qm:status",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub status: Option<String>,

    /// oslc_qm:reportsOnTestCase — link to the test case this result is for.
    #[serde(
        rename = "oslc_qm:reportsOnTestCase",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub reports_on_test_case: Option<OslcLink>,

    /// Additional properties not explicitly modeled.
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_json::Value>,
}

/// An OSLC ChangeRequest (oslc_cm:ChangeRequest).
///
/// Represents a change request, defect, or work item in the OSLC Change
/// Management domain.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct OslcChangeRequest {
    /// The resource URI (JSON-LD `@id`).
    #[serde(rename = "@id", default, skip_serializing_if = "Option::is_none")]
    pub about: Option<String>,

    /// The RDF type URI (JSON-LD `@type`).
    #[serde(rename = "@type", default)]
    pub rdf_type: Vec<String>,

    /// dcterms:identifier — external unique identifier.
    #[serde(
        rename = "dcterms:identifier",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub identifier: Option<String>,

    /// dcterms:title — human-readable title.
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// dcterms:description — detailed description of the change.
    #[serde(
        rename = "dcterms:description",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub description: Option<String>,

    /// oslc_cm:status — the lifecycle status of the change request.
    #[serde(
        rename = "oslc_cm:status",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub status: Option<String>,

    /// oslc_cm:implementsRequirement — links to requirements implemented by this change.
    #[serde(
        rename = "oslc_cm:implementsRequirement",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub implements_requirement: Vec<OslcLink>,

    /// oslc_cm:affectsRequirement — links to requirements affected by this change.
    #[serde(
        rename = "oslc_cm:affectsRequirement",
        default,
        skip_serializing_if = "Vec::is_empty"
    )]
    pub affects_requirement: Vec<OslcLink>,

    /// Additional properties not explicitly modeled.
    #[serde(flatten)]
    pub extra: BTreeMap<String, serde_json::Value>,
}

// ---------------------------------------------------------------------------
// OSLC Link (resource reference)
// ---------------------------------------------------------------------------

/// A typed link to another OSLC resource, represented as `{ "@id": "..." }` in JSON-LD.
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
pub struct OslcLink {
    /// The URI of the linked resource.
    #[serde(rename = "@id")]
    pub href: String,
}

impl OslcLink {
    /// Create a new OSLC link pointing to the given URI.
    pub fn new(href: impl Into<String>) -> Self {
        Self { href: href.into() }
    }
}

// ---------------------------------------------------------------------------
// Unified OSLC Resource envelope
// ---------------------------------------------------------------------------

/// A type-erased OSLC resource for use in generic operations.
///
/// This enum wraps the domain-specific resource types so that mapping and
/// sync code can work uniformly across resource kinds.
#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "@type")]
pub enum OslcResource {
    /// An `oslc_rm:Requirement`.
    Requirement(OslcRequirement),
    /// An `oslc_qm:TestCase`.
    TestCase(OslcTestCase),
    /// An `oslc_qm:TestResult`.
    TestResult(OslcTestResult),
    /// An `oslc_cm:ChangeRequest`.
    ChangeRequest(OslcChangeRequest),
}

impl OslcResource {
    /// Return the resource type of this OSLC resource.
    pub fn resource_type(&self) -> OslcResourceType {
        match self {
            Self::Requirement(_) => OslcResourceType::Requirement,
            Self::TestCase(_) => OslcResourceType::TestCase,
            Self::TestResult(_) => OslcResourceType::TestResult,
            Self::ChangeRequest(_) => OslcResourceType::ChangeRequest,
        }
    }

    /// Return the `@id` (about URI) of this resource, if set.
    pub fn about(&self) -> Option<&str> {
        match self {
            Self::Requirement(r) => r.about.as_deref(),
            Self::TestCase(r) => r.about.as_deref(),
            Self::TestResult(r) => r.about.as_deref(),
            Self::ChangeRequest(r) => r.about.as_deref(),
        }
    }

    /// Return the identifier (`dcterms:identifier`) of this resource, if set.
    pub fn identifier(&self) -> Option<&str> {
        match self {
            Self::Requirement(r) => r.identifier.as_deref(),
            Self::TestCase(r) => r.identifier.as_deref(),
            Self::TestResult(r) => r.identifier.as_deref(),
            Self::ChangeRequest(r) => r.identifier.as_deref(),
        }
    }

    /// Return the title (`dcterms:title`) of this resource, if set.
    pub fn title(&self) -> Option<&str> {
        match self {
            Self::Requirement(r) => r.title.as_deref(),
            Self::TestCase(r) => r.title.as_deref(),
            Self::TestResult(r) => r.title.as_deref(),
            Self::ChangeRequest(r) => r.title.as_deref(),
        }
    }
}

// ---------------------------------------------------------------------------
// Service Provider Catalog discovery types
// ---------------------------------------------------------------------------

/// An OSLC Service Provider Catalog.
///
/// The catalog is the entry point for OSLC discovery. A client fetches the
/// catalog from a well-known URL and walks it to find service providers,
/// their query capabilities, and creation factories.
///
/// Catalogs can be nested — a top-level catalog may reference sub-catalogs
/// for different project areas.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceProviderCatalog {
    /// The URI of this catalog.
    #[serde(rename = "@id", default, skip_serializing_if = "Option::is_none")]
    pub about: Option<String>,

    /// dcterms:title — human-readable name of this catalog.
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// dcterms:description — description of this catalog.
    #[serde(
        rename = "dcterms:description",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub description: Option<String>,

    /// Nested sub-catalogs.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub referenced_catalogs: Vec<String>,

    /// Service providers listed in this catalog.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub service_providers: Vec<ServiceProvider>,
}

/// An OSLC Service Provider.
///
/// A service provider represents a project or area within an ALM tool that
/// offers OSLC services. Each provider has one or more `Service` entries
/// that describe what operations are available.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ServiceProvider {
    /// The URI of this service provider.
    #[serde(rename = "@id", default, skip_serializing_if = "Option::is_none")]
    pub about: Option<String>,

    /// dcterms:title — project/area name.
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// Services offered by this provider.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub services: Vec<Service>,
}

/// An OSLC Service describing available capabilities.
///
/// Each service groups query capabilities and creation factories for a
/// particular OSLC domain (RM, QM, CM).
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Service {
    /// The OSLC domain this service belongs to (e.g., the RM, QM, or CM namespace URI).
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub domain: Option<String>,

    /// Query capabilities offered by this service.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub query_capabilities: Vec<QueryCapability>,

    /// Creation factories offered by this service.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub creation_factories: Vec<CreationFactory>,
}

/// An OSLC Query Capability — describes a URL that supports OSLC Query Syntax.
///
/// Clients POST queries to the `query_base` URL using parameters like
/// `oslc.where` and `oslc.select` to retrieve filtered sets of resources.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryCapability {
    /// dcterms:title — human-readable name (e.g., "Requirement Query Capability").
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// The base URL for OSLC queries.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub query_base: Option<String>,

    /// The RDF types of resources returned by this query capability.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub resource_types: Vec<String>,
}

/// An OSLC Creation Factory — describes a URL that accepts POST to create resources.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CreationFactory {
    /// dcterms:title — human-readable name.
    #[serde(
        rename = "dcterms:title",
        default,
        skip_serializing_if = "Option::is_none"
    )]
    pub title: Option<String>,

    /// The URL to POST new resources to.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub creation: Option<String>,

    /// The RDF types of resources this factory can create.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub resource_types: Vec<String>,
}

// ---------------------------------------------------------------------------
// OSLC Query response
// ---------------------------------------------------------------------------

/// An OSLC query response page.
///
/// OSLC query results are returned as paged collections. Each page contains
/// a slice of member resources and an optional link to the next page.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryResponse {
    /// Total count of matching resources, if the server supports it.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub total_count: Option<u64>,

    /// URI of the next page, if more results are available.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub next_page: Option<String>,

    /// The member resources returned on this page (as raw JSON-LD values).
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub members: Vec<serde_json::Value>,
}

// ---------------------------------------------------------------------------
// Mapping functions: OSLC <-> Artifact
// ---------------------------------------------------------------------------

/// Convert an OSLC resource into a Rivet [`Artifact`].
///
/// This extracts the identifier, title, description, and links from the OSLC
/// resource and maps them into the Rivet data model. OSLC link relations are
/// translated to Rivet link types based on the OSLC property name.
///
/// # Errors
///
/// Returns an error if the resource lacks a `dcterms:identifier` (no way to
/// assign an artifact ID).
pub fn oslc_to_artifact(resource: &OslcResource) -> Result<Artifact, Error> {
    let resource_type = resource.resource_type();
    let artifact_type = resource_type.to_artifact_type().to_string();

    let id: ArtifactId = resource
        .identifier()
        .ok_or_else(|| Error::Adapter("OSLC resource missing dcterms:identifier".to_string()))?
        .to_string();

    let title = resource.title().unwrap_or("(untitled)").to_string();

    let (description, status, links, fields) = match resource {
        OslcResource::Requirement(r) => {
            let mut link_list = Vec::new();
            for link in &r.elaborated_by {
                link_list.push(Link {
                    link_type: "elaborated-by".to_string(),
                    target: extract_link_target(&link.href),
                });
            }
            for link in &r.satisfied_by {
                link_list.push(Link {
                    link_type: "satisfied-by".to_string(),
                    target: extract_link_target(&link.href),
                });
            }
            for link in &r.tracked_by {
                link_list.push(Link {
                    link_type: "tracked-by".to_string(),
                    target: extract_link_target(&link.href),
                });
            }
            (r.description.clone(), None, link_list, BTreeMap::new())
        }
        OslcResource::TestCase(r) => {
            let mut link_list = Vec::new();
            for link in &r.validates_requirement {
                link_list.push(Link {
                    link_type: "validates".to_string(),
                    target: extract_link_target(&link.href),
                });
            }
            (r.description.clone(), None, link_list, BTreeMap::new())
        }
        OslcResource::TestResult(r) => {
            let mut link_list = Vec::new();
            if let Some(link) = &r.reports_on_test_case {
                link_list.push(Link {
                    link_type: "reports-on".to_string(),
                    target: extract_link_target(&link.href),
                });
            }
            (None, r.status.clone(), link_list, BTreeMap::new())
        }
        OslcResource::ChangeRequest(r) => {
            let mut link_list = Vec::new();
            for link in &r.implements_requirement {
                link_list.push(Link {
                    link_type: "implements".to_string(),
                    target: extract_link_target(&link.href),
                });
            }
            for link in &r.affects_requirement {
                link_list.push(Link {
                    link_type: "affects".to_string(),
                    target: extract_link_target(&link.href),
                });
            }
            (
                r.description.clone(),
                r.status.clone(),
                link_list,
                BTreeMap::new(),
            )
        }
    };

    Ok(Artifact {
        id,
        artifact_type,
        title,
        description,
        status,
        tags: Vec::new(),
        links,
        fields,
        provenance: None,
        source_file: None,
    })
}

/// Convert a Rivet [`Artifact`] into an OSLC resource.
///
/// The artifact's `artifact_type` is used to determine the OSLC resource type.
/// Links are mapped to OSLC link properties where the link type name matches
/// a known OSLC relation; unrecognized link types are ignored.
///
/// # Errors
///
/// Returns an error if the artifact type cannot be mapped to a known OSLC
/// resource type.
pub fn artifact_to_oslc(artifact: &Artifact) -> Result<OslcResource, Error> {
    let resource_type =
        OslcResourceType::from_artifact_type(&artifact.artifact_type).ok_or_else(|| {
            Error::Adapter(format!(
                "cannot map artifact type '{}' to an OSLC resource type",
                artifact.artifact_type
            ))
        })?;

    match resource_type {
        OslcResourceType::Requirement => {
            let mut req = OslcRequirement {
                about: None,
                rdf_type: vec![OSLC_RM_REQUIREMENT.to_string()],
                identifier: Some(artifact.id.clone()),
                title: Some(artifact.title.clone()),
                description: artifact.description.clone(),
                elaborated_by: Vec::new(),
                satisfied_by: Vec::new(),
                tracked_by: Vec::new(),
                extra: BTreeMap::new(),
            };
            for link in &artifact.links {
                let oslc_link = OslcLink::new(&link.target);
                match link.link_type.as_str() {
                    "elaborated-by" => req.elaborated_by.push(oslc_link),
                    "satisfied-by" => req.satisfied_by.push(oslc_link),
                    "tracked-by" => req.tracked_by.push(oslc_link),
                    _ => {} // Ignore unmapped link types
                }
            }
            Ok(OslcResource::Requirement(req))
        }
        OslcResourceType::TestCase => {
            let mut tc = OslcTestCase {
                about: None,
                rdf_type: vec![OSLC_QM_TEST_CASE.to_string()],
                identifier: Some(artifact.id.clone()),
                title: Some(artifact.title.clone()),
                description: artifact.description.clone(),
                validates_requirement: Vec::new(),
                extra: BTreeMap::new(),
            };
            for link in &artifact.links {
                if link.link_type == "validates" {
                    tc.validates_requirement.push(OslcLink::new(&link.target));
                }
            }
            Ok(OslcResource::TestCase(tc))
        }
        OslcResourceType::TestResult => {
            let mut tr = OslcTestResult {
                about: None,
                rdf_type: vec![OSLC_QM_TEST_RESULT.to_string()],
                identifier: Some(artifact.id.clone()),
                title: Some(artifact.title.clone()),
                status: artifact.status.clone(),
                reports_on_test_case: None,
                extra: BTreeMap::new(),
            };
            for link in &artifact.links {
                if link.link_type == "reports-on" {
                    tr.reports_on_test_case = Some(OslcLink::new(&link.target));
                    break; // Only one reports-on link makes sense
                }
            }
            Ok(OslcResource::TestResult(tr))
        }
        OslcResourceType::ChangeRequest => {
            let mut cr = OslcChangeRequest {
                about: None,
                rdf_type: vec![OSLC_CM_CHANGE_REQUEST.to_string()],
                identifier: Some(artifact.id.clone()),
                title: Some(artifact.title.clone()),
                description: artifact.description.clone(),
                status: artifact.status.clone(),
                implements_requirement: Vec::new(),
                affects_requirement: Vec::new(),
                extra: BTreeMap::new(),
            };
            for link in &artifact.links {
                let oslc_link = OslcLink::new(&link.target);
                match link.link_type.as_str() {
                    "implements" => cr.implements_requirement.push(oslc_link),
                    "affects" => cr.affects_requirement.push(oslc_link),
                    _ => {}
                }
            }
            Ok(OslcResource::ChangeRequest(cr))
        }
    }
}

/// Extract a short artifact-id-like target from an OSLC link URI.
///
/// If the href is a full URL, this extracts the last path segment as the
/// identifier. If it is already a bare identifier, it is returned as-is.
fn extract_link_target(href: &str) -> ArtifactId {
    // Try to extract the last path segment from a URL
    if let Some(last) = href.rsplit('/').next() {
        if !last.is_empty() {
            return last.to_string();
        }
    }
    href.to_string()
}

// ---------------------------------------------------------------------------
// Sync diff types
// ---------------------------------------------------------------------------

/// Describes the difference between local and remote artifact sets.
///
/// Used by `OslcSyncAdapter::diff` to determine which artifacts need to be
/// created, updated, or deleted in either direction during bidirectional sync.
#[derive(Debug, Clone, Default)]
pub struct SyncDiff {
    /// Artifacts that exist remotely but not locally — should be pulled.
    pub remote_only: Vec<ArtifactId>,

    /// Artifacts that exist locally but not remotely — should be pushed.
    pub local_only: Vec<ArtifactId>,

    /// Artifacts that exist in both but have differences.
    pub modified: Vec<ArtifactId>,

    /// Artifacts that are identical on both sides.
    pub unchanged: Vec<ArtifactId>,
}

impl SyncDiff {
    /// Returns `true` if there are no differences between local and remote.
    pub fn is_empty(&self) -> bool {
        self.remote_only.is_empty() && self.local_only.is_empty() && self.modified.is_empty()
    }

    /// Total number of artifacts that differ between local and remote.
    pub fn diff_count(&self) -> usize {
        self.remote_only.len() + self.local_only.len() + self.modified.len()
    }
}

/// Compute the synchronization diff between a local and remote set of artifacts.
///
/// Comparison is based on artifact IDs. Two artifacts with the same ID are
/// considered "modified" if their titles or descriptions differ.
pub fn compute_diff(local: &[Artifact], remote: &[Artifact]) -> SyncDiff {
    let local_map: BTreeMap<&str, &Artifact> = local.iter().map(|a| (a.id.as_str(), a)).collect();
    let remote_map: BTreeMap<&str, &Artifact> = remote.iter().map(|a| (a.id.as_str(), a)).collect();

    let mut diff = SyncDiff::default();

    // Find remote-only and modified/unchanged
    for (id, remote_artifact) in &remote_map {
        if let Some(local_artifact) = local_map.get(id) {
            if artifacts_differ(local_artifact, remote_artifact) {
                diff.modified.push((*id).to_string());
            } else {
                diff.unchanged.push((*id).to_string());
            }
        } else {
            diff.remote_only.push((*id).to_string());
        }
    }

    // Find local-only
    for id in local_map.keys() {
        if !remote_map.contains_key(id) {
            diff.local_only.push((*id).to_string());
        }
    }

    diff
}

/// Check whether two artifacts with the same ID have meaningful differences.
fn artifacts_differ(a: &Artifact, b: &Artifact) -> bool {
    a.title != b.title
        || a.description != b.description
        || a.status != b.status
        || a.artifact_type != b.artifact_type
}

// ---------------------------------------------------------------------------
// OSLC Client (requires HTTP — gated on reqwest)
// ---------------------------------------------------------------------------

/// Configuration for connecting to an OSLC service provider.
#[derive(Debug, Clone)]
pub struct OslcClientConfig {
    /// Base URL of the OSLC service provider catalog (e.g.,
    /// `https://polarion.example.com/oslc/services/catalog`).
    pub base_url: String,

    /// Optional username for basic authentication.
    pub username: Option<String>,

    /// Optional password for basic authentication.
    pub password: Option<String>,

    /// Optional OAuth2 bearer token for authentication.
    pub bearer_token: Option<String>,

    /// Content type to request and send. Defaults to `application/ld+json`.
    pub content_type: String,
}

impl OslcClientConfig {
    /// Create a new configuration with just a base URL.
    /// Uses JSON-LD as the default content type.
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            username: None,
            password: None,
            bearer_token: None,
            content_type: "application/ld+json".to_string(),
        }
    }

    /// Set basic authentication credentials.
    pub fn with_basic_auth(mut self, username: String, password: String) -> Self {
        self.username = Some(username);
        self.password = Some(password);
        self
    }

    /// Set an OAuth2 bearer token.
    pub fn with_bearer_token(mut self, token: String) -> Self {
        self.bearer_token = Some(token);
        self
    }
}

/// An OSLC HTTP client for communicating with ALM tools.
///
/// The `OslcClient` encapsulates HTTP communication with OSLC-compliant
/// servers. It handles:
///
/// - **Discovery** — fetching the Service Provider Catalog to learn what
///   services and query capabilities are available.
/// - **Query** — issuing OSLC queries with `oslc.where` and `oslc.select`
///   parameters.
/// - **CRUD** — reading, creating, and updating individual OSLC resources
///   using standard HTTP methods (GET, POST, PUT).
///
/// The client requires the `reqwest` crate and is only available when the
/// `oslc` feature is enabled.
#[cfg(feature = "oslc")]
pub struct OslcClient {
    http: reqwest::Client,
    config: OslcClientConfig,
}

#[cfg(feature = "oslc")]
impl OslcClient {
    /// Create a new OSLC client with the given configuration.
    pub fn new(config: OslcClientConfig) -> Result<Self, Error> {
        let http = reqwest::Client::builder()
            .user_agent("rivet-oslc/0.1")
            .build()
            .map_err(|e| Error::Adapter(format!("failed to create HTTP client: {e}")))?;

        Ok(Self { http, config })
    }

    /// Discover the OSLC Service Provider Catalog at the configured base URL.
    ///
    /// This is the first step in the OSLC workflow: the client fetches the
    /// catalog to learn which service providers (projects) are available and
    /// what query/creation capabilities they offer.
    pub async fn discover(&self) -> Result<ServiceProviderCatalog, Error> {
        let response = self
            .build_get_request(&self.config.base_url)
            .send()
            .await
            .map_err(|e| Error::Adapter(format!("catalog discovery failed: {e}")))?;

        Self::check_response_status(&response)?;

        response
            .json::<ServiceProviderCatalog>()
            .await
            .map_err(|e| Error::Adapter(format!("failed to parse catalog: {e}")))
    }

    /// Execute an OSLC query against a query capability URL.
    ///
    /// # Parameters
    ///
    /// - `query_base` — the query capability URL obtained from discovery.
    /// - `where_clause` — an OSLC `oslc.where` expression (e.g.,
    ///   `dcterms:identifier="REQ-001"`). Pass an empty string to fetch all.
    /// - `select` — an OSLC `oslc.select` expression to control which
    ///   properties are returned (e.g., `dcterms:title,dcterms:description`).
    ///   Pass an empty string for server defaults.
    pub async fn query(
        &self,
        query_base: &str,
        where_clause: &str,
        select: &str,
    ) -> Result<QueryResponse, Error> {
        let mut url = query_base.to_string();
        let mut params = Vec::new();

        if !where_clause.is_empty() {
            params.push(format!("oslc.where={}", urlencoding::encode(where_clause)));
        }
        if !select.is_empty() {
            params.push(format!("oslc.select={}", urlencoding::encode(select)));
        }

        if !params.is_empty() {
            let sep = if url.contains('?') { '&' } else { '?' };
            url = format!("{}{}{}", url, sep, params.join("&"));
        }

        let response = self
            .build_get_request(&url)
            .send()
            .await
            .map_err(|e| Error::Adapter(format!("OSLC query failed: {e}")))?;

        Self::check_response_status(&response)?;

        response
            .json::<QueryResponse>()
            .await
            .map_err(|e| Error::Adapter(format!("failed to parse query response: {e}")))
    }

    /// Fetch a single OSLC resource by its URI as a raw JSON-LD value.
    ///
    /// This is used to retrieve the full representation of a resource after
    /// discovering its URI through a query or link traversal.
    pub async fn get_resource(&self, url: &str) -> Result<serde_json::Value, Error> {
        let response = self
            .build_get_request(url)
            .send()
            .await
            .map_err(|e| Error::Adapter(format!("GET resource failed: {e}")))?;

        Self::check_response_status(&response)?;

        response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| Error::Adapter(format!("failed to parse resource: {e}")))
    }

    /// Create a new OSLC resource by POSTing to a creation factory URL.
    ///
    /// # Parameters
    ///
    /// - `factory_url` — the creation factory URL obtained from discovery.
    /// - `resource` — the JSON-LD body to POST.
    ///
    /// Returns the server response body (typically the created resource with
    /// its assigned URI).
    pub async fn create_resource(
        &self,
        factory_url: &str,
        resource: &serde_json::Value,
    ) -> Result<serde_json::Value, Error> {
        let response = self
            .build_post_request(factory_url, resource)
            .send()
            .await
            .map_err(|e| Error::Adapter(format!("POST resource failed: {e}")))?;

        Self::check_response_status(&response)?;

        response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| Error::Adapter(format!("failed to parse created resource: {e}")))
    }

    /// Update an existing OSLC resource by PUTting to its URI.
    ///
    /// # Parameters
    ///
    /// - `resource_url` — the URI of the resource to update.
    /// - `resource` — the updated JSON-LD body.
    ///
    /// Returns the server response body.
    pub async fn update_resource(
        &self,
        resource_url: &str,
        resource: &serde_json::Value,
    ) -> Result<serde_json::Value, Error> {
        let response = self
            .build_put_request(resource_url, resource)
            .send()
            .await
            .map_err(|e| Error::Adapter(format!("PUT resource failed: {e}")))?;

        Self::check_response_status(&response)?;

        response
            .json::<serde_json::Value>()
            .await
            .map_err(|e| Error::Adapter(format!("failed to parse updated resource: {e}")))
    }

    /// Build a GET request with appropriate headers and auth.
    fn build_get_request(&self, url: &str) -> reqwest::RequestBuilder {
        let mut req = self
            .http
            .get(url)
            .header("Accept", &self.config.content_type)
            .header("OSLC-Core-Version", "2.0");

        req = self.apply_auth(req);
        req
    }

    /// Build a POST request with appropriate headers, auth, and body.
    fn build_post_request(&self, url: &str, body: &serde_json::Value) -> reqwest::RequestBuilder {
        let mut req = self
            .http
            .post(url)
            .header("Accept", &self.config.content_type)
            .header("Content-Type", &self.config.content_type)
            .header("OSLC-Core-Version", "2.0")
            .json(body);

        req = self.apply_auth(req);
        req
    }

    /// Build a PUT request with appropriate headers, auth, and body.
    fn build_put_request(&self, url: &str, body: &serde_json::Value) -> reqwest::RequestBuilder {
        let mut req = self
            .http
            .put(url)
            .header("Accept", &self.config.content_type)
            .header("Content-Type", &self.config.content_type)
            .header("OSLC-Core-Version", "2.0")
            .json(body);

        req = self.apply_auth(req);
        req
    }

    /// Apply authentication credentials to a request builder.
    fn apply_auth(&self, req: reqwest::RequestBuilder) -> reqwest::RequestBuilder {
        if let Some(token) = &self.config.bearer_token {
            req.bearer_auth(token)
        } else if let (Some(user), Some(pass)) = (&self.config.username, &self.config.password) {
            req.basic_auth(user, Some(pass))
        } else {
            req
        }
    }

    /// Check the HTTP response status and return an error for non-success codes.
    fn check_response_status(response: &reqwest::Response) -> Result<(), Error> {
        if response.status().is_success() {
            Ok(())
        } else {
            Err(Error::Adapter(format!(
                "OSLC server returned HTTP {}: {}",
                response.status().as_u16(),
                response.status().canonical_reason().unwrap_or("Unknown"),
            )))
        }
    }
}

// ---------------------------------------------------------------------------
// OSLC Sync Adapter
// ---------------------------------------------------------------------------

/// Trait for bidirectional artifact synchronization with an external system.
///
/// Implementors handle the pull/push/diff lifecycle for syncing Rivet
/// artifacts with a remote ALM tool over OSLC.
pub trait SyncAdapter {
    /// Pull artifacts from a remote OSLC service.
    ///
    /// Fetches all resources matching the configured query from the given
    /// service URL and converts them to Rivet artifacts.
    fn pull(
        &self,
        service_url: &str,
    ) -> impl std::future::Future<Output = Result<Vec<Artifact>, Error>> + Send;

    /// Push local artifacts to a remote OSLC service.
    ///
    /// Converts each artifact to an OSLC resource and creates or updates
    /// it on the remote server.
    fn push(
        &self,
        service_url: &str,
        artifacts: &[Artifact],
    ) -> impl std::future::Future<Output = Result<(), Error>> + Send;

    /// Compute the difference between local and remote artifact sets.
    fn diff(&self, local: &[Artifact], remote: &[Artifact]) -> SyncDiff;
}

/// An OSLC-based sync adapter backed by an [`OslcClient`].
///
/// This adapter implements bidirectional synchronization between a local
/// Rivet project and a remote ALM tool (Polarion, DOORS, codebeamer) via
/// the OSLC protocol.
///
/// # Sync Workflow
///
/// 1. **Pull**: `discover()` the catalog, find the query capability for the
///    desired resource type, `query()` for all matching resources, convert
///    each to an `Artifact` via `oslc_to_artifact()`.
///
/// 2. **Push**: For each local artifact, convert to an OSLC resource via
///    `artifact_to_oslc()`, then `create_resource()` or `update_resource()`
///    on the remote server.
///
/// 3. **Diff**: Compare local and remote artifact sets by ID to identify
///    what needs to be created, updated, or deleted in each direction.
#[cfg(feature = "oslc")]
pub struct OslcSyncAdapter {
    client: OslcClient,
}

#[cfg(feature = "oslc")]
impl OslcSyncAdapter {
    /// Create a new sync adapter wrapping an OSLC client.
    pub fn new(client: OslcClient) -> Self {
        Self { client }
    }

    /// Create a new sync adapter from a client configuration.
    pub fn from_config(config: OslcClientConfig) -> Result<Self, Error> {
        let client = OslcClient::new(config)?;
        Ok(Self { client })
    }

    /// Access the underlying OSLC client.
    pub fn client(&self) -> &OslcClient {
        &self.client
    }
}

#[cfg(feature = "oslc")]
impl SyncAdapter for OslcSyncAdapter {
    /// Pull artifacts from the remote OSLC service.
    ///
    /// Queries the given service URL for all available resources and converts
    /// them to Rivet artifacts. Uses an empty `oslc.where` clause to fetch
    /// all resources, with full property selection.
    async fn pull(&self, service_url: &str) -> Result<Vec<Artifact>, Error> {
        let query_response = self.client.query(service_url, "", "").await?;

        let mut artifacts = Vec::new();
        for member_value in &query_response.members {
            // Try to determine the resource type from the JSON-LD @type field
            let resource = parse_member_resource(member_value)?;
            let artifact = oslc_to_artifact(&resource)?;
            artifacts.push(artifact);
        }

        Ok(artifacts)
    }

    /// Push local artifacts to the remote OSLC service.
    ///
    /// Performs a bidirectional-sync-aware push in four phases:
    ///
    /// 1. Query the service URL for current remote state, preserving each
    ///    member's JSON-LD `@id` URI.
    /// 2. Compute a diff via [`compute_diff`] over local and remote
    ///    artifact sets (comparison is by `Artifact::id`).
    /// 3. For each `local_only` artifact: POST to the service URL (used as
    ///    a creation factory).
    /// 4. For each `modified` artifact: PUT to the existing remote URI.
    ///
    /// `remote_only` and `unchanged` artifacts are skipped — push is
    /// non-destructive. Deletion of remote-only artifacts is intentionally
    /// left to a future `reconcile` operation.
    async fn push(&self, service_url: &str, artifacts: &[Artifact]) -> Result<(), Error> {
        // Phase 1 — pull current remote state, preserving @id URIs.
        let query_response = self.client.query(service_url, "", "").await?;
        let mut remote_uris: BTreeMap<String, String> = BTreeMap::new();
        let mut remote_artifacts: Vec<Artifact> = Vec::new();
        for member_value in &query_response.members {
            let resource = parse_member_resource(member_value)?;
            let artifact = oslc_to_artifact(&resource)?;
            if let Some(uri) = member_value.get("@id").and_then(|v| v.as_str()) {
                remote_uris.insert(artifact.id.clone(), uri.to_string());
            }
            remote_artifacts.push(artifact);
        }

        // Phase 2 — diff local against remote.
        let diff = compute_diff(artifacts, &remote_artifacts);

        // Phase 3 — create new artifacts (local_only) via POST.
        for id in &diff.local_only {
            let local = artifacts
                .iter()
                .find(|a| &a.id == id)
                .ok_or_else(|| Error::Adapter(format!("local_only id {id} missing from local set")))?;
            let oslc_resource = artifact_to_oslc(local)?;
            let json_value = serde_json::to_value(&oslc_resource)
                .map_err(|e| Error::Adapter(format!("failed to serialize OSLC resource: {e}")))?;
            self.client.create_resource(service_url, &json_value).await?;
        }

        // Phase 4 — update modified artifacts via PUT to their URIs.
        for id in &diff.modified {
            let local = artifacts
                .iter()
                .find(|a| &a.id == id)
                .ok_or_else(|| Error::Adapter(format!("modified id {id} missing from local set")))?;
            let remote_uri = remote_uris.get(id).ok_or_else(|| {
                Error::Adapter(format!(
                    "cannot update {id}: remote member has no @id URI"
                ))
            })?;
            let oslc_resource = artifact_to_oslc(local)?;
            let json_value = serde_json::to_value(&oslc_resource)
                .map_err(|e| Error::Adapter(format!("failed to serialize OSLC resource: {e}")))?;
            self.client.update_resource(remote_uri, &json_value).await?;
        }

        Ok(())
    }

    /// Compute the diff between local and remote artifact sets.
    fn diff(&self, local: &[Artifact], remote: &[Artifact]) -> SyncDiff {
        compute_diff(local, remote)
    }
}

// ---------------------------------------------------------------------------
// Helper: parse a JSON-LD member into a typed OslcResource
// ---------------------------------------------------------------------------

/// Attempt to parse a raw JSON-LD value into a typed [`OslcResource`].
///
/// Inspects the `@type` array to determine which domain type to deserialize
/// into. Falls back to `Requirement` if no recognized type is found.
fn parse_member_resource(value: &serde_json::Value) -> Result<OslcResource, Error> {
    // Look at the @type field to determine the resource type
    let rdf_types = value
        .get("@type")
        .and_then(|t| t.as_array())
        .map(|arr| arr.iter().filter_map(|v| v.as_str()).collect::<Vec<_>>())
        .unwrap_or_default();

    // Also check for a single string @type
    let single_type = value.get("@type").and_then(|t| t.as_str());

    let all_types: Vec<&str> = if rdf_types.is_empty() {
        single_type.into_iter().collect()
    } else {
        rdf_types
    };

    // Match on known types
    for rdf_type in &all_types {
        if let Some(resource_type) = OslcResourceType::from_rdf_type(rdf_type) {
            return match resource_type {
                OslcResourceType::Requirement => {
                    let req: OslcRequirement = serde_json::from_value(value.clone())
                        .map_err(|e| Error::Adapter(format!("failed to parse Requirement: {e}")))?;
                    Ok(OslcResource::Requirement(req))
                }
                OslcResourceType::TestCase => {
                    let tc: OslcTestCase = serde_json::from_value(value.clone())
                        .map_err(|e| Error::Adapter(format!("failed to parse TestCase: {e}")))?;
                    Ok(OslcResource::TestCase(tc))
                }
                OslcResourceType::TestResult => {
                    let tr: OslcTestResult = serde_json::from_value(value.clone())
                        .map_err(|e| Error::Adapter(format!("failed to parse TestResult: {e}")))?;
                    Ok(OslcResource::TestResult(tr))
                }
                OslcResourceType::ChangeRequest => {
                    let cr: OslcChangeRequest =
                        serde_json::from_value(value.clone()).map_err(|e| {
                            Error::Adapter(format!("failed to parse ChangeRequest: {e}"))
                        })?;
                    Ok(OslcResource::ChangeRequest(cr))
                }
            };
        }
    }

    // Fallback: try to parse as a Requirement (the most common type)
    let req: OslcRequirement = serde_json::from_value(value.clone()).map_err(|e| {
        Error::Adapter(format!("failed to parse OSLC resource (unknown type): {e}"))
    })?;
    Ok(OslcResource::Requirement(req))
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

#[cfg(test)]
mod tests {
    use super::*;

    // rivet: verifies REQ-006
    #[test]
    fn test_resource_type_rdf_roundtrip() {
        let types = [
            OslcResourceType::Requirement,
            OslcResourceType::TestCase,
            OslcResourceType::TestResult,
            OslcResourceType::ChangeRequest,
        ];

        for rt in &types {
            let uri = rt.rdf_type();
            let parsed =
                OslcResourceType::from_rdf_type(uri).expect("should parse back from RDF type URI");
            assert_eq!(&parsed, rt);
        }
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_resource_type_artifact_type_roundtrip() {
        let types = [
            OslcResourceType::Requirement,
            OslcResourceType::TestCase,
            OslcResourceType::TestResult,
            OslcResourceType::ChangeRequest,
        ];

        for rt in &types {
            let artifact_type = rt.to_artifact_type();
            let parsed = OslcResourceType::from_artifact_type(artifact_type)
                .expect("should parse back from artifact type");
            assert_eq!(&parsed, rt);
        }
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_extract_link_target_url() {
        assert_eq!(
            extract_link_target("https://example.com/oslc/resources/REQ-001"),
            "REQ-001"
        );
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_extract_link_target_bare_id() {
        assert_eq!(extract_link_target("REQ-001"), "REQ-001");
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_oslc_to_artifact_requirement() {
        let req = OslcRequirement {
            about: Some("https://example.com/req/1".to_string()),
            rdf_type: vec![OSLC_RM_REQUIREMENT.to_string()],
            identifier: Some("REQ-001".to_string()),
            title: Some("Safety Requirement".to_string()),
            description: Some("The system shall be safe.".to_string()),
            elaborated_by: vec![OslcLink::new("https://example.com/req/2")],
            satisfied_by: Vec::new(),
            tracked_by: Vec::new(),
            extra: BTreeMap::new(),
        };

        let resource = OslcResource::Requirement(req);
        let artifact = oslc_to_artifact(&resource).expect("conversion should succeed");

        assert_eq!(artifact.id, "REQ-001");
        assert_eq!(artifact.artifact_type, "requirement");
        assert_eq!(artifact.title, "Safety Requirement");
        assert_eq!(
            artifact.description.as_deref(),
            Some("The system shall be safe.")
        );
        assert_eq!(artifact.links.len(), 1);
        assert_eq!(artifact.links[0].link_type, "elaborated-by");
        assert_eq!(artifact.links[0].target, "2");
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_oslc_to_artifact_missing_identifier() {
        let req = OslcRequirement {
            about: None,
            rdf_type: vec![OSLC_RM_REQUIREMENT.to_string()],
            identifier: None,
            title: Some("No ID".to_string()),
            description: None,
            elaborated_by: Vec::new(),
            satisfied_by: Vec::new(),
            tracked_by: Vec::new(),
            extra: BTreeMap::new(),
        };

        let resource = OslcResource::Requirement(req);
        let result = oslc_to_artifact(&resource);
        assert!(result.is_err());
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_artifact_to_oslc_requirement() {
        let artifact = Artifact {
            id: "REQ-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Safety Requirement".to_string(),
            description: Some("Must be safe.".to_string()),
            status: None,
            tags: Vec::new(),
            links: vec![Link {
                link_type: "satisfied-by".to_string(),
                target: "IMPL-001".to_string(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let resource = artifact_to_oslc(&artifact).expect("conversion should succeed");
        assert_eq!(resource.resource_type(), OslcResourceType::Requirement);
        assert_eq!(resource.identifier(), Some("REQ-001"));
        assert_eq!(resource.title(), Some("Safety Requirement"));

        if let OslcResource::Requirement(req) = &resource {
            assert_eq!(req.satisfied_by.len(), 1);
            assert_eq!(req.satisfied_by[0].href, "IMPL-001");
        } else {
            panic!("expected Requirement variant");
        }
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_artifact_to_oslc_test_case() {
        let artifact = Artifact {
            id: "TC-001".to_string(),
            artifact_type: "test-case".to_string(),
            title: "Safety Test".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: vec![Link {
                link_type: "validates".to_string(),
                target: "REQ-001".to_string(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let resource = artifact_to_oslc(&artifact).expect("conversion should succeed");
        assert_eq!(resource.resource_type(), OslcResourceType::TestCase);

        if let OslcResource::TestCase(tc) = &resource {
            assert_eq!(tc.validates_requirement.len(), 1);
            assert_eq!(tc.validates_requirement[0].href, "REQ-001");
        } else {
            panic!("expected TestCase variant");
        }
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_artifact_to_oslc_test_result() {
        let artifact = Artifact {
            id: "TR-001".to_string(),
            artifact_type: "test-result".to_string(),
            title: "Safety Test Result".to_string(),
            description: None,
            status: Some("passed".to_string()),
            tags: Vec::new(),
            links: vec![Link {
                link_type: "reports-on".to_string(),
                target: "TC-001".to_string(),
            }],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let resource = artifact_to_oslc(&artifact).expect("conversion should succeed");
        assert_eq!(resource.resource_type(), OslcResourceType::TestResult);

        if let OslcResource::TestResult(tr) = &resource {
            assert_eq!(
                tr.reports_on_test_case.as_ref().map(|l| l.href.as_str()),
                Some("TC-001")
            );
            assert_eq!(tr.status.as_deref(), Some("passed"));
        } else {
            panic!("expected TestResult variant");
        }
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_artifact_to_oslc_change_request() {
        let artifact = Artifact {
            id: "CR-001".to_string(),
            artifact_type: "change-request".to_string(),
            title: "Fix safety issue".to_string(),
            description: Some("There is a safety defect.".to_string()),
            status: Some("open".to_string()),
            tags: Vec::new(),
            links: vec![
                Link {
                    link_type: "implements".to_string(),
                    target: "REQ-001".to_string(),
                },
                Link {
                    link_type: "affects".to_string(),
                    target: "REQ-002".to_string(),
                },
            ],
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let resource = artifact_to_oslc(&artifact).expect("conversion should succeed");
        assert_eq!(resource.resource_type(), OslcResourceType::ChangeRequest);

        if let OslcResource::ChangeRequest(cr) = &resource {
            assert_eq!(cr.implements_requirement.len(), 1);
            assert_eq!(cr.affects_requirement.len(), 1);
            assert_eq!(cr.status.as_deref(), Some("open"));
        } else {
            panic!("expected ChangeRequest variant");
        }
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_artifact_to_oslc_unknown_type() {
        let artifact = Artifact {
            id: "X-001".to_string(),
            artifact_type: "unknown-thing".to_string(),
            title: "Unknown".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: Vec::new(),
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        };

        let result = artifact_to_oslc(&artifact);
        assert!(result.is_err());
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_compute_diff_empty() {
        let diff = compute_diff(&[], &[]);
        assert!(diff.is_empty());
        assert_eq!(diff.diff_count(), 0);
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_compute_diff_local_only() {
        let local = vec![Artifact {
            id: "REQ-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Req 1".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: Vec::new(),
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];

        let diff = compute_diff(&local, &[]);
        assert_eq!(diff.local_only, vec!["REQ-001"]);
        assert!(diff.remote_only.is_empty());
        assert!(diff.modified.is_empty());
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_compute_diff_remote_only() {
        let remote = vec![Artifact {
            id: "REQ-002".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Req 2".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: Vec::new(),
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];

        let diff = compute_diff(&[], &remote);
        assert_eq!(diff.remote_only, vec!["REQ-002"]);
        assert!(diff.local_only.is_empty());
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_compute_diff_modified() {
        let local = vec![Artifact {
            id: "REQ-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Req 1 (old)".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: Vec::new(),
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];

        let remote = vec![Artifact {
            id: "REQ-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Req 1 (new)".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: Vec::new(),
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];

        let diff = compute_diff(&local, &remote);
        assert_eq!(diff.modified, vec!["REQ-001"]);
        assert!(diff.local_only.is_empty());
        assert!(diff.remote_only.is_empty());
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_compute_diff_unchanged() {
        let local = vec![Artifact {
            id: "REQ-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Req 1".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: Vec::new(),
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];

        let remote = vec![Artifact {
            id: "REQ-001".to_string(),
            artifact_type: "requirement".to_string(),
            title: "Req 1".to_string(),
            description: None,
            status: None,
            tags: Vec::new(),
            links: Vec::new(),
            fields: BTreeMap::new(),
            provenance: None,
            source_file: None,
        }];

        let diff = compute_diff(&local, &remote);
        assert!(diff.is_empty());
        assert_eq!(diff.unchanged, vec!["REQ-001"]);
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_parse_member_resource_requirement() {
        let json = serde_json::json!({
            "@type": ["http://open-services.net/ns/rm#Requirement"],
            "dcterms:identifier": "REQ-100",
            "dcterms:title": "A test requirement"
        });

        let resource = parse_member_resource(&json).expect("should parse");
        assert_eq!(resource.resource_type(), OslcResourceType::Requirement);
        assert_eq!(resource.identifier(), Some("REQ-100"));
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_parse_member_resource_test_case() {
        let json = serde_json::json!({
            "@type": ["http://open-services.net/ns/qm#TestCase"],
            "dcterms:identifier": "TC-100",
            "dcterms:title": "A test case"
        });

        let resource = parse_member_resource(&json).expect("should parse");
        assert_eq!(resource.resource_type(), OslcResourceType::TestCase);
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_parse_member_resource_change_request() {
        let json = serde_json::json!({
            "@type": ["http://open-services.net/ns/cm#ChangeRequest"],
            "dcterms:identifier": "CR-100",
            "dcterms:title": "A change request",
            "oslc_cm:status": "open"
        });

        let resource = parse_member_resource(&json).expect("should parse");
        assert_eq!(resource.resource_type(), OslcResourceType::ChangeRequest);
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_oslc_link_new() {
        let link = OslcLink::new("https://example.com/resource/1");
        assert_eq!(link.href, "https://example.com/resource/1");
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_oslc_client_config_new() {
        let config = OslcClientConfig::new("https://example.com/oslc");
        assert_eq!(config.base_url, "https://example.com/oslc");
        assert_eq!(config.content_type, "application/ld+json");
        assert!(config.username.is_none());
        assert!(config.password.is_none());
        assert!(config.bearer_token.is_none());
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_oslc_client_config_with_basic_auth() {
        let config = OslcClientConfig::new("https://example.com/oslc")
            .with_basic_auth("user".to_string(), "pass".to_string());
        assert_eq!(config.username.as_deref(), Some("user"));
        assert_eq!(config.password.as_deref(), Some("pass"));
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_oslc_client_config_with_bearer() {
        let config = OslcClientConfig::new("https://example.com/oslc")
            .with_bearer_token("my-token".to_string());
        assert_eq!(config.bearer_token.as_deref(), Some("my-token"));
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_sync_diff_is_empty() {
        let empty = SyncDiff::default();
        assert!(empty.is_empty());

        let nonempty = SyncDiff {
            remote_only: vec!["REQ-001".to_string()],
            ..Default::default()
        };
        assert!(!nonempty.is_empty());
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_resource_type_display() {
        assert_eq!(
            format!("{}", OslcResourceType::Requirement),
            OSLC_RM_REQUIREMENT
        );
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_artifact_type_aliases() {
        // Test that common aliases map correctly
        assert_eq!(
            OslcResourceType::from_artifact_type("req"),
            Some(OslcResourceType::Requirement)
        );
        assert_eq!(
            OslcResourceType::from_artifact_type("SWREQ"),
            Some(OslcResourceType::Requirement)
        );
        assert_eq!(
            OslcResourceType::from_artifact_type("defect"),
            Some(OslcResourceType::ChangeRequest)
        );
        assert_eq!(
            OslcResourceType::from_artifact_type("bug"),
            Some(OslcResourceType::ChangeRequest)
        );
        assert_eq!(
            OslcResourceType::from_artifact_type("something-unknown"),
            None
        );
    }

    // rivet: verifies REQ-006
    #[test]
    fn test_requirement_serialization_roundtrip() {
        let req = OslcRequirement {
            about: Some("https://example.com/req/1".to_string()),
            rdf_type: vec![OSLC_RM_REQUIREMENT.to_string()],
            identifier: Some("REQ-001".to_string()),
            title: Some("Safety Requirement".to_string()),
            description: Some("The system shall be safe.".to_string()),
            elaborated_by: vec![OslcLink::new("https://example.com/req/2")],
            satisfied_by: Vec::new(),
            tracked_by: Vec::new(),
            extra: BTreeMap::new(),
        };

        let json = serde_json::to_string(&req).expect("serialization should succeed");
        let parsed: OslcRequirement =
            serde_json::from_str(&json).expect("deserialization should succeed");

        assert_eq!(parsed.identifier, req.identifier);
        assert_eq!(parsed.title, req.title);
        assert_eq!(parsed.elaborated_by.len(), 1);
    }
}
