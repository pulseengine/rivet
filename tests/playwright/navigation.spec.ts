import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Navigation", () => {
  test("dashboard loads with project name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".ctx-project")).toHaveText("rivet");
  });

  test("all major nav links are reachable via direct URL", async ({ page }) => {
    test.setTimeout(120_000);
    // Test via direct URL access (more reliable than HTMX click)
    const routes = ["/artifacts", "/validate", "/matrix", "/graph", "/coverage"];
    for (const route of routes) {
      const response = await page.goto(route, { timeout: 90_000 });
      expect(response?.status()).toBe(200);
    }
  });

  test("direct URL access works without redirect loop", async ({ page }) => {
    test.setTimeout(60_000);
    await page.goto("/artifacts");
    await expect(page.locator("table")).toBeVisible();
    await page.goto("/stpa");
    await expect(page.locator("body")).toContainText(/STPA/i);
  });

  test("browser back/forward works with direct navigation", async ({ page }) => {
    await page.goto("/artifacts");
    await page.goto("/graph?types=requirement");
    await page.goBack();
    await expect(page).toHaveURL(/artifacts/);
    await page.goForward();
    await expect(page).toHaveURL(/graph/);
  });

  test("reload button is visible", async ({ page }) => {
    await page.goto("/");
    const btn = page.locator('button:has-text("Reload")');
    await expect(btn).toBeVisible();
  });

  // Regression: clicking Reload used to target #content only via
  // HX-Location, so the sidebar badges (artifact count, doc count,
  // variant count, STPA count) stayed stale after reload. Now uses
  // HX-Redirect to drive a full browser navigation that re-renders
  // the whole shell. We can't make the file-system change the backend
  // reads in this test, so we pin the contract instead: the reload
  // response must arrive as an HX-Redirect (full navigation), not an
  // HX-Location (partial swap). That's what keeps the sidebar fresh.
  test("reload triggers full-page navigation (HX-Redirect, not HX-Location)", async ({
    page,
  }) => {
    await page.goto("/artifacts");
    const resp = page.waitForResponse(
      (r) => r.url().endsWith("/reload") && r.request().method() === "POST",
    );
    await page.locator('button:has-text("Reload")').click();
    const response = await resp;
    expect(response.status()).toBe(200);
    const headers = response.headers();
    // Either-or: the old bad shape (HX-Location targeting #content)
    // would leave the sidebar stale. The fix is a full navigation.
    expect(headers["hx-redirect"]).toBeDefined();
    expect(headers["hx-location"]).toBeUndefined();
  });
});
