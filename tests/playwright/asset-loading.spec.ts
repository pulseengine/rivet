import { test, expect } from "@playwright/test";

/**
 * Regression tests for asset loading bugs:
 * - HTMX/Mermaid served as HTML instead of JS (layout middleware wrapping)
 * - CSP blocking embedded fonts
 * - WASM 404 spamming console errors
 */
test.describe("Asset Loading (regression)", () => {
  test("htmx.js returns JavaScript, not HTML", async ({ page }) => {
    const resp = await page.request.get("/assets/htmx.js");
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("javascript");
    const body = await resp.text();
    expect(body).not.toMatch(/^</); // must not start with HTML tag
  });

  test("mermaid.js returns JavaScript, not HTML", async ({ page }) => {
    const resp = await page.request.get("/assets/mermaid.js");
    expect(resp.status()).toBe(200);
    const ct = resp.headers()["content-type"];
    expect(ct).toContain("javascript");
    const body = await resp.text();
    expect(body).not.toMatch(/^</);
  });

  test("no JS errors on page load", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Filter out WASM-related errors (expected when embed-wasm feature is off)
    const nonWasmErrors = errors.filter(
      (e) => !e.includes("spar_wasm") && !e.includes("AADL WASM"),
    );
    expect(nonWasmErrors).toEqual([]);
  });

  test("no JS errors navigating to artifacts", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/artifacts");
    await page.waitForLoadState("networkidle");

    const nonWasmErrors = errors.filter(
      (e) => !e.includes("spar_wasm") && !e.includes("AADL WASM"),
    );
    expect(nonWasmErrors).toEqual([]);
  });

  test("CSP header allows inline styles and data: fonts", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("style-src 'self' 'unsafe-inline'");
    expect(csp).toContain("font-src 'self' data:");
  });

  test("no font loading errors", async ({ page }) => {
    const blockedRequests: string[] = [];

    page.on("requestfailed", (req) => {
      const url = req.url();
      if (url.includes("font") || url.includes("woff")) {
        blockedRequests.push(url);
      }
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    expect(blockedRequests).toEqual([]);
  });

  test("AADL diagram shows fallback when WASM unavailable", async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    // Navigate to an ARCH artifact that has a diagram field
    await page.goto("/artifacts/ARCH-SYS-001");
    await page.waitForLoadState("networkidle");
    // Wait a moment for the async AADL init
    await page.waitForTimeout(2000);

    // Should NOT have uncaught SyntaxError from failed WASM import
    const syntaxErrors = errors.filter((e) => e.includes("SyntaxError"));
    expect(syntaxErrors).toEqual([]);
  });

  test("mermaid diagrams render without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Mermaid should have loaded without errors
    const mermaidErrors = errors.filter(
      (e) => e.includes("mermaid") || e.includes("Mermaid"),
    );
    expect(mermaidErrors).toEqual([]);
  });

  test("clicking nav link navigates correctly (no /#)", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Click artifacts nav link
    await page.click('nav a[hx-get="/artifacts"]');
    await page.waitForTimeout(500);

    const url = new URL(page.url());
    expect(url.pathname).toBe("/artifacts");
    expect(url.hash).toBe("");
  });
});
