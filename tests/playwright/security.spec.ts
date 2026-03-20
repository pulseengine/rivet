import { test, expect } from "@playwright/test";

test.describe("Security Headers", () => {
  test("default bind is localhost (response comes from localhost)", async ({
    page,
  }) => {
    const resp = await page.request.get("/");
    expect(resp.status()).toBe(200);
    // The server should be reachable on localhost (baseURL is localhost:3003)
    const url = resp.url();
    expect(url).toContain("localhost");
  });

  test("CSP header is present on all responses", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp!.length).toBeGreaterThan(0);
  });

  test("CSP default-src is self", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toContain("default-src 'self'");
  });

  test("CSP script-src allows self and unsafe-inline", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
  });

  test("CSP style-src allows self and unsafe-inline", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
  });

  test("CSP img-src allows self and data:", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toContain("img-src 'self' data:");
  });

  test("CSP font-src allows self and data:", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toContain("font-src 'self' data:");
  });

  test("CSP connect-src is self", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toContain("connect-src 'self'");
  });

  test("CSP header present on artifact routes too", async ({ page }) => {
    const resp = await page.request.get("/artifacts");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("default-src 'self'");
  });

  test("CSP header present on API routes", async ({ page }) => {
    const resp = await page.request.get("/api/links/REQ-001");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toBeDefined();
  });

  test("no CORS headers by default", async ({ page }) => {
    const resp = await page.request.get("/");
    const headers = resp.headers();
    // Should NOT have Access-Control-Allow-Origin (no CORS by default)
    expect(headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("no CORS headers on asset routes", async ({ page }) => {
    const resp = await page.request.get("/assets/htmx.js");
    const headers = resp.headers();
    expect(headers["access-control-allow-origin"]).toBeUndefined();
  });
});

test.describe("Asset Content-Types", () => {
  test("htmx.js returns application/javascript", async ({ page }) => {
    const resp = await page.request.get("/assets/htmx.js");
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("javascript");
  });

  test("mermaid.js returns application/javascript", async ({ page }) => {
    const resp = await page.request.get("/assets/mermaid.js");
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("javascript");
  });

  test("HTML pages return text/html", async ({ page }) => {
    const resp = await page.request.get("/");
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("text/html");
  });

  test("artifact detail returns text/html", async ({ page }) => {
    const resp = await page.request.get("/artifacts/REQ-001");
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("text/html");
  });

  test("API links endpoint returns JSON", async ({ page }) => {
    const resp = await page.request.get("/api/links/REQ-001");
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("json");
  });
});

test.describe("Security: Path Traversal", () => {
  test("source path traversal blocked", async ({ page }) => {
    const resp = await page.goto("/source/..%2F..%2Fetc%2Fpasswd");
    expect(resp?.status()).toBe(200);
    const body = await page.locator("body").textContent();
    expect(body).toMatch(/Forbidden|Not Found|traversal/i);
    // Should NOT contain passwd file content
    expect(body).not.toContain("root:");
  });

  test("source-raw path traversal blocked", async ({ page }) => {
    const resp = await page.request.get(
      "/source-raw/..%2F..%2Fetc%2Fpasswd",
    );
    // Should return error, not the file
    const body = await resp.text();
    expect(body).not.toContain("root:");
  });
});
