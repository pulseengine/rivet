import { test, expect } from "@playwright/test";

/**
 * Smoke test: every dashboard route returns a valid page.
 */
test.describe("Route smoke tests", () => {
  const routes = [
    "/artifacts",
    "/artifacts/REQ-001",
    "/validate",
    "/matrix",
    "/graph?types=requirement",
    "/graph?focus=REQ-001&depth=2",
    "/coverage",
    "/stats",
    "/stpa",
    "/documents",
    "/source",
    "/search?q=OSLC",
    "/verification",
    "/traceability",
    "/doc-linkage",
    "/diff",
    "/results",
    "/help",
    "/help/schema",
    "/help/links",
    "/help/rules",
  ];

  for (const route of routes) {
    test(`GET ${route} returns valid HTML`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
      // Should contain basic HTML structure
      const html = await page.content();
      expect(html).toContain("<html");
      expect(html).toContain("<head>");
      // Should not contain server errors
      expect(html).not.toContain("500 Internal Server Error");
      expect(html).not.toContain("thread 'main' panicked");
    });
  }
});
