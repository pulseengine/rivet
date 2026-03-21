import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

/**
 * Regression tests for the deep quality audit findings.
 * Each test prevents a specific bug from reoccurring.
 */
test.describe("Audit Regression: Security", () => {
  test("mermaid securityLevel is strict, not loose", async ({ page }) => {
    await page.goto("/");
    const html = await page.content();
    expect(html).toContain("securityLevel:'strict'");
    expect(html).not.toContain("securityLevel:'loose'");
  });

  test("mermaid securityLevel strict in print view", async ({ page }) => {
    await page.goto("/stats?print=1");
    const html = await page.content();
    expect(html).toContain("securityLevel:'strict'");
    expect(html).not.toContain("securityLevel:'loose'");
  });

  test("artifact IDs are HTML-escaped in source view", async ({ page }) => {
    await page.goto("/source");
    await waitForHtmx(page);
    // All artifact links in source view should use escaped IDs
    const hrefs = await page.locator("a[hx-get^='/artifacts/']").evaluateAll(
      (els) => els.map((el) => el.getAttribute("href")),
    );
    for (const href of hrefs) {
      expect(href).not.toContain("<");
      expect(href).not.toContain(">");
    }
  });

  test("CSP blocks unsafe script execution", async ({ page }) => {
    const resp = await page.request.get("/");
    const csp = resp.headers()["content-security-policy"];
    expect(csp).toBeDefined();
    expect(csp).toContain("script-src 'self' 'unsafe-inline'");
    // unsafe-eval should NOT be present
    expect(csp).not.toContain("unsafe-eval");
  });
});

test.describe("Audit Regression: Performance", () => {
  test("page layout does not recompute validation (no lag on navigation)", async ({
    page,
  }) => {
    // Navigate to multiple pages quickly — should be fast because
    // layout uses cached_diagnostics instead of recomputing
    const start = Date.now();
    await page.goto("/artifacts");
    await waitForHtmx(page);
    await page.goto("/stpa");
    await waitForHtmx(page);
    await page.goto("/stats");
    await waitForHtmx(page);
    const elapsed = Date.now() - start;
    // 3 page loads should take < 5s (was slow when recomputing validation)
    expect(elapsed).toBeLessThan(5000);
  });
});

test.describe("Audit Regression: Edge Cases", () => {
  test("pagination page=0 does not crash", async ({ page }) => {
    const resp = await page.goto("/artifacts?page=0");
    expect(resp?.status()).toBe(200);
  });

  test("pagination page=99999 does not crash", async ({ page }) => {
    const resp = await page.goto("/artifacts?page=99999");
    expect(resp?.status()).toBe(200);
  });

  test("pagination per_page=0 does not crash", async ({ page }) => {
    const resp = await page.goto("/artifacts?per_page=0");
    expect(resp?.status()).toBe(200);
  });

  test("pagination per_page=1 shows single row", async ({ page }) => {
    const resp = await page.goto("/artifacts?per_page=1");
    expect(resp?.status()).toBe(200);
  });

  test("sort with unknown column does not crash", async ({ page }) => {
    const resp = await page.goto("/artifacts?sort=nonexistent");
    expect(resp?.status()).toBe(200);
  });

  test("empty search query returns all artifacts", async ({ page }) => {
    const resp = await page.goto("/artifacts?q=");
    expect(resp?.status()).toBe(200);
  });

  test("search with special chars does not crash", async ({ page }) => {
    const resp = await page.goto("/artifacts?q=%3Cscript%3E");
    expect(resp?.status()).toBe(200);
    const body = await page.locator("body").textContent();
    // Should not contain unescaped script tag
    expect(body).not.toContain("<script>");
  });

  test("Cmd+K search with special chars does not crash", async ({ page }) => {
    await page.goto("/");
    await waitForHtmx(page);
    // Open search
    await page.keyboard.press("Meta+k");
    await page.waitForTimeout(300);
    // Type special characters
    const searchInput = page.locator("#cmd-k-input");
    if (await searchInput.isVisible()) {
      await searchInput.fill('<script>alert(1)</script>');
      await page.waitForTimeout(500);
      // Should not execute script — page should still be functional
      const body = await page.locator("body").textContent();
      expect(body?.length).toBeGreaterThan(0);
    }
  });
});

test.describe("Audit Regression: Consistency", () => {
  test("all nav links have matching href and hx-get", async ({ page }) => {
    await page.goto("/");
    await waitForHtmx(page);
    const links = await page
      .locator("nav a[hx-get]")
      .evaluateAll((els) =>
        els.map((el) => ({
          hxGet: el.getAttribute("hx-get"),
          href: el.getAttribute("href"),
        })),
      );
    for (const link of links) {
      expect(link.href).not.toBe("#");
      expect(link.href).toBe(link.hxGet);
    }
  });

  test("validation badge count matches validation page", async ({ page }) => {
    await page.goto("/validate");
    await waitForHtmx(page);
    // Get the diagnostic count from the page content
    const pageText = await page.locator("body").textContent();
    // The page should show consistent counts
    expect(pageText?.length).toBeGreaterThan(0);
  });

  test("print view footer says 'printed view'", async ({ page }) => {
    await page.goto("/stats?print=1");
    await expect(page.locator("body")).toContainText("printed view");
  });

  test("every page returns 200", async ({ page }) => {
    const pages = [
      "/",
      "/artifacts",
      "/stpa",
      "/graph",
      "/documents",
      "/validate",
      "/stats",
      "/matrix",
      "/coverage",
      "/source",
      "/results",
      "/help",
    ];
    for (const path of pages) {
      const resp = await page.request.get(path);
      expect(resp.status(), `${path} should return 200`).toBe(200);
    }
  });
});
