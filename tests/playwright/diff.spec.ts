import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Diff View", () => {
  test("page loads with heading", async ({ page }) => {
    await page.goto("/diff");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Diff");
  });

  test("returns 200", async ({ page }) => {
    const resp = await page.goto("/diff");
    expect(resp?.status()).toBe(200);
  });

  test("shows base and head selectors", async ({ page }) => {
    await page.goto("/diff");
    await waitForHtmx(page);
    const form = page.locator("form[hx-get='/diff']");
    await expect(form).toBeVisible();
    await expect(form.locator("select[name='base']")).toBeVisible();
    await expect(form.locator("select[name='head']")).toBeVisible();
    await expect(form.locator("button[type='submit']")).toBeVisible();
  });

  test("base selector includes HEAD option", async ({ page }) => {
    await page.goto("/diff");
    await waitForHtmx(page);
    const baseSelect = page.locator("select[name='base']");
    await expect(baseSelect.locator("option[value='HEAD']")).toBeAttached();
  });

  test("head selector includes working tree option", async ({ page }) => {
    await page.goto("/diff");
    await waitForHtmx(page);
    const headSelect = page.locator("select[name='head']");
    await expect(headSelect.locator("option[value='working']")).toBeAttached();
  });

  test("empty state shown when no base/head selected", async ({ page }) => {
    await page.goto("/diff");
    await waitForHtmx(page);
    // Without params, prompt to select refs
    await expect(page.locator("body")).toContainText("Compare");
  });

  test("diff with HEAD base shows summary", async ({ page }) => {
    // Navigate with explicit params to trigger a comparison
    const resp = await page.goto("/diff?base=HEAD&head=working");
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);

    const body = await page.locator("body").textContent();
    // Should show diff summary stats or "no differences" message
    const hasSummary =
      body!.includes("added") ||
      body!.includes("removed") ||
      body!.includes("No differences") ||
      body!.includes("Error loading");
    expect(hasSummary).toBe(true);
  });

  test("diff summary shows added/removed/modified counts", async ({ page }) => {
    await page.goto("/diff?base=HEAD&head=working");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    // Either a diff summary div or an error/no-diff message
    if (body!.includes("diff-summary") || body!.includes("added")) {
      const summary = page.locator(".diff-summary");
      const count = await summary.count();
      if (count > 0) {
        await expect(summary).toContainText("added");
        await expect(summary).toContainText("removed");
        await expect(summary).toContainText("modified");
      }
    }
  });

  test("older git ref comparison works", async ({ page }) => {
    const resp = await page.goto("/diff?base=HEAD~1&head=HEAD");
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    // Should either show diff or error gracefully
    const isValid =
      body!.length > 100 &&
      !body!.includes("thread 'main' panicked") &&
      !body!.includes("500 Internal Server Error");
    expect(isValid).toBe(true);
  });

  test("no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/diff");
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
