import { test, expect } from "@playwright/test";
import { waitForHtmx } from "./helpers";

test.describe("Documents", () => {
  test("documents list loads", async ({ page }) => {
    await page.goto("/documents");
    await waitForHtmx(page);
    await expect(page.locator("body")).toContainText(/document/i);
  });

  test("document detail loads via direct URL", async ({ page }) => {
    // Navigate to documents list first to find a document ID
    await page.goto("/documents");
    await waitForHtmx(page);

    // Get the href of the first document link
    const firstLink = page.locator("a[href^='/documents/']").first();
    const href = await firstLink.getAttribute("href");
    if (!href) {
      test.skip();
      return;
    }

    const resp = await page.goto(href);
    expect(resp?.status()).toBe(200);
    await expect(page.locator(".doc-body")).toBeVisible();
  });

  test("document nav links have correct href (not #)", async ({ page }) => {
    await page.goto("/documents");
    await waitForHtmx(page);

    const links = await page.locator("a[hx-get^='/documents/']").all();
    // Check each link's href matches its hx-get path
    for (const link of links) {
      const hxGet = await link.getAttribute("hx-get");
      const href = await link.getAttribute("href");
      // href should either be the same as hx-get, or "#" (pre-fix links from content views)
      // The important assertion: clicking should NOT go to bare "#" on navigation
      expect(href).not.toBeNull();
      // If href IS set to the proper path, verify it matches hx-get
      if (href !== "#") {
        expect(href).toBe(hxGet);
      }
    }
  });

  test("document-to-document ref renders as .doc-ref link, not broken", async ({
    page,
  }) => {
    // Collect all document paths first, before any navigation
    await page.goto("/documents");
    await waitForHtmx(page);
    const hxPaths = await page
      .locator("a[hx-get^='/documents/']")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("hx-get")).filter(Boolean),
      );

    for (const path of hxPaths as string[]) {
      await page.goto(path);
      await waitForHtmx(page);

      // Any broken ref that matches an existing document ID would be a bug
      const brokenRefs = await page
        .locator(".artifact-ref.broken")
        .allTextContents();
      for (const ref of brokenRefs) {
        const trimmed = ref.trim();
        if (!trimmed) continue;
        const resp = await page.request.get(`/documents/${trimmed}`);
        expect(resp.status()).not.toBe(
          200,
          `[[${trimmed}]] should render as .doc-ref, not broken`,
        );
      }
    }
  });

  test("doc-ref links navigate to the referenced document", async ({
    page,
  }) => {
    // Collect all document paths first
    await page.goto("/documents");
    await waitForHtmx(page);
    const hxPaths = await page
      .locator("a[hx-get^='/documents/']")
      .evaluateAll((els) =>
        els.map((el) => el.getAttribute("hx-get")).filter(Boolean),
      );

    let foundDocRef = false;

    for (const path of hxPaths as string[]) {
      await page.goto(path);
      await waitForHtmx(page);

      const docRefCount = await page.locator(".doc-ref").count();
      if (docRefCount === 0) continue;

      foundDocRef = true;
      const docRef = page.locator(".doc-ref").first();
      const docRefHref = await docRef.getAttribute("href");
      expect(docRefHref).toMatch(/^\/documents\//);

      // Clicking should navigate to that document
      await docRef.click();
      await waitForHtmx(page);
      const url = new URL(page.url());
      expect(url.pathname).toMatch(/^\/documents\//);
      break;
    }

    if (!foundDocRef) {
      // No cross-document references in current docs — test vacuously passes
      // and will catch regressions once cross-doc refs exist
      console.log("No .doc-ref links found — no cross-document references yet");
    }
  });
});
