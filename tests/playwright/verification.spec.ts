import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Verification View", () => {
  test("page loads with heading", async ({ page }) => {
    await page.goto("/verification");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Verification");
  });

  test("returns 200", async ({ page }) => {
    const resp = await page.goto("/verification");
    expect(resp?.status()).toBe(200);
  });

  test("shows verification content or schema hint", async ({ page }) => {
    await page.goto("/verification");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    // Either show verification data or explain how to configure it
    const hasData =
      body!.includes("Requirements") ||
      body!.includes("Verified") ||
      body!.includes("Unverified") ||
      body!.includes("Coverage");
    const hasHint =
      body!.includes("No verification traceability rules") ||
      body!.includes("required-backlink");
    expect(hasData || hasHint).toBe(true);
  });

  test("if verification data exists, stat grid is shown", async ({ page }) => {
    await page.goto("/verification");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    if (!body!.includes("Requirements")) {
      test.skip();
      return;
    }
    const statGrid = page.locator(".stat-grid");
    await expect(statGrid).toBeVisible();
    await expect(statGrid).toContainText("Requirements");
    await expect(statGrid).toContainText("Verified");
    await expect(statGrid).toContainText("Unverified");
    await expect(statGrid).toContainText("Coverage");
  });

  test("if verification data exists, ver-row details are present", async ({
    page,
  }) => {
    await page.goto("/verification");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    if (!body!.includes("verifier") && !body!.includes("unverified")) {
      test.skip();
      return;
    }
    const verRows = page.locator("details.ver-row");
    const count = await verRows.count();
    expect(count).toBeGreaterThan(0);
  });

  test("if verification data exists, requirement links point to artifacts", async ({
    page,
  }) => {
    await page.goto("/verification");
    await waitForHtmx(page);
    const verLinks = page.locator("details.ver-row a[href^='/artifacts/']");
    const count = await verLinks.count();
    if (count > 0) {
      const href = await verLinks.first().getAttribute("href");
      expect(href).toMatch(/^\/artifacts\//);
    }
  });

  test("if verification data exists, coverage badges shown", async ({
    page,
  }) => {
    await page.goto("/verification");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    if (!body!.includes("verifier") && !body!.includes("unverified")) {
      test.skip();
      return;
    }
    // Coverage badges should show "N verifiers" or "unverified"
    const badges = page.locator(".badge");
    const badgeCount = await badges.count();
    expect(badgeCount).toBeGreaterThan(0);
  });

  test("empty state explains verification configuration", async ({ page }) => {
    await page.goto("/verification");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    if (body!.includes("No verification traceability rules")) {
      await expect(page.locator("body")).toContainText("required-backlink");
      await expect(page.locator("body")).toContainText("verifies");
    }
  });

  test("no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/verification");
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
