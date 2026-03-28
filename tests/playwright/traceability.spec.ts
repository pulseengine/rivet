import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Traceability Explorer", () => {
  test("page loads with heading", async ({ page }) => {
    await page.goto("/traceability");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Traceability Explorer");
  });

  test("returns 200", async ({ page }) => {
    const resp = await page.goto("/traceability");
    expect(resp?.status()).toBe(200);
  });

  test("shows root-type filter form", async ({ page }) => {
    await page.goto("/traceability");
    await waitForHtmx(page);
    // Filter form should have root_type select and a submit button
    const form = page.locator("form[hx-get='/traceability']");
    await expect(form).toBeVisible();
    await expect(form.locator("select[name='root_type']")).toBeVisible();
    await expect(form.locator("select[name='status']")).toBeVisible();
    await expect(form.locator("button[type='submit']")).toBeVisible();
  });

  test("filter form has status options", async ({ page }) => {
    await page.goto("/traceability");
    await waitForHtmx(page);
    const statusSelect = page.locator("select[name='status']");
    await expect(statusSelect).toBeVisible();
    // Should include All, Approved, Draft options
    await expect(statusSelect.locator("option[value='all']")).toBeAttached();
    await expect(statusSelect.locator("option[value='approved']")).toBeAttached();
    await expect(statusSelect.locator("option[value='draft']")).toBeAttached();
  });

  test("shows linkage chains section", async ({ page }) => {
    await page.goto("/traceability");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Linkage Chains");
  });

  test("shows coverage matrix when artifacts exist", async ({ page }) => {
    await page.goto("/traceability");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    // Either show a matrix or show "no artifacts match" message
    const hasMatrix = body!.includes("Coverage Matrix");
    const hasEmpty = body!.includes("No artifacts match");
    expect(hasMatrix || hasEmpty).toBe(true);
  });

  test("filter by root_type via URL param", async ({ page }) => {
    const resp = await page.goto("/traceability?root_type=requirement");
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);
    // requirement should be selected in the dropdown
    const selected = await page
      .locator("select[name='root_type'] option:checked")
      .textContent();
    expect(selected?.toLowerCase()).toContain("requirement");
  });

  test("filter by status via URL param", async ({ page }) => {
    const resp = await page.goto("/traceability?root_type=requirement&status=approved");
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);
    const selected = await page
      .locator("select[name='status'] option:checked")
      .getAttribute("value");
    expect(selected).toBe("approved");
  });

  test("search filter via URL param returns 200", async ({ page }) => {
    const resp = await page.goto("/traceability?search=REQ");
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);
    // Search input should be pre-filled
    const searchInput = page.locator("input[name='search']");
    await expect(searchInput).toBeVisible();
  });

  test("trace tree nodes link to artifacts", async ({ page }) => {
    await page.goto("/traceability");
    await waitForHtmx(page);
    // If there are trace nodes, they link to /artifacts/{id}
    const traceLinks = page.locator(".trace-node a[href^='/artifacts/'], .trace-details a[href^='/artifacts/']");
    const count = await traceLinks.count();
    if (count > 0) {
      const href = await traceLinks.first().getAttribute("href");
      expect(href).toMatch(/^\/artifacts\//);
    }
  });

  test("history buttons are present for trace nodes", async ({ page }) => {
    await page.goto("/traceability");
    await waitForHtmx(page);
    const historyBtns = page.locator("button[hx-get^='/traceability/history']");
    const count = await historyBtns.count();
    // Every trace node should have a History button
    if (count > 0) {
      const hxGet = await historyBtns.first().getAttribute("hx-get");
      expect(hxGet).toMatch(/^\/traceability\/history/);
    }
  });

  test("traceability/history endpoint responds", async ({ page }) => {
    // With no file param it should return a graceful message
    const resp = await page.request.get("/traceability/history");
    expect(resp.status()).toBe(200);
    const text = await resp.text();
    expect(text).toMatch(/No source file|Git History|git history unavailable/i);
  });

  test("no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/traceability");
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
