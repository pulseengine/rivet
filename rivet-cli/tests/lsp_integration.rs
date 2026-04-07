//! LSP integration tests -- spawn `rivet lsp` as a subprocess and exercise
//! the Language Server Protocol over stdio (JSON-RPC 2.0).
//!
//! Each test creates a temporary project directory with `rivet.yaml` and a
//! small artifact YAML file, starts the LSP, and verifies the expected
//! responses and notifications.
//!
//! A background reader thread is used to avoid blocking on stdout reads.

use std::io::{BufRead, BufReader, Read, Write};
use std::path::PathBuf;
use std::process::{Command, Stdio};
use std::sync::mpsc;
use std::time::Duration;

/// Locate the `rivet` binary built by cargo.
fn rivet_bin() -> PathBuf {
    if let Ok(bin) = std::env::var("CARGO_BIN_EXE_rivet") {
        return PathBuf::from(bin);
    }
    let manifest = PathBuf::from(env!("CARGO_MANIFEST_DIR"));
    let workspace_root = manifest.parent().expect("workspace root");
    workspace_root.join("target").join("debug").join("rivet")
}

// ── JSON-RPC helpers ────────────────────────────────────────────────────

/// Encode a JSON-RPC message with Content-Length header for LSP.
fn encode_message(json: &serde_json::Value) -> Vec<u8> {
    let body = serde_json::to_string(json).expect("serialize JSON-RPC message");
    format!("Content-Length: {}\r\n\r\n{}", body.len(), body).into_bytes()
}

/// Read a single LSP message from a BufReader (blocking). Called from a
/// dedicated reader thread.
fn read_one_message(reader: &mut BufReader<impl Read>) -> Option<serde_json::Value> {
    let mut content_length: Option<usize> = None;
    loop {
        let mut header_line = String::new();
        match reader.read_line(&mut header_line) {
            Ok(0) => return None, // EOF
            Ok(_) => {
                let trimmed = header_line.trim();
                if trimmed.is_empty() {
                    break; // end of headers
                }
                if let Some(val) = trimmed.strip_prefix("Content-Length: ") {
                    content_length = val.parse().ok();
                }
            }
            Err(_) => return None,
        }
    }
    let length = content_length?;
    let mut body = vec![0u8; length];
    reader.read_exact(&mut body).ok()?;
    serde_json::from_slice(&body).ok()
}

/// A handle to an LSP subprocess with a background reader thread.
/// Messages from the server are delivered via a channel.
struct LspProcess {
    child: std::process::Child,
    stdin: std::process::ChildStdin,
    rx: mpsc::Receiver<serde_json::Value>,
    stderr_rx: mpsc::Receiver<String>,
}

impl LspProcess {
    /// Send a JSON-RPC message to the server.
    fn send(&mut self, msg: &serde_json::Value) {
        self.stdin
            .write_all(&encode_message(msg))
            .expect("write to LSP stdin");
        self.stdin.flush().expect("flush LSP stdin");
    }

    /// Receive the next message from the server, with a timeout.
    fn recv(&self, timeout: Duration) -> Option<serde_json::Value> {
        self.rx.recv_timeout(timeout).ok()
    }

    /// Receive messages until one matches the predicate, or timeout.
    fn recv_until(
        &self,
        timeout: Duration,
        pred: impl Fn(&serde_json::Value) -> bool,
    ) -> Option<serde_json::Value> {
        let deadline = std::time::Instant::now() + timeout;
        loop {
            let remaining = deadline.saturating_duration_since(std::time::Instant::now());
            if remaining.is_zero() {
                return None;
            }
            match self.rx.recv_timeout(remaining) {
                Ok(msg) if pred(&msg) => return Some(msg),
                Ok(_) => continue,
                Err(_) => return None,
            }
        }
    }

    /// Drain all pending messages (non-blocking).
    fn drain(&self) {
        while self.rx.try_recv().is_ok() {}
    }

    /// Collect all stderr lines received so far (non-blocking).
    fn collect_stderr(&self) -> Vec<String> {
        let mut lines = Vec::new();
        while let Ok(line) = self.stderr_rx.try_recv() {
            lines.push(line);
        }
        lines
    }

    /// Perform LSP initialize handshake and return the server capabilities.
    fn initialize(&mut self, root_uri: &str) -> serde_json::Value {
        self.send(&serde_json::json!({
            "jsonrpc": "2.0",
            "id": 1,
            "method": "initialize",
            "params": {
                "processId": std::process::id(),
                "rootUri": root_uri,
                "capabilities": {},
                "workspaceFolders": null
            }
        }));

        let resp = self
            .recv_until(Duration::from_secs(30), |m| {
                m.get("id").and_then(|v| v.as_u64()) == Some(1)
            })
            .expect("initialize response");

        // Send initialized notification
        self.send(&serde_json::json!({
            "jsonrpc": "2.0",
            "method": "initialized",
            "params": {}
        }));

        resp
    }

    /// Send shutdown + exit and wait for the process to terminate.
    fn shutdown(mut self) {
        self.send(&serde_json::json!({
            "jsonrpc": "2.0",
            "id": 9999,
            "method": "shutdown",
            "params": null
        }));
        // Try to read shutdown response (best effort)
        let _ = self.recv(Duration::from_secs(5));

        self.send(&serde_json::json!({
            "jsonrpc": "2.0",
            "method": "exit",
            "params": null
        }));

        // Close stdin so the server's IO reader thread can finish.
        // The lsp-server crate's io_threads.join() waits for stdin EOF.
        drop(self.stdin);

        // Wait for exit with polling
        let deadline = std::time::Instant::now() + Duration::from_secs(10);
        loop {
            match self.child.try_wait() {
                Ok(Some(_)) => break,
                Ok(None) if std::time::Instant::now() < deadline => {
                    std::thread::sleep(Duration::from_millis(50));
                }
                _ => {
                    let _ = self.child.kill();
                    let _ = self.child.wait();
                    break;
                }
            }
        }
    }
}

/// Create a temporary project directory with rivet.yaml and a sample artifact file.
/// Returns (temp_dir_handle, project_path, artifact_file_path).
fn create_test_project() -> (tempfile::TempDir, PathBuf, PathBuf) {
    let tmp = tempfile::tempdir().expect("create temp dir");
    let dir = tmp.path().to_path_buf();

    let config = r#"project:
  name: lsp-test
  version: "0.1.0"
  schemas:
    - common
    - dev

sources:
  - path: artifacts
    format: generic-yaml
"#;
    std::fs::write(dir.join("rivet.yaml"), config).expect("write rivet.yaml");

    let artifacts_dir = dir.join("artifacts");
    std::fs::create_dir_all(&artifacts_dir).expect("create artifacts dir");
    // The rowan schema-driven parser expects a top-level mapping with an
    // `artifacts:` key for the generic-yaml format.
    let artifacts_yaml = r#"artifacts:
  - id: REQ-001
    type: requirement
    title: First requirement
    status: draft

  - id: REQ-002
    type: requirement
    title: Second requirement
    status: draft
    links:
      - type: satisfies
        target: REQ-001
"#;
    let artifact_path = artifacts_dir.join("requirements.yaml");
    std::fs::write(&artifact_path, artifacts_yaml).expect("write artifacts");

    (tmp, dir, artifact_path)
}

/// Spawn `rivet lsp` with background reader threads for stdout and stderr.
fn spawn_lsp(project_dir: &std::path::Path) -> LspProcess {
    let mut child = Command::new(rivet_bin())
        .args(["--project", project_dir.to_str().unwrap(), "lsp"])
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped())
        .spawn()
        .expect("failed to spawn rivet lsp");

    let stdin = child.stdin.take().expect("stdin");
    let stdout = child.stdout.take().expect("stdout");
    let stderr = child.stderr.take().expect("stderr");

    let (tx, rx) = mpsc::channel();

    // Background thread for stdout (LSP messages)
    std::thread::spawn(move || {
        let mut reader = BufReader::new(stdout);
        while let Some(msg) = read_one_message(&mut reader) {
            if tx.send(msg).is_err() {
                break;
            }
        }
    });

    // Background thread for stderr (prevents pipe buffer from filling)
    let (stderr_tx, stderr_rx) = mpsc::channel();
    std::thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            match line {
                Ok(l) => {
                    if stderr_tx.send(l).is_err() {
                        break;
                    }
                }
                Err(_) => break,
            }
        }
    });

    LspProcess {
        child,
        stdin,
        rx,
        stderr_rx,
    }
}

// ── Tests ───────────────────────────────────────────────────────────────

const TIMEOUT: Duration = Duration::from_secs(30);

/// Verify the LSP initialize handshake: send initialize request, receive
/// a response with server capabilities.
#[test]
fn lsp_initialize_handshake() {
    let (_tmp, project_dir, _artifact_path) = create_test_project();
    let mut lsp = spawn_lsp(&project_dir);

    let root_uri = format!("file://{}", project_dir.display());
    let response = lsp.initialize(&root_uri);

    let result = response
        .get("result")
        .expect("result field in initialize response");
    let capabilities = result.get("capabilities").expect("capabilities in result");

    assert!(
        capabilities.get("textDocumentSync").is_some(),
        "server must advertise textDocumentSync"
    );
    assert!(
        capabilities.get("hoverProvider").is_some(),
        "server must advertise hoverProvider"
    );
    assert!(
        capabilities.get("definitionProvider").is_some(),
        "server must advertise definitionProvider"
    );
    assert!(
        capabilities.get("documentSymbolProvider").is_some(),
        "server must advertise documentSymbolProvider"
    );
    assert!(
        capabilities.get("completionProvider").is_some(),
        "server must advertise completionProvider"
    );

    lsp.shutdown();
}

/// Send textDocument/didOpen with a YAML artifact file that has a
/// validation error and verify that diagnostics are published.
#[test]
fn lsp_diagnostics_on_did_open() {
    let (_tmp, project_dir, artifact_path) = create_test_project();
    let mut lsp = spawn_lsp(&project_dir);

    let root_uri = format!("file://{}", project_dir.display());
    let artifact_uri = format!("file://{}", artifact_path.display());

    lsp.initialize(&root_uri);

    // Give the server time to finish loading schemas/sources after
    // initialize, then send didOpen with a broken link.
    std::thread::sleep(Duration::from_secs(2));

    // Send didOpen with content that has a broken link (target NONEXISTENT
    // does not exist), which should trigger a validation error.
    let yaml_with_error = concat!(
        "artifacts:\n",
        "  - id: REQ-001\n",
        "    type: requirement\n",
        "    title: First requirement\n",
        "    status: draft\n",
        "    links:\n",
        "      - type: satisfies\n",
        "        target: NONEXISTENT\n",
        "\n",
        "  - id: REQ-002\n",
        "    type: requirement\n",
        "    title: Second requirement\n",
        "    status: draft\n",
    );
    lsp.send(&serde_json::json!({
        "jsonrpc": "2.0",
        "method": "textDocument/didOpen",
        "params": {
            "textDocument": {
                "uri": artifact_uri,
                "languageId": "yaml",
                "version": 1,
                "text": yaml_with_error
            }
        }
    }));

    // Send a documentSymbol request to force a server round-trip.
    // This ensures the server has processed the didOpen before we check
    // for diagnostics, and confirms the server is responsive.
    lsp.send(&serde_json::json!({
        "jsonrpc": "2.0",
        "id": 50,
        "method": "textDocument/documentSymbol",
        "params": {
            "textDocument": { "uri": artifact_uri }
        }
    }));

    // Read ALL messages until we get the documentSymbol response (id=50).
    // Diagnostics notifications should arrive before or interleaved with
    // the response.
    let mut all_messages = Vec::new();
    let mut got_diagnostics = false;
    let deadline = std::time::Instant::now() + TIMEOUT;
    while std::time::Instant::now() < deadline {
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        match lsp.recv(remaining) {
            Some(msg) => {
                if msg.get("method").and_then(|v| v.as_str())
                    == Some("textDocument/publishDiagnostics")
                {
                    got_diagnostics = true;
                }
                let is_sym_response =
                    msg.get("id").and_then(|v| v.as_u64()) == Some(50);
                all_messages.push(msg);
                if is_sym_response {
                    break;
                }
            }
            None => break,
        }
    }

    assert!(
        all_messages
            .iter()
            .any(|m| m.get("id").and_then(|v| v.as_u64()) == Some(50)),
        "server must respond to documentSymbol request after didOpen. \
         Received {} messages: {:?}",
        all_messages.len(),
        all_messages
    );
    if !got_diagnostics {
        let stderr_lines = lsp.collect_stderr();
        panic!(
            "server must publish diagnostics after textDocument/didOpen with errors. \
             All messages received: {:?}\nServer stderr ({} lines): {}",
            all_messages,
            stderr_lines.len(),
            stderr_lines.join("\n")
        );
    }
    // Find the diagnostics message and verify its structure
    let diag_msg = all_messages
        .iter()
        .find(|m| {
            m.get("method").and_then(|v| v.as_str()) == Some("textDocument/publishDiagnostics")
        })
        .expect("diagnostics message must exist (asserted above)");
    let params = diag_msg.get("params").expect("diagnostics params");
    assert!(
        params.get("uri").is_some(),
        "diagnostics must have a uri field"
    );
    assert!(
        params
            .get("diagnostics")
            .and_then(|v| v.as_array())
            .is_some(),
        "diagnostics must have a diagnostics array"
    );

    lsp.shutdown();
}

/// Send textDocument/documentSymbol request and verify symbols are returned.
#[test]
fn lsp_document_symbols() {
    let (_tmp, project_dir, artifact_path) = create_test_project();
    let mut lsp = spawn_lsp(&project_dir);

    let root_uri = format!("file://{}", project_dir.display());
    let artifact_uri = format!("file://{}", artifact_path.display());

    lsp.initialize(&root_uri);

    // Wait a moment for initialization to settle, drain notifications
    std::thread::sleep(Duration::from_millis(500));
    lsp.drain();

    // Send textDocument/didOpen so the server knows about the file
    let artifact_content = std::fs::read_to_string(&artifact_path).expect("read artifact");
    lsp.send(&serde_json::json!({
        "jsonrpc": "2.0",
        "method": "textDocument/didOpen",
        "params": {
            "textDocument": {
                "uri": artifact_uri,
                "languageId": "yaml",
                "version": 1,
                "text": artifact_content
            }
        }
    }));

    // Wait for didOpen diagnostics to be published, then drain them
    std::thread::sleep(Duration::from_millis(500));
    lsp.drain();

    // Send documentSymbol request
    lsp.send(&serde_json::json!({
        "jsonrpc": "2.0",
        "id": 2,
        "method": "textDocument/documentSymbol",
        "params": {
            "textDocument": {
                "uri": artifact_uri
            }
        }
    }));

    // Read the response with id=2
    let response = lsp
        .recv_until(TIMEOUT, |m| {
            m.get("id").and_then(|v| v.as_u64()) == Some(2)
        })
        .expect("documentSymbol response");

    let result = response
        .get("result")
        .expect("result in documentSymbol response");
    let symbols = result
        .as_array()
        .expect("result should be an array of symbols");

    // Our test file has REQ-001 and REQ-002
    assert!(
        symbols.len() >= 2,
        "expected at least 2 symbols (REQ-001, REQ-002), got {}",
        symbols.len()
    );

    // Verify the first symbol has expected fields
    let first = &symbols[0];
    let name = first.get("name").and_then(|v| v.as_str()).unwrap_or("");
    assert!(
        name.contains("REQ-001") || name.contains("REQ-002"),
        "first symbol name should contain an artifact ID, got: {name}"
    );
    assert!(
        first.get("kind").is_some(),
        "symbol must have a 'kind' field"
    );
    assert!(
        first.get("range").is_some(),
        "symbol must have a 'range' field"
    );
    assert!(
        first.get("selectionRange").is_some(),
        "symbol must have a 'selectionRange' field"
    );

    lsp.shutdown();
}

/// Verify the LSP shutdown handshake: server responds to shutdown request
/// with the correct id. After shutdown+exit, close stdin so IO threads
/// can join. The server should then exit.
#[test]
fn lsp_clean_shutdown() {
    let (_tmp, project_dir, _artifact_path) = create_test_project();
    let mut lsp = spawn_lsp(&project_dir);

    let root_uri = format!("file://{}", project_dir.display());
    lsp.initialize(&root_uri);

    // Drain initial notifications
    std::thread::sleep(Duration::from_millis(500));
    lsp.drain();

    // Send shutdown request
    lsp.send(&serde_json::json!({
        "jsonrpc": "2.0",
        "id": 99,
        "method": "shutdown",
        "params": null
    }));

    // Read the shutdown response. The lsp-server crate's handle_shutdown
    // sends the response and then blocks waiting for the exit notification,
    // so the response should arrive before we need to send exit.
    let shutdown_resp = lsp.recv_until(Duration::from_secs(10), |m| {
        m.get("id").and_then(|v| v.as_u64()) == Some(99)
    });
    assert!(
        shutdown_resp.is_some(),
        "server must respond to shutdown request"
    );
    let resp = shutdown_resp.unwrap();
    assert_eq!(
        resp.get("id").and_then(|v| v.as_u64()),
        Some(99),
        "shutdown response must have matching id"
    );

    // Send exit notification and close stdin to let IO threads join.
    lsp.send(&serde_json::json!({
        "jsonrpc": "2.0",
        "method": "exit",
        "params": null
    }));
    drop(lsp.stdin);

    // Wait for process to exit
    let deadline = std::time::Instant::now() + Duration::from_secs(10);
    let mut exited = false;
    while std::time::Instant::now() < deadline {
        match lsp.child.try_wait() {
            Ok(Some(_)) => {
                exited = true;
                break;
            }
            Ok(None) => std::thread::sleep(Duration::from_millis(100)),
            Err(e) => panic!("error waiting for child: {e}"),
        }
    }
    if !exited {
        let _ = lsp.child.kill();
    }
    assert!(
        exited,
        "LSP server must exit within 10 seconds after shutdown+exit"
    );
}

/// Send textDocument/didOpen with invalid YAML (bad artifact type) and
/// verify error diagnostics are published with severity.
#[test]
fn lsp_diagnostics_for_invalid_artifacts() {
    let (_tmp, project_dir, artifact_path) = create_test_project();
    let mut lsp = spawn_lsp(&project_dir);

    let root_uri = format!("file://{}", project_dir.display());
    let artifact_uri = format!("file://{}", artifact_path.display());

    lsp.initialize(&root_uri);

    // Drain initial diagnostics
    std::thread::sleep(Duration::from_millis(500));
    lsp.drain();

    // Send didOpen with an artifact that has an unknown type
    let bad_yaml = "artifacts:\n  - id: BAD-001\n    type: nonexistent-type\n    title: Invalid artifact\n    status: draft\n";
    lsp.send(&serde_json::json!({
        "jsonrpc": "2.0",
        "method": "textDocument/didOpen",
        "params": {
            "textDocument": {
                "uri": artifact_uri,
                "languageId": "yaml",
                "version": 1,
                "text": bad_yaml
            }
        }
    }));

    // Read diagnostics -- we expect at least one error about the unknown type
    let mut found_error_diagnostic = false;
    let deadline = std::time::Instant::now() + TIMEOUT;
    while std::time::Instant::now() < deadline {
        let remaining = deadline.saturating_duration_since(std::time::Instant::now());
        if let Some(msg) = lsp.recv(remaining) {
            if msg.get("method").and_then(|v| v.as_str()) == Some("textDocument/publishDiagnostics")
            {
                let params = msg.get("params").expect("params");
                if let Some(diags) = params.get("diagnostics").and_then(|v| v.as_array()) {
                    for diag in diags {
                        let message = diag.get("message").and_then(|v| v.as_str()).unwrap_or("");
                        if message.contains("unknown artifact type")
                            || message.contains("nonexistent")
                        {
                            found_error_diagnostic = true;
                            // Verify severity is Error (1)
                            let severity = diag.get("severity").and_then(|v| v.as_u64());
                            assert_eq!(
                                severity,
                                Some(1),
                                "unknown type diagnostic should have Error severity"
                            );
                            break;
                        }
                    }
                }
                if found_error_diagnostic {
                    break;
                }
            }
        } else {
            break;
        }
    }
    assert!(
        found_error_diagnostic,
        "server must publish error diagnostics for unknown artifact type"
    );

    lsp.shutdown();
}
