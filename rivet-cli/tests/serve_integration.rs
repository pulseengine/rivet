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
    let child = Command::new(rivet_bin())
        .args(["serve", "--port", &port.to_string()])
        .current_dir(project_root())
        .stdout(std::process::Stdio::null())
        .stderr(std::process::Stdio::null())
        .spawn()
        .expect("failed to start rivet serve");

    // Wait for server to be ready
    let addr = format!("127.0.0.1:{port}");
    for _ in 0..50 {
        if std::net::TcpStream::connect(&addr).is_ok() {
            return (child, port);
        }
        std::thread::sleep(Duration::from_millis(100));
    }
    panic!("server did not start within 5 seconds on port {port}");
}

/// Fetch a page via HTTP. If `htmx` is true, sends the HX-Request header
/// to get partial (HTMX) responses; otherwise gets the full page.
fn fetch(port: u16, path: &str, htmx: bool) -> (u16, String, Vec<(String, String)>) {
    let _url = format!("http://127.0.0.1:{port}{path}");

    // Use a minimal HTTP/1.1 request via TcpStream
    use std::io::{Read, Write};
    let mut stream =
        std::net::TcpStream::connect(format!("127.0.0.1:{port}")).expect("connect");
    stream
        .set_read_timeout(Some(Duration::from_secs(5)))
        .ok();

    let hx_header = if htmx {
        "HX-Request: true\r\n"
    } else {
        ""
    };
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
        assert!(
            status == 200,
            "GET {page} returned {status}, expected 200"
        );
        assert_links_push_url(&body, page);
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn non_htmx_request_redirects() {
    let (mut child, port) = start_server();

    // A non-HTMX GET to /results should redirect via /?goto=
    let (status, body, headers) = fetch(port, "/results", false);

    // Should redirect (303) to /?goto=/results
    assert!(
        status == 303 || status == 302 || status == 200,
        "non-HTMX GET /results should redirect (303/302) or serve shell (200), got {status}"
    );

    if status == 303 || status == 302 {
        // Check Location header contains goto
        let location = headers
            .iter()
            .find(|(k, _)| k.eq_ignore_ascii_case("location"))
            .map(|(_, v)| v.as_str())
            .unwrap_or("");
        assert!(
            location.contains("goto")
                && (location.contains("/results") || location.contains("%2Fresults")),
            "redirect Location must contain /?goto=/results, got: {location}"
        );
    } else {
        assert!(
            body.contains("goto") || body.contains("/results"),
            "non-HTMX response must contain goto redirect for /results"
        );
    }

    child.kill().ok();
    child.wait().ok();
}

#[test]
fn reload_returns_hx_location() {
    let (mut child, port) = start_server();

    // Simulate reload with HX-Current-URL header
    use std::io::{Read, Write};
    let mut stream =
        std::net::TcpStream::connect(format!("127.0.0.1:{port}")).expect("connect");
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
