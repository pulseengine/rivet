import { test, expect } from "@playwright/test";

// Presentation/clean mode (#482): `?presentation=1` (or `?clean=1`) hides the
// working-state chrome (branch, SHA, "N uncommitted", path, Reload/Print) so
// recorded video / screenshots show a clean dashboard. Dataset-independent —
// the context bar renders on every page regardless of corpus size.
test.describe("Presentation mode", () => {
  test("context bar is visible in normal mode", async ({ page }) => {
    await page.goto("/artifacts");
    await expect(page.locator(".context-bar")).toBeVisible();
  });

  test("?presentation=1 hides the context bar (branch/uncommitted chrome)", async ({
    page,
  }) => {
    await page.goto("/artifacts?presentation=1");
    // Element still in the DOM but hidden via the `.presentation` class.
    await expect(page.locator(".context-bar")).toBeHidden();
    // Content itself is unaffected.
    await expect(page.locator("main")).toBeVisible();
  });

  test("?clean=1 is an accepted alias", async ({ page }) => {
    await page.goto("/coverage?clean=1");
    await expect(page.locator(".context-bar")).toBeHidden();
  });

  test("presentation class survives an HTMX navigation", async ({ page }) => {
    await page.goto("/artifacts?presentation=1");
    await expect(page.locator(".context-bar")).toBeHidden();
    // Navigate within the SPA (HTMX swaps #content, not <html>).
    await page.locator("nav a", { hasText: "Coverage" }).first().click();
    await expect(page.locator("html")).toHaveClass(/presentation/);
    await expect(page.locator(".context-bar")).toBeHidden();
  });
});
