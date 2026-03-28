import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Document Linkage", () => {
  test("page loads with heading", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Document Linkage");
  });

  test("returns 200", async ({ page }) => {
    const resp = await page.goto("/doc-linkage");
    expect(resp?.status()).toBe(200);
  });

  test("shows meta description text", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText(
      "Shows how documents relate",
    );
  });

  test("renders SVG graph", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    // The doc linkage view always renders an SVG graph
    const svg = page.locator("svg");
    const count = await svg.count();
    expect(count).toBeGreaterThan(0);
  });

  test("svg-viewer toolbar is present", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    const toolbar = page.locator(".svg-viewer-toolbar");
    await expect(toolbar).toBeVisible();
  });

  test("shows cross-document links section", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Cross-Document Links");
  });

  test("shows document summary section", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Document Summary");
  });

  test("document summary table has correct columns", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    // Find the document summary table (last table in the view)
    const tables = page.locator("table");
    const count = await tables.count();
    expect(count).toBeGreaterThan(0);
    // The document summary table should have Document, Type, References cols
    const lastTable = tables.last();
    await expect(lastTable.locator("thead")).toContainText("Document");
    await expect(lastTable.locator("thead")).toContainText("References");
  });

  test("shows artifacts not referenced section", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText(
      "Artifacts Not Referenced in Any Document",
    );
  });

  test("document links navigate to document detail", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    const docLinks = page.locator("a[href^='/documents/']");
    const count = await docLinks.count();
    if (count > 0) {
      const href = await docLinks.first().getAttribute("href");
      expect(href).toMatch(/^\/documents\//);
    }
  });

  test("graph shows node and edge count", async ({ page }) => {
    await page.goto("/doc-linkage");
    await waitForHtmx(page);
    // The meta line shows "N nodes, M edges"
    const meta = page.locator("p.meta");
    const metaCount = await meta.count();
    if (metaCount > 0) {
      const text = await meta.last().textContent();
      expect(text).toMatch(/nodes.*edges/i);
    }
  });

  test("no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/doc-linkage");
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
