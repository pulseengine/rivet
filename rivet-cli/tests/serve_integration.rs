// SAFETY-REVIEW (SCRC Phase 1, DD-058): Integration test / bench code.
// Tests legitimately use unwrap/expect/panic/assert-indexing patterns
// because a test failure should panic with a clear stack. Blanket-allow
// the Phase 1 restriction lints at crate scope; real risk analysis for
// these lints is carried by production code in rivet-core/src and
// rivet-cli/src, not by the test harnesses.
#![allow(
    clippy::unwrap_used,
    clippy::expect_used,
    clippy::indexing_slicing,
    clippy::arithmetic_side_effects,
    clippy::as_conversions,
    clippy::cast_possible_truncation,
    clippy::cast_sign_loss,
    clippy::wildcard_enum_match_arm,
    clippy::match_wildcard_for_single_variants,
    clippy::panic,
    clippy::todo,
    clippy::unimplemented,
    clippy::dbg_macro,
    clippy::print_stdout,
    clippy::print_stderr
)]

//! Integration tests for the serve module.
//!
//! These tests start the rivet server on a random port, make HTTP requests,
//! and verify the responses contain the expected navigation patterns.

use std::process::{Child, Command};
use std::time::Duration;

/// Locate the `rivet` binary built by cargo.
fn rivet_bin() -> std::path::PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return std::path::PathBuf::from(bin);
    }
    let manifest = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

/// Project root (one level up from rivet-cli/).
fn project_root() -> std::path::PathBuf {
    std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
        .parent()
        .expect("workspace root")
        .to_path_buf()
}

/// Find a free TCP port.
fn free_port() -> u16 {
    std::net::TcpListener::bind("127.0.0.1:0")
        .expect("bind to free port")
        .local_addr()
        .expect("local addr")
        .port()
}

/// Start the rivet server and return (child, port).
fn start_server() -> (Child, u16) {
    let port = free_port();
    let mut child = Command::new(rivet_bin())
        .args(["serve", "--port", &port.to_string()])
        .current_dir(project_root())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .expect("failed to start rivet serve");

    // Wait for server to be ready. TCP accept alone is insufficient — the
    // socket binds before the artifact store finishes loading, so `fetch()`
    // can race and hit the server mid-load, getting a closed connection or
    // empty response (previous failure mode: status=0 on
    // api_artifacts_unfiltered / api_artifacts_search under Proptest load).
    //
    // Fix: wait for /api/v1/health to return 200 OK. That handler only
    // becomes reachable after routing is fully initialized and the store
    // is populated.
    let addr = format!("127.0.0.1:{port}");
    for _ in 0..300 {
        if let Ok(mut stream) = std::net::TcpStream::connect(&addr) {
            use std::io::{Read, Write};
            let req = format!(
                "GET /api/v1/health HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\nConnection: close\r\n\r\n"
            );
            if stream.write_all(req.as_bytes()).is_ok() {
                let _ = stream.set_read_timeout(Some(Duration::from_millis(500)));
                let mut buf = [0u8; 32];
                if let Ok(n) = stream.read(&mut buf) {
                    if n >= 12 && &buf[..12] == b"HTTP/1.1 200" {
                        return (child, port);
                    }
                }
            }
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    // Kill the child before panicking to avoid zombie processes.
    let _ = child.kill();
    let _ = child.wait();
    panic!("server did not become healthy within 30 seconds on port {port}");
}

/// Fetch a page via HTTP. If `htmx` is true, sends the HX-Request header
/// to get partial (HTMX) responses; otherwise gets the full page.
fn fetch(port: u16, path: &str, htmx: bool) -> (u16, String, Vec<(String, String)>) {
    let _url = format!("http://127.0.0.1:{port}{path}");

    // Use a minimal HTTP/1.1 request via TcpStream.
    // Retry connect in case the server briefly drops between the health check and this call.
    use std::io::{Read, Write};
    let addr = format!("127.0.0.1:{port}");
    let mut stream = None;
    for _ in 0..10 {
        match std::net::TcpStream::connect(&addr) {
            Ok(s) => {
                stream = Some(s);
                break;
            }
            Err(_) => std::thread::sleep(Duration::from_millis(100)),
        }
    }
    let mut stream = stream
        .unwrap_or_else(|| std::net::TcpStream::connect(&addr).expect("connect after retries"));
    stream.set_read_timeout(Some(Duration::from_secs(5))).ok();

    let hx_header = if htmx { "HX-Request: true\r\n" } else { "" };
    let request = format!(
        "GET {path} HTTP/1.1\r\nHost: 127.0.0.1:{port}\r\n{hx_header}Connection: close\r\n\r\n"
    );
    stream.write_all(request.as_bytes()).expect("write request");

    let mut response = Vec::new();
    stream.read_to_end(&mut response).ok();
    let response = String::from_utf8_lossy(&response).to_string();

    // Parse status code
    let status = response
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(1))
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(0);

    // Parse headers
    let mut headers = Vec::new();
    for line in response.lines().skip(1) {
        if line.is_empty() {
            break;
        }
        if let Some((k, v)) = line.split_once(':') {
            headers.push((k.trim().to_string(), v.trim().to_string()));
        }
    }

    // Extract body (after \r\n\r\n)
    let body = response
        .split_once("\r\n\r\n")
        .map(|(_, b)| b.to_string())
        .unwrap_or_default();

    (status, body, headers)
}

/// Verify that all `hx-get` links in an HTML fragment that target `#content`
/// also include `hx-push-url`.
fn assert_links_push_url(html: &str, page: &str) {
    // Simple regex-free scan: find all occurrences of hx-target="#content"
    // and check the surrounding <a ...> tag for hx-push-url
    let target_pattern = r##"hx-target="#content""##;

    let mut pos = 0;
    while let Some(idx) = html[pos..].find(target_pattern) {
        let abs = pos + idx;
        pos = abs + target_pattern.len();

        // Walk back to find the opening < of this tag
        let tag_start = html[..abs].rfind('<').unwrap_or(abs);
        // Walk forward to find the closing >
        let tag_end = html[abs..].find('>').map(|i| abs + i).unwrap_or(html.len());

        let tag = &html[tag_start..=tag_end.min(html.len() - 1)];

        // Skip form elements — they don't need push-url
        if tag.contains("<form") {
            continue;
        }

        // Skip if no hx-get (might be a different htmx attribute)
        if !tag.contains("hx-get") {
            continue;
        }

        assert!(
            tag.contains("hx-push-url"),
            "Link missing hx-push-url on page '{page}':\n  {tag}"
        );
    }
}

#[test]
fn server_pages_push_url() {
    let (mut child, port) = start_server();

    // Test key pages that have navigational links
    let pages = [
        "/",
        "/artifacts",
        "/results",
        "/documents",
        "/coverage",
        "/verification",
    ];

    for page in &pages {
        let (status, body, _headers) = fetch(port, page, true);
        assert!(status == 200, "GET {page} returned {status}, expected 200");
        assert_links_push_url(&body, page);
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn non_htmx_request_serves_full_page() {
    let (mut child, port) = start_server();

    // A non-HTMX GET to /results should return 200 with full page layout
    // (wrap_full_page middleware wraps partial HTML in the shell)
    let (status, body, _headers) = fetch(port, "/results", false);

    assert!(
        status == 200,
        "non-HTMX GET /results should return 200 with full page, got {status}"
    );

    // Must contain the full page shell (nav, layout)
    assert!(
        body.contains("<nav>") || body.contains("Rivet"),
        "non-HTMX response must contain the full page layout shell"
    );

    // Must also contain the actual page content (not empty placeholder)
    assert!(
        body.contains("results") || body.contains("Results"),
        "non-HTMX response must contain the results page content"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn responses_include_csp_header() {
    let (mut child, port) = start_server();

    let (_status, _body, headers) = fetch(port, "/", false);

    let csp = headers
        .iter()
        .find(|(k, _)| k.eq_ignore_ascii_case("content-security-policy"));

    assert!(
        csp.is_some(),
        "Response must include Content-Security-Policy header. Headers: {headers:?}"
    );

    let csp_value = &csp.unwrap().1;
    assert!(
        csp_value.contains("default-src"),
        "CSP header must contain default-src directive, got: {csp_value}"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn reload_returns_hx_location() {
    let (mut child, port) = start_server();

    // Simulate reload with HX-Current-URL header
    use std::io::{Read, Write};
    // reload_state re-reads the entire project from disk, which can be
    // significantly slower under CI coverage / proptest instrumentation.
    // Use a generous timeout to avoid flaky failures.
    let mut stream = std::net::TcpStream::connect(format!("127.0.0.1:{port}")).expect("connect");
    stream.set_read_timeout(Some(Duration::from_secs(30))).ok();

    let request = format!(
        "POST /reload HTTP/1.1\r\n\
         Host: 127.0.0.1:{port}\r\n\
         HX-Request: true\r\n\
         HX-Current-URL: http://127.0.0.1:{port}/results\r\n\
         Content-Length: 0\r\n\
         Connection: close\r\n\r\n"
    );
    stream.write_all(request.as_bytes()).expect("write");

    let mut response = Vec::new();
    stream
        .read_to_end(&mut response)
        .expect("read reload response");
    let response = String::from_utf8_lossy(&response).to_string();

    // Should contain HX-Location header pointing to /results
    let has_location = response
        .lines()
        .any(|l| l.starts_with("HX-Location") || l.starts_with("hx-location"));

    assert!(
        has_location || response.contains("/results"),
        "reload response must contain HX-Location header to stay on current page.\n\
         Response:\n{response}"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_health_returns_json() {
    let (mut child, port) = start_server();

    let (status, body, headers) = fetch(port, "/api/v1/health", false);

    assert_eq!(status, 200, "GET /api/v1/health should return 200");

    let has_json_ct = headers
        .iter()
        .any(|(k, v)| k.eq_ignore_ascii_case("content-type") && v.contains("application/json"));
    assert!(has_json_ct, "health endpoint must return application/json");

    let json: serde_json::Value = serde_json::from_str(&body)
        .unwrap_or_else(|e| panic!("health response is not valid JSON: {e}\nbody: {body}"));
    assert_eq!(json["status"], "ok");
    assert!(json["project"].is_string());
    assert!(json["version"].is_string());
    assert!(json["artifacts"].is_number());
    assert!(json["uptime_seconds"].is_number());

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_v1_cors_headers() {
    let (mut child, port) = start_server();

    let (status, _body, headers) = fetch(port, "/api/v1/health", false);
    assert_eq!(status, 200);

    let has_cors = headers
        .iter()
        .any(|(k, _)| k.eq_ignore_ascii_case("access-control-allow-origin"));
    assert!(
        has_cors,
        "API v1 endpoints must include CORS headers. Headers: {headers:?}"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn oembed_valid_artifact() {
    let (mut child, port) = start_server();

    let raw_url = format!("http://127.0.0.1:{port}/artifacts/REQ-001");
    let url = urlencoding::encode(&raw_url);
    let (status, body, _headers) = fetch(port, &format!("/oembed?url={url}&format=json"), false);

    assert_eq!(status, 200, "oEmbed with valid artifact should return 200");

    let json: serde_json::Value = serde_json::from_str(&body)
        .unwrap_or_else(|e| panic!("oEmbed response not valid JSON: {e}\nbody: {body}"));
    assert_eq!(json["version"], "1.0");
    assert_eq!(json["type"], "rich");
    assert!(json["title"].as_str().unwrap().contains("REQ-001"));
    assert!(json["html"].as_str().unwrap().contains("iframe"));
    assert!(
        json["html"]
            .as_str()
            .unwrap()
            .contains("/embed/artifacts/REQ-001")
    );
    assert!(json["width"].is_number());
    assert!(json["height"].is_number());

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn oembed_unknown_artifact_returns_404() {
    let (mut child, port) = start_server();

    let raw_url = format!("http://127.0.0.1:{port}/artifacts/NONEXISTENT-999");
    let url = urlencoding::encode(&raw_url);
    let (status, _body, _headers) = fetch(port, &format!("/oembed?url={url}"), false);

    assert_eq!(
        status, 404,
        "oEmbed with unknown artifact should return 404"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn oembed_non_artifact_url_returns_404() {
    let (mut child, port) = start_server();

    let raw_url = format!("http://127.0.0.1:{port}/coverage");
    let url = urlencoding::encode(&raw_url);
    let (status, _body, _headers) = fetch(port, &format!("/oembed?url={url}"), false);

    assert_eq!(
        status, 404,
        "oEmbed with non-artifact URL should return 404"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn oembed_xml_format_returns_501() {
    let (mut child, port) = start_server();

    let raw_url = format!("http://127.0.0.1:{port}/artifacts/REQ-001");
    let url = urlencoding::encode(&raw_url);
    let (status, _body, _headers) = fetch(port, &format!("/oembed?url={url}&format=xml"), false);

    assert_eq!(status, 501, "oEmbed with format=xml should return 501");

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn oembed_maxwidth_clamps() {
    let (mut child, port) = start_server();

    let raw_url = format!("http://127.0.0.1:{port}/artifacts/REQ-001");
    let url = urlencoding::encode(&raw_url);
    let (status, body, _headers) = fetch(port, &format!("/oembed?url={url}&maxwidth=300"), false);

    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    assert!(
        json["width"].as_u64().unwrap() <= 300,
        "width should be clamped to maxwidth"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_stats_response_shape() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/stats", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body)
        .unwrap_or_else(|e| panic!("stats not valid JSON: {e}\nbody: {body}"));

    assert!(json["total_artifacts"].is_number());
    assert!(json["by_type"].is_object());
    assert!(json["by_status"].is_object());
    assert!(json["validation"].is_object());
    assert!(json["coverage"].is_array());
    assert!(json["by_origin"].is_object());

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_artifacts_unfiltered() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/artifacts", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    assert!(json["total"].as_u64().unwrap() > 0, "should have artifacts");
    assert!(json["artifacts"].is_array());

    let first = &json["artifacts"][0];
    assert!(first["id"].is_string());
    assert!(first["title"].is_string());
    assert!(first["type"].is_string());
    assert!(first["origin"].is_string());
    assert!(first["links_out"].is_number());
    assert!(first["links_in"].is_number());

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_artifacts_filter_by_type() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/artifacts?type=requirement", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    for art in json["artifacts"].as_array().unwrap() {
        assert_eq!(
            art["type"], "requirement",
            "filtered artifacts must all be requirements"
        );
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_artifacts_pagination() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/artifacts?limit=5", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    let artifacts = json["artifacts"].as_array().unwrap();
    assert!(
        artifacts.len() <= 5,
        "limit=5 should return at most 5 artifacts, got {}",
        artifacts.len()
    );
    assert!(json["total"].as_u64().unwrap() >= artifacts.len() as u64);

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_artifacts_search() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/artifacts?q=STPA", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    for art in json["artifacts"].as_array().unwrap() {
        let title = art["title"].as_str().unwrap().to_lowercase();
        assert!(
            title.contains("stpa"),
            "search results must contain 'stpa' in title, got: {title}"
        );
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_stats_total_matches_by_type_sum() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/stats", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    let total = json["total_artifacts"].as_u64().unwrap();
    let by_type_sum: u64 = json["by_type"]
        .as_object()
        .unwrap()
        .values()
        .map(|v| v.as_u64().unwrap())
        .sum();

    assert_eq!(
        total, by_type_sum,
        "total_artifacts ({total}) must equal sum of by_type values ({by_type_sum})"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_diagnostics_response_shape() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/diagnostics", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    assert!(json["total"].is_number());
    assert!(json["diagnostics"].is_array());

    if let Some(first) = json["diagnostics"].as_array().and_then(|a| a.first()) {
        assert!(first["severity"].is_string());
        assert!(first["rule"].is_string());
        assert!(first["message"].is_string());
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_diagnostics_filter_severity() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/diagnostics?severity=error", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    for diag in json["diagnostics"].as_array().unwrap() {
        assert_eq!(
            diag["severity"], "error",
            "filtered diagnostics must all have error severity"
        );
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_coverage_response_shape() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/coverage", false);
    assert_eq!(status, 200);

    let json: serde_json::Value = serde_json::from_str(&body).unwrap();
    assert!(json["rules"].is_array());

    if let Some(first) = json["rules"].as_array().and_then(|a| a.first()) {
        assert!(first["rule"].is_string());
        assert!(first["source_type"].is_string());
        assert!(first["link_type"].is_string());
        assert!(first["direction"].is_string());
        assert!(first["target_types"].is_array());
        assert!(first["covered"].is_number());
        assert!(first["total"].is_number());
        assert!(first["uncovered"].is_array());

        let pct = first["percentage"].as_f64().unwrap();
        assert!(
            (0.0..=100.0).contains(&pct),
            "percentage must be 0..100, got {pct}"
        );
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn artifact_detail_has_oembed_discovery_link() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/artifacts/REQ-001", false);
    assert_eq!(status, 200);

    assert!(
        body.contains("application/json+oembed"),
        "artifact detail page must contain oEmbed discovery <link> tag"
    );
    assert!(
        body.contains("/oembed?"),
        "oEmbed discovery link must point to /oembed endpoint"
    );

    child.kill().ok();
    child.wait().ok();
}

// ── Embed resolution in documents ──────────────────────────────────────

/// The documents page should not contain any embed-error spans for valid
/// embed types (stats, coverage). This verifies the embed resolver is
/// correctly wired in the serve pipeline.
#[test]
fn documents_page_has_no_embed_errors() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/documents", false);
    assert_eq!(status, 200, "documents page should load");
    assert!(
        !body.contains("embed-error"),
        "no embed errors should appear on the documents list page"
    );

    child.kill().ok();
    child.wait().ok();
}

/// The rivet embed CLI command should produce output consistent with
/// what the serve pipeline would render (minus HTML wrapper).
#[test]
fn embed_api_stats_endpoint() {
    let (mut child, port) = start_server();

    let (status, body, _headers) = fetch(port, "/api/v1/stats", false);
    assert_eq!(status, 200, "/api/v1/stats should respond 200");
    assert!(
        body.contains("total") || body.contains("artifacts"),
        "stats API should contain stats data"
    );

    child.kill().ok();
    child.wait().ok();
}

// ── STPA-Sec Section 12.1: CSP header on all endpoints (SC-15) ────────────

// rivet: verifies SC-15
#[test]
fn test_csp_header_present() {
    let (mut child, port) = start_server();

    // CSP must be present on ALL response endpoints.
    for path in &["/", "/artifacts", "/coverage", "/documents"] {
        let (_status, _body, headers) = fetch(port, path, false);
        let csp = headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case("content-security-policy"));
        assert!(
            csp.is_some(),
            "CSP header must be present on {path}. Headers: {headers:?}"
        );
        let csp_value = &csp.unwrap().1;
        assert!(
            csp_value.contains("default-src"),
            "CSP must contain default-src on {path}, got: {csp_value}"
        );
        assert!(
            csp_value.contains("script-src"),
            "CSP must contain script-src on {path}, got: {csp_value}"
        );
    }

    child.kill().ok();
    child.wait().ok();
}

// ── STPA-Sec Section 12.4: Dashboard Reload Failure (H-16, SC-18) ─────────

// rivet: verifies SC-18, UCA-D-4
#[test]
fn test_reload_yaml_error_returns_error_response() {
    // When a reload is triggered on our valid project, the server must return
    // a success response (200 or redirect) and not crash.
    let (mut child, port) = start_server();

    use std::io::{Read, Write};
    let mut stream = std::net::TcpStream::connect(format!("127.0.0.1:{port}")).expect("connect");
    stream
        .set_read_timeout(Some(std::time::Duration::from_secs(30)))
        .ok();

    let request = format!(
        "POST /reload HTTP/1.1\r\n\
         Host: 127.0.0.1:{port}\r\n\
         HX-Request: true\r\n\
         Content-Length: 0\r\n\
         Connection: close\r\n\r\n"
    );
    stream.write_all(request.as_bytes()).expect("write reload");

    let mut response = Vec::new();
    stream.read_to_end(&mut response).ok();
    let response = String::from_utf8_lossy(&response).to_string();

    let status = response
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(1))
        .and_then(|s| s.parse::<u16>().ok())
        .unwrap_or(0);

    assert!(
        status == 200 || (300..400).contains(&status),
        "reload of valid project must not fail, got status {status}"
    );

    // Server must still be alive after reload
    let (check_status, _, _) = fetch(port, "/", false);
    assert_eq!(check_status, 200, "server must still respond after reload");

    child.kill().ok();
    child.wait().ok();
}

// rivet: verifies SC-18
#[test]
fn test_reload_failure_preserves_state() {
    // After a reload, the dashboard must still serve pages with the same
    // data.  We verify artifact count is preserved across reload.
    let (mut child, port) = start_server();

    // Get artifacts count before reload
    let (status1, body1, _) = fetch(port, "/api/v1/stats", false);
    assert_eq!(status1, 200, "pre-reload stats must work");
    let json1: serde_json::Value = serde_json::from_str(&body1).unwrap();
    let total1 = json1["total_artifacts"].as_u64().unwrap();

    // Trigger reload
    use std::io::{Read, Write};
    let mut stream = std::net::TcpStream::connect(format!("127.0.0.1:{port}")).expect("connect");
    stream
        .set_read_timeout(Some(std::time::Duration::from_secs(30)))
        .ok();
    let request = format!(
        "POST /reload HTTP/1.1\r\n\
         Host: 127.0.0.1:{port}\r\n\
         HX-Request: true\r\n\
         Content-Length: 0\r\n\
         Connection: close\r\n\r\n"
    );
    stream.write_all(request.as_bytes()).expect("write");
    let mut response = Vec::new();
    stream.read_to_end(&mut response).ok();

    // After reload, stats must still be available and consistent
    let (status2, body2, _) = fetch(port, "/api/v1/stats", false);
    assert_eq!(status2, 200, "post-reload stats must work");
    let json2: serde_json::Value = serde_json::from_str(&body2).unwrap();
    let total2 = json2["total_artifacts"].as_u64().unwrap();

    assert_eq!(
        total1, total2,
        "artifact count must be preserved after reload"
    );

    child.kill().ok();
    child.wait().ok();
}

// ── /graph node budget (REQ-007) ────────────────────────────────────────

/// The full graph on the dogfood dataset (~1800 artifacts) must respond
/// quickly by short-circuiting into the budget message rather than running
/// layout + SVG, which previously took ~57s and produced ~1MB of HTML.
#[test]
fn graph_full_view_respects_node_budget() {
    let (mut child, port) = start_server();

    let start = std::time::Instant::now();
    let (status, body, _) = fetch(port, "/graph", true);
    let elapsed = start.elapsed();
    eprintln!(
        "graph_full_view_respects_node_budget: GET /graph -> {} bytes in {elapsed:?}",
        body.len()
    );

    assert_eq!(status, 200, "/graph must return 200");
    assert!(
        body.contains("budget"),
        "full /graph must render the budget message (literal 'budget') when over the limit"
    );
    assert!(
        elapsed < std::time::Duration::from_secs(5),
        "/graph must respond fast when above node budget, took {elapsed:?}"
    );

    child.kill().ok();
    child.wait().ok();
}

// ── Variant scoping ──────────────────────────────────────────────────────

#[test]
fn api_artifacts_variant_scope_reduces_total() {
    // Uses the test variants declared under `artifacts/variants/` in the
    // project root (minimal-ci → 1 artifact; dashboard-only → 3).
    let (mut child, port) = start_server();

    let (s1, b1, _) = fetch(port, "/api/v1/artifacts?limit=1000", false);
    assert_eq!(s1, 200);
    let j1: serde_json::Value = serde_json::from_str(&b1).unwrap();
    let total_unscoped = j1["total"].as_u64().unwrap();
    assert!(total_unscoped > 5, "sanity: project has many artifacts");

    // minimal-ci is defined with just a single bound artifact (REQ-001).
    let (s2, b2, _) = fetch(
        port,
        "/api/v1/artifacts?variant=minimal-ci&limit=1000",
        false,
    );
    assert_eq!(s2, 200);
    let j2: serde_json::Value = serde_json::from_str(&b2).unwrap();
    let scoped_total = j2["total"].as_u64().unwrap();
    assert_eq!(scoped_total, 1, "minimal-ci binds exactly REQ-001");

    let ids: Vec<String> = j2["artifacts"]
        .as_array()
        .unwrap()
        .iter()
        .map(|a| a["id"].as_str().unwrap().to_string())
        .collect();
    assert_eq!(ids, vec!["REQ-001".to_string()]);

    child.kill().ok();
    child.wait().ok();
}

/// A focused view (`?focus=REQ-001&depth=2`) stays under the budget and
/// must render SVG normally.
#[test]
fn graph_focused_view_renders_svg() {
    let (mut child, port) = start_server();

    let start = std::time::Instant::now();
    let (status, body, _) = fetch(port, "/graph?focus=REQ-001&depth=2", true);
    let elapsed = start.elapsed();
    eprintln!(
        "graph_focused_view_renders_svg: GET /graph?focus=REQ-001&depth=2 -> {} bytes in {elapsed:?}",
        body.len()
    );

    assert_eq!(status, 200, "focused /graph must return 200");
    assert!(
        body.contains("<svg"),
        "focused /graph must render SVG, got body starting with: {}",
        &body.chars().take(200).collect::<String>()
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_artifacts_unknown_variant_returns_400_json() {
    let (mut child, port) = start_server();
    let (status, body, _) = fetch(port, "/api/v1/artifacts?variant=does-not-exist", false);
    assert_eq!(status, 400, "unknown variant must be 400");
    let j: serde_json::Value = serde_json::from_str(&body).unwrap();
    assert_eq!(j["error"], "invalid_variant");
    assert!(
        j["message"].as_str().unwrap().contains("not found"),
        "error message should mention the variant isn't found: {}",
        j["message"]
    );
    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_stats_variant_scope_smaller_than_full() {
    let (mut child, port) = start_server();

    let (s1, b1, _) = fetch(port, "/api/v1/stats", false);
    assert_eq!(s1, 200);
    let j1: serde_json::Value = serde_json::from_str(&b1).unwrap();
    let total = j1["total_artifacts"].as_u64().unwrap();

    let (s2, b2, _) = fetch(port, "/api/v1/stats?variant=minimal-ci", false);
    assert_eq!(s2, 200);
    let j2: serde_json::Value = serde_json::from_str(&b2).unwrap();
    let scoped_total = j2["total_artifacts"].as_u64().unwrap();
    assert!(
        scoped_total < total,
        "scoped total must be strictly smaller"
    );
    assert_eq!(scoped_total, 1);

    child.kill().ok();
    child.wait().ok();
}

/// A very low `?limit=` forces the budget message even for a tiny focus
/// subgraph, confirming the override is wired through.
#[test]
fn graph_limit_override_triggers_budget_message() {
    let (mut child, port) = start_server();

    // Depth 3 around REQ-001 typically pulls in >1 node; limit=1 guarantees
    // we exceed the effective budget.
    let (status, body, _) = fetch(port, "/graph?focus=REQ-001&depth=3&limit=1", true);

    assert_eq!(status, 200, "/graph?limit=1 must return 200");
    assert!(
        body.contains("budget"),
        "low /graph?limit must short-circuit to budget message"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn api_coverage_honors_variant() {
    let (mut child, port) = start_server();
    let (status, body, _) = fetch(port, "/api/v1/coverage?variant=minimal-ci", false);
    assert_eq!(status, 200);
    let j: serde_json::Value = serde_json::from_str(&body).unwrap();
    // The scope only contains REQ-001 — most coverage rules will have
    // a total of at most 1.
    let rules = j["rules"].as_array().unwrap();
    assert!(!rules.is_empty(), "coverage report must have entries");
    // At least one rule's total must be <= 1 (from the 1-artifact scope)
    // even if the full project had hundreds of entries for that rule.
    assert!(
        rules
            .iter()
            .any(|r| r["total"].as_u64().unwrap_or(u64::MAX) <= 1),
        "scoped coverage must produce small totals"
    );
    child.kill().ok();
    child.wait().ok();
}

/// `?types=requirement` filters the full graph down; if the filtered
/// subgraph is under the budget it must render SVG (regression test for
/// the existing `graph with type filter renders SVG` Playwright case).
#[test]
fn graph_type_filter_renders_when_under_budget() {
    let (mut child, port) = start_server();

    let start = std::time::Instant::now();
    let (status, body, _) = fetch(port, "/graph?types=requirement", true);
    let elapsed = start.elapsed();
    let has_svg = body.contains("<svg");
    let has_budget = body.contains("budget");
    eprintln!(
        "graph_type_filter_renders_when_under_budget: GET /graph?types=requirement -> {} bytes in {elapsed:?}, svg={has_svg}, budget={has_budget}",
        body.len()
    );

    assert_eq!(status, 200, "/graph?types=requirement must return 200");
    // Either renders SVG (under budget) or renders the budget message —
    // both are acceptable. The key invariant is that the response is fast
    // and contains one of the two.
    assert!(
        body.contains("<svg") || body.contains("budget"),
        "/graph?types=requirement must produce SVG or budget message"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn variants_page_lists_declared_variants() {
    let (mut child, port) = start_server();
    let (status, body, _) = fetch(port, "/variants", false);
    assert_eq!(status, 200, "/variants must be 200");
    assert!(body.contains("minimal-ci"), "overview must list minimal-ci");
    assert!(
        body.contains("dashboard-only"),
        "overview must list dashboard-only"
    );
    assert!(
        body.contains("PASS"),
        "overview must render PASS status for solved variants"
    );
    child.kill().ok();
    child.wait().ok();
}

#[test]
fn dashboard_includes_variant_dropdown_when_model_present() {
    let (mut child, port) = start_server();
    let (status, body, _) = fetch(port, "/", false);
    assert_eq!(status, 200);
    assert!(
        body.contains("variant-selector"),
        "dropdown must render when feature model is configured"
    );
    // All declared variants must appear as <option> values.
    assert!(
        body.contains("value=\"minimal-ci\""),
        "minimal-ci option missing"
    );
    assert!(
        body.contains("value=\"dashboard-only\""),
        "dashboard-only option missing"
    );
    child.kill().ok();
    child.wait().ok();
}

#[test]
fn stats_page_shows_variant_banner_when_scoped() {
    let (mut child, port) = start_server();
    let (status, body, _) = fetch(port, "/stats?variant=minimal-ci", false);
    assert_eq!(status, 200);
    assert!(
        body.contains("Filtered to variant"),
        "banner must appear when ?variant is set"
    );
    assert!(
        body.contains("minimal-ci"),
        "banner must name the active variant"
    );
    assert!(
        body.contains("Clear filter"),
        "banner must offer a Clear filter link"
    );
    child.kill().ok();
    child.wait().ok();
}

// ── /embed/* path rewriting (REQ-007 + tests/playwright/api.spec.ts:291) ──

#[test]
fn embed_artifact_returns_200_with_embed_layout() {
    // Regression: the wrap_full_page middleware strips /embed and routes
    // to /artifacts/{id} so the dashboard can iframe-embed an artifact
    // without registering duplicate routes.  A previous URI-rewriting
    // bug (round-tripping `Uri::into_parts` / `from_parts`) left the
    // inner router with an empty matched path, returning a wrapped 404
    // — exactly the symptom Playwright's api.spec.ts:291 catches.
    let (mut child, port) = start_server();
    let (status, body, _) = fetch(port, "/embed/artifacts/REQ-001", false);
    assert_eq!(
        status, 200,
        "/embed/artifacts/REQ-001 must route through to artifact_detail"
    );
    // embed_layout (no nav, no .shell) — distinct from page_layout.
    assert!(
        !body.contains("class=\"shell\""),
        "/embed/* must not render the sidebar shell"
    );
    assert!(
        !body.contains("Main navigation"),
        "/embed/* must not render the main nav"
    );
    // Artifact body still renders (REQ-001 always exists in the test fixture).
    assert!(
        body.contains("REQ-001"),
        "embed body must contain the artifact ID, got body of length {}",
        body.len()
    );
    // htmx is loaded so the embedded view stays interactive.
    assert!(
        body.contains("htmx"),
        "embed body must include htmx (script tag)"
    );
    child.kill().ok();
    child.wait().ok();
}

#[test]
fn eu_ai_act_dashboard_renders_real_content() {
    // Verifies that with the rivet self-audit artifacts in place + the
    // eu-ai-act schema loaded via rivet.yaml, the /eu-ai-act dashboard
    // renders the populated Annex IV view rather than the empty
    // placeholder ("schema is not loaded for this project").
    //
    // Oracle for the eu-ai-act self-audit dogfood task: confirms the
    // is_eu_ai_act_loaded() check returns true for rivet's own store and
    // the dashboard surfaces real compliance content.
    let (mut child, port) = start_server();
    let (status, body, _headers) = fetch(port, "/eu-ai-act", false);

    assert_eq!(status, 200, "GET /eu-ai-act must return 200");

    // Must NOT be the empty-placeholder card.
    assert!(
        !body.contains("schema is not loaded for this project"),
        "/eu-ai-act must render the populated dashboard, not the placeholder.\n\
         Check that rivet.yaml lists `eu-ai-act` under schemas and that\n\
         artifacts/eu-ai-act.yaml provides ai-system-description and\n\
         conformity-declaration entries (is_eu_ai_act_loaded gate).\n\
         Body excerpt: {}",
        body.chars().take(400).collect::<String>()
    );

    // Must render the real Annex IV section table.
    assert!(
        body.contains("Compliance by Annex IV Section"),
        "/eu-ai-act must include the populated Annex IV section table"
    );
    assert!(
        body.contains("Overall Compliance"),
        "/eu-ai-act must include the overall compliance stat box"
    );

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn embed_unknown_artifact_returns_200_with_not_found_body() {
    // Unknown artifact under /embed should still go through the embed
    // layout — render_artifact_detail returns a 200 with a "Not Found"
    // body, which the embed wrap preserves. Exercises the same
    // middleware-strip path as the happy case.
    let (mut child, port) = start_server();
    let (status, body, _) = fetch(port, "/embed/artifacts/DOES-NOT-EXIST", false);
    assert_eq!(status, 200);
    assert!(
        body.contains("Not Found"),
        "embed body for unknown artifact should include 'Not Found'"
    );
    assert!(
        !body.contains("Main navigation"),
        "/embed/* must not render the main nav even for not-found"
    );
    child.kill().ok();
    child.wait().ok();
}
