import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("External Projects", () => {
  test("page loads with heading", async ({ page }) => {
    await page.goto("/externals");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("External Projects");
  });

  test("returns 200", async ({ page }) => {
    const resp = await page.goto("/externals");
    expect(resp?.status()).toBe(200);
  });

  test("shows externals content or empty state", async ({ page }) => {
    await page.goto("/externals");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    // Either shows configured externals or explains how to configure them
    const hasConfigured =
      body!.includes("Configured Externals") ||
      body!.includes("Prefix") ||
      body!.includes("Status");
    const hasEmptyState =
      body!.includes("No external projects") ||
      body!.includes("externals") && body!.includes("rivet.yaml");
    expect(hasConfigured || hasEmptyState).toBe(true);
  });

  test("empty state explains configuration", async ({ page }) => {
    await page.goto("/externals");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    if (body!.includes("No external projects")) {
      await expect(page.locator("body")).toContainText("rivet.yaml");
    }
  });

  test("if externals configured, table has correct columns", async ({
    page,
  }) => {
    await page.goto("/externals");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    if (!body!.includes("Configured Externals")) {
      test.skip();
      return;
    }
    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(table.locator("thead")).toContainText("Prefix");
    await expect(table.locator("thead")).toContainText("Source");
    await expect(table.locator("thead")).toContainText("Status");
    await expect(table.locator("thead")).toContainText("Artifacts");
  });

  test("synced external detail page responds", async ({ page }) => {
    await page.goto("/externals");
    await waitForHtmx(page);
    // Check if any synced externals have links to detail pages
    const detailLinks = page.locator("a[href^='/externals/']");
    const count = await detailLinks.count();
    if (count === 0) {
      // No synced externals — skip
      return;
    }
    const href = await detailLinks.first().getAttribute("href");
    const resp = await page.goto(href!);
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);
    // Detail page should show artifact table or "not synced" message
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(50);
  });

  test("unknown external prefix returns 200 with not-found message", async ({
    page,
  }) => {
    const resp = await page.goto("/externals/nonexistent-prefix");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("Not Found");
  });

  test("no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/externals");
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
});
