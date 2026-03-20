import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Results View", () => {
  test("results page loads with heading", async ({ page }) => {
    await page.goto("/results");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Test Results");
  });

  test("shows helpful empty state when no results loaded", async ({
    page,
  }) => {
    await page.goto("/results");
    await waitForHtmx(page);

    // Either show result data OR the helpful empty-state message
    const body = await page.locator("body").textContent();
    const hasResults =
      body!.includes("Run History") || body!.includes("Total Runs");
    const hasEmptyState =
      body!.includes("No test results loaded") ||
      body!.includes("results/") ||
      body!.includes("rivet.yaml");

    expect(hasResults || hasEmptyState).toBe(true);
  });

  test("empty state explains how to add results", async ({ page }) => {
    await page.goto("/results");
    await waitForHtmx(page);

    const body = await page.locator("body").textContent();
    if (body!.includes("No test results loaded")) {
      // Should explain the results: directory config
      await expect(page.locator("body")).toContainText("rivet.yaml");
      await expect(page.locator("body")).toContainText("results");
    }
  });

  test("results page returns 200", async ({ page }) => {
    const resp = await page.goto("/results");
    expect(resp?.status()).toBe(200);
  });

  test("results page has no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/results");
    await waitForHtmx(page);
    await page.waitForLoadState("networkidle");

    const realErrors = errors.filter(
      (e) =>
        !e.includes("spar_wasm") &&
        !e.includes("AADL WASM") &&
        !e.includes("mermaid"),
    );
    expect(realErrors).toEqual([]);
  });

  test("if results exist, stat grid shows run counts", async ({ page }) => {
    await page.goto("/results");
    await waitForHtmx(page);

    const statGrid = page.locator(".stat-grid");
    const count = await statGrid.count();
    if (count > 0) {
      await expect(statGrid).toContainText("Total Runs");
      await expect(statGrid).toContainText("Pass Rate");
    }
  });

  test("if results exist, run history table has links", async ({ page }) => {
    await page.goto("/results");
    await waitForHtmx(page);

    const body = await page.locator("body").textContent();
    if (!body!.includes("Run History")) {
      test.skip();
      return;
    }

    const runLinks = page.locator("a[hx-get^='/results/']");
    const linkCount = await runLinks.count();
    expect(linkCount).toBeGreaterThan(0);

    // Each link should have href matching hx-get
    const hrefs = await runLinks.evaluateAll((els) =>
      els.map((el) => ({
        href: el.getAttribute("href"),
        hxGet: el.getAttribute("hx-get"),
      })),
    );
    for (const { href, hxGet } of hrefs) {
      expect(href).not.toBe("#");
      expect(href).toBe(hxGet);
    }
  });
});
