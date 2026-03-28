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

    // Wait for server to be ready (up to 30s — 20 integration tests each
    // spawn a server, so system resources can be tight under CI/coverage).
    let addr = format!("127.0.0.1:{port}");
    for _ in 0..300 {
        if std::net::TcpStream::connect(&addr).is_ok() {
            return (child, port);
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    // Kill the child before panicking to avoid zombie processes.
    let _ = child.kill();
    let _ = child.wait();
    panic!("server did not start within 30 seconds on port {port}");
}

/// Fetch a page via HTTP. If `htmx` is true, sends the HX-Request header
/// to get partial (HTMX) responses; otherwise gets the full page.
fn fetch(port: u16, path: &str, htmx: bool) -> (u16, String, Vec<(String, String)>) {
    let _url = format!("http://127.0.0.1:{port}{path}");

    // Use a minimal HTTP/1.1 request via TcpStream
    use std::io::{Read, Write};
    let mut stream = std::net::TcpStream::connect(format!("127.0.0.1:{port}")).expect("connect");
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
    let mut stream = std::net::TcpStream::connect(format!("127.0.0.1:{port}")).expect("connect");
    stream.set_read_timeout(Some(Duration::from_secs(5))).ok();

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
    stream.read_to_end(&mut response).ok();
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
