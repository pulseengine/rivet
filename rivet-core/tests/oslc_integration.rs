//! Integration tests for the OSLC client module.
//!
//! These tests use `wiremock` to spin up a local mock HTTP server that
//! simulates an OSLC-compliant ALM tool. Each test exercises a different
//! aspect of the OSLC protocol: catalog discovery, query, CRUD operations,
//! pull via the sync adapter, and error handling.

#![cfg(feature = "oslc")]

use serde_json::json;
use wiremock::matchers::{header, method, path, query_param};
use wiremock::{Mock, MockServer, ResponseTemplate};

use rivet_core::oslc::{OslcClient, OslcClientConfig, OslcSyncAdapter, SyncAdapter};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/// Build an `OslcClient` pointed at the given mock server base URL.
fn client_for(base_url: &str) -> OslcClient {
    let config = OslcClientConfig::new(base_url);
    OslcClient::new(config).expect("client creation should succeed")
}

/// A realistic OSLC Service Provider Catalog in JSON-LD.
fn catalog_json(base: &str) -> serde_json::Value {
    json!({
        "@id": format!("{base}/catalog"),
        "dcterms:title": "Rivet Test Catalog",
        "dcterms:description": "Mock OSLC catalog for integration testing",
        "service_providers": [
            {
                "@id": format!("{base}/sp/project-alpha"),
                "dcterms:title": "Project Alpha",
                "services": [
                    {
                        "domain": "http://open-services.net/ns/rm#",
                        "query_capabilities": [
                            {
                                "dcterms:title": "Requirement Query Capability",
                                "query_base": format!("{base}/rm/query"),
                                "resource_types": [
                                    "http://open-services.net/ns/rm#Requirement"
                                ]
                            }
                        ],
                        "creation_factories": [
                            {
                                "dcterms:title": "Requirement Creation Factory",
                                "creation": format!("{base}/rm/create"),
                                "resource_types": [
                                    "http://open-services.net/ns/rm#Requirement"
                                ]
                            }
                        ]
                    },
                    {
                        "domain": "http://open-services.net/ns/qm#",
                        "query_capabilities": [
                            {
                                "dcterms:title": "TestCase Query Capability",
                                "query_base": format!("{base}/qm/query"),
                                "resource_types": [
                                    "http://open-services.net/ns/qm#TestCase"
                                ]
                            }
                        ],
                        "creation_factories": []
                    }
                ]
            }
        ]
    })
}

/// A single OSLC Requirement resource in JSON-LD.
fn requirement_json(base: &str, id: &str, title: &str, desc: &str) -> serde_json::Value {
    json!({
        "@context": {
            "dcterms": "http://purl.org/dc/terms/",
            "oslc": "http://open-services.net/ns/core#",
            "oslc_rm": "http://open-services.net/ns/rm#"
        },
        "@id": format!("{base}/rm/resources/{id}"),
        "@type": ["http://open-services.net/ns/rm#Requirement"],
        "dcterms:identifier": id,
        "dcterms:title": title,
        "dcterms:description": desc,
        "oslc_rm:elaboratedBy": [
            { "@id": format!("{base}/rm/resources/ELAB-001") }
        ],
        "oslc_rm:satisfiedBy": [],
        "oslc_rm:trackedBy": []
    })
}

/// A query response containing multiple requirement members.
fn query_response_json(base: &str) -> serde_json::Value {
    json!({
        "total_count": 2,
        "next_page": null,
        "members": [
            {
                "@context": {
                    "dcterms": "http://purl.org/dc/terms/",
                    "oslc_rm": "http://open-services.net/ns/rm#"
                },
                "@id": format!("{base}/rm/resources/REQ-001"),
                "@type": ["http://open-services.net/ns/rm#Requirement"],
                "dcterms:identifier": "REQ-001",
                "dcterms:title": "Braking System Safety",
                "dcterms:description": "The braking system shall ensure safe deceleration under all conditions."
            },
            {
                "@context": {
                    "dcterms": "http://purl.org/dc/terms/",
                    "oslc_rm": "http://open-services.net/ns/rm#"
                },
                "@id": format!("{base}/rm/resources/REQ-002"),
                "@type": ["http://open-services.net/ns/rm#Requirement"],
                "dcterms:identifier": "REQ-002",
                "dcterms:title": "Steering Redundancy",
                "dcterms:description": "The steering system shall provide redundant control paths."
            }
        ]
    })
}

// ---------------------------------------------------------------------------
// Discovery: Service Provider Catalog
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_discover_service_provider_catalog() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/"))
        .and(header("Accept", "application/ld+json"))
        .and(header("OSLC-Core-Version", "2.0"))
        .respond_with(ResponseTemplate::new(200).set_body_json(catalog_json(&base)))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let catalog = client.discover().await.expect("discovery should succeed");

    assert_eq!(catalog.title.as_deref(), Some("Rivet Test Catalog"));
    assert_eq!(catalog.service_providers.len(), 1);

    let sp = &catalog.service_providers[0];
    assert_eq!(sp.title.as_deref(), Some("Project Alpha"));
    assert_eq!(sp.services.len(), 2);

    // RM service
    let rm_svc = &sp.services[0];
    assert_eq!(
        rm_svc.domain.as_deref(),
        Some("http://open-services.net/ns/rm#")
    );
    assert_eq!(rm_svc.query_capabilities.len(), 1);
    assert_eq!(rm_svc.creation_factories.len(), 1);
    assert!(
        rm_svc.query_capabilities[0]
            .query_base
            .as_ref()
            .unwrap()
            .ends_with("/rm/query")
    );

    // QM service
    let qm_svc = &sp.services[1];
    assert_eq!(
        qm_svc.domain.as_deref(),
        Some("http://open-services.net/ns/qm#")
    );
    assert_eq!(qm_svc.query_capabilities.len(), 1);
}

// ---------------------------------------------------------------------------
// Query: list requirements
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_query_requirements() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/rm/query"))
        .and(header("Accept", "application/ld+json"))
        .respond_with(ResponseTemplate::new(200).set_body_json(query_response_json(&base)))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let query_url = format!("{base}/rm/query");
    let response = client
        .query(&query_url, "", "")
        .await
        .expect("query should succeed");

    assert_eq!(response.total_count, Some(2));
    assert!(response.next_page.is_none());
    assert_eq!(response.members.len(), 2);

    // Verify first member has expected identifier
    let first = &response.members[0];
    assert_eq!(first["dcterms:identifier"].as_str(), Some("REQ-001"));
    assert_eq!(
        first["dcterms:title"].as_str(),
        Some("Braking System Safety")
    );
}

#[tokio::test]
async fn test_query_with_where_and_select() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    // Expect the query to include oslc.where and oslc.select parameters
    Mock::given(method("GET"))
        .and(path("/rm/query"))
        .and(query_param("oslc.where", "dcterms:identifier=\"REQ-001\""))
        .and(query_param(
            "oslc.select",
            "dcterms:title,dcterms:description",
        ))
        .respond_with(ResponseTemplate::new(200).set_body_json(json!({
            "total_count": 1,
            "members": [
                {
                    "@type": ["http://open-services.net/ns/rm#Requirement"],
                    "dcterms:identifier": "REQ-001",
                    "dcterms:title": "Braking System Safety",
                    "dcterms:description": "Safe braking under all conditions."
                }
            ]
        })))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let query_url = format!("{base}/rm/query");
    let response = client
        .query(
            &query_url,
            "dcterms:identifier=\"REQ-001\"",
            "dcterms:title,dcterms:description",
        )
        .await
        .expect("filtered query should succeed");

    assert_eq!(response.total_count, Some(1));
    assert_eq!(response.members.len(), 1);
    assert_eq!(
        response.members[0]["dcterms:identifier"].as_str(),
        Some("REQ-001")
    );
}

// ---------------------------------------------------------------------------
// GET single resource
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_get_single_resource() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    let req_json = requirement_json(
        &base,
        "REQ-042",
        "Thermal Protection",
        "The system shall withstand temperatures up to 85C.",
    );

    Mock::given(method("GET"))
        .and(path("/rm/resources/REQ-042"))
        .and(header("Accept", "application/ld+json"))
        .and(header("OSLC-Core-Version", "2.0"))
        .respond_with(ResponseTemplate::new(200).set_body_json(req_json))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let resource_url = format!("{base}/rm/resources/REQ-042");
    let value = client
        .get_resource(&resource_url)
        .await
        .expect("GET resource should succeed");

    assert_eq!(value["dcterms:identifier"].as_str(), Some("REQ-042"));
    assert_eq!(value["dcterms:title"].as_str(), Some("Thermal Protection"));
    assert_eq!(
        value["@type"][0].as_str(),
        Some("http://open-services.net/ns/rm#Requirement")
    );
    // Verify the elaboratedBy link is present
    let elab = &value["oslc_rm:elaboratedBy"];
    assert!(elab.is_array());
    assert_eq!(
        elab[0]["@id"].as_str().unwrap(),
        format!("{base}/rm/resources/ELAB-001")
    );
}

// ---------------------------------------------------------------------------
// CREATE resource (POST)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_create_resource() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    let new_req = json!({
        "@context": {
            "dcterms": "http://purl.org/dc/terms/",
            "oslc_rm": "http://open-services.net/ns/rm#"
        },
        "@type": ["http://open-services.net/ns/rm#Requirement"],
        "dcterms:identifier": "REQ-NEW-001",
        "dcterms:title": "New Requirement via OSLC",
        "dcterms:description": "Created through the OSLC creation factory."
    });

    let created_response = json!({
        "@context": {
            "dcterms": "http://purl.org/dc/terms/",
            "oslc_rm": "http://open-services.net/ns/rm#"
        },
        "@id": format!("{base}/rm/resources/REQ-NEW-001"),
        "@type": ["http://open-services.net/ns/rm#Requirement"],
        "dcterms:identifier": "REQ-NEW-001",
        "dcterms:title": "New Requirement via OSLC",
        "dcterms:description": "Created through the OSLC creation factory."
    });

    Mock::given(method("POST"))
        .and(path("/rm/create"))
        .and(header("Content-Type", "application/ld+json"))
        .and(header("OSLC-Core-Version", "2.0"))
        .respond_with(
            ResponseTemplate::new(201)
                .append_header("Location", format!("{base}/rm/resources/REQ-NEW-001"))
                .set_body_json(created_response),
        )
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let factory_url = format!("{base}/rm/create");
    let result = client
        .create_resource(&factory_url, &new_req)
        .await
        .expect("POST create should succeed");

    assert_eq!(result["dcterms:identifier"].as_str(), Some("REQ-NEW-001"));
    assert_eq!(
        result["@id"].as_str(),
        Some(format!("{base}/rm/resources/REQ-NEW-001").as_str())
    );
}

// ---------------------------------------------------------------------------
// UPDATE resource (PUT)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_update_resource() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    let updated_req = json!({
        "@context": {
            "dcterms": "http://purl.org/dc/terms/",
            "oslc_rm": "http://open-services.net/ns/rm#"
        },
        "@id": format!("{base}/rm/resources/REQ-001"),
        "@type": ["http://open-services.net/ns/rm#Requirement"],
        "dcterms:identifier": "REQ-001",
        "dcterms:title": "Braking System Safety (Revised)",
        "dcterms:description": "Updated description with tighter constraints."
    });

    let response_body = updated_req.clone();

    Mock::given(method("PUT"))
        .and(path("/rm/resources/REQ-001"))
        .and(header("Content-Type", "application/ld+json"))
        .and(header("OSLC-Core-Version", "2.0"))
        .respond_with(ResponseTemplate::new(200).set_body_json(response_body))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let resource_url = format!("{base}/rm/resources/REQ-001");
    let result = client
        .update_resource(&resource_url, &updated_req)
        .await
        .expect("PUT update should succeed");

    assert_eq!(
        result["dcterms:title"].as_str(),
        Some("Braking System Safety (Revised)")
    );
    assert_eq!(
        result["dcterms:description"].as_str(),
        Some("Updated description with tighter constraints.")
    );
}

// ---------------------------------------------------------------------------
// Pull via SyncAdapter
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_pull_converts_to_artifacts() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/rm/query"))
        .respond_with(ResponseTemplate::new(200).set_body_json(query_response_json(&base)))
        .expect(1)
        .mount(&mock_server)
        .await;

    let config = OslcClientConfig::new(&base);
    let adapter = OslcSyncAdapter::from_config(config).expect("adapter creation should succeed");

    let query_url = format!("{base}/rm/query");
    let artifacts = adapter.pull(&query_url).await.expect("pull should succeed");

    assert_eq!(artifacts.len(), 2);

    // First artifact
    assert_eq!(artifacts[0].id, "REQ-001");
    assert_eq!(artifacts[0].artifact_type, "requirement");
    assert_eq!(artifacts[0].title, "Braking System Safety");
    assert_eq!(
        artifacts[0].description.as_deref(),
        Some("The braking system shall ensure safe deceleration under all conditions.")
    );

    // Second artifact
    assert_eq!(artifacts[1].id, "REQ-002");
    assert_eq!(artifacts[1].artifact_type, "requirement");
    assert_eq!(artifacts[1].title, "Steering Redundancy");
}

#[tokio::test]
async fn test_pull_with_mixed_resource_types() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    let mixed_response = json!({
        "total_count": 3,
        "members": [
            {
                "@type": ["http://open-services.net/ns/rm#Requirement"],
                "dcterms:identifier": "REQ-010",
                "dcterms:title": "Sensor Accuracy"
            },
            {
                "@type": ["http://open-services.net/ns/qm#TestCase"],
                "dcterms:identifier": "TC-010",
                "dcterms:title": "Sensor Accuracy Verification",
                "oslc_qm:validatesRequirement": [
                    { "@id": format!("{base}/rm/resources/REQ-010") }
                ]
            },
            {
                "@type": ["http://open-services.net/ns/cm#ChangeRequest"],
                "dcterms:identifier": "CR-010",
                "dcterms:title": "Calibrate sensor threshold",
                "dcterms:description": "Adjust the threshold for the proximity sensor.",
                "oslc_cm:status": "in-progress",
                "oslc_cm:implementsRequirement": [
                    { "@id": format!("{base}/rm/resources/REQ-010") }
                ]
            }
        ]
    });

    Mock::given(method("GET"))
        .and(path("/mixed/query"))
        .respond_with(ResponseTemplate::new(200).set_body_json(mixed_response))
        .expect(1)
        .mount(&mock_server)
        .await;

    let config = OslcClientConfig::new(&base);
    let adapter = OslcSyncAdapter::from_config(config).expect("adapter creation should succeed");

    let query_url = format!("{base}/mixed/query");
    let artifacts = adapter.pull(&query_url).await.expect("pull should succeed");

    assert_eq!(artifacts.len(), 3);

    // Requirement
    assert_eq!(artifacts[0].artifact_type, "requirement");
    assert_eq!(artifacts[0].id, "REQ-010");

    // TestCase
    assert_eq!(artifacts[1].artifact_type, "test-case");
    assert_eq!(artifacts[1].id, "TC-010");
    assert_eq!(artifacts[1].links.len(), 1);
    assert_eq!(artifacts[1].links[0].link_type, "validates");
    assert_eq!(artifacts[1].links[0].target, "REQ-010");

    // ChangeRequest
    assert_eq!(artifacts[2].artifact_type, "change-request");
    assert_eq!(artifacts[2].id, "CR-010");
    assert_eq!(artifacts[2].status.as_deref(), Some("in-progress"));
    assert_eq!(artifacts[2].links.len(), 1);
    assert_eq!(artifacts[2].links[0].link_type, "implements");
}

// ---------------------------------------------------------------------------
// Error handling: HTTP errors
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_error_404_not_found() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/rm/resources/NONEXISTENT"))
        .respond_with(ResponseTemplate::new(404))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let url = format!("{base}/rm/resources/NONEXISTENT");
    let result = client.get_resource(&url).await;

    assert!(result.is_err());
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("404"),
        "error message should mention 404: {err_msg}"
    );
}

#[tokio::test]
async fn test_error_500_internal_server_error() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/rm/query"))
        .respond_with(ResponseTemplate::new(500))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let query_url = format!("{base}/rm/query");
    let result = client.query(&query_url, "", "").await;

    assert!(result.is_err());
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("500"),
        "error message should mention 500: {err_msg}"
    );
}

#[tokio::test]
async fn test_error_malformed_json_response() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/rm/resources/BAD"))
        .respond_with(
            ResponseTemplate::new(200)
                .set_body_string("this is not valid JSON {{{")
                .append_header("Content-Type", "application/ld+json"),
        )
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let url = format!("{base}/rm/resources/BAD");
    let result = client.get_resource(&url).await;

    assert!(result.is_err());
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("failed to parse"),
        "error message should mention parse failure: {err_msg}"
    );
}

#[tokio::test]
async fn test_error_malformed_catalog() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/"))
        .respond_with(
            ResponseTemplate::new(200)
                .set_body_string("{not valid json at all")
                .append_header("Content-Type", "application/ld+json"),
        )
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let result = client.discover().await;

    assert!(result.is_err());
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("failed to parse catalog"),
        "error should mention catalog parse failure: {err_msg}"
    );
}

#[tokio::test]
async fn test_error_create_returns_server_error() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("POST"))
        .and(path("/rm/create"))
        .respond_with(ResponseTemplate::new(500))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let factory_url = format!("{base}/rm/create");
    let body = json!({
        "@type": ["http://open-services.net/ns/rm#Requirement"],
        "dcterms:identifier": "REQ-FAIL",
        "dcterms:title": "Should fail"
    });

    let result = client.create_resource(&factory_url, &body).await;
    assert!(result.is_err());
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("500"),
        "error message should mention 500: {err_msg}"
    );
}

#[tokio::test]
async fn test_error_update_returns_404() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("PUT"))
        .and(path("/rm/resources/GONE"))
        .respond_with(ResponseTemplate::new(404))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let url = format!("{base}/rm/resources/GONE");
    let body = json!({
        "@type": ["http://open-services.net/ns/rm#Requirement"],
        "dcterms:identifier": "GONE",
        "dcterms:title": "Deleted resource"
    });

    let result = client.update_resource(&url, &body).await;
    assert!(result.is_err());
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("404"),
        "error message should mention 404: {err_msg}"
    );
}

// ---------------------------------------------------------------------------
// Authentication configuration
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_basic_auth_is_sent() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    // The Authorization header for basic auth "user:pass" is "Basic dXNlcjpwYXNz"
    Mock::given(method("GET"))
        .and(path("/"))
        .and(header("Authorization", "Basic dXNlcjpwYXNz"))
        .respond_with(ResponseTemplate::new(200).set_body_json(catalog_json(&base)))
        .expect(1)
        .mount(&mock_server)
        .await;

    let config =
        OslcClientConfig::new(&base).with_basic_auth("user".to_string(), "pass".to_string());
    let client = OslcClient::new(config).expect("client creation should succeed");

    let result = client.discover().await;
    assert!(result.is_ok(), "basic-auth request should succeed");
}

#[tokio::test]
async fn test_bearer_auth_is_sent() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    Mock::given(method("GET"))
        .and(path("/"))
        .and(header("Authorization", "Bearer my-secret-token"))
        .respond_with(ResponseTemplate::new(200).set_body_json(catalog_json(&base)))
        .expect(1)
        .mount(&mock_server)
        .await;

    let config = OslcClientConfig::new(&base).with_bearer_token("my-secret-token".to_string());
    let client = OslcClient::new(config).expect("client creation should succeed");

    let result = client.discover().await;
    assert!(result.is_ok(), "bearer-auth request should succeed");
}

// ---------------------------------------------------------------------------
// Pull error: member without identifier
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_pull_member_missing_identifier() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    let response = json!({
        "total_count": 1,
        "members": [
            {
                "@type": ["http://open-services.net/ns/rm#Requirement"],
                "dcterms:title": "Requirement without identifier"
                // No dcterms:identifier field
            }
        ]
    });

    Mock::given(method("GET"))
        .and(path("/rm/query"))
        .respond_with(ResponseTemplate::new(200).set_body_json(response))
        .expect(1)
        .mount(&mock_server)
        .await;

    let config = OslcClientConfig::new(&base);
    let adapter = OslcSyncAdapter::from_config(config).expect("adapter creation should succeed");

    let query_url = format!("{base}/rm/query");
    let result = adapter.pull(&query_url).await;

    assert!(
        result.is_err(),
        "pull should fail for member without identifier"
    );
    let err_msg = format!("{}", result.unwrap_err());
    assert!(
        err_msg.contains("identifier"),
        "error should mention missing identifier: {err_msg}"
    );
}

// ---------------------------------------------------------------------------
// Query response with pagination link
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_query_response_with_next_page() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    let paged_response = json!({
        "total_count": 100,
        "next_page": format!("{base}/rm/query?page=2"),
        "members": [
            {
                "@type": ["http://open-services.net/ns/rm#Requirement"],
                "dcterms:identifier": "REQ-001",
                "dcterms:title": "First page requirement"
            }
        ]
    });

    Mock::given(method("GET"))
        .and(path("/rm/query"))
        .respond_with(ResponseTemplate::new(200).set_body_json(paged_response))
        .expect(1)
        .mount(&mock_server)
        .await;

    let client = client_for(&base);
    let query_url = format!("{base}/rm/query");
    let response = client
        .query(&query_url, "", "")
        .await
        .expect("query should succeed");

    assert_eq!(response.total_count, Some(100));
    assert!(response.next_page.is_some());
    assert_eq!(
        response.next_page.as_deref(),
        Some(format!("{base}/rm/query?page=2").as_str())
    );
    assert_eq!(response.members.len(), 1);
}

// ---------------------------------------------------------------------------
// Resource type mapping sanity (exercised via pull path)
// ---------------------------------------------------------------------------

#[tokio::test]
async fn test_pull_test_result_with_status() {
    let mock_server = MockServer::start().await;
    let base = mock_server.uri();

    let response = json!({
        "total_count": 1,
        "members": [
            {
                "@type": ["http://open-services.net/ns/qm#TestResult"],
                "dcterms:identifier": "TR-001",
                "dcterms:title": "Braking Test Result",
                "oslc_qm:status": "passed",
                "oslc_qm:reportsOnTestCase": {
                    "@id": format!("{base}/qm/testcases/TC-001")
                }
            }
        ]
    });

    Mock::given(method("GET"))
        .and(path("/qm/results"))
        .respond_with(ResponseTemplate::new(200).set_body_json(response))
        .expect(1)
        .mount(&mock_server)
        .await;

    let config = OslcClientConfig::new(&base);
    let adapter = OslcSyncAdapter::from_config(config).expect("adapter creation should succeed");

    let query_url = format!("{base}/qm/results");
    let artifacts = adapter.pull(&query_url).await.expect("pull should succeed");

    assert_eq!(artifacts.len(), 1);
    assert_eq!(artifacts[0].id, "TR-001");
    assert_eq!(artifacts[0].artifact_type, "test-result");
    assert_eq!(artifacts[0].status.as_deref(), Some("passed"));
    assert_eq!(artifacts[0].links.len(), 1);
    assert_eq!(artifacts[0].links[0].link_type, "reports-on");
    assert_eq!(artifacts[0].links[0].target, "TC-001");
}
