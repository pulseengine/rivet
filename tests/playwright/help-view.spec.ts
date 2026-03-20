import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Help View", () => {
  test("help page loads with heading", async ({ page }) => {
    await page.goto("/help");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Help");
  });

  test("help page shows schema types count", async ({ page }) => {
    await page.goto("/help");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Schema Types");
    await expect(page.locator("body")).toContainText("artifact types loaded");
  });

  test("help page shows link types count", async ({ page }) => {
    await page.goto("/help");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Link Types");
    await expect(page.locator("body")).toContainText("with inverse mappings");
  });

  test("help page shows traceability rules count", async ({ page }) => {
    await page.goto("/help");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Traceability Rules");
    await expect(page.locator("body")).toContainText("enforced by validation");
  });

  test("help page shows documentation card", async ({ page }) => {
    await page.goto("/help");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Documentation");
    await expect(page.locator("body")).toContainText("Browse topics");
  });

  test("help page shows CLI quick reference", async ({ page }) => {
    await page.goto("/help");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("CLI Quick Reference");
    await expect(page.locator("body")).toContainText("rivet validate");
    await expect(page.locator("body")).toContainText("rivet serve");
  });

  test("help quick-link cards have correct hrefs", async ({ page }) => {
    await page.goto("/help");
    await waitForHtmx(page);

    const schemaLink = page.locator("a[href='/help/schema']");
    await expect(schemaLink).toBeVisible();
    expect(await schemaLink.getAttribute("hx-get")).toBe("/help/schema");

    const linksLink = page.locator("a[href='/help/links']");
    await expect(linksLink).toBeVisible();
    expect(await linksLink.getAttribute("hx-get")).toBe("/help/links");

    const rulesLink = page.locator("a[href='/help/rules']");
    await expect(rulesLink).toBeVisible();
    expect(await rulesLink.getAttribute("hx-get")).toBe("/help/rules");

    const docsLink = page.locator("a[href='/help/docs']");
    await expect(docsLink).toBeVisible();
    expect(await docsLink.getAttribute("hx-get")).toBe("/help/docs");
  });
});

test.describe("Help Schema", () => {
  test("schema list page loads", async ({ page }) => {
    await page.goto("/help/schema");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Schema Types");
  });

  test("schema list shows artifact types in table", async ({ page }) => {
    await page.goto("/help/schema");
    await waitForHtmx(page);
    const table = page.locator("table");
    await expect(table).toBeVisible();
    // Should have header columns
    await expect(table.locator("thead")).toContainText("Type");
    await expect(table.locator("thead")).toContainText("Description");
    await expect(table.locator("thead")).toContainText("Fields");
  });

  test("schema list contains known types", async ({ page }) => {
    await page.goto("/help/schema");
    await waitForHtmx(page);
    // At least requirement and feature types should be present
    await expect(page.locator("body")).toContainText("requirement");
    await expect(page.locator("body")).toContainText("feature");
  });

  test("clicking a type row loads type detail", async ({ page }) => {
    await page.goto("/help/schema");
    await waitForHtmx(page);

    // Schema rows have hx-get to /help/schema/<name>
    const typeRow = page
      .locator("tr[hx-get^='/help/schema/']")
      .first();
    const hxGet = await typeRow.getAttribute("hx-get");
    if (!hxGet) {
      test.skip();
      return;
    }

    const resp = await page.goto(hxGet);
    expect(resp?.status()).toBe(200);
    // Should show the type detail with a back link
    await expect(page.locator("a[href='/help/schema']")).toBeVisible();
  });

  test("schema detail page loads for requirement type", async ({ page }) => {
    const resp = await page.goto("/help/schema/requirement");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("requirement");
    // Should have a back-link to the schema list
    await expect(page.locator("a[href='/help/schema']")).toBeVisible();
  });
});

test.describe("Help Links", () => {
  test("links page loads", async ({ page }) => {
    await page.goto("/help/links");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Link Types");
  });

  test("links page shows table with columns", async ({ page }) => {
    await page.goto("/help/links");
    await waitForHtmx(page);
    const table = page.locator("table");
    await expect(table).toBeVisible();
    await expect(table.locator("thead")).toContainText("Name");
    await expect(table.locator("thead")).toContainText("Inverse");
    await expect(table.locator("thead")).toContainText("Description");
  });

  test("links page shows known link types", async ({ page }) => {
    await page.goto("/help/links");
    await waitForHtmx(page);
    // verifies is a common link type
    await expect(page.locator("body")).toContainText("verifies");
  });

  test("links page has back link to help", async ({ page }) => {
    await page.goto("/help/links");
    await waitForHtmx(page);
    // Use getByRole to target the back link specifically (not the nav link)
    const backLink = page.getByRole("link", { name: /← Help/ });
    await expect(backLink).toBeVisible();
    expect(await backLink.getAttribute("hx-get")).toBe("/help");
  });
});

test.describe("Help Rules", () => {
  test("rules page loads", async ({ page }) => {
    await page.goto("/help/rules");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Traceability Rules");
  });

  test("rules page shows rule content", async ({ page }) => {
    await page.goto("/help/rules");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    // Should have some meaningful content about rules
    expect(body!.length).toBeGreaterThan(100);
  });

  test("rules page has back link to help", async ({ page }) => {
    await page.goto("/help/rules");
    await waitForHtmx(page);
    // Use getByRole to target the back link specifically (not the nav link)
    const backLink = page.getByRole("link", { name: /← Help/ });
    await expect(backLink).toBeVisible();
  });
});

test.describe("Help Docs", () => {
  test("docs list page loads", async ({ page }) => {
    await page.goto("/help/docs");
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    // Should either show docs list or an informative message
    expect(body!.length).toBeGreaterThan(50);
  });

  test("docs list returns 200", async ({ page }) => {
    const resp = await page.goto("/help/docs");
    expect(resp?.status()).toBe(200);
  });
});
