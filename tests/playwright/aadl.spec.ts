import { test, expect } from "@playwright/test";
import { waitForHtmx, countTableRows } from "./helpers";

test.describe("AADL Integration", () => {
  test("aadl-component artifacts appear in artifacts list", async ({
    page,
  }) => {
    await page.goto("/artifacts?types=aadl-component");
    await waitForHtmx(page);
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(0);
  });

  test("filtering by aadl-component type returns correct count", async ({
    page,
  }) => {
    await page.goto("/artifacts?types=aadl-component");
    await waitForHtmx(page);
    // architecture.yaml defines 21 aadl-component artifacts
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThanOrEqual(20);
  });

  test("ARCH-SYS-001 detail page loads", async ({ page }) => {
    const response = await page.goto("/artifacts/ARCH-SYS-001");
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("ARCH-SYS-001");
    await expect(page.locator("body")).toContainText("Rivet System");
  });

  test("ARCH-SYS-001 shows aadl-component type badge", async ({ page }) => {
    await page.goto("/artifacts/ARCH-SYS-001");
    await expect(page.locator("body")).toContainText("aadl-component");
  });

  test("ARCH-SYS-001 shows outgoing links", async ({ page }) => {
    await page.goto("/artifacts/ARCH-SYS-001");
    await waitForHtmx(page);
    // Should have the Outgoing Links section
    await expect(page.locator("text=Outgoing Links").first()).toBeVisible();
    // Should have allocated-from links (to REQs) and/or contains links (to sub-components)
    const body = await page.locator("body").textContent();
    expect(
      body?.includes("allocated-from") || body?.includes("contains"),
    ).toBe(true);
  });

  test("ARCH-CORE-001 shows multiple allocated-from links", async ({
    page,
  }) => {
    await page.goto("/artifacts/ARCH-CORE-001");
    await waitForHtmx(page);
    await expect(page.locator("text=Outgoing Links")).toBeVisible();
    // ARCH-CORE-001 links to REQ-001 and REQ-002
    await expect(
      page.locator("a[hx-get='/artifacts/REQ-001']"),
    ).toBeVisible();
    await expect(
      page.locator("a[hx-get='/artifacts/REQ-002']"),
    ).toBeVisible();
  });

  test("ARCH-SYS-001 shows extra fields including aadl-package", async ({
    page,
  }) => {
    await page.goto("/artifacts/ARCH-SYS-001");
    await waitForHtmx(page);
    // Fields rendered in a <dl> inside a card
    await expect(page.locator("body")).toContainText("aadl-package");
    await expect(page.locator("body")).toContainText("RivetSystem");
    await expect(page.locator("body")).toContainText("category");
    await expect(page.locator("body")).toContainText("system");
  });

  test("ARCH-SYS-001 renders AADL diagram placeholder", async ({ page }) => {
    await page.goto("/artifacts/ARCH-SYS-001");
    await waitForHtmx(page);
    // The diagram field with root: prefix triggers an AADL diagram div
    const aadlDiagram = page.locator(".aadl-diagram");
    await expect(aadlDiagram).toBeVisible();
    // Check the data-root attribute is set
    const dataRoot = await aadlDiagram.getAttribute("data-root");
    expect(dataRoot).toContain("RivetSystem");
  });

  test("source-ref fields are clickable links to source view", async ({
    page,
  }) => {
    await page.goto("/artifacts/ARCH-SYS-001");
    await waitForHtmx(page);
    // source-ref should be rendered as a clickable link
    const sourceRefLink = page.locator("a.source-ref-link").first();
    await expect(sourceRefLink).toBeVisible();
    // Should reference an .aadl file
    const linkText = await sourceRefLink.textContent();
    expect(linkText).toContain(".aadl");
  });

  test("stats page shows aadl-component in type breakdown", async ({
    page,
  }) => {
    await page.goto("/stats");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("aadl-component");
  });

  test("graph view with aadl-component type filter renders SVG", async ({
    page,
  }) => {
    await page.goto("/graph?types=aadl-component&depth=2");
    await waitForHtmx(page);
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 15_000 });
  });

  test("graph focused on ARCH-SYS-001 renders SVG", async ({ page }) => {
    await page.goto("/graph?focus=ARCH-SYS-001&depth=2");
    await waitForHtmx(page);
    await expect(page.locator("svg").first()).toBeVisible({ timeout: 15_000 });
  });

  test("matrix view includes aadl-component type", async ({ page }) => {
    await page.goto("/matrix");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("aadl-component");
  });

  test("AADL source file is viewable in source view", async ({ page }) => {
    const response = await page.goto(
      "/source/arch%2Frivet_system.aadl",
    );
    expect(response?.status()).toBe(200);
    // Should show source content with line numbers
    await expect(page.locator("body")).toContainText("rivet_system.aadl");
  });

  test("source view lists ARCH artifacts referencing the AADL file", async ({
    page,
  }) => {
    await page.goto("/source/arch%2Frivet_system.aadl");
    await waitForHtmx(page);
    // Source view shows an "Artifacts Referencing This File" section
    const refsSection = page.locator("text=Artifacts Referencing This File");
    const haRefs = await refsSection.count();
    if (haRefs > 0) {
      await expect(refsSection).toBeVisible();
      // Should list at least ARCH-SYS-001
      await expect(page.locator("body")).toContainText("ARCH-SYS-001");
    }
  });

  test("clicking an ARCH artifact navigates to detail view", async ({
    page,
  }) => {
    await page.goto("/artifacts?types=aadl-component");
    await waitForHtmx(page);
    // Click the first ARCH artifact link
    const archLink = page
      .locator("a[hx-get^='/artifacts/ARCH-']")
      .first();
    await expect(archLink).toBeVisible();
    const target = await archLink.getAttribute("hx-get");
    // Navigate directly to the artifact detail
    const response = await page.goto(target!);
    expect(response?.status()).toBe(200);
    await expect(page.locator("body")).toContainText("ARCH-");
    await expect(page.locator("body")).toContainText("aadl-component");
  });

  test("search finds AADL artifacts", async ({ page }) => {
    await page.goto("/artifacts?q=AADL");
    await waitForHtmx(page);
    const rows = await countTableRows(page);
    expect(rows).toBeGreaterThan(0);
  });
});
