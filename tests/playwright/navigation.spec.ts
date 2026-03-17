import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Navigation", () => {
  test("dashboard loads with project name", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".ctx-project")).toHaveText("rivet");
  });

  test("all major nav links are reachable via direct URL", async ({ page }) => {
    // Test via direct URL access (more reliable than HTMX click)
    const routes = ["/artifacts", "/validate", "/matrix", "/graph", "/coverage"];
    for (const route of routes) {
      const response = await page.goto(route);
      expect(response?.status()).toBe(200);
    }
  });

  test("direct URL access works without redirect loop", async ({ page }) => {
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
});
