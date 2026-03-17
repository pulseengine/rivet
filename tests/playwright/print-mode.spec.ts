import { test, expect } from "@playwright/test";

test.describe("Print Mode", () => {
  test("?print=1 removes nav element entirely", async ({ page }) => {
    await page.goto("/stpa?print=1");
    // Print layout doesn't include <nav> at all
    const navCount = await page.locator("nav").count();
    expect(navCount).toBe(0);
    // Content should still be present
    await expect(page.locator("main")).toBeVisible();
  });

  test("?print=1 works on multiple views", async ({ page }) => {
    for (const view of ["/artifacts", "/stpa", "/validate"]) {
      await page.goto(`${view}?print=1`);
      const navCount = await page.locator("nav").count();
      expect(navCount).toBe(0);
      const text = await page.locator("body").textContent();
      expect(text!.length).toBeGreaterThan(50);
    }
  });

  test("print button is visible in normal mode", async ({ page }) => {
    await page.goto("/stpa");
    // The print button uses &#128438; (🖶) character
    await expect(page.locator("button").filter({ hasText: "Print" })).toBeVisible();
  });

  test("no HTMX script in print mode", async ({ page }) => {
    await page.goto("/artifacts?print=1");
    const html = await page.content();
    expect(html).not.toContain("htmx.org");
  });
});
