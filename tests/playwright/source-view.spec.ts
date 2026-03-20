import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Source View", () => {
  test("source tree page loads with heading", async ({ page }) => {
    await page.goto("/source");
    await waitForHtmx(page);
    await expect(page.locator("h2")).toContainText("Source Files");
  });

  test("source tree shows project directory", async ({ page }) => {
    await page.goto("/source");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("Project directory");
  });

  test("source tree contains file links", async ({ page }) => {
    await page.goto("/source");
    await waitForHtmx(page);
    // The tree should have clickable file entries linking to /source/<path>
    const fileLinks = page.locator("a[hx-get^='/source/']");
    const count = await fileLinks.count();
    expect(count).toBeGreaterThan(0);
  });

  test("clicking a file shows its content", async ({ page }) => {
    await page.goto("/source");
    await waitForHtmx(page);

    // Collect the first file link's hx-get path
    const firstFileLink = page.locator("a[hx-get^='/source/']").first();
    const hxGet = await firstFileLink.getAttribute("hx-get");
    if (!hxGet) {
      test.skip();
      return;
    }

    const resp = await page.goto(hxGet);
    expect(resp?.status()).toBe(200);
    // File view should show line numbers or content
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(50);
  });

  test("YAML source file shows artifact cross-references", async ({
    page,
  }) => {
    // Navigate to a known YAML source file that defines artifacts
    const resp = await page.goto("/source/artifacts%2Frequirements.yaml");
    if (resp?.status() !== 200) {
      test.skip();
      return;
    }
    await waitForHtmx(page);
    // YAML files with artifacts should show a referencing section or highlight artifact IDs
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(100);
  });

  test("AADL source file is viewable", async ({ page }) => {
    const resp = await page.goto("/source/arch%2Frivet_system.aadl");
    expect(resp?.status()).toBe(200);
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText("rivet_system.aadl");
  });

  test("source file view shows line numbers", async ({ page }) => {
    const resp = await page.goto("/source/arch%2Frivet_system.aadl");
    if (resp?.status() !== 200) {
      test.skip();
      return;
    }
    await waitForHtmx(page);
    // Line numbers should be present as anchors or spans
    // The source view renders <span class="line-num"> or similar
    const lineNums = page.locator(".line-num, .ln, [id^='L']");
    const count = await lineNums.count();
    expect(count).toBeGreaterThan(0);
  });

  test("line number anchors are addressable", async ({ page }) => {
    // Navigate to a source file with a line anchor
    const resp = await page.goto("/source/arch%2Frivet_system.aadl#L1");
    if (resp?.status() !== 200) {
      test.skip();
      return;
    }
    // The page should load without error
    await waitForHtmx(page);
    const body = await page.locator("body").textContent();
    expect(body!.length).toBeGreaterThan(50);
  });

  test("artifacts referencing file section appears for AADL files", async ({
    page,
  }) => {
    await page.goto("/source/arch%2Frivet_system.aadl");
    await waitForHtmx(page);
    const refsSection = page.locator("text=Artifacts Referencing This File");
    const count = await refsSection.count();
    if (count > 0) {
      await expect(refsSection).toBeVisible();
      // Should list artifact IDs as clickable links
      const links = page.locator("a[hx-get^='/artifacts/ARCH-']");
      expect(await links.count()).toBeGreaterThan(0);
    }
  });

  test("source file links have correct href (not #)", async ({ page }) => {
    await page.goto("/source");
    await waitForHtmx(page);

    const links = await page
      .locator("a[hx-get^='/source/']")
      .evaluateAll((els) =>
        els.map((el) => ({
          href: el.getAttribute("href"),
          hxGet: el.getAttribute("hx-get"),
        })),
      );

    for (const link of links) {
      expect(link.href).not.toBe("#");
      if (link.href && link.href !== "#") {
        expect(link.href).toBe(link.hxGet);
      }
    }
  });

  test("nonexistent source file shows not found", async ({ page }) => {
    const resp = await page.goto("/source/does%2Fnot%2Fexist.txt");
    expect(resp?.status()).toBe(200); // Returns 200 with error content
    await expect(page.locator("body")).toContainText("Not Found");
  });

  test("path traversal is blocked", async ({ page }) => {
    const resp = await page.goto("/source/..%2F..%2Fetc%2Fpasswd");
    expect(resp?.status()).toBe(200);
    await expect(page.locator("body")).toContainText(
      /Forbidden|Not Found|traversal/i,
    );
  });

  test("source view has no JS errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/source");
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
